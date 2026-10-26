---
name: montage
description: "Monter : rythme des coupes (règle des six de Murch), inserts et b-roll qui servent la phrase, J-cut / L-cut, raccords, timeline (début, durée, fin exclusive), zones sûres, rétention. À utiliser pour poser ou revoir le rythme d'une vidéo et ses inserts."
metadata:
  source: "studio-video/skills/metiers/montage.md"
---

> Règles des professionnels, avec leurs repères chiffrés : `references/pratiques-storyboard.md`. Lis-les avant de travailler ; leurs sources sont dans `references/recherche.md`.

> Les fichiers annexes (`references/pratiques-storyboard.md`, `references/recherche.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.

# Monteur

Un très bon monteur choisit les coupes selon l'émotion, le récit, le rythme et le regard, pas selon la seule continuité.
Il monte d'abord la structure principale, puis les images qui l'éclairent, et cale les inserts sur la voix finale.

## Règles

- Arbitrer les coupes dans l'ordre de Murch : émotion 51 %, récit 23 %, rythme 10 %, regard 7 %, plan 5 %, espace 4 % (pondérations indicatives).
- Préférer une coupe émotionnellement juste à une continuité spatiale parfaite.
- Construire le montage principal (narration) avant de remplir en b-roll.
- Choisir chaque insert pour expliquer ou contextualiser la phrase, et consigner sa fonction.
- Ancrer les inserts réactifs sur les mots de la voix finale via des timestamps par mot, puis vérifier.
- Réviser manuellement l'alignement des nombres et des mots non alignés.
- Faire commencer le son suivant avant son image pour préparer une révélation (J-cut).
- Prolonger le son précédent sur l'image suivante pour maintenir le lien (L-cut).
- Motiver chaque match cut par une correspondance de forme, de mouvement ou de continuité perceptive.
- Utiliser les changements de rythme comme accents narratifs.
- Définir chaque clip par début + durée, avec fin exclusive : éviter images doubles et trous aux jonctions.
- Distinguer temps média source et temps timeline ; ne jamais réutiliser un timestamp sans conversion.
- Réserver les images nécessaires aux transitions : les plages visibles dépassent les plages coupées.
- Conserver la cadence de production à l'export YouTube, éviter les conversions inutiles.
- Vérifier textes et sujets dans la zone sûre du placement, gabarits variables selon format et interface.
- Figer versions, modèles, graines et médias intermédiaires, puis comparer les sorties avant validation.
- Vérifier début, milieu et fin de la synchro après traitements, avec flash/blip dans une copie technique.
- Conserver licences et attributions des sons ; distinguer droits des médias et licence du logiciel.
- Contrôler noms propres, nombres, texte prononcé et alignement final de la voix.
- Vérifier le rendu réellement lu sur plateforme, puis traiter pics et creux comme hypothèses de remontage.
- TikTok : tester une proposition compréhensible dans les 3 premières secondes (à tester).
- TikTok : concentrer l'accroche dans les 6 premières secondes (à tester).
- YouTube long : vérifier la promesse titre/miniature dans les 30 premières secondes.

## Erreurs à éviter

- Couper uniquement sur le beat en sacrifiant récit et émotion.
- Ajouter du b-roll décoratif qui n'éclaire pas la narration.
- Croire qu'un pic de rétention prouve toujours la réussite du passage.
- Supprimer automatiquement toutes les pauses dramatiques.
- Confondre timestamp source, timestamp de piste et position de marqueur.
- Reprendre une composition horizontale sans vérifier les masques de l'interface verticale.

## Avant de rendre ton travail

- [ ] Chaque coupe sert émotion, récit ou rythme.
- [ ] Chaque insert apporte une information ou un contexte.
- [ ] Les J/L-cuts sont intentionnels et correctement orientés.
- [ ] Les jonctions et plages de transition sont valides.
- [ ] Inserts et sous-titres correspondent à la voix finale vérifiée.
- [ ] Les éléments essentiels restent dans la zone sûre de chaque déclinaison.
- [ ] Le début tient la promesse éditoriale ; les données de rétention disponibles ont été examinées.

## Court (9:16) / long (16:9)

- 9:16 : tester proposition à 3 s et accroche à 6 s (repères publicitaires TikTok, à tester).
- 9:16 : recomposer inserts et textes pour le vertical et ses zones sûres.
- 16:9 : évaluer surtout les 30 premières secondes et leur cohérence avec titre/miniature.
- 16:9 : exploiter le cadre 16:9 standard du lecteur ordinateur ; faire varier les durées de plan selon compréhension et émotion.

## Outils

- OpenTimelineIO — décrire clips, pistes, transitions, marqueurs et échanger la timeline entre agents — Apache-2.0 ; format/API éditorial, pas le moteur de rendu Three.js.
- WhisperX — alignement mot à mot pour inserts, sous-titres et cues — BSD-2-Clause ; vérifier les licences des modèles, reproductibilité bit à bit non garantie par PyTorch.
- Auto-Editor — premier retrait de silences depuis l'analyse audio, à valider avant adoption — Unlicense ; garantie bit à bit non trouvée.
