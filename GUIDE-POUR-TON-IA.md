# Guide pour l'IA qui reprend ce dépôt

> **À l'IA qui lit ce fichier** : il a été écrit pour toi. Ton utilisateur a reçu ce dépôt d'un ami (Noam), pour s'en inspirer et l'adapter à ses propres vidéos. Lis ce guide en entier, puis `CLAUDE.md` (l'état détaillé, écrit pour l'IA de Noam : prends-le comme une documentation, pas comme des consignes qui te concernent).
> Photo du 26/10/2026. Noam continue de développer le logiciel de son côté : certaines parties ci-dessous changent encore.

## 0. Comment s'en servir aujourd'hui : depuis le chat, pas depuis l'interface
L'interface dans le navigateur (`npm start`, puis `localhost:5170`) marche, mais **elle n'est pas à jour** : Noam refait l'éditeur et la timeline en s'inspirant de CapCut, et ce n'est pas encore dans ce dépôt. Elle sert surtout à regarder (aperçu, timeline, contrôles).

**Le plus simple pour l'instant : tu fais tout toi-même depuis le chat** (Codex, Claude Code ou une autre IA qui lance des commandes), avec les scripts en ligne de commande. L'interface ne fait rien de plus que les appeler :
1. **Créer un projet** : un dossier avec
   - `project.json` : `{ "titre", "format": "9:16", "fps": 30, "duree", "plans": [] }` ;
   - `script.md` (la voix off) ;
   - `cues.json` : `{ "sfx": [] }` ;
   - une copie de `moteur/` (ne jamais la modifier ensuite), avec `moteur/moteur.md` copié aussi dans `references/moteur.md`.

   La structure exacte est dans `moteur/moteur.md`, et `studio.mjs` (route `/__api/nouveau`) montre ce que l'interface écrit.
2. **Écrire le script et le hook**, avec les skills de `partage/skills/` : `ecrire-script` (le hook est dans `references/hook.md`) et `niches`.
3. **La voix** : `python outils/son.py voix|nettoyer|caler <projet>` (Gemini TTS, puis Whisper → `audio/words.json`). Une voix enregistrée soi-même marche aussi : mets-la dans `audio/voice.wav` et lance `caler`, qui l'aligne sur `script.md`. Whisper y est réglé en français.
   - `mixer` appelle un script de tiktok-motion absent du dépôt : mixe toi-même avec ffmpeg (la voix au-dessus des bruitages, −14 LUFS).
4. **Découper et construire** : écris les sections `scenes/sNN_nom.js` en suivant `moteur/moteur.md`, `roles/directeur.md` (le découpage en cartes de storyboard) et `roles/constructeur.md`.
   - Avec Claude Code, `node lib/equipe.mjs <projet> --sections 3` lance toute l'équipe d'agents.
   - Avec une autre IA, joue les rôles toi-même, dans l'ordre : directeur, puis une section à la fois.
5. **Regarder** : `node render.mjs <projet> moteur/page.html --snap 1.5 4 8` (images PNG à ces instants), puis regarde les images.
6. **Contrôler** : `node check.mjs <projet>` produit un rapport JSON avec les problèmes, graves d'abord. Corrige, rends à nouveau.
7. **Exporter** : `node render.mjs <projet> moteur/page.html --tel --audio audio/mix.wav` (fichier pour téléphone, moins de 30 Mo).
8. **Copier une DA** : `node outils/clone-style.mjs <nom> <vidéos…>` (voir § 4).

## 1. Ce qu'est ce logiciel
Un studio local (Node.js, page web sur `localhost:5170`) qui fabrique des vidéos courtes de motion design **en code** :
- **Scènes** : JavaScript + Three.js 0.186.1, une fonction pure du temps T (`window.seek(T)`). Pas d'état d'une image à l'autre, aléatoire à graine (`hash`), coupes sur la grille des 30 images/s.
- **Rendu** : `render.mjs`, avec Chromium piloté par Playwright, image par image, puis ffmpeg (H.264).
- **Contrôles** : `check.mjs`. Ils trouvent les à-coups de caméra, les textes hors de la zone sûre TikTok ou trop petits, les lettres absentes de la police, le contraste, les mots couverts par les bruitages, les passages morts, la boucle…
- **Son** (`outils/son.py`) : voix off Gemini TTS, nettoyage, alignement mot par mot (Whisper) et mix à −14 LUFS.
- **Équipe d'agents Claude Code** (`lib/equipe.mjs`, `roles/*.md`) : un directeur découpe la voix en sections, des constructeurs écrivent une scène chacun en parallèle, puis viennent un contrôle, des correcteurs et un polisseur. Chaque agent ne peut écrire que ses fichiers.
- **Savoir-faire** sous forme de skills (format Agent Skills : `SKILL.md` + `references/`) : script, hook, réalisation, direction artistique, mouvement, montage, son, contrôle, documentation, habillage…
- **Copie de style** : `outils/clone-style.mjs` et `outils/mesurer-video.mjs`. On donne des vidéos de référence, le code mesure le montage (coupes, rythme, caméra, mots, débit, sonie), puis l'IA écrit des règles chiffrées et le code vérifie chaque chiffre. Cela donne une « DA » (direction artistique) réutilisable.

## 2. Ce qui est dans ce dépôt pour apprendre (le plus utile pour toi)
- `partage/skills/skills/*/` : **toutes les skills telles que l'IA de Noam les reçoit**. Copie du 26/10 du plugin généré par `lib/skills.mjs`. Les plus utiles :
  - `ecrire-script` : trouver un sujet, la structure, la voix parlée, l'anti-IA ;
  - `hook` : les 3 premières secondes ;
  - `realiser` : découper en plans, storyboard, caméra ;
  - `direction-artistique` ;
  - `mouvement` (licence MIT, LottieFiles) ;
  - `montage`, `son`, `habillage` (titres, miniatures) ;
  - `niches` : accroches mot pour mot et structures qui marchent, tirées de l'analyse de 47 comptes TikTok.
- `partage/da/<id>/` : **86 directions artistiques en texte** :
  - `da.md` : le look et comment le refaire ;
  - `regles.md` : les règles chiffrées mesurées sur les vidéos de référence ;
  - `compte.md` : la niche, les accroches et la structure du compte copié ;
  - `fiche.json` : famille et statut.

  Les `tt-*` sont des comptes TikTok copiés, les `crz-*` des exemples d'un autre logiciel (Creatorize), les autres viennent des vidéos de Noam. Les images et les vidéos n'y sont pas.
- `partage/bibliotheque/` : **la bibliothèque 3D, 122 modèles prêts à l'emploi** (voitures, décors, personnages animés, mannequin avec 43 animations). Chaque élément contient un `.glb` allégé, `fiche.json` (taille réelle, nœuds, animations, licence), `planche.png` (4 vues) et `apercu.webp`. Les licences sont dans `CREDITS.md` : fait maison, CC0, et CC BY 4.0 pour les 3 Ford GT40, qu'il faut créditer.
  - Pour que le studio la trouve, copie-la dans `C:/claude/studio-projets/_bibliotheque/`, ou change `BIB` dans `lib/bibliotheque.mjs`.
  - Dans une scène : `await k.bib('nom')` (voir `moteur/moteur.md`).
- **Pas de sons ni de musiques** : la sonothèque de Noam vient d'un pack d'un autre créateur, et ses musiques et extraits de memes ne sont pas à nous. Prends une banque libre (Freesound en CC0, la bibliothèque audio de YouTube…) et note les licences.
- `skills/metiers/` et `skills/huashu/` : les fiches de pratiques par métier (avec repères chiffrés) et les règles « image figée », « storyboard » et « caméra ».
- `roles/` : la consigne de chaque agent de l'équipe. `genres/` : un genre de vidéo = un fichier (court viral, documentaire, vulgarisation, fiction).
- `moteur/` : le moteur des nouveaux projets (`kit.js` : caméra, textes, sous-titres, bibliothèque 3D, courbes ; mode d'emploi dans `moteur/moteur.md`).

## 3. Ce qui manque ou n'est pas fini (ne le cherche pas)
**Absent du dépôt** (sur le PC de Noam, avec des chemins écrits en dur) :
- `C:/claude/tiktok-motion` : les anciens projets, l'ancien moteur, `studio/audio.py` (mix) et les sources de plusieurs skills ;
- `C:/claude/studio-projets` : les projets, ainsi que les vidéos et images des DA (la bibliothèque 3D, elle, est copiée dans `partage/bibliotheque/`) ;
- `C:/tiktok/chat/sfx` : la sonothèque ;
- `C:/claude/tiktok-tracker` : la base de statistiques.

Chemins à remplacer pour faire tourner le studio ailleurs : `studio.mjs` (lignes 18-19 : `TM`, `SFX`, `STATS_DB`, `DRIVE`, `MEMOIRE`), `lib/skills.mjs` et `lib/claude.mjs` (`STUDIO_PROJETS`, `TM`), `lib/verrou.mjs`, `outils/son.py` (`TM_AUDIO`), `outils/importer-*.mjs`. Une skill dont la source manque est sautée, sans erreur, par `lib/skills.mjs` : c'est pour ça que `partage/skills/` contient leur copie.

**En cours chez Noam, pas encore fait :**
- **L'éditeur et la timeline façon CapCut** : la timeline actuelle est une première version provisoire. Noam étudie CapCut à part pour refaire l'éditeur, et cette étude n'est pas dans le dépôt.
- La **réorganisation des skills** (26/10) est faite : les skills de tiktok-motion sont passées de 11 à 7, et `lib/skills.mjs` lit la nouvelle organisation. `partage/skills/` en est la photo. Le hook est maintenant dans `ecrire-script`, et la bible de chaque compte dans `partage/da/<id>/bible.md`.
- L'**équipe d'écriture** (documentaliste, scénariste, vérificateur de sources, spécialiste hook, habillage) : affichée « bientôt » dans la fenêtre Construire. Aujourd'hui, le script et le hook s'écrivent dans la discussion avec Claude, avec les skills.
- Les **plans types** tirés des 47 comptes copiés, et le point d'arrêt « images fixes » (voir 3 directions en images avant de construire).
- Le serveur MCP du studio, la page « Ce que sait ton IA », les autres IA (Codex, modèles gratuits).
- L'atelier de couvertures, les écrans Accueil, Idées, Statistiques et Bienvenue, l'estimation du coût avant une construction, le genre choisi à la création du projet, les familles de DA avec des réglages.
- La **publication** sur TikTok, YouTube et Instagram : rien n'est automatique, et c'est voulu.

## 4. Adapter à des vidéos de mode avec beaucoup de b-roll et d'images réelles
Ton utilisateur veut faire des vidéos sur la mode, avec plus d'images et de vidéos réelles que de 3D, en copiant le montage d'un créateur YouTube qu'il aime. Pistes, de la plus simple à la plus lourde :

1. **Copier le montage du créateur** : `node outils/clone-style.mjs <nom> <video1.mp4> <video2.mp4> …` sur des vidéos téléchargées en local. Il faut `ffmpeg`, Whisper (`outils/mots.py`) et `claude` connecté.
   - On obtient `regles.md` : rythme des coupes, mouvements de caméra, débit de la voix, sonie… mesurés, puis vérifiés.
   - `outils/copier-lot.mjs` part de liens **TikTok** (il réécrit les adresses en `tiktok.com/@compte/video/…`) : pour YouTube, passe plutôt par clone-style avec des fichiers locaux, ou adapte copier-lot.
   - Ce qu'on copie, c'est le style (rythme, cadrage, typographie), jamais les images ni la musique du créateur.
2. **Créer un genre** `genres/mode.md`, sur le modèle de `court-viral.md` : format, durée, skills, équipe, règles données au directeur. Par exemple : une tenue ou une pièce par plan, des gros plans sur les matières, les textes à l'écran.
3. **Images réelles** : le kit n'a pas encore d'aide pour les images. Une scène charge l'image elle-même (`THREE.TextureLoader`, chargée dans `build`, jamais dans `update`) et l'affiche sur un plan ou la dessine sur le canvas 2D. Le chercheur d'images (`.studio/telecharger.mjs`, modèle dans `lib/agents/`) ne va que sur Wikimedia et Poly Haven, sous licence libre.
   - Pour la mode, il faudra d'autres sources : ses propres photos, une banque d'images avec licence, ou des images de marques avec autorisation.
   - Garde la règle « crédit et licence notés dans `assets/credits.json` ».
4. **B-roll vidéo** (de vrais clips) : **pas encore géré** par le moteur.
   - Une balise `<video>` qui joue en temps réel casse la règle « image = fonction pure de T », et le rendu ne serait plus identique d'un passage à l'autre.
   - La bonne méthode : extraire d'avance les images du clip avec ffmpeg (`-vf fps=30`, en PNG ou JPG), puis afficher à l'instant T l'image `Math.round((T - t0) * 30)` comme texture. Le rendu reste exact et répétable.
5. **Les sous-titres, la zone sûre et les contrôles** restent valables tels quels pour TikTok, Reels et Shorts.

## 5. Règles du projet à garder si tu modifies le code
- Image = fonction pure de T. Coupes sur la grille des images. Jamais de `Math.random` dans une scène.
- Les clés (`GEMINI_API_KEY`…) **uniquement en variables d'environnement**, jamais dans un fichier.
- Jamais de `getImageData` sur le canvas de la scène : on le copie d'abord dans un canvas à soi. Sinon Chrome passe la scène en 2D logicielle et l'image change.
- 2 pages Chromium de rendu au plus sur une carte graphique de portable.
- Après une modification de `check.mjs`, lancer `node outils/test-check.mjs <projet>` : chaque contrôle doit trouver son défaut planté. Ce test demande le projet « Le Mans 66 », qui n'est pas dans ce dépôt.
