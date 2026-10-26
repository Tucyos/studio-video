// skills.mjs : le catalogue de skills du studio (format Agent Skills), fabriqué à partir de ce qui existe déjà
// (skills de tiktok-motion, lu seulement ; moteur.md ; niches.json ; skills/ du dépôt), en un plugin chargé par `claude -p --plugin-dir`.
// Aucune skill n'a d'`allowed-tools` : ce sont les rôles (claude.mjs, equipe.mjs) qui donnent les droits.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
// pas d'import de claude.mjs : il importe ce fichier (un cycle laisserait ses constantes non définies)
const STUDIO_PROJETS = 'C:/claude/studio-projets', STYLES = join(STUDIO_PROJETS, '_styles');

const ICI = join(import.meta.dirname, '..'), TM = 'C:/claude/tiktok-motion';
const SK = n => join(TM, '.claude', 'skills', n, 'SKILL.md'), REF = (n, f) => join(TM, '.claude', 'skills', n, 'references', f);   // skills de tiktok-motion (réorganisées le 26/10 : 7 skills)
export const PLUGIN = join(STUDIO_PROJETS, '_plugin');
const MET = n => join(ICI, 'skills', 'metiers', n + '.md'), HU = n => join(ICI, 'skills', 'huashu', 'pratiques-' + n + '.md'), RCH = n => join(ICI, 'docs', 'recherches-metiers', n + '.md');
// lecture des fichiers annexes des skills, hors du projet (vérifié le 22/10 : sous Windows, seule la forme //c/… marche, pas //C:/…)
export const LIRE_PLUGIN = 'Read(//' + PLUGIN.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, d) => d.toLowerCase()) + '/**)';

// nom : générique (Noam, 20/10 : ce qu'on fait, pas le nom d'un compte) ; corps : le fichier dont on garde le texte ; refs : fichiers annexes
const CATALOGUE = [
  { nom: 'studio', depot: 'skills/studio' },
  { nom: 'ecrire-script', corps: SK('ecrire-script'), refs: { 'pratiques-pro.md': MET('ecrire-script'), 'pratiques-script-viral.md': REF('ecrire-script', 'pratiques-script-viral.md'), 'recherche.md': RCH('scenario-hook-long'), 'anti-ia.md': REF('ecrire-script', 'anti-ia.md'), 'hook.md': REF('ecrire-script', 'hook.md'), 'hooks-log.md': REF('ecrire-script', 'hooks-log.md'), 'conseil.md': REF('ecrire-script', 'conseil.md'), 'storytelling-analyses.md': join(TM, 'notes', 'storytelling-analyses.md') },
    description: "Trouver le sujet et écrire le script (voix off) d'une vidéo TikTok / Shorts : format (énigme, vulgarisation, contre-intuition, récit, démontage…), hook, re-hooks, transitions, voix parlée, émotion, chute. Contient la chasse aux tournures « IA » (references/anti-ia.md). À utiliser pour tout script ou toute réécriture de voix off.",
    note: "Écrite pour la chaîne Koan : pour un autre compte, garde la méthode et prends le ton du compte." },
  { nom: 'hook', corps: REF('ecrire-script', 'hook.md'), refs: { 'pratiques-pro.md': MET('hook'), 'pratiques-script-viral.md': REF('ecrire-script', 'pratiques-script-viral.md'), 'recherche.md': RCH('scenario-hook-long'), 'hooks-log.md': REF('ecrire-script', 'hooks-log.md') },
    description: "Écrire, tester et choisir le hook d'une vidéo (0-3 s : texte à l'écran + première image + première phrase). À utiliser après le script et avant la voix, ou quand la rétention chute dans les 3 premières secondes. Journal des hooks déjà essayés : references/hooks-log.md." },
  { nom: 'realiser', corps: SK('realiser'), refs: { 'pratiques-pro.md': MET('realiser'), 'pratiques-storyboard.md': HU('storyboard'), 'pratiques-image-figee.md': HU('image-figee'), 'pratiques-camera.md': HU('camera'), 'recherche.md': RCH('realisation-da-motion') },
    description: "Découper une voix calée au mot près en plans : cadrage, mouvement de caméra, mode visuel par plan, rythme des coupes, storyboard. À utiliser par le directeur avant toute construction, ou pour revoir le découpage d'une vidéo.",
    note: "Écrite pour Koan (fichiers da.md, storyboard.md, assets.md de tiktok-motion). Dans le studio : le découpage va dans project.json (plans) et storyboard.md, la DA est references/<style>.md du projet." },
  { nom: 'moteur-3d', corps: join(ICI, 'moteur', 'moteur.md'), refs: { 'ancien-moteur.md': SK('fabriquer') },
    description: "Écrire ou corriger une scène dans le moteur du studio (Three.js 0.186, sections scenes/sNN_nom.js, kit k, caméra, bibliothèque 3D, sous-titres) en restant une fonction pure du temps T. Projet copié de tiktok-motion (page à lui, sans sections) : lire references/ancien-moteur.md." },
  { nom: 'mouvement', dossier: join(TM, '.claude', 'skills', 'fabriquer', 'mouvement'), licence: 'MIT (LottieFiles), voir LICENSE', refs: { 'pratiques-pro.md': MET('mouvement'), 'pratiques-camera.md': HU('camera'), 'recherche.md': RCH('realisation-da-motion') },
    description: "Principes de motion design : timing, courbes d'accélération, chorégraphie de plusieurs éléments, entrées et sorties, principes de Disney, personnalité du mouvement. À utiliser pour régler une animation qui paraît molle, raide ou confuse." },
  { nom: 'son', corps: SK('son'), refs: { 'pratiques-bruitages.md': MET('son-bruitages'), 'pratiques-mixage.md': MET('son-mixage'), 'recherche.md': RCH('son-mixage-montage') },
    description: "Tout le son d'une vidéo : voix off, bruitages calés sur l'image (matière, rythme), ambiance, musique sous la voix, mix à −14 LUFS sans couvrir les mots. À utiliser pour poser ou corriger des bruitages (cues.json) ou juger un mix." },
  { nom: 'controle-qualite', depot: 'skills/controle-qualite' },
  { nom: 'scenario-long', metier: 'scenario-long', refs: { 'recherche.md': RCH('scenario-hook-long'), 'anti-ia.md': REF('ecrire-script', 'anti-ia.md') },
    description: "Écrire le script d'une vidéo YouTube longue (8-30 min) : documentaire, vulgarisation, fiction, essai. Question centrale, arcs imbriqués, chapitres, alternance faits / sens, idées fausses corrigées. À utiliser pour tout format long 16:9." },
  { nom: 'direction-artistique', metier: 'direction-artistique', refs: { 'pratiques-image-figee.md': HU('image-figee'), 'bibliotheque-da.md': SK('direction-artistique'), 'recherche.md': RCH('realisation-da-motion') },
    description: "Choisir et tenir une direction visuelle : famille de style, références, images de style, hiérarchie, palette par rôle, contraste, typographie et sous-titres lisibles sur téléphone, couleurs justes dans Three.js. À utiliser pour choisir ou régler la DA d'un projet, ou juger sa cohérence." },
  { nom: 'montage', metier: 'montage', refs: { 'pratiques-storyboard.md': HU('storyboard'), 'recherche.md': RCH('son-mixage-montage') },
    description: "Monter : rythme des coupes (règle des six de Murch), inserts et b-roll qui servent la phrase, J-cut / L-cut, raccords, timeline (début, durée, fin exclusive), zones sûres, rétention. À utiliser pour poser ou revoir le rythme d'une vidéo et ses inserts." },
  { nom: 'documentation', metier: 'documentation', refs: { 'recherche.md': RCH('documentation-verification-habillage') },
    description: "Rechercher les faits d'un sujet réel : sources primaires, chronologie, rapports d'enquête (NTSB, BEA), archives et images libres (Wikimedia, Library of Congress, Europeana, NASA) avec leurs droits. À utiliser avant d'écrire un script factuel ou une reconstitution." },
  { nom: 'verification-sources', metier: 'verification-sources', refs: { 'recherche.md': RCH('documentation-verification-habillage') },
    description: "Vérifier chaque affirmation d'un script : affirmations une par une, recoupement, statuts (établi, attribué, hypothèse, introuvable), citations, chiffres, images, reconstitutions signalées, respect des victimes, exagération permise contre fausse information. À utiliser avant la voix pour tout script factuel." },
  { nom: 'habillage', metier: 'habillage', refs: { 'recherche.md': RCH('documentation-verification-habillage') },
    description: "Titre, description, hashtags, chapitres YouTube, couverture TikTok, miniature YouTube (lisible en petit, promesse fidèle), test A/B natif des miniatures YouTube. À utiliser au moment de publier, ou pour améliorer le clic." },
  { nom: 'analyser-resultats', depot: 'skills/analyser-resultats' },
  { nom: 'niches', niches: true,
    description: "Les niches TikTok / Shorts qui marchent (vues médianes des comptes analysés), les accroches mot pour mot, les structures de vidéo, les idées de sujets pour chaque compte. À utiliser pour choisir un sujet, un angle ou une accroche. Chiffres sur de petits échantillons : une tendance, pas une loi." },
];

// le texte d'un SKILL.md sans son en-tête YAML (on réécrit le nôtre : nom générique, pas d'allowed-tools)
const sansEntete = t => { const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(t); return m ? t.slice(m[0].length) : t; };
const entete = (nom, description, licence, source) => `---\nname: ${nom}\ndescription: ${JSON.stringify(description)}\n${licence ? `license: ${JSON.stringify(licence)}\n` : ''}metadata:\n  source: ${JSON.stringify(source)}\n---\n\n`;
const ecrire = (f, txt, faits) => { mkdirSync(dirname(f), { recursive: true }); if (!existsSync(f) || readFileSync(f, 'utf8') !== txt) writeFileSync(f, txt); faits.add(f); };
const fichiers = d => readdirSync(d, { recursive: true }).map(f => join(d, f)).filter(f => statSync(f).isFile());

// niches.json du dernier lot copié -> références lisibles, une valeur par ligne (Read coupe les lignes trop longues)
function niches() {
  const L = join(STYLES, '_lots'); if (!existsSync(L)) return null;
  const lot = readdirSync(L).filter(d => existsSync(join(L, d, 'niches.json'))).sort().at(-1); if (!lot) return null;
  const j = JSON.parse(readFileSync(join(L, lot, 'niches.json'), 'utf8')), v = x => Array.isArray(x) ? x.map(y => typeof y === 'object' ? JSON.stringify(y) : y).join(' ; ') : x;
  const bloc = (titre, liste, cle) => [`# ${titre}`, '', ...(liste || []).flatMap(o => [`## ${o[cle] ?? ''}`, ...Object.entries(o).filter(([k]) => k !== cle).map(([k, x]) => `- ${k} : ${v(x)}`), ''])].join('\n');
  return { lot, refs: {
    'niches.md': [`Lot du ${lot}. ${j.intro || ''}`, '', bloc('Niches', j.niches, 'nom'), ...(j.remarques || []).map(r => '- ' + r), '', '# Points communs', ...(j.points_communs || []).map(r => '- ' + r)].join('\n'),
    'accroches.md': bloc('Accroches (mot pour mot)', j.accroches, 'formule') + '\n' + bloc('Structures', j.structures, 'nom'),
    'idees.md': bloc('Pour les comptes de Noam', j.pour_toi, 'titre') + '\n' + bloc('Idées de sujets', j.idees, 'sujet') + `\n${j.avertissement_idees || ''}\n`,
  } };
}

// sources introuvables à la dernière fabrication (une skill de tiktok-motion déplacée, par exemple) : affichées par `node lib/skills.mjs`
export const manquants = [];
// fabrique (ou met à jour) le plugin ; renvoie la liste des skills. Les fichiers d'une skill retirée du catalogue sont effacés.
export function generer() {
  const faits = new Set(), noms = []; manquants.length = 0;
  ecrire(join(PLUGIN, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'studio', version: '1.0.0', description: 'Le savoir-faire du studio vidéo (généré par lib/skills.mjs : ne pas modifier à la main)' }, null, 1) + '\n', faits);
  for (const s of CATALOGUE) {
    const D = join(PLUGIN, 'skills', s.nom);
    if (s.depot) for (const f of fichiers(join(ICI, s.depot))) ecrire(join(D, relative(join(ICI, s.depot), f)), readFileSync(f, 'utf8'), faits);
    else if (s.dossier) {   // une skill tierce, copiée telle quelle sauf son en-tête
      for (const f of fichiers(s.dossier)) { const r = relative(s.dossier, f); if (r !== 'SKILL.md') ecrire(join(D, r), readFileSync(f, 'utf8'), faits); }
      ecrire(join(D, 'SKILL.md'), entete(s.nom, s.description, s.licence, s.dossier.replace(/\\/g, '/').replace('C:/claude/', '')) + `> Règles des professionnels, avec leurs repères chiffrés : ${Object.keys(s.refs).filter(f => f.startsWith('pratiques')).map(f => '`references/' + f + '`').join(', ')} (sources dans \`references/recherche.md\`), dans le dossier de cette skill.\n\n` + sansEntete(readFileSync(join(s.dossier, 'SKILL.md'), 'utf8')), faits);
      for (const [r, src] of Object.entries(s.refs || {})) if (existsSync(src)) ecrire(join(D, 'references', r), sansEntete(readFileSync(src, 'utf8')), faits); else manquants.push(`${s.nom}/references/${r} : ${src}`);
    } else if (s.niches) {
      const n = niches(); if (!n) continue;
      ecrire(join(D, 'SKILL.md'), entete(s.nom, s.description, null, `_styles/_lots/${n.lot}/niches.json`) + `# Niches, accroches, idées\n\nTiré de l'analyse des comptes copiés (lot du ${n.lot}). Rien n'est à inventer : cite les comptes et les chiffres tels qu'ils sont.\n\nCes fichiers sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.\n\n- \`references/niches.md\` : les niches, leurs vues médianes, ce qui marche.\n- \`references/accroches.md\` : les accroches mot pour mot et les structures de vidéo.\n- \`references/idees.md\` : ce qui convient aux comptes de Noam, et des idées de sujets (faits à vérifier avant d'écrire).\n`, faits);
      for (const [f, t] of Object.entries(n.refs)) ecrire(join(D, 'references', f), t + '\n', faits);
    } else {
      if (s.metier) s.corps = MET(s.metier);
      if (!existsSync(s.corps)) { manquants.push(`${s.nom} (skill entière) : ${s.corps}`); continue; }
      ecrire(join(D, 'SKILL.md'), entete(s.nom, s.description, null, s.corps.replace(/\\/g, '/').replace('C:/claude/', '')) + (s.note ? `> ${s.note}\n\n` : '') + (Object.keys(s.refs || {}).some(f => f.startsWith('pratiques')) ? `> Règles des professionnels, avec leurs repères chiffrés : ${Object.keys(s.refs).filter(f => f.startsWith('pratiques')).map(f => '`references/' + f + '`').join(', ')}. Lis-les avant de travailler ; leurs sources sont dans \`references/recherche.md\`.\n\n` : '') + (s.refs ? `> Les fichiers annexes (${Object.keys(s.refs).map(f => '`references/' + f + '`').join(', ')}) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.\n\n` : '') + sansEntete(readFileSync(s.corps, 'utf8')), faits);
      for (const [f, src] of Object.entries(s.refs || {})) if (existsSync(src)) ecrire(join(D, 'references', f), sansEntete(readFileSync(src, 'utf8')), faits); else manquants.push(`${s.nom}/references/${f} : ${src}`);
    }
    noms.push(s.nom);
  }
  for (const f of fichiers(PLUGIN)) if (!faits.has(f)) rmSync(f);
  return noms;
}

// node lib/skills.mjs : fabrique le plugin et affiche ce qu'il contient
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  console.log(PLUGIN); for (const n of generer()) { const f = join(PLUGIN, 'skills', n, 'SKILL.md');
    console.log(`${n.padEnd(20)} ${String(statSync(f).size).padStart(6)} o  ${fichiers(dirname(f)).length} fichier(s)`); }
  console.log(manquants.length ? `⚠ ${manquants.length} source(s) introuvable(s) :\n  ${manquants.join('\n  ')}` : '✓ toutes les sources trouvées');
}
