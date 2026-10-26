# DA du compte auto — v0.1, **À VALIDER PAR NOAM**

Première vidéo : `videos/Automobile/grosjean/`. Tout ce qui est marqué *(proposé)* attend le feu vert de Noam.

## 1. Les trois régimes d'image (la règle de la série)

| Régime | Quand | Look |
|---|---|---|
| **3D réaliste** | la piste : circuit, course, voitures, impact, pièces | Three.js, matériaux physiques + vernis (niveau `grosjean/3d/monoplace.html`), environnement, ombres, tone mapping ACES. Caméras de broadcast : hélico, caméra de piste au téléobjectif, onboard, vue de dessus. |
| **Données (décryptage)** | on analyse : ralenti, arrêt sur image, rembobinage | la 3D reste dessous, assombrie de 30 % ; par-dessus, l'habillage broadcast (§3). |
| **2D illustrée** | on entre dans la tête ou la vie du pilote (souvenir, peur, famille, citation) | **la 3D se fige** (flash blanc 2 images + léger zoom 102 %), puis l'illustration 2D glisse par-dessus. Quand l'action reprend, la 2D se retire et la 3D repart. |

## 2. Couleurs *(proposé)*

| Rôle | Couleur |
|---|---|
| Fond / nuit | `#07090C` (noir bleuté), dégradés vers `#121821` |
| Texte et données | blanc `#F4F6F8`, gris `#9AA3AE` pour les légendes |
| **Accent données** | jaune broadcast `#FFD23F` (règles, flèches, étiquettes neutres) |
| **Rouge = impact et danger, uniquement** | `#E10600` (contact, choc, feu, angle mort, chrono qui court) |
| Vert = sortie / vivant | `#2BD47D` (une seule fois par vidéo : le chrono qui s'arrête) |
| Écuries | leurs vraies couleurs, seulement sur les étiquettes pilotes (pastille pleine de la couleur, **jamais de liseré à gauche** : Noam trouve que ça « fait IA », règle valable pour tous les comptes) |
| Archive | sépia : `#2A1E14` → `#E9D7B4`, grain + vignette |

## 3. Habillage des données *(proposé)*

- **Typo** : Montserrat 900 *italique* pour les titres et le chiffre-titre (style broadcast F1, penché), Inter 700 pour les étiquettes, **JetBrains Mono 700 pour tous les chiffres** (chasse fixe : les compteurs ne bougent pas).
- **Étiquettes pilotes** (vue du dessus) : pastille pleine couleur d'écurie arrondie 6 px (texte noir ou blanc selon le contraste), sans liseré, code 3 lettres en capitales (VET, SAI, RAI, MAG, GRO, KVY). Reliée à la voiture par un trait fin.
- **Flèches de trajectoire** : pointillés jaunes ; celle qui mène au danger devient rouge.
- **Compteur de vitesse** : arc 240°, valeur en Mono 120 px, unité « KM/H ».
- **Règle** : trait jaune avec graduations, valeur au milieu (« 180 M »).
- **Rapporteur** : arc jaune, l'angle mesuré en rouge (« 29° »).
- **Jauge G** : barre verticale qui se remplit du jaune au rouge (« 67 G »).
- **Chrono officiel** : bandeau en bas de la zone sûre, `0,0 S` en Mono, fond noir 85 %, chiffres rouges tant qu'il court, verts quand il s'arrête (pas de liseré). Repères FIA seulement (0 s choc, 5,5 s drapeau rouge, 11 s voiture médicale, 27 s dehors).
- **Mention « RECONSTITUTION 3D »** : Inter 600, 22 px, blanc 70 %, en haut à gauche de la zone sûre, pendant tout le crash.
- **Chiffre-titre** de l'épisode (ici « 27 S ») : Montserrat 900 italique géant, au hook et à la fin.

## 4. Gel et rembobinage *(proposé)*

- **Entrée dans la tête du pilote (passage en 2D)** : flash blanc (60 %, 0,18 s), puis l'illustration. Réservé à ces moments-là (conseil des Padawans : sinon le flash devient un tic).
- **Gel de données** (arrêt sur image pour une donnée) : pas de flash ; l'image se fige, désaturée (−50 %), zoom lent 100 → 103 %. Son : « clac » d'obturateur.
- **Rembobinage VHS** : l'image repart à l'envers en accéléré, lignes de balayage, décalage RVB de 4 px, bande de bruit qui monte, logo « ◀◀ » en haut à gauche. Son : bande qui rembobine.
- **Ralenti** : badge « RALENTI » (ou le facteur exact s'il est constant) en haut à droite.
- **Raccord de mouvement entre deux plans** (yass.views, 26/10) : plutôt qu'une coupe sèche, le plan sortant part dans une direction en **accélérant** (courbe lente puis rapide), et le plan entrant arrive **dans la même direction** en **freinant** (rapide puis lente). Le tout avec un flou de mouvement à 180° (`--shutter .5`, `sub: 6` sur la scène). Le mouvement continue d'un plan à l'autre et l'œil ne voit pas la coupe. À garder pour les changements de lieu ou de sujet ; la coupe sèche reste pour la boucle et les chocs.

## 5. La 2D *(proposé)*

- Illustration **plate et sombre** : aplats de 3-4 tons, ombres franches, pas de contours noirs épais ; palette nuit (bleus profonds) + la couleur du sujet.
- **Personnes : silhouettes, jamais de visage** (enfants de dos, toujours).
- Archive (Lauda 1976, coupure de presse 2017) : sépia, grain, papier.
- Pensée du pilote : léger flou gaussien (4 px) sur les bords, vignette.

## 6. Sous-titres et zone sûre TikTok (1080×1920)

- Zone sûre : x 60 → 960 (la colonne de droite 960 → 1080 est occupée par les boutons), y 150 → 1500 (le bas 1500 → 1920 est occupé par la légende et la barre).
- Sous-titres : Inter 800, 50 px, blanc, ombre portée noire, 2 lignes max, centrés, 1re ligne à y ≈ 1330 ; le mot en cours en jaune.
- Le chrono vit juste au-dessus (bandeau centré sur y ≈ 1150) pendant le crash, pour ne pas les chevaucher.
- Les textes des inserts 2D vont en haut (y 330-700), jamais dans la bande des sous-titres.

## 7. Interdits

- Rien de gore : pas de brûlures, pas de corps blessé. Les enfants ne sont jamais identifiables.
- Pas d'images TV dans la vidéo : elles servent de référence de cadrage, tout est recréé.
- Aucun chiffre à l'écran qui ne vienne pas d'une source (rapport FIA, sources du script).
