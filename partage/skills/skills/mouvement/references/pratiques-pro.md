# Motion designer / animateur

Un très bon pro donne intention, poids et personnalité au mouvement, et guide l'attention par la hiérarchie des actions.
Il cale le texte animé sur les accents de la voix et produit chaque image depuis T, avec un aléatoire reproductible.

## Règles
- Construis d'abord les poses clés, puis les intervalles (pose-to-pose).
- Sépare timing (durée de l'action) et espacement (distribution des positions).
- Anticipe les actions majeures pour rendre le départ compréhensible.
- Anime selon le matériau : déformation et rigidité cohérentes.
- Préserve le volume apparent en squash/stretch (l'élargissement compense le raccourcissement).
- Donne plus d'inertie aux masses importantes (compare accélérations et arrêts).
- Utilise des arcs pour l'organique ; garde les lignes droites pour la mécanique.
- Décale légèrement les éléments entraînés par un parent (chevauchement, pas arrêt simultané).
- Subordonne l'action secondaire à l'action principale.
- Évite plusieurs actions fortes concurrentes : séquence les événements importants.
- Adapte l'exagération à la DA : le rebond cartoon n'est pas obligatoire en motion design.
- Choisis la courbe selon le trajet : entrée = décélération, sortie = accélération, déplacement interne = accélération/décélération.
- Pour un déplacement graphique neutre, teste `cubic-bezier(0.4,0,0.2,1)` (référence Material, à adapter au film).
- Pour une petite transition explicative, teste ~200–375 ms (repère d'interface mobile, pas règle cinématographique).
- Allonge la durée quand distance ou transformation augmentent.
- Marque la voix avant la typographie : cale l'arrivée ou l'impact du mot sur le repère sonore.
- Nomme les repères de voix au lieu de disperser des délais opaques (Time Events).
- Sous-titres FR : 17 caractères/s adultes, 13 enfants — pas une limite universelle de kinetic type.
- Sous-titres : entrée près du premier son, tolérance 1–2 images ; n'anticipe pas une révélation.
- Pas plus de 3 flashes sur une seconde (repère conservateur, hors exceptions de seuil WCAG).
- Calcule chaque propriété depuis l'image courante : `T = frame / fps`, sans dépendance à la lecture précédente.
- Remplace `Math.random()` au rendu par un aléatoire à graine stable, indexé par objet et propriété.
- N'utilise pas l'horloge réelle pour évaluer une image : fournis le timestamp explicitement aux outils.

## Erreurs à éviter
- Même courbe et même durée pour tous les mouvements.
- Faire rebondir chaque élément indépendamment du style.
- Tout déplacer simultanément, sans priorité perceptive.
- Déclencher le mouvement au mot accentué alors que son arrivée devait tomber sur ce mot.
- Révéler une chute par le texte avant qu'elle soit prononcée.
- Valider seulement la lecture continue et oublier les images rendues séparément.
- Utiliser un aléatoire différent dans chaque processus de rendu.

## Avant de rendre ton travail
- [ ] Poses, trajectoires et poids servent l'intention.
- [ ] Les actions secondaires restent subordonnées.
- [ ] Les impacts typographiques tombent sur les repères de voix.
- [ ] Les textes restent lisibles et ne révèlent rien prématurément.
- [ ] Les flashes respectent le repère retenu.
- [ ] Une même image évaluée seule ou après navigation donne le même état.
- [ ] Graines et repères temporels sont figés et transmis avec la scène.
- [ ] Contraste et information portée par la couleur sont vérifiés (WCAG).
- [ ] Continuité entre scènes : axes, directions, raccords, parcours du regard.

## Court (9:16) / long (16:9)
- 9:16 : installe immédiatement un événement visuel compréhensible ; l'accroche n'exige pas de mouvement permanent (à tester).
- 9:16 : garde le texte animé dans la zone sûre, trajectoires comprises ; TikTok conseille 5–10 mots/s pour les surimpressions publicitaires, contexte pub et non norme de sous-titres (à tester).
- 16:9 : varie mouvement et immobilité pour garder la hiérarchie (un élément immobile attire le regard dans une scène agitée) ; organise les séquences autour des explications et repères de voix.
- 16:9 : pour des sous-titres FR suivis, pars de 17 caractères/s adultes ; teste les titres expressifs à part.

## Outils
- Tween.js (10,1 k★) — courbes et interpolation de propriétés Three.js — MIT (équations de Robert Penner) ; alerte horloge/état : `update()` sans argument prend le temps courant, `start` et `update` acceptent un temps explicite → privilégier les fonctions de courbe ou reconstruire un état initial connu.
- Motion Canvas (19,4 k★) — prototyper des animations explicatives et synchroniser la voix par événements nommés — MIT ; `useRandom()` est reproductible et conserve sa graine, mais garantie globale que toute scène est fonction pure de T : introuvable.
- opentype.js (5,0 k★) — animer des contours, placer les lettres avec métriques et crénage — MIT ; garantie globale de déterminisme : introuvable ; droits des fichiers de police distincts de ceux du moteur.
