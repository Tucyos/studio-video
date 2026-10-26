# Idées pour le moteur vidéo v2 (comptes auto) — brief pour la session « logiciel »

Ce brief a été rédigé le 19/10/2026 par la session qui fabrique les vidéos auto (Monza 2021, Le Mans 66). Il s'adresse à la session Claude Code qui construit le logiciel.

Ce brief rassemble des idées : pour chaque point, vérifie la version actuelle de la bibliothèque avant de l'intégrer.

---

## 0. L'existant (à garder tel quel : c'est ce qui marche)

Chaque vidéo est un dossier `videos/Automobile/<slug>/`, avec :
- `lib/` : le socle ;
  - `core.js` : renderer Three.js r186, ACES, `logarithmicDepthBuffer`, suréchantillonnage ×1,5 ;
  - `post.js` : bloom, étalonnage, aberration, vignette et grain, en GLSL maison ;
  - `d2.js` : les couches 2D (cartes, tampons, etc.) ;
  - `fonts.js` ;
  - `motion.js` : `M.mount`, `window.seek`.
- `scenes/monde.js` : le décor, les voitures et la chorégraphie. `scenes/film.js` : les plans calés sur la voix et les habillages 2D.
- `render.mjs` : Playwright + Chromium GPU (`--use-angle=d3d11`). On fait `seek(T)` pour chaque sous-image, puis `toDataURL('image/jpeg')`, puis ffmpeg (`tmix`). On obtient ainsi le flou de mouvement avec `--sub 4 --shutter .5`.
- `snap.mjs` : des images PNG à des temps donnés. `outils/planche.sh` : une planche contact.
- `outils/traj.mjs` : le détecteur d'à-coups (position des voitures à l'écran et de la caméra, différence seconde, image par image).
- `outils/sons.py` produit `cues.json`. `outils/mix.py` passe par `studio/audio.py` : sidechain, -14 LUFS, contrôle des mots couverts.
- La voix : Gemini TTS, puis `timing.json` (mots + phrases, Whisper).
- Les assets : des GLB Blender produits par des scripts Python, avec des manifestes JSON (dims, marqueurs, axes). Les voitures viennent de Sketchfab, préparées en Blender (roues séparées, origine au moyeu).

**Principes non négociables :**
- **Tout est une fonction pure du temps T**, sans aucun état d'une image à l'autre. C'est ce qui permet de revenir en arrière, de rendre en parallèle et de vérifier image par image.
- Aléatoire déterministe (`hash`), jamais `Math.random`.
- Coupes calées sur la grille des images (`Math.round(t*30)/30`).
- **Les leçons de fluidité de Monza** :
  - pas de tremblement de caméra ;
  - caméras accrochées à un repère lissé (position de la voiture + cap de la piste) ;
  - interpolation Hermite à tangentes non uniformes ;
  - continuité mesurée aux raccords ;
  - rotation des roues plafonnée par une intégrale ;
  - ombre calée sur les texels ;
  - contrôle d'à-coups avant chaque rendu.

---

## 1. Le logiciel : un « studio » local dans le navigateur

C'est le plus gros gain de temps. L'idée : ouvrir `film.html` dans une interface autour de la vidéo.

1. **La timeline.**
   - Défilement image par image (flèches, molette), lecture en temps réel en basse définition (`?draft`).
   - La forme d'onde de la voix, avec les mots de `timing.json` affichés dessous.
   - Les plans (les `add(t0, …)` et les `cut()`) sous forme de blocs cliquables.
   - Les bruitages de `cues.json` sous forme de pastilles déplaçables.
2. **L'outil caméra.** Une caméra libre à la souris (orbite / vol). Un bouton « copier ce cadrage » donne la ligne `cam(V3(…), V3(…), fov)` ou le repère local d'une voiture (`R('n1', x, y, z)`). Option : poser 2-3 clés et prévisualiser le mouvement.
3. **Les calques à allumer et éteindre** :
   - les sous-titres ;
   - la 2D ;
   - la zone sûre TikTok (boutons à droite, légende en bas) ;
   - la grille des tiers ;
   - les trajectoires des voitures dessinées au sol.
4. **Les contrôles automatiques affichés sur la timeline** (en rouge) :
   - les à-coups (`traj.mjs`) ;
   - les mots couverts par les bruitages (`mix.py`) ;
   - les images doublées aux coupes ;
   - les textes qui sortent de la zone sûre ;
   - les plans trop sombres ou trop clairs (histogramme).
5. **La file de rendu** :
   - « rendu final », « version téléphone » (720×1280, CRF 27, moins de 30 Mo), « version iPhone » (2 passes, 4700k, faststart) et « couverture » (`?cover`) ;
   - une barre de progression ;
   - copie automatique dans `G:\Mon Drive\Tiktok\motion design\auto\<sujet>\`.
6. **Des réglages en direct** (Tweakpane ou lil-gui) : exposition, étalonnage, densité de pluie, intensité des reflets, etc. Un bouton « figer » réécrit la valeur dans le code.
7. **Le rechargement à chaud** (Vite) : on modifie `film.js` et l'image se met à jour au même T, sans recharger les voitures.

Bibliothèques utiles :
- **Tweakpane** (cocopon/tweakpane) ou **lil-gui** pour les réglages ;
- **wavesurfer.js** pour la forme d'onde ;
- **camera-controls** (yomotsu/camera-controls) pour l'outil caméra ;
- **Theatre.js** (theatre-js/theatre), un éditeur de timeline et d'images clés pour Three.js, à reprendre ou à imiter pour les clés de caméra.

---

## 2. La qualité d'image : deux voies distinctes, à ne pas mélanger

**Attention :** `postprocessing` (pmndrs) et `N8AO` marchent avec le **WebGLRenderer**. Ils ne marchent pas avec le WebGPURenderer, qui a ses propres effets en nœuds TSL. Il faut choisir une voie.

### Voie A — rester en WebGL et ajouter des bibliothèques (rapide, sans risque)
- **pmndrs/postprocessing** : chaîne d'effets fusionnés. Elle remplacerait `post.js` :
  - bloom, tone mapping ;
  - **LUT** (étalonnage façon film) ;
  - SMAA, profondeur de champ ;
  - aberration chromatique, vignette, bruit.
- **N8python/n8ao** : occlusion ambiante de qualité. Les voitures « posées » au sol, les recoins des stands, sous les bottes de paille. Le meilleur gain de réalisme pour le coût.
- **0beqz/realism-effects** : SSGI, SSR (reflets à l'écran), TRAA, flou de mouvement par vecteurs. Moins maintenu, à tester.

### Voie B — passer au moteur WebGPU de Three.js (plus moderne, plus de travail)
- Le **WebGPURenderer + TSL** (dans mrdoob/three.js, `three/webgpu`, `three/tsl`). Ses effets intégrés :
  - **GTAO** (occlusion ambiante, l'équivalent de N8AO) ;
  - **SSR** (reflets à l'écran, très utile pour la piste mouillée) ;
  - SSGI, **TRAA** (anti-crénelage temporel) ;
  - bloom, profondeur de champ ;
  - flou de mouvement à partir des vecteurs de vitesse (il pourrait remplacer une partie des sous-images, donc rendre plus vite).
- **À réécrire en TSL** :
  - `post.js` ;
  - le shader de piste mouillée (`WETSH` dans `le-mans-66/scenes/monde.js`), avec `Reflector` remplacé par `ReflectorNode` ;
  - les gerbes d'eau (billboards instanciés) ;
  - toute la 2D, qui reste sur canvas et ne change pas.
- **À vérifier en premier** :
  - que le Chromium sans fenêtre de Playwright fait bien tourner WebGPU sur la RTX ;
  - la lecture des images (le canvas WebGPU doit être lisible).

### La méthode recommandée
1. Prendre un plan test : l'image du hook du Mans 66 (`le-mans-66`, T = 0,5 s : pluie, reflets, gerbes, trois GT40).
2. Le refaire en voie A, puis en voie B.
3. Comparer côte à côte (PNG) avec les temps de rendu.
4. Ne migrer qu'une fois, après avoir choisi.

### Autres gains de qualité
- **Un éclairage par HDRI** : Poly Haven (CC0) a des ciels couverts, ensoleillés et de crépuscule. Aujourd'hui l'environnement est un dégradé maison ; un vrai HDRI donne des reflets de carrosserie beaucoup plus crédibles.
- **Des textures PBR Poly Haven / ambientCG** (CC0) : asphalte, béton, herbe, en 4K avec normal et roughness.
- **Une vraie profondeur de champ** sur les gros plans (macro des roues, nez des voitures).
- **three-gpu-pathtracer** (gkjohnson) : uniquement pour une image fixe (couverture). Trop lent pour la vidéo, plusieurs heures par vidéo. Noam ne veut pas l'utiliser pour la vidéo.

---

## 3. La vitesse de rendu

1. **Ne plus passer par `toDataURL('image/jpeg')` + base64.** C'est lent (compression JPEG dans la page, puis transfert en texte). Deux options :
   - lire les pixels bruts (`readPixels`, ou un `ImageBitmap` transféré) et les envoyer à ffmpeg en `rawvideo rgba` : plus rapide, et sans perte ;
   - ou encoder directement dans le navigateur avec **WebCodecs** + **mediabunny** (Vanilagy, ex-mp4-muxer), en H.264 matériel.
2. **Le rendu en parallèle.** Tout est une fonction pure de T, donc on peut lancer 2 à 4 pages ou processus Chromium, chacun sur une tranche de temps, puis assembler avec ffmpeg (`concat`). Le gain est presque linéaire sur la partie processeur. Attention à la mémoire graphique : chaque page charge les voitures.
3. **Des assets plus légers**, avec **glTF-Transform** (donmccurdy/glTF-Transform) et **meshoptimizer** (zeux) :
   - simplification des maillages ;
   - compression meshopt ;
   - textures redimensionnées en WebP ou **KTX2/Basis** (beaucoup moins de mémoire graphique).

   Les GT40 du Mans font 33 Mo chacune pour 600 k triangles : on peut sûrement diviser leur poids par 3 sans perte visible.
4. **Un cache des scènes chargées** dans le studio : ne pas recharger les GLB à chaque modification de `film.js`.

---

## 4. Le pipeline des assets

- **Un navigateur d'assets** :
  - les GLB de `assets/blender/` avec leurs aperçus et leur manifeste (dims, marqueurs, axes) ;
  - un glisser-déposer dans la scène ;
  - le placement qui écrit la ligne `blc('nom', x, z, rot)`.
- **Une convention d'axes unique**, vérifiée au chargement. Aujourd'hui, chaque asset Blender regarde -Y (Blender) = +Z (three), mais certains ont la piste le long de X ; il faut tout ramener dans un même repère.
- **Un bouton « préparer une voiture Sketchfab »** :
  - séparation des roues (pièces centrées sur l'axe + séries de pièces identiques autour de l'axe) ;
  - origine au moyeu ;
  - allègement ;
  - livrées par projection de décalques puis cuisson.

  Voir `le-mans-66/outils/prep_gt40.py` et `monza-2021/outils/prep_f1.py`.
- **Les crédits automatiques** : chaque asset ou son garde sa source et sa licence (le `asset.extras` des GLB Sketchfab contient auteur, licence et URL), et le logiciel génère la ligne de crédit de la description.

---

## 5. Le son dans le logiciel

- Les pastilles de bruitages sur la timeline (glisser pour recaler, molette pour le volume), qui réécrivent `cues.json`.
- Le pack de Noam (`C:\tiktok\chat\sfx`, catalogue CSV) consultable et filtrable, avec écoute au survol.
- Le contrôle « mots couverts » de `mix.py` affiché sur la timeline.
- Option : **WhisperX** pour un alignement mot à mot plus précis que Whisper seul.

---

## 6. L'ordre de priorité conseillé

1. **La vitesse de rendu** : pixels bruts vers ffmpeg + rendu en parallèle. Un petit travail pour un gros gain à chaque vidéo.
2. **Le studio** : timeline + outil caméra + calques + contrôles.
3. **La voie A** (postprocessing + N8AO + HDRI Poly Haven), testée sur l'image du hook du Mans 66.
4. **glTF-Transform** pour alléger les voitures.
5. **La voie B (WebGPU)**, seulement si la voie A ne suffit plus.
6. Le path tracer : seulement pour les couvertures, si un jour c'est utile.

**À ne pas casser :** la fonction pure de T, le détecteur d'à-coups, les coupes sur la grille des images, et la sortie `_tel` de moins de 30 Mo.
