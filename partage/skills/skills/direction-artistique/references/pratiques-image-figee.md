# L'image figée : ce que doit passer chaque plan à l'arrêt

*Repères tirés de Huashu Design (MIT), mesurés sur des démos de produit 16:9, plus lentes qu'un TikTok. Les règles chiffrées de la DA du projet (mesurées sur ses vidéos de référence) passent avant.*

## Principe
- Une vidéo se juge aussi sur ses images arrêtées : mettre en pause à 3 instants (ouverture, milieu, pic), compter les éléments, comparer.
- Invariant par image, pas par plan : 1 sujet concret + ≤ 3 éléments actifs + 1 foyer visuel.
- Un nouvel élément entre ⇒ un ancien sort (disparaît, recule, flou + assombri). Jamais 4 actifs.

## Les 11 lois de l'image figée
1. **Couverture** — 1 sujet concret, ≤ 3 éléments actifs, 1 foyer. Test : pause à 3 instants, compter.
2. **Ancrage du zoom** — un zoom ou un dolly finit sur un concret : logo, chiffre clé, bouton, ligne de code, visage. Jamais du fond, jamais de l'ambiance. En 3D : vrai dolly + FOV, l'arrivée se fait sur l'objet.
3. **Une seule ligne de guidage** — un plan = un seul mouvement de caméra. Si cette ligne ne se nomme pas, corriger la composition, pas inventer un mouvement.
4. **Texte court, plein, dans le vide** — texte à l'écran hors sous-titres : 2 à 6 caractères chinois ≈ 2 à 4 mots courts en français ; action d'abord, déterminant ensuite (« deux temps ») ; posé dans l'espace négatif ; couleur pleine, jamais de contour blanc creux.
5. **Composition chiffrée** — écrire la mise en page en pourcentages, ≥ 3 chiffres. Pas « au centre », mais « sujet à 62 % de la largeur, horizon à 48 % ».
6. **Trois profondeurs** — dire avant / milieu / arrière-plan. Sans les trois, le plan est plat ; en 3D c'est la parallaxe réelle qui les sépare.
7. **Setup → payoff** — la première image pose un manque que le plan comble. Sans manque, le plan n'a pas de raison d'être.
8. **L'abstrait par un verbe** — matérialiser une idée par une action visible : raturer, poser, croître, traverser. Pas de métaphore flottante.
9. **Style fixe, composition variable** — palette, matière et lumière décidées une fois ; chaque plan change la composition. Jamais l'inverse (même cadre, style qui change).
10. **Interdits hérités** — lueur de particules, flux de données, HUD holographique, néon cyber = paresse du motion design, sauf si la DA du projet les demande. En 3D, même réserve sur les particules gratuites. Jamais de liseré coloré à gauche d'un titre ou d'une étiquette (règle du studio, que Huashu classe aussi parmi les marques de « fait par IA »).
11. **Test des 3 mètres** — réduire l'image à la taille d'un téléphone : le plus gros mot doit rester lisible. Sinon le plan est trop chargé ou le texte trop petit.

## Densité visuelle et couches d'ambiance
- Un brief qui ne décrit que récit + caméra produit un fil de fer. Trois clauses obligatoires par plan.
- **Standard de densité** : ordre de grandeur des détails à l'écran + critère exécutable (« image arrêtée posée à côté de la référence, elle ne fait pas honte »).
- **Référence-étalon** : un produit fini existant dont on reprend la fabrication. Pour nous, la vidéo de référence de la DA.
- **Couches d'ambiance** : ancrage au sol par une ligne, ombres douces des éléments, texture de fond, petits suiveurs du héros, micro-mouvement de repos (respiration, curseur, micro-poussée).
- Le vide ennuyeux se guérit par la couche d'ambiance, pas en ajoutant un élément principal.
- Réparation en deux couches : squelette de mouvement d'un côté, finition visuelle de l'autre. En cas de rejet, demander laquelle est en cause.
- Grain : statique (hash fixe), jamais animé — le grain qui bouge ruine la compression.

## Les 5 questions de forme (avant de coder)
- Rôle narratif du plan.
- Distance du spectateur : 10 cm (téléphone), 1 m, 10 m → décide taille de texte et densité.
- Température : calme, excité, froid, autorité, tendre, triste.
- Capacité : 3 croquis de 5 s (rythme démo produit : à adapter) — est-ce que ça rentre ?
- Motif visuel propre au sujet : impossible à nommer ⇒ tirer un autre style.
- Écrire une phrase « la forme vient de … » (dans storyboard.md ou constantes.md), puis le système (couleurs, polices, rythme) dans constantes.md.

## Héros continu
- 1 ou 2 éléments-héros du début à la fin. Chaque scène est un changement d'état du héros (position, taille, couleur, perspective), jamais un nouvel élément.
- Les bords de scène existent dans le script, pas à l'image.
- Test : « c'est un PowerPoint avec voix ? » = échec ; « on veut le revoir » = réussi.
- En 3D : la voiture (ou l'objet) reste, l'environnement change ; une seule scène et une seule caméra partagées.

## Couche motrice de fond
- Sur n'importe quelle image arrêtée subsiste un mouvement de fond : respiration du héros 1 ↔ 1,02 sur ~5 s (rythme démo produit : à adapter), dérive du fond 0 ↔ −20 px, micro-tremblement.
- Image 100 % immobile = diapositive. Le repos n'est jamais l'arrêt total.
- Implémentation : fonctions pures de T (`respire()`, `derive(t)`), aucun état accumulé.

## Pause avant le résultat clé
- Avant un résultat important, tout se fige 0,5 s (rythme démo produit : à adapter) : le spectateur voit avant d'enchaîner.
- Mesure : l'élément-clé apparaît ≥ 0,3 s (rythme démo produit : à adapter) après le dernier mouvement fort ; sinon la pause est mangée.

## Texte : tailles minimales
- Canevas 1080 de large lu sur téléphone : corps ≥ 36 px, étiquette ≥ 28 px (pixels canevas). Le contrôle du studio signale tout texte < 28 px.
- Titre ≥ 2,5× le corps (idéalement 3×).
- ≤ 4 couleurs, ≤ 2 polices, écarts sur une grille de 8 (8/16/24/32/48/64).
- Vide ≥ 40 % de la surface (minimal : 60 %+).
- « Les gens regardent une animation avec moins d'attention qu'une image fixe : la taille de texte ne descend jamais, elle monte. »
- Échelle : ratios 1,2 / 1,25 / 1,333 / 1,5 ; ≤ 5 niveaux ; display 3× à 8× hors échelle.
- Interlignes : display 0,95-1,1 (latin) ; titres 1,1-1,3 ; texte court 1,4-1,5.
- Chaque caractère doit exister dans la police (sinon carré ou vide) : vérifier œ, « », U+202F, ’.

## Contraste
- Ratio WCAG ≥ 4,5 pour le texte normal ; ≥ 3 si « grand » (≥ 24 px, ou ≥ 18,66 px en gras 700).
- Calcul par composition de l'alpha sur le fond opaque le plus proche ; sur dégradé, photo ou canvas, marquer « non calculable » et juger sur la vignette.
- Aucune couleur en dur pour un élément réutilisé sur fond clair et fond sombre (piège type « 05 » invisible sur le plan noir).
- Cas qui sautent aux yeux : sous-titre blanc sur ciel clair, titre sombre sur photo claire.
- Le contraste ne se devine pas : le contrôle du studio mesure les pixels juste au-dessus et au-dessous de chaque texte sans contour ni ombre (« contraste faible » sous 3). Un texte posé sur un fond variable prend une ombre, un contour ou une pastille pleine.

## Réglages du projet
- Si les réglages demandent « fin : boucle », la dernière image retombe sur la première ; s'ils demandent « fin : plan large », plan large immobile ≥ 0,8 s (rythme démo produit : à adapter), jamais finir en gros plan.
- Si les réglages demandent « coupes sèches permises », la coupe franche sur la grille est légale ; si « aucune coupe sèche », chaque raccord est habillé (transition liée).
- Ces deux points sont des options, pas des règles générales.

## Check-list sur une image arrêtée
- [ ] 1 sujet concret, ≤ 3 éléments actifs, 1 foyer visuel.
- [ ] Aucun élément entré sans qu'un autre soit sorti (disparu, reculé, flou + assombri).
- [ ] Les trois profondeurs sont présentes (avant / milieu / arrière).
- [ ] La composition est écrite en ≥ 3 pourcentages.
- [ ] Le zoom ou le dolly arrive sur un ancrage concret, pas sur du fond.
- [ ] Une seule ligne de guidage caméra par plan.
- [ ] Texte (hors sous-titres) : 2 à 4 mots, dans l'espace négatif, couleur pleine, sans contour creux.
- [ ] Le plus gros mot reste lisible en miniature téléphone (test 3 m).
- [ ] Corps ≥ 36 px, étiquette ≥ 28 px, titre ≥ 2,5× le corps.
- [ ] Contraste ≥ 4,5 (≥ 3 si grand), mesuré derrière la boîte.
- [ ] Le héros est présent et identifiable ; aucun nouvel objet ne le remplace.
- [ ] Un mouvement de fond subsiste (respiration, dérive) ; aucun interdit (particules gratuites, flux de données, HUD, néon).
