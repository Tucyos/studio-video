# Creatorize : comment c'est fait, et comment le refaire chez nous

19 octobre 2026. Sources : les 13 vidéos de la chaîne @thegruss-i8w (dont le cours de 3 h), soit environ 7 h 30 de vidéo. Toutes sont téléchargées dans `videos/` et transcrites dans `txt/`. 37 images clés du cours sont analysées (`frames/`).
Rapports bruts : `txt/haiku_part1..6.md` (cours), `txt/haiku_z9Xfl.md` (copie de style), `txt/haiku_aHK6.md` (doc de 26 min), `txt/haiku_balayage.md` (8 autres vidéos), `frames/haiku_frames_cours.md` (images), `txt/analyse_gpt.md` (GPT).
Les chiffres de vues et de revenus sont ceux du vendeur, non vérifiés : la chaîne est une vitrine pour un abonnement Skool à 37-127 $/mois.

---

## 1. Ce qu'est vraiment Creatorize

**Une appli de bureau qui pilote une session Claude Code par projet** (« This project has one Claude Code session », visible à l'écran ; qu'elle soit faite en Electron est une déduction). Ce n'est pas un moteur à part : c'est un pack de skills, de documents de référence et d'outils, avec une interface autour. Les captures montrent tout :

- Chaque projet est un dossier `workspace/projects/<slug>/`, sous historique git local (« Saved locally · git history »). On y trouve :
  - `project.json`, `storyboard.md`, `audio/script_timed.txt`, `audio/beds.json` (nappes musicales), `DESCRIPTION.txt` ;
  - **`scenes/s01_hook.js`, `s02_body.js`…** : un fichier JS par section ;
  - **`models.js`** (bibliothèque d'objets 3D écrits en code) et `scenes/kit.js` (outils partagés) ;
  - `assets/` : `manifest.md`, `clips.json`, `credits.json`, `img/`, `map/`, `models/*.glb`.
- Avant de construire, l'agent lit **`references/style_guide.md`, `engine_api.md`, `scene_design.md`, `qa_checklist.md`, `assets.md`, `sound_design.md`** (journal visible à 44:15 du cours).
- Outils de l'agent : « Rendering frames at 137.0s, 143.0s… » (rendu d'images fixes à des instants précis), `check_preview`, `check_layout`.
- Moteur : **Three.js**, « Three.js scenes rendered as crisp low-res pixel art » (description du style Pixel art). Chaque image est une **fonction pure du temps**. L'aperçu est en temps réel dans l'appli. L'export va de **30 à 240 i/s selon le style et le modèle** : 200-240 en pixel art, 30-40 sur ses projets 3D reconstruction faits avec Sonnet ou Haiku. Le moteur est versionné : un bouton « Update engine » fait passer un projet de v1 à v3.
- Modèles : Opus 5.5 conseillé (« compréhension spatiale »), Sonnet 5.5 qualifié de « paresseux », Haiku 5.5 jugé inutilisable seul pour construire. Codex/GPT est accepté depuis peu.

## 2. La chaîne de fabrication, étape par étape

| Étape | Ce qu'il fait | Outil |
|---|---|---|
| Sujet | « Topic finder » : lit les vidéos d'une chaîne de référence et propose un sujet non traité | Claude + recherche web |
| Script | Recherche approfondie, puis un 2ᵉ agent vérifie les faits, puis une passe « humanizer ». Un fichier de faits sourcés avec un niveau de crédibilité, et chaque phrase marquée « citation » ou « conclusion ». Tolérance de durée ±10 %, mots interdits ou obligatoires | Claude |
| Voix | Gemini Flash TTS dans AI Studio (gratuit), ou ElevenLabs, Fish Audio, voix locale. Générée **par paragraphe** pour refaire un seul passage | externe |
| Nettoyage + calage | « Clean and time » : transcription locale + alignement sur la forme d'onde, calage au mot près en 20 ms. **Coupe des silences** réglable (25 pauses retirées, fondu de 20 ms, −13 s sur un short) | Whisper local |
| Direction | Le **directeur** (session principale) découpe en sections, écrit un fichier de constantes partagé (objets et personnages récurrents) et le storyboard, et fait des images de test | Opus |
| Construction | **Équipe en parallèle**, un auteur par fichier : 1 constructeur de scène par section (13 sur une vidéo de 26 min), un « asset scout » qui cherche les vraies images et les modèles 3D libres (poly.pizza, Sketchfab, Wikimedia), un « prop designer » qui code les objets manquants, un décorateur qui pose les lieux. Chaque agent rend des images de ses plans, se corrige, puis passe un `check_layout` avant de rendre | Opus/Sonnet |
| Contrôle | `check_layout` automatique : objets qui se traversent ou flottent, coupés par le cadre, caméra dans un objet, textes qui se chevauchent ou trop petits pour un téléphone, images presque noires ou vides, visages derrière les sous-titres (sous-titres à 70 % de la hauteur), rayon caméra → visage pour détecter un visage caché. Puis un **agent séparé qui ne voit que les images, pas le code** | Opus |
| Ultra Edit | Opus relit chaque image d'un plan et la corrige, en 1 à 3 min par plan | Opus |
| Ultra Edit Plus | Capture d'un plan, **image cible générée par un modèle de diffusion** (Google Flow / Nano Banana), puis Opus retouche la scène 3D jusqu'à s'en approcher (limite de 2 min par image) | diffusion + Opus |
| Retouche humaine | Clic sur un objet de l'aperçu, demande en langage naturel, puis « Applied · 19 min · 8,44 $ » avec la liste des fichiers modifiés, « View changes », « Revert ». Une correction peut être **enregistrée en mémoire** (pour le projet ou pour toutes les vidéos) | Claude |
| Son | Bruitages posés automatiquement sur les actions visibles (portes, chocs). Il passe sa propre bibliothèque **en priorité** et mixe hors appli : musique à −18 sous la voix sans jamais la couper, chocs à −10, sifflements et clics à −15 (unité non dite, sans doute des dB), master à −14 LUFS. Un premier essai avait 69 bruitages pour 47 s ; il est redescendu à 12-20 par minute | script + bibliothèque |
| Export | 16:9, 9:16 recomposé (pas recadré), 4K, sous-titres. Si une scène plante à l'export, Claude la répare et relance | moteur |
| Emballage | 3 titres sur la formule de la chaîne, description, chapitres = sections. Miniature : il donne 3 à 5 miniatures de référence, Claude en tire une « style key » à coller en fin de prompt d'image (API d'image payante) | Claude + API image |
| Routines | Graphe de nœuds planifié, du sujet jusqu'à la mise en ligne YouTube, avec validation par pouce levé | — |

Temps et coûts annoncés : 20 à 90 min de construction par vidéo. Une vidéo de 15 min prend environ 2 % de la limite hebdomadaire d'un forfait Max 20x. Un short de 50 s : 15 à 80 min selon la qualité.

## 3. Le plus intéressant pour toi : copier un style à partir de vidéos de référence

(vidéo z9XflLHoMdg, « 3D cartoon shorts » : 26 M de vues annoncées en quelques jours)

1. **7 vidéos de référence** de la même chaîne (31 à 68 s), extraites à **30 i/s** (9 140 images). « Une image par seconde ne sert à rien : un geste dure 5-6 images. »
2. Découpage en plans, mesure du zoom et du panoramique image par image, calage des mots de la narration à 20 ms près.
3. Claude dresse des tableaux de chaque geste, changement de visage et transition (433 éléments), **chacun rattaché à des numéros d'image** pour pouvoir le revérifier.
4. Tout tient sur **une page de règles chiffrées**. Exemples :
   - Personnage à l'arrêt = **immobile** (pas de respiration). La vie vient de la caméra, des clignements, des expressions et des objets.
   - Le geste **finit 3 à 5 images avant le mot**. La tête continue 2 à 4 images après la main.
   - Le visage change **pendant un clignement**, environ 2 images avant le mot accentué, toutes les 1,2 s. Les lèvres ne bougent pas : « le visage joue, pas la bouche ».
   - La caméra bouge dans 90 % des images (5 %/s entre deux mouvements) et **accélère à chaque transition**.
   - Fondu de 6 images, qui commence sur le 1ᵉʳ mot de la nouvelle phrase, avec les deux images en mouvement.
   - **Chaque chiffre prononcé devient un objet physique** synchronisé sur le mot (compteur LED, jauge, calendrier, horloge) : 38 techniques relevées.
   - Une nouvelle image toutes les 1,1 s (environ 4 mots). Accroche dans les 2-3 premières secondes. **La fin boucle sur le début.**
   - Son : 215 mots/min, voix sur plus de 90 % du temps, pause d'environ 0,2 s entre les phrases.
5. **Ce qui est repris** : timing, cadrage, caméra, lumière, façon de jouer les expressions, idée du « fait = objet ». **Ce qui est créé** : personnages, décors, textes, marques inventées.
6. Le style est ensuite construit par une équipe d'agents, un fichier par domaine (objets, effets, textes et écrans, visages, lieux) : 317 objets codés, 29 lieux, 30 effets, 10 éclairages, 20 personnages, 43 expressions dessinées puis plaquées comme autocollants sur des têtes 3D.
7. **Le style apprend** : après chaque short, chaque défaut est noté avec sa cause et sa correction dans le style. Exemples : « un gros plan coupe le haut de la tête, jamais les yeux » ; détection de visage caché par un rayon partant de la caméra.

**Vérifié à l'image (`frames/haiku_frames_z9xfl.md`, 24 images)** :
- **confirmé** : les règles en nombre d'images (« la tête bouge de moins de 0,5 px par image, images 222-252 », « 2 images avant le mot », paupière mi-close 1 image puis fermée 1 image) ; sept agents « reference 1-7 » ; le directeur, le décorateur et une grille de constructeurs de scène ; les visages en autocollants 2D sur des têtes 3D (43 expressions) ; les sous-titres à environ 70 % de la hauteur ; la musique « 18 LU under the voice », constante, sans baisse sous la voix ; le master à −14 LUFS ;
- **non vu** : le « polisseur » et l'image cible de diffusion d'Ultra Edit Plus ;
- sur son short « Boston », les plans font **1,2 à 2,7 s**.

**Recoupement GPT (`txt/analyse_gpt_clonage.md`)** : il retrouve les mêmes règles chiffrées et propose un format pour la page de règles, une ligne par règle : `ID | règle | valeur | déclencheur | preuves (vidéo + n° d'image + mot) | méthode de mesure | confiance | exceptions`. Il sépare bien ce qui est observé, ce qu'on en interprète et la consigne donnée au moteur. Ses réserves :
- quand il parle de « 28 frames » pour 50 s, il veut dire **28 plans** (50 s à 30 i/s font 1 500 images) ;
- la précision de 20 ms annoncée n'est pas garantie par Whisper seul ;
- la règle des 90 % de caméra en mouvement vient d'**une seule** référence ;
- ses propres shorts restent au-dessus de sa cible de bruitages (19 pour 47 s, soit environ 24 par minute).

Règles de script des shorts : environ 165 mots pour 50 s, une idée par phrase (= une image), le « tu » comme personnage principal, de vrais chiffres prononcés (= des objets à l'écran), une voix rapide.

## 4. Comparaison avec ton moteur `studio/`

| Brique | Creatorize | Toi aujourd'hui | Écart |
|---|---|---|---|
| Scènes = code, fonction du temps | `scenes/sNN_*.js` | `scenes/sNN.html`, `lib/*.js` | **déjà là** |
| Three.js | oui | `lib/koan3d.js`, `nuit3d.js` (GPU RTX via Playwright) | déjà là |
| Voix Gemini + calage Whisper | oui | `voix-off-koan`, `words.py` (turbo) | déjà là (silences à 120 ms) |
| Skills = docs de référence | `references/*.md` | `motion-engine`, `da-koan`, `realisateur-koan`, `sound-design` | déjà là, autrement découpé |
| Script vérifié + humanizer | oui | `storytelling-tiktok`, `humanizer-fr`, Conseil | déjà là, et plus exigeant |
| Mix −14 LUFS + bibliothèque perso | oui | pack SFX de 1 050 sons, `audio.py` | déjà là |
| **Bibliothèque d'objets / lieux / personnages réutilisable** | `models.js`, `kit.js`, 29 lieux, 131 animations Mixamo | partiel : des libs par DA (`pixel.js`, `koan3d.js`…), personnage articulé fait pour Truman (`truman/scenes/perso.js`), mais les objets et décors sont refaits à chaque vidéo | **partiel** : il manque un catalogue commun qui grossit |
| **Équipe d'agents en parallèle** (directeur → constructeurs par section) | oui | une seule session, scène par scène (`motion-engine` §5) | **manque** |
| **Contrôle avant que tu regardes** | `check_layout` géométrique + agent « vision seule » | **partiel** : planches contact aux instants clés (`snap.mjs`), au moins 2 tours de critique par scène, bande d'images autour de chaque coupe (`realisateur-koan`) ; tout est jugé à l'œil par la même session | il manque les tests **automatiques** (collisions, objets en l'air, hors cadre, texte trop petit, image noire) et un relecteur **séparé** qui ne voit que les images |
| **Copie de style depuis des vidéos de référence** | méthode à 30 i/s, page de règles chiffrées | skills DA écrits à la main | **manque** (et c'est le plus rentable) |
| Aperçu temps réel avec scrub + son | appli | `--preview`, `snap.mjs` | partiel |
| Export rapide | 150-240 i/s | capture Playwright image par image | plus lent |
| Retouche par clic + annulation | appli + git | à la main dans le chat | confort, pas prioritaire |
| Routines auto jusqu'à YouTube | oui | non | pas utile pour toi |

**En clair : il n'y a rien de magique.** Ton moteur fait déjà 70 % du travail. Ce qui fait sa différence, c'est quatre choses : (1) une **bibliothèque** qui grossit d'une vidéo à l'autre, (2) des **agents en parallèle**, un fichier chacun, (3) un **contrôle automatique** avant même que tu regardes, (4) une **méthode pour cloner un style** en règles chiffrées.

## 5. Ce que je propose de construire, par ordre d'intérêt

1. **Skill `clone-style`** : vidéos de référence → extraction à 30 i/s (ffmpeg) → détection des coupes → calage des mots (Whisper) → Haiku décrit les images par lots, Opus en tire **une page de règles chiffrées** (`style_<nom>.md`), avec numéros d'image à l'appui. C'est la partie la plus rentable : elle sert à Koan comme au compte auto (une référence « Invisible »/SkyPad, par exemple).
2. **Bibliothèque partagée** `studio/lib/kit/` : objets, lieux, éclairages et caméras nommés, personnage riggé (Mixamo, gratuit) avec ses animations. Chaque nouvelle vidéo y ajoute ses objets, testés seuls à taille réelle.
3. **`check_layout.mjs`** : rend des images à des instants donnés et vérifie les boîtes englobantes Three.js (traversées, objets en l'air, hors cadre, caméra dans un objet), les textes (chevauchement, taille minimale sur téléphone), la luminance (image noire ou vide) et la zone des sous-titres. Puis un agent Haiku « vision seule » relit les planches.
4. **Construction en parallèle** dans le skill `motion-engine` : le directeur écrit `storyboard.md` + `constantes.md`, puis lance N sous-agents (un par section, un fichier chacun), un chercheur d'images et de modèles 3D, et un polisseur.
5. Plus tard : un lecteur HTML avec scrub et son, un export plus rapide (lecture directe du canvas au lieu de captures d'écran), et une variante « Ultra Edit Plus » (cible gpt-image → retouche 3D).

## 5 ter. Fusion avec les idées du compte auto (`videos/Automobile/IDEES-MOTEUR.md`)

Le brief auto (Monza 2021, Le Mans 66) et Creatorize arrivent souvent aux mêmes conclusions :

| Idée du brief auto | Équivalent Creatorize | Verdict |
|---|---|---|
| §1 Studio local : timeline (onde + mots + plans + bruitages), défilement image par image | son éditeur : pistes Shots / Narration / Cues / Audio / Cards / Ambience, aperçu temps réel | **même chose** : c'est son interface, à refaire en HTML local |
| §1.4 Contrôles automatiques en rouge sur la timeline (à-coups, mots couverts, zone sûre, plans trop sombres) | `check_layout` + revue de mise en page | **même chose** ; le brief auto va plus loin (à-coups `traj.mjs`, mots couverts) |
| §1.2 Outil caméra « copier ce cadrage » | 23 mouvements de caméra nommés en bibliothèque | complémentaires : l'outil pour régler, la bibliothèque pour réutiliser |
| §1.6-7 Réglages en direct + rechargement à chaud | clic sur un objet → correction → « Revert » (git) | complémentaires |
| §3 Vitesse : pixels bruts vers ffmpeg ou WebCodecs, rendu en parallèle | export à 30-240 i/s | **même diagnostic** que GPT (§5 bis) : c'est le gain le plus sûr |
| §4 Navigateur d'assets + manifestes + crédits automatiques | `assets/manifest.md`, `credits.json`, `models/*.glb`, poly.pizza / Sketchfab | **même chose** ; c'est la « bibliothèque commune » du §5 point 2 |
| §5 Pastilles de bruitages + pack de Noam filtrable | bibliothèque perso utilisée en priorité, couches musique / effets | même chose |
| §2 Qualité : voie A (postprocessing + N8AO + HDRI) ou voie B (WebGPU) | rien d'équivalent : son rendu est volontairement simple (voxel, pixel, low-poly) | **propre au compte auto**, à garder tel quel |
| — | copie de style depuis des références, agents en parallèle, page de règles qui apprend | **propre à Creatorize**, absent du brief |

**Feuille de route commune proposée** (le même socle sert à Koan et à l'auto) :
1. **Vitesse de rendu** : pixels bruts → ffmpeg + 2-4 pages en parallèle (brief auto §3, confirmé par GPT). Petit travail, gain sur chaque vidéo.
2. **`check_layout` + contrôles sur la timeline** : à-coups, mots couverts, zone sûre TikTok, images noires, objets qui flottent ou se traversent.
3. **Skill `clone-style`** : référence → page de règles chiffrées.
4. **Studio local** : timeline + outil caméra + calques + pastilles de son (brief auto §1 et §5).
5. **Bibliothèque commune + navigateur d'assets + crédits** (brief §4 et Creatorize `models.js`).
6. **Construction en parallèle** par sous-agents (directeur → constructeurs par section).
7. Qualité d'image voie A, puis voie B si besoin (brief §2, auto seulement).

À ne pas casser (brief auto) : la fonction pure de T, le détecteur d'à-coups, les coupes sur la grille des images, la sortie `_tel` de moins de 30 Mo.

## 5 bis. Avis de GPT (`txt/analyse_gpt.md`), en recoupement

GPT n'a reçu que les passages sur le moteur (la vidéo Three.js, la vidéo shorts 3D et la 2ᵉ demi-heure du cours) : son 1ᵉʳ lancement avait échoué faute d'accès aux fichiers. Sur le moteur, il valide l'architecture et ajoute deux choses :
- **Chaque plan construit ses objets une seule fois**, puis une fonction `update(t)` les place à l'instant voulu. C'est ce qui rend le scrub instantané. Le hasard doit utiliser une graine et la physique doit être recalculable : chez toi, c'est déjà la règle (`M.mount`, `g.reset()`).
- **Les 200 i/s** viennent d'un export en temps virtuel (t = n/30, sans attendre l'écran) et d'une lecture des pixels directement dans la page, envoyés par paquets à ffmpeg, au lieu d'une capture d'écran PNG par image. Ce gain reste à mesurer chez toi.
Pièges qu'il ajoute : contrôler aussi les images de transition (pas seulement quelques instants), recaler les mots **après** avoir coupé les silences, et que deux agents n'écrivent jamais le même fichier.

## 6. Pièges vus dans ses vidéos

- Son agent a mis **l'adresse e-mail de l'utilisateur dans l'en-tête User-Agent** d'une requête vers Wikimedia : il l'avoue lui-même dans le panneau Claude, visible à l'écran (cours, 45:30, image vérifiée). Chez nous : jamais de donnée perso dans les requêtes.
- « Don't worry about copyright, it falls under fair use » : c'est faux en France et risqué sur TikTok. Il faut créditer et préférer les sources libres (Wikimedia, CC0, CC-BY).
- Sonnet et Haiku ignorent des consignes : plans de 28 s au lieu de 4-8 s, hélicoptères « Among Us ». Opus reste nécessaire pour construire les scènes 3D.
- Trop de bruitages (69 pour 47 s) : il faut plafonner à 12-20 par minute.
- Ses shorts copient le style d'une chaîne qui marche (sa référence n'est jamais montrée). On peut reprendre le timing et la grammaire, pas les personnages ni l'identité visuelle.
