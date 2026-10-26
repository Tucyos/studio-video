// claude.mjs : Claude Code dans le studio. Une session par projet (claude -p, abonnement de Noam), un commit git par demande,
// « Voir les changements », « Annuler » (git revert), « Retenir » (règles relues à chaque demande).
// Les projets modifiables vivent hors du dépôt du logiciel (C:/claude/studio-projets) : Claude n'y voit que le CLAUDE.md du projet.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, cpSync, statSync, symlinkSync, realpathSync } from 'node:fs';
import { join, basename, relative, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PLUGIN, LIRE_PLUGIN, generer } from './skills.mjs';

export const STUDIO_PROJETS = 'C:/claude/studio-projets';
const ICI = join(import.meta.dirname, '..'), TM_SKILLS = 'C:/claude/tiktok-motion/.claude/skills';
const git = (dir, ...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', maxBuffer: 1e8 }).trim();
const IGNORE = ['out/', 'qa/', '.studio/', 'node_modules/', 'assets/', '*.glb', '*.wav', '*.mp3', '*.mp4', '*.hdr', '*.ktx2'].join('\n') + '\n';

// ---------- un projet modifiable : git local, CLAUDE.md du projet, références ----------
export function claudeMd({ titre, page, espace, style }) {
  return `# ${titre} — projet vidéo édité depuis le studio de Noam

Réponds toujours en français, en phrases courtes. Noam n'est pas développeur : il juge sur les images et la vidéo.

## Le moteur
${page === 'moteur/page.html' ? "- **Lis d'abord `references/moteur.md`** : le moteur du studio, les sections `scenes/sNN_nom.js`, le kit `k`.\n" : ''}- La vidéo est la page \`${page || 'scenes/<scène>.html'}\` : un \`<canvas id="c">\` 1080×1920, \`window.READY\`, \`window.SCENE = {from, to, sub}\`, \`window.seek(T)\`.
- **Tout est une fonction pure du temps T** : aucun état d'une image à l'autre, aléatoire avec graine (\`hash\`), jamais \`Math.random\`.
- Les coupes tombent sur la grille des images : \`Math.round(t*30)/30\`.

## Vérifier son travail (obligatoire avant de répondre)
- Images à des instants précis (en secondes) : \`node .studio/rendre.mjs 12.5 30 31.2\` → \`qa/snaps/t12.500.png\`…, puis **regarde les PNG avec Read**.
- Contrôles automatiques sur une plage : \`node .studio/controler.mjs 30 43\` → \`qa/rapport.json\` (à-coups, zone sûre, textes, objets…).
- Seules ces deux commandes \`node .studio/…\` et ffprobe sont permises (pas d'autre script, pas de git).
- Zone sûre TikTok (iPhone de Noam, en pixels 1080×1920) : le texte reste entre y = 250 et y = 1680, entre x = 60 et x = 1020, et à gauche de x = 895 sous y = 730 (boutons).

## Règles
- Ne change que ce qui est demandé. Garde la direction artistique${style ? ` (\`references/${style}.md\`)` : ''}.
- **Ne fais jamais de commit git** : le studio fait un commit par demande et sait l'annuler.
- Reste dans ce dossier.
- Aucune donnée personnelle dans une requête réseau (ni e-mail ni nom, même dans un User-Agent).
- Images et modèles : sources libres (Wikimedia, CC0, CC-BY), crédit noté dans \`assets/credits.json\`.
- Termine par un résumé de 2-3 phrases : ce que tu as changé, ce que tu as vérifié (instants regardés), ce qui reste douteux.
- Si une règle générale se dégage de la demande, ajoute une dernière ligne : \`RÈGLE : …\` (une phrase).

## Savoir-faire
- Le savoir-faire du studio est en skills \`studio:…\` (script, hook, découpage, moteur, mouvement, son, contrôle, résultats, niches). **Commence par la skill \`studio:studio\`** : elle dit lesquelles charger selon la demande.
- Les réglages du projet (genre, ton) sont dans \`.studio/reglages.json\` quand il existe : respecte-les.
- La direction artistique du projet est dans \`references/\`${style ? ` (\`references/${style}.md\`)` : ''}.

Compte : ${espace || '?'}.
`;
}
// les commandes de vérification vivent dans le projet : une commande qui cite un chemin hors du projet serait refusée à Claude
export function outils(dir) {
  mkdirSync(join(dir, '.studio'), { recursive: true });
  const studio = ICI.split(sep).join('/');   // lib/agents/*.mjs : rendre, contrôler (sous le verrou GPU), télécharger
  for (const f of ['rendre.mjs', 'controler.mjs', 'telecharger.mjs', 'bibliotheque.mjs']) writeFileSync(join(dir, '.studio', f), readFileSync(join(ICI, 'lib', 'agents', f), 'utf8').replaceAll('__STUDIO__', studio)); for (const f of ['rendre.mjs', 'controler.mjs', 'telecharger.mjs', 'bibliotheque.mjs']) execFileSync(process.execPath, ['--check', join(dir, '.studio', f)]);   // un script cassé ferait échouer les agents en silence (vu : controler.mjs, phase 5)
}
export function preparerGit(dir, message) {
  if (!existsSync(join(dir, '.git'))) { git(dir, 'init', '-q'); git(dir, 'config', 'user.name', 'Studio'); git(dir, 'config', 'user.email', 'studio@local'); }
  const gi = join(dir, '.gitignore'); if (!existsSync(gi)) writeFileSync(gi, IGNORE);
  git(dir, 'add', '-A'); if (git(dir, 'status', '--porcelain')) git(dir, 'commit', '-q', '-m', message);
}
function references(dir, style) {
  mkdirSync(join(dir, 'references'), { recursive: true });
  if (!style) return;
  // la DA du projet (bibliothèque de DA), en un seul fichier : son look (da.md), sa bible si c'est une skill de tiktok-motion, ses règles (chiffrées ou retenues)
  const D = join(STYLES, style), lit = f => existsSync(f) ? readFileSync(f, 'utf8') : null;
  let skill = style; try { skill = JSON.parse(readFileSync(join(D, 'fiche.json'), 'utf8')).skill || style; } catch {}
  const t = [lit(join(D, 'da.md')), lit(join(D, 'bible.md')) || lit(join(TM_SKILLS, skill, 'SKILL.md')), lit(join(D, 'son.md')), lit(join(D, 'regles.md'))].filter(Boolean);   // bible.md : la bible d'un compte (26/10, les DA ne sont plus des skills)
  if (t.length) writeFileSync(join(dir, 'references', style + '.md'), t.join('\n\n---\n\n'));
}
// copie d'un projet de tiktok-motion (lecture seule) dans studio-projets : on travaille sur la copie, jamais sur l'original
export function copier(src, { adaptateur, titre, page, espace, style }) {
  mkdirSync(STUDIO_PROJETS, { recursive: true });
  let nom = basename(src) + '-studio', d = join(STUDIO_PROJETS, nom), k = 2;
  while (existsSync(d)) { nom = `${basename(src)}-studio-${k++}`; d = join(STUDIO_PROJETS, nom); }
  cpSync(src, d, { recursive: true, filter: s => { const r = relative(src, s).split(sep); return !(r[0] === 'node_modules' || r[0] === '.git' || (r[0] === 'out' && /\.(mp4|png|jpg)$/i.test(s))); } });
  if (existsSync(join(src, 'node_modules'))) symlinkSync(realpathSync(join(src, 'node_modules')), join(d, 'node_modules'), 'junction');   // même node_modules que l'original (polices, three), sans copie
  mkdirSync(join(d, '.studio'), { recursive: true });
  if (adaptateur) writeFileSync(join(d, '.studio', 'adaptateur.json'), JSON.stringify(adaptateur, null, 1));
  writeFileSync(join(d, '.studio', 'origine.txt'), src);
  references(d, style); outils(d); writeFileSync(join(d, 'CLAUDE.md'), claudeMd({ titre, page, espace, style }));
  preparerGit(d, 'Copie depuis tiktok-motion : ' + src);
  return d;
}
// le moteur des nouveaux projets (moteur/ du studio, copié avec son numéro de version) + son mode d'emploi pour Claude
export function installerMoteur(dir) {
  cpSync(join(ICI, 'moteur'), join(dir, 'moteur'), { recursive: true, filter: s => !s.endsWith('.md') });
  mkdirSync(join(dir, 'references'), { recursive: true }); cpSync(join(ICI, 'moteur', 'moteur.md'), join(dir, 'references', 'moteur.md'));
  const af = join(dir, '.studio', 'adaptateur.json'); mkdirSync(join(dir, '.studio'), { recursive: true });
  if (!existsSync(af)) writeFileSync(af, JSON.stringify({ page: 'moteur/page.html', shutter: .5, mots: 'audio/words.json' }, null, 1));
}
export function nouveauGit(dir, info) { installerMoteur(dir); references(dir, info.style); outils(dir); writeFileSync(join(dir, 'CLAUDE.md'), claudeMd(info)); mkdirSync(join(dir, '.studio'), { recursive: true }); preparerGit(dir, 'Nouveau projet'); }

// ---------- historique, session, mémoire ----------
const HIST = dir => join(dir, '.studio', 'historique.json');
export const historique = dir => existsSync(HIST(dir)) ? JSON.parse(readFileSync(HIST(dir), 'utf8')) : [];
const sauverHist = (dir, h) => { mkdirSync(join(dir, '.studio'), { recursive: true }); writeFileSync(HIST(dir), JSON.stringify(h, null, 1)); };
function session(dir, nouvelle) {
  const f = join(dir, '.studio', 'session.json');
  if (!nouvelle && existsSync(f)) { const s = JSON.parse(readFileSync(f, 'utf8')); return { ...s, reprise: s.ouverte ?? historique(dir).some(e => e.reponse) }; }   // anciens projets : ouverte si une demande a répondu
  const s = { id: randomUUID(), debut: Date.now() }; mkdirSync(join(dir, '.studio'), { recursive: true }); writeFileSync(f, JSON.stringify(s)); return { ...s, reprise: false };
}
export const nouvelleSession = dir => session(dir, true);
export const STYLES = join(STUDIO_PROJETS, '_styles');
// les règles d'un fichier : lignes « - … » (retenues à la main) et lignes du tableau d'un style copié (« | R01 | règle | valeur | déclencheur | … ») ;
// la section « À vérifier » d'un style copié est ignorée (preuve ou valeur non retrouvée)
export function lignesRegles(f) {
  if (!existsSync(f)) return []; const L = []; let ignorer = false;
  for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
    if (l.startsWith('## ')) ignorer = /vérifier/i.test(l);
    if (ignorer) continue;
    if (l.startsWith('- ')) L.push(l.slice(2));
    const c = l.split('|').map(x => x.trim()); if (/^[RS]\d+$/.test(c[1] || '')) L.push(`${c[1]} : ${c[2]}${c[3] && c[3] !== '—' ? ' (' + c[3] + ')' : ''}${c[4] && c[4] !== '—' ? ' — quand : ' + c[4] : ''}`);
  }
  return L;
}
export function regles(dir, style) {
  return [...lignesRegles(join(dir, '.studio', 'memoire.md')).map(l => '- ' + l + ' (projet)'), ...(style ? lignesRegles(join(STYLES, style, 'regles.md')).map(l => '- ' + l + ' (style)') : [])];
}
export function retenir(dir, style, regle, portee) {
  const f = portee === 'style' && style ? join(STYLES, style, 'regles.md') : join(dir, '.studio', 'memoire.md');
  mkdirSync(join(f, '..'), { recursive: true }); if (!existsSync(f)) writeFileSync(f, `# Règles retenues${portee === 'style' ? ' du style ' + style : ' du projet'}\n\n`);
  const txt = readFileSync(f, 'utf8');
  if (txt.includes('## Retenu depuis le studio')) {   // style copié : une ligne de tableau de plus (défaut -> cause -> correction), preuve = le projet et la date
    const n = Math.max(0, ...[...txt.matchAll(/^\|\s*S(\d+)\s*\|/gm)].map(m => +m[1])) + 1;
    appendFileSync(f, `| S${String(n).padStart(2, '0')} | ${regle.replace(/\s+/g, ' ').replace(/\|/g, '/').trim()} | — | — | retour de Noam sur ${basename(dir)}, ${new Date().toLocaleDateString('fr-FR')} | retour | haute | — |\n`); return f;
  }
  appendFileSync(f, `- ${regle.replace(/\s+/g, ' ').trim()} (${new Date().toLocaleDateString('fr-FR')})\n`); return f;
}

// ---------- une demande ----------
const MODELES = { 'Opus 5.5': 'opus', 'Sonnet 5.5': 'sonnet', 'Haiku 5.5': 'haiku' }, EFFORTS = { 'Effort bas': 'low', 'Effort moyen': 'medium', 'Effort haut': 'high' };
let courant = null;
export const enCours = () => courant;
export function arreter() { if (!courant) return false; courant.arrete = true; try { execFileSync('taskkill', ['/PID', String(courant.p.pid), '/T', '/F']); } catch {} return true; }
// d = { demande, portee, cible, plan, t, modele, effort, avant }, ctx = { dir, style, plans }, emet(type, data)
export function demander(d, ctx, emet) {
  if (courant) return null;
  const { dir } = ctx, id = Date.now().toString(36);
  outils(dir); if (ctx.info) { const cm = join(dir, 'CLAUDE.md'), n = claudeMd(ctx.info); if (!existsSync(cm) || readFileSync(cm, 'utf8') !== n) { writeFileSync(cm, n); git(dir, 'add', 'CLAUDE.md'); git(dir, 'commit', '-q', '-m', 'Studio : mode d\'emploi de Claude mis à jour'); } }   // le mode d'emploi du studio, à jour, dans son propre commit
  git(dir, 'add', '-A');   // les retouches à la main (bruitages déplacés…) d'abord, à part : elles ne finissent pas dans le commit de Claude
  if (git(dir, 'status', '--porcelain')) git(dir, 'commit', '-q', '-m', 'Retouches à la main (studio)');
  const avantHash = git(dir, 'rev-parse', 'HEAD'), s = session(dir);
  if (d.avant) { mkdirSync(join(dir, '.studio', 'images'), { recursive: true }); writeFileSync(join(dir, '.studio', 'images', id + '-avant.jpg'), Buffer.from(d.avant.split(',')[1], 'base64')); }
  const p = ctx.plans?.find(x => x.n === d.plan), fmt = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
  const R = regles(dir, ctx.style);
  const message = [`Demande de Noam : ${d.demande}`, '',
    d.portee === 'selection' && d.cible ? `Portée : seulement ${d.cible.texte ? `le texte « ${d.cible.texte} » (boîte ${d.cible.box?.join(', ')} en pixels 1080×1920)` : `l'objet « ${d.cible.nom} »${d.cible.expr ? ` (dans la page : ${d.cible.expr})` : ''}`}, vu à ${fmt(d.t)}${p ? `, dans le plan ${p.n} (${fmt(p.t0)} → ${fmt(p.t1)}, voix : « ${p.texte} »)` : ''}.`
      : d.portee === 'plan' && p ? `Portée : le plan ${p.n} seulement (${fmt(p.t0)} → ${fmt(p.t1)}, voix : « ${p.texte} »). Instant regardé : ${fmt(d.t)}.`
      : `Portée : toute la vidéo. Instant regardé par Noam : ${fmt(d.t)}${p ? ` (plan ${p.n})` : ''}.`,
    R.length ? `\nRègles retenues (à respecter) :\n${R.join('\n')}` : '',
    '\nVérifie sur des images rendues avant de répondre. Pas de commit git.'].join('\n');
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--setting-sources', 'project',
    '--tools', 'Read,Edit,Write,Glob,Grep,Bash,Skill', '--allowedTools', `Skill,${LIRE_PLUGIN},Bash(node .studio/rendre.mjs *),Bash(node .studio/controler.mjs *),Bash(ffprobe *)`,
    '--plugin-dir', generer() && PLUGIN,   // les skills du studio (lib/skills.mjs), refabriquées à chaque demande
    '--model', MODELES[d.modele] || 'opus', '--effort', EFFORTS[d.effort] || 'medium', ...(s.reprise ? ['--resume', s.id] : ['--session-id', s.id])];
  // claude est un raccourci .cmd sous Windows : il passe par le shell, qui couperait « Bash(node *) » à l'espace sans guillemets
  const proc = spawn('claude', args.map(a => /[\s()*,]/.test(a) ? `"${a}"` : a), { cwd: dir, shell: process.platform === 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
  courant = { p: proc, id, debut: Date.now(), demande: d.demande };
  const entree = { id, message, demande: d.demande, portee: d.portee, cible: d.cible?.nom || d.cible?.texte || null, plan: d.plan ?? null, t: d.t, modele: d.modele, effort: d.effort, debut: Date.now(), etapes: [], avant: d.avant ? `.studio/images/${id}-avant.jpg` : null };
  emet('claude', { id, type: 'debut', demande: d.demande, modele: d.modele });
  let tampon = '', resultat = null, erreurs = '';
  proc.stdout.on('data', b => { tampon += b; let i; while ((i = tampon.indexOf('\n')) >= 0) { const l = tampon.slice(0, i); tampon = tampon.slice(i + 1); if (!l.trim()) continue;
    let j; try { j = JSON.parse(l); } catch { continue; }
    if (j.type === 'assistant') for (const c of j.message?.content || []) {
      if (c.type === 'text' && c.text.trim()) emet('claude', { id, type: 'texte', texte: c.text });
      if (c.type === 'tool_use') { const x = c.input || {}, e = { outil: c.name, detail: x.skill ? 'skill ' + x.skill.replace(/^studio:/, '') : x.file_path ? relative(dir, x.file_path).replace(/\\/g, '/').replace(/^.*_plugin\/skills\//, 'skill ') : x.command || x.pattern || '' }; entree.etapes.push(e); emet('claude', { id, type: 'etape', ...e }); }
    }
    if (j.type === 'system' && j.subtype === 'permission_denied') emet('claude', { id, type: 'refus', detail: JSON.stringify(j).slice(0, 200) });
    if (j.type === 'result') resultat = j; } });
  proc.stderr.on('data', b => erreurs += b);
  proc.stdin.end(message);
  proc.on('close', code => {
    const fin = { ...entree, duree: Math.round((Date.now() - entree.debut) / 1000) };
    try {
      if (courant?.arrete) fin.erreur = 'arrêté';
      else if (!resultat) fin.erreur = (erreurs.trim() || `claude s'est arrêté (code ${code})`).slice(0, 400);
      else if (resultat.is_error) fin.erreur = /log ?in|authenticat|OAuth/i.test(resultat.result || '') ? 'Claude n\'est plus connecté : ouvre un terminal, tape claude puis /login.' : String(resultat.result || resultat.subtype || 'erreur de Claude').slice(0, 400);
      if (resultat && !resultat.is_error) { const sf = join(dir, '.studio', 'session.json'); try { const s = JSON.parse(readFileSync(sf, 'utf8')); if (!s.ouverte) writeFileSync(sf, JSON.stringify({ ...s, ouverte: true })); } catch {} }
      if (resultat) { fin.reponse = resultat.result || ''; fin.cout = resultat.total_cost_usd ?? null; fin.refus = (resultat.permission_denials || []).map(r => `${r.tool_name} ${JSON.stringify(r.tool_input).slice(0, 120)}`);
        const m = /^\s*RÈGLE\s*:\s*(.+)$/im.exec(fin.reponse); if (m) fin.regle = m[1].trim(); }
      git(dir, 'add', '-A');
      if (git(dir, 'status', '--porcelain')) {
        git(dir, 'commit', '-q', '-m', `Claude : ${d.demande.slice(0, 70)}`);
        fin.hash = git(dir, 'rev-parse', 'HEAD'); fin.avantHash = avantHash;
        fin.fichiers = git(dir, 'show', '--numstat', '--format=', fin.hash).split('\n').filter(Boolean).map(l => { const [a, b, f] = l.split('\t'); return { f, plus: +a || 0, moins: +b || 0 }; });
      } else fin.fichiers = [];
    } catch (e) { fin.erreur = (fin.erreur ? fin.erreur + ' · ' : '') + 'git : ' + e.message.slice(0, 200); }
    const h = historique(dir); h.push(fin); sauverHist(dir, h);
    courant = null; emet('claude', { id, type: 'fin', entree: fin });
  });
  return id;
}
export function apres(dir, id, image) { mkdirSync(join(dir, '.studio', 'images'), { recursive: true }); writeFileSync(join(dir, '.studio', 'images', id + '-apres.jpg'), Buffer.from(image.split(',')[1], 'base64'));
  const h = historique(dir), e = h.find(x => x.id === id); if (e) { e.apres = `.studio/images/${id}-apres.jpg`; sauverHist(dir, h); } }
export const diff = (dir, hash) => git(dir, 'show', '--stat', '--patch', '--format=%s%n', hash).slice(0, 400000);
export function annuler(dir, id) {
  const h = historique(dir), e = h.find(x => x.id === id); if (!e?.hash) return { erreur: 'rien à annuler' };
  try { git(dir, 'revert', '--no-edit', e.hash); } catch (x) { try { git(dir, 'revert', '--abort'); } catch {} return { erreur: 'Annulation impossible sans conflit (une demande plus récente touche les mêmes lignes) : annule d\'abord les plus récentes.' }; }
  e.annule = git(dir, 'rev-parse', 'HEAD'); sauverHist(dir, h); return { ok: true };
}
