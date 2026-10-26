# Studio vidéo de Noam

Équivalent maison de Creatorize : un logiciel local qui fabrique les TikToks motion design en code (comptes Koan et Automobile).
Cahier des charges complet : `docs/CAHIER-DES-CHARGES-LOGICIEL.md`. Étude de Creatorize : `docs/SYNTHESE-CREATORIZE.md`. Brief auto : `docs/IDEES-MOTEUR.md`.

Répondre en français, de façon concise. Noam n'est pas développeur : il juge sur les vidéos et les captures, pas sur le code.

## Décisions prises (ne pas rediscuter)
- **Pas de Rust.** Le goulot, c'est la carte graphique, la lecture des pixels et l'encodage.
- Scènes en **JavaScript + Three.js 0.186.1**, rendues par **Playwright** (Chromium GPU, `--use-angle=d3d11`).
- Interface = **page web locale servie par Node** (`npm start` → `localhost`). Electron plus tard si besoin, jamais Tauri.
- **WebGL d'abord** ; WebGPU/TSL plus tard, après avoir vérifié que le Chromium de Playwright le fait tourner sur la RTX.
- **Tout est une fonction pure du temps T** : aucun état d'une image à l'autre, aléatoire avec graine (`hash`, jamais `Math.random`), coupes sur la grille des images (`Math.round(t*30)/30`).
- Format 1080×1920 (9:16) par défaut, 30 i/s ; 16:9 possible.
- Clés (`GEMINI_API_KEY`, `FREESOUND_API_KEY`) **uniquement en variables d'environnement**, jamais dans un fichier. **Aucune donnée perso** (e-mail, nom) dans les requêtes réseau.
- Images réelles : sources libres (Wikimedia, CC0, CC-BY), crédit conservé.
- Pas de mise en ligne automatique, pas de routines nocturnes.
- **Jamais de liseré coloré** (filet ou barre de couleur à gauche d'un titre, d'une étiquette, d'un cartouche) : Noam trouve que ça « fait IA », pour tous les comptes. Même quand une DA copiée en a un. La couleur passe par le texte, une pastille pleine ou l'objet lui-même.
- `C:\claude\tiktok-motion` : **on lit, on ne modifie rien**. Le studio sait ouvrir un projet existant (au minimum `videos/Automobile/le-mans-66`).

## Ce qui ne doit jamais casser
- La fonction pure de T et le rendu identique à chaque passage.
- Le détecteur d'à-coups (`traj.mjs`).
- Les coupes sur la grille des images.
- La sortie téléphone de moins de 30 Mo.
- Le mix à −14 LUFS avec le contrôle des mots couverts.
- Les vidéos existantes de `tiktok-motion` doivent pouvoir se rendre comme avant.

## Méthode de travail avec Noam
- **Une phase à la fois** (7 phases, §4 du cahier). À la fin de chaque phase : une démonstration (vidéo ou capture), puis **on attend son retour**.
- Montrer l'interface par une capture avant de la peaufiner.
- Pas de DA nouvelle sans son accord : le logiciel sert ses DA existantes (Koan, auto).
- Recherches techniques : par GPT (Codex, `gpt-6.1-sol`, raisonnement moyen), puis vérifiées.

## Le moteur (phase 1)
Contrat d'une page de scène (le même que dans `tiktok-motion`) : un `<canvas id="c">`, `window.READY` (promesse), `window.SCENE = {from, to, sub}`, `window.seek(T)` (peut être async).

```
node render.mjs <projet> [page.html] [--from T] [--to T] [--sub 4] [--shutter .5] [--fps 30] [--workers 2]
                [--preview] [--name x] [--out dossier] [--tel] [--iphone] [--audio mix.wav]
node render.mjs <projet> [page.html] --cover [--at T]     # couverture PNG (?cover dans l'URL)
node render.mjs <projet> [page.html] --snap T1 T2 ...      # images PNG à des instants donnés
```
- `lib/player.mjs` : le lecteur commun (serveur local + page Chromium + `seek(T)` → pixels bruts).
- Les pixels bruts partent de la page vers Node par `fetch` (corps = `Blob`), puis vers ffmpeg en `rawvideo rgba`, encodés en H.264 BT.709 (plage TV, étiqueté).
- Rendu en parallèle : chaque page (un Chromium chacune) prend une tranche d'images, puis `concat` sans réencodage.
- Flou de mouvement : `--sub` sous-images sur `--shutter` × 1 image, moyennées **dans la page** avec l'arrondi exact du `tmix` de ffmpeg (au plus proche, moitié vers le haut ; vérifié sur toutes les sommes pour sub 2-8). Projets auto : `--shutter .5`. Koan (ancien render : obturateur 360°) : `--shutter 1`.
- `outils/verif-pixels.mjs` : compare le studio à l'ancien moteur (snap.mjs du projet + tmix), avec le bruit ancien/ancien en regard.

### Leçons payées (ne pas refaire)
- **Jamais de `getImageData` sur le canvas de la scène** : après quelques lectures, Chrome le passe en 2D logiciel et l'image change (11 % des octets, ±4). On copie dans un canvas à nous (`willReadFrequently`) et on lit celui-là.
- Corps de `fetch` en **`Blob`** : un tableau typé coûte 311 ms par image de 8 Mo, un Blob ~30 ms. Le retour direct par `page.evaluate` : 1,5 s.
- **L'échauffement est obligatoire** : chaque tranche rejoue la sous-image d'avant (sinon l'image 40 du Mans 66 diffère de 2 703 octets, ±16 : un peu d'état passe d'une image à l'autre dans la scène).
- RTX 3060 portable 6 Go : **2 pages maximum**. À 3 ou 4 pages le rendu s'effondre (×3 plus lent, probablement la mémoire graphique). Le portable chauffe : toujours mesurer en alternant ancien/nouveau.
- **La carte graphique n'est pas déterministe** : ~20 octets à ±1 par image, parfois quelques centaines, même ancien contre ancien. Une égalité MD5 ne peut pas marcher : utiliser `verif-pixels.mjs`.
- Ce qui reste du temps de rendu, c'est le GPU (~55 ms par sous-image sur le Mans 66 : suréchantillonnage ×1,5, MSAA 4×, bloom). Aller plus vite = moins de sous-images ou réglages plus légers : décision de Noam.

## Les contrôles (phase 2)
```
node check.mjs <projet> [--adaptateur adaptateurs/x.json] [--from T] [--to T] [--workers 2] [--video final.mp4] [--aveugle]
node outils/test-check.mjs <copie du Mans 66>      # 21 défauts plantés : chaque contrôle doit sonner
```
- Sortie : `out/<nom>/qa/rapport.json` (`{t, t1, plan, controle, cible, probleme, gravite, source}`, graves d'abord) + `qa/problemes.png` (20 images signalées, calques rouges).
- `lib/qa-page.js` est injecté **seulement en contrôle** (jamais au rendu ; vérifié invisible : même écart que le bruit GPU). Il relève les textes dessinés sur `#c` (crochet `fillText`), la caméra et les sujets 3D (crochet `__THREE_DEVTOOLS__` → `renderer.render`), une vignette 135×240.
- `adaptateurs/<projet>.json` : ce que le moteur ne peut pas deviner (sujets 3D par expression JS, hauteur du sol, mots, stems, gain des bruitages de mix.py, `traj`, `plan_max`, `boucle`).
- À-coups : le `window.TRAJ` du projet (= traj.mjs) quand il existe, sinon caméra + sujets relevés, mêmes seuils.
- Mots couverts : même calcul que `mix.py` (vérifié : mêmes 16 mots, mêmes dB sur le Mans 66 du 19/10).
- Zone sûre (`ZONE` dans check.mjs) : **mesurée sur les captures iPhone de Noam** (19/10) : haut 250, bas 240, bords 60 (l'iPhone rogne ~52 px de chaque côté), colonne de boutons x > 895 dès y = 730.
- Faux positifs corrigés : roue tournée « sous le sol » (boîte exacte des sommets), carton texte sur noir ≠ image noire, image doublée seulement si l'image bouge autour, boucle mesurée au-dessus des sous-titres en 135×240, sous-titres mot par mot regroupés en lignes, couverture d'un sujet mesurée sur sa partie visible.
- Encore incertain : le relecteur aveugle se trompe parfois (il a lu un n°7 au lieu d'un 2, et pris le gris des mots pas encore dits pour un défaut) → ses points sont « à vérifier ».
- Relecteur aveugle (`--aveugle`) : `claude -p` lancé dans un dossier temporaire hors du dépôt (sinon il lirait ce CLAUDE.md). Demande que `claude` soit connecté (`/login`).

## Le studio (phase 3)
```
npm start -- [<projet>] [--adaptateur adaptateurs/x.json]     # puis http://localhost:5170 (sans projet : le dernier ouvert)
```
- **Modèle : Creatorize** (inventaire complet de son interface : `tiktok-motion/recherches/creatorize/frames/haiku_frames_cours.md`). **Nouvelle UX (21/10, `docs/ETUDE-UX.md`, maquette `ui/maquette/`)**, passée écran par écran.
  - Barre de gauche : chaîne (Koan / Automobile), Chercher (Ctrl K), puis **5 entrées** : Accueil, Projets, Idées, Bibliothèque, Statistiques ; en bas, Connexions et réglages. Icônes dessinées (SVG), plus d'emoji.
  - La barre est **rangeable en icônes** (bouton du haut ou Ctrl B). Sans choix de Noam, elle est rangée dans l'éditeur et dépliée ailleurs ; son choix est retenu (`localStorage.barre`).
  - La Bibliothèque regroupe en onglets : DA, Modèles 3D, Règles retenues, Copies en cours, Couvertures, Rendus (`BIBLIO` dans pages.js).
  - Projets = une liste : miniature, chaîne, état (ouvert, livrée, exportée, brouillon, ancienne vidéo) et date, avec le projet ouvert en tête (« Reprendre »).
  - Couleurs : blanc = l'unique bouton principal ; sélection = gris clair ; le jaune est gardé pour « maintenant » (tête de lecture, mot en cours).
  - Pas de Routines (décision : rien d'automatique).
- `studio.mjs` : le projet est servi **à la racine** ; ce qui n'y est pas est cherché à la racine de tiktok-motion (les pages Koan demandent `/studio/lib/…`, `/videos/Koan/…`). Interface sous `/__studio/` (`ui/index.html`, `studio.css`, `pages.js` = navigation et pages, `studio.js` = éditeur), API sous `/__api/`. On change de projet sans redémarrer (`/__api/ouvrir`).
- L'aperçu est la vraie page de la scène dans un iframe de même origine : `seek(T)` direct, comme à l'export. `?studio` = `lib/qa-page.js` injecté (relevés, calques, caméra libre, masquage des textes).
- **tiktok-motion est en lecture seule** (refus d'écrire `cues.json`). Les nouveaux projets vont dans `projets/<slug>/` (structure du cahier §3).
- **Colonne de droite = la discussion avec Claude seule** (comme Creatorize : fil, historique, suggestions, saisie, portée, modèle, effort). Les outils sont des volets : Calques (◫) et caméra libre (🎥) dans la barre de lecture, Sons (🎵) dans la barre de la timeline, Contrôles (📋) dans l'en-tête, journal de la tâche (clic sur son état).
- Éditeur : en-tête (style, compte, rapport, script, dossier, Exporter → fenêtre avec téléphone / iPhone / couverture / .srt / plage), bandeau d'avertissement, plans + pipeline façon Creatorize (boutons des phases 4-5 grisés), aperçu (photo PNG, boucle, aperçu léger, vitesses), timeline (Plans, Narration, Bruitages, Ambiance ≥ 3 s, Son, Contrôles ; Maj + glisser = plage, I / O, J K L, = −), panneau Claude (forme prête, branché en phase 4 ; clic sur une voiture ou un texte de l'aperçu = cible).
- Lecture calée sur le son (l'audio est l'horloge) : ~25 i/s d'aperçu sur le Mans 66. Rechargement à chaud au même T (~5 s : GLB en cache HTTP mais reparsés).
- Statistiques : `C:/claude/tiktok-tracker/data/tiktok.db` lue en lecture seule (`node:sqlite`). « - » = donnée manquante, jamais inventée.
- Pas encore fait : réglages en direct + « figer » (il faut que la scène expose ses réglages) ; atelier de couvertures.

## Claude dans le studio (phase 4)
- `lib/claude.mjs` : une **session Claude Code par projet** (`claude -p`, abonnement de Noam ; `--session-id` puis `--resume`, « ＋ » = nouvelle session), suivie en direct (`--output-format stream-json`) et affichée dans le fil (étapes, vignettes des images qu'il regarde, réponse).
- **Les projets modifiables vivent dans `C:/claude/studio-projets/`** (hors de ce dépôt : sinon `claude -p` lirait ce CLAUDE.md, et git avalerait les modèles 3D). Un projet de tiktok-motion s'ouvre en lecture seule ; « ✎ Copier dans le studio » le copie (2 s pour le Mans 66 ; `node_modules` = jonction vers celui de l'original), avec son adaptateur dans `.studio/adaptateur.json`, un CLAUDE.md de projet (`claudeMd()`), `references/` (skills DA, motion-engine, sound-design) et un **git local** (`out/`, `qa/`, `.studio/`, `assets/`, binaires ignorés).
- Sécurité : `--setting-sources project` (pas les hooks de Noam), `--tools Read,Edit,Write,Glob,Grep,Bash`, `--permission-mode acceptEdits`, seulement `Bash(node .studio/rendre.mjs *)`, `Bash(node .studio/controler.mjs *)`, `Bash(ffprobe *)` (vérifié : `node -e` et tout autre script sont refusés). **Une commande qui cite un chemin hors du projet est refusée** : d'où `node .studio/rendre.mjs T…` et `node .studio/controler.mjs A B` (écrits par `outils()`), qui appellent le moteur. Pas de git pour Claude.
- **Un commit par demande** (les retouches à la main d'abord, à part). Carte « Appliqué » : fichiers +/−, image avant / après (vignette du canvas avant la demande, puis après la recharge), « Voir les changements » (diff), « Annuler » (`git revert`, vérifié : retour exact), « Retenir… » → `.studio/memoire.md` (projet) ou `studio-projets/_styles/<style>/regles.md` (style), relues à chaque demande. Claude propose une règle par une dernière ligne `RÈGLE : …`.
- Pendant que Claude travaille : rechargement à chaud suspendu (une seule recharge à la fin), Contrôler / Exporter refusés (une tâche à la fois).
- Le coût affiché est l'**équivalent API** (rien n'est facturé avec l'abonnement).

## La construction en équipe (phase 5)
- **Moteur des nouveaux projets** : `moteur/` (page, `kit.js`, `post.js` du Mans 66, polices ; `VERSION`), copié dans chaque projet créé par le studio (`installerMoteur`), mode d'emploi pour Claude = `moteur/moteur.md` → `references/moteur.md`. La page lit les sections de `project.json` (`plans: [{id, t0, t1, fichier, brief}]`), importe chaque `scenes/sNN_nom.js` (`build(k)` → `{update(T, t)}`), une scène et une caméra partagées (un `Group` par section, tout remis à zéro avant chaque image). Une section qui plante s'affiche en rouge sur sa plage seulement (`window.ERREURS`). Sous-titres dessinés par le moteur (`audio/words.json`). `kit.sujet()` → `window.SUJETS` (lu par `qa-page.js` quand l'adaptateur n'en donne pas).
- `lib/equipe.mjs` : directeur → (objets ∥ images) → constructeurs en parallèle (3 au plus) → [contrôle complet + correcteurs] → [polisseurs]. Niveaux : Standard / Vérifié / Soigné / Ultra (+ relecteur aveugle). Essai sans interface : `node lib/equipe.mjs <projet> --modele haiku --sections 2`.
- **Chaque agent n'écrit que ses fichiers** : `--permission-mode dontAsk` + `Edit(f)`/`Write(f)` (jamais `acceptEdits`, qui ouvre tout le dossier). Un commit par agent, avec ses seuls fichiers ; `horsFichier` dans le bilan le vérifie. « Annuler la construction » = `git revert depart..dernier`.
- **Verrou GPU** (`lib/verrou.mjs`, `C:/claude/studio-projets/.gpu/placeN`) : 2 places pour tout le poste ; les scripts `.studio/rendre.mjs` / `controler.mjs` des agents (modèles dans `lib/agents/`) attendent leur place ; place d'un processus mort reprise. Le contrôle d'une plage écrit son propre rapport (`qa/plage_A_B/qa/rapport.json`) : plusieurs agents contrôlent en même temps.
- `.studio/telecharger.mjs` (chercheur d'images) : Wikimedia / Poly Haven seulement, licence libre exigée, User-Agent neutre, crédit dans `assets/credits.json`.
- Pendant une construction : rechargement à chaud suspendu, Claude seul / Contrôler / Exporter refusés.

## La bibliothèque commune (phase 6)
- **Hors du dépôt** : `C:/claude/studio-projets/_bibliotheque/` (`elements/<nom>/` : modèle allégé, `fiche.json`, `planche.png` 4 vues, `apercu.webp` ; index `bibliotheque.json`). Un élément ne se modifie jamais (nouvelle version = nouveau nom) : un projet en garde une copie (`assets/bib/<nom>/`, lien physique) → rendu identique à chaque passage.
- **Convention unique** (norme glTF, comme les décors Blender et les personnages de tiktok-motion) : mètres, +Y en haut, **avant vers +Z**, posé au sol, centré en X/Z (sauf « origine libre » : pivot voulu, noté dans la fiche). Vérifiée à l'entrée et au chargement (`k.bib()` compare la taille à la fiche ; écart = erreur visible).
- `node outils/admettre.mjs <source.glb|.gltf|objets.js> --nom x --type voiture|decor|accessoire|personnage|lieu [--avant +x] [--recaler] [--origine libre] [--fonction f]` : copie, allège (WebP 2048 + meshopt **sans quantification** : elle déplaçait l'origine des pièces), compare avant/après dans Chromium (taille, nœuds nommés, os, animations), vérifie la convention, rend la planche à taille réelle (silhouette 1,80 m, grille 1 m), écrit la fiche. Rien n'entre si un test échoue. Crédits Sketchfab lus dans le fichier. Élément « code » (`--fonction`) : une fonction d'un `objets.js` (shaders, pluie…) copiée telle quelle, testée avec le vrai kit.
- `outils/importer-tm.mjs` : premier remplissage depuis tiktok-motion (manifestes `assets/blender/*.json`, GT40, humains MakeHuman, mannequin Quaternius + 43 animations, piste de la démo phase 5).
- Pièges payés : `dedup` des maillages renomme les roues (désactivé) ; les voitures de tesla-roadster regardent +X (lu dans les notes du manifeste) ; une voiture en travers est refusée.
- Moteur v2 (`moteur/VERSION`) : `k.bib(nom)`, `k.animations(nom)` + `k.anime(perso, clips, nom, t)` (mixer.setTime, jamais update), `k.cam.orbite|travelling|dolly|plongee|suivi`, `k.eclairage(groupe, 'nuit'|'jour'|'studio')`, clone SkeletonUtils, sous-titres ≤ 700 px (bord droit < 895).
- Studio : page **Bibliothèque** (filtres, fiche + planche, « Ajouter au projet »), volet 📦 dans l'éditeur (glisser sur l'aperçu → copie + demande à Claude pré-remplie). Équipe : le directeur choisit `"bibliotheque": [...]` dans project.json, le studio copie avant les constructeurs ; agents : `node .studio/bibliotheque.mjs [nom]`. Export : `<nom> - credits.txt` (seulement ce que les scènes utilisent, licences connues seulement).
- KTX2 (mémoire graphique) : demande l'outil `toktx` (KTX-Software), pas installé — décision de Noam.

## La copie de style (phase 7)
```
node outils/clone-style.mjs <nom> <video1> [video2 …] [--sans-ia]     # -> C:/claude/studio-projets/_styles/<nom>/regles.md
node outils/mesurer-video.mjs <video> <dossier>                       # les mesures seules (mesures.json)
```
- **Les chiffres viennent du code** (`mesurer-video.mjs`) : images à 30 i/s (« image n » = n-ième image à 30 i/s, quelle que soit la cadence d'origine), coupes franches (saut d'écart par rapport au mouvement d'AVANT), coupes douces (bosse sur plusieurs images), **bascules de caméra** (l'image entière bouge vite ≥ 1/3 s puis se pose : un changement de point de vue sans couper — c'est le rythme des références auto 3D), moments (entre deux événements), caméra par plan (glissement + zoom, approximatif), mots (Whisper `outils/mots.py`, langue détectée), débit, pauses, part de voix, sonie. Non mesuré : musique sous la voix, durée des fondus.
- Vérité terrain (`le-mans-66-photographe.mp4`, coupes et mots connus) : 9 coupes sur 9, 0 fausse ; mots à 80 ms près (médiane).
- Haiku décrit les planches (un moment par ligne, images numérotées, mot dit) ; Opus rédige 15-30 règles `ID | règle | valeur | déclencheur | preuves | méthode | confiance | exceptions` ; **`verifier()` contrôle chaque ligne** (8 colonnes, image qui existe, mot réellement dit à ±1,5 s, chaque nombre d'une valeur « mesurée » retrouvé dans les mesures à 3 % ou n° d'image) : ce qui ne tient pas va dans « À vérifier ». Limite : un nombre réel mais mal attribué passe.
- Les règles d'un style sont lues par Claude et l'équipe (`lignesRegles` : lignes « - » et lignes du tableau, sans « À vérifier ») ; « Retenir… (tout le style) » ajoute une ligne `Snn` (preuve = projet + date) ; un projet créé avec ce style reçoit `references/<style>.md`. Page Styles : « Copier un style » (vidéos envoyées ou chemins).
- Pièges payés : écrire du code par heredoc bash mange les `\` (controler.mjs des agents cassé depuis la phase 5 : `outils()` vérifie maintenant la syntaxe) ; un commentaire inséré en milieu de ligne avale la suite (quatre fois, dont `texte_dit` le 20/10 au soir ; trois fois : le 20/10, il a avalé `tache = {…}` dans `lance()` et le serveur plantait à la fin de chaque tâche).

## Du script à la vidéo : Voix, Nettoyer, Caler, Mixer (20/10)
```
python outils/son.py voix|nettoyer|caler|mixer <projet> [--prises 2] [--modele medium] [--duree s]
```
- Boutons du pipeline de l'éditeur (tâches de fond, journal dans le volet Tâche ; refusés en lecture seule). Une étape dont l'amont a changé depuis affiche « ! » orange (à refaire).
- **Voix** : texte = section « ## Voix off » de `script.md`, sinon tout le fichier sans les titres (refus si ce n'est qu'un « Sujet : »). Gemini `gemini-3.8-flash-tts`, N prises, gardée = celle que Whisper reconnaît le mieux. Automobile : voix Enzo (`en-us-enzo`, API `interactions`) ; Koan : Velvet Anchor 3 (`voice_bq7fpjbz86qi`, `generate_content_stream`). Prises et ancienne voix dans `audio/prises/` (les .wav ne sont pas dans git).
- **Nettoyer** : blancs ramenés à 150 ms (auto) / 160 ms (Koan), atempo 1,04 / 1,06, puis la chaîne du compte : auto = « tranchante » de Rush (mémoire `feedback-voix-auto-tranchante`) ; Koan = aigus seulement + gain crête −1 dB (mémoire `feedback-voix-rythme`). Repère les bégaiements du TTS. → `audio/voice_clean.wav`.
- **Caler** : `align.py` (Whisper medium, alignement sur le script, débuts recalés sur l'énergie) → `audio/words.json` ; `duree` de project.json mise à jour s'il n'y a pas encore de sections (sinon avertissement : sections coupées pour l'ancienne voix).
- **Mixer** : `tiktok-motion/studio/audio.py` (lancé tel quel, dans le dossier du projet) pour les pistes, bruitages passés sous la voix (sidechain), `fx_db` de cues.json (gain d'ensemble), −14 LUFS par un simple gain puis `alimiter` (jamais de tanh), contrôle des mots couverts. Écrit `audio/mix.wav` et met dans l'adaptateur `mix`, `voix`/`bruitages` (pistes) et `gain_bruitages_db` → le contrôle des mots couverts de « Contrôler » marche aussi.
- Réglages par compte dans `REGLAGES` (son.py), remplaçables par `"son": {voix, style, blancs_ms, atempo, chaine}` dans project.json.
- Vérifié : sur le Mans 66, même mix que celui du 19/10 (écart < 0,0002 jusqu'à 76,1 s ; ffmpeg y perdait la dernière seconde de bruitages, gardée maintenant : `apad` + `-t`), mêmes mots couverts ; le gain est ensuite réajusté après le limiteur (2 tours au plus) : −14,1 LUFS au lieu de −14,4 (une voix Koan, sans compresseur, perdait ~1 dB). Boucle complète faite le 20/10 sur `essai-boucle-son` (auto, 11,4 s : 43 mots sur 43, construction Sonnet « Vérifié » 8 min, 0 problème grave) et `essai-voix-koan` (2 prises à 100 %, 3 phrases, crête −1 dB).
- Ponctuation française : « fratrie ? » (espace avant ? ! : ;) reste collée à son mot, sinon la phrase ne se coupait pas.
- Le contrôle complet de l'équipe écrit maintenant dans `out/<projet>/qa` (comme « Contrôler ») : le studio l'affiche dès la fin de la construction.

## La bibliothèque de DA (20/10)
- **Retour de Noam** : noms **génériques** (ce qu'on voit, pour un logiciel que d'autres pourraient utiliser : pas « DA Koan »), rangés par **famille** (3D réaliste, 3D stylisée, Pixel art, Papier et illustration, 2D vectorielle, Collage, Écran et typographie, Impression) ; **toutes les DA essayées** sont des DA (avec leur statut : validée, utilisée, aimée, essai, rejetée, jamais faite) ; une vidéo dont on ne garde que des idées (Canal+ « Invisible ») est une **inspiration**, pas une DA ; auto-3d = la DA auto de base (fusionnée dans `da-auto`) ; les styles montrés dans les vidéos Creatorize sont des DA (statut « exemple Creatorize »).
- `_styles/<id>/` : `fiche.json` (genre `da`/`inspiration`, famille, titre, statut, verdict, origine, compte, exemples, utilisée dans, skill… ; champs de Noam ; `auto` écrit par clone-style.mjs), `da.md` (le look), `exemples/` (liens physiques), `regles.md` (règles chiffrées d'une copie, ou retenues), `sources/`, `refs/`. **L'id du dossier ne change jamais** (les projets le citent) : seul le titre est générique.
- `node outils/importer-da.mjs [--seulement id,…]` : les 27 DA de tes vidéos (tiktok-motion lu, jamais modifié) + 9 exemples Creatorize (captures de `recherches/creatorize/frames` ; pour low-poly PS1 et Hi-Bit, les deux vidéos ont été téléchargées le 20/10 avec l'accord de Noam, en 720p, dans `_styles/_sources/creatorize/videos/` : images extraites dans `…/images/`, l'aperçu de l'outil recadré). Relançable : titre, famille, genre, notes… déjà là sont gardés.
- Un projet reçoit sa DA en **un seul** `references/<id>.md` = da.md + la skill de tiktok-motion (fiche.skill) + regles.md (`references()` de lib/claude.mjs ; avant, les règles écrasaient la bible). `CL.regles()` lit toujours regles.md (tableau sans « À vérifier » + lignes retenues).
- Page **DA** (`#/styles`) : DA / Inspirations, origine (tes vidéos, Creatorize, copiées), familles, recherche ; dans chaque famille, triées par statut (validées d'abord). Fiche : verdict, exemples (images et vidéos), look, « En bref » (copies), tes notes, vidéos de référence, utilisée dans (tes vidéos + projets du studio), bible et règles repliées ; Modifier la fiche (nom, genre, famille, créateur, pays, lien, compte, mots-clés, notes), ＋ Vidéos de référence, Créer un projet avec cette DA. Nouveau projet : DA groupées par famille.
- `node outils/clone-style.mjs <nom> <vidéos…> [--ajouter]` / `--fiche <nom>` : voir la phase 7 ; résumé et images clés dans fiche.json, jamais dans regles.md (les constructeurs ne reçoivent que le tableau).

## Copier des DA depuis une liste de liens (20/10)
```
node outils/lot-meta.mjs <lot>                 # <lot> = _styles/_lots/<date>/ avec liens.txt (un lien par ligne) -> meta.json (comptes, titres, vues… sans télécharger)
node outils/copier-lot.mjs <lot> [--seulement c1,c2] [--niches]   # un compte = une DA _styles/tt-<compte>/, 2 comptes à la fois, reprise, journal.txt
npm run partager                               # page en lecture seule (vitrine.mjs) + tunnel Cloudflare gratuit -> lien public tant que la fenêtre est ouverte
```
- Par compte : téléchargement (yt-dlp, H.264 720p au plus, **adresse propre de la vidéo**, jamais le lien de partage : son `_t` est un jeton lié au compte de Noam), mesures du montage, **son mesuré en local** (`outils/son-ref.py`, librosa : voix, fond, musique, tempo, bruitages dans les pauses — sous la voix non mesurable sans séparation des pistes), Haiku décrit les planches (+ fabrication, couleurs, polices), Opus les règles vérifiées, puis **Opus la fiche détaillée** (titre générique, famille, look complet, consignes pour refaire → `da.md` ; la DA du compte : niche, accroches mot pour mot, structure, chiffres, 10 idées → `compte.md`, montré dans la fiche, jamais donné aux constructeurs), puis élagage (1 image/s + milieux des moments + preuves ; marqueur `.elague` : mesurer-video réextrait si on refait).
- **Gemini n'est pas utilisé pour l'analyse** : la clé Gemini de Noam sert à la voix seulement (dit le 20/10).
- Réponses JSON de Haiku/Opus : redemandées 3 fois si illisibles, et les guillemets non échappés sont réparés (`reparer`). Fichiers donnés à lire à Claude : **une valeur par ligne** (Read coupe les lignes trop longues).
- Limite d'utilisation de Claude pendant un lot : pause 15 min puis le compte est repris ; un compte en erreur se refait en relançant le lot (les comptes finis sont sautés).
- Page **Avancement** du studio (`#/lot`, `lib/lot.mjs` : l'état se lit sur le disque, une étape = un fichier). `vitrine.mjs` : GET seulement, `/`, `/api`, `/img/<tt-…>/<n>` (images clés des DA finies) ; ni vidéos, ni chemins, ni journal, ni prénom.
- Premier lot (20/10, 75 liens, 47 comptes, ~1 h 40 de vidéo) : ~13 min par compte, ~900 Mo, ~140 $ équivalent API ; synthèse des niches dans `_lots/2026-10-20/niches.md`.
- Recherche GitHub (claude-pxl et projets voisins) : `docs/RECHERCHE-GITHUB.md`.
- Page **Idées de niche** (`#/niches`) : `outils/niches-json.mjs <lot>` (Sonnet, fidèle, sans rien inventer) met `niches.md` en données (`niches.json` : niches, pour_toi, idees, accroches, structures) ; le studio relie chaque compte cité à sa DA (`fiche.createur`). « Créer le projet » d'une idée pré-remplit titre, sujet, compte, DA du compte modèle et consignes (niche, DA visée, faits à vérifier). Fait automatiquement à la fin d'un lot.

## La timeline façon CapCut (20/10)
- Bouton ⬍ : timeline en grand (55 % de la hauteur, retenu dans le navigateur) ; les pistes s'étirent pour remplir la place.
- À la souris (seulement un projet modifiable ; tiktok-motion reste en lecture seule) :
  - **limite entre deux plans** (projet créé dans le studio) : la fin d'un plan et le début du suivant bougent ensemble (jamais de trou ni de chevauchement : le moteur prend la dernière section commencée) ; 1/3 s au moins par plan ; les bords 0 et fin ne bougent pas (la voix fixe la durée) ; pas de déplacement d'un plan entier (les scènes utilisent T et les temps des mots) ;
  - **mots** : déplacer, rogner le début ou la fin, sans dépasser les voisins. C'est un recalage des sous-titres : la voix ne bouge pas. La scène est rechargée (kit.js lit words.json au chargement, et le veilleur ignore `audio/`) ;
  - **sons** : déplacer, rogner la fin (`dur` de cues.json ; audio.py n'a pas de point d'entrée, donc pas de rognage du début ; un bruitage ne dépasse pas la longueur de son fichier, sinon audio.py le bouclerait). La piste (bruitage / ambiance) est figée pendant qu'on rogne.
- **Aimant** 🧲 : tout se pose sur la grille des images ; à 7 px près, sur la tête de lecture, les limites des plans, les débuts/fins des mots, les débuts des sons (trait bleu). Alt en glissant : sans aimant.
- **Ctrl Z** : annule les 50 derniers changements de la timeline (plans, mots, sons), en remettant les valeurs exactes du fichier.
- Serveur : `POST /__api/plans` (petits changements `{id, t0, t1, avant}` ; refus si project.json a changé entre-temps ou si une tâche / Claude / l'équipe tourne : le directeur réécrit project.json) et `POST /__api/mots` (mêmes mots dans le même ordre, seuls start/end changent ; forme du fichier gardée). Les bornes affichées sont arrondies à l'image : `f0`/`f1` gardent celles du fichier, et seule la borne déplacée est écrite.

## En-tête de projet et versions (étape 2 de la nouvelle UX, 21/10)
- En-tête de l'éditeur :
  - fil d'Ariane « Projets › titre » ;
  - bouton de version (« V1 · brouillon / publiée », avec le menu des versions) ;
  - onglets **Vidéo · Script · Couverture · Publier · Résultats** (`#/editeur?o=…`) ;
  - une seule action principale : « Exporter », ou « Créer la V(n+1) » quand la version est figée.
- Les onglets remplacent seulement la zone de travail : la scène n'est jamais rechargée, et Claude reste à droite.
- Les raccourcis de l'éditeur (espace, flèches, Suppr, Ctrl Z) ne jouent que sur l'onglet Vidéo.
- **Les versions** vivent dans `.studio/versions.json` du projet (jamais `project.json`, que le directeur réécrit et que le veilleur surveille). **Jamais** dans un projet de tiktok-motion. Pas de fichier = V1 brouillon.
  - **Publier** :
    - on colle l'adresse propre de la vidéo (`tiktok.com/@compte/video/<id>` ou YouTube). Un lien de partage `vm.tiktok.com` est refusé (son `_t` est lié au compte), et il n'y a aucun appel réseau ;
    - le serveur commite ce qui traîne (`preparerGit`), pose l'étiquette git `vN`, met la dernière vidéo exportée à l'abri (`.studio/versions/vN.mp4`, lien physique) et note si la vidéo est dans la base de tiktok-tracker.
  - **Une version publiée est figée, côté serveur** : refus de `cues`, `plans`, `mots`, des tâches voix / nettoyer / caler / mixer, de Claude (demande et annulation), de la construction en équipe et de l'ajout depuis la bibliothèque. Message « Vn publiée, donc figée : crée la V(n+1)… ».
  - **« Créer la V(n+1) »** change seulement `versions.json` : on repart du travail tel quel, et la Vn reste marquée dans git par son étiquette.
  - Dès la V2, l'export s'appelle `<nom>-v2`, pour ne jamais écraser la vidéo publiée.
- **Résultats** : chiffres réels de tiktok-tracker (vidéo retrouvée par son id), comparés à la **médiane des 20 dernières vidéos** du compte (le compte koan contient d'anciennes vidéos à plusieurs millions de vues), et courbe de rétention. Le bouton « Préparer la demande à Claude » pré-remplit la demande avec les chiffres, sans l'envoyer. Rien n'est inventé : sans données, on affiche un état vide qui dit pourquoi.
- **Script** : script.md et storyboard.md en lecture (les modifier rendrait la voix périmée).
- **Couverture** : les couvertures déjà rendues, plus « Couverture à l'instant » (tâche `couverture` avec `at`). Pour l'instant, une nouvelle couverture remplace la précédente. L'atelier complet est l'étape suivante.
- Vérifié sur essai-boucle-son, puis remis à l'identique :
  - publier (lien de partage refusé, étiquette v1, vidéo mise à l'abri) ;
  - écritures refusées une fois figée ;
  - V2 créée, puis export `-v2` ;
  - couverture à 5 s rendue.
  Sur un projet de tiktok-motion, rien n'est écrit.

## Les skills du studio (étape 1 du système de skills, 22/10)
Proposition complète, équipes par format, réglages : `docs/SYSTEME-SKILLS.md`.
```
node lib/skills.mjs      # fabrique le plugin C:/claude/studio-projets/_plugin et affiche les skills
```
- **Skill = une fiche de savoir** (format Agent Skills : `SKILL.md` + `references/`). Un agent est un rôle qui reçoit les fiches dont il a besoin.
- `lib/skills.mjs` (`CATALOGUE`) fabrique **un plugin** à partir de l'existant. Il est refait à chaque demande à Claude et à chaque construction (seuls les fichiers changés sont réécrits).
  - Sources lues seulement : les skills de tiktok-motion (jamais modifiées), `moteur/moteur.md`, `niches.json` du dernier lot.
  - **26/10 : tiktok-motion a réorganisé ses skills en 7** (`video`, `ecrire-script`, `direction-artistique`, `realiser`, `fabriquer`, `son`, `controle`). `ecrire-script` porte maintenant le hook (`references/hook.md`, `hooks-log.md`), l'anti-IA et le Conseil ; le CATALOGUE lit ces fichiers (`SK`, `REF`). Les DA de compte ne sont plus des skills : leur bible est `_styles/<id>/bible.md` et leur son (voix du compte, musique, bruitages) `_styles/<id>/son.md`, lus par `references()` de `lib/claude.mjs`. Anciens skills : `tiktok-motion/archives/skills-2026-10-26/`.
    - Fini le 26/10 au soir :
      - la page DA du studio montre `bible.md` (avant, elle lisait l'ancienne skill du compte) ;
      - `direction-artistique` reçoit le mode d'emploi de la bibliothèque de DA de tiktok-motion (`references/bibliotheque-da.md`) ;
      - les sources d'`importer-da.mjs` pointent vers les archives ;
      - **`node lib/skills.mjs` liste les sources introuvables** (`manquants`). Avant, une skill déplacée disparaissait sans bruit.
    - Vérifié avec Haiku : `studio:hook`, `studio:ecrire-script` et `studio:direction-artistique` se chargent et leurs annexes se lisent. Les bibles de da-koan, da-auto et da-pixel-rose s'affichent.
  - Les skills écrites ici sont dans `skills/` : `studio` (l'aiguillage), `controle-qualite`, `analyser-resultats`. Premier jet par DeepSeek, relu et corrigé par Claude.
  - Noms génériques : `studio`, `ecrire-script`, `hook`, `realiser`, `moteur-3d`, `mouvement` (MIT, LottieFiles), `son`, `controle-qualite`, `analyser-resultats`, `niches`.
- **L'aiguillage** (`studio`, à lire en premier, dit le CLAUDE.md des projets) part de l'état du projet. Ligne par ligne :
  - une question → on répond sans rien modifier ;
  - une retouche → seulement elle ;
  - des chiffres → `analyser-resultats` ;
  - une nouvelle vidéo → d'abord le plan, en attendant Noam.
- Chargé par `claude -p --plugin-dir` (discussion et équipe) + l'outil `Skill`.
  - Dans la discussion (`acceptEdits`), la lecture des fichiers annexes hors du projet demande la règle `Read(//c/claude/studio-projets/_plugin/**)` (`LIRE_PLUGIN`). Sous Windows, seule la forme `//c/…` marche, pas `//C:/…` (vérifié le 22/10).
  - Les fichiers annexes sont dans le dossier de la skill : chaque skill le dit, sinon Claude les cherchait dans le projet.
- **Aucune skill n'a d'`allowed-tools`** : ce sont les rôles qui donnent les droits. Vérifié le 22/10 avec Haiku : une skill avec `allowed-tools: Write` n'a pas permis à un agent `Edit(/a.txt)` d'écrire `b.txt`.
- Les nouveaux projets ne reçoivent plus `references/motion-engine.md` ni `sound-design.md` (30 Ko, et motion-engine décrit l'ancien moteur) : ce sont des skills. `references/` garde la DA et `moteur.md`.
- Le fil de la discussion montre « 📚 skill hook » quand Claude ouvre une skill.
- Vérifié le 22/10 sur essai-boucle-son (Sonnet, 33 s), puis remis à l'identique : « Le hook est-il bon ? Propose 3 autres hooks. Ne modifie rien. » → skill `studio`, puis `hook`, 3 images regardées, 0 fichier modifié.
- **L'équipe passe avant l'aiguillage** : la première ligne du tableau de `studio` et les `CONSIGNES` d'equipe.mjs disent à un agent de l'équipe de suivre sa consigne sans attendre Noam. Sinon, le directeur s'arrêterait à « propose le plan et attends ».
- Vérifié le 22/10, sur une copie jetable de `_essai-equipe` aux sections vidées : construction Haiku de 2 sections, 8 min, 1,17 $ équivalent API.
  - Le directeur a écrit des sections valides, et personne n'a attendu de réponse.
  - Les constructeurs ont ouvert `moteur-3d` et `mouvement`, rendu et contrôlé leur plage.
  - 0 erreur, `horsFichier` vide.
- Corrigé au passage dans equipe.mjs : quand aucun élément de la bibliothèque n'a pu être copié (moteur trop vieux), la construction plantait sur `git add -f assets/credits.json`.
- **La recherche par métier (22/10)** : Codex (`gpt-6.1-sol`, sans commande shell : sinon son bac à sable plante sous Windows) a fait 12 recherches sourcées, dans 4 sessions en parallèle. Le texte brut est dans `docs/recherches-metiers/`.
  - DeepSeek a condensé chaque métier en fiche pour IA (règles chiffrées, erreurs, check-list, court/long, outils et licences). Claude les a relues. Elles sont dans `skills/metiers/`.
  - Elles ajoutent `references/pratiques-*.md` (et `recherche.md`, les sources) aux skills `ecrire-script`, `hook`, `realiser`, `mouvement` et `son`.
  - Elles donnent 6 nouvelles skills : `scenario-long`, `direction-artistique`, `montage`, `documentation`, `verification-sources`, `habillage`. Il y a donc **16 skills**.
  - Vérifié avec Haiku : les 16 se chargent et les annexes se lisent.
  - « (à tester) » marque un repère qui vient d'une source publicitaire TikTok ou d'un seul créateur.
- - DeepSeek (opencode) : un appel à la fois (sinon « database is locked »). Mettre la consigne avant `-f`. Le mode `--agent plan` + sortie récupérée marche mieux que `--auto` (bloqué 20 min une fois).

## Les rôles en fichiers, les paquets et la barre d'avancement (étape 2 du système de skills, 22/10)
- **Un rôle = un fichier** dans `roles/` : `directeur`, `objets`, `images`, `constructeur`, `correcteur`, `polisseur`, plus `_commun.md` (ce que tous reçoivent).
  - L'en-tête porte `role`, `skills` (à charger), et en option `effort`, `web` et `bash` (droits en plus).
  - La consigne contient des `{{cases}}` qu'equipe.mjs remplit. Une case non remplie est une erreur visible (`roles/x.md : la case {{y}}…`).
  - Pour changer ce qu'un agent fait ou sait, on modifie son fichier, pas le code.
  - Chaque rôle finit par « Tu ne décides pas : … ».
- **Skills par rôle** :
  - directeur : `realiser`, `direction-artistique`, `montage` ;
  - objets : `moteur-3d` ;
  - images : `documentation` ;
  - constructeur : `moteur-3d`, `mouvement` ;
  - correcteur : `moteur-3d`, `controle-qualite` ;
  - polisseur : `mouvement`, `direction-artistique`, `montage`.
- **Le paquet** = `_commun.md` + la consigne remplie + « charge ces skills ». C'est tout ce que l'agent reçoit, gardé dans `.studio/paquets/<construction>-<agent>.md`. Dans le fil, chaque agent a un lien « 📦 ce qu'il a reçu », et ses skills s'affichent au survol.
  - Pour une section, le paquet contient : la plage, le brief, la voix de la plage, le storyboard (une ligne par section), les constantes, les règles du style, les objets, les modèles et les images.
  - Environ 21 Ko par constructeur, surtout à cause des règles du style. Piste : ne garder que les règles qui concernent la section.
- **Fini = le fichier existe sur le disque**. Un constructeur ou le créateur d'objets dont le fichier manque ou est vide est relancé une fois, avec le même paquet et un rappel. Un plan de directeur invalide est relancé une fois avec l'erreur. Ces relances n'ont pas encore servi en vrai : les fichiers existaient.
- **La barre d'avancement** :
  - equipe.mjs prévoit les étapes dès le départ, selon le niveau : découpage, préparation (modèles, objets, images), construction, contrôle, corrections, polissage ;
  - il les envoie au studio (`{type: 'etapes'}`), avec leur état : fait ✓, en cours ✳ en jaune, à venir ○, sauté (barré), erreur ⚠ ;
  - le détail s'affiche à côté (« 2 sections », « 1/2 ») ;
  - la barre compte l'étape en cours pour sa part ;
  - elle est gardée dans le bilan (`constructions.json`) et revient au rechargement de la page.
- Vérifié le 22/10 sur une copie jetable de `_essai-equipe`, puis effacée :
  - construction « Vérifié » Haiku de 2 sections, lancée par le studio, en 12 min pour 2,61 $ équivalent API ;
  - les 5 étapes ont été cochées en direct, et la carte s'est reconstruite après un rechargement ;
  - 5 paquets écrits, et chaque agent n'a touché que ses fichiers ;
  - captures dans `out/studio-ux/avancement-*.png`.
- Piège : le navigateur garde l'ancien `studio.js` en cache après une modification. Il faut recharger sans le cache.

## Les réglages d'un projet et les genres (étape 3 du système de skills, 22/10)
- **Fenêtre « Construire »** :
  - **Genre**, avec son équipe affichée ;
  - **Ton** : une suggestion, ou le ton décrit avec ses mots ;
  - **Mode** : automatique, ou « je choisis » ;
  - **Budget** : Éco, Recommandé ou Max, avec les modèles de chaque rôle écrits en dessous ;
  - niveau et agents en même temps, comme avant.

  Les réglages sont gardés dans `.studio/reglages.json` du projet (jamais dans project.json) et reviennent à la réouverture. Le CLAUDE.md des projets dit de les respecter. Ils arrivent aussi dans chaque paquet : « Réglages du projet : genre … · ton : … ».
- **Un genre = un fichier** dans `genres/` : `court-viral`, `documentaire`, `vulgarisation`, `fiction`. L'en-tête porte titre, format conseillé, durée, plateformes, `skills` et `equipe`.
  - Les `skills` sont ajoutées au directeur et au polisseur. Par exemple, le documentaire ajoute `documentation`, `verification-sources` et `scenario-long`.
  - Dans `equipe`, une étoile `*` marque un rôle d'écriture ou de publication pas encore branché (documentaliste, scénariste, habillage…). La fenêtre l'affiche « bientôt ».
  - Le corps du fichier donne les règles du genre au directeur (case `{{genre}}`).
  - Pour ajouter un genre, on ajoute un fichier.
- **Budget** (`BUDGETS` dans equipe.mjs) : un modèle et un effort par **famille** de rôle (en-tête `famille` des rôles). Jamais l'effort maximal.
  - Familles : décider = directeur ; fabriquer = objets, constructeurs, correcteurs, polisseur ; vérifier = chercheur d'images.
  - Éco : Sonnet / Sonnet / Haiku. Recommandé : Opus effort haut / Sonnet / Haiku. Max : Opus / Opus / Sonnet.
  - `--modele` en ligne de commande force un seul modèle pour tous (essais).
- **Mode « je choisis »** : après le découpage, la construction attend (étape « Ton accord sur le découpage »). La carte montre les sections (plage, brief) avec deux boutons :
  - « Continuer la construction » ;
  - « Refaire avec ma remarque » : le directeur refait, et la carte redemande.

  Côté serveur : `POST /__api/construire/continuer` avec `{}` ou `{remarque}`. « Tout arrêter » libère aussi l'attente. La carte se retrouve si on recharge la page.
- Vérifié le 22/10 sur une copie jetable (Haiku, 2 sections), puis effacée :
  - la remarque « supprime le chrono et les étiquettes, garde seulement TROIS en très gros » a été appliquée par le directeur, puis validée ;
  - construction finie en 9 min 24 s, 1,55 $ équivalent API, aucun fichier hors de son agent ;
  - un arrêt pendant l'attente termine proprement ;
  - captures : `out/studio-ux/reglages-construire.png` et `valider-decoupage.png`.
- Corrigé pendant l'essai : la case `{{reglages}}` de `_commun.md` n'était pas remplie, car `_commun` n'était pas passé par le remplissage.
- Pas encore fait :
  - les rôles d'écriture (documentaliste, scénariste, vérificateur de sources, spécialiste hook) et de publication (habillage). Ils travaillent avant la voix, donc ce sera une équipe « écriture » à part ;
  - l'estimation du coût avant de lancer ;
  - le genre choisi à la création du projet.

## Ce qu'on a repris de Huashu Design (23/10)
Rapports détaillés (lus par Sonnet) : `docs/recherches-github/huashu-design.md` et `supoclip.md`. Huashu est sous MIT : on réécrit ses règles en français, ses sons sont rangés à part (provenance inconnue, voir `docs/SYSTEME-SKILLS.md` §7).
- **Fiches** (premier jet DeepSeek, relu par Claude) dans `skills/huashu/` : `pratiques-image-figee` (≤ 3 éléments actifs, zoom qui finit sur un ancrage, test à taille de téléphone, check-list), `pratiques-storyboard` (la carte à 8 champs, la grisaille, le squelette d'énergie, les transitions) et `pratiques-camera` (paliers de zoom, durée `0,55·|ln(z2/z1)|/ln 2` bornée [0,30 ; 0,94] s, mouvement avancé sur la pause de voix ≤ 0,8 s, enchaînements, rebond, dérive). S'y ajoute `skills/controle-qualite/references/checklist-relecteur.md` (8 points, gravités).
  - Branchées par `lib/skills.mjs` : `realiser` (les trois), `mouvement` (caméra), `montage` (storyboard), `direction-artistique` (image figée), `controle-qualite`.
  - **Leurs rythmes viennent de démos de produit lentes** : chaque valeur de rythme porte « (rythme démo produit : à adapter) ». Les règles mesurées de la DA passent avant.
- **Le brief d'une section est une carte de storyboard** (`roles/directeur.md`) : cadrage, caméra (+ pourquoi), composition en pourcentages, UNE animation clé, transition, « Vérifier à T = … ». Le constructeur rend d'abord ces instants-là. `storyboard.md` reste une ligne courte par section (il part en entier dans chaque paquet de constructeur).
- **Options du projet « fin » et « coupes »** (décision de Noam : ce sont des options, pas des règles) :
  - fenêtre Construire : Fin (boucle / plan large) et Coupes (sèches permises / aucune coupe sèche). Valeurs par défaut prises dans l'en-tête du genre (`fin`, `coupes`) : court viral et vulgarisation = boucle + sèches, documentaire = plan large + liées, fiction = plan large + sèches (choix de Claude, à corriger si besoin) ;
  - gardées dans `.studio/reglages.json`, écrites en clair dans « Réglages du projet » de chaque paquet (`FINS`, `COUPES` dans equipe.mjs) ;
  - `fin` règle aussi `boucle` dans `.studio/adaptateur.json` (fusionné, jamais écrasé : son.py y range ses pistes). Avant, les projets du studio n'avaient jamais le contrôle de la boucle.
- **Nouveaux contrôles** (`check.mjs`, `lib/qa-page.js`) :
  - **lettre absente** : chaque caractère dessiné est mesuré dans « sa police, monospace » et dans « monospace » seul, puis pareil avec serif. Mêmes largeurs des deux côtés = la police n'a pas la lettre. Vérifié le 23/10 : l'Inter « latin » du moteur n'a ni `→` ni `ğ`.
    - Comparer « police, monospace » à « police, serif » ratait les lettres qu'aucune police de secours n'a : le navigateur prend alors la même police système des deux côtés.
    - `document.fonts.check` ne marche pas non plus : il répond oui même quand le navigateur remplace la lettre.
    - Limites : les espaces et la zone privée d'Unicode ne se testent pas. Une police pas chargée du tout donne « police non chargée ».
  - **contraste faible** : rapport WCAG < 3 entre la couleur du texte et la médiane d'une rangée de la vignette juste au-dessus et juste au-dessous du texte ; on garde la meilleure des deux, l'autre peut tomber sur la ligne voisine d'un sous-titre. On ne mesure pas un texte avec ombre ou contour : c'est ce qui lui donne son contraste ;
  - **passage mort** (moyen) : rien ne bouge pendant 1,5 s ou plus (en dessous, « plan figé », info) ;
  - **vidéo exportée** : durée à ±2 % (au moins 0,2 s) de celle du projet. Le noir est grave au début ou à la fin, moyen au milieu (carton possible) ;
  - le **relecteur aveugle** reçoit le tableau mesuré (coupes, passages figés, noirs) et la check-list en 8 points. Huashu a mesuré que sans ce tableau, l'IA ne trouvait que 3 passages morts sur 14.
- Vérifié le 23/10, en comparant l'ancien contrôle au nouveau :
  - essai-boucle-son : 3 relevés de chaque côté, les mêmes ;
  - Le Mans 66 : 81 relevés de chaque côté, les mêmes, plus 5 « lettre absente », qui sont de vrais défauts : `◀`, `✓` et `✗` ne sont pas dans l'Inter et s'affichent dans une police de secours ;
  - aucun « contraste faible » ni « passage mort » sur ces deux projets. Mais le contraste n'y est presque jamais mesuré : les sous-titres du moteur et les textes du Mans ont une ombre. Il ne couvre que les textes sans ombre ni contour ;
  - `--video` avec un vrai export (essai-boucle-son_tel.mp4 : 11,413 s pour 11,4 s) : rien de signalé. Le bouton « Contrôler » ne passe pas l'export : les contrôles de la vidéo exportée ne tournent qu'en ligne de commande ;
  - un paquet de directeur (copie jetable, genre documentaire) contient bien « fin : plan large · aucune coupe sèche », et l'adaptateur a `boucle: false`.
- `outils/test-check.mjs` : 21 défauts plantés sur 0-8,5 s. On a ajouté une lettre de la zone privée d'Unicode, du gris clair sur blanc, 1,6 s figée et la durée.

