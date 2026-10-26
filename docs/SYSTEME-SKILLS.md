# Le cœur du studio : skills, outils (MCP) et équipe d'agents (proposition, 21/10/2026)

Demande de Noam (21/10) : « tout ce qui est skills, MCP… personnaliser vraiment, c'est le cœur du truc… le travail entre différents agents ». Regarder comment font Remotion (et les autres), adapter ce qui sert.

Ce document est une **proposition à valider**, rien n'est encore construit.

Ce qui a été vérifié moi-même, le 21/10, sur la source :
- dépôts GitHub de Remotion et de HyperFrames (arborescence, skills, licences) ;
- doc de Remotion (pages IA en markdown) ;
- doc de Claude Code (Agent SDK, plugins) ;
- spécification Agent Skills ;
- `claude --help` (version 2.1.285).

---

## 1. Ce que font les autres (vérifié)

### Remotion (React → vidéo), 65,6 k ★, licence maison
- **Une seule skill d'entrée, `remotion-best-practices`, qui aiguille vers les autres** (créer, écrire les compositions, cartes, multimédia, studio, rendu, sous-titres…). Chaque sous-skill = un `REFERENCE.md` + des fiches par sujet (`3d.md`, `audio.md`, `fonts.md`…), + un fichier `agents/openai.yaml` pour que la même skill marche dans Codex.
- Règles marquantes de leur skill d'entrée :
  - **« Préserver les changements de l'utilisateur »** : si le code a changé entre deux demandes, ne pas l'écraser ;
  - **« Ouvrir l'aperçu avant de construire »** et le garder ouvert pendant le travail, pour que l'utilisateur regarde et corrige en direct ;
  - ne pas lancer le rendu final sans demande explicite.
- **Ils ont abandonné leur MCP de documentation** (arrêt prévu après le 31/08/2026). Leurs raisons :
  - les agents ne l'appellent pas de façon fiable ;
  - il est difficile à installer ;
  - il coûte des jetons à Remotion ;
  - il fait doublon avec la skill.

  → **Le savoir va dans des skills, pas dans un MCP.**
- **WebMCP** : leur Studio (la page web) expose ses fonctions à l'agent : sélection, tête de lecture, lecture/pause, erreurs affichées, HTML de la composition, transcription, détourage… Pour l'instant, seul Codex sait s'en servir.
- Des « plugins » prêts à installer pour Claude Code, Codex, Cursor et Copilot (les mêmes skills, emballées pour chaque IA).
- Licences :
  - Remotion lui-même : licence propriétaire, payante au-delà des petites structures ;
  - dépôt des skills : **aucun fichier de licence**.

  → **idées seulement, on ne copie rien.**

### HyperFrames (HTML/Three.js → vidéo, HeyGen), 68,5 k ★, Apache-2.0
C'est le plus proche de nous, et le plus abouti sur les agents.
- **Une skill d'entrée obligatoire, `hyperframes`, qui décide d'après l'état du projet** (pas d'après les mots de la demande). Elle choisit la première ligne qui correspond :

  | Situation | Ce que fait la skill |
  |---|---|
  | une opération précise (rendre, contrôler) | elle fait juste ça |
  | une question ou un ressenti sur un film déjà fait | elle répond, sans rien construire |
  | une retouche précise | elle fait la retouche, sans interview |
  | un `BRIEF.md` existe | elle reprend le flux noté dedans |
  | un storyboard existe | elle reprend depuis les fichiers |
  | une création neuve | **courte interview d'intention**, puis un des 10 flux : explainer sans visage, motion graphics < 10 s, vidéo sur musique, lancement produit, sous-titres, recut face caméra… |
- **24 skills** : des skills de domaine (`hyperframes-core`, `-animation`, `-audio`, `-creative`, `-keyframes`, `-cli`, `-registry`, `media-use`) et des skills de flux (une par type de vidéo). Les skills de flux sont installées à la demande, la première fois qu'on en a besoin.
- **Une bibliothèque de savoir-faire extrait de vraies vidéos** :
  - **22 « blueprints »** : modèles de plan minutés (`Scène 1 (0–2 s) : … → Scène 2 : …`) avec des cases à remplir et un « geste signature ». Ils viennent de l'analyse de **178 clips de référence**. Exemples : « kinetic-type-beats » (le texte change sur le temps), « camera-journey » (la caméra raconte), « spatial-pan-stations »… ;
  - **48 « règles de mouvement »** atomiques (compteur qui grossit avec la valeur, mot-clé qui s'allume sur le mot dit, décodage façon hacker…), chacune avec ses contraintes ;
  - un **index** court de chaque bibliothèque : l'agent lit l'index, puis seulement les fiches qu'il choisit.
- **Le travail en équipe**, décrit sans dépendre d'une IA en particulier (`subagent-dispatch.md`) :
  - **un « paquet » par plan** : l'orchestrateur prépare pour chaque agent un fichier qui contient *tout* ce qu'il lui faut (son rôle, son plan minuté, le blueprint choisi, les recettes des mouvements cités, la voix de sa plage). L'agent **ne lit pas** le storyboard complet ni le catalogue : il ne voit que son paquet + la DA (`frame.md`) ;
  - **« Tu ne décides PAS »** : une liste explicite de ce qui appartient aux autres (le texte dit, la durée, les transitions entre plans, le son) ;
  - **le travail est fini quand le fichier existe sur le disque**, pas quand l'agent dit « fini ». Fichier absent → on relance une fois avec le même paquet, puis on signale l'erreur ;
  - limite de parallélisme = des vagues, jamais moins de travail ;
  - une relance après un contrôle raté reçoit les défauts trouvés comme **contraintes dures**.
- **Les points d'arrêt avec l'utilisateur** (`review-loop.md`) :
  1. le plan, en texte, dans la discussion (« Cette vidéo dit à [public] que [message] » + un tableau des plans) ;
  2. des **images fixes de chaque plan** (mise en page, vrais textes, vraies couleurs, sans mouvement) sur une planche ;
  3. la construction **habille** ces images validées, sans les redessiner ;
  4. l'aperçu final, puis le rendu seulement s'il est validé.
- **Les « recettes »** : quand une vidéo est validée, on la fige en recette (spec de design + squelette du storyboard + réglages). La fois suivante : « refais comme la dernière fois ».
- Emballée pour chaque IA : `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, extension Gemini, `AGENTS.md`. Les skills sont en double dans `.claude/skills` et `.agents/skills`, avec un manifeste d'empreintes (`skills-manifest.json`) pour savoir si une skill installée est à jour.

### Les conseils d'Anthropic pour les équipes d'agents (blog « dynamic workflows »)
- Le plan chez l'orchestrateur ; l'exécution dans des agents isolés au but étroit. Ça évite que l'agent se relâche, qu'il juge son propre travail trop bon et qu'il dérive du but.
- **Faire vérifier par un autre agent que celui qui a produit.** Pour classer, comparer deux par deux plutôt que noter dans l'absolu.
- Des sorties structurées (JSON avec schéma) entre les étapes, pas du texte libre.
- **Les agents qui lisent du contenu extérieur** (pages web, commentaires TikTok) **n'ont que des outils de lecture** et ne rendent qu'un résumé ; les agents qui agissent ne voient que ces résumés.
- Un budget explicite, et pas de panel de 5 relecteurs pour une retouche.
- Garder les déroulés qui ont marché comme modèles réutilisables.

### Le format commun : Agent Skills (agentskills.io)
- Une skill est un dossier :
  - `SKILL.md`, avec `name` (minuscules et tirets, comme le dossier) et `description` (≤ 1024 caractères : ce qu'elle fait **et quand l'utiliser**) ;
  - en option : `license`, `compatibility`, `metadata`, `allowed-tools` (expérimental) ;
  - en option, les dossiers `scripts/`, `references/` et `assets/`.
- Chargement progressif :
  - au démarrage, seulement le nom et la description (~100 jetons par skill) ;
  - le corps quand la skill sert (< 500 lignes) ;
  - les fichiers annexes à la demande, à un seul niveau de profondeur.
- Compris par Claude Code, Codex, Cursor, Copilot, OpenCode… (d'après Remotion et HyperFrames).

### Ce que Claude Code permet déjà (vérifié sur la 2.1.285)
- Lancer `claude -p` avec ces options :
  - `--plugin-dir <dossier>` : skills + agents + hooks + MCP, chargés pour cette session seulement, sans rien installer chez l'utilisateur ;
  - `--mcp-config` + `--strict-mcp-config` : seulement nos outils ;
  - `--agents <json>` : des sous-agents définis par le studio ;
  - `--json-schema` : une réponse structurée ;
  - `--max-budget-usd`.
- `--bare` n'est **pas** pour nous : ce mode exige une clé API, il ne lit pas la connexion de l'abonnement.

### ⚠️ Correction : se connecter avec son abonnement Claude
La doc de l'Agent SDK (vérifiée le 21/10) dit : *« sauf accord préalable, Anthropic n'autorise pas les développeurs tiers à proposer la connexion claude.ai ni ses limites d'usage dans leurs produits »* (traduction). Il faut utiliser une clé API.
- **Pour toi seul**, lancer *ton* `claude` déjà connecté reste normal : c'est ce que fait le studio aujourd'hui.
- **Pour distribuer le studio**, « connecte ton compte Claude » demande l'**accord d'Anthropic**. Sinon, c'est une clé API, ou le Claude Code que l'utilisateur installe et connecte lui-même. **À confirmer avec Anthropic avant toute distribution.**
- `docs/RECHERCHE-PRODUIT.md` §6 disait « Permis » : c'est corrigé.

---

## 2. Où on en est (ce qui existe déjà)

| Brique | Aujourd'hui | Limite |
|---|---|---|
| Savoir | `references/` copiées dans chaque projet : la DA (da.md + skill tiktok-motion + règles), `moteur.md`, `motion-engine.md`, `sound-design.md` ; les 11 skills de tiktok-motion (storytelling, hook, réalisateur Koan, DA Koan / auto / pixel rose, son, motion…) ; 88 DA dans `_styles/`, `niches.json`, `compte.md` des comptes copiés | **Tout est donné en bloc** : un constructeur reçoit la DA entière, le storyboard entier, les règles entières. Rien n'est choisi selon la tâche. Pas d'index, pas de blueprints, pas de recettes de mouvement. |
| Outils | `.studio/rendre.mjs`, `controler.mjs`, `bibliotheque.mjs`, `telecharger.mjs` (commandes Bash autorisées une par une) | Ils marchent seulement pour Claude, et seulement par Bash. |
| Équipe | `lib/equipe.mjs` : directeur → objets ∥ images → 3 constructeurs en parallèle → contrôle + correcteurs → polisseurs ; un fichier par agent, un commit par agent, Annuler | **Les rôles sont écrits en dur dans le code** (les consignes sont des chaînes de caractères). Pas de point d'arrêt avec toi entre le plan et la construction. Le directeur n'a pas de modèles de plans. Personne ne vérifie « à froid » à part le contrôle automatique. |
| Personnalisation | « Retenir… » → `.studio/memoire.md` (projet) ou `regles.md` (style) | Pas de profil du créateur ni de règles par chaîne. Impossible de voir et de régler ce que l'IA sait. |

---

## 3. La proposition

### 3.1 Trois étages, chacun à sa place

1. **Le savoir = des skills** (format Agent Skills).
   - Une seule source : `skills/` dans le studio (+ `_styles/` pour les DA, qui restent où elles sont).
   - Le studio **fabrique** les dossiers que chaque IA attend : un plugin pour Claude (`--plugin-dir`), `.agents/skills` + `AGENTS.md` pour Codex, ou le texte choisi pour une API.
2. **Les actions = un serveur MCP du studio** (local, `stdio`) :
   - `rendre_images(instants)` ;
   - `planche(plage)` ;
   - `controler(plage)` ;
   - `timeline()` : plans, mots, sons en JSON, pour que l'agent ne relise pas tous les fichiers ;
   - `chercher_bibliotheque(texte)` ;
   - `stats_video(id)`.

   Il remplace les scripts `.studio/*.mjs`. Avec Claude, on ne charge que lui (`--strict-mcp-config`), et chaque agent n'a que les outils de son rôle. C'est ce qui rendra les outils utilisables par Codex et par les API plus tard.
3. **L'équipe = des rôles écrits dans des fichiers** (`agents/<role>.md`). Pour chaque rôle :
   - sa mission ;
   - les skills qu'il reçoit ;
   - les outils qu'il a le droit d'utiliser ;
   - les fichiers qu'il a le droit d'écrire ;
   - son modèle ;
   - la liste « tu ne décides pas ».

   **L'orchestrateur reste notre code** (`lib/equipe.mjs`), déterministe : on n'adopte ni LangGraph, ni Mastra, ni aucun autre cadre. Il lit les rôles au lieu de les avoir en dur.

### 3.2 Le catalogue de skills (premier jet)

| Skill | Pour qui | D'où elle vient |
|---|---|---|
| `studio` (entrée, aiguillage) | l'IA du projet | nouvelle : tableau « état du projet → que faire » à la HyperFrames (question, retouche, nouvelle vidéo, V2 d'après les résultats…) |
| `ecrire-script`, `hook`, `storytelling` | scénariste | skills tiktok-motion `storytelling-tiktok`, `hook-koan`, `humanizer-fr` (copiées, jamais modifiées sur place) + accroches de `niches.json` |
| `realiser` (découper en plans) | directeur | `realisateur-koan` + **blueprints** (ci-dessous) |
| `moteur-3d` | constructeurs | `moteur.md` + `motion-engine` + règles de fonction pure de T |
| `da-<id>` (une par DA) | tout le monde | `_styles/<id>/` (da.md + règles), fabriquée automatiquement. Le directeur reçoit l'index des DA ; un constructeur ne reçoit que la DA du projet |
| `son` | mixeur | `sound-design` |
| `controle-qualite` | vérificateur | les contrôles (zone sûre, à-coups, mots couverts…) + ce que le relecteur aveugle doit regarder |
| `analyser-resultats` | analyste | Résultats (médiane des 20 dernières, rétention, zone du hook) → propositions de V2 |
| `niches` | conseiller | `niches.json` + `compte.md` des comptes copiés |

**Les blueprints et les règles de mouvement à nous.** On a déjà copié **47 comptes** avec leurs mesures (coupes, bascules de caméra, moments, mots). On peut en tirer, comme HyperFrames avec ses 178 clips :
- des **modèles de plan minutés** (« accroche chiffre choc 0–1,5 s », « travelling révélation », « gel 3D → 2D dans la tête du pilote »…) ;
- des **recettes de mouvement** (texte qui claque sur le mot, compteur, zoom de recadrage…) écrites pour *notre* moteur.

Le directeur choisit un modèle par plan, et le constructeur reçoit la fiche du modèle et les recettes citées, rien d'autre.

### 3.3 Le déroulé d'une vidéo (avec tes points d'arrêt)

1. **Plan** : le directeur propose dans la discussion « Cette vidéo dit à [public] que [message] » + le tableau des plans (blueprint choisi, ce qu'on voit, pourquoi). → **tu valides ou tu corriges.**
2. **Images fixes** : une image par plan, à l'instant clé (mise en page, vrais textes, vraies couleurs, sans mouvement), sur une planche dans le studio. → **tu valides ou tu dis lesquelles changer.**
3. **Construction** : un **paquet par section** (rôle + brief + blueprint + recettes + voix de la plage + DA + « tu ne décides pas »). Les constructeurs habillent les images validées, en parallèle. Une section est finie quand son fichier existe et que son contrôle passe ; sinon, une relance avec les défauts.
4. **Vérification à froid** par un autre agent que celui qui a construit : contrôles automatiques + planche. Pour choisir entre deux versions, il les compare deux par deux.
5. **Aperçu** dans le studio → tu exportes quand tu veux.
6. **Recette** : une vidéo validée peut être figée (« refais comme celle-là »). Ça rejoint le « Retenir… » qui existe.

En mode « fais tout seul », les points d'arrêt 1 et 2 deviennent des messages qui n'attendent pas, et on garde une seule question avant l'export.

### 3.4 La personnalisation : la page « Ce que sait ton IA »
- Quatre niveaux, du plus général au plus précis :
  - le studio (savoir commun) ;
  - le créateur (profil, goûts, voix) ;
  - la chaîne (Koan, Automobile : ton, DA, règles retenues) ;
  - le projet (mémoire).

  Le plus précis l'emporte.
- **Les règles obligatoires** (rétention, zone sûre, fonction pure de T) vont dans le **contexte permanent**, jamais dans une skill facultative que l'IA pourrait ne pas charger.
- Une page dans Bibliothèque → « Skills ». On y voit :
  - chaque skill, d'où elle vient et quand elle sert ;
  - les règles retenues ;
  - une activation par chaîne ;
  - une modification à la main ;
  - « Ajouter depuis GitHub ».
- **Une skill venue de GitHub**, à l'ajout :
  - le studio montre sa licence et son contenu ;
  - il **retire son `allowed-tools`** : il pourrait élargir ce qu'un agent a le droit d'écrire, et casser le « un agent = ses fichiers » ;
  - il **n'exécute jamais ses scripts automatiquement** (même règle que pour Impeccable).

  Nos skills fabriquées n'ont jamais d'`allowed-tools` : ce sont les rôles qui donnent les droits.

### 3.5 Les autres IA (plus tard, étape 5 de la vision)
- **Claude** : un plugin chargé par `--plugin-dir` + notre MCP. Aucune installation chez l'utilisateur.
- **Codex** : `.agents/skills` + `AGENTS.md` générés + le même MCP (Codex App Server).
- **Une API** (OpenAI, Anthropic, OpenRouter…) : c'est notre code qui choisit les skills (d'après leurs descriptions), les met dans le contexte et exécute les outils MCP.
- Le **chercheur** (pages web, commentaires) reste en lecture seule et ne rend qu'un résumé.

---

## 4. Ordre proposé (une étape à la fois, démonstration, puis ton retour)

1. ✓ (22/10, voir CLAUDE.md « Les skills du studio ») **Le catalogue + l'aiguillage** :
   - `skills/` généré à partir de l'existant (les 11 skills de tiktok-motion copiées, les DA, le moteur, le son) ;
   - chargé par `--plugin-dir` dans les sessions Claude du studio.

   Démo : la même construction qu'avant (essai-boucle-son), avec moins de contexte, et la liste de ce que chaque agent a reçu.
1 bis. ✓ (22/10) **La recherche par métier** : 12 métiers par Codex, condensés par DeepSeek, relus ; 6 skills de plus (16 en tout). Voir CLAUDE.md.
2. ✓ (22/10, voir CLAUDE.md, avec la barre d'avancement) **Les rôles en fichiers + les paquets** : `agents/*.md`, `equipe.mjs` qui les lit, un paquet par section, « fini = le fichier existe », point d'arrêt « plan » dans la discussion.
2 bis. ✓ (22/10, voir CLAUDE.md) **Les réglages et les genres** : genre (avec son équipe), ton, mode « je choisis » (validation du découpage), budget Éco/Recommandé/Max par famille de rôle.
3. **Les blueprints et recettes de mouvement** tirés des 47 comptes copiés (Opus propose, le code vérifie comme pour les règles des styles), + point d'arrêt « images fixes ».
4. **Le serveur MCP du studio** (à la place des scripts `.studio/*.mjs`), avec des outils par rôle.
5. **La page « Ce que sait ton IA »** (voir, activer, retenir, ajouter depuis GitHub en sécurité).
6. Codex et les API.

---

## 5. L'équipe complète (demande de Noam, 22/10)

**Skill ≠ agent.**
- Une skill est une fiche de savoir.
- Un agent est un rôle (un « employé ») qui reçoit les fiches dont il a besoin, ses outils et ses fichiers.
- Le chef de projet (l'orchestrateur) choisit quels agents appeler, d'après le format et les réglages.

| Rôle | Court (TikTok, Shorts, Reels) | Long / documentaire (YouTube 16:9) |
|---|---|---|
| Chef de projet | ✓ | ✓ |
| Chasseur de sujets (niches, veille des comptes modèles) | ✓ | ✓ |
| Documentaliste (recherche, faits, chronologie) | si le sujet le demande | ✓ |
| Vérificateur de sources (chaque fait a sa source, sinon il est retiré ou dit « non vérifié ») | en mode sérieux | ✓ |
| Scénariste | viral : rythme, re-hooks | narratif : chapitres, arcs, révélations |
| Spécialiste hook (3 à 5 hooks proposés) | ✓ | ✓ (début et chaque chapitre) |
| Gardien de la rétention (relit le script seconde par seconde : où on décroche) | ✓ | ✓ |
| Comment bait (en option) | ✓ | — |
| Directeur artistique (choisit la DA et ses réglages) | ✓ | ✓ |
| Réalisateur (découpage, plans, caméra) | ✓ | ✓ |
| Chercheur d'images et d'archives (licences libres, crédits) | parfois | ✓ |
| Reconstitution 3D (crash, bataille, machine : à partir des données réelles) | parfois | ✓ |
| Constructeurs 3D / 2D (une section chacun) | ✓ | ✓ |
| Monteur (timeline, b-roll, rythme, transitions) | ✓ | ✓ |
| Sound designer | ✓ | ✓ |
| Vérificateur à froid (images, contrôles) | ✓ | ✓ |
| Habillage (titre, description, hashtags, couverture, miniature, chapitres) | ✓ | ✓ |
| Analyste des résultats (48 premières heures, puis V2 et leçons pour la suite) | ✓ | ✓ |

**Les réglages d'un projet** :
- **Mode** : *automatique* (le chef de projet décide, une seule question avant l'export) ou *je choisis* (arrêt au plan, aux hooks, à la planche d'images).
- **Ton** : sérieux et sourcé · divertissant · provocateur.
- **Comment bait** : oui / non.
- **Budget** :

  | Budget | Les rôles qui décident (chef, scénario, DA) | Ceux qui fabriquent (constructeurs) | Ceux qui vérifient |
  |---|---|---|---|
  | Éco | Sonnet | Sonnet | Haiku ou DeepSeek |
  | Recommandé | Opus, effort haut | Sonnet | Haiku pour les images, Sonnet pour juger |
  | Max | Opus | Opus | Sonnet ou Opus |

  Jamais l'effort maximal. Le coût estimé est affiché avant de lancer.

**Les DA en familles** :
- Famille (3D réaliste, 2D…) → sous-famille → DA. Les doublons parmi les 88 DA sont fusionnés.
- Chaque DA a des **paramètres** : palette, police, grain, contours, éclairage… « La même en bleu et orange » change les réglages, sans créer une nouvelle DA.

**Après la publication** :
- Analyse des 48 premières heures : rétention, chutes, hook.
- Propositions de V2 et 3 nouveaux hooks.
- Les leçons vont dans les règles de la niche, pour les prochains scripts.

**Auto-amélioration** :
- Chaque « j'aime pas » est noté (c'est déjà « Retenir… »).
- Une demande répétée 3 fois → le studio propose d'en faire une skill.
- Une skill nouvelle ou modifiée est essayée sur un projet témoin avant d'être adoptée.

**Précisions de Noam (22/10, « tout ça, c'est un brouillon : modifie, adapte, améliore »)** :
- **Le long format, c'est tout YouTube**, pas seulement le documentaire : fiction, vulgarisation scientifique, présentations, histoire, essais… → une bibliothèque de **genres**. Chaque genre a son équipe et ses étapes. Le documentaire n'est qu'un genre parmi d'autres.
- **Une recherche par métier** : pour chaque rôle (DA, réalisateur, constructeur 3D, monteur, sound designer…), chercher les bonnes pratiques des pros et les outils GitHub (par exemple un mixage assisté par IA). Chaque recherche devient la skill du métier.
- **Le ton est libre** : en plus des tons proposés, la personne décrit le sien avec ses mots, et l'IA s'adapte.
- **Exagéré pour la viralité, oui ; faux, non.** Partir d'une base vraie et la pousser fort, c'est permis. Un registre familier (« ta grosse mère », des mots un peu vulgaires qui passent sur TikTok, pour faire réagir dans les commentaires) est un **ton** comme un autre. Pas d'insultes visant quelqu'un.
- **Les réglages au démarrage** :
  - la voix : un moteur local sur l'ordinateur, Gemini, ou un service connu comme ElevenLabs ;
  - les IA : une seule pour tout, ou une principale plus une pour les recherches, ou plusieurs qui travaillent ensemble.
- **Les formats** : un seul format par vidéo (pas de 16:9 imposé à une vidéo verticale), deux seulement si on le demande. La **traduction** en plusieurs langues : oui.
- **Abandonné** : le test A/B des hooks (il faut plusieurs comptes).
- **La veille** : faisable sans robot spécial. `outils/lot-meta.mjs` lit déjà les infos publiques des vidéos (vues, titres) sans les télécharger. On relèverait les dernières vidéos des comptes modèles à l'ouverture du studio, et on signale celles qui explosent. À essayer : TikTok peut limiter les relevés trop fréquents.
- **Calendrier et séries** : oui.
- **La mémoire de niche, partagée** : avec l'accord de la personne et anonymisée, ses résultats aideraient à améliorer les conseils pour tout le monde. Pour un logiciel distribué : consentement explicite, aucun nom ni compte.
- **Les droits de la musique dépendent de la plateforme** :
  - TikTok : la bibliothèque musicale de l'appli est permise ;
  - YouTube, surtout en vidéo longue : il faut faire attention, et prévenir l'utilisateur ;
  - Instagram : à vérifier.

  À vérifier aussi : une musique déjà mixée dans le fichier envoyé peut être repérée et coupée sur TikTok, même si elle serait permise quand on l'ajoute dans l'appli. Le studio devra donc avertir selon la plateforme.

**Rôles et contrôles proposés par la recherche par métier (Codex, 22/10, `docs/recherches-metiers/`)** :
- **Contrôleur de promesse** : le titre, la miniature, le hook et la fin annoncent et livrent la même chose.
- **Contrôleur de compréhension** : surcharge, images ambiguës, idée fausse qui reste après l'explication.
- **Superviseur de continuité visuelle** : axes, directions, regards entre des sections faites par des agents différents.
- **Superviseur voix–texte–image** : après chaque nouvelle voix, les repères suivent, et aucun texte ne révèle la chute avant qu'elle soit dite.
- **Contrôleur de synchronisation son/image** : selon la norme EBU R37, le son est au plus 5 ms en avance ou 15 ms en retard.
- **Lisibilité et accessibilité** : contraste 4,5:1, l'information ne passe jamais par la seule couleur, pas plus de 3 flashes par seconde.
- **Réviseur voix / sous-titres** : noms propres, nombres, texte réellement prononcé.
- **Contrôleur des reconstitutions** : ce qui vient d'une donnée documentée, ce qui est interpolé, ce qui est inventé, voix reconstruites comprises.
- **Expert métier contradicteur** : il cherche les conclusions trop fortes (par exemple, une cause tirée d'un rapport préliminaire d'accident).
- **Responsable des droits et de la provenance** : licences et crédits des images, des sons et des polices.
- **Contrôleur de publication** : vérifier le rendu tel qu'il est lu sur la plateforme.
- **Responsable des expériences** : noter les hypothèses avant la publication, puis mesurer l'écart après.
- **Responsable des corrections** : un nouveau rapport ou une erreur signalée se répercute dans la narration et la description.
- **Contrôleur de déterminisme** : horloges réelles, aléatoire sans graine, versions qui changent.

**La barre d'avancement (idée de Noam, 22/10)** : pendant que l'équipe travaille, une liste des étapes, comme celle de Claude Code. Chaque étape est cochée, en cours ou à venir, avec l'agent qui la fait. La personne voit que ça avance, sans rien lire. Les fichiers `.md` sont écrits **pour les IA** : courts, une idée par ligne, économes en jetons. La personne peut les ouvrir si elle veut, mais ce n'est pas pour elle.

**À trancher par Noam** :
- **Publier depuis le logiciel**, sur plusieurs comptes. Aujourd'hui, la règle est « publication manuelle ».
  - Par les API officielles : TikTok demande un audit (sans audit, en privé seulement) ; YouTube marche ; Instagram demande un compte pro relié à une page Facebook.
  - Un robot qui clique dans le navigateur à notre place = risque de bannissement des comptes.
- **Relevé des stats tous les jours** : aujourd'hui, la règle est « pas de routines ». On pourrait relever les stats à l'ouverture du studio.

## 6. Recherche GitHub : 3D, Three.js, GPU (21/10)

Cette liste complète `docs/RECHERCHE-GITHUB.md` (20/10).
- Recherche faite par un agent, avec étoiles, licences et dernière activité vérifiées par l'API GitHub. Rien n'a été installé ni lancé.
- La première découverte a été revérifiée sur notre propre copie de three.js.

**La découverte : three.js 0.186.1, déjà installé, a des générateurs procéduraux.** Ils sont dans `node_modules/three/examples/jsm/generators/` :
- `TerrainGenerator` (terrain), `CityGenerator` (ville), `ForestGenerator` (forêt), `TreeGenerator` (arbres) ;
- dans `city/` : gratte-ciel, trottoirs, voitures, passants, lampadaires, feux, bancs…

L'aléatoire y est **à graine** (`mulberry32`) : aucun `Math.random`, `Date.now` ni `performance.now`. Vérifié le 21/10 dans notre `node_modules`.

Les exemples de la même version couvrent aussi :
- l'océan, le ciel, la lumière et les nuages volumétriques ;
- les rayons de lumière (godrays) ;
- le flou de mouvement ;
- le rendu cartoon, la trame d'impression, le rendu rétro ;
- la peinture de voiture, les décalcomanies.

**Limite** : ces générateurs demandent le rendu WebGPU (`three/webgpu`). C'est l'argument le plus fort pour avancer la phase WebGPU (à essayer d'abord en mode WebGL2 de ce moteur).

| Ordre | Projet | ★ / licence | À quoi ça nous servirait | Fonction pure de T |
|---|---|---|---|---|
| 1 | Générateurs et exemples WebGPU de three r186 | déjà là / MIT | terrain, ville, forêt, océan, ciel, lumière volumétrique | ✅ graine |
| 2 | [linegel/threejs-complete-set-of-skill](https://github.com/linegel/threejs-complete-set-of-skill) | 11 / ISC | 27 skills Three.js WebGPU/TSL pour agents (validation visuelle, caméra, particules, océan, nuages, villes…) : de la matière pour notre skill `moteur-3d` | à relire (dépôt jeune) |
| 3 | [takram three-geospatial](https://github.com/takram-design-engineering/three-geospatial) | 1,7 k / MIT | ciel et atmosphère physiques, nuages volumétriques (levers et couchers de soleil pour l'auto) | ⚠️ couper ses options « temporelles » |
| 4 | [RapidOCR](https://github.com/RapidAI/RapidOCR) | 8,2 k / Apache-2.0 | contrôle « texte lisible » : relire les sous-titres et cartons, comparer à `words.json` | ✅ |
| 5 | [InstancedMesh2](https://github.com/agargaro/instanced-mesh) | 453 / MIT | semer des milliers d'objets (public, trafic, décors) sans écraser la carte graphique | ✅ |
| 6 | [ez-tree](https://github.com/dgreenheck/ez-tree) | 1,7 k / MIT | arbres réalistes à graine | ✅ |
| 7 | [three-good-godrays](https://github.com/Ameobea/three-good-godrays) | 236 / zlib | rayons de lumière tout de suite en WebGL | ✅ (version de three à tester) |
| 8 | [n8ao](https://github.com/N8python/n8ao) | 503 / CC0 | ombre de contact (roues au sol, coins des décors) : gros gain de réalisme | ❌ horloge interne → horloge imposée (ci-dessous) |
| 9 | [ffmpeg-quality-metrics](https://github.com/slhck/ffmpeg-quality-metrics) + [VMAF](https://github.com/Netflix/vmaf) | 561 / MIT, 5,6 k / BSD | comparer deux versions d'un rendu image par image (avant / après une demande) | ✅ |
| 10 | [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) / [Spector.js](https://github.com/BabylonJS/Spector.js) | 53,9 k / Apache-2.0, 1,6 k / MIT | pour que les agents trouvent seuls pourquoi une image est lente, noire ou un shader cassé | sans objet |

Autres pistes :
- [threejs-devtools-mcp](https://github.com/DmitriyGolub/threejs-devtools-mcp) (MIT) : inspecter et modifier une scène Three.js en direct depuis un agent ;
- [Impertio Three.js skills](https://github.com/Impertio-Studio/Three.js-Claude-Skill-Package) (MIT, 24 skills) ;
- [glTF-Validator](https://github.com/KhronosGroup/glTF-Validator) (Apache, une vérification de plus dans `admettre.mjs`) ;
- [camera-controls](https://github.com/yomotsu/camera-controls) (MIT, rig de caméra ; pur seulement sans transition) ;
- [three-nebula](https://github.com/creativelifeform/three-nebula) (MIT, particules avec `setSeed`, à rejouer de 0 à T) ;
- [Spark](https://github.com/sparkjsdev/spark) (MIT, Gaussian splats) ;
- [Mediabunny](https://github.com/Vanilagy/mediabunny) (MPL-2.0, encodage dans le navigateur) ;
- [node-av](https://github.com/seydx/node-av) (MIT, ffmpeg dans Node avec l'accélération matérielle) ;
- [PySceneDetect](https://github.com/Breakthrough/PySceneDetect) (BSD, deuxième avis sur les coupes) ;
- [Qwen3-VL](https://github.com/QwenLM/Qwen3-VL) (Apache, relecteur aveugle local si un petit modèle tient dans 6 Go, non vérifié).

**Ajouts de la recherche Codex (21/10, terminée après coup ; sources dans la réponse, non revérifiées une par une)** :
- **[Mediabunny](https://github.com/Vanilagy/mediabunny)**, son premier choix : encoder directement dans Chromium (WebCodecs), avec un temps explicite par image (`CanvasSource.add(timestamp, duration)`). Ça pourrait supprimer le transfert des pixels vers ffmpeg. À mesurer, aucun gain n'est prouvé.
- **API Poly Haven** : gratuite pour un usage commercial depuis juillet 2026 (attribution et User-Agent propre demandés). **ambientCG** a une API (CC0). Kenney et Quaternius sont en CC0, sans API. La [Downtown City MegaKit de Quaternius](https://quaternius.com/packs/downtowncitymegakit.html) date de mai 2026.
- **[WhisperX](https://github.com/m-bain/whisperX)** (BSD-2) ou Echogarden, pour les mots minutés ; [web-audio-beat-detector](https://github.com/chrisguttandin/web-audio-beat-detector) (MIT) pour le tempo, calculé une fois à l'avance.
- **[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)** (Apache-2.0), même usage que RapidOCR ; [VBench](https://github.com/Vchitect/VBench) pour le scintillement et la fluidité.
- **[TRELLIS.2](https://github.com/microsoft/TRELLIS.2)** (MIT, image → 3D) : demande Linux et 24 Go de mémoire graphique, donc pas sur ce portable.
- **Hunyuan3D-2.1 : sa licence ne s'applique pas dans l'UE**, donc exclu.
- [puppeteer-capture](https://github.com/alexey-pelykh/puppeteer-capture) : temps virtuel de Chrome, mais dépend d'une API expérimentale.

**Une idée qui coûte presque rien : une horloge imposée dans la page de rendu.** Avant de charger la scène, on remplace `performance.now`, `Date.now` et `Math.random` par des fonctions qui dépendent de T et d'une graine. Les bibliothèques fautives (n8ao, particules…) deviennent alors pures sans qu'on les modifie. À vérifier avec `verif-pixels.mjs`.

**Licences qui bloquent une distribution** :
- non commercial :
  - lygia (Prosperity) ;
  - IQA-PyTorch (PolyForm Noncommercial) ;
  - Q-Align, DOVER (S-Lab) ;
- AGPL : aesthetic-predictor-v2-5, audioMotion-analyzer ;
- **aucune licence** : r3f-skills, three-agent-skills, webgpu-claude-skill, remotion-dev/skills.

  → idées seulement, on ne copie rien.

---

## 7. Huashu Design et SupoClip (23/10)
Rapports détaillés (lus par Sonnet) : `docs/recherches-github/huashu-design.md` et `docs/recherches-github/supoclip.md`.

**Décision de Noam (23/10)** : la fin et les coupes deviennent des **options du projet**, pas des règles fixes.
- Fin : **boucle** (la fin raccorde au début, comme aujourd'hui) ou **fin sur un plan large** (la clôture « cinéma » de Huashu).
- Coupes : **coupes sèches permises** (montage viral) ou **aucune coupe sèche** (transitions liées, façon Huashu).
- À mettre dans les réglages de la fenêtre « Construire » (`.studio/reglages.json`), avec la valeur par défaut donnée par le genre, puis passées au directeur et au polisseur.

**Sons de Huashu copiés (23/10, à la demande de Noam)** dans `C:/tiktok/chat/sfx` et ajoutés au catalogue (le studio les montre dans le volet Sons) : 36 bruitages (interface, clavier, impacts, magie, whooshes) et 6 musiques (`13_Musiques/Tech_et_tutoriel`). Provenance : bruitages générés avec ElevenLabs, musiques avec Suno, formules inconnues, donc droits commerciaux inconnus. Détail dans `90_Documents_et_metadonnees/Huashu Design - provenance et licence.txt`.
