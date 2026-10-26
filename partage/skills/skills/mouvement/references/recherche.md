# Recherche Codex (gpt-6.1-sol, 22/10/2026), brute, sources comprises

Les mentions **« adaptation studio »** désignent mes propositions pour votre pipeline ; la source soutient le principe, pas nécessairement son implémentation. Les compteurs GitHub ci-dessous sont les valeurs arrondies affichées lors de la consultation du **22 octobre 2026**.

## Réalisateur / storyboarder

**1. Ce que fait un très bon professionnel**

- Transforme le récit en informations visuelles successives ; chaque plan possède une intention. [StudioBinder](https://www.youtube.com/watch?v=AyML8xuKfoc)
- Choisit les coupes selon l’émotion, le récit et le rythme avant la continuité matérielle. [Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- Organise le parcours du regard entre les plans. [Eye trace](https://www.studiobinder.com/blog/walter-murch-rule-of-six/)
- Éprouve le découpage en animatique avec la voix et le son avant l’animation finale. [Ordinary Folk](https://www.ordinaryfolk.co/process)

**2. Règles concrètes**

1. Attribue une fonction à chaque plan : situer, révéler, expliquer, faire ressentir — justifie sa valeur de plan — [source](https://www.youtube.com/watch?v=AyML8xuKfoc).
2. Utilise le plan d’ensemble pour établir les relations spatiales — rends les positions compréhensibles avant les détails — [source](https://www.studiobinder.com/camera-shots/).
3. Réserve le gros plan à l’information ou à l’émotion décisive — choisis ce que le spectateur doit examiner — [source](https://www.youtube.com/watch?v=AyML8xuKfoc).
4. Préserve la relation gauche/droite des sujets — reste du même côté de l’axe des **180°**, sauf rupture intentionnelle — [source](https://www.studiobinder.com/blog/walter-murch-rule-of-six/).
5. Évite deux angles presque identiques du même sujet — changement d’angle d’environ **30° minimum**, repère de continuité — [source](https://moodle.fspac.ubbcluj.ro/pluginfile.php/63000/course/overviewfiles/Roy%20Thompson%2C%20Christopher%20J.%20Bowen-Grammar%20of%20the%20Shot%2C%20Second%20Edition%20%282009%29.pdf).
6. Raccorde les déplacements et les regards — maintiens une direction d’écran intelligible — [source](https://www.studiobinder.com/blog/what-is-continuity-editing-in-film/).
7. Raccorde une action pendant son déroulement quand cela fluidifie la coupe — vérifie la continuité du geste — [source](https://www.studiobinder.com/blog/what-is-continuity-editing-in-film/).
8. Prépare l’emplacement du prochain point d’intérêt — évite une recherche visuelle involontaire après la coupe — [source](https://www.studiobinder.com/blog/walter-murch-rule-of-six/).
9. Choisis un panoramique pour explorer horizontalement, une bascule pour explorer verticalement — distingue rotation et translation — [source](https://www.studiobinder.com/camera-shots/camera-movements/).
10. Choisis un travelling pour modifier le point de vue dans l’espace — un zoom modifie le grossissement optique — [source](https://www.youtube.com/watch?v=IiyBo-qLDeM).
11. Conserve un plan fixe lorsque son cadrage suffit — le mouvement doit servir l’intention — [source](https://www.studiobinder.com/camera-shots/camera-movements/).
12. Arbitre les raccords dans cet ordre : émotion, récit, rythme, regard, planéité, espace — hiérarchie de Murch — [source](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/).
13. Coupe au changement utile de perception ou de rythme — durée universelle optimale d’un plan : **not found** — [source](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/).
14. Documente dialogue, action, durée et type de plan dans chaque vignette — adaptation studio : ajoute `shot_id`, entrée et sortie — [source](https://wonderunit.com/storyboarder/).
15. Monte les vignettes sur la voix avant le rendu détaillé — valide une animatique audiovisuelle — [source](https://www.ordinaryfolk.co/process).
16. Pour Three.js, renseigne explicitement le rapport largeur/hauteur — `aspect = width / height` ; `fov` est **vertical** — [source](https://threejs.org/docs/pages/PerspectiveCamera.html).
17. Après modification de `fov`, `aspect` ou `zoom`, actualise la projection — `updateProjectionMatrix()` — [source](https://threejs.org/docs/pages/PerspectiveCamera.html).
18. Évalue le début d’un long avec la rétention à **30 secondes** — vérifie l’accord entre promesse, titre, miniature et ouverture — [source](https://support.google.com/youtube/answer/9314415).
19. Pour un Short, présente immédiatement l’enjeu visuel — **1 seconde** est le repère personnel de Jenny Hoyos, pas une garantie algorithmique — [source](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/).

**3. Erreurs fréquentes**

- Multiplier les coupes sans progression narrative. [Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- Franchir l’axe involontairement et inverser les positions. [Continuité](https://www.studiobinder.com/blog/what-is-continuity-editing-in-film/)
- Placer l’information suivante loin du regard déjà établi. [Eye trace](https://www.studiobinder.com/blog/walter-murch-rule-of-six/)
- Confondre zoom et déplacement physique de caméra. [Caméra](https://www.youtube.com/watch?v=IiyBo-qLDeM)
- Peaufiner la 3D avant d’avoir validé l’animatique sonore. [Processus](https://www.ordinaryfolk.co/process)

**4. Check-list de fin**

- [ ] Chaque plan possède une fonction explicite. [Valeurs de plan](https://www.youtube.com/watch?v=AyML8xuKfoc)
- [ ] Directions, regards et raccords d’action restent intelligibles. [Continuité](https://www.studiobinder.com/blog/what-is-continuity-editing-in-film/)
- [ ] Chaque coupe respecte ou rompt volontairement la hiérarchie de Murch. [Référence](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- [ ] L’animatique fonctionne avec la voix et le son. [Processus](https://www.ordinaryfolk.co/process)
- [ ] Les deux rapports d’image ont leur cadrage vérifié. [Projection](https://threejs.org/docs/pages/PerspectiveCamera.html)
- [ ] Les plans possèdent durée, action et dialogue documentés. [Storyboarder](https://wonderunit.com/storyboarder/)

**5. Outils utiles**

| Outil / étoiles affichées | Licence | Usage dans le studio et alertes |
|---|---|---|
| [Storyboarder](https://github.com/wonderunit/storyboarder) — **3,9 k★** | **Ambiguë** : « MIT avec exceptions » annoncé ; EULA présent. [Auteur](https://wonderunit.com/thoughts-on-free-and-open-source/) | Vignettes, découpage et animatique. **Alerte redistribution** : l’EULA restreint la redistribution commerciale du logiciel ; ne pas le traiter comme une MIT standard. Déterminisme global : **not found**. [Fonctions](https://wonderunit.com/storyboarder/) · [EULA](https://github.com/wonderunit/storyboarder/blob/master/build/license_en.txt) |
| [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO) — **2,0 k★** | **Apache-2.0**. [Dépôt](https://github.com/AcademySoftwareFoundation/OpenTimelineIO) | Échanger plans, durées et références de médias entre agents et montage. Ce n’est pas un moteur de rendu. Garantie globale de déterminisme : **not found**. [Documentation](https://github.com/AcademySoftwareFoundation/OpenTimelineIO) |
| [Three.js](https://github.com/mrdoob/three.js) — **116,7 k★** | **MIT**. [Dépôt](https://github.com/mrdoob/three.js) | Prévisualiser cadrages et mouvements dans le moteur final. **Alerte horloge** : `Timer.update()` sans timestamp utilise `performance.now()` ; fournir le temps de rendu explicitement. [Timer](https://threejs.org/docs/pages/Timer.html) |

**6. Court vertical / long horizontal**

| Court vertical | Long YouTube 16:9 |
|---|---|
| Construire une accroche immédiate puis une petite histoire autonome ; éviter de seulement raccourcir un long. [YouTube / Hoyos](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/) | Examiner particulièrement les **30 premières secondes**, puis les creux et pics de rétention. [YouTube Analytics](https://support.google.com/youtube/answer/9314415) |
| Recomposer les positions dans la largeur réduite et les zones visibles de l’interface. [TikTok](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en) | Exploiter l’espace horizontal pour montrer les relations entre sujets ; conserver une géographie lisible. [Continuité](https://www.studiobinder.com/blog/what-is-continuity-editing-in-film/) |
| Adaptation studio : produire un découpage vertical dédié. [Projection](https://threejs.org/docs/pages/PerspectiveCamera.html) | Adaptation studio : conserver les mêmes intentions narratives, puis redéfinir cadrages et parcours du regard. [Eye trace](https://www.studiobinder.com/blog/walter-murch-rule-of-six/) |

## Directeur artistique motion design

**1. Ce que fait un très bon professionnel**

- Traduit le message en une direction visuelle cohérente. [Ordinary Folk](https://www.ordinaryfolk.co/process)
- Recherche des références puis transforme le storyboard en images de style abouties. [School of Motion](https://schoolofmotion.com/blog/guide-completing-motion-design-project)
- Organise typographie, valeurs, couleur et répétition pour hiérarchiser l’information. [Design Bootcamp](https://schoolofmotion.com/courses/design-bootcamp)
- Vérifie que le rendu technique préserve les couleurs décidées. [Three.js](https://threejs.org/manual/pages/color-management.html)

**2. Règles concrètes**

1. Choisis la famille visuelle après le message — **2D, 3D, vectoriel, découpage ou dessin** sont des options, pas des recettes par sujet — [source](https://www.ordinaryfolk.co/process).
2. Assemble des références de composition, matières, lumière et univers — documente ce que chaque référence apporte — [source](https://schoolofmotion.com/blog/better-moodboards-storyboards).
3. Transforme les vignettes en images de style avant l’animation — valide le résultat visuel visé — [source](https://schoolofmotion.com/blog/guide-completing-motion-design-project).
4. Conçois une série d’images, pas seulement une affiche — vérifie répétition et variations — [source](https://schoolofmotion.com/courses/design-bootcamp).
5. Établis la hiérarchie par taille, contraste, valeur et poids — rends l’élément principal identifiable — [source](https://schoolofmotion.com/courses/design-bootcamp).
6. Vérifie les silhouettes et séparations clair/sombre — ne compte pas uniquement sur les teintes — [source](https://schoolofmotion.com/blog/better-moodboards-storyboards).
7. Définis les couleurs par rôle et par valeur — nombre universel optimal de couleurs : **not found** — [source](https://www.ibm.com/design/language/color/).
8. Associe un libellé, une forme ou un motif aux différences importantes — la couleur seule ne doit pas porter l’information — [source](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).
9. Vise un contraste texte/fond d’au moins **4,5:1** — repère WCAG transposé à la vidéo, pas certification vidéo — [source](https://www.w3.org/TR/WCAG21/#contrast-minimum).
10. Ne transpose pas automatiquement l’exception « grand texte » en pixels vidéo — WCAG autorise **3:1** dans son contexte défini — [source](https://www.w3.org/TR/WCAG21/#contrast-minimum).
11. Dimensionne la typographie selon résolution et lisibilité — taille minimale universelle sur téléphone : **not found** — [source](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide).
12. Pour les sous-titres français, utilise comme point de départ **2 lignes maximum, 42 caractères par ligne** — plafond Netflix, pas objectif à remplir — [source](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide).
13. Préserve les unités syntaxiques aux retours à la ligne — ne sépare pas article/nom, prénom/nom ou auxiliaire/verbe — [source](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements).
14. Évite la concurrence entre sous-titres et texte explicatif — privilégie le message pertinent pour le récit — [source](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide).
15. Place les éléments essentiels dans la zone sûre de la plateforme — utilise le gabarit correspondant au placement — [source](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en).
16. Fige une charte réutilisable de palette, typographie, formes et références — adaptation studio du travail par système visuel — [source](https://schoolofmotion.com/courses/design-bootcamp).
17. Annote les textures couleur en `SRGBColorSpace` et les données comme normales/rugosité en `NoColorSpace` — distingue couleur et données — [source](https://threejs.org/manual/pages/color-management.html).
18. Vérifie la conversion de sortie avec le post-traitement — `OutputPass` dans la chaîne Three.js concernée ; évite la double conversion sRGB — [source](https://threejs.org/manual/pages/color-management.html).

**3. Erreurs fréquentes**

- Choisir « de la 3D » avant de définir le message. [Ordinary Folk](https://www.ordinaryfolk.co/process)
- Copier une référence sans analyser composition, lumière ou matière. [Recherche visuelle](https://schoolofmotion.com/blog/better-moodboards-storyboards)
- Valider une belle image isolée sans éprouver la série. [Design Bootcamp](https://schoolofmotion.com/courses/design-bootcamp)
- Distinguer les catégories uniquement par rouge/vert. [W3C](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- Superposer titres, sous-titres et explications concurrents. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide)
- Compenser une mauvaise conversion colorimétrique en modifiant l’éclairage. [Three.js](https://threejs.org/manual/pages/color-management.html)

**4. Check-list de fin**

- [ ] Message, références et famille visuelle sont documentés. [Processus](https://www.ordinaryfolk.co/process)
- [ ] Les images de style couvrent plusieurs moments du film. [Méthode](https://schoolofmotion.com/blog/guide-completing-motion-design-project)
- [ ] Hiérarchie et silhouettes restent lisibles sans dépendre des teintes. [Composition](https://schoolofmotion.com/blog/better-moodboards-storyboards)
- [ ] Les contrastes des textes informatifs atteignent le repère choisi. [WCAG](https://www.w3.org/TR/WCAG21/#contrast-minimum)
- [ ] Aucun élément essentiel n’est masqué par l’interface verticale. [TikTok](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en)
- [ ] L’image exportée respecte les couleurs de référence. [Three.js](https://threejs.org/manual/pages/color-management.html)

**5. Outils utiles**

| Outil / étoiles affichées | Licence | Usage dans le studio et alertes |
|---|---|---|
| [Penpot](https://github.com/penpot/penpot) — **61,5 k★** | **MPL-2.0**. [Dépôt](https://github.com/penpot/penpot) | Planches de style, composants et charte partagée. Usage en entreprise permis ; redistribution du logiciel soumis aux obligations MPL sur les fichiers concernés. Déterminisme global : **not found**. [Mozilla](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) |
| [chroma.js](https://github.com/gka/chroma.js) — **10,6 k★** | Texte de type **BSD-3-Clause**, avec palettes ColorBrewer sous **Apache-2.0**. [Licence](https://github.com/gka/chroma.js/blob/main/LICENSE) | Générer des gammes, mesurer le contraste, interpoler dans un espace choisi. **Alerte** : `chroma.random()` utilise `Math.random` par défaut ; fournir un générateur déterministe ou figer la palette. [API](https://gka.github.io/chroma.js/#chroma-random) |
| [opentype.js](https://github.com/opentypejs/opentype.js) — **5,0 k★** | **MIT**. [Dépôt](https://github.com/opentypejs/opentype.js) | Mesurer les glyphes, appliquer le crénage, extraire des contours pour les titres 3D. Garantie globale de déterminisme : **not found** ; licence des polices utilisées à vérifier séparément. [Projet](https://github.com/opentypejs/opentype.js) |

**6. Court vertical / long horizontal**

| Court vertical | Long YouTube 16:9 |
|---|---|
| Adapter la composition aux interfaces superposées ; les coordonnées exactes dépendent du placement. [TikTok](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en) | Réorganiser titres, images et légendes pour le cadre horizontal ; ne pas simplement étirer la composition. Adaptation fondée sur le travail de composition. [School of Motion](https://schoolofmotion.com/blog/better-moodboards-storyboards) |
| Réduire la quantité de texte simultané lorsqu’elle ne tient plus lisiblement ; ne pas remplir systématiquement les plafonds Netflix. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide) | Maintenir une grammaire récurrente entre chapitres et épisodes. Adaptation du travail par système visuel. [Design Bootcamp](https://schoolofmotion.com/courses/design-bootcamp) |
| Tester les textes à leur taille d’affichage prévue ; seuil universel en pixels : **not found**. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide) | Le format horizontal ne justifie pas de diminuer automatiquement les textes : leur taille reste relative à l’affichage. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide) |

## Motion designer / animateur

**1. Ce que fait un très bon professionnel**

- Donne une intention, un poids et une personnalité aux mouvements. [Principes d’animation](https://learn.microsoft.com/en-us/windows/win32/lwef/animation-principles)
- Guide l’attention par la succession des actions et leur hiérarchie. [IBM](https://www.ibm.com/design/language/animation/classic-principles/)
- Synchronise les mots animés avec les accents de la voix. [School of Motion](https://schoolofmotion.com/blog/kinetic-typography-after-effects-part-2)
- Produit des animations pilotées par l’image de rendu et un aléatoire reproductible. [Temps](https://www.remotion.dev/docs/animating-properties) · [Aléatoire](https://www.remotion.dev/docs/using-randomness)

**2. Règles concrètes**

1. Construis d’abord les poses importantes, puis les intervalles — approche *pose-to-pose* — [source](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html).
2. Distingue timing et espacement — durée de l’action d’un côté, distribution des positions de l’autre — [source](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html).
3. Prépare les actions majeures par une anticipation — rends le départ compréhensible — [source](https://learn.microsoft.com/en-us/windows/win32/lwef/animation-principles).
4. Anime selon le matériau — déformation et rigidité doivent rester cohérentes — [source](https://learn.microsoft.com/en-us/windows/win32/lwef/animation-principles).
5. Préserve le volume apparent pendant le squash/stretch — élargissement et raccourcissement doivent se compenser — [source](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html).
6. Donne davantage d’inertie aux masses importantes — compare les accélérations et les arrêts — [source](https://learn.microsoft.com/en-us/windows/win32/lwef/animation-principles).
7. Utilise des arcs pour les mouvements organiques — conserve les lignes droites lorsqu’elles expriment une mécanique — [source](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html).
8. Décale légèrement les éléments entraînés par un parent — chevauchement plutôt qu’arrêt simultané — [source](https://www.ibm.com/design/language/animation/classic-principles/).
9. Subordonne l’action secondaire à l’action principale — elle renforce l’intention sans voler l’attention — [source](https://www.ibm.com/design/language/animation/classic-principles/).
10. Évite plusieurs actions fortes concurrentes — séquence les événements importants — [source](https://www.ibm.com/design/language/animation/classic-principles/).
11. Adapte l’exagération à la direction artistique — le rebond cartoon n’est pas obligatoire en motion design — [source](https://www.ibm.com/design/language/animation/classic-principles/).
12. Choisis la courbe selon le trajet — entrée : décélération ; sortie : accélération ; déplacement interne : accélération/décélération — [source](https://m1.material.io/motion/duration-easing.html).
13. Pour un déplacement graphique neutre, teste `cubic-bezier(0.4,0,0.2,1)` — référence Material, à adapter au film — [source](https://m1.material.io/motion/duration-easing.html).
14. Pour une petite transition explicative, teste environ **200–375 ms** — repère issu d’interfaces mobiles, pas règle cinématographique — [source](https://m1.material.io/motion/duration-easing.html).
15. Allonge la durée si distance ou transformation augmentent — évite une durée identique pour tous les déplacements — [source](https://m1.material.io/motion/duration-easing.html).
16. Marque la voix avant la typographie cinétique — cale l’arrivée ou l’impact du mot sur le repère sonore — [source](https://schoolofmotion.com/blog/kinetic-typography-after-effects-part-2).
17. Nomme les repères de voix plutôt que disperser des délais opaques — adaptation studio des *Time Events* — [source](https://motion-canvas.io/docs/time-events/).
18. Pour les sous-titres français, contrôle la lecture — repère Netflix : **17 caractères/s adultes, 13 enfants** ; ne l’assimile pas à une limite universelle de kinetic type — [source](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide).
19. Pour les sous-titres, cale l’entrée près du premier son — tolérance Netflix de **1–2 images** ; évite d’anticiper une révélation — [source](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines).
20. Évite les flashes répétés — repère conservateur : **pas plus de 3 flashes sur une seconde**, hors exceptions de seuil WCAG — [source](https://www.w3.org/TR/WCAG21/#three-flashes-or-below-threshold).
21. Calcule les propriétés depuis l’image courante — adaptation studio : `T = frame / fps`, sans dépendance à la lecture précédente — [source](https://www.remotion.dev/docs/animating-properties).
22. Remplace `Math.random()` au rendu par un aléatoire à graine stable — adaptation studio : indexe par objet et propriété — [source](https://www.remotion.dev/docs/using-randomness).
23. N’utilise pas l’horloge réelle pour évaluer une image — fournis explicitement le timestamp aux outils concernés — [source](https://threejs.org/docs/pages/Timer.html).

**3. Erreurs fréquentes**

- Appliquer la même courbe et la même durée à tous les mouvements. [Material](https://m1.material.io/motion/duration-easing.html)
- Faire rebondir chaque élément indépendamment du style. [IBM](https://www.ibm.com/design/language/animation/classic-principles/)
- Tout déplacer simultanément, sans priorité perceptive. [IBM](https://www.ibm.com/design/language/animation/classic-principles/)
- Déclencher le mouvement au mot accentué alors que son arrivée devait tomber sur ce mot. [Kinetic type](https://schoolofmotion.com/blog/kinetic-typography-after-effects-part-2)
- Révéler une chute par le texte avant qu’elle soit prononcée. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines)
- Valider seulement la lecture continue et oublier les images rendues séparément. [Rendu](https://www.remotion.dev/docs/animating-properties)
- Utiliser un aléatoire différent dans chaque processus de rendu. [Déterminisme](https://www.remotion.dev/docs/using-randomness)

**4. Check-list de fin**

- [ ] Poses, trajectoires et poids servent l’intention. [Principes](https://learn.microsoft.com/en-us/windows/win32/lwef/animation-principles)
- [ ] Les actions secondaires restent subordonnées. [IBM](https://www.ibm.com/design/language/animation/classic-principles/)
- [ ] Les impacts typographiques tombent sur les repères de voix. [Méthode](https://schoolofmotion.com/blog/kinetic-typography-after-effects-part-2)
- [ ] Les textes restent lisibles et ne révèlent rien prématurément. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines)
- [ ] Les flashes respectent le repère retenu. [WCAG](https://www.w3.org/TR/WCAG21/#three-flashes-or-below-threshold)
- [ ] Adaptation studio : une même image évaluée seule ou après navigation donne le même état. [Animation par image](https://www.remotion.dev/docs/animating-properties)
- [ ] Graines et repères temporels sont figés et transmis avec la scène. [Aléatoire](https://www.remotion.dev/docs/using-randomness) · [Repères](https://motion-canvas.io/docs/time-events/)

**5. Outils utiles**

| Outil / étoiles affichées | Licence | Usage dans le studio et alertes |
|---|---|---|
| [Tween.js](https://github.com/tweenjs/tween.js) — **10,1 k★** | **MIT**, dont équations de Robert Penner. [Licence](https://github.com/tweenjs/tween.js/blob/main/LICENSE) | Courbes et interpolation de propriétés Three.js. **Alerte horloge/état** : `update()` sans argument prend le temps courant ; `start` et `update` acceptent un temps explicite. Pour votre contrat de fonction pure, privilégier les fonctions de courbe ou reconstruire un état initial connu. [Guide](https://tweenjs.github.io/tween.js/docs/user_guide.html) |
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) — **19,4 k★** | **MIT**. [Dépôt](https://github.com/motion-canvas/motion-canvas) | Prototyper des animations explicatives et synchroniser la voix par événements nommés. `useRandom()` est reproductible et conserve sa graine ; ce constat ne prouve pas que toute scène utilisateur est une fonction pure de T. Garantie globale : **not found**. [Temps](https://motion-canvas.io/docs/time-events/) · [Aléatoire](https://motion-canvas.io/docs/random-values/) |
| [opentype.js](https://github.com/opentypejs/opentype.js) — **5,0 k★** | **MIT**. [Dépôt](https://github.com/opentypejs/opentype.js) | Construire des animations de contours et placer les lettres avec leurs métriques et leur crénage. Garantie globale de déterminisme : **not found** ; les droits des fichiers de police restent distincts de ceux du moteur. [Projet](https://github.com/opentypejs/opentype.js) |

**6. Court vertical / long horizontal**

| Court vertical | Long YouTube 16:9 |
|---|---|
| Installer immédiatement un événement visuel compréhensible ; l’accroche ne nécessite pas un mouvement permanent. Adaptation du conseil de Hoyos. [YouTube](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/) | Varier mouvement et immobilité pour conserver une hiérarchie ; un élément immobile peut attirer le regard dans une scène agitée. [Principes](https://learn.microsoft.com/en-us/windows/win32/lwef/animation-principles) |
| Garder le texte animé dans la zone sûre, y compris pendant ses trajectoires. Adaptation des règles de visibilité. [TikTok](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en) | Organiser les séquences animées autour des explications et repères de voix. [Motion Canvas](https://motion-canvas.io/docs/time-events/) |
| TikTok conseille **5–10 mots/s** pour les surimpressions publicitaires : contexte publicitaire, pas norme de lecture des sous-titres. [TikTok](https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en) | Pour des sous-titres français suivis, partir plutôt du repère **17 caractères/s** adultes ; tester séparément les titres expressifs. [Netflix](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217351577-French-France-Timed-Text-Style-Guide) |

**Cinq rôles ou contrôles complémentaires proposés**

1. **Superviseur de continuité visuelle** : contrôle axes, directions, raccords et parcours du regard entre scènes produites par différents agents. [Fondement](https://www.studiobinder.com/blog/what-is-continuity-editing-in-film/)
2. **Contrôleur de déterminisme** : recherche horloges réelles, aléatoire non fixé et dépendances à l’ordre d’évaluation. [Temps](https://threejs.org/docs/pages/Timer.html) · [Aléatoire](https://www.remotion.dev/docs/using-randomness)
3. **Responsable lisibilité et accessibilité** : vérifie contrastes, information portée par la couleur et flashes. [Contraste](https://www.w3.org/TR/WCAG21/#contrast-minimum) · [Couleur](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) · [Flashes](https://www.w3.org/TR/WCAG21/#three-flashes-or-below-threshold)
4. **Superviseur voix–texte–image** : maintient les repères après chaque révision TTS et contrôle les révélations prématurées. [Repères](https://motion-canvas.io/docs/time-events/) · [Synchronisation](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines)
5. **Analyste éditorial de rétention** : confronte les intentions du découpage aux abandons et revisionnages ; un pic peut aussi signaler un passage mal compris. [YouTube Analytics](https://support.google.com/youtube/answer/9314415)
