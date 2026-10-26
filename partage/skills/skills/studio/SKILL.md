---
name: studio
description: Point d'entrée obligatoire dans un projet vidéo du studio. À lire en premier pour toute demande (question, retouche, nouvelle vidéo, script, hook, son, contrôle, résultats, V2). Elle dit, d'après l'état du projet, quoi faire et quelles autres skills charger.
---

# Le studio : par où commencer

Tu travailles dans un projet vidéo motion design (TikTok / YouTube Shorts en 9:16, parfois YouTube en 16:9), fabriqué en code.
Les règles permanentes sont dans le `CLAUDE.md` du projet : elles passent avant tout.

## 1. Partir de l'état du projet

Prends la **première ligne** qui correspond, sans regarder les suivantes.

| Situation | Ce que tu fais |
|---|---|
| Ta consigne dit que tu fais partie d'une **équipe** (directeur, constructeur, objets, images, correcteur, polisseur…) | **Ignore ce tableau** : l'aiguillage a déjà été fait. Suis ta consigne, écris tes fichiers, n'attends personne. Charge seulement les skills du domaine dont tu as besoin (§2). |
| Une **question**, un avis, un ressenti sur la vidéo, sans changement précis demandé | Réponds. Regarde des images si besoin (`node .studio/rendre.mjs T…`). **Ne modifie rien.** |
| Une **retouche précise** (une couleur, un texte, un mouvement, un instant) | Fais seulement cette retouche, sur la portée donnée. Charge la skill du domaine si elle existe (tableau du §2). |
| Une demande sur les **chiffres d'une vidéo publiée**, ou « fais la V2 » | Skill `analyser-resultats`. Une version publiée est figée : on prépare la V2, on ne touche pas la V1. |
| Le **script** ou le **hook** à écrire ou à revoir | Skills `ecrire-script` (court) ou `scenario-long` (YouTube long), puis `hook`. Sujet réel : `documentation` avant, `verification-sources` après. |
| Le **titre**, la **couverture**, la **miniature**, la description | Skill `habillage`. |
| Le **son** (voix, bruitages, musique, mix) | Skill `son`. |
| **Vérifier** la vidéo ou une plage | Skill `controle-qualite`. |
| Une **nouvelle vidéo** dans un projet vide (pas de sections dans `project.json`) | Ne construis pas d'un coup. Propose d'abord le plan dans la discussion (voir §3) et attends la réponse de Noam. |
| Le projet a déjà des sections (`project.json` → `plans`) | Reprends depuis les fichiers : `storyboard.md`, `constantes.md`, les scènes. Ne refais pas ce qui existe. |

Si tu ne sais pas laquelle choisir, pose **une seule** question, courte.

## 2. Les autres skills

| Skill | Quand |
|---|---|
| `ecrire-script` | sujet, angle, voix off, re-hooks, chute ; contient la chasse aux tournures « IA » |
| `hook` | les 3 premières secondes (texte à l'écran + première image + première phrase) |
| `realiser` | découper la voix en plans : cadrage, mouvement de caméra, mode visuel par plan |
| `moteur-3d` | écrire ou corriger une scène dans le moteur (sections, kit `k`, fonction pure de T) |
| `mouvement` | principes de motion design : timing, courbes, chorégraphie |
| `son` | voix off, bruitages calés sur l'image, musique, mix à −14 LUFS |
| `controle-qualite` | vérifier à froid une plage ou toute la vidéo |
| `analyser-resultats` | lire les statistiques d'une vidéo publiée, proposer la V2 |
| `niches` | niches qui marchent, accroches mot pour mot, structures, idées de sujets |
| `scenario-long` | script d'une vidéo YouTube longue (documentaire, vulgarisation, fiction, essai), chapitres |
| `direction-artistique` | choisir ou régler la DA, palette, typographie, lisibilité sur téléphone |
| `montage` | rythme des coupes, inserts et b-roll, J-cut / L-cut, raccords |
| `documentation` | trouver les faits, la chronologie, les archives et images libres d'un sujet réel |
| `verification-sources` | vérifier chaque affirmation d'un script factuel avant la voix |
| `habillage` | titre, description, hashtags, chapitres, couverture, miniature |

La **direction artistique** du projet n'est pas une skill : c'est le fichier `references/<style>.md` du projet. Respecte-la toujours.

## 3. Une nouvelle vidéo : les points d'arrêt

1. **Le plan, en texte** : commence par « Cette vidéo dit à [public] que [message] », puis un tableau, une ligne par plan : instants · ce qu'on voit · pourquoi (son rôle dans l'histoire). Attends la réponse de Noam.
2. **Les images fixes** (quand on te le demande) : une image par plan, à l'instant clé, avec les vrais textes, les vraies couleurs et la vraie mise en page, sans mouvement. Noam valide la planche.
3. **La construction** habille ces images validées, sans les redessiner.

## 4. Toujours

- **Préserve les changements de Noam.** Si un fichier a changé depuis ta dernière demande, il l'a fait exprès. Ne l'écrase pas, et demande en cas de doute.
- **Vérifie sur des images rendues** avant de répondre. Regarde les PNG.
- **Rien d'inventé.** Un chiffre manquant s'écrit « - ».
- Termine par 2-3 phrases : ce que tu as changé, ce que tu as regardé, ce qui reste douteux.
