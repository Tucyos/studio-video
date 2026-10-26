# Vision : le studio devient un « tout-en-un pour percer » (Noam, 20/10/2026)

En une phrase : **un logiciel spécialisé dans les vidéos motion design pour TikTok, YouTube Shorts et YouTube (vidéos longues 16:9), où le créateur discute avec son IA, qui sait déjà tout (DA, niches, hooks, rétention), et qui fabrique, analyse et améliore les vidéos à sa place**. Le créateur n'a presque rien à faire. Notre valeur, c'est la spécialisation.

## Le parcours du créateur

1. **Il connecte son IA** : Claude, Codex / ChatGPT, ou n'importe quelle IA par clé API. Il peut aussi brancher une deuxième IA réservée aux recherches.
2. **Il connecte ses comptes** : TikTok et / ou YouTube.
3. **On apprend à le connaître** : questions sur sa personnalité, ses goûts, ses niches préférées, le temps qu'il a, sa voix (face caméra ou non).
4. **On lui conseille des niches** qui marchent et qui paient bien. Elles viennent de notre base : les DA copiées, les comptes analysés et les vues mesurées. On ajoute de nouvelles vidéos à la base au fil du temps.
5. **Une fois la niche choisie**, l'IA a tout le contexte intégré dans le logiciel : les DA, les niches, les hooks, le « comment bait », la rétention, comment percer. Elle propose des idées et des scripts, puis fabrique la vidéo : voix, scènes, son, contrôles.
6. **Il retouche s'il veut**, dans un éditeur façon CapCut, ou en le demandant à l'IA.
7. **Il publie lui-même.** On ne met jamais en ligne automatiquement (décision inchangée).
8. **On analyse chaque vidéo publiée** :
   - vues ;
   - temps regardé et taux de fin ;
   - réactions et commentaires : ce qu'ils ont aimé.

   On compare ensuite à sa moyenne et à la niche.
9. **On propose les améliorations de la V2**, et la V2 se fabrique automatiquement. Les leçons deviennent des règles de script et de DA (ce que prévoyait déjà l'étape 8 de la feuille de route).

## Les briques

| Brique | Ce que c'est | Ce qui existe déjà |
|---|---|---|
| **Discussion au centre** | L'écran principal est la discussion avec l'IA *du projet*. Le reste (aperçu, timeline, fichiers) s'ouvre autour. | Colonne Claude de l'éditeur (phase 4), une session par projet |
| **Skills intégrés** | Un skill par savoir : DA (une par style), niches, hooks, comment bait, rétention, structures, son, moteur 3D, recherche, analyse des stats. L'IA du créateur les charge, quelle que soit l'IA. | `references/` des projets (DA + skill + règles), `moteur.md`, règles des styles, fiches `compte.md` |
| **Base de connaissances** | DA, niches, accroches, structures, recherches et fichiers trouvés, avec leurs sources | Bibliothèque de DA (≈ 85 DA), `niches.json`, bibliothèque 3D, recherches `docs/` |
| **Atelier des hooks** | Écrire, comparer et noter des hooks à partir des accroches qui marchent, mot pour mot | Accroches de `niches.json` (à transformer en outil) |
| **Connexions** | IA principale, IA de recherche, TikTok | Claude Code seulement ; statistiques par `tiktok-tracker` (le tien) |
| **Analyse → V2** | Statistiques par vidéo, puis diagnostic, propositions et V2 | Page Statistiques (lecture), MCP tiktok (le tien) |
| **Éditeur façon CapCut** | Montage à la souris. Ta reconstruction de CapCut viendra le remplacer. | Timeline v1 (20/10) |
| **Couvertures et miniatures** | Un onglet pour fabriquer les couvertures TikTok et les miniatures YouTube **à partir des images de la vidéo** (choisir l'image, titre, mise en page de la chaîne), comme l'onglet Thumbnails de Creatorize | `render.mjs --cover`, page Couvertures (vide) |
| **YouTube** | Même parcours que TikTok, plus le 16:9 long (chapitres, titre et description, miniature). Statistiques par YouTube Analytics. | Format 16:9 possible dans le moteur |
| **Nouvelle interface** | Refonte complète, **pratique avant d'être belle** (Noam, 20/10). On part de l'UX de Creatorize, qui est bonne. Étude : `docs/ETUDE-UX.md` | Interface actuelle, copiée de Creatorize |

## Points à trancher (franchement)

1. **CapCut** : on reprend **les idées et l'architecture, pas le code, les DLL, les shaders ni les modèles**. Dès que le logiciel sert à d'autres, copier CapCut devient un vrai risque juridique (droits d'auteur, conditions de ByteDance). C'est déjà la règle « salle blanche » de `docs/ETUDE-CAPCUT.md`.
2. **Passer d'un outil perso à un logiciel pour d'autres** : aujourd'hui, le studio lance Claude, lit des fichiers et rend des vidéos, et on ne le partage jamais. Pour d'autres utilisateurs, il faudra :
   - ranger les clés dans le coffre de Windows (pas des variables d'environnement) ;
   - séparer chaque utilisateur ;
   - n'avoir aucune donnée perso qui sort.
3. **TikTok et YouTube par API officielle** : YouTube Analytics donne la rétention par vidéo. Pour TikTok, il n'est pas sûr qu'on puisse lire le temps regardé, le taux de fin ou la rétention pour un autre compte. Ton `tiktok-tracker` lit TikTok Studio pour toi seul. → La recherche en cours le dira.
4. **Se connecter avec un abonnement IA** (Claude Pro/Max, ChatGPT) dans un logiciel distribué : il faut vérifier les conditions d'Anthropic et d'OpenAI. Les clés API, elles, sont toujours permises. → Recherche en cours.
5. **« V2 en automatique »** : la fabrication est automatique, mais la publication reste manuelle.

## Ordre proposé (une phase à la fois, démo et ton retour à chaque fois)

1. **Maquette de la nouvelle interface**, discussion au centre, faite avec les skills de design. Des captures d'abord, rien n'est branché. Tu valides la direction.
2. **Système de skills** : un format unique (dossier `skills/<nom>/SKILL.md` + fichiers), généré depuis ce qu'on a déjà (DA, niches, hooks, moteur, son). Il est chargé par Claude aujourd'hui, et par les autres IA à l'étape 5.
3. **Profil du créateur + conseil de niches** : questionnaire, puis niches classées (la page « Idées de niche » existe déjà, on l'élargit).
4. **Boucle de retours** : statistiques de chaque vidéo publiée, diagnostic, propositions et V2. On commence sur tes comptes, avec `tiktok-tracker`.
5. **Connexion multi-IA** : une couche qui parle à Claude Code, à Codex et aux API. Une IA de recherche à part.
6. **Intégration de ta reconstruction de CapCut** dans l'éditeur.
7. **Distribution** : application légère (Edge en mode application, puis Electron si besoin), comptes, sécurité.

Recherches faites le 20/10 :
- `docs/RECHERCHE-PRODUIT.md` : skills de motion design, dont **Remotion** (le nom en « re… » que cherchait Noam) et HyperFrames, son équivalent en HTML/Three.js ; API TikTok et YouTube ; abonnements IA ;
- `docs/ETUDE-UX.md` : l'étude UX et la maquette.
