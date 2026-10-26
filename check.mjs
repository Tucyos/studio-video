// check.mjs : contrôles automatiques d'un projet vidéo, avant que Noam regarde.
// node check.mjs <projet> [--adaptateur a.json] [--from T] [--to T] [--workers 2] [--video final.mp4] [--aveugle] [--name x] [--out dossier]
// Sortie : <out>/qa/rapport.json ({t, t1, plan, controle, cible, probleme, gravite, source}) + qa/problemes.png (images signalées, en rouge).
// Adaptateur : adaptateurs/<nom du dossier>.json, ou --adaptateur (page, sujets 3D, sol, mots, stems, gain des bruitages, traj, plan_max, boucle).
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { serve, openPlayer } from './lib/player.mjs';

// Zone sûre TikTok en 1080×1920, mesurée le 19/10/2026 sur 3 captures de l'iPhone de Noam (1206×2622) : la vidéo y est agrandie ×1,236
// pour remplir l'écran au-dessus de la barre du bas, donc rognée d'environ 52 px de chaque côté. En pixels vidéo : onglets / recherche
// jusqu'à y = 250 ; pseudo + légende à partir de y ≈ 1700 ; colonne de boutons à partir de x = 895, de y = 730 jusqu'en bas.
export const ZONE = { haut: 250, bas: 240, gauche: 60, droite: 60, boutonsX: 895, boutonsY: 730 };
const S = {
  texteMin: 28,          // px (réf. 1080 de large) : en dessous, illisible sur téléphone
  noir: 12, blanc: 243,  // luminance moyenne (0-255) d'une image presque noire / blanche
  uniforme: 3,           // écart-type de luminance : image vide
  fige: .35,             // écart moyen (0-255) avec l'image d'avant : en dessous, image identique (le grain et le bruit GPU restent sous ~.3)
  pic: 12,               // pic d'une image : écart > pic avec les deux voisines, voisines entre elles 4x plus proches
  sol: .05,              // m : sujet sous le sol ou en l'air
  cadre: .25,            // part de la boîte d'un sujet hors de l'image
  couvre: .25,           // part de la boîte d'un sujet cachée par un texte
  acoup: .05, acoupPx: 6, // à-coups (mêmes seuils que traj.mjs) : caméra en m, sujet à l'écran en px (différence seconde)
  motDb: 6,              // la voix doit dépasser les bruitages d'au moins 6 dB sur chaque mot (mix.py)
  contraste: 3,          // rapport texte / fond (WCAG « grand texte » : tous nos textes font ≥ 28 px en 1080 de large) ; Huashu Design, 23/10
  mort: 1.5,             // s : plus longtemps sans rien qui bouge = passage mort (Huashu : 3 s pour des démos de produit, 1,2-1,5 s pour un TikTok)
  dureeVideo: .02,       // écart toléré entre la vidéo exportée et la durée du projet (±2 %, au moins 0,2 s)
};
const GRAV = { grave: 0, moyen: 1, info: 2 };
// les mots voisins d'une même ligne ne font qu'un texte (les sous-titres sont dessinés mot par mot)
function lignes(T) {
  const L = [];
  for (const t of [...T].sort((a, b) => a.box[0] - b.box[0])) {
    const h = t.box[3] - t.box[1], cy = (t.box[1] + t.box[3]) / 2;
    const l = L.find(l => Math.abs((l.box[1] + l.box[3]) / 2 - cy) < .5 * Math.max(h, l.h) && t.box[0] - l.box[2] < 1.5 * Math.max(h, l.h));
    if (l) { l.s += ' ' + t.s; l.h = Math.max(l.h, h); l.box = [Math.min(l.box[0], t.box[0]), Math.min(l.box[1], t.box[1]), Math.max(l.box[2], t.box[2]), Math.max(l.box[3], t.box[3])]; }
    else L.push({ s: t.s, h, box: [...t.box] });
  }
  return L;
}

const ff = (args, opt = {}) => execFileSync('ffmpeg', ['-v', 'error', ...args], { maxBuffer: 1e9, ...opt });
const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
const aire = b => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = v => Math.hypot(...v);
const angle = (a, b) => Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * 180 / Math.PI;

async function wavMono(f) { const b = ff(['-i', f, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-']); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); }

export async function check({ projet, adaptateur, from, to, workers = 2, video, aveugle = false, name, out, seed, quiet = false }) {
  const root = resolve(projet), t0 = Date.now(), log = quiet ? () => {} : console.log;
  const af = adaptateur ? resolve(adaptateur) : [join(root, '.studio', 'adaptateur.json'), join(import.meta.dirname, 'adaptateurs', basename(root) + '.json')].find(f => existsSync(f)) || '';
  const A = { page: existsSync(join(root, 'moteur', 'page.html')) ? 'moteur/page.html' : 'scenes/film.html', fps: 30, shutter: .5, sujets: {}, ...(existsSync(af) ? JSON.parse(await readFile(af, 'utf8')) : {}) };
  const FPS = A.fps, QA = resolve(out || join(import.meta.dirname, 'out', name || basename(root)), 'qa'); await mkdir(QA, { recursive: true });
  const R = [];   // entrées brutes, une par image et par problème
  const flag = (f, controle, cible, probleme, gravite, extra = {}) => R.push({ f, controle, cible, probleme, gravite, ...extra });

  // ---------- 1. passe image par image, dans les pages instrumentées ----------
  const srv = serve(root), init = join(import.meta.dirname, 'lib', 'qa-page.js');
  const players = await Promise.all(Array.from({ length: workers }, () => openPlayer(srv, A.page, { init })));
  const info = players[0].info, st = await Promise.all(players.map(p => p.page.evaluate(a => window.__qa.init(a), { sujets: A.sujets, sol: A.sol })));
  if (Object.keys(A.sujets).length && (!st[0].three || Object.values(st[0].sujets).some(v => !v))) throw new Error('sujets introuvables dans la page : ' + JSON.stringify(st[0]));
  if (seed) await Promise.all(players.map(p => p.page.evaluate(seed)));
  const f0 = Math.round((from ?? info.from) * FPS), f1 = Math.round((to ?? info.to) * FPS), N = f1 - f0;
  log(`${workers} page(s) · ${N} images · 3D : ${st[0].three ? 'oui' : 'non'} · sujets : ${Object.keys(st[0].sujets).join(', ') || 'aucun'}`);
  const D = new Array(N); let done = 0;
  await Promise.all(players.map(async (p, k) => {
    const a = f0 + Math.floor(N * k / workers), b = f0 + Math.floor(N * (k + 1) / workers);
    if (a > f0) { await p.page.evaluate(T => window.__qa.frame(T), (a - 2) / FPS); await p.page.evaluate(T => window.__qa.frame(T), (a - 1) / FPS); }   // échauffement + écarts avec les 2 images d'avant
    for (let f = a; f < b; f += 30) {
      const ts = []; for (let g = f; g < Math.min(b, f + 30); g++) ts.push(g / FPS);
      const r = await p.page.evaluate(async ts => { const r = []; for (const T of ts) r.push(await window.__qa.frame(T)); return r; }, ts);
      r.forEach((x, i) => D[f - f0 + i] = x); done += r.length; if (!quiet) process.stdout.write(`\ranalyse : ${done}/${N} images`);
    }
  }));
  log('');
  const is3D = D.some(d => d.cam);
  // lettres absentes de la police (œ, « », espace fine…) : chaque paire (police, lettre) testée une fois
  const paires = [...new Set(D.flatMap(d => d.texts.flatMap(t => [...new Set(t.s)].map(c => t.font + '\u0000' + c))))].map(k => k.split('\u0000'));
  const gl = await players[0].page.evaluate(p => window.__qa.glyphes(p), paires), absentes = new Map(paires.map((p, i) => [p.join('\u0000'), gl[i]]).filter(([, v]) => v));
  if (st[0].three && !D.some(d => d.renders > 0)) throw new Error('aucun rendu 3D vu : le crochet du renderer ne marche pas');

  // ---------- 2. coupes et plans ----------
  const dp = D.map((d, i) => i && d.cam && D[i - 1].cam ? len(sub3(d.cam.p, D[i - 1].cam.p)) : 0);
  const da = D.map((d, i) => i && d.cam && D[i - 1].cam ? angle(d.cam.d, D[i - 1].cam.d) : 0);
  const cut = D.map((d, i) => {
    if (!i) return false;
    if (!!d.cam !== !!D[i - 1].cam) return true;   // on passe de la 3D à la 2D (ou l'inverse)
    const nb = (v, j) => Math.max(v[j - 1] ?? 0, v[j + 1] ?? 0);
    if (d.cam) return dp[i] > .3 + 3 * nb(dp, i) || da[i] > 5 + 3 * nb(da, i);
    const df = D.map(x => x.diff ?? 0); return df[i] > 25 && df[i] > 3 * nb(df, i);
  });
  const plans = []; D.forEach((d, i) => { if (!i || cut[i]) plans.push([i, N]); if (plans.length > 1 && cut[i]) plans[plans.length - 2][1] = i; });
  const planOf = i => plans.findIndex(([a, b]) => i >= a && i < b) + 1;
  if (A.plan_max) for (const [a, b] of plans) if ((b - a) / FPS > A.plan_max + 1e-6) flag(a, 'plan long', '', `plan de ${((b - a) / FPS).toFixed(2)} s (> ${A.plan_max} s)`, 'info');

  // ---------- 3. contrôles image par image ----------
  D.forEach((d, i) => {
    // luminosité
    const carton = d.texts.some(t => t.a > .3);   // un texte sur fond noir ou blanc est un carton voulu, pas une image vide
    if (!carton && d.luma.moy < S.noir) flag(i, 'image noire', '', `image presque noire (luminance ${d.luma.moy})`, 'grave');
    else if (!carton && d.luma.moy > S.blanc) flag(i, 'image blanche', '', `image presque blanche (luminance ${d.luma.moy})`, 'grave');
    else if (!carton && d.luma.ect < S.uniforme) flag(i, 'image vide', '', `image uniforme (écart-type ${d.luma.ect})`, 'moyen');
    // pic d'une image : i diffère de ses deux voisines, qui se ressemblent
    const n = D[i + 1]; if (i && n && d.diff > S.pic && n.diff > S.pic && n.diff2 < Math.min(d.diff, n.diff) / 4) flag(i, "pic d'une image", '', `image isolée (écart ${d.diff} / ${n.diff}, voisines ${n.diff2})`, 'grave');
    // textes
    const T = d.texts.filter(t => t.a > .3);
    const hors = {};   // zone sûre : un problème par côté, avec les textes concernés (un sous-titre = plusieurs mots)
    for (const t of T) {
      if (t.size < S.texteMin) flag(i, 'texte petit', t.s, `« ${t.s} » en ${t.size} px (< ${S.texteMin})`, 'moyen');
      for (const c of new Set(t.s)) { const a = absentes.get(t.font + '\u0000' + c); if (!a) continue;
        if (a.absente === 'police') { flag(i, 'police non chargée', a.fam, `la police « ${a.fam} » n'est pas chargée : « ${t.s} » s'affiche dans une police de secours`, 'moyen', { box: t.box }); break; }
        flag(i, 'lettre absente', `${a.fam} ${c}`, `« ${c} » (U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) n'existe pas dans la police « ${a.fam} » : « ${t.s} » le dessine dans une autre police`, 'moyen', { box: t.box }); }
      // contraste : pas pour un texte doublé d'un contour (strokeText du même texte au même endroit)
      if (t.contraste != null && t.contraste < S.contraste && !T.some(u => u.trait && u.s === t.s && inter(u.box, t.box) > .5 * aire(t.box)))
        flag(i, 'contraste faible', t.s, `« ${t.s} » se détache mal du fond (contraste ${t.contraste}, il faut ${S.contraste})`, 'moyen', { box: t.box });
      const [x0, y0, x1, y1] = t.box;
      for (const [c, h] of [['haut', y0 < ZONE.haut], ['bas', y1 > 1920 - ZONE.bas], ['gauche', x0 < ZONE.gauche], ['droite (rognée)', x1 > 1080 - ZONE.droite], ['boutons', x1 > ZONE.boutonsX && y1 > ZONE.boutonsY && y0 < 1920 - ZONE.bas]])
        if (h) (hors[c] ||= []).push(t);
    }
    for (const [c, ts] of Object.entries(hors)) flag(i, 'zone sûre', c, `${ts.map(t => `« ${t.s} »`).slice(0, 6).join(' ')} sort de la zone sûre (${c})`, 'moyen',
      { box: [Math.min(...ts.map(t => t.box[0])), Math.min(...ts.map(t => t.box[1])), Math.max(...ts.map(t => t.box[2])), Math.max(...ts.map(t => t.box[3]))] });
    for (let a = 0; a < T.length; a++) for (let b = a + 1; b < T.length; b++) {
      const A_ = T[a], B = T[b], I = inter(A_.box, B.box); if (!I) continue;
      if (A_.s === B.s && I > .8 * Math.min(aire(A_.box), aire(B.box))) continue;   // même texte redessiné (ombre, contour)
      const h = Math.min(A_.box[3] - A_.box[1], B.box[3] - B.box[1]), memeLigne = Math.abs((A_.box[1] + A_.box[3]) - (B.box[1] + B.box[3])) / 2 < .25 * h;
      const w = Math.min(A_.box[2], B.box[2]) - Math.max(A_.box[0], B.box[0]);
      if (memeLigne ? w > .5 * Math.min(A_.box[2] - A_.box[0], B.box[2] - B.box[0]) : I > .2 * Math.min(aire(A_.box), aire(B.box)))
        flag(i, 'textes superposés', `${A_.s} / ${B.s}`, `« ${A_.s} » chevauche « ${B.s} »`, 'moyen', { box: A_.box });
    }
    // sujets 3D
    if (!d.cam) return;
    for (const [n, s] of Object.entries(d.cam.sujets)) {
      if (A.sol != null && s.minY < A.sol - S.sol) flag(i, 'sous le sol', n, `${n} enfoncé de ${Math.round((A.sol - s.minY) * 100)} cm dans le sol`, 'grave');
      if (A.sol != null && s.minY > A.sol + S.sol) flag(i, 'en l\'air', n, `${n} flotte à ${Math.round((s.minY - A.sol) * 100)} cm du sol`, 'grave');
      if (s.box && aire(s.box) > 0) {
        const vis = inter(s.box, [0, 0, 1080, 1920]) / aire(s.box);
        if (vis > 0 && vis < 1 - S.cadre) flag(i, 'coupé par le cadre', n, `${n} coupé par le bord de l'image (${Math.round((1 - vis) * 100)} % dehors)`, 'info', { box: s.box });
        const vb = [Math.max(0, s.box[0]), Math.max(0, s.box[1]), Math.min(1080, s.box[2]), Math.min(1920, s.box[3])];   // la partie visible du sujet
        const L = lignes(T), cache = L.filter(l => inter(l.box, vb) > 0), part = aire(vb) ? cache.reduce((a, l) => a + inter(l.box, vb), 0) / aire(vb) : 0;
        if (part > S.couvre) flag(i, 'sujet sous un texte', n, `${n} caché à ${Math.round(part * 100)} % par « ${cache.map(l => l.s).join(' / ').slice(0, 60)} »`, 'moyen', { box: s.box });
      }
    }
    for (const [a, b] of d.cam.inter) flag(i, 'traversée', `${a}/${b}`, `${a} et ${b} se traversent`, 'grave');
    for (const n of d.cam.dedans) flag(i, 'caméra dans un objet', n, `caméra dans ${n}`, 'grave');
  });
  // images figées : une seule image répétée = image doublée (saccade) ; plus longue = plan figé
  for (let i = 1; i < N;) {
    if (!(D[i].diff < S.fige)) { i++; continue; }
    let j = i; while (j + 1 < N && D[j + 1].diff < S.fige) j++;
    const bouge = x => x && x.diff > 1;   // une image doublée n'est une saccade que si l'image bouge avant et après (pas dans un fondu lent)
    if (j === i) { if (bouge(D[i - 1]) && bouge(D[i + 1])) flag(i, 'image doublée', '', `image identique à la précédente (écart ${D[i].diff})`, cut[i] || cut[i + 1] ? 'grave' : 'moyen'); }
    else if ((j - i + 2) / FPS >= S.mort) flag(i, 'passage mort', '', `rien ne bouge pendant ${((j - i + 2) / FPS).toFixed(1)} s (${j - i + 2} images identiques)`, 'moyen', { t1f: j });
    else flag(i, 'plan figé', '', `${j - i + 2} images identiques`, 'info', { t1f: j });
    i = j + 1;
  }

  // ---------- 4. à-coups : le traj.mjs du projet (window.TRAJ) s'il existe, sinon la caméra et les sujets relevés ----------
  let trajSrc = 'générique';
  if (A.traj) {
    const tp = await openPlayer(srv, A.page + (A.page.includes('?') ? '&' : '?') + 'draft');
    const lines = await tp.page.evaluate(([a, b]) => window.TRAJ ? window.TRAJ(a, b) : null, [f0 / FPS, (f1 - 1) / FPS]); await tp.close();
    if (lines) { trajSrc = 'window.TRAJ (traj.mjs)'; for (const l of lines) { const m = /T=([\d.]+) (\S+) à-coup ([\d.]+) (px|m)/.exec(l); if (m) flag(Math.round(+m[1] * FPS) - f0, 'à-coup', m[2], `à-coup ${m[2]} : ${m[3]} ${m[4]}`, 'grave'); } }
  }
  if (trajSrc === 'générique' && is3D) for (let i = 2; i < N; i++) {
    const [a, b, c] = [D[i - 2], D[i - 1], D[i]]; if (!a.cam || !b.cam || !c.cam || cut[i] || cut[i - 1]) continue;
    const j = len(sub3(sub3(c.cam.p, b.cam.p), sub3(b.cam.p, a.cam.p))); if (j > S.acoup) flag(i, 'à-coup', 'caméra', `à-coup caméra : ${j.toFixed(3)} m`, 'grave');
    for (const n of Object.keys(c.cam.sujets)) { const [p, q, r] = [a, b, c].map(x => x.cam.sujets[n]?.ctr); if (!p || !q || !r || r[0] < -200 || r[0] > 1280) continue;
      const jp = Math.hypot(r[0] - 2 * q[0] + p[0], r[1] - 2 * q[1] + p[1]); if (jp > S.acoupPx) flag(i, 'à-coup', n, `à-coup ${n} : ${jp.toFixed(1)} px`, 'grave'); }
  }

  // ---------- 5. coupes hors de la grille des images (le flou par sous-images mélangerait deux plans) ----------
  const SUB = info.sub || 4, SH = A.shutter;
  if (is3D && SUB > 1) for (let i = 1; i < N; i++) {
    if (!cut[i] || !D[i].cam || !D[i - 1].cam) continue;
    for (const f of [i - 1, i]) {
      const cams = await players[0].page.evaluate(async ts => { const r = []; for (const T of ts) r.push((await window.__qa.frame(T)).cam); return r; }, Array.from({ length: SUB }, (_, s) => (f0 + f) / FPS + s / SUB * SH / FPS));
      for (let s = 1; s < SUB; s++) if (cams[s] && cams[s - 1] && (len(sub3(cams[s].p, cams[s - 1].p)) > .5 * dp[i] || angle(cams[s].d, cams[s - 1].d) > .5 * da[i] && da[i] > 5))
        { flag(f, 'coupe hors grille', '', `la coupe tombe entre deux images : les sous-images de l'image mélangent deux plans`, 'grave'); break; }
    }
  }

  // ---------- 6. boucle : dernière image = première ----------
  let ssim = null;
  if (A.boucle && f0 === Math.round(info.from * FPS) && f1 === Math.round(info.to * FPS)) {   // seulement sur la vidéo entière
    const [pa, pb] = [join(QA, '_premiere.png'), join(QA, '_derniere.png')];
    await writeFile(pa, await players[0].png(f0 / FPS)); await writeFile(pb, await players[0].png((f1 - 1) / FPS));
    // au-dessus des sous-titres (70 % de la hauteur) et en 135×240 : on compare la composition, pas la pluie ni le grain
    const v = 'crop=1080:1300:0:0,scale=135:240'; ssim = +/All:([\d.]+)/.exec(spawnStderr(['-i', pa, '-i', pb, '-lavfi', `[0]${v}[a];[1]${v}[b];[a][b]ssim`, '-f', 'null', '-']))?.[1];
    if (ssim < .9) flag(N - 1, 'boucle', '', `la dernière image ne retombe pas sur la première (SSIM ${ssim.toFixed(3)})`, 'moyen');
    await rm(pa); await rm(pb);
  }

  // ---------- 7. son : mots couverts par les bruitages (comme mix.py) + sonie ----------
  let lufs = null;
  if (A.mots && A.voix && A.bruitages) {
    const W = JSON.parse(await readFile(resolve(root, A.mots), 'utf8')).words, v = await wavMono(resolve(root, A.voix)), fx = await wavMono(resolve(root, A.bruitages)), g = 10 ** ((A.gain_bruitages_db || 0) / 20), SR = 48000;
    const rms = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += (x[i] || 0) ** 2; return Math.sqrt(s / Math.max(1, b - a) + 1e-12); };
    for (const w of W) {
      const a = Math.floor(w.start * SR), b = Math.floor(Math.max(w.end, w.start + .08) * SR); if (w.start * FPS < f0 || w.start * FPS >= f1) continue;
      const db = 20 * Math.log10(rms(v, a, b) / (g * rms(fx, a, b))); if (db < S.motDb) flag(Math.round(w.start * FPS) - f0, 'mot couvert', w.w, `« ${w.w} » couvert par les bruitages (voix +${db.toFixed(1)} dB, il faut +${S.motDb})`, 'grave');
    }
  }
  if (A.mix) { lufs = +/I:\s+(-?[\d.]+) LUFS/.exec(spawnStderr(['-i', resolve(root, A.mix), '-af', 'ebur128', '-f', 'null', '-']).split('Summary:').pop())?.[1]; if (Math.abs(lufs + 14) > 1) flag(0, 'sonie', '', `mix à ${lufs} LUFS (cible -14)`, 'grave'); }

  // ---------- 8. vidéo assemblée (optionnel) : noirs et gels de ffmpeg ----------
  if (video) {
    const e = spawnStderr(['-i', resolve(video), '-vf', 'blackdetect=d=0.03:pix_th=0.08,freezedetect=n=-60dB:d=0.06', '-an', '-f', 'null', '-']);
    const dv = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', resolve(video)]).toString(), dProj = info.to - info.from;
    if (Math.abs(dv - dProj) > Math.max(.2, S.dureeVideo * dProj)) flag(0, 'vidéo : durée', '', `${basename(video)} dure ${dv.toFixed(2)} s, le projet ${dProj.toFixed(2)} s`, 'moyen');
    // noir au tout début (décalage de l'enregistrement) ou à la fin (la boucle retombe sur du noir) : grave ; au milieu : peut-être un carton voulu
    for (const m of e.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)) { const ou = +m[1] < .05 ? 'au début' : +m[2] > dv - .05 ? 'à la fin' : 'au milieu';
      flag(Math.round(+m[1] * FPS) - f0, 'vidéo : noir', '', `noir de ${(+m[2] - +m[1]).toFixed(2)} s ${ou} de ${basename(video)}`, ou === 'au milieu' ? 'moyen' : 'grave'); }
    for (const m of e.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)) flag(Math.round(+m[1] * FPS) - f0, 'vidéo : gel', '', `gel de ${(+m[2]).toFixed(2)} s dans ${basename(video)}`, 'moyen');
  }

  // ---------- 9. regroupement : images consécutives d'un même problème = une entrée ----------
  R.sort((a, b) => a.f - b.f);
  const E = [], open = new Map();   // la zone sûre se regroupe par-dessus les coupes : c'est un défaut de mise en page qui court sur plusieurs plans
  for (const r of R) {
    const k = r.controle + '|' + r.cible, e = open.get(k);
    if (e && r.f - e.f1 <= 1 && (planOf(r.f) === e.plan || r.controle === 'zone sûre')) { e.f1 = Math.max(e.f1, r.t1f ?? r.f); e.n++; continue; }
    const n = { ...r, f1: r.t1f ?? r.f, plan: planOf(r.f), n: 1, source: r.controle === 'à-coup' ? `à-coups : ${trajSrc}` : 'auto' }; open.set(k, n); E.push(n);
  }
  const entrees = E.map(({ f, f1, plan, controle, cible, probleme, gravite, source, box }) => ({ t: +((f0 + f) / FPS).toFixed(3), t1: +((f0 + f1) / FPS).toFixed(3), plan, controle, cible, probleme, gravite, source, ...(box ? { box } : {}) }))
    .sort((a, b) => GRAV[a.gravite] - GRAV[b.gravite] || a.t - b.t);

  // ---------- 10. planche des problèmes (calques rouges) ----------
  const SON = ['mot couvert', 'sonie', 'vidéo : noir', 'vidéo : gel', 'vidéo : durée', 'relecteur aveugle'], par = {};   // le son ne se voit pas sur une image
  const top = entrees.filter(e => !SON.includes(e.controle) && (par[e.controle] = (par[e.controle] || 0) + 1) <= 3).slice(0, 20);
  if (top.length) {
    const dir = join(QA, '_planche'); await mkdir(dir, { recursive: true });
    for (const [k, e] of top.entries()) {
      const png = await players[0].page.evaluate(async ({ e, Z }) => {
        const d = await window.__qa.frame(e.t), c = document.getElementById('c'), o = document.createElement('canvas'); o.width = 540; o.height = 960;
        const g = o.getContext('2d'); g.drawImage(c, 0, 0, 540, 960); g.scale(.5, .5);
        g.fillStyle = 'rgba(255,0,0,.12)'; g.fillRect(0, 0, 1080, Z.haut); g.fillRect(0, 1920 - Z.bas, 1080, Z.bas); g.fillRect(0, Z.haut, Z.gauche, 1920 - Z.haut - Z.bas); g.fillRect(1080 - Z.droite, Z.haut, Z.droite, Z.boutonsY - Z.haut); g.fillRect(Z.boutonsX, Z.boutonsY, 1080 - Z.boutonsX, 1920 - Z.boutonsY - Z.bas);
        g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.6)'; for (const t of d.texts) g.strokeRect(t.box[0], t.box[1], t.box[2] - t.box[0], t.box[3] - t.box[1]);
        if (d.cam) for (const s of Object.values(d.cam.sujets)) if (s.box) g.strokeRect(s.box[0], s.box[1], s.box[2] - s.box[0], s.box[3] - s.box[1]);
        if (e.box) { g.lineWidth = 10; g.strokeStyle = '#ff2020'; g.strokeRect(e.box[0], e.box[1], e.box[2] - e.box[0], e.box[3] - e.box[1]); }
        g.fillStyle = e.gravite === 'grave' ? '#d00' : e.gravite === 'moyen' ? '#e07000' : '#666'; g.fillRect(0, 1700, 1080, 220);
        g.fillStyle = '#fff'; g.font = '700 44px sans-serif'; g.fillText(`${e.t.toFixed(2)} s · plan ${e.plan} · ${e.controle}`, 24, 1760);
        g.font = '36px sans-serif'; g.fillText(e.probleme.slice(0, 52), 24, 1820); g.fillText(e.probleme.slice(52, 104), 24, 1870);
        return o.toDataURL('image/png');
      }, { e, Z: ZONE });
      await writeFile(join(dir, `${String(k).padStart(3, '0')}.png`), Buffer.from(png.slice(22), 'base64'));
    }
    const cols = Math.min(5, top.length);
    ff(['-y', '-i', join(dir, '%03d.png'), '-vf', `scale=270:480,tile=${cols}x${Math.ceil(top.length / cols)}:padding=6:color=white`, '-frames:v', '1', join(QA, 'problemes.png')]);
    await rm(dir, { recursive: true });
  }

  // ---------- 10 bis. pour le studio : plans (texte de la voix + vignette) et trajectoires à l'écran ----------
  const mots = A.mots && existsSync(resolve(root, A.mots)) ? JSON.parse(await readFile(resolve(root, A.mots), 'utf8')).words : [];
  await mkdir(join(QA, 'plans'), { recursive: true });
  const listePlans = [];
  for (const [k, [a, b]] of plans.entries()) {
    const t0 = (f0 + a) / FPS, t1 = (f0 + b) / FPS, v = `plans/p${String(k + 1).padStart(2, '0')}.jpg`;
    const jpg = await players[0].page.evaluate(async T => { await window.__qa.frame(T); const c = document.getElementById('c'), o = document.createElement('canvas'); o.width = 135; o.height = 240; o.getContext('2d').drawImage(c, 0, 0, 135, 240); return o.toDataURL('image/jpeg', .8); }, (t0 + t1) / 2);
    await writeFile(join(QA, v), Buffer.from(jpg.split(',')[1], 'base64'));
    listePlans.push({ n: k + 1, t0: +t0.toFixed(3), t1: +t1.toFixed(3), texte: mots.filter(w => w.start >= t0 - .05 && w.start < t1 - .05).map(w => w.w).join(' '), vignette: v });
  }
  await writeFile(join(QA, 'traj.json'), JSON.stringify({ fps: FPS, t0: f0 / FPS, cam: D.map(d => d.cam?.p || null), sujets: Object.fromEntries(Object.keys(st[0].sujets).map(n => [n, D.map(d => d.cam?.sujets[n]?.ctr || null)])) }));

  // ---------- 11. relecteur aveugle (optionnel) : il ne voit que des images, jamais le code ----------
  // le tableau objectif lui est donné (Huashu : sans lui, l'IA ne trouvait que 3 passages morts sur 14) : coupes et passages figés mesurés
  const faits = [`Coupes mesurées (début de chaque plan, s) : ${plans.map(([a]) => ((f0 + a) / FPS).toFixed(2)).join(', ')}`,
    ...entrees.filter(e => /passage mort|plan figé|vidéo : (noir|gel)/.test(e.controle)).map(e => `${e.t.toFixed(2)}-${e.t1.toFixed(2)} s : ${e.controle} (${e.probleme})`)].join('\n');
  if (aveugle) try { entrees.push(...await relecteurAveugle(players[0], plans, f0, FPS, QA, log, faits)); }
    catch (e) { log('relecteur aveugle indisponible : ' + e.message); entrees.push({ t: 0, t1: 0, plan: 0, controle: 'relecteur aveugle', cible: '', probleme: 'indisponible : ' + e.message, gravite: 'info', source: 'claude -p' }); }

  for (const p of players) await p.close(); srv.close();
  const compte = {}; for (const e of entrees) { const c = compte[e.controle] ||= { grave: 0, moyen: 0, info: 0 }; c[e.gravite]++; }
  const rapport = { projet: root, plage: [f0 / FPS, f1 / FPS], images: N, plans: listePlans, sonie_lufs: lufs, boucle_ssim: ssim, zone_sure: ZONE, duree_s: +((Date.now() - t0) / 1000).toFixed(1), compte, entrees };
  await writeFile(join(QA, 'rapport.json'), JSON.stringify(rapport, null, 1));
  log(`\n${N} images, ${plans.length} plans, en ${rapport.duree_s} s → ${join(QA, 'rapport.json')}`);
  for (const e of entrees.filter(e => e.controle === 'mot couvert' || e.controle === 'sonie')) log(`  ${e.t.toFixed(2)} s  ${e.probleme}`);
  for (const [k, c] of Object.entries(compte)) log(`  ${k.padEnd(22)} ${c.grave ? c.grave + ' grave ' : ''}${c.moyen ? c.moyen + ' moyen ' : ''}${c.info ? c.info + ' info' : ''}`);
  return rapport;
}

// ffmpeg écrit ses mesures (ssim, ebur128, blackdetect...) sur stderr
const spawnStderr = args => spawnSync('ffmpeg', ['-hide_banner', ...args], { encoding: 'utf8', maxBuffer: 1e8 }).stderr || '';

// Haiku décrit les images (une par plan, au milieu, 24 au plus) dans un dossier qui ne contient qu'elles ; Opus juge sur les descriptions.
async function relecteurAveugle(player, plans, f0, FPS, QA, log, faits = '') {
  // dossier hors du dépôt : sinon claude -p remonte l'arborescence et lit le CLAUDE.md du studio (qui décrit le moteur)
  const dir = join(tmpdir(), `studio-aveugle-${Date.now()}`); mkdirSync(dir, { recursive: true });
  const pick = plans.length > 24 ? Array.from({ length: 24 }, (_, i) => plans[Math.floor(i * plans.length / 24)]) : plans;
  const files = [];
  for (const [a, b] of pick) { const t = (f0 + Math.floor((a + b) / 2)) / FPS, f = `t${t.toFixed(2)}.png`; await writeFile(join(dir, f), await player.png(t)); files.push(f); }
  const claude = (model, prompt, cwd) => new Promise((ok, ko) => {
    const p = spawn('claude', ['-p', '--model', model, '--setting-sources', 'project', '--tools', 'Read', '--allowedTools', 'Read', '--output-format', 'json', '--no-session-persistence'], { cwd, shell: process.platform === 'win32', stdio: ['pipe', 'pipe', 'inherit'] });
    let o = ''; p.stdout.on('data', d => o += d); p.on('close', c => { let r; try { r = JSON.parse(o); } catch { return ko(new Error(`claude -p : réponse illisible (code ${c})`)); } r.is_error ? ko(new Error(`claude -p : ${r.result}`)) : ok(r.result); }); p.stdin.end(prompt);
  });
  const json = s => JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1));
  log(`relecteur aveugle : ${files.length} images → Haiku`);
  const desc = await claude('haiku', `Lis chacune de ces images (Read), ce sont des images d'une vidéo TikTok verticale 1080×1920 : ${files.join(', ')}.\n` +
    `Pour chacune, décris en une ou deux phrases ce qu'on voit, puis liste les défauts visuels que tu remarques : objets qui se traversent ou flottent, objet coupé bizarrement, ` +
    `texte illisible, trop petit, coupé, caché, avec une faute ou un caractère bizarre (carré, lettre d'une autre police), textes ou éléments qui se recouvrent à tort, visage ou sujet caché par un texte, image vide, noire ou floue, élément absurde, ` +
    `composition déséquilibrée, vide inutile, élément collé au bord, plus de 3 éléments qui attirent l'œil en même temps. Ne devine pas : seulement ce qui se voit.\n` +
    `Réponds uniquement en JSON : [{"fichier": "...", "description": "...", "defauts": ["..."]}]`, dir);
  await writeFile(join(QA, 'aveugle.json'), JSON.stringify(json(desc), null, 1));   // les descriptions brutes de Haiku
  log('relecteur aveugle : Opus juge');
  const juge = await claude('opus', `Voici les descriptions d'images d'une vidéo TikTok faites par un relecteur qui n'a vu que les images (le nom du fichier donne l'instant en secondes) :\n${JSON.stringify(json(desc), null, 1)}\n\n` +
    (faits ? `Mesures objectives faites par le code sur toutes les images (elles font foi : le relecteur ne voit qu'une image par plan) :\n${faits}\nPour chaque passage figé, dis s'il semble voulu (pause avant une révélation, carton) ou mort (rien ne se passe).\n\n` : '') +
    `Garde seulement les défauts qui gêneraient vraiment un spectateur sur téléphone, en écartant les choix de style plausibles. Gravité : grave (à corriger avant de publier), moyen (important), info (suggestion).\n` +
    `Réponds uniquement en JSON : [{"t": secondes, "probleme": "...", "gravite": "grave|moyen|info"}]`, dir);
  await rm(dir, { recursive: true, force: true });
  return json(juge).map(e => ({ t: +e.t, t1: +e.t, plan: 0, controle: 'relecteur aveugle', cible: '', probleme: e.probleme, gravite: e.gravite, source: 'Haiku décrit, Opus juge' }));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
  const num = k => opt(k) == null ? undefined : Number(opt(k));
  await check({ projet: argv[0], adaptateur: opt('adaptateur'), from: num('from'), to: num('to'), workers: num('workers') ?? 2, video: opt('video'), aveugle: argv.includes('--aveugle'), name: opt('name'), out: opt('out') });
}
