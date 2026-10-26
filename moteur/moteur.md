# Le moteur du studio (version 3)

La vidéo, c'est `moteur/page.html` : elle lit `project.json` et donne la main, à chaque instant T, à **la section** dont c'est le tour.
Ne modifie jamais `moteur/` : tu écris des sections.

## project.json
```json
{ "titre": "…", "format": "9:16", "fps": 30, "duree": 24.5,
  "plans": [ { "id": "s01", "t0": 0, "t1": 6.2, "fichier": "scenes/s01_hook.js", "brief": "…" } ] }
```
- `t0` / `t1` en secondes de la voix ; le moteur les arrondit à la grille des images (`Math.round(t*30)/30`).
- `audio/words.json` : la voix calée, `{ "words": [{ "w", "start", "end" }], "phrases"?: […] }`. Le moteur en tire les **sous-titres** : une section n'en dessine jamais.

## Une section : `scenes/sNN_nom.js`
```js
export function build(k) {                  // appelé une fois (peut être async : modèles GLB)
  const { g, texte, carte, anim, ease, at, C, F } = k;
  return {
    update(T, t) {                          // à chaque image de la section. T = temps global de la voix, t = T - k.t0
      g.fillStyle = C.nuit; g.fillRect(0, 0, 1080, 1920);
      const a = anim(T, at('menait') - .1, .3);                      // apparaît quand la voix dit « menait »
      carte(g, 100, 700, 880, 300, { alpha: a, barre: C.jaune });
      texte(g, 'IL MENAIT', 540, 800, { f: F.titre, italic: 'italic ', w: 900, size: 120, alpha: a });
      texte(g, 'LA COURSE', 540, 920, { f: F.titre, italic: 'italic ', w: 900, size: 90, color: C.jaune, alpha: anim(T, at('course'), .3, ease.back) });
    },
  };
}
```
**Tout est une fonction pure de T** : `update` ne garde rien d'une image à l'autre (pas de compteur, pas de `+=`), jamais `Math.random` (→ `hash(i, graine)`).
Le moteur remet tout à zéro avant chaque image (fond noir, caméra, groupes cachés) : chaque `update` doit **tout redessiner**.

## Le kit `k`
**2D** (sur `g`, le canvas 1080×1920 de la vidéo — tout texte doit passer par `g.fillText` ou `texte`, sinon les contrôles ne le voient pas)
- `texte(g, s, x, y, {f, size, w, color, align, base, ombre, alpha, italic, ls})` — centré par défaut.
- `carte(g, x, y, w, h, {alpha, col, r, barre})` — fond sombre arrondi ; `barre` = couleur d'un liseré à gauche.
- `lignes(g, s, maxW, size, w, f, n)` → `{l: [lignes], size}` pour un texte trop long.
- `C` = couleurs de la DA (`nuit, nuit2, blanc, gris, jaune, rouge, vert, bleu`) · `F` = polices (`titre` Montserrat 900 italique, `ui` Inter, `mono` JetBrains Mono).

**Temps**
- `at('mot', n = 1, apres = 0)` → l'instant T où la voix dit ce mot (accents et majuscules ignorés).
- `anim(T, debut, duree, ease)` → 0..1 · `ease.out | outExpo | inOut | in | back | linear` · `sstep(a, b, x)` · `clamp` · `lerp`.
- `keys(T, [[t, v, ease?], …])` (clés façon After Effects) · `spring(t)` · `wiggle(T, freq, amp, graine)` · `hash(i, graine)` → 0..1.
- `grille(t)` : arrondit un instant de coupe à la grille des images. Une coupe dans une section : `const i = T < grille(k.t0 + 2.4) ? 0 : 1`.

**3D** (Three.js 0.186, une scène et une caméra partagées)
- `k.groupe` : **ton** `THREE.Group`. Mets-y tout (objets, lumières, sol) : il n'est visible que pendant ta section.
- `k.camera` (perspective, fov 40) : place-la dans `update`. `k.THREE`, `k.scene`, `k.renderer`.
- `rendre3D(g, T, look = LOOK)` : rend la 3D avec le post-traitement de la DA auto (bloom, étalonnage, grain) et la colle sur `g`. Appelle-le **avant** tes textes.
- `ecran(vec3)` → `{x, y, ok}` en pixels (pour une étiquette qui suit un objet).
- `await glb('/assets/models/x.glb')` → une copie du modèle (chargé une fois).
- **Bibliothèque commune** (voitures, décors, accessoires, personnages déjà testés à taille réelle) : `node .studio/bibliotheque.mjs` liste les éléments, `node .studio/bibliotheque.mjs <nom>` en copie un dans le projet, puis `const o = await k.bib('<nom>')` dans `build`. Préfère-la à un objet refait à la main.
  Repère commun : mètres, +Y en haut, **l'avant regarde vers +Z**, posé au sol (y = 0), centré en X et Z (sauf « origine libre » : lis `assets/bib/<nom>/fiche.json` : taille, marqueurs, notes). Pour qu'une voiture roule vers -Z : `o.rotation.y = Math.PI`.
- Personnages animés : `const clips = await k.animations('mannequin_ual')` puis dans update `k.anime(perso, clips, 'Walk_Loop', t)` (jamais de mixer.update : l'image ne dépend que de t).
- Éclairages prêts : `const look = k.eclairage(k.groupe, 'nuit' | 'jour' | 'studio')` dans build, puis `rendre3D(g, T, look)`.
- Caméras nommées (p = 0..1 sur le plan, ex. `p = (T - k.t0) / (k.t1 - k.t0)`) : `k.cam.orbite(centre, {rayon, hauteur, depart, tours, p})`, `k.cam.travelling(de, a, cible, p)`, `k.cam.dolly(cible, dir, d0, d1, p)`, `k.cam.plongee(cible, h0, h1, p)`, `k.cam.suivi(objet, [x, y, z], [vx, vy, vz])`.
- `sujet('nom', objet)` : déclare une voiture, un personnage… Les contrôles vérifient qu'il ne passe pas sous le sol, ne traverse rien, ne tremble pas, n'est pas caché par un texte.
- `k.t0`, `k.t1`, `k.id`, `k.W`, `k.H`, `k.projet` (le project.json).

## Vérifier
- `node .studio/rendre.mjs 3.2 5 7.8` → `qa/snaps/t3.200.png`… : **regarde-les avec Read**.
- `node .studio/controler.mjs 0 6.2` → `qa/rapport.json` (zone sûre, textes, à-coups, sujets…) sur ta plage.
- Une section qui plante s'affiche en **rouge** avec l'erreur, sur sa plage seulement : corrige avant de rendre compte.
- Zone sûre (pixels 1080×1920) : textes entre y = 250 et y = 1680, x entre 60 et 1020, à gauche de x = 895 sous y = 730. Sous-titres vers y = 1425 : rien d'important entre 1300 et 1560.
