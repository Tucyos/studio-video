// importer-tm.mjs : premier remplissage de la bibliothèque depuis tiktok-motion (lecture seule). Une fois ; le journal dit ce qui est entré ou refusé.
// Décors et accessoires faits dans Blender (manifestes assets/blender/*.json), personnages (MakeHuman CC0, Quaternius CC0).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { admettre, BIB } from './admettre.mjs';
const A = 'C:/claude/tiktok-motion/videos/Automobile', Q = `${A}/pitstop/assets/quaternius`;
const MAISON = 'fait maison (Blender, tiktok-motion)';
const liste = [];
for (const p of readdirSync(A)) {
  const d = join(A, p, 'assets/blender'); if (!existsSync(d)) continue;
  for (const m of readdirSync(d).filter(f => f.endsWith('.json'))) {
    const J = JSON.parse(readFileSync(join(d, m), 'utf8'));
    for (const [k, v] of Object.entries(J)) if (v?.fichier?.endsWith('.glb') && existsSync(join(A, p, v.fichier)))
      liste.push({ src: join(A, p, v.fichier), nom: k, type: /vehicule|voiture/.test(m) ? 'voiture' : /accessoire|props/.test(m) ? 'accessoire' : 'decor',
        // l'orientation notée dans le manifeste (« Avant = … (three.js +X) ») : l'élément est tourné pour regarder +Z
        ...(/avant\s*=[^()]*\(three\.js\s*([+-][xz])\)/i.exec(v.notes || '') ? { avant: /avant\s*=[^()]*\(three\.js\s*([+-][xz])\)/i.exec(v.notes)[1].toLowerCase() } : {}), fiche: `${join(d, m)}#${k}`, licence: MAISON, auteur: 'tiktok-motion', source: `${p}/${v.fichier}` });
  }
}
// les GT40 du Mans 66 regardent -Z (repère du moteur du Mans) : tournées vers +Z, posées au sol, centrées
for (const [i, n, q] of [[1, 'miles', 'n°1 (Miles / Hulme)'], [2, 'mclaren', 'n°2 (McLaren / Amon)'], [5, 'bucknum', 'n°5 (Bucknum / Hutcherson)']])
  liste.push({ src: `${A}/le-mans-66/assets/voitures/gt40_${i}.glb`, nom: `gt40_${n}`, type: 'voiture', avant: '-z', recaler: true, quoi: `Ford GT40 Mk II ${q}, Le Mans 1966`, licence: 'CC BY 4.0', auteur: 'JEROLDINA (Sketchfab)',
    source: 'https://sketchfab.com/3d-models/ford-gt40-mk-ii-0be4262997c24714b377ea7144d251e4', notes: 'Livrée refaite pour Le Mans 66 (tiktok-motion). Roues : nœuds séparés.' });
for (const k of ['pilote', 'mecano', 'costume', 'casual', 'pretre']) liste.push({ src: `${A}/rush/assets/blender/humain_${k}.glb`, nom: `humain_${k}`, type: 'personnage', licence: 'CC0 (MakeHuman via MPFB2)', auteur: 'MakeHuman', source: 'rush/assets/blender', notes: 'Squelette Mixamo (noms mixamorig). Pose de repos : bras en A. perso.js du Mans 66 : poses en degrés par os.' });
liste.push({ src: `${Q}/anims/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb`, nom: 'mannequin_ual', type: 'personnage', licence: 'CC0 1.0', auteur: 'Quaternius', source: 'https://quaternius.com', quoi: 'Mannequin Quaternius et ses 43 animations (Universal Animation Library)', notes: 'Les animations (marche, course, assis, conduite, réparation…) s\'appliquent aux personnages Quaternius par nom d\'os.' });
// ponytail: personnages Quaternius de base laissés de côté (le .gltf du pack cite des textures absentes) ; mannequin_ual a le même squelette
if (false) for (const s of ['Male', 'Female']) liste.push({ src: `${Q}/chars/Universal Base Characters[Standard]/Base Characters/Godot - UE/Superhero_${s}_FullBody.gltf`, nom: `quaternius_${s === 'Male' ? 'homme' : 'femme'}`, type: 'personnage', licence: 'CC0 1.0', auteur: 'Quaternius', source: 'https://quaternius.com', notes: 'Même squelette que mannequin_ual : ses animations s\'y appliquent.' });
// un élément « code » fait par le créateur d'objets de la démo phase 5 (enrichit la bibliothèque)
liste.push({ src: 'C:/claude/studio-projets/le-mans-66-equipe/scenes/objets.js', fonction: 'piste_nuit', nom: 'piste_mans_nuit', type: 'lieu', origine: 'libre', licence: 'fait maison (studio)',
  quoi: 'Ligne droite des stands du Mans, la nuit sous la pluie (asphalte mouillé, stands, tribunes, ciel)', notes: 'Fait par le créateur d’objets de la démo phase 5 (le-mans-66-equipe). Piste le long de Z ; option longueur (900 m).' });
const res = { ok: [], refus: [] };
for (const e of liste) {
  if (existsSync(join(BIB, 'elements', e.nom))) { res.ok.push(e.nom + ' (déjà là)'); continue; }
  const { src, ...o } = e, log = () => {};
  try { await admettre(src, { ...o, log }); res.ok.push(e.nom); console.log('✓', e.nom); }
  catch (x) {
    if (/pas centré|pas posé au sol/.test(x.message)) {   // origine du modèle voulue (pivot noté dans le manifeste) : gardée telle quelle si posé au sol, sinon recalé
      try { await admettre(src, { ...o, log, ...(/pas posé au sol/.test(x.message) ? { recaler: true } : { origine: 'libre' }) }); res.ok.push(e.nom); console.log('✓', e.nom, /pas posé/.test(x.message) ? '(recalé)' : '(origine libre)'); continue; } catch (y) { x = y; }
    }
    res.refus.push(`${e.nom} : ${x.message.replace(/\n/g, ' ')}`); console.log('✗', e.nom, x.message.replace(/\n/g, ' ').slice(0, 200));
  }
}
console.log(`\n${res.ok.length} entrés, ${res.refus.length} refusés`); for (const r of res.refus) console.log('  ✗', r);
