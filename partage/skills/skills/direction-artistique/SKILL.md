---
name: direction-artistique
description: "Choisir et tenir une direction visuelle : famille de style, références, images de style, hiérarchie, palette par rôle, contraste, typographie et sous-titres lisibles sur téléphone, couleurs justes dans Three.js. À utiliser pour choisir ou régler la DA d'un projet, ou juger sa cohérence."
metadata:
  source: "studio-video/skills/metiers/direction-artistique.md"
---

> Règles des professionnels, avec leurs repères chiffrés : `references/pratiques-image-figee.md`. Lis-les avant de travailler ; leurs sources sont dans `references/recherche.md`.

> Les fichiers annexes (`references/pratiques-image-figee.md`, `references/bibliotheque-da.md`, `references/recherche.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.

# Directeur artistique motion design
Traduit le message en une direction visuelle cohérente, du storyboard aux images de style abouties.
Organise typographie, valeurs, couleur et répétition pour hiérarchiser l'information ; vérifie que le rendu préserve les couleurs décidées.

## Règles
- Jamais de liseré coloré (filet ou barre de couleur à gauche d'un titre, d'une étiquette, d'un cartouche) : règle du studio, pour tous les comptes, même si une DA copiée en a un. La couleur passe par le texte, une pastille pleine ou l'objet.
- Choisis la famille visuelle après le message : 2D, 3D, vectoriel, découpage ou dessin sont des options, pas des recettes par sujet. (à tester)
- Documente chaque référence : ce qu'elle apporte en composition, matière, lumière, univers.
- Transforme les vignettes en images de style avant d'animer ; valide le visuel visé.
- Conçois une série d'images, pas une affiche : vérifie répétition et variations.
- Établis la hiérarchie par taille, contraste, valeur et poids ; l'élément principal doit être identifiable.
- Vérifie les silhouettes et les séparations clair/sombre ; ne compte pas que sur les teintes.
- Définis les couleurs par rôle et par valeur (aucun nombre universel établi).
- Associe un libellé, une forme ou un motif aux différences importantes ; la couleur seule ne porte pas l'information.
- Vise ≥ 4,5:1 de contraste texte/fond — repère WCAG transposé à la vidéo, pas une certification vidéo.
- Ne transpose pas automatiquement l'exception « grand texte » (3:1 chez WCAG) en pixels vidéo.
- Dimensionne la typographie selon résolution et lisibilité (pas de taille minimale universelle sur téléphone).
- Sous-titres FR : 2 lignes max, 42 caractères par ligne — plafond Netflix, pas un objectif à remplir.
- Préserve les unités syntaxiques au retour à la ligne : pas d'article/nom, prénom/nom ni auxiliaire/verbe séparés.
- Évite la concurrence entre sous-titres et texte explicatif ; garde le message utile au récit.
- Place les éléments essentiels dans la zone sûre de la plateforme, selon le gabarit du placement. (à tester)
- Fige une charte réutilisable : palette, typographie, formes, références.
- Annote les textures couleur en `SRGBColorSpace` et les données (normales, rugosité) en `NoColorSpace`.
- Vérifie la conversion de sortie avec `OutputPass` ; évite la double conversion sRGB.

## Erreurs à éviter
- Choisir « de la 3D » avant d'avoir défini le message.
- Copier une référence sans analyser composition, lumière ni matière.
- Valider une belle image isolée sans éprouver la série.
- Distinguer les catégories uniquement par rouge/vert.
- Superposer titres, sous-titres et explications concurrents.
- Compenser une mauvaise conversion colorimétrique en modifiant l'éclairage.

## Avant de rendre ton travail
- [ ] Message, références et famille visuelle documentés.
- [ ] Images de style couvrant plusieurs moments du film.
- [ ] Hiérarchie et silhouettes lisibles sans dépendre des teintes.
- [ ] Contrastes des textes informatifs au repère choisi (≥ 4,5:1).
- [ ] Aucun élément essentiel masqué par l'interface verticale.
- [ ] Image exportée conforme aux couleurs de référence.

## Court (9:16) / long (16:9)
- 9:16 : compose pour les interfaces superposées ; coordonnées exactes selon le placement. (à tester)
- 9:16 : réduis le texte simultané quand il ne tient plus lisiblement ; ne remplis pas les plafonds Netflix.
- 16:9 : réorganise titres, images et légendes pour le cadre horizontal ; n'étire pas la composition.
- 16:9 : garde une grammaire récurrente entre chapitres et épisodes ; ne diminue pas les textes par défaut.
- Teste les textes à leur taille d'affichage prévue (seuil universel en pixels : aucun).

## Outils
- Penpot — planches de style, composants, charte partagée — MPL-2.0 ; usage entreprise permis, redistribution du logiciel soumise aux obligations MPL sur les fichiers concernés ; déterminisme global non établi.
- chroma.js — gammes, mesure de contraste, interpolation dans un espace choisi — BSD-3-Clause (palettes ColorBrewer Apache-2.0) ; alerte : `chroma.random()` utilise `Math.random` par défaut → générateur déterministe ou palette figée.
- opentype.js — mesurer les glyphes, appliquer le crénage, extraire des contours pour titres 3D — MIT ; garantie globale de déterminisme non établie, licence des polices à vérifier séparément.
