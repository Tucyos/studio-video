// bibliotheque.mjs : la bibliothèque commune vue des projets. « Ajouter au projet » = copie de l'élément dans assets/bib/<nom>/
// (lien physique : même disque, zéro octet de plus ; un élément de la bibliothèque ne se modifie jamais, donc le projet reste identique à chaque rendu).
import { existsSync, readFileSync, writeFileSync, mkdirSync, linkSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const BIB = 'C:/claude/studio-projets/_bibliotheque';
export const index = () => { try { return JSON.parse(readFileSync(join(BIB, 'bibliotheque.json'), 'utf8')); } catch { return { elements: [] }; } };
export const element = nom => index().elements.find(e => e.nom === nom);

export function ajouter(dir, nom) {
  const e = element(nom); if (!e) throw new Error(`« ${nom} » n'est pas dans la bibliothèque`);
  const v = +(existsSync(join(dir, 'moteur', 'VERSION')) ? readFileSync(join(dir, 'moteur', 'VERSION'), 'utf8') : 0);   // textures KTX2 : moteur 3 au moins
  if (v < (e.moteur_min || 2)) throw new Error(`« ${nom} » demande le moteur ${e.moteur_min} (ce projet a le moteur ${v || '?'}) : mets d’abord le moteur du projet à jour`);
  const src = join(BIB, 'elements', nom), d = join(dir, 'assets', 'bib', nom); mkdirSync(d, { recursive: true });
  for (const f of [...(e.fichiers || [e.fichier]), 'fiche.json', 'apercu.webp']) { const t = join(d, f); if (existsSync(t)) continue; try { linkSync(join(src, f), t); } catch { copyFileSync(join(src, f), t); } }
  // crédit noté dans le projet (même fichier que le chercheur d'images)
  const cf = join(dir, 'assets', 'credits.json'), c = existsSync(cf) ? JSON.parse(readFileSync(cf, 'utf8')) : [];
  if (!c.some(x => x.fichier === `assets/bib/${nom}/${e.fichier}`)) {
    c.push({ fichier: `assets/bib/${nom}/${e.fichier}`, nom, quoi: e.quoi || nom, source: e.source, licence: e.licence, auteur: e.auteur, credit: e.credit, version: e.version, date: new Date().toISOString().slice(0, 10) });
    writeFileSync(cf, JSON.stringify(c, null, 1));
  }
  return { nom, chemin: `/assets/bib/${nom}/${e.fichier}`, dims_m: e.dims_m, type: e.type, usage: e.usage || `await k.bib('${nom}')` };
}

// les crédits de la description : seulement ce que les scènes utilisent vraiment, et seulement les licences connues (jamais inventé)
export function credits(dir) {
  const cf = join(dir, 'assets', 'credits.json'); if (!existsSync(cf)) return { lignes: [], a_verifier: [] };
  const code = ['scenes'].flatMap(s => { try { return readdirSync(join(dir, s)).filter(f => f.endsWith('.js')).map(f => readFileSync(join(dir, s, f), 'utf8')); } catch { return []; } }).join('\n');
  const G = new Map(), V = [];   // même auteur, même licence, même source : une seule ligne (« GT40 n°1, GT40 n°2 — JEROLDINA (CC BY 4.0) »)
  for (const c of JSON.parse(readFileSync(cf, 'utf8'))) {
    const base = c.fichier.split('/').pop(), utilise = (c.nom && new RegExp(`['"\`/]${c.nom}['"\`/]`).test(code)) || code.includes(base) || code.includes(c.fichier);
    if (!utilise) continue;
    if (c.credit === null || !c.licence || /inconnu|vérifier|maison/i.test(c.licence)) { if (!/maison/i.test(c.licence || '')) V.push(`${c.quoi || base} : licence à vérifier`); continue; }
    const k = [c.auteur, c.licence, c.source].join('|'); if (!G.has(k)) G.set(k, { ...c, quois: [] }); G.get(k).quois.push(c.quoi || base);
  }
  const L = [...G.values()].map(c => `${[...new Set(c.quois)].join(', ')} — ${c.auteur || 'auteur inconnu'} (${c.licence})${/^https?:/.test(c.source || '') ? ' ' + c.source : ''}`);
  return { lignes: L, a_verifier: V, texte: L.length ? 'Crédits : ' + L.join(' · ') : '' };
}

// node lib/bibliotheque.mjs <projet> <nom> : ajoute un élément (le script .studio/bibliotheque.mjs des agents appelle ceci)
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const [dir, nom] = process.argv.slice(2);
  try { const r = ajouter(dir, nom); console.log(`✓ ${nom} ajouté : ${r.usage}  (${r.type}, ${r.dims_m.join(' × ')} m ; fichier ${r.chemin})`); }
  catch (e) { console.error('✗ ' + e.message); process.exit(1); }
}
