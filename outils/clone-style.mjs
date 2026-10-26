// clone-style.mjs : la copie de style (phase 7). 1 à 7 vidéos de référence -> _styles/<nom>/regles.md, une ligne par règle :
//   ID | règle | valeur | déclencheur | preuves (vidéo#image « mot ») | méthode | confiance | exceptions
// node outils/clone-style.mjs <nom> <video1> [video2 …] [--sans-ia] [--ajouter]   (--ajouter : garde les vidéos déjà dans la DA, ajoute celles-ci)
// node outils/clone-style.mjs --fiche <nom>                                         (refait seulement fiche.json : résumé + images clés)
// La bibliothèque de DA : _styles/<nom>/ = sources/ (les vidéos), refs/rN/ (mesures, images, planches, descriptions), regles.md (lu par Claude et l'équipe),
// fiche.json (lu par la page DA seulement : { créateur, pays, lien, compte, tags, notes } écrits par Noam, { auto } écrit ici ; chacun ne touche que ses clés).
// Les chiffres viennent du code (mesurer-video.mjs) ; Haiku décrit les planches de chaque plan ; Opus rédige ; le code vérifie chaque preuve citée
// (image qui existe, mot réellement dit à cet instant, valeur retrouvée dans les mesures) et met de côté ce qui ne tient pas.
// On reprend le rythme, le cadrage et la grammaire ; jamais les personnages, la palette ni l'identité visuelle de la référence.
import { mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync, readdirSync, rmSync, linkSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, execFileSync, spawnSync } from 'node:child_process';
import { FAMILLES, daMd } from './importer-da.mjs';
import sharp from 'sharp';
import { mesurer } from './mesurer-video.mjs';

export const STYLES = 'C:/claude/studio-projets/_styles';
const FPS = 30, r2 = x => Math.round(x * 100) / 100;
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// une planche : 3 plans par planche, 8 images par plan, chaque image marquée « r1 #123 · 4,10 s · mot »
async function planches(M, dossier, log) {
  const out = join(dossier, 'planches'); mkdirSync(out, { recursive: true });
  const vert = M.source.format === '9:16', tw = vert ? 135 : 240, th = vert ? 240 : 135, lab = 34, cols = 8, fichiers = [];
  const motA = t => M.mots.filter(m => m.start <= t + .05).at(-1);
  for (let g = 0; g < M.moments.length; g += 3) {
    const groupe = M.moments.slice(g, g + 3), compo = [], H = groupe.length * (th + lab + 22);
    for (const [r, p] of groupe.entries()) {
      const y0 = r * (th + lab + 22), n = Math.min(cols, p.i1 - p.i0 + 1);
      compo.push({ input: Buffer.from(`<svg width="${cols * tw}" height="22"><rect width="100%" height="100%" fill="#222"/><text x="6" y="16" font-family="Arial" font-size="14" fill="#ffd23f">${esc(`${M.id} moment ${p.n} : images ${p.i0}-${p.i1} (${p.duree} s, entrée : ${p.entree})`)}</text></svg>`), top: y0, left: 0 });
      for (let k = 0; k < n; k++) {
        const im = n === 1 ? p.i0 : Math.round(p.i0 + k * (p.i1 - p.i0) / (n - 1)), t = (im - 1) / FPS, m = motA(t);
        const f = join(dossier, 'images', String(im).padStart(5, '0') + '.jpg'); if (!existsSync(f)) continue;
        compo.push({ input: await sharp(f).resize(tw, th, { fit: 'cover' }).toBuffer(), top: y0 + 22, left: k * tw });
        compo.push({ input: Buffer.from(`<svg width="${tw}" height="${lab}"><rect width="100%" height="100%" fill="#000"/><text x="4" y="14" font-family="Arial" font-size="13" fill="#fff">${esc(`#${im} · ${t.toFixed(2)} s`)}</text><text x="4" y="29" font-family="Arial" font-size="12" fill="#9cf">${esc(m && t - m.end < .6 ? '« ' + m.w + ' »' : '')}</text></svg>`), top: y0 + 22 + th, left: k * tw });
      }
    }
    const nom = `${M.id}_moments_${groupe[0].n}-${groupe.at(-1).n}.jpg`;
    await sharp({ create: { width: cols * tw, height: H, channels: 3, background: '#111' } }).composite(compo).jpeg({ quality: 82 }).toFile(join(out, nom)); fichiers.push(join(out, nom));
  }
  log(`${M.id} : ${fichiers.length} planches`); return fichiers;
}

// claude -p dans un dossier temporaire hors du dépôt (comme le relecteur aveugle : il ne lit pas le CLAUDE.md du studio)
const claude = (model, prompt, cwd, effort = 'medium') => new Promise((ok, ko) => {
  const p = spawn('claude', ['-p', '--model', model, '--effort', effort, '--setting-sources', 'project', '--tools', 'Read', '--allowedTools', 'Read', '--output-format', 'json', '--no-session-persistence'], { cwd, shell: process.platform === 'win32', stdio: ['pipe', 'pipe', 'inherit'] });
  let o = ''; p.stdout.on('data', d => o += d); p.on('close', c => { let r; try { r = JSON.parse(o); } catch { return ko(new Error(`claude -p : réponse illisible (code ${c})`)); } r.is_error ? ko(new Error('claude -p : ' + String(r.result).slice(0, 200))) : ok({ texte: r.result, cout: r.total_cost_usd || 0 }); });
  p.stdin.end(prompt);
});
// une réponse JSON illisible (guillemet non échappé dans une longue réponse : vu sur @klauser.app) : on redemande, 3 essais au plus
async function claudeJson(model, prompt, cwd, effort, lire) {
  let err, cout = 0;
  for (let i = 0; i < 3; i++) {
    const r = await claude(model, i ? prompt + '\nATTENTION : ta réponse précédente n’était pas un JSON valide. Réponds par un JSON strictement valide (dans les textes, remplace les guillemets droits par « »).' : prompt, cwd, effort); cout += r.cout;
    try { return { ...r, cout, o: lire(r.texte) }; } catch (e) { err = e; }
  }
  throw new Error('JSON illisible après 3 essais : ' + err.message);
}
// guillemets droits non échappés à l'intérieur d'un texte (Haiku cite les textes à l'écran : « titre "BIG" en haut ») : un guillemet collé à une lettre
// et qui n'est pas suivi d'un séparateur JSON est intérieur ; un guillemet précédé d'une espace qui ne suit pas « : , [ { » aussi
const reparer = s => s.replace(/(?<=[^\s{\[,:\\])"(?!\s*[,:}\]])/g, '\\"').replace(/(?<=[^:,\[{\s]\s)"(?=[^\s,:}\]])/g, '\\"');
const lireJson = t => { try { return JSON.parse(t); } catch { return JSON.parse(reparer(t)); } };
const objet = s => lireJson(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1).replace(/[\u0000-\u001f]+/g, ' '));
const json = s => lireJson(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1).replace(/[\u0000-\u001f]+/g, ' '));   // retours à la ligne bruts dans les chaînes (vu chez Haiku)

// la vérification de chaque ligne : 8 colonnes, preuves qui existent, mot vraiment dit à cet instant, valeur retrouvée dans les mesures
export function verifier(ligne, refs) {
  const c = ligne.split('|').map(x => x.trim()); if (c.length !== 8) return { ok: false, pourquoi: `${c.length} colonnes au lieu de 8` };
  const [id, , valeur, , preuves, methode] = c, pb = [];
  const P = [...preuves.matchAll(/\b(r\d+)\s*#\s*(\d+)(?:\s*«\s*([^»]+?)\s*»)?/g)];
  if (!P.length) pb.push('aucune preuve « rN#image »');
  for (const [, v, n, mot] of P) {
    const M = refs[v]; if (!M) { pb.push(`${v} : vidéo inconnue`); continue; }
    const im = +n; if (im < 1 || im > M.source.images_30) { pb.push(`${v}#${n} : image hors de la vidéo`); continue; }
    if (mot) { const t = (im - 1) / FPS, w = norm(mot.split(/\s+/)[0]); if (w && !M.mots.some(m => Math.abs(m.start - t) < 1.5 && norm(m.w) === w)) pb.push(`${v}#${n} : « ${mot} » n'est pas dit vers ${t.toFixed(1)} s`); }
  }
  if (/mesur/i.test(methode)) {   // une valeur « mesurée » : chaque nombre doit se retrouver dans les mesures (à 3 % près) ou être un n° d image
    // « 471-475 » = une plage d'images, pas -475
    const nums = [...valeur.matchAll(/(?:(?<!\d)-)?\d+(?:[.,]\d+)?/g)].map(m => +m[0].replace(',', '.')).filter(x => x !== 0);
    const pool = Object.values(refs).flatMap(M => [...Object.values(M.resume).filter(x => typeof x === 'number'), ...Object.values(M.resume.camera).map(x => x * 100), M.resume.part_de_voix * 100, M.resume.coupes_a_2_images_d_un_mot * 100,
      ...M.plans.map(p => p.duree), ...M.moments.map(p => p.duree), ...M.bascules.flatMap(b => [b.duree, b.montee]), ...M.plans.flatMap(p => [p.camera.pan_pct_s, p.camera.zoom_pct_s])]).filter(x => x != null && Number.isFinite(x));
    const images = Math.max(...Object.values(refs).map(M => M.source.images_30));
    const absents = nums.filter(x => !(pool.some(y => Math.abs(x - y) <= Math.max(.011, Math.abs(y) * .03)) || (Number.isInteger(x) && x > 0 && x <= images)));
    if (absents.length) pb.push(`valeur « ${valeur} » : ${absents.join(', ')} introuvable(s) dans les mesures`);
  }
  return { ok: !pb.length, pourquoi: pb.join(' ; '), id };
}

// un lien -> sources/<site>_<id>.mp4 (720p au plus, yt-dlp ; rien de personnel dans la requête) ; déjà là = pas retéléchargé
export function telecharger(url, D, log = console.log) {
  mkdirSync(join(D, 'sources'), { recursive: true }); log(`téléchargement de ${url}`);
  const f = execFileSync('yt-dlp', ['-q', '--no-progress', '--no-playlist', '--no-warnings', '-S', 'vcodec:h264,res:720', '--merge-output-format', 'mp4',
    '-o', join(D, 'sources', '%(extractor)s_%(id)s.%(ext)s'), '--print', 'after_move:filepath', url], { encoding: 'utf8' }).trim().split(/\r?\n/).pop();
  if (!f || !existsSync(f)) throw new Error('téléchargement impossible : ' + url); log(`✓ ${basename(f)}`); return f;
}
// la vidéo est gardée dans la DA (sources/) : lien physique si même disque, sinon copie ; la page DA peut la lire
function garder(v, D) {
  const s = join(D, 'sources'), dest = join(s, basename(v)); if (resolve(v).toLowerCase().startsWith(resolve(s).toLowerCase())) return resolve(v);
  mkdirSync(s, { recursive: true }); if (!existsSync(dest)) { try { linkSync(v, dest); } catch { copyFileSync(v, dest); } } return dest;
}
export async function cloner(nom, videos, { ia = true, ajouter = false, metas = [], log = console.log } = {}) {
  if (!/^[a-z0-9-]+$/.test(nom)) throw new Error('nom du style : minuscules, chiffres, tirets');
  const D = join(STYLES, nom); mkdirSync(join(D, 'refs'), { recursive: true });
  if (ajouter && existsSync(join(D, 'mesures.json'))) videos = [...Object.values(JSON.parse(readFileSync(join(D, 'mesures.json'), 'utf8'))).map(m => m.video), ...videos];   // d'abord les anciennes : r1, r2… gardent leur numéro (descriptions en cache)
  videos = videos.map(v => /^https?:\/\//i.test(v) ? telecharger(v, D, log) : v);   // un lien (TikTok, YouTube…) : la vidéo est d'abord téléchargée dans sources/
  for (const v of videos) if (!existsSync(v)) throw new Error('vidéo introuvable : ' + v);
  videos = [...new Set(videos.map(v => garder(v, D)))];
  if (!videos.length || videos.length > 7) throw new Error(`1 à 7 vidéos de référence (ici ${videos.length})`);
  const refs = {}, sheets = {};
  for (const [k, v] of videos.entries()) {
    const id = `r${k + 1}`, dd = join(D, 'refs', id); mkdirSync(dd, { recursive: true });
    refs[id] = await mesurer(resolve(v), dd, { id, log }); sheets[id] = await planches(refs[id], dd, log);
    if (metas[k]) writeFileSync(join(dd, 'meta.json'), JSON.stringify(metas[k], null, 1));   // titre, description, hashtags, vues… (lot TikTok)
    const sf = join(dd, 'son.json');   // le son, mesuré en local (son-ref.py : voix, fond, musique, tempo, bruitages dans les pauses, silences)
    if (!existsSync(sf)) { const s = spawnSync('python', [join(import.meta.dirname, 'son-ref.py'), v, join(dd, 'mots.json'), sf], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
      log(s.status ? `${id} : son non mesuré (${(s.stderr || '').slice(-200)})` : `${id} : ${s.stdout.trim()}`); }
  }
  writeFileSync(join(D, 'mesures.json'), JSON.stringify(Object.fromEntries(Object.entries(refs).map(([k, M]) => [k, { video: M.video, source: M.source, resume: M.resume }])), null, 1));
  if (!ia) return { D, refs };
  // Haiku : ce que montre chaque plan (une session par vidéo, planches copiées dans un dossier hors du dépôt)
  const tmp = join(tmpdir(), `studio-style-${Date.now()}`); mkdirSync(tmp, { recursive: true }); let cout = 0; const desc = {};
  try {
    for (const [id, fs] of Object.entries(sheets)) {
      const df = join(D, 'refs', id, 'descriptions.json'); if (existsSync(df)) { desc[id] = JSON.parse(readFileSync(df, 'utf8')); continue; }   // déjà décrit
      const noms = fs.map(f => { copyFileSync(f, join(tmp, basename(f))); return basename(f); });
      log(`${id} : Haiku décrit ${noms.length} planches`);
      const r = await claudeJson('haiku', `Lis ces planches (Read) : ${noms.join(', ')}. Chaque ligne d'une planche = un « moment » d'une vidéo de référence (motion design) : ce qui se voit entre deux événements mesurés (coupe, ou bascule de caméra = mouvement rapide qui change de point de vue SANS couper) ; chaque image porte son numéro (#), son instant et le mot dit à ce moment.
Pour CHAQUE moment, décris seulement ce qui se voit (pas d'interprétation) : ce qui est montré (objet, lieu, personnage : en mots génériques), comment l'image est fabriquée (3D et quel rendu, 2D vectorielle, dessin, image générée par IA, vidéo filmée, archive, capture d'écran, jeu vidéo, photo animée…), couleurs dominantes (hex approximatifs), style des polices à l'écran, cadrage (très gros plan / gros plan / plan moyen / large / vue de dessus), mouvement de caméra visible, textes à l'écran (quoi, où : haut/centre/bas, taille relative, couleur), transition d'entrée (le type mesuré est écrit sur la planche ; décris à quoi elle ressemble), quel mot est illustré par quel objet ou geste et à quelle image, et tout procédé de montage répété.
Réponds uniquement en JSON : [{"video": "${id}", "moment": n, "images": "i0-i1", "montre": "...", "fabrication": "...", "couleurs": "...", "typo": "...", "cadrage": "...", "camera": "...", "textes": "...", "transition": "...", "illustrations": [{"mot": "...", "image": n, "quoi": "..."}], "procedes": "..."}]`, tmp, 'low', json);
      desc[id] = r.o; cout += r.cout; writeFileSync(join(D, 'refs', id, 'descriptions.json'), JSON.stringify(desc[id], null, 1));
    }
    // Opus : les règles, à partir des mesures (chiffres) et des descriptions (preuves visuelles)
    const ancien = existsSync(join(D, 'regles.md')) ? readFileSync(join(D, 'regles.md'), 'utf8') : '';
    const donnees = Object.fromEntries(Object.entries(refs).map(([id, M]) => [id, { source: M.source, resume: M.resume,
      plans: M.plans.map(p => ({ n: p.n, images: `${p.i0}-${p.i1}`, duree: p.duree, camera: p.camera })),
      moments: M.moments.map(p => ({ n: p.n, images: `${p.i0}-${p.i1}`, duree: p.duree, entree: p.entree, mots: M.mots.filter(m => m.start >= (p.i0 - 1) / FPS && m.start < p.i1 / FPS).map(m => `${m.w}@${Math.round(m.start * FPS) + 1}`).join(' ') })),
      bascules: M.bascules.map(b => `${b.i0}-${b.i1} (pic ${b.pic}, ${b.duree} s)`).join(' ; '),
      coupes: M.coupes.map(c => `${c.type}@${c.image}`).join(' '), descriptions: desc[id] }]));
    writeFileSync(join(tmp, 'donnees.json'), JSON.stringify(donnees, null, 1));   // une ligne par valeur : Read coupe les lignes trop longues (vu : la 3e vidéo « non lue »)
    log('Opus rédige les règles');
    const r = await claude('opus', `Tu écris la page de règles d'un style vidéo, tirée de ${videos.length} vidéo(s) de référence. Lis donnees.json (Read) : pour chaque vidéo (r1, r2…), les MESURES faites par du code (plans entre coupes, bascules de caméra = mouvement rapide qui change de point de vue sans couper, moments entre deux événements, caméra approximative, mots horodatés « mot@image », débit, pauses, sonie) et les DESCRIPTIONS des plans par un autre modèle.
Règles d'écriture :
- Une règle = une consigne qu'un monteur peut appliquer, chiffrée quand c'est possible (en images à 30 i/s, en secondes, en %).
- Reprends SEULEMENT le rythme, le cadrage, la caméra, la grammaire du montage, des textes et des transitions, le lien mot -> image. JAMAIS les personnages, la palette, les logos ni l'identité visuelle de la référence.
- Chaque chiffre « mesuré » doit venir des mesures (cite-le tel quel) ; ce qui vient des descriptions est une « observation ». N'invente aucune valeur.
- Preuves : au moins une par règle, au format r1#123 « mot » (numéro d'image tel qu'écrit dans les données, mot réellement dit à cet instant d'après « mot@image ») ; plusieurs vidéos si la règle est commune.
- Confiance : haute (toutes les références), moyenne (la plupart), basse (une seule). Exceptions : les contre-exemples vus, sinon « — ».
- 15 à 30 règles, groupées : rythme et coupes, caméra, cadrage, textes à l'écran, transitions, mot -> image, voix et son.
${ancien ? `- Une page existe déjà (ci-dessous) : garde ses ID pour les règles qui restent vraies, mets à jour valeurs et preuves, ajoute les nouvelles après le dernier ID.\n${ancien.slice(0, 12000)}\n` : ''}
Réponds UNIQUEMENT par les lignes du tableau, une par règle, 8 colonnes séparées par « | », sans en-tête :
R01 | règle | valeur | déclencheur | preuves | méthode (mesure / observation) | confiance | exceptions`, tmp, 'high');
    cout += r.cout;
    const lignes = r.texte.split('\n').map(l => l.trim().replace(/^\|\s*|\s*\|$/g, '')).filter(l => /^R\d+\s*\|/.test(l));
    const bonnes = [], doutes = [];
    for (const l of lignes) { const v = verifier(l, refs); (v.ok ? bonnes : doutes).push(v.ok ? l : `${l} | ⚠ ${v.pourquoi}`); }
    const R = Object.values(refs), m = R.map(M => M.resume);
    writeFileSync(join(D, 'regles.md'), `# Style « ${nom} »

Tiré de ${R.length} référence(s) : ${R.map(M => `${M.id} = ${basename(M.video)} (${M.source.duree} s, ${M.source.format}, ${M.resume.langue || '?'})`).join(' ; ')}. Le ${new Date().toLocaleDateString('fr-FR')}.
Mesuré par le code : plan médian ${m.map(x => x.plan_median_s + ' s').join(' / ')} ; coupes par 10 s ${m.map(x => x.coupes_par_10s).join(' / ')} ; bascules de caméra par 10 s ${m.map(x => x.bascules_par_10s).join(' / ')} (durée médiane ${m.map(x => x.bascule_duree_mediane_s + ' s').join(' / ')}) ; ${m.map(x => x.mots_par_minute_de_voix + ' mots/min').join(' / ')} ; voix sur ${m.map(x => Math.round(x.part_de_voix * 100) + ' %').join(' / ')} de la durée ; ${m.map(x => x.lufs + ' LUFS').join(' / ')}.
Non mesuré : niveau de la musique sous la voix (pistes séparées nécessaires) ; fondus (décrits par Haiku). Caméra : estimation approximative.
On reprend le rythme, le cadrage et la grammaire ; jamais les personnages ni l'identité visuelle des références. Images numérotées à 30 i/s (planches dans refs/rN/planches/).

| ID | règle | valeur | déclencheur | preuves (vidéo#image « mot ») | méthode | confiance | exceptions |
|---|---|---|---|---|---|---|---|
${bonnes.map(l => `| ${l} |`).join('\n')}
${doutes.length ? `\n## À vérifier (preuve ou valeur non retrouvée par le contrôle)\n\n| ID | règle | valeur | déclencheur | preuves | méthode | confiance | exceptions | problème |\n|---|---|---|---|---|---|---|---|---|\n${doutes.map(l => `| ${l} |`).join('\n')}\n` : ''}
## Retenu depuis le studio (défaut -> cause -> correction)

| ID | règle | valeur | déclencheur | preuves | méthode | confiance | exceptions |
|---|---|---|---|---|---|---|---|
${ancien.split('## Retenu depuis le studio')[1]?.split('\n').filter(l => /^\|\s*S\d+/.test(l)).join('\n') || ''}
`);
    cout += await fiche(nom, { log }); elaguer(nom, log);
    log(`✓ ${join(D, 'regles.md')} : ${bonnes.length} règles vérifiées, ${doutes.length} à vérifier (≈ ${cout.toFixed(2)} $ API)`);
    return { D, refs, bonnes: bonnes.length, doutes: doutes.length, cout };
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

// la fiche de la page DA : images clés (le milieu de chaque moment, jamais une transition) + résumé en français simple, tiré des seules règles vérifiées.
// Rien de tout ça n'entre dans regles.md : les constructeurs n'en reçoivent que le tableau.
export async function fiche(nom, { log = console.log } = {}) {
  const D = join(STYLES, nom), F = join(D, 'fiche.json'), M = JSON.parse(readFileSync(join(D, 'mesures.json'), 'utf8')), ids = Object.keys(M), apercu = [];
  for (const id of ids) {
    const ms = JSON.parse(readFileSync(join(D, 'refs', id, 'mesures.json'), 'utf8')).moments, n = Math.min(ms.length, Math.ceil(8 / ids.length));
    for (let j = 0; j < n; j++) { const m = ms[Math.floor((j + .5) * ms.length / n)], f = `refs/${id}/images/${String(Math.round((m.i0 + m.i1) / 2)).padStart(5, '0')}.jpg`; if (existsSync(join(D, f))) apercu.push(f); }
  }
  const table = readFileSync(join(D, 'regles.md'), 'utf8').split('## À vérifier')[0].split('\n').filter(l => /^\|\s*R\d+/.test(l));
  const lit = (id, f) => { try { return JSON.parse(readFileSync(join(D, 'refs', id, f), 'utf8')); } catch { return null; } };
  const avant = existsSync(F) ? JSON.parse(readFileSync(F, 'utf8')) : {};
  const tmp = join(tmpdir(), `studio-fiche-${Date.now()}`); mkdirSync(tmp, { recursive: true }); let r;
  try {
    // tout ce qu'on sait de chaque vidéo : infos du réseau, texte dit, ce que montre chaque moment, son mesuré, mesures du montage ; + les images clés à regarder
    writeFileSync(join(tmp, 'videos.json'), JSON.stringify(Object.fromEntries(ids.map(id => [id, { infos: lit(id, 'meta.json'), mesures: M[id].resume, duree: M[id].source.duree, format: M[id].source.format,
      texte_dit: (lit(id, 'mots.json')?.mots || []).map(m => m.w).join(' ').replace(/ '/g, "'").split(/(?<=[.!?…])\s+/), son: lit(id, 'son.json'), moments: lit(id, 'descriptions.json') }])), null, 1));
    const ims = apercu.slice(0, 8).map((f, i) => { const n = `image_${i + 1}_${f.split('/')[1]}.jpg`; copyFileSync(join(D, f), join(tmp, n)); return n; });
    log('Opus écrit la fiche détaillée (look, fabrication, son, niche du compte)');
    r = await claudeJson('opus', `Tu fais la fiche complète d'une direction artistique (DA) de vidéos courtes (TikTok / Shorts), tirée de ${ids.length} vidéo(s) d'un même créateur${avant.createur ? ` (${avant.createur})` : ''}, pour qu'une équipe puisse REFAIRE ce style sur d'autres sujets, sans rien oublier.
Lis videos.json (Read) : pour chaque vidéo, les infos publiques (titre, description, hashtags, vues, likes, date), le texte dit, ce que montre chaque moment (décrit par un autre modèle : fabrication, couleurs, polices, cadrage, caméra, textes, transitions), le son mesuré par du code (voix, fond, musique, tempo, bruitages dans les pauses, silences) et les mesures du montage. Regarde aussi les images clés (Read) : ${ims.join(', ')}.
Voici aussi les règles de montage déjà vérifiées sur les mesures :
${table.join('\n')}
Consignes : français, concret, détaillé ; n'invente rien qui ne soit pas dans ces données ou visible sur les images (écris « non visible » sinon) ; exclus logos et mascottes du créateur.
Réponds UNIQUEMENT en JSON :
{"titre": "nom GÉNÉRIQUE de la DA : ce qu'on voit (ex. « Schémas à la craie sur tableau noir »), jamais le nom du compte",
 "famille": "une de : ${FAMILLES.join(' / ')}",
 "en_bref": ["4 à 6 phrases simples pour Noam (pas développeur) : à quoi ça ressemble, le rythme, la voix et le son, ce qui la rend reconnaissable"],
 "tags": ["4 à 8 mots-clés courts en minuscules"],
 "pour": "le genre de sujet qu'elle sert le mieux",
 "look": {"technique": "comment les images sont fabriquées (outils probables)", "couleurs": "palette avec hex approximatifs et rôle de chaque couleur", "typo": "polices (familles probables), graisses, contours, position et animation des textes et sous-titres", "rendu": "rendu, matières, lumière, textures, effets", "personnages": "...", "decors": "...", "mouvement": "caméra, transitions, rythme", "son": "voix (humaine ou synthèse, ton, débit), musique (genre, tempo, niveau), bruitages, silences"},
 "pour_refaire": ["8 à 15 consignes concrètes, dans l'ordre de fabrication"],
 "compte_md": "en Markdown : la DA du COMPTE — niche, sujets traités, angle, public visé, format (durée, rythme de publication si visible), formules d'accroche citées mot pour mot, structure type d'une vidéo, ton et voix, appel à l'action, chiffres (vues, likes par vidéo), pourquoi ça marche, et 10 idées de sujets dans cette niche"}`, tmp, 'medium', objet);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  const o = r.o;
  writeFileSync(F, JSON.stringify({ ...avant, auto: { titre: o.titre, famille: FAMILLES.includes(o.famille) ? o.famille : null, en_bref: o.en_bref || [], tags: o.tags || [], pour: o.pour || '', look: o.look || {}, pour_refaire: o.pour_refaire || [],
    apercu: apercu.slice(0, 8), regles: table.length, date: new Date().toISOString().slice(0, 10),
    videos: ids.map(id => ({ id, video: M[id].video, duree: M[id].source.duree, format: M[id].source.format, langue: M[id].resume.langue || null, titre: lit(id, 'meta.json')?.title || null, vues: lit(id, 'meta.json')?.view_count ?? null, lien: lit(id, 'meta.json')?.webpage_url || null })) } }, null, 1));
  // da.md (le look, lu par Claude et l'équipe) et compte.md (la niche, pour Noam) : jamais sur une DA écrite à la main (skill de tiktok-motion ou importée)
  if (!avant.skill && !String(avant.origine || '').startsWith('Tes vidéos')) {
    writeFileSync(join(D, 'da.md'), daMd({ titre: o.titre || nom, famille: o.famille || 'Copiées de vidéos', statut: 'copiée', verdict: `Copiée de ${avant.createur || 'vidéos de référence'} (${ids.length} vidéo(s)). ${o.pour || ''}`,
      look: o.look || {}, pour_refaire: o.pour_refaire, exemples: apercu.slice(0, 8).map(f => join(D, f)), sources: [] }));
    if (o.compte_md) writeFileSync(join(D, 'compte.md'), `# La DA du compte ${avant.createur || nom}\n\n${o.compte_md}\n`);
  }
  log(`✓ ${F} : « ${o.titre} » (${o.famille}), ${apercu.length} images clés`); return r.cout;
}
// élagage (place disque) : on garde 1 image par seconde, le milieu de chaque moment et chaque image citée en preuve ; le marqueur .elague dit à
// mesurer-video.mjs de tout réextraire si on refait la copie (--ajouter)
export function elaguer(nom, log = console.log) {
  const D = join(STYLES, nom), txt = existsSync(join(D, 'regles.md')) ? readFileSync(join(D, 'regles.md'), 'utf8') : '';
  const cites = new Set([...txt.matchAll(/\b(r\d+)\s*#\s*(\d+)/g)].map(m => `${m[1]}#${+m[2]}`)); let n = 0;
  for (const id of readdirSync(join(D, 'refs'))) {
    const I = join(D, 'refs', id, 'images'); if (!existsSync(I)) continue;
    const mil = new Set(JSON.parse(readFileSync(join(D, 'refs', id, 'mesures.json'), 'utf8')).moments.map(m => Math.round((m.i0 + m.i1) / 2)));
    for (const f of readdirSync(I)) { const k = parseInt(f, 10); if (!k || k % 30 === 1 || mil.has(k) || cites.has(`${id}#${k}`)) continue; rmSync(join(I, f)); n++; }
    writeFileSync(join(I, '.elague'), '');
  }
  log(`élagage : ${n} images retirées`);
}

export const _reparer = reparer;   // pour le test ci-dessous
export { claudeJson, objet };   // réutilisés par niches-json.mjs
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const a = process.argv.slice(2).filter(x => !x.startsWith('--'));
  try { if (process.argv.includes('--fiche')) await fiche(a[0]); else await cloner(a[0], a.slice(1), { ia: !process.argv.includes('--sans-ia'), ajouter: process.argv.includes('--ajouter') }); }
  catch (e) { console.error('✗ ' + e.message); process.exit(1); }
}
