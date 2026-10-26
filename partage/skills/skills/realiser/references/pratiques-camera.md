# La caméra — budget, paliers, durée, raccords (3D verticale)

*Repères tirés de Huashu Design (MIT), mesurés sur des démos de produit 16:9, plus lentes qu'un TikTok. Les règles chiffrées de la DA du projet (mesurées sur ses vidéos de référence) passent avant.*

## Principe
- A1 : à chaque instant, ce que le spectateur doit voir est dans le cadre, avec 8 % de marge.
- A2 : chaque changement de caméra coûte de l'attention ; il se budgète.
- Un mouvement qui ne répond pas à « quelle question cela résout-il pour le spectateur ? » est supprimé.
- Le choix par défaut est de ne pas bouger ; l'immobilité de caméra est un choix valable. (rythme démo produit : à adapter)
- Pas de secousse « caméra à la main » par défaut.
- En 3D : un seul état de caméra par T, dont dérive tout le reste ; aucun tween propre à un objet.

## Budget d'attention (rythme démo produit : à adapter)
- Écart minimal entre deux changements de caméra : 2,6 à 3,0 s (valeur retenue : 5,0 s).
- Par fenêtre de 15 s : 4 à 5 changements maximum (retenu : 3).
- Densité : 6 plans/min maximum (retenu : 4/min).
- Un plan isolé de moins de 1,2 s ne justifie pas de mouvement de caméra.
- 12 à 15 plans pour 30 s, soit 2 à 3 s par plan ; climax vers 75-80 % de la durée, pas à la fin.
- Plan du héros : au moins 3 s.
- Jamais deux plans de forte énergie à la suite.
- En cas de doute sur un mouvement, ne pas le faire ; sur une durée, prendre la plus longue.

## Paliers de zoom et cadrage
- Paliers : 1,06 (établissement) · 1,3 (léger) · 1,45 (moyen) · 1,8 (fort) · 2,3 (maximum).
- Jamais moins de 1,25×, sauf l'établissement à 1,06× ; plafond 2,3×, valeur retenue 1,8×.
- Au-delà de 2,3× : changer d'image source (2× pleine page, 4× détail, fondu enchaîné de 6 images — rythme démo produit : à adapter).
- Cadrages : 0,78× large · 1× plein · 1,3-1,45× moyen · 1,8× rapproché · 2,3× gros plan.
- Calcul : échelle = 0,8 / la plus grande dimension normalisée de la boîte cible, puis bornage au palier.
- Résultat : sujet à 80 % du cadre, 20 % de respiration, 8 % de marge de sécurité.
- En 3D, traduire cette échelle en distance et FOV, pas en zoom numérique ; une composition de plan s'écrit en pourcentages (≥ 3 chiffres) avant le code.
- Texte porté par le plan : 2 à 4 mots courts en français (conversion de 2 à 6 caractères chinois), dans l'espace négatif, couleur pleine.

## Durée d'un zoom (rythme démo produit : à adapter)
- `durée = 0,55 × |ln(z2/z1)| / ln 2`, bornée à [0,30 ; 0,94] s.
- Exemple : 1→2× = 0,55 s ; 0,78→2,6× = 0,94 s après bornage.
- La durée se calcule, elle ne se règle pas à la main.

## Placement et voix (rythme démo produit : à adapter)
- La caméra arrive 0,15 s avant l'action et reste 1,2 s après.
- Mouvement tombant au milieu d'une phrase : le décaler vers l'avance jusqu'à la pause de voix la plus proche, 0,8 s maximum, jamais en retard.
- Pauses lues dans `words.json` ; un mouvement qui démarre en plein mot est un défaut à vérifier.

## Courbes
- Mouvement voulu : `cubic-bezier(0.65, 0, 0.35, 1)` (≈ `power3.inOut`).
- Caméra de suivi : `cubic-bezier(0.33, 0, 0.15, 1)` — départ vif, freinage long.
- Dérive continue : `sine.inOut` ou linéaire ; seule exception à « jamais linéaire ».
- Pas de ressort ni de dépassement sur la caméra ; la courbe s'applique à la position et à l'orientation, pas au FOV seul.

## Zoom ou dolly (3D)
- Plan d'information (texte, schéma, interface) : zoom, sans parallaxe.
- Plan avec avant-plan, sujet et fond à révéler : dolly, la parallaxe porte l'information.
- Plan 2,5D : profondeur réelle (translateZ) si 8 éléments ou moins ; simulation (ombre, flou, luminosité) à partir de 20 ; entre les deux, seulement si le plan exige la parallaxe.
- Dolly-zoom : coupler distance et FOV (vrai dolly-zoom en Three.js), sujet fixe (respiration ≤ 1,02×), fond de 1 à 2,0-2,5 et opacité ≤ 0,6, durée ≥ 1,2 s (rythme démo produit : à adapter), une seule fois par film.
- Orbite : un seul sujet, sa matière en gros plan, une fois par film ; caméra de côté à rotY dominant (34°) et rotX de 8° ; pas sur une image dense en texte vue de face.
- Pas de « pompe » : entre deux zooms rapprochés, on ne revient pas à 1×.

## Enchaînement entre plans (rythme démo produit : à adapter)
- Moins de 1,5 s entre deux mouvements : classer par distance normalisée entre les foyers.
- Distance < 0,22 : fusionner en un plan (boîte englobante des deux foyers).
- Distance 0,22 à 0,45 : panoramique avec zoom conjoint ≥ 1,25×.
- Distance > 0,45 : abandonner le mouvement le moins motivé ; jamais deux foyers éloignés de suite.
- Écart court : enchaîner sans revenir au repos ; écart ≥ 1,5 s : dézoomer puis rezoomer redevient permis.
- Une seule ligne de guidage par plan, portée par le mouvement ; si elle est introuvable, corriger la composition, pas ajouter un mouvement.
- Le zoom finit sur un ancrage concret (logo, chiffre, objet, visage), jamais sur du fond ou de l'ambiance.

## Transitions (options du projet ; durées = rythme démo produit : à adapter)
- Si les réglages demandent « coupes sèches permises » : coupe franche sur la grille d'images, sans emballage.
- Si les réglages demandent « aucune coupe sèche » : un seul procédé par raccord, dans ce catalogue.
- Flash blanc : pic de 2 à 4 images, 5 images de chaque côté.
- Fondu au noir : vers rgba(20,20,20,0.9), 0,6 s maximum.
- Relais flou : 0→8 px sortant, 8→0 px entrant, au moins 8 images de recouvrement, flou ≤ 24 px.
- Carton noir : tenue ≥ 1 s, 2 par film maximum.
- Whip-pan : tenue ≥ 20 images puis 8 images de balayage sur 1,5 écran, pic ≥ 300 px/image.
- Mask-wipe : courbe (0,4 ; 0 ; 0,6 ; 1), forme issue d'un élément déjà à l'image.
- Coupes cachées : flash, objet au premier plan qui traverse l'écran, coupe sur flou de vitesse.
- Transitions de voyage : élément partagé entre deux plans ; traversée d'une lettre creuse sur au moins 1/3 de la hauteur.
- En 3D, whip-pan et coupe sur flou se calculent depuis la vitesse de caméra, pas depuis un flou appliqué après coup.

## Fin (options du projet)
- Si les réglages demandent « fin : plan large » : sortie de 0,55 s puis plan large immobile ≥ 0,8 s, sans finir sur un gros plan. (rythme démo produit : à adapter)
- Si les réglages demandent « fin : boucle » : ne pas appliquer cette sortie ; la dernière image retombe sur la première, ce qui interdit de finir sur un gros plan éloigné du cadrage d'ouverture.
- Dans les deux cas : pas de fondu au noir de clôture (il casse la boucle ou fabrique un faux raccord).
- Ouverture : film ≥ 14 s dont le premier vrai plan arrive après 7 s → micro-poussée de 1,06× pendant 3,0 s puis retour au plan large ; sans objet pour un TikTok court. (rythme démo produit : à adapter)

## Parallaxe 2,5D
- Couches à 0,35 / 0,7 / 1,4 du déplacement caméra ; rapport ≥ 2 entre couches voisines, sinon la profondeur est illisible.
- 4 couches maximum.
- Tout dérive de l'état caméra : aucun tween propre à une couche.
- Réservé aux plans en calques (photos, cartons) ; en vraie 3D, la perspective s'en charge.

## Finitions dérivées de la vitesse
- Flou de vitesse seulement au-delà de 0,6/s de vitesse de zoom ; intensité `min(10, v × 5)` px ; une image figée reste nette.
- Ombre en retard de 2 images ; rémanence de 4 images : 5 % de retard de trajectoire, flou 6 px, opacité `0,25 × (1 − t)`.
- Rebond amorti après arrêt sec ou whip-pan : `e^(−d·t) · sin(2π·f·t)`, f ≈ 0,1, d ≈ 0,15, amplitude ≤ 3 px ; jamais sur un mouvement doux.
- Mise au point : hors-focus à `brightness(1 − 0,5·i) saturate(1 − 0,3·i) blur(i·4 px)`, opacité `0,4 + 0,6·(1 − i)` ; flash blanc de 150 ms à l'arrivée sur le focus.
- En 3D : profondeur de champ + désaturation ; sans flou, l'élément écarté reste net et ne recule pas.
- Dérive à deux fréquences différentes (évite le cycle visible) : `panX = sin(t·0,22)·40`, `panY = sin(t·0,35)·30` ; version longue `sin(t·0,12)·220 − t·8` et `cos(t·0,09)·120 − t·5`, bornée à ±900/±500 ; en 3D, mêmes formules en unités de scène.
- L'immobilité de caméra est permise ; l'image totalement figée, non : respiration du héros de 1 à 1,02 sur ~5 s, dérive de fond de 0 à −20 px, l'arrêt n'étant admis que comme tenue voulue. (rythme démo produit : à adapter)

## Bords et vérifications (à juger sur les images : check.mjs ne mesure que les à-coups et les coupes hors grille)
- Le décor dépasse le cadre d'au moins l'amplitude du panoramique + 8 %.
- Vérifier les deux extrémités de chaque travelling (captures à T début et T fin) : bord de sol, de ciel ou de décor visible = défaut.
- Compter les changements de caméra par fenêtre de 15 s et par minute ; signaler les plans isolés < 1,2 s. (rythme démo produit : à adapter)
- Comparer chaque zoom à la formule logarithmique, vérifier le bornage [0,30 ; 0,94] et les paliers. (rythme démo produit : à adapter)
- Signaler deux foyers éloignés à moins de 1,5 s, un retour à 1× entre deux zooms, un mouvement démarrant en plein mot. (rythme démo produit : à adapter)
- Vérifier le cadrage à 80 % et la marge de 8 % sur tout ce qui doit être lu.
- Le contrôle dit ce qui est cassé, jamais si c'est beau.
