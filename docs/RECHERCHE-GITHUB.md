# Projets GitHub utiles au studio (20/10/2026)

Recherche faite par Codex (`gpt-6.1-sol`, raisonnement moyen), en lecture seule : aucun dépôt cloné, rien d'exécuté. Les deux points principaux ont été revérifiés sur GitHub le même jour (claude-pxl, HyperFrames). Les étoiles sont des ordres de grandeur.

## claude-pxl (lien donné par Noam)
[crsolver/claude-pxl](https://github.com/crsolver/claude-pxl) — MIT, ~258 étoiles, 2 commits (très jeune), Node ≥ 22.18, aucune dépendance.
- C'est **une skill Claude Code + un outil de pixel art en code** : l'agent écrit un fichier `.px.js`, l'outil produit des PNG (1x + aperçus agrandis avec grille), des planches de sprites (PNG + JSON façon TexturePacker) et des GIF animés ; un visualiseur dans le navigateur rejoue le dessin à chaque sauvegarde.
- Langage : palettes nommées, sprites en grilles de caractères, symétrie, contours, recoloration, tampons, tilemaps, tramage, calques, ombres, animation par modifications d'un sprite de base. La skill enseigne la boucle écrire → générer → regarder → corriger, et de bonnes consignes d'artiste (peu de teintes par matière, symétrie, pas de bruit décoratif).
- Déterminisme : bon dans son cœur (`image(name, seed, t)`, graines), mais un fichier peut encore appeler `Math.random()`.
- **Ce qu'on en ferait** : la fabrique des sprites, visages, accessoires et décors pixel art de nos DA pixel (à figer en version). Elle ne transforme pas une scène Three.js en pixel art : ça, c'est une passe de rendu (ci-dessous).

## Top 10 pour le studio
| # | Projet | Ce qu'on en ferait |
|---|---|---|
| 1 | [Three.js r186 : `RenderPixelatedPass`, `OutlinePass`, `HalftonePass`, `MeshToonMaterial`](https://github.com/mrdoob/three.js/tree/r186/examples/jsm/postprocessing) (MIT) | Presets pixel art 3D (basse résolution + contours profondeur/normales), contours cartoon, trame d'impression — déjà dans notre version de Three.js. |
| 2 | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) (Zlib, compatible three 0.186) | Bloom, profondeur de champ, LUT, réduction de couleurs, effets maison. |
| 3 | [Anime.js v4](https://github.com/juliangarnier/anime) (MIT) | Timelines de titres et transitions, positionnées par `seek(t)` (fonction pure du temps). |
| 4 | [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0, ~68 k) | Le plus proche de notre architecture (HTML/Three.js → navigateur sans fenêtre → FFmpeg, image par image) : à lire pour ses « adaptateurs » qui calent chaque système d'animation sur l'instant demandé. |
| 5 | [Troika three-text](https://github.com/protectwise/troika) (MIT) | Texte net (SDF) dans la scène 3D ; attendre `sync()` et les polices avant la capture. |
| 6 | [claude-pxl](https://github.com/crsolver/claude-pxl) (MIT) | Sprites et décors pixel art écrits par Claude. |
| 7 | [THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) (MIT) | Matières procédurales : papier, peinture, pâte à modeler (en gardant l'éclairage Three.js). |
| 8 | [Rough.js](https://github.com/rough-stuff/rough) (MIT) | Flèches, annotations, schémas « dessinés à la main » — graine non nulle obligatoire (`seed: 0` = aléatoire). |
| 9 | [Rapier](https://github.com/dimforge/rapier) (Apache-2.0) | Chutes, collisions, empilements : précalculés à pas fixes, puis rejoués à l'export. |
| 10 | [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync) (MIT) | Formes de bouche horodatées à partir de la voix : faire parler des visages 2D sur nos personnages 3D. |

## Autres pistes notées
- Pixel art : [niccolofanton/dithering-shader](https://github.com/niccolofanton/dithering-shader) (tramage Bayer 4×4, MIT), [three-pixelate-showcase](https://github.com/WoodNeck/three-pixelate-showcase) (palette + contour 1 px, prototype), [pixel-art-gen](https://github.com/abagames/pixel-art-gen) (petits sprites à graine).
- Rendu stylisé : [spite/sketch](https://github.com/spite/sketch) (hachures, gravure, à porter vers r186), [THREE.Watercolor](https://github.com/mattatz/THREE.Watercolor) (aquarelle, ancienne API), [three-vrm / MToon](https://github.com/pixiv/three-vrm) (personnages anime, expressions).
- Dessin génératif : [p5.js](https://github.com/processing/p5.js) (LGPL, `randomSeed` + `noiseSeed`), [Paper.js](https://github.com/paperjs/paper.js) (Bézier, découpes, SVG).
- Particules : [three.quarks](https://github.com/Alchemist0823/three.quarks) — **attention, `Math.random()` direct** : à contrôler avant usage.
- Photoréalisme : [three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) (demande WebGPU).
- Skills : [threejs-skills](https://github.com/CloudAI-X/threejs-skills), [Anthropic algorithmic-art](https://github.com/anthropics/skills/tree/main/skills/algorithmic-art), [MCP for Blender](https://github.com/ahujasid/mcp-for-blender) (déjà installé ici). [remotion-dev/skills](https://github.com/remotion-dev/skills) : licence non claire, ne rien reprendre.
- Vidéo en code : [Motion Canvas](https://github.com/motion-canvas/motion-canvas) (MIT, bonne organisation des scènes 2D et calage sur la voix), [Revideo](https://github.com/midrender/revideo) (MIT), [Remotion](https://github.com/remotion-dev/remotion) (licence propriétaire : inspiration seulement).

## Règles d'intégration (pour ne pas casser la fonction pure de T)
1. Une seule horloge : l'instant d'export ; jamais `Date.now()` ni le nombre de captures.
2. Un générateur aléatoire à graine par objet (`hash`), jamais `Math.random()` — à vérifier dans chaque bibliothèque (three.quarks, Rough.js…).
3. Attendre que tout soit prêt avant la capture (polices, textures, texte Troika, shaders).
4. Simulations (physique, particules, cheveux) : précalculées à pas fixes, puis rejouées ou mises en cache par image.
5. Versions figées (Three.js, addons, bibliothèques, Chromium).
