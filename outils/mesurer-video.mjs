// mesurer-video.mjs : ce qui se mesure dans une vidéo de référence, par du code (jamais par l'IA) — base de la copie de style (phase 7).
// node outils/mesurer-video.mjs <video.mp4> <dossier> [--id ref1] [--sans-mots]
// Sorties : <dossier>/images/00001.jpg… (30 i/s, « image n » = n-ième image à 30 i/s, quelle que soit la cadence d'origine), <dossier>/mesures.json
// Mesuré : coupes franches (pics d'écart entre images), plans, mouvement de caméra par plan (glissement + zoom global, APPROXIMATIF : les objets qui
// bougent faussent l'estimation), mots (Whisper), débit, pauses, part de voix, coupes calées sur les mots, sonie (LUFS).
// Non mesuré : fondus et transitions douces (décrits par Haiku), niveau de la musique sous la voix (il faudrait les pistes séparées).
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const FPS = 30;
const run = (cmd, args) => new Promise((ok, ko) => { const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }), out = [], err = []; p.stdout.on('data', d => out.push(d)); p.stderr.on('data', d => err.push(d));
  p.on('close', c => c === 0 ? ok({ out: Buffer.concat(out), err: Buffer.concat(err).toString() }) : ko(new Error(`${cmd} : ${Buffer.concat(err).toString().slice(-300)}`))); });
const med = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const r2 = x => x == null ? null : Math.round(x * 100) / 100;

export async function mesurer(video, dossier, { id = basename(video).replace(/\.\w+$/, ''), mots: avecMots = true, log = console.log } = {}) {
  mkdirSync(join(dossier, 'images'), { recursive: true });
  const pr = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'json', video], { encoding: 'utf8' }));
  const st = pr.streams[0], [a, b] = st.r_frame_rate.split('/').map(Number), W = st.width, H = st.height, duree = +pr.format.duration;
  const vertical = H >= W, gw = vertical ? 36 : 64, gh = vertical ? 64 : 36;   // image d'analyse en gris, petite
  // 1. les images à 30 i/s (planches de preuves) et l'analyse en gris, d'une seule lecture chacune
  if (existsSync(join(dossier, 'images', '.elague'))) { rmSync(join(dossier, 'images'), { recursive: true, force: true }); mkdirSync(join(dossier, 'images'), { recursive: true }); }   // élagué : on réextrait tout
  if (!readdirSync(join(dossier, 'images')).length) await run('ffmpeg', ['-v', 'error', '-i', video, '-vf', `fps=${FPS},scale=${vertical ? '270:-2' : '-2:270'}`, '-q:v', '4', join(dossier, 'images', '%05d.jpg')]);
  const raw = (await run('ffmpeg', ['-v', 'error', '-i', video, '-vf', `fps=${FPS},scale=${gw}:${gh}:flags=area,format=gray`, '-f', 'rawvideo', '-'])).out;
  const N = Math.floor(raw.length / (gw * gh)), F = i => raw.subarray(i * gw * gh, (i + 1) * gw * gh);
  log(`${id} : ${N} images à 30 i/s (source ${W}×${H}, ${r2(a / b)} i/s, ${r2(duree)} s)`);
  // 2. écart moyen entre images successives ; coupe franche = pic isolé, bien au-dessus du mouvement autour
  const d = new Float32Array(N);
  for (let i = 1; i < N; i++) { const p = F(i - 1), q = F(i); let s = 0; for (let k = 0; k < p.length; k++) s += Math.abs(p[k] - q[k]); d[i] = s / p.length; }
  const coupes = [];
  for (let i = 2; i < N - 1; i++) {
    const autour = []; for (let k = Math.max(1, i - 15); k <= i - 2; k++) autour.push(d[k]);   // le mouvement AVANT : juste après une coupe, l image peut bouger vite
    const fond = med(autour);
    if (coupes.length && i - coupes.at(-1).image < 4) continue;
    // franche : saut brusque (l'image d'avant bougeait peu ; celle d'après peut encore bouger : mouvement rapide juste après la coupe)
    if (d[i] > Math.max(10, 3.5 * fond) && d[i] > 2 * d[i - 1]) coupes.push({ image: i + 1, t: r2(i / FPS), type: 'franche', ecart: r2(d[i]), fond: r2(fond) });   // image i+1 (numérotation à partir de 1) = 1re image du nouveau plan
    // douce : bosse sur plusieurs images (fondu, flash, balayage) : on note son sommet
    else if (d[i] > Math.max(15, 4 * fond) && d[i] >= d[i - 1] && d[i] >= d[i + 1] && d[i - 1] > 1.5 * fond && d[i - 2] < d[i - 1]) coupes.push({ image: i + 1, t: r2(i / FPS), type: 'douce', ecart: r2(d[i]), fond: r2(fond) });
  }
  // 2 bis. les bascules de caméra : l'image entière bouge vite pendant au moins 1/3 s puis se pose (un plan-séquence qui change de point de vue sans couper).
  // Seuil : écart > 4 (moyenne glissante sur 5 images), hors coupes.
  const bascules = []; { const lisse = i => { let s = 0, n = 0; for (let k = Math.max(1, i - 2); k <= Math.min(N - 1, i + 2); k++) { s += d[k]; n++; } return s / n; };
    const estCoupe = new Set(coupes.map(c => c.image - 1)); let deb = null, pic = 0, ipic = 0;
    for (let i = 1; i <= N; i++) { const v = i < N && !estCoupe.has(i) ? lisse(i) : 0;
      if (v > 4) { if (deb == null) { deb = i; pic = 0; } if (v > pic) { pic = v; ipic = i; } }
      else if (deb != null) { if (i - deb >= 10) bascules.push({ i0: deb + 1, pic: ipic + 1, i1: i, duree: r2((i - deb) / FPS), montee: r2((ipic - deb) / FPS), ecart_max: r2(pic) }); deb = null; } } }
  // 3. les plans et la caméra de chaque plan : glissement (en % de la largeur) et zoom estimés entre images successives (recherche exhaustive, petite image)
  const bornes = [1, ...coupes.map(c => c.image), N + 1], plans = [];
  const sad = (p, q, dx, dy, z) => { let s = 0, n = 0; const cx = gw / 2, cy = gh / 2;
    for (let y = 3; y < gh - 3; y++) for (let x = 3; x < gw - 3; x++) { const sx = Math.round(cx + (x - cx) * z + dx), sy = Math.round(cy + (y - cy) * z + dy); if (sx < 0 || sy < 0 || sx >= gw || sy >= gh) continue; s += Math.abs(p[y * gw + x] - q[sy * gw + sx]); n++; } return s / n; };
  for (let k = 0; k + 1 < bornes.length; k++) {
    const i0 = bornes[k], i1 = bornes[k + 1] - 1; let tx = 0, ty = 0, zz = 1, n = 0, bouge = 0;
    for (let i = i0; i < i1; i += 2) {   // une paire sur deux suffit (et divise le temps par deux)
      const p = F(i - 1), q = F(i), s0 = sad(p, q, 0, 0, 1); let best = [s0, 0, 0, 1];
      for (const z of [.97, .985, 1, 1.015, 1.03]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const s = sad(p, q, dx, dy, z); if (s < best[0]) best = [s, dx, dy, z]; }
      if (best[0] > s0 * .92) best = [s0, 0, 0, 1];   // un gain de moins de 8 % = bruit (objets qui bougent, grain) : caméra immobile
      tx += best[1]; ty += best[2]; zz *= best[3]; n++; if (d[i] > 2) bouge++;
    }
    const dur = (i1 - i0 + 1) / FPS, k2 = n ? 2 : 0;   // une paire sur deux mesurée : on double
    const pan = r2(tx * k2 / gw * 100), tilt = r2(ty * k2 / gh * 100), zoom = r2((Math.pow(zz, k2) - 1) * 100);
    const parS = v => r2(v / dur);
    plans.push({ n: k + 1, i0, i1, t0: r2((i0 - 1) / FPS), t1: r2(i1 / FPS), duree: r2(dur), camera: { pan_pct: pan, tilt_pct: tilt, zoom_pct: zoom, pan_pct_s: parS(pan), zoom_pct_s: parS(zoom),
      type: Math.abs(zoom) / dur > 1.5 ? (zoom > 0 ? 'zoom avant' : 'zoom arrière') : Math.abs(pan) / dur > 3 || Math.abs(tilt) / dur > 3 ? 'panoramique' : 'fixe ou lent' }, image_qui_bouge: n ? r2(bouge / n) : 0 });
  }
  // 3 bis. les moments : ce qui se voit entre deux événements (coupe, ou fin d'une bascule de caméra) — l'unité décrite par Haiku et citée par les règles
  const ev = [{ i: 1, entree: 'début' }, ...coupes.map(c => ({ i: c.image, entree: 'coupe ' + c.type })), ...bascules.map(b => ({ i: b.i0, entree: 'bascule de caméra' }))].sort((x, y) => x.i - y.i).filter((e, k, A) => !k || e.i - A[k - 1].i > 6);
  const moments = ev.map((e, k) => ({ n: k + 1, i0: e.i, i1: (ev[k + 1]?.i ?? N + 1) - 1, entree: e.entree })).map(m => ({ ...m, duree: r2((m.i1 - m.i0 + 1) / FPS) }));
  // 4. la voix
  let mots = [], langue = null, phrases = [];
  if (avecMots) {
    const mf = join(dossier, 'mots.json');
    if (!existsSync(mf)) { log(`${id} : Whisper…`); const r = spawnSync('python', [join(import.meta.dirname, 'mots.py'), video, mf], { encoding: 'utf8' }); if (r.status) throw new Error('Whisper : ' + (r.stderr || '').slice(-300)); }
    ({ mots, langue, phrases } = JSON.parse(readFileSync(mf, 'utf8')));
  }
  const seg = []; for (const m of mots) { if (seg.length && m.start - seg.at(-1)[1] < .35) seg.at(-1)[1] = Math.max(seg.at(-1)[1], m.end); else seg.push([m.start, m.end]); }
  const actif = seg.reduce((s, [x, y]) => s + y - x, 0), pauses = seg.slice(1).map((s, i) => s[0] - seg[i][1]);
  const ecartMot = coupes.map(c => { const t = (c.image - 1) / FPS; let best = null; for (const m of mots) if (best == null || Math.abs(m.start - t) < Math.abs(best)) best = m.start - t; return best == null ? null : Math.round(best * FPS); }).filter(x => x != null);
  const lufs = +(/I:\s+(-?[\d.]+) LUFS/.exec((await run('ffmpeg', ['-hide_banner', '-i', video, '-af', 'ebur128', '-f', 'null', '-']).catch(e => ({ err: e.message }))).err.split('Summary:').pop())?.[1] ?? NaN);
  const durees = plans.map(p => p.duree);
  const M = {
    id, video: resolve(video), source: { largeur: W, hauteur: H, fps: r2(a / b), duree: r2(duree), images_30: N, format: vertical ? '9:16' : '16:9' },
    resume: {
      plans: plans.length, plan_median_s: r2(med(durees)), plan_p10_s: r2(pct(durees, .1)), plan_p90_s: r2(pct(durees, .9)), coupes_par_10s: r2(coupes.length / duree * 10),
      plans_courts_moins_1s: plans.filter(p => p.duree < 1).length, plans_longs_plus_3s: plans.filter(p => p.duree > 3).length,
      camera: Object.fromEntries(['fixe ou lent', 'panoramique', 'zoom avant', 'zoom arrière'].map(t => [t, r2(plans.filter(p => p.camera.type === t).length / plans.length)])),
      langue, mots: mots.length, mots_par_minute_de_voix: actif ? Math.round(mots.length / actif * 60) : null, part_de_voix: r2(actif / duree),
      pause_mediane_s: r2(med(pauses)), pause_p90_s: r2(pct(pauses, .9)),
      coupe_moins_mot_images_median: med(ecartMot), coupes_a_2_images_d_un_mot: ecartMot.length ? r2(ecartMot.filter(x => Math.abs(x) <= 2).length / ecartMot.length) : null,
      moments: moments.length, moment_median_s: r2(med(moments.map(m => m.duree))), bascules_camera: bascules.length, bascules_par_10s: r2(bascules.length / duree * 10), bascule_duree_mediane_s: r2(med(bascules.map(b => b.duree))), bascule_montee_mediane_s: r2(med(bascules.map(b => b.montee))),
      lufs: Number.isFinite(lufs) ? lufs : null, musique_sous_voix: 'non mesuré (pistes séparées nécessaires)', fondus: 'non mesurés (décrits par Haiku)',
    },
    coupes, bascules, plans, moments, mots, phrases,
  };
  writeFileSync(join(dossier, 'mesures.json'), JSON.stringify(M, null, 1));
  log(`${id} : ${plans.length} plans (médiane ${M.resume.plan_median_s} s), ${bascules.length} bascules de caméra, ${mots.length} mots, ${M.resume.mots_par_minute_de_voix} mots/min, ${M.resume.lufs} LUFS`);
  return M;
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const a = process.argv.slice(2), i = a.indexOf('--id');
  await mesurer(a[0], a[1], { id: i >= 0 ? a[i + 1] : undefined, mots: !a.includes('--sans-mots') });
}
