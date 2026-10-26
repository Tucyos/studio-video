# Recherche produit (Codex `gpt-6.1-sol`, 20/10/2026)

Vérifié par sondage le 20/10 sur GitHub et sur la doc TikTok :
- HyperFrames : 68,4 k ★, Apache-2.0, adaptateur Three.js, 21 skills d'agent ;
- Taste Skill : 99,8 k ★, MIT ;
- Video Object de TikTok : 16 champs, sans aucun temps de visionnage ni rétention.

Le reste vient de Codex, sources citées, sans vérification une par une.

## 1. Motion design en code : bibliothèques et skills

| Projet | ★ | Licence | Intérêt pour le studio |
|---|---:|---|---|
| [HyperFrames (HeyGen)](https://github.com/heygen-com/hyperframes) | 68 k | Apache-2.0 | **Le plus proche de nous.** HTML/JS animé → vidéo déterministe, adaptateurs Three.js / GSAP / Anime.js / Lottie, 21 skills pour agents. À étudier : son contrat de rendu et ses skills. Pas de migration du moteur. |
| [Remotion](https://github.com/remotion-dev/remotion) + [skills](https://github.com/remotion-dev/skills) | 66 k / 5 k | Licence Remotion (payante au-delà des petites structures) ; licence des skills floue | Bonnes pratiques de timing. Le moteur est en React : migration. **Ne pas redistribuer ses skills sans clarifier la licence.** |
| [GSAP](https://github.com/greensock/GSAP) + [gsap-skills](https://github.com/greensock/gsap-skills) | 30 k / 17 k | GSAP « No Charge » (restrictions pour les outils visuels concurrents) ; skills MIT | Timeline + `seek(t)`. La licence est à vérifier si on distribue un éditeur. |
| [Anime.js](https://github.com/juliangarnier/anime) | 74 k | MIT | `timeline.seek(t*1000, true)` : simple et permissif |
| [Theatre.js](https://github.com/theatre-js/theatre) | 13 k | Apache-2.0 | Éditeur de keyframes et courbes pour Three.js (`sequence.position = t`) : piste pour les « réglages en direct » |
| [Lottie Web](https://github.com/airbnb/lottie-web) | 32 k | MIT | Animations 2D exportées d'After Effects, `goToAndStop(frame, true)` |
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) / [Revideo](https://github.com/midrender/revideo) | 19 k / 4 k | MIT | 2D, modèle par générateurs : pas une fonction pure de T |
| [motion-kit (every-frame-is-code)](https://github.com/kiselas/every-frame-is-code) | 13 | MIT | Petit, mais même philosophie que nous (« image = fonction pure du temps ») : à lire pour les règles |
| [Claude Motion Director](https://github.com/abdullatif06/claude-motion-director) | 10 | MIT | Méthode brief → DA → son → plans → critique, sur HyperFrames |

Règle confirmée par Remotion ([flickering](https://www.remotion.dev/docs/flickering)) : on teste des images dans le désordre (120, 0, 60, 120). C'est ce que fait déjà notre échauffement.

## 2. Recadrage 16:9 → 9:16

- **Pour nos scènes en code : recomposer en 9:16** (caméra, textes, zones sûres). On ne recadre pas.
- **Pour des vidéos importées** :
  1. détection des plans ([PySceneDetect](https://github.com/Breakthrough/PySceneDetect), BSD) ;
  2. visages ([YuNet](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet), MIT, CPU suffit) ;
  3. trajectoire de recadrage lissée, enregistrée en JSON et corrigeable à la main.
- [AutoFlip](https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/autoflip.md) est abandonné depuis 2023.
- YOLO est sous AGPL : à éviter dans un logiciel distribué.

## 3. Skills de design d'interface

| Skill | ★ / licence | Ce qu'il fait |
|---|---|---|
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 138 k, MIT | Base de règles UX (99), styles, palettes et typos interrogeables. **Installé chez toi mais désactivé** (`~/.claude/skills-off/`), et ses données sont des liens cassés : seules les règles de SKILL.md sont lisibles. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | 100 k, MIT | Direction artistique, vérification dans un vrai navigateur à 3 largeurs, jusqu'à 3 tours de correction |
| [frontend-design (Anthropic)](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Apache-2.0 | Choisir une esthétique liée au sujet, éviter l'interface générique |
| [Impeccable](https://github.com/pbakaus/impeccable) | 84 k, Apache-2.0 | Critique UX, audit d'accessibilité / responsive / performance, finition |

Conseil de Codex : prendre une seule direction (frontend-design ou Taste), et Impeccable pour la revue. Ne pas tout charger à la fois, les règles se contredisent.

## 4. Système de skills dans le logiciel

- **Format commun : Agent Skills** (`SKILL.md` + `references/`, `scripts/`, `assets/`, [spécification](https://agentskills.io/specification)). C'est déjà presque notre `references/`.
- Trois rôles distincts :
  - `SKILL.md` = une procédure chargée selon la tâche ;
  - `AGENTS.md` / `CLAUDE.md` = les règles permanentes du projet ;
  - **MCP** = l'accès aux fonctions du studio (rendre une image, planche, contrôle, statistiques).
- Par IA :
  - Claude Code : `.claude/skills/` ;
  - Codex : `.agents/skills/` + `AGENTS.md`, piloté par **Codex App Server** ;
  - API brute (OpenAI, Anthropic, OpenRouter, DeepSeek) : c'est **notre** logiciel qui choisit les skills, les met dans le contexte et exécute les outils.
- Organisation proposée : une source unique (`context/` = faits sur le créateur : DA, audience, niche ; `skills/` = procédures), puis le studio génère les dossiers attendus par chaque IA. **Les règles de rétention obligatoires vont dans le contexte permanent**, pas dans un skill facultatif.

## 5. TikTok

| Donnée par vidéo | Display API (Login Kit) | Accounts API (Business, accès sur demande depuis le 20/03/2026) |
|---|---|---|
| Vues, likes, commentaires (nombre), partages, durée | Oui | Oui |
| Temps moyen regardé, temps total, taux de vidéo finie | **Non** | Oui (`average_time_watched`, `total_time_watched`, `full_video_watched_rate`) |
| Courbe de rétention seconde par seconde | Non | Non confirmé |
| Texte des commentaires | Non | — |

- **Publication par API** (Content Posting) :
  - sans audit, en privé seulement et pour 5 utilisateurs ;
  - l'audit exige un aperçu, un consentement et le choix de confidentialité ;
  - **un outil réservé à ses propres comptes est refusé.**

  Pour nous, de toute façon, la publication reste manuelle.
- La Research API est interdite aux usages commerciaux de créateurs.
- Le `client_secret` ne doit jamais être livré dans le logiciel : il faudra **un petit serveur** pour la connexion TikTok, si on distribue le logiciel.
- YouTube (vérifié le 20/10 sur la doc des métriques) : YouTube Analytics API donne la courbe de rétention (`audienceWatchRatio`, `relativeRetentionPerformance` par `elapsedVideoTimeRatio`), `averageViewDuration` et `averageViewPercentage`, pour la chaîne connectée (OAuth du propriétaire).

## 6. Se connecter avec un abonnement IA

| Mode | Statut |
|---|---|
| Claude Code local, compte de l'utilisateur (Pro/Max) | **Pour soi : oui** (il consomme les limites de l'abonnement, [aide Claude](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)). **Dans un logiciel distribué : non sans accord d'Anthropic.** Corrigé le 21/10 d'après la [doc de l'Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) : « sauf accord préalable », un développeur tiers ne propose ni la connexion claude.ai ni ses limites d'usage ; il faut une clé API. Ou l'utilisateur installe et connecte lui-même son Claude Code. À confirmer avec Anthropic avant toute distribution (voir `docs/SYSTEME-SKILLS.md`). |
| Codex local / App Server, compte de l'utilisateur | Voie officielle ([App Server](https://developers.openai.com/codex/app-server/)) |
| « Sign in with ChatGPT » directement dans une appli payante | Accès commercial à demander à OpenAI ([client ID](https://developers.openai.com/siwc/request-client-id)) |
| Clé API (OpenAI, Anthropic, OpenRouter, DeepSeek) | Toujours possible, facturée par le fournisseur |
| Un abonnement partagé entre plusieurs clients | **Interdit** |

## Recommandations (classées)

1. Formaliser le contrat de rendu de notre moteur (`prepare` / `renderFrame`, graines, planches de contrôle). C'est la base de toutes les IA connectées.
2. Notre propre catalogue de skills portable : DA, storyboard, hooks, typographie animée, Three.js déterministe, revue de rétention.
3. Comparer HyperFrames sur 3 vidéos (qualité, temps, facilité de correction) avant toute décision.
4. Trois connecteurs IA séparés : Claude Code local, Codex App Server, clé API.
5. TikTok par étapes : export local → connexion + 4 compteurs → demande Accounts API. Garder la saisie manuelle des stats avancées en attendant.
