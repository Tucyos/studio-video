// studio.mjs : l'interface du studio (npm start). Une page web locale autour des projets vidéo.
// npm start -- [<projet>] [--adaptateur adaptateurs/x.json] [--port 5170]   (sans projet : le dernier ouvert)
// Le projet est servi à la racine (ses pages utilisent des chemins absolus ; ce qui n'y est pas est cherché à la racine de tiktok-motion,
// comme le font les pages Koan : /studio/lib/…, /videos/Koan/…). Interface sous /__studio/, API sous /__api/.
import { createServer } from 'node:http';
import { readFile, writeFile, stat, mkdir, readdir } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync, mkdirSync, watch, createReadStream, createWriteStream, statSync, readdirSync, linkSync, copyFileSync } from 'node:fs';
import { extname, join, resolve, basename, sep, relative } from 'node:path';
import { spawn, execFileSync, execFile } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { ZONE } from './check.mjs';
import * as CL from './lib/claude.mjs';
import * as EQ from './lib/equipe.mjs';
import * as BIB from './lib/bibliotheque.mjs';
import { lot } from './lib/lot.mjs';

const ICI = import.meta.dirname, argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const TM = 'C:/claude/tiktok-motion', SFX = 'C:/tiktok/chat/sfx', STATS_DB = 'C:/claude/tiktok-tracker/data/tiktok.db', DRIVE = 'G:/Mon Drive/Tiktok/motion design';
const MEMOIRE = 'C:/Users/Noam/.claude/projects/C--claude-tiktok-motion/memory', PROJETS = CL.STUDIO_PROJETS;   // hors du dépôt du logiciel
const ESPACES = { Koan: { dossier: join(TM, 'videos/Koan'), compte: 'koan', da: 'da-koan' }, Automobile: { dossier: join(TM, 'videos/Automobile'), compte: 'matoumecano', da: 'da-auto' } };
const DERNIER = join(ICI, 'out', 'dernier-projet.json');
await mkdir(join(ICI, 'out'), { recursive: true }); await mkdir(PROJETS, { recursive: true });

// ---------- le projet ouvert (change sans redémarrer : bouton « Ouvrir » de la page Projets) ----------
let cfg = argv[0] && !argv[0].startsWith('--') ? { projet: resolve(argv[0]), adaptateur: opt('adaptateur') && resolve(opt('adaptateur')) } : existsSync(DERNIER) ? JSON.parse(readFileSync(DERNIER, 'utf8')) : null;
let ROOT, NOM, QA, AF, A, LECTURE_SEULE, veilleur, aRecharger = null;
const lectureSeule = p => resolve(p).toLowerCase().startsWith(resolve(TM).toLowerCase());   // tiktok-motion se lit, ne s'écrit jamais (CLAUDE.md)
function espaceDe(p) { const o = join(p, '.studio', 'origine.txt'); if (existsSync(o)) p = readFileSync(o, 'utf8').trim();   // une copie garde le compte de son original
  for (const [k, e] of Object.entries(ESPACES)) if (resolve(p).toLowerCase().startsWith(resolve(e.dossier).toLowerCase())) return k; const pj = join(p, 'project.json'); return existsSync(pj) ? JSON.parse(readFileSync(pj, 'utf8')).espace || null : null; }
function pages(p) { let l = []; try { l = readdirSync(join(p, 'scenes')).filter(f => f.endsWith('.html')).map(f => 'scenes/' + f); } catch {} return existsSync(join(p, 'moteur', 'page.html')) ? ['moteur/page.html', ...l] : l; }
function ouvrir(c) {
  cfg = c; ROOT = c.projet; NOM = basename(ROOT); QA = join(ICI, 'out', NOM, 'qa'); LECTURE_SEULE = lectureSeule(ROOT);
  AF = c.adaptateur || [join(ROOT, '.studio', 'adaptateur.json'), join(ICI, 'adaptateurs', NOM + '.json')].find(existsSync) || join(ICI, 'adaptateurs', NOM + '.json');
  const pj = join(ROOT, 'project.json'), propre = existsSync(pj) ? JSON.parse(readFileSync(pj, 'utf8')) : {};
  const ps = pages(ROOT), defaut = ['moteur/page.html', 'scenes/film.html'].find(x => ps.includes(x)) || ps[0] || null;
  A = { page: defaut, fps: 30, shutter: .5, sujets: {}, ...propre, ...(existsSync(AF) ? JSON.parse(readFileSync(AF, 'utf8')) : {}), ...(c.page ? { page: c.page } : {}) };
  if (!existsSync(AF) && !A.mots && existsSync(join(ROOT, 'docs/timing.json'))) A.mots = 'docs/timing.json';   // devine ce qui est standard dans tiktok-motion
  if (!existsSync(AF) && !A.mix) { const m = ['out/mix_14.wav', 'audio/mix.wav', 'audio/vo_mix.wav', 'audio/vo.wav'].find(f => existsSync(join(ROOT, f))); if (m) A.mix = m; }
  writeFileSync(DERNIER, JSON.stringify(c));
  veilleur?.close(); veilleur = null; let minuterie;
  try { veilleur = watch(ROOT, { recursive: true }, (e, f) => { if (!f || /^(out|qa|\.studio|node_modules|assets|audio|voix|voice|\.git)[\\/]/.test(f) || !/\.(js|mjs|html|json)$/.test(f) || /cues\.json$/.test(f)) return;
    if (CL.enCours() || EQ.active()) { aRecharger = f; return; }   // pendant que Claude travaille : un seul rechargement, à la fin
    clearTimeout(minuterie); minuterie = setTimeout(() => diffuse('recharge', f), 150); }); } catch {}
}
if (cfg && existsSync(cfg.projet)) ouvrir(cfg);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.srt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const LOURD = new Set(['.glb', '.png', '.jpg', '.jpeg', '.webp', '.wav', '.mp3', '.mp4', '.woff2', '.ttf', '.otf', '.hdr', '.ktx2', '.bin']);
const sous = (base, p) => { const r = resolve(base, '.' + p); return r === resolve(base) || r.startsWith(resolve(base) + sep) ? r : null; };   // pas de ../ hors du dossier
const json = (res, o, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
const corps = req => new Promise(ok => { let b = ''; req.on('data', d => b += d); req.on('end', () => ok(b)); });
// un fichier, en flux avec Range (les vidéos se lisent et se parcourent dans la page sans tout charger)
function fichier(req, res, p, extra = {}) {
  let s; try { s = statSync(p); if (!s.isFile()) return false; } catch { return false; }
  const type = MIME[extname(p).toLowerCase()] || 'application/octet-stream', r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (r) { const a = r[1] ? +r[1] : s.size - +r[2], b = r[1] && r[2] ? +r[2] : s.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${s.size}`, 'Content-Length': b - a + 1, 'Accept-Ranges': 'bytes', ...extra }); createReadStream(p, { start: a, end: b }).pipe(res); }
  else { res.writeHead(200, { 'Content-Type': type, 'Content-Length': s.size, 'Accept-Ranges': 'bytes', ...extra }); createReadStream(p).pipe(res); }
  return true;
}
const lireJson = async f => { try { return JSON.parse(await readFile(f, 'utf8')); } catch { return null; } };
const titreDe = p => { for (const f of ['README.md', 'SUJET.md', 'etat.md', 'script.md']) { try { const l = readFileSync(join(p, f), 'utf8').split('\n').find(l => l.startsWith('# ')); if (l) return l.slice(2).trim().replace(/^(État|Etat)\s*[—:–-]+\s*/i, '').replace(/,? au \d+\/\d+\/\d+$/, ''); } catch {} } return null; };

// ---------- tâches en fond (Contrôler, Exporter) : leur journal part vers la page en flux SSE ----------
const clients = new Set(); let tache = null;
const diffuse = (type, data) => { for (const c of clients) c.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`); };
function lance(nom, args, apres) {
  if (tache || CL.enCours() || EQ.active()) return false;
  const p = spawn(args[0].endsWith('.py') ? 'python' : process.execPath, args, { cwd: ICI, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } }); tache = { nom, debut: Date.now(), p }; diffuse('tache', { nom, etat: 'en cours' });
  const ligne = d => String(d).split(/[\r\n]+/).filter(l => l.trim() && !/X4122|warning X|^\(|PCFSoft|Canvas2D/.test(l)).forEach(l => diffuse('journal', l.slice(0, 300)));
  p.stdout.on('data', ligne); p.stderr.on('data', ligne);
  p.on('close', async c => { if (c === 0 && apres) await apres().catch(e => diffuse('journal', 'après : ' + e.message));
    diffuse('tache', { nom, etat: c === 0 ? 'fini' : tache.annule ? 'annulé' : 'échec', duree: Math.round((Date.now() - tache.debut) / 1000) }); tache = null; });
  return true;
}

// ---------- forme d'onde : un pic par 10 ms, calculé une fois ----------
const ecoute = () => A.mix || ['audio/voice_clean.wav', 'audio/voice.wav'].find(f => existsSync(join(ROOT, f))) || null;   // ce qu'on entend : le mix, sinon la voix (avant le mix)
async function onde() {
  const f = join(ICI, 'out', NOM, 'onde.json'), src = ecoute() && resolve(ROOT, ecoute());
  if (!src || !existsSync(src)) return null;
  if (existsSync(f) && (await stat(f)).mtimeMs > (await stat(src)).mtimeMs) return lireJson(f);
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', src, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], { maxBuffer: 1e9 }), x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
  const pics = []; for (let i = 0; i < x.length; i += 80) { let m = 0; for (let j = i; j < Math.min(x.length, i + 80); j++) m = Math.max(m, Math.abs(x[j])); pics.push(+m.toFixed(3)); }
  const o = { pas: .01, pics }; await mkdir(join(ICI, 'out', NOM), { recursive: true }); await writeFile(f, JSON.stringify(o)); return o;
}

// ---------- catalogue du pack de sons de Noam (CSV ; séparé par des points-virgules) ----------
let catalogueSons = null;
function sons() {
  if (catalogueSons) return catalogueSons;
  const f = join(SFX, '90_Documents_et_metadonnees', 'Catalogue-des-sons.csv'); if (!existsSync(f)) return catalogueSons = [];
  const [, ...lignes] = readFileSync(f, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  return catalogueSons = lignes.map(l => l.split(';')).map(c => ({ cat: c[0], nom: c[1], desc: c[2], duree: parseFloat((c[3] || '').replace(',', '.')), chemin: (c[7] || '').replace(/\\/g, '/').replace(/^C:\/tiktok\/chat\/sfx\//i, '') })).filter(s => s.chemin);
}

// ---------- les projets : tiktok-motion (Koan, Automobile) + ceux du studio ----------
function infoProjet(p, espace) {
  let mp4 = [], cover = null, date = 0;
  try { for (const f of readdirSync(join(p, 'out'))) { const fp = join(p, 'out', f), s = statSync(fp); date = Math.max(date, s.mtimeMs);
    if (f.endsWith('.mp4')) mp4.push(f); if (/couverture.*\.png$|^cover.*\.png$/i.test(f)) cover = 'out/' + f; } } catch {}
  if (!cover) { try { const c = readdirSync(join(p, 'out', 'cover')).find(f => f.endsWith('.png')); if (c) cover = 'out/cover/' + c; } catch {} }
  try { date = Math.max(date, statSync(p).mtimeMs); } catch {}
  return { nom: basename(p), chemin: p.replace(/\\/g, '/'), espace, titre: titreDe(p), pages: pages(p), mp4: mp4.length,
    final: mp4.some(f => /final|iphone/i.test(f)), couverture: cover, date, adaptateur: existsSync(join(ICI, 'adaptateurs', basename(p) + '.json')), lectureSeule: lectureSeule(p), studio: !lectureSeule(p) };
}
function catalogue() {
  const L = [];
  for (const [k, e] of Object.entries(ESPACES)) { try { for (const d of readdirSync(e.dossier, { withFileTypes: true })) if (d.isDirectory() && !/^[._]/.test(d.name)) L.push(infoProjet(join(e.dossier, d.name), k)); } catch {} }
  try { for (const d of readdirSync(PROJETS, { withFileTypes: true })) if (d.isDirectory() && !/^[._]/.test(d.name)) L.push(infoProjet(join(PROJETS, d.name), espaceDe(join(PROJETS, d.name)))); } catch {}
  if (ROOT && !L.some(x => resolve(x.chemin) === resolve(ROOT))) L.push({ ...infoProjet(ROOT, espaceDe(ROOT) || 'Automobile'), copie: true });
  return L.sort((a, b) => b.date - a.date);
}
const cheminCouverture = (p, rel) => `/__fichier?p=${encodeURIComponent(join(p, rel))}`;

// ---------- rendus : les vidéos du studio (out/<projet>/) et celles des projets (out/) ----------
function rendus(tous) {
  const L = [], ajoute = (dossier, projet) => { try { for (const f of readdirSync(dossier)) { if (!/\.(mp4|png)$/i.test(f) || f.startsWith('_')) continue; const fp = join(dossier, f), s = statSync(fp);
    if (!s.isFile()) continue; L.push({ nom: f, projet, chemin: fp.replace(/\\/g, '/'), taille: s.size, date: s.mtimeMs, type: /_tel/.test(f) ? 'téléphone' : /iphone/i.test(f) ? 'iPhone' : /couverture|cover/i.test(f) ? 'couverture' : /\.png$/i.test(f) ? 'image' : /final/i.test(f) ? 'final' : 'vidéo' }); } } catch {} };
  if (ROOT) { ajoute(join(ICI, 'out', NOM), NOM); ajoute(join(ROOT, 'out'), NOM); }
  if (tous) for (const p of catalogue()) if (resolve(p.chemin) !== resolve(ROOT || '')) ajoute(join(p.chemin, 'out'), p.nom);
  return L.sort((a, b) => b.date - a.date).slice(0, tous ? 120 : 400);
}
const fichierAutorise = p => [TM, ICI, PROJETS, DRIVE, ROOT].filter(Boolean).some(b => resolve(p).toLowerCase().startsWith(resolve(b).toLowerCase()));

// ---------- statistiques TikTok : la base locale de tiktok-tracker, en lecture seule ----------
function stats(compte) {
  if (!existsSync(STATS_DB)) return { erreur: 'base introuvable : ' + STATS_DB };
  const db = new DatabaseSync(STATS_DB, { readOnly: true });
  try {
    const comptes = db.prepare('select name, nickname, handle from accounts').all();
    const videos = db.prepare(`select v.video_id, v.description, v.published_at, v.duration_s, v.url, s.date, s.views, s.likes, s.comments, s.shares, s.saves, s.new_followers,
        s.avg_watch_time_s, s.finish_rate, s.rewards_total, s.rpm, s.qualified_views from videos v
      left join video_stats s on s.video_id = v.video_id and s.date = (select max(date) from video_stats where video_id = v.video_id)
      where v.account = ? and coalesce(v.private, 0) = 0 order by v.published_at desc`).all(compte);
    const maj = db.prepare("select value from meta where key like '%last%' or key like '%collect%' limit 1").get();
    return { comptes, videos, maj: maj?.value || null };
  } finally { db.close(); }
}
// ---------- versions d'un projet du studio (.studio/versions.json ; jamais dans un projet de tiktok-motion) ----------
// pas de fichier = V1 en brouillon. Une version publiée est figée (git : étiquette vN, vidéo publiée mise à l'abri) jusqu'à « Créer la V(n+1) ».
const FV = () => join(ROOT, '.studio', 'versions.json');
function versions() {
  if (!ROOT || LECTURE_SEULE) return { lectureSeule: true };
  let v = { courante: 1, publiees: [] }; try { v = { ...v, ...JSON.parse(readFileSync(FV(), 'utf8')) }; } catch {}
  return { ...v, figee: v.publiees.some(p => p.n === v.courante) };
}
const figee = () => { const v = versions(); return v.figee ? `V${v.courante} publiée, donc figée : crée la V${v.courante + 1} pour la modifier (la V${v.courante} reste intacte).` : null; };
// un lien propre seulement : jamais le lien de partage (vm.tiktok.com : son « _t » est lié au compte de Noam), et aucun appel réseau
function lienPublie(l) {
  l = String(l || '').trim();
  if (/vm\.tiktok\.com|vt\.tiktok\.com/i.test(l)) return { erreur: 'C\u2019est un lien de partage : ouvre la vidéo dans TikTok sur l\u2019ordinateur et copie l\u2019adresse de la page (tiktok.com/@compte/video/…).' };
  let m = /tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i.exec(l); if (m) return { plateforme: 'TikTok', compte: m[1], id: m[2], lien: `https://www.tiktok.com/@${m[1]}/video/${m[2]}` };
  m = /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([\w-]{11})/i.exec(l); if (m) return { plateforme: 'YouTube', id: m[1], lien: `https://www.youtube.com/watch?v=${m[1]}` };
  return { erreur: 'Lien non reconnu : il faut l\u2019adresse d\u2019une vidéo TikTok (tiktok.com/@compte/video/…) ou YouTube.' };
}
// la vidéo est-elle dans la base de tiktok-tracker ? (seule vérification possible sans réseau)
function dansStats(id) { if (!existsSync(STATS_DB)) return null; const db = new DatabaseSync(STATS_DB, { readOnly: true }); try { return db.prepare('select account from videos where video_id = ?').get(id)?.account || null; } finally { db.close(); } }
function publier(o) {
  const v = versions(); if (v.figee) return { erreur: `La V${v.courante} est déjà publiée.` };
  const L = lienPublie(o.lien); if (L.erreur) return L;
  const n = v.courante; CL.preparerGit(ROOT, `V${n} publiée`);
  const g = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim(); g('tag', '-f', `v${n}`);
  // la vidéo publiée, mise à l'abri : un export de la V suivante ne pourra pas l'écraser
  let fichier = null; const dOut = join(ICI, 'out', NOM);
  try { const m = readdirSync(dOut).filter(f => f.endsWith('.mp4') && !/^qa|plage_/i.test(f)).map(f => ({ f, t: statSync(join(dOut, f)).mtimeMs })).sort((a, b) => b.t - a.t)[0];
    if (m) { mkdirSync(join(ROOT, '.studio', 'versions'), { recursive: true }); fichier = join(ROOT, '.studio', 'versions', `v${n}.mp4`); if (!existsSync(fichier)) { try { linkSync(join(dOut, m.f), fichier); } catch { copyFileSync(join(dOut, m.f), fichier); } } } } catch {}
  const p = { n, date: new Date().toLocaleDateString('sv-SE'), ...L, commit: g('rev-parse', 'HEAD'), fichier: fichier && relative(ROOT, fichier).replace(/\\/g, '/'), stats: L.plateforme === 'TikTok' ? dansStats(L.id) : null };
  mkdirSync(join(ROOT, '.studio'), { recursive: true }); writeFileSync(FV(), JSON.stringify({ courante: n, publiees: [...v.publiees, p] }, null, 1));
  return { ok: true, version: p };
}
function nouvelleVersion() { const v = versions(); if (!v.figee) return { erreur: `La V${v.courante} n\u2019est pas publiée : continue de la modifier.` };
  writeFileSync(FV(), JSON.stringify({ courante: v.courante + 1, publiees: v.publiees }, null, 1)); return { ok: true, courante: v.courante + 1 }; }
function courbe(video) { const db = new DatabaseSync(STATS_DB, { readOnly: true }); try { return db.prepare("select second, value from video_curves where video_id = ? and kind = 'retention' order by second").all(video); } finally { db.close(); } }

// ---------- styles (DA), mémoire, réglages ----------
const SKILLS = join(TM, '.claude/skills');
function md(f) { const t = readFileSync(f, 'utf8'), m = /^---\n([\s\S]*?)\n---\n?/.exec(t.replace(/\r/g, '')), fm = {};
  if (m) for (const l of m[1].split('\n')) { const i = l.indexOf(':'); if (i > 0) fm[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1'); } return { fm, texte: m ? t.replace(/\r/g, '').slice(m[0].length) : t }; }
// la bibliothèque de DA : _styles/<id>/ = fiche.json (genre « da » ou « inspiration », famille, titre générique, statut, origine, exemples… + champs de Noam
// + « auto » écrit par clone-style.mjs), da.md (le look, lu par Claude), regles.md (règles mesurées d'une copie), skill de tiktok-motion éventuelle (fiche.skill).
// « projets » = ceux du studio dont project.json cite cette DA.
const CHAMPS_FICHE = ['titre', 'createur', 'pays', 'lien', 'compte', 'tags', 'notes', 'genre', 'famille', 'origine'];
const url = p => `/__fichier?p=${encodeURIComponent(p)}`;
function projetsParStyle() { const m = {}; try { for (const d of readdirSync(PROJETS)) { const pj = join(PROJETS, d, 'project.json'); if (d.startsWith('_') || !existsSync(pj)) continue;
  try { const o = JSON.parse(readFileSync(pj, 'utf8')); (m[o.style] ||= []).push({ nom: d, titre: o.titre || d, chemin: join(PROJETS, d).replace(/\\/g, '/') }); } catch {} } } catch {} return m; }
const lireFiche = d => { try { return JSON.parse(readFileSync(join(CL.STYLES, d, 'fiche.json'), 'utf8')); } catch { return {}; } };
function ecrireFiche(d, o) { mkdirSync(join(CL.STYLES, d), { recursive: true });   // seulement les champs de Noam : le reste appartient à importer-da.mjs et clone-style.mjs
  const f = lireFiche(d); for (const k of CHAMPS_FICHE) if (o[k] !== undefined) f[k] = k === 'tags' ? [].concat(o[k]).map(t => String(t).trim()).filter(Boolean) : String(o[k]).slice(0, 4000);
  writeFileSync(join(CL.STYLES, d, 'fiche.json'), JSON.stringify(f, null, 1)); }
function styles() { const P = projetsParStyle(); try { return readdirSync(CL.STYLES).filter(d => !d.startsWith('_') && ['fiche.json', 'regles.md'].some(x => existsSync(join(CL.STYLES, d, x)))).map(d => {
  const F = join(CL.STYLES, d), f = lireFiche(d), a = f.auto || {}, lit = x => existsSync(join(F, x)) ? readFileSync(join(F, x), 'utf8') : '';
  // la bible d'un compte : _styles/<id>/bible.md depuis le 26/10 (les DA ne sont plus des skills de tiktok-motion) ; l'ancienne skill en secours
  const regles = lit('regles.md'), skill = existsSync(join(F, 'bible.md')) ? md(join(F, 'bible.md')).texte : f.skill && existsSync(join(SKILLS, f.skill, 'SKILL.md')) ? md(join(SKILLS, f.skill, 'SKILL.md')).texte : '';
  return { id: d, genre: f.genre || 'da', famille: f.famille || a.famille || 'Copiées de vidéos', titre: f.titre || a.titre || d, statut: f.statut || (regles ? 'copiée' : ''), origine: f.origine || (f.createur ? 'Copiée de ' + f.createur : ''),
    nom: (f.titre || d) + (f.createur ? ' · ' + f.createur : ''), description: (a.en_bref || [])[0] || f.verdict || '', copie: !!regles, regles: (regles.match(/^\|\s*R\d+/gm) || []).length, projets: P[d] || [],
    textes: { da: lit('da.md'), skill, regles, compte: lit('compte.md') },
    fiche: { ...f, exemples: (f.exemples || []).map(x => ({ url: url(join(F, x)), video: /\.(mp4|webm|mov)$/i.test(x) })),
      auto: { ...a, apercu: (a.apercu || []).map(x => url(join(F, x))), videos: (a.videos || []).map(v => ({ ...v, url: url(v.video), nom: basename(v.video) })) } } }; })
    .sort((x, y) => RANG_STATUT.indexOf(x.statut) - RANG_STATUT.indexOf(y.statut) || x.titre.localeCompare(y.titre, 'fr')); } catch { return []; } }
// la page « Idées de niche » : niches.json du dernier lot (outils/niches-json.mjs), chaque compte cité relié à sa DA copiée
function niches() {
  const B = join(CL.STYLES, '_lots'); let d = null; try { d = readdirSync(B).filter(x => existsSync(join(B, x, 'niches.json'))).sort().at(-1); } catch {}
  if (!d) return { aucun: true };
  const N = JSON.parse(readFileSync(join(B, d, 'niches.json'), 'utf8')), da = {};
  for (const s of styles()) { const h = (s.fiche?.createur || '').replace(/^@/, ''); if (h) da[h.toLowerCase()] = { id: s.id, titre: s.titre, famille: s.famille, image: s.fiche?.auto?.apercu?.[1] || s.fiche?.auto?.apercu?.[0] || null }; }
  let rapport = ''; try { rapport = readFileSync(join(B, d, 'niches.md'), 'utf8'); } catch {}
  return { lot: d, ...N, da, rapport };
}
const RANG_STATUT = ['validée', 'utilisée', 'aimée', 'copiée', 'exemple', 'testée', 'idée', 'rejetée'];   // dans chaque famille : ce qui a marché d'abord
function memoire() { try { return readdirSync(MEMOIRE).filter(f => f.endsWith('.md') && f !== 'MEMORY.md').map(f => { const { fm, texte } = md(join(MEMOIRE, f)); return { fichier: f, nom: fm.name || f, description: fm.description || '', type: (fm.type || /type:\s*(\w+)/.exec(readFileSync(join(MEMOIRE, f), 'utf8'))?.[1] || ''), texte, date: statSync(join(MEMOIRE, f)).mtimeMs }; }).sort((a, b) => b.date - a.date); } catch { return []; } }
const REGLAGES = join(ICI, 'out', 'reglages.json');
const reglages = () => ({ workers: 2, ...(existsSync(REGLAGES) ? JSON.parse(readFileSync(REGLAGES, 'utf8')) : {}) });
function etatMachine() {
  const v = (cmd, a) => { try { return execFileSync(cmd, a, { encoding: 'utf8', timeout: 8000, shell: process.platform === 'win32' }).split('\n')[0].trim(); } catch { return null; } };
  return { node: process.version, ffmpeg: v('ffmpeg', ['-version'])?.replace(/ Copyright.*/, ''), claude: v('claude', ['--version']), cles: { GEMINI_API_KEY: !!process.env.GEMINI_API_KEY, FREESOUND_API_KEY: !!process.env.FREESOUND_API_KEY },
    chemins: { 'tiktok-motion': existsSync(TM), 'pack de sons': existsSync(SFX), 'Drive (copie des livrables)': existsSync(DRIVE), 'statistiques TikTok': existsSync(STATS_DB) }, sons: sons().length };
}
let machine = null;

// ---------- sous-titres .srt depuis les mots calés (lignes de 4 mots ou 1,6 s) ----------
function srt(mots, t0 = 0, t1 = 1e9) {
  const L = []; let cur = [];
  for (const w of mots.filter(w => w.start >= t0 && w.start < t1)) { if (cur.length && (cur.length >= 4 || w.start - cur[0].start > 1.6)) { L.push(cur); cur = []; } cur.push(w); }
  if (cur.length) L.push(cur);
  const tc = s => { s = Math.max(0, s - t0); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x.toFixed(3).padStart(6, '0').replace('.', ',')}`; };
  return L.map((l, i) => `${i + 1}\n${tc(l[0].start)} --> ${tc(Math.max(l.at(-1).end, l[0].start + .3))}\n${l.map(w => w.w).join(' ')}\n`).join('\n');
}

createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
  try {
    if (p === '/') { res.writeHead(302, { Location: '/__studio/' }); return res.end(); }
    if (p.startsWith('/__studio/')) {
      const f = p === '/__studio/' ? join(ICI, 'ui', 'index.html') : p === '/__studio/qa-page.js' ? join(ICI, 'lib', 'qa-page.js') : sous(join(ICI, 'ui'), p.slice(9));
      if (f && fichier(req, res, f, { 'Cache-Control': 'no-store' })) return;
    }
    if (p.startsWith('/__qa/') && QA) { const f = sous(QA, p.slice(5)); if (f && fichier(req, res, f, { 'Cache-Control': 'no-store' })) return; }
    if (p.startsWith('/__sfx/')) { const f = sous(SFX, p.slice(6)); if (f && fichier(req, res, f)) return; }
    if (p === '/__fichier') { const f = u.searchParams.get('p'); if (f && fichierAutorise(f) && fichier(req, res, f)) return; res.writeHead(404); return res.end(); }

    // --- API ---
    if (p === '/__api/projet') {
      if (!ROOT) return json(res, { aucun: true });
      const rapport = await lireJson(join(QA, 'rapport.json')), traj = await lireJson(join(QA, 'traj.json'));
      const script = ['script.md', 'docs/script.md', 'script-truman-final.md'].find(f => existsSync(join(ROOT, f))) || readdirSync(ROOT).filter(f => /^script.*\.md$/.test(f)).sort().at(-1) || null;
      const storyboard = ['storyboard.md', 'docs/storyboard.md', 'decoupage.md'].find(f => existsSync(join(ROOT, f))) || null;
      const ex = x => !!x && existsSync(resolve(ROOT, x)), mt = x => ex(x) ? statSync(resolve(ROOT, x)).mtimeMs : 0, propre = 'audio/voice_clean.wav';
      const etapes = { script: !!script, voix: ex('audio/voice.wav') || ex(A.voix) || !!A.mix, nettoyage: ex(propre) || !!A.mix, calage: ex(A.mots), storyboard: !!storyboard,
        scenes: !!A.page && existsSync(resolve(ROOT, A.page)), controle: !!rapport, son: existsSync(join(ROOT, 'cues.json')) && !!A.mix, export: existsSync(join(ICI, 'out', NOM, NOM + '.mp4')),
        perime: LECTURE_SEULE ? {} : { nettoyage: mt(propre) > 0 && mt('audio/voice.wav') > mt(propre), calage: mt(A.mots) > 0 && mt(propre) > mt(A.mots), son: mt(A.mix) > 0 && Math.max(mt(propre), mt('cues.json')) > mt(A.mix) } };   // une étape d'avant a changé : à refaire
      const espace = espaceDe(ROOT) || (cfg.adaptateur ? 'Automobile' : null);
      return json(res, { versions: versions(), nom: NOM, titre: titreDe(ROOT) || NOM, projet: ROOT, page: A.page, pages: pages(ROOT), fps: A.fps, shutter: A.shutter, sujets: A.sujets, sol: A.sol ?? null, lectureSeule: LECTURE_SEULE,
        espace, style: A.style || (espace && ESPACES[espace]?.da) || null, zone: ZONE, mix: ecoute(), mixV: Math.round(mt(ecoute())), script, storyboard,
        mots: (await lireJson(A.mots && resolve(ROOT, A.mots)))?.words || [], cues: await lireJson(join(ROOT, 'cues.json')), rapport, traj, etapes, tache: tache?.nom || null, reglages: reglages(), sections: A.page === 'moteur/page.html' ? (await lireJson(join(ROOT, 'project.json')))?.plans || [] : null });   // relu à chaque fois : le directeur l'écrit pendant la construction
    }
    if (p === '/__api/catalogue') return json(res, catalogue().map(x => ({ ...x, couverture: x.couverture && cheminCouverture(x.chemin, x.couverture) })));
    if (p === '/__api/ouvrir' && req.method === 'POST') {
      const o = JSON.parse(await corps(req)); if (!o.chemin || !existsSync(o.chemin)) return json(res, { erreur: 'projet introuvable' }, 404);
      const ad = join(ICI, 'adaptateurs', basename(o.chemin) + '.json');
      ouvrir({ projet: resolve(o.chemin), adaptateur: existsSync(ad) ? ad : null, page: o.page || null }); return json(res, { ok: true });
    }
    if (p === '/__api/nouveau' && req.method === 'POST') {   // un projet vide, à la structure du cahier (§3) ; la suite (voix, scènes) viendra avec Claude
      const o = JSON.parse(await corps(req)), slug = (o.titre || 'projet').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'projet';
      const d = join(PROJETS, slug); if (existsSync(d)) return json(res, { erreur: 'ce projet existe déjà' }, 409);
      for (const s of ['audio', 'scenes', 'assets/img', 'assets/models', 'qa', 'out']) await mkdir(join(d, s), { recursive: true });
      await writeFile(join(d, 'project.json'), JSON.stringify({ titre: o.titre, espace: o.espace, style: o.style, format: o.format || '9:16', fps: 30, duree: o.duree || null, direction: o.direction || '', plans: [] }, null, 1));
      await writeFile(join(d, 'script.md'), `# ${o.titre}\n\n${o.script || ''}\n`); await writeFile(join(d, 'cues.json'), JSON.stringify({ sfx: [] }));
      CL.nouveauGit(d, { titre: o.titre, page: 'moteur/page.html', espace: o.espace, style: o.style });
      ouvrir({ projet: d, adaptateur: null }); return json(res, { ok: true, chemin: d });
    }
    if (p === '/__api/onde') return json(res, ROOT ? await onde() : null);
    if (p === '/__api/sons') { const q = (u.searchParams.get('q') || '').toLowerCase().split(/\s+/).filter(Boolean);
      return json(res, sons().filter(s => q.every(m => (s.cat + ' ' + s.nom + ' ' + s.desc).toLowerCase().includes(m))).slice(0, 150)); }
    if (p === '/__api/rendus') return json(res, rendus(u.searchParams.has('tous')).map(r => ({ ...r, url: `/__fichier?p=${encodeURIComponent(r.chemin)}` })));
    if (p === '/__api/stats') { const c = u.searchParams.get('compte') || 'koan'; return json(res, stats(c)); }
    if (p === '/__api/courbe') return json(res, courbe(u.searchParams.get('video')));
    if (p === '/__api/bibliotheque') {   // la bibliothèque commune (phase 6) ; « dans » = déjà copié dans le projet ouvert
      const x = BIB.index(); return json(res, { ...x, elements: x.elements.map(e => ({ ...e, dans: !!ROOT && existsSync(join(ROOT, 'assets', 'bib', e.nom)) })), modifiable: !!ROOT && !LECTURE_SEULE && A.page === 'moteur/page.html' });
    }
    if (p === '/__api/bibliotheque/ajouter' && req.method === 'POST') {
      if (LECTURE_SEULE || A.page !== 'moteur/page.html') return json(res, { erreur: 'La bibliothèque s\u2019ajoute à un projet créé dans le studio (moteur du studio).' }, 403);
      if (figee()) return json(res, { erreur: figee() }, 403);
      try { return json(res, BIB.ajouter(ROOT, JSON.parse(await corps(req)).nom)); } catch (e) { return json(res, { erreur: e.message }, 400); }
    }
    if (p === '/__api/credits') return json(res, ROOT ? BIB.credits(ROOT) : {});
    if (p.startsWith('/__bib/')) { const f = sous(join(BIB.BIB, 'elements'), p.slice(6)); if (f && /\.(webp|png)$/.test(f) && fichier(req, res, f, { 'Cache-Control': 'no-cache' })) return; res.writeHead(404); return res.end(); }
    if (p === '/__api/styles') return json(res, styles());
    if (p === '/__api/lot') return json(res, lot(u.searchParams.get('d')));
    if (p === '/__api/niches') return json(res, niches());
    if (p === '/__api/styles/televerser' && req.method === 'POST') {   // une vidéo de référence glissée dans la page Styles -> _styles/<nom>/sources/
      const nom = u.searchParams.get('nom') || '', f = basename(u.searchParams.get('f') || ''); if (!/^[a-z0-9-]+$/.test(nom) || !/\.(mp4|mov|webm|mkv)$/i.test(f)) return json(res, { erreur: 'nom ou fichier invalide' }, 400);
      const d = join(CL.STYLES, nom, 'sources'); await mkdir(d, { recursive: true }); const ch = join(d, f);
      await new Promise((ok, ko) => { const w = createWriteStream(ch); req.pipe(w); w.on('finish', ok); w.on('error', ko); }); return json(res, { ok: true, chemin: ch });
    }
    if (p === '/__api/styles/copier' && req.method === 'POST') {
      const o = JSON.parse(await corps(req)); if (!/^[a-z0-9-]+$/.test(o.nom || '')) return json(res, { erreur: 'nom : minuscules, chiffres, tirets' }, 400);
      const ch = (o.chemins || []).filter(c => /^https?:\/\//i.test(c) || existsSync(c));   // liens : téléchargés par clone-style.mjs if (!ch.length || ch.length > 7) return json(res, { erreur: '1 à 7 vidéos de référence' }, 400);
      if (tache || CL.enCours() || EQ.active()) return json(res, { erreur: 'une tâche tourne déjà' });
      if (o.fiche) ecrireFiche(o.nom, o.fiche);   // créateur, pays, lien… avant la copie (clone-style.mjs ne touche que « auto »)
      return json(res, lance('copie de style', ['outils/clone-style.mjs', o.nom, ...ch, ...(o.ajouter ? ['--ajouter'] : [])]) ? { ok: true } : { erreur: 'une tâche tourne déjà' }, 200);
    }
    if (p === '/__api/styles/fiche' && req.method === 'POST') {   // la fiche d'une DA, modifiée dans la page DA
      const o = JSON.parse(await corps(req)); if (!/^[a-z0-9-]+$/.test(o.id || '') || !['fiche.json', 'regles.md'].some(x => existsSync(join(CL.STYLES, o.id, x)))) return json(res, { erreur: 'DA inconnue' }, 404);
      ecrireFiche(o.id, o); return json(res, { ok: true });
    }
    if (p === '/__api/memoire') return json(res, memoire());
    if (p === '/__api/regles') {   // les règles retenues depuis le studio (bouton « Retenir » de Claude)
      const lignes = f => CL.lignesRegles(f);
      let styles = {}; try { for (const d of readdirSync(CL.STYLES)) styles[d] = lignes(join(CL.STYLES, d, 'regles.md')); } catch {}
      return json(res, { projet: ROOT ? lignes(join(ROOT, '.studio', 'memoire.md')) : [], nom: NOM, styles });
    }
    if (p === '/__api/reglages') { if (req.method === 'POST') { const o = JSON.parse(await corps(req)); writeFileSync(REGLAGES, JSON.stringify({ ...reglages(), ...o }, null, 1)); }
      return json(res, { reglages: reglages(), machine: machine ||= etatMachine(), zone: ZONE }); }
    if (p === '/__api/texte') { const f = u.searchParams.get('f'), fp = f && ROOT && sous(ROOT, '/' + f); if (fp && existsSync(fp)) return json(res, { texte: await readFile(fp, 'utf8') }); return json(res, { erreur: 'introuvable' }, 404); }
    if (p === '/__api/dossier' && req.method === 'POST') { const o = JSON.parse(await corps(req)), d = o.chemin || ROOT; if (d && fichierAutorise(d)) execFile('explorer.exe', [resolve(d)]); return json(res, { ok: true }); }
    if (p === '/__api/versions') {
      if (req.method !== 'POST') { const v = versions(); return json(res, { ...v, publiees: (v.publiees || []).map(x => ({ ...x, stats: x.stats || (x.plateforme === 'TikTok' ? dansStats(x.id) : null) })) }); }
      if (LECTURE_SEULE) return json(res, { erreur: 'projet de tiktok-motion : lecture seule' }, 403);
      if (tache || CL.enCours() || EQ.active()) return json(res, { erreur: 'une tâche tourne : réessaie à la fin' }, 409);
      const o = JSON.parse(await corps(req)); return json(res, o.action === 'publier' ? publier(o) : o.action === 'nouvelle' ? nouvelleVersion() : { erreur: '?' });
    }
    if (p === '/__api/cues' && req.method === 'POST') {
      if (LECTURE_SEULE) return json(res, { erreur: 'projet de tiktok-motion : lecture seule' }, 403);
      if (figee()) return json(res, { erreur: figee() }, 403);
      const c = JSON.parse(await corps(req)); if (!Array.isArray(c.sfx)) return json(res, { erreur: 'cues invalide' }, 400);
      await writeFile(join(ROOT, 'cues.json'), JSON.stringify(c, null, 0).replace(/\},\{/g, '},\n{')); return json(res, { ok: true });
    }
    // la timeline façon CapCut : bornes des plans (project.json) et temps des mots (words.json) ; refus si une tâche tourne (le directeur réécrit project.json)
    if ((p === '/__api/plans' || p === '/__api/mots') && req.method === 'POST') {
      if (LECTURE_SEULE) return json(res, { erreur: 'projet de tiktok-motion : lecture seule' }, 403);
      if (figee()) return json(res, { erreur: figee() }, 403);
      if (tache || CL.enCours() || EQ.active()) return json(res, { erreur: 'une tâche tourne : réessaie à la fin' }, 409);
      const o = JSON.parse(await corps(req)), proche = (a, b) => Math.abs(a - b) < 1e-3, fini = x => Number.isFinite(x) && x >= 0;
      if (p === '/__api/plans') {
        if (A.page !== 'moteur/page.html') return json(res, { erreur: 'seulement pour un projet créé dans le studio' }, 400);
        const f = join(ROOT, 'project.json'), pj = JSON.parse(readFileSync(f, 'utf8')), C = o.changements || [];
        for (const c of C) { const s = pj.plans?.find(x => x.id === c.id);
          if (!s || !proche(s.t0, c.avant.t0) || !proche(s.t1, c.avant.t1)) return json(res, { erreur: 'project.json a changé entre-temps : recharge la page' }, 409);
          if (!fini(c.t0) || !(c.t1 > c.t0)) return json(res, { erreur: 'bornes invalides' }, 400); }
        if (!C.length) return json(res, { ok: true });
        for (const c of C) Object.assign(pj.plans.find(x => x.id === c.id), { t0: c.t0, t1: c.t1 });
        writeFileSync(f, JSON.stringify(pj, null, 1) + (readFileSync(f, 'utf8').endsWith('\n') ? '\n' : '')); return json(res, { ok: true });
      }
      const f = resolve(ROOT, A.mots || 'audio/words.json'), ancien = JSON.parse(readFileSync(f, 'utf8')), W = Array.isArray(ancien) ? ancien : ancien.words, M = o.mots;
      // seulement les temps : mêmes mots, dans le même ordre
      if (!Array.isArray(M) || M.length !== W.length || M.some((m, i) => m.w !== W[i].w || !fini(m.start) || !(m.end >= m.start))) return json(res, { erreur: 'mots invalides' }, 400);
      const N = W.map((w, i) => ({ ...w, start: M[i].start, end: M[i].end }));
      writeFileSync(f, JSON.stringify(Array.isArray(ancien) ? N : { ...ancien, words: N }, null, 1)); return json(res, { ok: true });
    }
    if (p === '/__api/tache' && req.method === 'POST') {
      const o = JSON.parse(await corps(req)), ad = existsSync(AF) ? ['--adaptateur', AF] : [], R = reglages();
      if (o.type === 'annuler') { if (tache) { tache.annule = true; tache.p.kill(); } return json(res, { ok: true }); }
      if (['voix', 'nettoyer', 'caler', 'mixer'].includes(o.type)) {   // la chaîne du son (outils/son.py) ; ensuite l'adaptateur est relu (mots, mix, stems)
        if (LECTURE_SEULE) return json(res, { erreur: 'projet de tiktok-motion : lecture seule (« Copier dans le studio » d’abord)' }, 403);
        if (figee()) return json(res, { erreur: figee() }, 403);
        return json(res, { ok: lance(o.type, ['outils/son.py', o.type, ROOT], async () => ouvrir(cfg)) });
      }
      if (!A.page) return json(res, { erreur: 'pas encore de scène dans ce projet' }, 400);
      const nom = o.nom || NOM, plage = o.from != null ? ['--from', String(o.from), '--to', String(o.to)] : [];
      const args = o.type === 'controle' ? ['check.mjs', ROOT, ...ad, '--name', NOM, '--workers', String(R.workers)]
        : o.type === 'export' ? ['render.mjs', ROOT, A.page, '--name', nom, '--shutter', String(A.shutter), '--workers', String(R.workers), ...plage, ...(o.tel ? ['--tel'] : []), ...(o.iphone ? ['--iphone'] : []), ...(ecoute() ? ['--audio', resolve(ROOT, ecoute())] : [])]
        : o.type === 'couverture' ? ['render.mjs', ROOT, A.page, '--cover', '--name', nom, ...(o.at != null ? ['--at', String(o.at)] : [])] : null;
      if (!args) return json(res, { erreur: 'tâche inconnue' }, 400);
      const apres = o.type === 'export' ? async () => {
        const dossier = join(ICI, 'out', NOM);
        if (o.srt && A.mots) { const m = (await lireJson(resolve(ROOT, A.mots)))?.words || []; await writeFile(join(dossier, nom + '.srt'), srt(m, o.from ?? 0, o.to ?? 1e9)); diffuse('journal', `✓ ${nom}.srt`); }
        if (o.couverture) await new Promise(ok => spawn(process.execPath, ['render.mjs', ROOT, A.page, '--cover', '--name', nom], { cwd: ICI }).on('close', ok)).then(() => diffuse('journal', `✓ ${nom} - couverture.png`));
        const c = BIB.credits(ROOT);   // crédits pour la description : seulement ce que les scènes utilisent, licences connues seulement
        if (c.lignes.length || c.a_verifier.length) { await writeFile(join(dossier, nom + ' - credits.txt'), [c.texte, ...c.a_verifier.map(x => '⚠ ' + x)].filter(Boolean).join('\n') + '\n'); diffuse('journal', `✓ ${nom} - credits.txt${c.a_verifier.length ? ` (${c.a_verifier.length} à vérifier)` : ''}`); }
      } : null;
      return json(res, { ok: lance(o.type, args, apres) });
    }
    // --- Claude dans le studio ---
    if (p === '/__api/copier' && req.method === 'POST') {
      const d = CL.copier(ROOT, { adaptateur: existsSync(AF) ? JSON.parse(readFileSync(AF, 'utf8')) : { page: A.page, mots: A.mots, mix: A.mix }, titre: titreDe(ROOT) || NOM, page: A.page, espace: espaceDe(ROOT), style: A.style || ESPACES[espaceDe(ROOT)]?.da });
      ouvrir({ projet: d, adaptateur: null, page: cfg.page }); return json(res, { ok: true, chemin: d });
    }
    if (p.startsWith('/__api/claude')) {
      const action = p.slice(14), dir = ROOT, style = A.style || ESPACES[espaceDe(ROOT)]?.da;
      if (action === 'historique') return json(res, existsSync(join(dir, '.studio')) ? CL.historique(dir) : []);
      if (action === 'diff') { const e = CL.historique(dir).find(x => x.id === u.searchParams.get('id')); return json(res, e?.hash ? { texte: CL.diff(dir, e.hash) } : { erreur: 'pas de changement' }); }
      if (req.method !== 'POST') return json(res, { erreur: '?' }, 404);
      const o = JSON.parse(await corps(req) || '{}');
      if (action === 'stop') return json(res, { ok: CL.arreter() });
      if (LECTURE_SEULE) return json(res, { erreur: 'Projet de tiktok-motion en lecture seule : « Copier dans le studio » avant de demander à Claude.' }, 403);
      if (action === 'nouvelle') { CL.nouvelleSession(dir); return json(res, { ok: true }); }
      if (action === 'retenir') return json(res, { ok: true, fichier: CL.retenir(dir, style, o.regle, o.portee) });
      if ((action === 'annuler' || action === '') && figee()) return json(res, { erreur: figee() }, 403);
      if (action === 'annuler') { const r = CL.annuler(dir, o.id); if (r.ok) diffuse('recharge', 'annulation'); return json(res, r); }
      if (action === 'apres') { CL.apres(dir, o.id, o.image); return json(res, { ok: true }); }
      if (action === '') {
        if (tache) return json(res, { erreur: 'Une tâche tourne (' + tache.nom + ') : attends sa fin.' }, 409);
        if (EQ.active()) return json(res, { erreur: 'L’équipe construit la vidéo : attends la fin.' }, 409);
        if (!existsSync(join(dir, '.git'))) CL.preparerGit(dir, 'État de départ');
        // les plans : les sections de project.json (moteur du studio), sinon ceux du contrôle (même numérotation que la liste de l'éditeur)
        const sec = A.page === 'moteur/page.html' ? (await lireJson(join(ROOT, 'project.json')))?.plans : null, mots = sec ? (await lireJson(resolve(ROOT, A.mots || 'audio/words.json')))?.words || [] : [];
        const plans = sec ? sec.map((s, i) => ({ n: i + 1, t0: s.t0, t1: s.t1, texte: mots.filter(m => m.start >= s.t0 && m.start < s.t1).map(m => m.w).join(' '), fichier: s.fichier })) : (await lireJson(join(QA, 'rapport.json')))?.plans || [];
        const cible = o.cible?.nom && A.sujets?.[o.cible.nom] ? { ...o.cible, expr: A.sujets[o.cible.nom] } : o.cible;
        const info = { titre: titreDe(dir) || NOM, page: A.page, espace: espaceDe(dir), style };
        const id = CL.demander({ ...o, cible }, { dir, style, plans, info }, (type, data) => {
          diffuse(type, data);
          if (data.type === 'fin') { if (data.entree.fichiers?.length || aRecharger) diffuse('recharge', aRecharger || 'Claude'); aRecharger = null; }
        });
        return json(res, id ? { ok: true, id } : { erreur: 'Claude travaille déjà' }, id ? 200 : 409);
      }
    }
    if (p.startsWith('/__api/construire')) {   // la construction en équipe (phase 5)
      const action = p.slice(18), dir = ROOT;
      if (action === 'etat') { let reglages = {}; try { reglages = JSON.parse(readFileSync(join(dir, '.studio', 'reglages.json'), 'utf8')); } catch {}
        return json(res, { etat: EQ.etat(), historique: dir && existsSync(join(dir, '.studio')) ? EQ.historique(dir) : [], reglages, genres: EQ.genres(), budgets: EQ.BUDGETS }); }
      if (req.method !== 'POST') return json(res, { erreur: '?' }, 404);
      const o = JSON.parse(await corps(req) || '{}');
      if (action === 'stop') return json(res, { ok: EQ.arreter() });
      if (action === 'continuer') return json(res, { ok: EQ.continuer(o) });
      if (LECTURE_SEULE || A.page !== 'moteur/page.html') return json(res, { erreur: 'La construction en équipe marche sur un projet créé dans le studio (moteur du studio).' }, 403);
      if (figee()) return json(res, { erreur: figee() }, 403);
      if (action === 'annuler') { const r = EQ.annuler(dir, o.id); if (r.ok) diffuse('recharge', 'annulation'); return json(res, r); }
      if (action === '') {
        if (tache || CL.enCours() || EQ.active()) return json(res, { erreur: 'Claude ou une tâche travaille déjà : attends la fin.' }, 409);
        EQ.construire(dir, o, d => { diffuse('equipe', d); if (d.type === 'fin') { diffuse('recharge', 'construction'); aRecharger = null; } });
        return json(res, { ok: true });
      }
    }
    if (p === '/__api/flux') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' }); res.write(': ok\n\n');
      clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    // --- le projet, à la racine ; ?studio sur une page : on injecte l'instrumentation avant tout script de la scène ---
    const ext = extname(p).toLowerCase();
    for (const base of [ROOT, TM].filter(Boolean)) {
      const f = sous(base, p); if (!f || !existsSync(f)) continue;
      if (ext === '.html' && u.searchParams.has('studio')) {
        const h = await readFile(f, 'utf8'); res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        return res.end(h.replace(/<script/i, '<script src="/__studio/qa-page.js"></script><script'));
      }
      if (fichier(req, res, f, { 'Cache-Control': LOURD.has(ext) ? 'max-age=86400' : 'no-store' })) return;   // modèles et images en cache : un rechargement est rapide
    }
    if (p.startsWith('/node_modules/') && fichier(req, res, join(ICI, p))) return;
    res.writeHead(404); res.end();
  } catch (e) { console.error(e); if (!res.headersSent) json(res, { erreur: e.message }, 500); }
}).listen(Number(opt('port', 5170)), '127.0.0.1', () => console.log(`Studio : http://localhost:${opt('port', 5170)}  ·  projet ${ROOT || '(aucun)'}${LECTURE_SEULE ? ' (lecture seule)' : ''}`));
