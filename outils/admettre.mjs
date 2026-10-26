// admettre.mjs : fait entrer un modèle dans la bibliothèque commune (C:/claude/studio-projets/_bibliotheque), testé seul à taille réelle.
// node outils/admettre.mjs <source.glb> --nom x --type voiture|decor|accessoire|personnage|lieu --licence "…" --auteur "…" --source "…"
//      [--avant -z|+z|+x|-x] [--recaler] [--origine libre] [--fiche manifeste.json#cle] [--notes "…"] [--textures 2048] [--sans-optim]
// Étapes : copie (jamais d'écriture dans tiktok-motion) -> [recalage : avant vers -Z, posé au sol, centré] -> allègement (meshopt + WebP)
//   -> vérification avant/après dans Chromium (boîte, nœuds nommés, os, animations) -> convention d'axes -> planche 4 vues -> fiche. Rien n'entre si un test échoue.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, resample, textureCompress, reorder } from '@gltf-transform/functions';
import { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { cpSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync, statSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { serve, openPlayer } from '../lib/player.mjs';
import { prendre } from '../lib/verrou.mjs';
import { texturesKTX2, ktxDispo } from '../lib/ktx2.mjs';

export const BIB = 'C:/claude/studio-projets/_bibliotheque';
export const CONVENTION = 'mètres ; +Y en haut ; l\'avant regarde vers +Z (norme glTF, comme les décors Blender et les personnages) ; origine au sol (y = 0), centrée en X et Z (sauf « origine libre »)';
const TYPES = ['voiture', 'decor', 'accessoire', 'personnage', 'lieu'];

export async function admettre(src, o) {
  const nom = o.nom; if (!/^[a-z0-9_]+$/.test(nom || '')) throw new Error('--nom : minuscules, chiffres, _ (ex. gt40_miles)');
  if (!TYPES.includes(o.type)) throw new Error('--type : ' + TYPES.join(' | '));
  const dest = join(BIB, 'elements', nom); if (existsSync(dest)) throw new Error(`« ${nom} » existe déjà : un élément de la bibliothèque ne se modifie pas (nouveau nom = nouvelle version, ex. ${nom}_v2)`);
  const tmp = mkdtempSync(join(tmpdir(), 'bib-')), log = o.log || console.log;
  if (src.endsWith('.js')) return admettreCode(src, o, dest, tmp, log);
  copyFileSync(new URL('./banc.html', import.meta.url), join(tmp, 'banc.html'));
  await MeshoptEncoder.ready; await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
  const lacher = await prendre(); const srv = serve(tmp); let p;
  try {
    log('· banc'); p = await openPlayer(srv, 'banc.html', { onError: m => log(m) }); log('· banc prêt');
    const mes = f => { log('· mesure ' + f); return p.page.evaluate(u => window.mesurer(u), '/' + f); };
    // 1. recalage (facultatif) : un nœud racine tourne l'avant vers -Z, puis pose au sol et centre
    const doc = await io.read(src);   // .glb ou .gltf (+ .bin et textures à côté) ; lu en place, jamais modifié
    let recal = null;
    const ex = doc.getRoot().getAsset().extras || {};   // les modèles Sketchfab portent leur crédit (author, license, source)
    o = { licence: ex.license?.replace(/\s*\(http.*\)$/, ''), auteur: ex.author?.replace(/\s*\(http.*\)$/, ''), source: ex.source, quoi: ex.title, ...o };
    if (!o.licence) throw new Error('licence inconnue : --licence obligatoire (« inconnue — à vérifier » si on ne sait pas)');
    if (o.avant || o.recaler) {
      const ang = { '+z': 0, '-z': Math.PI, '+x': -Math.PI / 2, '-x': Math.PI / 2 }[o.avant || '+z']; if (ang === undefined) throw new Error('--avant (où regarde l\'avant dans le fichier source) : +z | -z | +x | -x');
      const sc = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0], racine = doc.createNode('racine_bib').setRotation([0, Math.sin(ang / 2), 0, Math.cos(ang / 2)]);
      for (const n of sc.listChildren()) { sc.removeChild(n); racine.addChild(n); } sc.addChild(racine);
      await io.write(join(tmp, 'tourne.glb'), doc); const m = await mes('tourne.glb');
      recal = o.origine === 'libre' ? [0, 0, 0] : [-(m.min[0] + m.max[0]) / 2, -m.min[1], -(m.min[2] + m.max[2]) / 2];
      racine.setTranslation(recal.map(x => +x.toFixed(5)));
    }
    await io.write(join(tmp, 'ref.glb'), doc);
    const ref = await mes('ref.glb');
    // 2. allègement : doublons, nœuds inutiles (on GARDE les nœuds vides : ce sont les marqueurs), animations rééchantillonnées, textures WebP, maillages meshopt
    if (!o['sans-optim']) {
      const tx = +o.textures || 2048;
      await doc.transform(dedup({ propertyTypes: ['Accessor', 'Material', 'Texture'] }), prune(   /* pas les maillages : fusionner 4 roues identiques renomme les pièces dont le code se sert */{ keepLeaves: true, keepAttributes: true, keepExtras: true }), resample(),
        ...(ktxDispo() && o.textures !== 'webp' ? [] : [textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [tx, tx] })]), reorder({ encoder: MeshoptEncoder, target: 'size' }));
      if (ktxDispo() && o.textures !== 'webp') await texturesKTX2(doc, { maxPx: Math.min(+tx || 2048, 2048) });   // KTX2 : la texture reste compressée dans la carte graphique
      // compression meshopt SANS quantification : la quantification déplace l'origine des nœuds (vu : pivot du drapeau déplacé), or le moteur tourne les pièces autour
      doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
    }
    await io.write(join(tmp, 'opt.glb'), doc);
    const opt = await mes('opt.glb');
    // 3. avant / après : rien ne doit avoir bougé
    const err = [], tol = Math.max(.01, Math.max(...ref.dims) * .005);
    ref.dims.forEach((d, i) => { if (Math.abs(d - opt.dims[i]) > tol) err.push(`dimension ${'xyz'[i]} : ${d} -> ${opt.dims[i]} m`); });
    for (const [n, q] of Object.entries(ref.noeuds)) { const r = opt.noeuds[n]; if (!r) err.push(`nœud « ${n} » perdu`); else if (Math.hypot(...q.map((x, i) => x - r[i])) > tol) err.push(`nœud « ${n} » déplacé`); }
    if (ref.os !== opt.os) err.push(`os : ${ref.os} -> ${opt.os}`);
    if (ref.skinned !== opt.skinned) err.push(`maillages riggés : ${ref.skinned} -> ${opt.skinned}`);
    if (ref.animations.length !== opt.animations.length) err.push(`animations : ${ref.animations.length} -> ${opt.animations.length}`);
    // 4. convention d'axes (au sol, centré)
    const [dx, , dz] = opt.dims, cx = (opt.min[0] + opt.max[0]) / 2, cz = (opt.min[2] + opt.max[2]) / 2;
    if (o.type === 'voiture' && opt.dims[0] > opt.dims[2]) err.push(`voiture en travers (${opt.dims[0]} m sur X, ${opt.dims[2]} m sur Z) : dire où regarde son avant avec --avant +x ou -x`);
    if (Math.abs(opt.min[1]) > tol) err.push(`pas posé au sol : bas à y = ${opt.min[1]} m (--recaler)`);
    if (o.origine !== 'libre' && (Math.abs(cx) > Math.max(tol, dx * .02) || Math.abs(cz) > Math.max(tol, dz * .02))) err.push(`pas centré : centre à x = ${cx.toFixed(3)}, z = ${cz.toFixed(3)} (--recaler, ou --origine libre)`);
    if (err.length) throw new Error('refusé :\n  - ' + err.join('\n  - '));
    // 5. la planche 4 vues (taille réelle, silhouette 1,80 m, grille 1 m)
    await p.page.evaluate(() => window.charger('/opt.glb')); await p.page.evaluate(l => window.planche(l), o.type === 'lieu');
    const png = Buffer.from((await p.page.evaluate(() => document.getElementById('c').toDataURL('image/png'))).slice(22), 'base64');
    // 6. l'élément
    mkdirSync(join(dest), { recursive: true }); let fiche; try {
    copyFileSync(join(tmp, 'opt.glb'), join(dest, nom + '.glb'));
    writeFileSync(join(dest, 'planche.png'), png); await sharp(png).extract({ left: 800, top: 800, width: 800, height: 800 }).resize(400, 400).webp({ quality: 82 }).toFile(join(dest, 'apercu.webp'));   // vignette = la vue 3/4
    const base = o.fiche ? (() => { const [f, k] = o.fiche.split('#'); const j = JSON.parse(readFileSync(f, 'utf8')); return k ? j[k] : j; })() : {};
    fiche = { nom, version: 1, type: o.type, quoi: o.quoi || '', fichier: nom + '.glb', convention: o.origine === 'libre' ? CONVENTION.replace(', centrée en X et Z (sauf « origine libre »)', ' (origine libre)') : CONVENTION.replace(' (sauf « origine libre »)', ''),
      dims_m: opt.dims, tris: opt.tris, os: opt.os, animations: opt.animations, textures: opt.textures,
      noeuds: Object.keys(opt.noeuds).filter(n => n !== 'racine_bib'), pivots: base.pivots, marqueurs: base.marqueurs, notes: o.notes || base.notes || '',
      recalage: recal && { avant_source: o.avant || '+z', decalage_m: recal.map(x => +x.toFixed(4)), remarque: 'les coordonnées des pivots notées à la source sont dans l\'ancien repère' },
      moteur_min: doc.getRoot().listExtensionsUsed().some(x => x.extensionName === 'KHR_texture_basisu') ? 3 : 2,
      octets_source: statSync(src).size, octets: statSync(join(dest, nom + '.glb')).size,
      licence: o.licence, auteur: o.auteur || '', source: o.source || src, credit: credit({ nom, ...o }), date: new Date().toISOString().slice(0, 10) };
    writeFileSync(join(dest, 'fiche.json'), JSON.stringify(fiche, null, 1));
    } catch (e) { rmSync(dest, { recursive: true, force: true }); throw e; }   // rien d'entré à moitié
    indexer(); log(`✓ ${nom} : ${(fiche.octets_source / 1e6).toFixed(1)} Mo -> ${(fiche.octets / 1e6).toFixed(1)} Mo, ${fiche.tris} triangles, ${fiche.dims_m.join(' × ')} m`);
    return fiche;
  } finally { await p?.close(); srv.close(); lacher(); rmSync(tmp, { recursive: true, force: true }); }
}
// un élément « code » (objet fait par le créateur d'objets d'un projet : géométrie, shaders, animation en fonction du temps) :
// le module source est copié tel quel, l'élément = « export { <fonction> as creer } » ; testé seul, avec le vrai kit du moteur, comme un modèle
async function admettreCode(src, o, dest, tmp, log) {
  if (!o.fonction) throw new Error('--fonction : le nom de la fonction exportée par le module (ex. piste_nuit)');
  if (!new RegExp(`export (async )?function ${o.fonction}\\b|export const ${o.fonction}\\b`).test(readFileSync(src, 'utf8'))) throw new Error(`« ${o.fonction} » n'est pas exporté par ${src}`);
  if (!o.licence) o.licence = 'fait maison (studio)';
  cpSync(join(import.meta.dirname, '..', 'moteur'), join(tmp, 'moteur'), { recursive: true }); writeFileSync(join(tmp, 'project.json'), '{"format":"9:16","plans":[]}');
  copyFileSync(new URL('./banc.html', import.meta.url), join(tmp, 'banc.html')); copyFileSync(src, join(tmp, 'source.js'));
  writeFileSync(join(tmp, o.nom + '.js'), `// ${o.nom} : élément de la bibliothèque (code). Usage dans une section : const { creer } = await import('/assets/bib/${o.nom}/${o.nom}.js'); const x = await creer(k, options)\nexport { ${o.fonction} as creer } from './source.js';\n`);
  const lacher = await prendre(); const srv = serve(tmp); let p; const erreurs = [];
  try {
    p = await openPlayer(srv, 'banc.html', { onError: m => erreurs.push(m) });
    const m = await p.page.evaluate(u => window.mesurerCode(u), `/${o.nom}.js`);
    if (erreurs.length) throw new Error('refusé : erreur dans la page : ' + erreurs.join(' | ').slice(0, 300));
    const err = [], tol = Math.max(.01, Math.max(...m.dims) * .005), cx = (m.min[0] + m.max[0]) / 2, cz = (m.min[2] + m.max[2]) / 2;
    if (!m.tris) err.push('aucun maillage construit');
    if (Math.abs(m.min[1]) > tol && o.origine !== 'libre') err.push(`pas posé au sol : bas à y = ${m.min[1]} m (--origine libre pour un lieu)`);
    if (o.origine !== 'libre' && (Math.abs(cx) > Math.max(tol, m.dims[0] * .02) || Math.abs(cz) > Math.max(tol, m.dims[2] * .02))) err.push(`pas centré (x = ${cx.toFixed(2)}, z = ${cz.toFixed(2)}) : --origine libre`);
    if (err.length) throw new Error('refusé :\n  - ' + err.join('\n  - '));
    await p.page.evaluate(u => window.charger(u), `/${o.nom}.js`); await p.page.evaluate(l => window.planche(l), o.type === 'lieu');
    const png = Buffer.from((await p.page.evaluate(() => document.getElementById('c').toDataURL('image/png'))).slice(22), 'base64');
    mkdirSync(dest, { recursive: true });
    try {
      copyFileSync(join(tmp, o.nom + '.js'), join(dest, o.nom + '.js')); copyFileSync(src, join(dest, 'source.js'));
      writeFileSync(join(dest, 'planche.png'), png); await sharp(png).extract({ left: 800, top: 800, width: 800, height: 800 }).resize(400, 400).webp({ quality: 82 }).toFile(join(dest, 'apercu.webp'));
      const fiche = { nom: o.nom, version: 1, type: o.type, quoi: o.quoi || '', code: true, fichier: o.nom + '.js', fichiers: [o.nom + '.js', 'source.js'], fonction: o.fonction,
        usage: `const { creer } = await import('/assets/bib/${o.nom}/${o.nom}.js'); const x = await creer(k, options)`,
        convention: o.origine === 'libre' ? 'mètres ; +Y en haut ; origine libre (voir les notes)' : CONVENTION.replace(' (sauf « origine libre »)', ''),
        dims_m: m.dims, tris: m.tris, os: 0, animations: [], textures: m.textures, noeuds: Object.keys(m.noeuds), notes: o.notes || '',
        octets_source: statSync(src).size, octets: statSync(src).size, licence: o.licence, auteur: o.auteur || '', source: o.source || src, credit: credit({ nom: o.nom, ...o }), date: new Date().toISOString().slice(0, 10) };
      writeFileSync(join(dest, 'fiche.json'), JSON.stringify(fiche, null, 1));
      indexer(); log(`✓ ${o.nom} (code : ${o.fonction}) : ${fiche.tris} triangles, ${fiche.dims_m.join(' × ')} m`); return fiche;
    } catch (e) { rmSync(dest, { recursive: true, force: true }); throw e; }
  } finally { await p?.close(); srv.close(); lacher(); rmSync(tmp, { recursive: true, force: true }); }
}
// une ligne de crédit pour la description ; rien si la licence n'est pas connue (jamais inventée)
export function credit({ quoi, nom, auteur, licence, source }) {
  if (!licence || /inconnu|vérifier|maison/i.test(licence) || /^(Noam|maison|fait main|moi)$/i.test(auteur || '')) return null;
  return `${quoi || nom} — ${auteur || 'auteur inconnu'} (${licence})${/^https?:/.test(source || '') ? ' ' + source : ''}`;
}
// bibliotheque.json : l'index de toutes les fiches (lu par le studio et donné aux agents)
export function indexer() {
  const d = join(BIB, 'elements'); mkdirSync(d, { recursive: true });
  const L = readdirSync(d).filter(n => existsSync(join(d, n, 'fiche.json'))).map(n => JSON.parse(readFileSync(join(d, n, 'fiche.json'), 'utf8')));
  writeFileSync(join(BIB, 'bibliotheque.json'), JSON.stringify({ convention: CONVENTION, elements: L }, null, 1)); return L;
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const a = process.argv.slice(2), o = {}; let src;
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } else src = a[i];
  try { await admettre(resolve(src), o); } catch (e) { console.error('✗ ' + e.message); process.exit(1); }
}
