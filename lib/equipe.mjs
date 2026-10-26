// equipe.mjs : la construction en équipe (phase 5). Plusieurs sessions Claude Code en parallèle sur un projet du studio,
// chacune limitée à SES fichiers (--permission-mode dontAsk + Edit(fichier)/Write(fichier) : vérifié, le reste est refusé).
// Ordre : directeur -> (créateur d'objets ∥ chercheur d'images) -> constructeurs en parallèle -> [contrôle complet + corrections] -> [polisseur].
// Un commit par agent (son rôle, ses seuls fichiers) ; « Annuler la construction » = git revert de tous ses commits.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import { outils, regles } from './claude.mjs';
import { prendre } from './verrou.mjs';
import { PLUGIN, generer } from './skills.mjs';
import * as BIB from './bibliotheque.mjs';

const ICI = join(import.meta.dirname, '..');
const git = (dir, ...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', maxBuffer: 1e8 }).trim();
const MODELES = { 'Opus 5.5': 'opus', 'Sonnet 5.5': 'sonnet', 'Haiku 5.5': 'haiku' }, EFFORTS = { 'Effort bas': 'low', 'Effort moyen': 'medium', 'Effort haut': 'high' };
export const NIVEAUX = ['standard', 'verifie', 'soigne', 'ultra'];
const VERIF = ['Skill', 'Bash(node .studio/rendre.mjs *)', 'Bash(node .studio/controler.mjs *)', 'Bash(node .studio/bibliotheque.mjs *)'];
// la bibliothèque commune, une ligne par élément (donnée aux agents qui choisissent les modèles)
const catalogue = () => BIB.index().elements.map(e => `${e.nom} (${e.type}, ${e.dims_m.map(x => x.toFixed(1)).join('×')} m${e.animations?.length ? ', ' + e.animations.length + ' animations' : ''}) : ${(e.quoi || e.notes || '').slice(0, 90)}`).join('\n');

const runs = new Map();   // id -> { role, nom, proc }
let C = null;             // la construction en cours
export const active = () => !!C;
export const etat = () => C && { id: C.id, debut: C.debut, niveau: C.niveau, agents: C.agents, phase: C.phase, etapes: C.etapes, attente: C.attente ? C.plan : null };
// mode « je choisis » : la réponse de Noam au découpage ({} = continuer, {remarque} = refaire, {stop} = arrêter)
export function continuer(r) { if (!C?.attente) return false; C.attente(r || {}); return true; }
export function arreter() {
  if (!C) return false; C.arrete = true; if (C.attente) C.attente({ stop: true });
  for (const r of runs.values()) try { execFileSync('taskkill', ['/PID', String(r.proc.pid), '/T', '/F']); } catch {}
  return true;
}

// ---------- un agent ----------
// fichiers : ce qu'il a le droit d'écrire (et rien d'autre) ; commit : ce qu'on met dans son commit
function agent(dir, { role, nom, fichiers = [], bash = [], web = [], modele, effort, message, commit = fichiers, paquet = null, skills = [] }, emet) {
  const id = randomUUID().slice(0, 8), debut = Date.now();
  const autorises = ['Read', 'Glob', 'Grep', ...fichiers.flatMap(f => [`Edit(/${f})`, `Write(/${f})`])   /* /f = depuis la racine du projet : un « cd » de l agent ne change pas la règle (vu : Write refusé après un cd) */, ...VERIF, ...bash, ...web];
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'dontAsk', '--setting-sources', 'project',
    '--tools', 'Read,Edit,Write,Glob,Grep,Bash,Skill' + (web.length ? ',WebFetch,WebSearch' : ''), '--allowedTools', autorises.join(','), '--plugin-dir', PLUGIN,
    '--model', MODELES[modele] || modele || 'opus', '--effort', EFFORTS[effort] || effort || 'medium', '--session-id', randomUUID()];
  const fiche = { id, role, nom, fichiers, debut, etat: 'travaille', etapes: [], modele: MODELES[modele] || modele, paquet, skills };
  C.agents.push(fiche); emet({ type: 'agent', agent: fiche });
  return new Promise(ok => {
    if (C.arrete) { fiche.etat = 'arrêté'; emet({ type: 'agent', agent: fiche }); return ok(fiche); }
    // claude est un .cmd sous Windows : passe par le shell, qui couperait « Bash(node *) » à l'espace sans guillemets
    const proc = spawn('claude', args.map(a => /[\s()*,]/.test(a) ? `"${a}"` : a), { cwd: dir, shell: process.platform === 'win32', stdio: ['pipe', 'pipe', 'pipe'] });
    runs.set(id, { role, nom, proc });
    let tampon = '', resultat = null, erreurs = '';
    proc.stdout.on('data', b => { tampon += b; let i; while ((i = tampon.indexOf('\n')) >= 0) { const l = tampon.slice(0, i); tampon = tampon.slice(i + 1); if (!l.trim()) continue;
      let j; try { j = JSON.parse(l); } catch { continue; }
      if (j.type === 'assistant') for (const c of j.message?.content || []) {
        if (c.type === 'tool_use') { const x = c.input || {}, e = { outil: c.name, detail: x.skill ? 'skill ' + x.skill.replace(/^studio:/, '') : x.file_path ? x.file_path.replace(/\\/g, '/').replace(dir.replace(/\\/g, '/') + '/', '').replace(/^.*_plugin\/skills\//, 'skill ') : x.command || x.pattern || x.url || x.query || '' };
          fiche.etapes.push(e); emet({ type: 'etape', id, ...e }); }
        if (c.type === 'text' && c.text.trim()) { fiche.dernier = c.text.slice(0, 400); emet({ type: 'texte', id, texte: fiche.dernier }); }
      }
      if (j.type === 'rate_limit_event') { const r = j.rate_limit_info || {}; C.usage = r.unifiedWindows?.five_hour?.utilization ?? C.usage; emet({ type: 'usage', usage: C.usage });
        if (r.status && r.status !== 'allowed') emet({ type: 'etape', id, outil: 'attente', detail: `limite d'usage (${r.rateLimitType || ''}) : Claude attend` }); }
      if (j.type === 'result') resultat = j; } });
    proc.stderr.on('data', b => erreurs += b);
    proc.stdin.end(message);
    proc.on('close', code => {
      runs.delete(id); fiche.duree = Math.round((Date.now() - debut) / 1000);
      if (C.arrete) fiche.erreur = 'arrêté';
      else if (!resultat) fiche.erreur = (erreurs.trim() || `claude s'est arrêté (code ${code})`).slice(0, 300);
      else if (resultat.is_error) fiche.erreur = /log ?in|authenticat|OAuth/i.test(resultat.result || '') ? 'Claude n\'est plus connecté : ouvre un terminal, tape claude puis /login.' : String(resultat.result).slice(0, 300);
      if (resultat) { fiche.reponse = resultat.result || ''; fiche.cout = resultat.total_cost_usd ?? null; fiche.refus = (resultat.permission_denials || []).map(r => `${r.tool_name} ${JSON.stringify(r.tool_input).slice(0, 100)}`); }
      // son commit : ses fichiers seulement (les autres agents travaillent en même temps dans le même dossier)
      try {
        const chemins = commit.filter(f => !f.includes('*')), forces = chemins.filter(f => f.startsWith('assets/') && existsSync(join(dir, f)));
        if (chemins.length) { git(dir, 'add', '-A', '--', ...chemins.filter(f => !forces.includes(f))); if (forces.length) git(dir, 'add', '-f', '--', ...forces); }
        if (git(dir, 'diff', '--cached', '--name-only')) {
          git(dir, 'commit', '-q', '-m', `${role}${nom ? ' ' + nom : ''} (${fiche.modele}) : ${git(dir, 'diff', '--cached', '--name-only').split('\n').join(', ')}`, '-m', (fiche.reponse || '').slice(0, 1500));
          fiche.hash = git(dir, 'rev-parse', 'HEAD'); fiche.touches = git(dir, 'show', '--name-only', '--format=', fiche.hash).split('\n').filter(Boolean);
        } else fiche.touches = [];
      } catch (e) { fiche.erreur = (fiche.erreur ? fiche.erreur + ' · ' : '') + 'git : ' + e.message.slice(0, 200); }
      fiche.etat = fiche.erreur ? 'erreur' : 'fini'; emet({ type: 'agent', agent: fiche }); ok(fiche);
    });
  });
}
// au plus n à la fois
async function parLots(taches, n) { const res = []; let i = 0; await Promise.all(Array.from({ length: Math.min(n, taches.length) }, async () => { while (i < taches.length) { const k = i++; res[k] = await taches[k](); } })); return res; }

// ---------- la construction ----------
const lire = (dir, f) => existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8') : '';
const lireJson = (dir, f) => { try { return JSON.parse(lire(dir, f)); } catch { return null; } };
const fmt = t => t.toFixed(2);
function mots(dir) { const w = lireJson(dir, 'audio/words.json'); return Array.isArray(w) ? w : w?.words || []; }
function voixDe(dir, a, b) { return mots(dir).filter(m => m.start >= a - .01 && m.start < b - .01).map(m => `${m.w}@${fmt(m.start)}`).join(' '); }

function valider(dir) {   // le plan du directeur : sections contiguës sur la grille, de 0 à la durée, un fichier scenes/sNN_nom.js chacune
  const pj = lireJson(dir, 'project.json'); if (!pj) return 'project.json illisible';
  const P = pj.plans || []; if (!P.length) return 'aucune section dans project.json';
  const g = t => Math.round(t * 30) / 30;
  for (const [i, p] of P.entries()) {
    if (!/^scenes\/s\d\d_[\w-]+\.js$/.test(p.fichier || '')) return `section ${p.id} : fichier « ${p.fichier} » (attendu scenes/sNN_nom.js)`;
    if (!(p.t1 > p.t0)) return `section ${p.id} : t1 doit être après t0`;
    if (i && Math.abs(g(p.t0) - g(P[i - 1].t1)) > .001) return `section ${p.id} : commence à ${p.t0}, la précédente finit à ${P[i - 1].t1}`;
  }
  if (new Set(P.map(p => p.fichier)).size !== P.length) return 'deux sections ont le même fichier';
  return null;
}

// ---------- les rôles (roles/*.md) et les paquets ----------
// Un rôle = un fichier : en-tête (role, skills, effort, web, bash) + consigne avec des {{cases}} que l'orchestrateur remplit.
// Le paquet = _commun.md + la consigne remplie + les skills à charger : tout ce que l'agent reçoit, gardé dans .studio/paquets/ (on peut le relire).
const ROLES = join(ICI, 'roles');
const liste = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
const lireRole = nom => lireFichier(join(ROLES, nom + '.md'));
function lireFichier(chemin) {
  const t = readFileSync(chemin, 'utf8'), m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(t);
  const meta = Object.fromEntries((m?.[1] || '').split(/\r?\n/).filter(l => l.includes(':')).map(l => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  return { meta, corps: m ? t.slice(m[0].length) : t };
}
// ---------- les genres (genres/*.md) et les budgets ----------
// Un genre = un fichier : titre, format conseillé, durée, skills ajoutées au directeur et au polisseur, équipe (« * » = rôle d'écriture ou de publication pas encore branché), consignes données au directeur.
const GENRES = join(ICI, 'genres');
export const genres = () => readdirSync(GENRES).filter(f => f.endsWith('.md')).sort().map(f => { const { meta, corps } = lireFichier(join(GENRES, f));
  return { id: f.slice(0, -3), titre: meta.titre, format: meta.format, duree: meta.duree, pour: meta.pour, fin: meta.fin, coupes: meta.coupes, skills: liste(meta.skills), equipe: liste(meta.equipe).map(n => ({ nom: n.replace(/\*$/, ''), bientot: n.endsWith('*') })), corps: corps.trim() }; });
// la consigne donnée aux agents pour chaque option (elle arrive dans « Réglages du projet » de chaque paquet)
export const FINS = { boucle: 'fin : boucle (la dernière image retombe sur la première, pour que la vidéo reparte sans coupure)', 'plan-large': 'fin : plan large (on recule sur un plan large immobile, tenu au moins 0,8 s)' };
export const COUPES = { seches: 'coupes sèches permises', liees: 'aucune coupe sèche (chaque changement de plan est une transition liée : mouvement de caméra, élément partagé, flou de vitesse)' };
// un modèle et un effort par famille de rôle (en-tête « famille » des rôles) : décider (directeur), fabriquer (constructeurs, objets, correcteurs, polisseur), vérifier (recherche d'images). Jamais l'effort maximal.
export const BUDGETS = {
  eco: { titre: 'Éco', decide: ['sonnet', 'high'], fabrique: ['sonnet', 'medium'], verifie: ['haiku', 'low'] },
  recommande: { titre: 'Recommandé', decide: ['opus', 'high'], fabrique: ['sonnet', 'medium'], verifie: ['haiku', 'low'] },
  max: { titre: 'Max', decide: ['opus', 'high'], fabrique: ['opus', 'medium'], verifie: ['sonnet', 'medium'] },
};

function paquet(dir, nom, vars, cle, enPlus = []) {
  const { meta, corps } = lireRole(nom), commun = readFileSync(join(ROLES, '_commun.md'), 'utf8');
  const remplir = s => s.replace(/\{\{(\w+)\}\}/g, (_, k) => { if (!(k in vars)) throw new Error(`roles/${nom}.md : la case {{${k}}} n'est pas remplie par equipe.mjs`); return vars[k]; });
  const skills = [...new Set([...liste(meta.skills), ...enPlus])];
  const texte = [remplir(commun).trim(), remplir(corps).trim(), skills.length ? `Avant de travailler, charge ces skills : ${skills.map(s => '`studio:' + s + '`').join(', ')}.` : ''].filter(Boolean).join('\n\n');
  const f = `.studio/paquets/${C.id}-${cle}.md`; mkdirSync(join(dir, '.studio', 'paquets'), { recursive: true }); writeFileSync(join(dir, f), texte + '\n');
  return { role: meta.role || nom, famille: meta.famille || 'fabrique', skills, effort: meta.effort, web: liste(meta.web), bash: liste(meta.bash), message: texte, paquet: f };
}

// ---------- la barre d'avancement : les étapes prévues dès le départ, puis cochées ----------
function prevoir(N, choisis) {
  return [['decoupage', 'Découpage en sections (directeur)'], ...(choisis ? [['validation', 'Ton accord sur le découpage']] : []), ['preparation', 'Modèles 3D, objets et images'], ['construction', 'Construction des sections'],
    ...(N >= 1 ? [['controle', N >= 3 ? 'Contrôle complet + relecteur aveugle' : 'Contrôle complet'], ['corrections', 'Corrections']] : []),
    ...(N >= 2 ? [['polissage', 'Polissage section par section']] : [])].map(([cle, titre]) => ({ cle, titre, etat: 'a_venir', detail: '' }));
}

export async function construire(dir, o, emet) {
  if (C) return null;
  const niveau = NIVEAUX.includes(o.niveau) ? o.niveau : 'standard', N = NIVEAUX.indexOf(niveau), effort = o.effort || 'Effort moyen';
  const budget = BUDGETS[o.budget] ? o.budget : 'recommande', G = genres().find(g => g.id === o.genre) || null, mode = o.mode === 'choisis' ? 'choisis' : 'auto', ton = (o.ton || '').trim();
  // o.modele (essais en ligne de commande) force un seul modèle pour tous les rôles ; sinon le budget choisit par famille
  const modeleDe = famille => o.modele ? [o.modele, effort] : BUDGETS[budget][famille] || BUDGETS[budget].fabrique;
  // fin et coupes : options du projet (Noam, 23/10), par défaut celles du genre
  const fin = FINS[o.fin] ? o.fin : FINS[G?.fin] ? G.fin : 'boucle', coupes = COUPES[o.coupes] ? o.coupes : COUPES[G?.coupes] ? G.coupes : 'seches';
  const reglages = [G ? `genre ${G.titre}` : 'genre libre', `ton : ${ton || 'celui du script et de la DA'}`, mode === 'choisis' ? 'Noam valide le découpage avant la construction' : 'mode automatique', FINS[fin], COUPES[coupes]].join(' · ');
  C = { id: Date.now().toString(36), debut: Date.now(), niveau, budget, genre: G?.id || null, agents: [], phase: '', arrete: false, etapes: prevoir(N, mode === 'choisis') };
  mkdirSync(join(dir, '.studio'), { recursive: true }); writeFileSync(join(dir, '.studio', 'reglages.json'), JSON.stringify({ genre: G?.id || null, ton, mode, budget, niveau, fin, coupes }, null, 1) + '\n');
  // le contrôle de la boucle (check.mjs, « boucle » de l'adaptateur) suit l'option ; on fusionne : son.py range aussi ses pistes dans ce fichier
  const af = join(dir, '.studio', 'adaptateur.json'), ad = existsSync(af) ? JSON.parse(readFileSync(af, 'utf8')) : {};
  if (ad.boucle !== (fin === 'boucle')) writeFileSync(af, JSON.stringify({ ...ad, boucle: fin === 'boucle' }, null, 1));
  const em = d => { emet({ ...d, construction: C.id }); };
  const phase = p => { C.phase = p; em({ type: 'phase', phase: p }); };
  const etape = (cle, etat, detail) => { const e = C.etapes.find(x => x.cle === cle); if (!e) return; e.etat = etat; if (detail !== undefined) e.detail = detail; em({ type: 'etapes', etapes: C.etapes }); };
  // un agent depuis son rôle ; « fini » = son fichier existe sur le disque, sinon une seule relance avec le même paquet
  const lancer = async (nom, vars, cle, opts) => {
    // le genre ajoute ses skills au directeur et au polisseur
    const P = paquet(dir, nom, { ...vars, reglages }, cle, ['directeur', 'polisseur'].includes(nom) ? G?.skills || [] : []), [m, e] = modeleDe(P.famille);
    const go = extra => agent(dir, { role: P.role, nom: opts.nom, fichiers: opts.fichiers || [], commit: opts.commit, bash: P.bash, web: P.web, modele: m, effort: P.effort || e, message: P.message + (extra || ''), paquet: P.paquet, skills: P.skills }, em);
    let f = await go(opts.extra);
    const doit = opts.doitExister, manque = () => doit && !C.arrete && (!existsSync(join(dir, doit)) || !readFileSync(join(dir, doit), 'utf8').trim());
    if (manque()) f = await go(`\n\nATTENTION : ton fichier ${doit} n'existe pas encore (ou il est vide). Écris-le : c'est ton seul livrable.`);
    return f;
  };
  const pj0 = lireJson(dir, 'project.json') || {};
  try {
    outils(dir); generer();   // les skills du studio, une fois pour toute l'équipe (les agents tournent en parallèle)
    git(dir, 'add', '-A'); if (git(dir, 'status', '--porcelain')) git(dir, 'commit', '-q', '-m', 'Retouches à la main (studio)');
    C.depart = git(dir, 'rev-parse', 'HEAD');
    const duree = pj0.duree || +((mots(dir).at(-1)?.end ?? 20) + .6).toFixed(2);
    em({ type: 'debut', niveau, budget: BUDGETS[budget].titre, genre: G?.titre || null, etapes: C.etapes });

    // 1. le directeur ; un plan invalide = une relance avec l'erreur
    phase('Le directeur découpe la vidéo en sections'); etape('decoupage', 'en_cours');
    const vDir = { genre: G ? G.corps : '(genre libre : suis le script et la direction artistique)', direction: o.direction || '(aucune : suis le script et la DA)', voix: mots(dir).map(m => `${m.w}@${fmt(m.start)}`).join(' ') || '(pas de voix : invente un rythme de lecture)',
      duree: String(duree), nb_sections: o.sections ? `exactement ${o.sections} sections` : 'en général 3 à 6 s chacune', catalogue: catalogue() };
    await lancer('directeur', vDir, 'directeur', { fichiers: ['project.json', 'storyboard.md', 'constantes.md'] });
    if (C.arrete) throw new Error('arrêté');
    let err = valider(dir);
    if (err) { await lancer('directeur', vDir, 'directeur-2', { nom: '(2e essai)', fichiers: ['project.json', 'storyboard.md', 'constantes.md'], extra: `\n\nTon premier plan était invalide : ${err}. Corrige project.json.` }); err = valider(dir); }
    if (err) { etape('decoupage', 'erreur', err); throw new Error('plan du directeur invalide : ' + err); }
    etape('decoupage', 'fait', `${lireJson(dir, 'project.json').plans.length} sections`);
    // mode « je choisis » : le découpage attend la réponse de Noam ; une remarque = le directeur refait, puis on redemande
    if (mode === 'choisis') for (let tour = 1; ; tour++) {
      C.plan = (lireJson(dir, 'project.json').plans || []).map(({ id, t0, t1, brief }) => ({ id, t0, t1, brief }));
      etape('validation', 'en_cours', 'attend ta réponse'); phase('Le découpage attend ton accord'); em({ type: 'plan', plans: C.plan });
      const r = await new Promise(ok => { C.attente = ok; }); C.attente = null;
      if (C.arrete || r.stop) throw new Error('arrêté');
      if (!r.remarque?.trim()) { etape('validation', 'fait', tour > 1 ? `validé au ${tour}e découpage` : 'validé'); break; }
      etape('validation', 'en_cours', 'le directeur refait le découpage'); phase('Le directeur refait le découpage');
      await lancer('directeur', vDir, 'directeur-' + (tour + 1), { nom: `(reprise ${tour})`, fichiers: ['project.json', 'storyboard.md', 'constantes.md'], extra: `\n\nNoam a lu ton découpage et demande : ${r.remarque.trim()}\nRefais project.json, storyboard.md et constantes.md en conséquence.` });
      if (C.arrete) throw new Error('arrêté');
      const e2 = valider(dir); if (e2) { etape('validation', 'erreur', e2); throw new Error('plan du directeur invalide : ' + e2); }
    }
    const pj = lireJson(dir, 'project.json'), plans = pj.plans;

    // 2. modèles de la bibliothèque (le studio), puis objets 3D ∥ images
    etape('preparation', 'en_cours');
    // les éléments choisis par le directeur : copiés par le studio (pas par les agents : un seul écrivain pour assets/credits.json)
    for (const n of pj.bibliotheque || []) try { BIB.ajouter(dir, n); } catch (e) { em({ type: 'phase', phase: 'bibliothèque : ' + e.message }); }
    // aucun élément copié (tous refusés) = pas de credits.json : rien à commiter
    if (pj.bibliotheque?.length && existsSync(join(dir, 'assets', 'credits.json'))) { git(dir, 'add', '-f', 'assets/credits.json'); if (git(dir, 'diff', '--cached', '--name-only')) git(dir, 'commit', '-q', '-m', 'Studio : éléments de la bibliothèque (' + pj.bibliotheque.join(', ') + ')'); }
    const sb = lire(dir, 'storyboard.md'), cst = lire(dir, 'constantes.md'), prep = [];
    if (pj.objets?.length) prep.push(() => lancer('objets', { objets: JSON.stringify(pj.objets), constantes: cst, modeles: JSON.stringify(lireJson(dir, 'assets/credits.json') || []) }, 'objets', { fichiers: ['scenes/objets.js'], doitExister: 'scenes/objets.js' }));
    if (pj.images?.length) prep.push(() => lancer('images', { images: JSON.stringify(pj.images) }, 'images', { commit: ['assets/credits.json'] }));
    if (prep.length) { phase('Objets 3D et images'); await Promise.all(prep.map(f => f())); }
    if (C.arrete) throw new Error('arrêté');
    etape('preparation', pj.bibliotheque?.length || prep.length ? 'fait' : 'saute', [pj.bibliotheque?.length && `${pj.bibliotheque.length} modèle(s)`, pj.objets?.length && `${pj.objets.length} objet(s)`, pj.images?.length && `${pj.images.length} image(s)`].filter(Boolean).join(' · ') || 'rien à préparer');

    // 3. les constructeurs, en parallèle : un paquet par section (tout ce qu'il faut, rien de plus)
    const images = lireJson(dir, 'assets/credits.json') || [], aObjets = existsSync(join(dir, 'scenes/objets.js')), R = regles(dir, pj.style);
    const section = p => [`Plage : T = ${fmt(p.t0)} → ${fmt(p.t1)} s (temps global de la voix).`, `Brief : ${p.brief || '(voir storyboard)'}`,
      `Voix dans ta plage (mot@seconde) : ${voixDe(dir, p.t0, p.t1) || '(aucune)'}`, `Storyboard complet : ${sb}`, `Constantes (à respecter) : ${cst}`,
      R.length ? `Règles du style et retours de Noam (à respecter) :\n${R.join('\n')}` : '',
      aObjets ? 'Objets 3D partagés : import * as O from \'./objets.js\' (lis-le).' : '',
      pj.bibliotheque?.length ? `Modèles de la bibliothèque déjà dans le projet : ${pj.bibliotheque.map(n => `await k.bib('${n}')`).join(', ')} (taille, marqueurs, notes : assets/bib/<nom>/fiche.json ; l'avant regarde +Z).` : '',
      images.length ? `Images disponibles : ${images.map(i => i.fichier).join(', ')} (charge-les avec new Image() dans build, et attends-les).` : ''].filter(Boolean).join('\n');
    const vars = p => ({ id: p.id, fichier: p.fichier, t0: fmt(p.t0), t1: fmt(p.t1), section: section(p) });
    const tour = async (cleEtape, liste, faire) => { let n = 0; etape(cleEtape, 'en_cours', `0/${liste.length}`);
      await parLots(liste.map(x => async () => { await faire(x); etape(cleEtape, 'en_cours', `${++n}/${liste.length}`); }), o.max || 3);
      etape(cleEtape, C.arrete ? 'erreur' : 'fait', `${n}/${liste.length}`); };
    phase(`Construction de ${plans.length} sections en parallèle`);
    await tour('construction', plans, p => lancer('constructeur', vars(p), p.id, { nom: p.id, fichiers: [p.fichier], doitExister: p.fichier }));
    if (C.arrete) throw new Error('arrêté');

    // 4. contrôle complet + corrections (Vérifié et plus) ; relecteur aveugle (Ultra)
    let rapport = null;
    if (N >= 1) {
      phase(N >= 3 ? 'Contrôle complet + relecteur aveugle' : 'Contrôle complet'); etape('controle', 'en_cours');
      // au même endroit que le bouton « Contrôler » (out/<projet>/qa) : le studio affiche ce rapport dès la fin de la construction
      const lacher = await prendre(), qa = join(ICI, 'out', basename(dir));
      try { await new Promise((ok, ko) => { const p = spawn(process.execPath, [join(ICI, 'check.mjs'), dir, '--workers', '1', '--out', qa, ...(N >= 3 ? ['--aveugle'] : [])], { stdio: 'ignore' }); p.on('close', c => c === 0 ? ok() : ko(new Error('contrôle en échec (' + c + ')'))); }); }
      finally { lacher(); }
      rapport = lireJson(qa, 'qa/rapport.json'); em({ type: 'controle', entrees: (rapport?.entrees || []).length });
      const aCorriger = plans.map(p => [p, (rapport?.entrees || []).filter(e => e.gravite !== 'info' && e.t >= p.t0 - .01 && e.t < p.t1 - .01 && !/mot couvert|sonie/.test(e.controle))]).filter(([, l]) => l.length);
      etape('controle', 'fait', `${(rapport?.entrees || []).length} relevé(s), ${aCorriger.length} section(s) à corriger`);
      if (aCorriger.length) { phase(`Corrections : ${aCorriger.length} section(s)`);
        await tour('corrections', aCorriger, ([p, l]) => lancer('correcteur', { ...vars(p), defauts: l.map(e => `- ${fmt(e.t)} s [${e.gravite}] ${e.controle} : ${e.probleme}${e.source === 'aveugle' ? ' (relecteur aveugle : à vérifier sur l\'image)' : ''}`).join('\n') }, p.id + '-correction', { nom: p.id, fichiers: [p.fichier] })); }
      else etape('corrections', 'saute', 'rien à corriger');
    }
    // 5. polisseur, section par section (Soigné et plus)
    if (N >= 2 && !C.arrete) {
      phase('Polissage section par section');
      await tour('polissage', plans, p => lancer('polisseur', vars(p), p.id + '-polissage', { nom: p.id, fichiers: [p.fichier] }));
    }
    C.fin = Date.now();
  } catch (e) { C.erreur = e.message; for (const x of C.etapes) if (x.etat === 'en_cours') x.etat = 'erreur'; }
  const bilan = { id: C.id, niveau, budget, genre: G?.id || null, debut: C.debut, duree: Math.round((Date.now() - C.debut) / 1000), depart: C.depart, erreur: C.erreur || null,
    etapes: C.etapes, agents: C.agents.map(({ id, role, nom, etat, erreur, cout, hash, touches, fichiers, refus, duree, reponse, paquet, skills }) => ({ id, role, nom, etat, erreur, cout, hash, touches, fichiers, refus, duree, paquet, skills, reponse: (reponse || '').slice(0, 600) })) };
  bilan.cout = +bilan.agents.reduce((s, a) => s + (a.cout || 0), 0).toFixed(2);
  bilan.horsFichier = bilan.agents.filter(a => (a.touches || []).some(f => !a.fichiers.includes(f) && !(a.role === 'Images' && f.startsWith('assets/')))).map(a => `${a.role} ${a.nom || ''}`);
  mkdirSync(join(dir, '.studio'), { recursive: true }); const hf = join(dir, '.studio', 'constructions.json'), h = lireJson(dir, '.studio/constructions.json') || []; h.push(bilan); writeFileSync(hf, JSON.stringify(h, null, 1));
  C = null; emet({ type: 'fin', bilan });
  return bilan;
}
export const historique = dir => lireJson(dir, '.studio/constructions.json') || [];
// « Annuler la construction » : revert de tous ses commits, du plus récent au plus ancien
export function annuler(dir, id) {
  const h = historique(dir), b = h.find(x => x.id === id); if (!b?.depart) return { erreur: 'construction introuvable' };
  const fin = b.agents.map(a => a.hash).filter(Boolean).at(-1); if (!fin) return { erreur: 'rien à annuler' };
  try { git(dir, 'revert', '--no-edit', `${b.depart}..${fin}`); } catch (e) { try { git(dir, 'revert', '--abort'); } catch {} return { erreur: 'annulation impossible sans conflit : ' + e.message.slice(0, 160) }; }
  b.annule = git(dir, 'rev-parse', 'HEAD'); writeFileSync(join(dir, '.studio', 'constructions.json'), JSON.stringify(h, null, 1)); return { ok: true };
}

// node lib/equipe.mjs <projet> [--niveau standard] [--modele haiku] [--sections 2] [--max 3] [--direction "…"] : construction sans l'interface (essais)
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const a = process.argv.slice(2), opt = k => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : undefined; };
  const b = await construire(a[0], { niveau: opt('niveau'), modele: opt('modele'), effort: opt('effort'), sections: opt('sections'), max: +opt('max') || 3, direction: opt('direction'), genre: opt('genre'), fin: opt('fin'), coupes: opt('coupes') }, d => {
    const t = new Date().toLocaleTimeString('fr-FR');
    if (d.type === 'phase') console.log(t, '══', d.phase);
    else if (d.type === 'agent') console.log(t, d.agent.etat === 'travaille' ? '▶' : d.agent.etat === 'fini' ? '✓' : '✗', d.agent.role, d.agent.nom || '', d.agent.erreur || '', d.agent.touches ? '→ ' + d.agent.touches.join(', ') : '', d.agent.refus?.length ? 'refus : ' + d.agent.refus.join(' | ') : '');
    else if (d.type === 'etape') console.log(t, '  ·', d.id, d.outil, String(d.detail).slice(0, 90));
  });
  console.log(JSON.stringify({ erreur: b.erreur, duree: b.duree, cout: b.cout, horsFichier: b.horsFichier }, null, 1));
}
