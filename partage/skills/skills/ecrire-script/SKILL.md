---
name: ecrire-script
description: "Trouver le sujet et écrire le script (voix off) d'une vidéo TikTok / Shorts : format (énigme, vulgarisation, contre-intuition, récit, démontage…), hook, re-hooks, transitions, voix parlée, émotion, chute. Contient la chasse aux tournures « IA » (references/anti-ia.md). À utiliser pour tout script ou toute réécriture de voix off."
metadata:
  source: "tiktok-motion/.claude/skills/ecrire-script/SKILL.md"
---

> Écrite pour la chaîne Koan : pour un autre compte, garde la méthode et prends le ton du compte.

> Règles des professionnels, avec leurs repères chiffrés : `references/pratiques-pro.md`, `references/pratiques-script-viral.md`. Lis-les avant de travailler ; leurs sources sont dans `references/recherche.md`.

> Les fichiers annexes (`references/pratiques-pro.md`, `references/pratiques-script-viral.md`, `references/recherche.md`, `references/anti-ia.md`, `references/hook.md`, `references/hooks-log.md`, `references/conseil.md`, `references/storytelling-analyses.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.



> **Annexes de ce skill** (dans `references/`, à lire avec leur chemin complet) : `hook.md` (les 3 premières secondes, pas à pas) et `hooks-log.md` (les chiffres réels de chaque hook : à relire avant d'écrire un hook, à compléter 24-48 h après chaque publication) ; `conseil.md` (le Conseil des Padawans : 5 conseillers + relecture croisée + verdict, obligatoire sur chaque nouveau script) ; `anti-ia.md` (la chasse aux tournures IA) ; `pratiques-pro.md`, `pratiques-script-viral.md`, `recherche.md` (règles chiffrées et sources) ; `storytelling-analyses.md` (les 25 vidéos analysées).


# Écrire un script : choisir le bon sujet et écrire une voix off qui se suit toute seule

Ce skill est le condensé de 25 vidéos analysées : des tutos de Kallaway, Andrew Stanton (TED), David Perell, Le Patouneur et Philipp Humm, et les scripts de CroustiJu, EGO, Gnooki, Laganne, Lacrimosophia, TheGreatReview et What a Fail. Les analyses complètes sont dans le Project « motion design » (`claude/storytelling-analyses.md`). Mis à jour le 13 oct. 2026 avec l'analyse des 60 vidéos de Laganne (`claude/analyse-laganne.md`), deux vidéos de Kallaway (la psychologie des hooks, l'algorithme) et les retours de Noam sur le script « Truman ». Mis à jour le 14 oct. 2026 : dans le hook, on peut dire ce qu'on veut (§3).

**Version unique (26 oct. 2026).** C'est la fusion des deux anciennes copies de `storytelling-tiktok`, celle de claude.ai et celle de tiktok-motion. Elle reprend la boucle parfaite et la passe décrochage du 24/10, ainsi que les reprises de `Melvynx/video-agent-skills` (MIT) : le sujet prouvé, la taille de la porte, la note du hook, les déclencheurs et les trous `{{à remplir}}`, détaillés dans `references/pratiques-script-viral.md`. Elle remplace les deux copies.

**Pour quel compte.** Le skill a été écrit et validé sur la chaîne Koan, et ses exemples en viennent. Pour un autre compte (Automobile…), garde la méthode, et prends le ton, la voix, la durée et la DA de ce compte (la DA du projet, `references/<style>.md`, et les réglages du projet passent avant).

**Qui fait quoi :**

| Rôle | Dans le studio | Hors du studio |
|---|---|---|
| **ce qu'on dit** : le sujet, le format, la voix off | `ecrire-script` (ce skill) | `ecrire-script` (ce skill) |
| **le hook** : méthode pas à pas, chiffres réels, journal | `hook` | `references/hook.md` + `references/hooks-log.md` (ce skill) |
| **ce qu'on voit** : le découpage plan par plan | `realiser`, `direction-artistique` | `realiser`, `direction-artistique` (DA du projet dans `_styles/`) |
| **la fabrication** de la vidéo en code | `moteur-3d` | `fabriquer` |
| **la voix** : génération Gemini et nettoyage | bouton Voix / Nettoyer | `son` |
| la relecture de chaque nouveau script | relecteur de l'équipe | `references/conseil.md` (Conseil des Padawans, ce skill) |

**Le compte Koan :** une chaîne TikTok en français, sans face cam, en voix off (Gemini TTS, voix Velvet Anchor 3), avec la DA `da-koan`. Public de 25-35 ans.

**La ligne de la chaîne :** de la vulgarisation qui change ce que tu crois, souvent accrochée à l'actualité. « L'étude qui contredit ce que tu crois de toi » est un angle fort, mais pas le seul : on peut aussi expliquer comment marche un truc (les bulles de filtre, l'IA, un algorithme), raconter une histoire vraie, démonter une idée reçue, ou se servir d'un film pour expliquer un concept (§14).

Chaque vidéo doit :
- retenir plus d'une minute ;
- apprendre une chose vraie et sourcée ;
- donner envie de commenter.

**Le format énigme est un outil, pas une obligation** : on le choisit seulement quand le sujet s'y prête (§0 bis).

**Le défaut n°1 à éviter, celui qui a fait rejeter la v2 du script « feu rouge » :** une voix off « robotique », faite de phrases-faits collées les unes aux autres, sans liaison, où l'on ne suit pas. Tout ce skill sert à l'éviter.

---

## 0. Trouver et valider un sujet (avant d'écrire une seule ligne)

**Où chercher : la méthode en entonnoir** (Le Patouneur). On part de l'actu ou d'une question du quotidien, on remonte à l'étude qui est derrière, puis on demande qui l'a financée, qui la contredit et ce qu'elle dit vraiment. On s'arrête quand chaque nouvelle source ne t'apprend plus rien : c'est le signe que tu as fait le tour.

**Les 7 critères d'un bon sujet.** Un sujet qui en coche moins de 5 ne mérite pas une journée de production.
1. **Un écart petit/énorme** (EGO) : un objet, un geste ou un chiffre banal qui cache un enjeu énorme. « Ça n'a l'air de rien, et pourtant… »
2. **Un dilemme entre deux valeurs légitimes** (Richard Powers) : sécurité contre liberté, loyauté contre honnêteté, égalité contre mérite. « Mets quelqu'un dans une situation où il ne peut pas avoir les deux : c'est 10 000 histoires. » On ne dit pas qui a raison, le spectateur choisit son camp. C'est le moteur des commentaires.
3. **Il touche au spectateur lui-même**, pas seulement au monde. Le sujet de surface (l'actu, un jeu, un fait divers) est un prétexte : la vraie question, c'est ce que ça révèle de toi (EGO).
4. **Il peut monter de niveau** (Powers, les 3 niveaux de drame) : toi contre toi (un biais), puis toi contre les autres (la société), puis toi contre le système (politique, IA, géopolitique). Les meilleurs sujets passent d'un niveau à l'autre en 60 s.
5. **Un angle rare** (Kallaway) : sur la même actu, prends l'angle que personne ne prend. Tout le monde parlait de la tenue de Taylor Swift au Super Bowl ; l'angle « ce qu'elle rapporte à la NFL » a fait 1 M de vues. Pour le compte, l'angle rare, c'est presque toujours l'étude que les médias ne citent pas.
6. **C'est neuf** : si tu ne fais que résumer ce que tout le monde sait déjà, retourne chercher (Kallaway : « est-ce que je dis du nouveau ? »).
7. **Il y a une étude solide, avec un résultat contre-intuitif mais logique après coup** (§5). Pas d'étude nommable, pas de vidéo. Méfie-toi des effets célèbres mais mal répliqués : vérifie, et dis-le si c'est discuté.

**Deux tests rapides avant de valider :**
- **« Et si je m'en foutais ? »** (Patouneur) : est-ce que quelqu'un que ta niche n'intéresse pas cliquerait quand même ? Trop précis, c'est trop niche. Trop vague, ça ne dit rien.
- **La phrase-promesse en une ligne** (§1) : si tu n'arrives pas à écrire « Tu crois A. L'étude montre B. Et ça veut dire C pour toi. », le sujet n'est pas encore prêt.

**Le sujet est-il prouvé ?** Le sujet pèse plus que l'écriture. Une même chaîne peut passer de ×1 à ×100 de sa médiane sur le seul choix du sujet (à tester).
- Une forme de sujet qui a fait **×3 ou plus de la médiane de son compte**, sur 3 vidéos et au moins 2 comptes, c'est une **recette**. Une seule vidéo, c'est un **pari**. On écrit d'abord sur une recette.
- Un concept qui a fait ×3 sur la chaîne revient dans les 2 semaines, avec un nouvel angle.
- Le ×n se calcule à partir des vues de chaque vidéo du compte : il ne s'estime jamais. Sans ces données, on écrit `×-` et « pari ».
- On note la ligne `concept : <nom> (preuve : <vidéo>, ×<n>, recette ou pari)`.
- Détail et sources : `references/pratiques-script-viral.md` §1.

**La taille de la porte.** Écris 3 ouvertures et note chacune :
- **S** : seuls les gens déjà dans le sujet s'arrêtent ;
- **M** : les intérêts proches ;
- **L** : presque tout le monde (un nom connu, un débat, une scène vécue).

Garde la plus large qui remplit deux conditions : elle arrive au vrai sujet en moins de 15 s, et elle attire des gens qui pourraient aimer la chaîne. C'est la version notée du test « Et si je m'en foutais ? ».

**Pas le même sujet en moins de 4 semaines**, sauf avec un nouvel angle. Avant de choisir, regarde les vidéos déjà faites et publiées.

**Le personnage.** Une bonne histoire suit **une seule personne face à un seul obstacle** (EGO avec Kasparov contre la machine) : un chercheur qui se pose une question, un cobaye dans une expérience, ou le spectateur lui-même. Elle doit avoir un désir clair (Stanton parle de « colonne vertébrale ») et quelque chose à perdre. Sans personnage, on obtient un exposé.

**Ce qui fait qu'on s'en souvient** (la vidéo sur EGO, Stanton) :
- Les vidéos qui ne provoquent que des émotions simples (rire, petite peur) s'oublient le lendemain. Vise une émotion plus complexe à la fin : du vertige, de la gêne, un « et moi alors ? ».
- « Fais-moi m'en soucier » (Stanton) : sans enjeu pour le spectateur, rien ne tient.
- L'émotion fait changer d'avis, l'argument non (Powers) : un chiffre seul est compris, une scène fait bouger.
- La fin doit marcher pour quelqu'un qui n'est pas de la niche : est-ce que tu l'enverrais à un pote qui n'y connaît rien ?

**Ta personnalité sans visage** (Kallaway, TheGreatReview). Un compte sans face cam se fait aimer de deux façons :
- **Résoudre un vrai problème**, encore et encore, avec une valeur non évidente.
- **Assumer tes erreurs en direct** : « j'étais sûr que… », « ma première idée n'allait pas assez loin », « je me suis fait avoir ». Le spectateur suit un raisonnement vivant, pas un cours.

---

## 0 bis. Choisir le format (avant d'écrire)

Le format dépend du sujet, pas l'inverse. On choisit celui qui fait le mieux comprendre et ressentir. Varier les formats d'une vidéo à l'autre évite la lassitude.

| Format | Quand le choisir | Structure | Participation (optionnelle) |
|---|---|---|---|
| **Énigme** | quand il y a une règle cachée à deviner à partir de 2-3 exemples (« pourquoi l'une a gagné et pas l'autre ? ») | voir « Le format énigme » §3 | le spectateur cherche et commente avant la réponse |
| **Vulgarisation : « comment ça marche »** | un mécanisme à expliquer (bulles de filtre, recommandation, IA, mémoire, inflation) | 1) une scène du quotidien où le mécanisme agit sur toi ; 2) la question « pourquoi / comment » ; 3) le mécanisme en 3 étapes max, chacune avec une image ou une analogie ; 4) la conséquence inattendue ; 5) ce que tu peux en faire, ou la question qui reste | « réponds dans ta tête », « regarde ton fil juste après » |
| **Film → concept** (méthode Laganne, §14) | un film ou une série connue rend visible un concept psy, socio ou philo | hook sur la scène culte → la phrase que tout le monde dit → l'étude → le film comme preuve → le retournement → la boucle | « team X ou team Y ? » |
| **Contre-intuition** (l'angle historique de la chaîne) | une étude dont le résultat contredit ce que tout le monde croit | croyance → étude racontée → résultat → retournement → ce que ça dit de toi | faire prédire une fois |
| **Récit** | une histoire vraie avec un personnage et un tournant (un chercheur, une affaire, un événement) | personnage + désir → obstacle → tournant → ce qu'on en apprend | aucune obligatoire |
| **Démontage** | une idée reçue ou un chiffre qui circule (« on n'utilise que 10 % du cerveau ») | l'idée reçue → d'où elle vient → ce que disent les sources → pourquoi elle survit | « tu le croyais aussi ? » |
| **Deux camps** | un débat de société où chaque camp a un argument légitime | camp A (meilleur argument) → camp B (meilleur argument) → ce que montrent les données → ce qui reste ouvert | « t'es de quel côté ? » |

**Règles :**
- Une vidéo = un seul format principal. On peut emprunter un petit morceau d'un autre format, par exemple une prédiction rapide dans une vulgarisation.
- Faire participer est un **bonus**, pas une obligation. Ce qui est obligatoire : apprendre quelque chose de vrai, et que ça se suive tout seul.
- Le critère n°7 du §0 (une étude solide) s'applique à la contre-intuition et à l'énigme. Pour la vulgarisation, le récit et le démontage, il faut **des sources solides** (étude, rapport, article de référence, doc officielle), pas forcément une seule étude contre-intuitive.
- **Pas de grille plaquée** (« 3 barreaux », « 3 parties ») si le sujet n'en a pas besoin. Noam : « pas obligé d'avoir trois trucs pour dire trois trucs ».
- Le format choisi est noté en tête du script.

---

## 0 ter. Ce qui fait marcher une vidéo Koan (les données de Noam)

Noam l'a vu sur ses propres vidéos : ce qui décide de tout, ce sont **deux choses**.
1. **Le watch time** : combien de temps les gens regardent en moyenne, et combien de pourcent vont jusqu'au bout.
2. **Les commentaires où les gens débattent du sujet.** Ses vidéos qui ont marché sont celles où le public s'est disputé : la F1 (« le plus grand vol de l'histoire », les uns pour Verstappen, les autres pour Hamilton), le méchant (« non, le meilleur méchant c'est lui »).

**Ce que dit l'algorithme** (Kallaway, à partir des propos du patron d'Instagram) : la vidéo est d'abord montrée à un petit groupe test d'environ 200 personnes. S'il regarde et réagit, elle passe à 2 000, puis 20 000, etc. Tout se joue donc sur ce premier groupe. Pour aller loin :
- **Un sujet large**, qui parle à beaucoup de monde dans la catégorie de la chaîne.
- **Des noms propres connus** (un film, une marque, une personne) : ils compressent plein de sens en un mot (« la version robot de l'UFC »).
- **Un angle neuf** sur un truc connu.
- **Une prise de position nette qui coupe les gens en deux camps**, pour ou contre, sans milieu. C'est le meilleur moteur de commentaires. On allume l'étincelle, on ne fabrique pas de haine gratuite.

**La règle qui en découle pour chaque sujet :** trouve **la phrase que tout le monde a déjà dite ou entendue**, et sur laquelle on peut être pour ou contre. Exemple Truman : « S'il avait vraiment voulu partir, il serait parti. » La vidéo y répond avec une étude, mais laisse les deux camps exister. Le commentaire épinglé lance le match : « Team Christof ou team Truman ? Au bout d'un moment, rester, c'est un choix ou pas ? »

---

## 1. L'ordre d'écriture (ne pas commencer par le hook)

1. **L'angle, en une phrase-promesse.** Ce que tu crois (A), ce que l'étude montre (B), et pourquoi ça te concerne. L'angle fixe les limites : toute info qui ne le sert pas sort du script, même si elle est passionnante (Patouneur ne garde que 30-50 % de ses recherches). Le hook doit rester sur le sujet promis (pas d'appât suivi d'un autre sujet). Il peut exagérer ou lancer une fausse piste (§3), à condition que la vidéo rétablisse la vérité juste après.
2. **La chute, en premier** (Stanton, Kallaway, Patouneur). Écris la dernière phrase : elle doit pouvoir se partager seule, et elle doit **renvoyer au hook** pour créer la boucle de replay.
3. **Le plan en chaîne de causes et conséquences.** Une phrase par idée, avec la liaison déjà écrite entre chaque idée (§4). Si tu ne trouves pas de liaison, c'est que l'idée est mal placée ou inutile.
4. **Les blocs, avec la théorie des paragraphes** (§4).
5. **Le hook, en dernier.** C'est seulement à ce stade que tu sais exactement quoi promettre.
6. **La passe « voix »** (§7 et §8) : réécrire comme on le dirait à un pote, chasser les tournures écrites ou « IA », puis lire à voix haute.
7. **La passe « émotion »** (§9) : vérifier qu'on ressent quelque chose, et à quel moment précis.
8. **La passe « écran »** (§7 bis) : tout ce que l'image montre, la voix ne le décrit pas.
8 bis. **La passe « décrochage »** (§10 ter, demande de Noam) : on relit le script seconde par seconde en se demandant où un spectateur swipe, et pourquoi. On la rend à Noam sous forme de tableau.
9. **La checklist** (§12). On recommence tant qu'un point coince : un script se frotte en plusieurs passes, comme une tache sur une casserole.

---

## 2. La structure d'un script de 60 à 90 s (environ 160-230 mots)

Le tableau ci-dessous est la structure **par défaut** (contre-intuition / énigme). Pour les autres formats, on garde la même logique (hook, enjeux, re-hooks toutes les 10-15 s, retournement ou révélation, chute qui renvoie au hook) et on suit la structure propre au format (§0 bis).

**La durée est souple** : Noam préfère un script clair, naturel et bien lié à un script court. Viser 60-90 s, mais aller jusqu'à 2 min si chaque phrase sert (contexte, ponts, figures). Quand il fixe une limite (par exemple 1 min 15 max), elle est ferme. On coupe ce qui ne sert pas, jamais un pont ni un contexte.

**Mesure de la voix (Velvet Anchor 3, oct. 2026) :** brute, elle fait environ **3,3 mots par seconde** avec ses blancs (339 mots = 1 min 42). Une fois les silences ramenés à 120 ms (skill `son`), on monte à environ **5 mots par seconde** (339 mots = 1 min 08). Donc, pour une vidéo de 1 min 15 maximum, on peut écrire **jusqu'à environ 340 mots**, à condition de serrer les silences. Voix Enzo (Automobile) : environ **4,4 mots par seconde**. On ne devine pas la durée : on mesure le fichier.

| Temps | Bloc | Ce qui se passe |
|---|---|---|
| 0-3 s | **Hook** | Une scène à la 2e personne, ou une croyance que le spectateur partage, plus un contraste. Le sujet est clair en 2 s, à la voix ET à l'écran. |
| 3-10 s | **Enjeux + grande question** | Pourquoi ça le concerne lui, maintenant. On donne juste assez d'indices pour qu'il **parie** sur la réponse. |
| ~10 s | **Re-hook 1** | « Sauf que… » : la croyance se fissure. |
| 10-30 s | **L'étude racontée comme une scène** | Qui, où, ce qu'on leur a fait, le résultat (§5). Si possible, on fait **prédire** au spectateur avant de révéler. |
| ~30 s | **Re-hook 2, la fausse résolution** | « Donc maintenant que tu le sais, tu ne te feras plus avoir ? Eh bien… » |
| 30-50 s | **Le retournement (head fake)** | La réponse contredit ce qu'il avait prédit, mais elle reste logique après coup. C'est ici qu'on place **le seul silence** de la vidéo. |
| ~50 s | **Re-hook 3 : ça te concerne** | Ce que ça dit de lui, de ses proches, de l'actu. |
| 50-75 s | **La nuance honnête et le pont vers l'actu** | La limite de l'étude en une phrase, et le camp adverse qui a aussi un point. |
| fin | **La chute en boucle** | Une phrase-slogan ou une question qui divise, placée avant l'accélération finale, puis la dernière ligne qui s'enchaîne sur le hook (la boucle parfaite, §10 bis). |

- **Une seule idée principale, au plus deux idées secondaires et une étude principale.** En 60-90 s, trois études, c'est une liste.
- **La valeur doit monter.** Mets le 2e meilleur fait en premier et le meilleur ensuite, jamais le plus faible à la fin (Kallaway, l'ordre des pistes d'un album).
- **L'énergie suit une courbe en dents de scie**, pas une pente qui descend : un problème, une complication, « mais ça crée un 2e problème », puis l'explosion à la fin (EGO).
- **L'arc moderne** (Kallaway, 26/10) : pas de courbe classique qui monte lentement vers un climax au milieu. On **démarre à 70 sur 100** (contexte et tension dès la 1re phrase), on monte à 90 avant 10-15 s (1er pic : contraste, chiffre choc, preuve), puis on enchaîne de **petits pics**, chacun suivi d'une courte détente. Le climax n'est pas au milieu : il est découpé en pics tout le long.

**L'échelle du conteur** (Kallaway, 26/10), pour situer un script en une ligne :
1. **Reporter** : les faits, dans l'ordre (« ceci, puis ceci »). À quitter tout de suite (c'est le « et puis » du §4).
2. **Magicien** : + des hooks, c'est-à-dire des fausses pistes : on penche le spectateur d'un côté, puis on le ramène de l'autre.
3. **Voyant** : + l'enjeu (un usage, un problème, un désir) qui le relie personnellement à l'histoire.
4. **Architecte** : + des vagues de tension et des **boucles** (petites questions ouvertes puis fermées, surtout en vulgarisation).
5. **Maestro** : + la signature de la chaîne, ce qui fait qu'on reconnaît la vidéo sans voir le nom (pour le compte auto : le décodeur façon « Invisible », la 3D qui se fige en 2D).
Un script livré doit être au moins au niveau 4.

---

## 3. Le hook

> **Pour écrire et choisir le hook, utiliser `references/hook.md`** (skill `hook` dans le studio) : méthode pas à pas, chiffres réels de Noam, journal `hooks-log.md`. **Le journal l'emporte sur les règles générales.** Ce qui suit reste la base.

**La note sur 10**, en plus des 4 S plus bas. Cinq points, chacun noté de 0 à 2 :
- **précis** ;
- **tension** ;
- **spectateur** : il se voit dedans grâce au « tu », ou il se projette dans un nom propre ou une scène qu'il connaît ;
- **rapide** : 12 mots ou moins, le sujet dans les 5 premiers ;
- **tenu** : la vidéo paie la promesse, ou corrige l'exagération dans les 15 s.

On garde 7 ou plus, et on écrit `hook 8/10` avec le point le plus faible. Grille complète : `references/pratiques-script-viral.md` §3.

**Les règles :**
- **Le sujet est clair en 2 secondes.** Sans visage à l'écran, ce sont les mots et le texte affiché qui portent tout. Interdits : « tu vas pas y croire », « un truc de fou » et tout teaser vide.
- **Un hook tient en 2 lignes : la clarté, puis le contraste.** Le contraste, c'est la distance entre ce qu'il croit (A) et l'alternative (B). Énonce A pour mieux le casser. Si A est évident pour tout le monde, dis seulement B.
- **« Tu », jamais « je »** dans le hook : « Si tu… » le concerne directement. Exception : un nom propre fort (« Trente ans. C'est le temps qu'il a fallu à Truman… »). Pas de « ce mec » quand on peut dire le nom.
- **Des mots simples et la voix active.** Relis le hook isolé du reste : s'il peut se comprendre de deux façons, réécris-le.
- **Dans le hook, on peut dire ce qu'on veut pour retenir le spectateur** (règle de Noam, 14 oct. 2026) : exagérer, provoquer, lancer une fausse piste (« à cause de l'erreur d'un stagiaire »). Le hook sert d'abord à faire rester les gens : c'est ce qui fait les vues et le watch time. **Condition : la vidéo rétablit la vérité ensuite**, idéalement dans les 15 premières secondes, et on transforme la correction en re-hook (« Sauf qu'en vrai, c'est pas un stagiaire. C'est pire. »). Tout le reste du script reste exact et sourcé.
- **Enchaîner les re-hooks dès le hook** : une relance toutes les 3-5 s avec des liaisons qui font avancer l'histoire (« mais », « et », « donc », « sauf que », « et le pire »), en mode storytime.
- **Montre pendant que tu dis.** Le visuel des 3 premières secondes doit accrocher l'œil : un objet pixel fort au centre (voir la DA du projet, skill `direction-artistique`).
- **Test « et si je m'en foutais ? »** : écris-le pour quelqu'un que ta niche n'intéresse pas.

**8 formules qui marchent (avec un exemple pour la niche) :**
1. **La scène en « tu », au présent** (Gnooki, la référence) : « Il est 3 h du matin, t'es en voiture, y'a personne… et le feu passe au rouge. Tu passes ? »
2. **La croyance, puis « sauf que non »** (CroustiJu) : « Tout le monde pense que plus on est intelligent, plus on change d'avis. Sauf que non. C'est même l'inverse. »
3. **Le mini-jeu ou le pari** (CroustiJu, Gnooki ; pas obligatoire, voir §0 bis) : « Deux candidats. L'un est parfait, l'autre renverse son café. Choisis… Je parie que tu t'es planté. »
4. **L'exclusion des 3 explications évidentes** (vidéo sur EGO) : « Tu crois que c'est la flemme, ton éducation ou ton téléphone. Ce n'est rien de tout ça. »
5. **Le paradoxe d'un personnage** (Laganne) : « Un type sait qu'il blesse ses proches. Il pleure, il s'excuse. Et il recommence. »
6. **La contrainte paradoxale** (Patouneur) : « Quatre phrases. C'est tout ce qu'il a fallu pour que 21 000 conducteurs changent d'avis sur la police. »
7. **Le chiffre qui dérange, avec sa conséquence** : « 26 % de rappels en moins. Juste à cause d'une photo. »
8. **Le faux sujet, ou leurre** (EGO) : on promet un sujet (l'actu) et on livre la couche du dessous (toi). Attention : le vrai sujet doit rester en lien avec la promesse.

### La méthode Kallaway (la théorie de l'interruption)

Celui qui scrolle est en pilote automatique. Le hook doit provoquer un réflexe d'orientation, le « attends, c'était quoi ça ? », pour qu'il s'arrête une seconde. Pour ça, le hook répond tout de suite à **deux questions** : **de quoi ça parle ?** et **qu'est-ce que je gagne à rester ?**

**Les 4 ingrédients (les « 4 S ») :** s'il en manque un, le hook ne marche pas.
1. **Sujet** : une personne, un objet, un lieu, un nom propre, compris tout de suite.
2. **Enjeu** (stakes) : une raison de s'en soucier (une injustice, un mystère, un truc qui le concerne).
3. **Vitesse** : le moins de mots possible. C'est de la compression, pas un débit plus rapide. 8 mots se retiennent, 28 non.
4. **Super clair** : une seule façon de comprendre. Pas de jeu de mots, pas de mise en place floue. Une demi-seconde de doute, et le pouce repart.

**Le triple hook, aligné :** le **texte à l'écran**, l'**image** et la **voix** disent la même chose. Si on regarde l'image seule, on doit deviner à peu près le texte, et inversement. C'est l'erreur la plus fréquente.
- **Le texte à l'écran est le plus important** (l'œil le lit avant de comprendre l'image) : 2 lignes maximum, la coupure de ligne suit la phrase (« 30 ANS / POUR UNE PORTE »), pas de ponctuation sauf guillemets ou parenthèses, pas de mots de liaison (et, mais, donc). Un nom propre + une douleur, un désir ou un changement. Des chiffres précis. Il reste **environ 3 s** à l'écran, en haut ou au tiers supérieur.
- **Les mots forts** (power words) : des groupes de 1 à 3 mots qui amplifient l'enjeu (« scientifiquement impossible à ignorer »). On les remixe, on ne les copie pas.
- **L'image** : du mouvement, de la couleur, du contraste, au service du texte et de la voix. Pas de gadget.

**La zone de verrouillage (les 5 à 10 s après le hook).** C'est elle qui fait rester. Il s'y passe deux choses :
1. **Confirmer la promesse du hook** tout de suite : pas d'appât suivi d'un autre sujet.
2. **Donner une preuve** très tôt (une étude, un cas réel, une citation sourcée) pour qu'il fasse confiance au narrateur. Exemple Truman : « Sauf qu'en 1967, des chercheurs ont testé exactement ça. » arrive avant 15 s.

**Le hook validé pour Truman (13 oct.)** : à l'écran, la scène culte en pixel (ciel bleu, nuages peints, l'escalier, la porte dans le ciel), texte « 30 ANS / POUR UNE PORTE ». Voix : « Trente ans. C'est le temps qu'il a fallu à Truman pour passer cette porte. Et pourtant, elle était là depuis le début. » Nom propre + chiffre + paradoxe visuel. Rejetés avant : « Le type qui a enfermé Truman avait une excuse » (trop indirect), « Ce chien peut sortir… » (le sujet affiché était un chien, pas Truman), « Ce mec » au lieu du nom.

### Le format énigme (le jeu de bar de Noam)

Un des formats de la chaîne, à utiliser quand le sujet s'y prête (§0 bis), pas à chaque vidéo. Le principe : comme au jeu où il faut deviner la règle cachée (« pas de mot avec un i ou un o »), le spectateur cherche, et le narrateur ne fait que guider. On prend parti sans prendre parti : on donne les éléments des deux camps, et c'est lui qui trouve.

1. **Annonce le jeu clairement, à l'oral** : « On va faire un jeu. Deux manifs : une a gagné, l'autre a perdu. Toi, tu dois trouver pourquoi. » On dit **ce qu'il faut trouver**, en mots simples. Jamais « trouve la règle » sans avoir dit la règle de quoi.
2. **2 ou 3 exemples, chacun avec son contexte AVANT son résultat** : qui, ce qu'ils veulent, ce qui se passe, puis le résultat. Si on apprend après coup pourquoi ils marchaient, on est perdu.
2 bis. **L'énigme doit pouvoir se chercher pour de vrai.** La réponse évidente (« la violence ») doit être présente dans **les deux** exemples, sinon il n'y a rien à chercher. Aucun adjectif ne doit trahir la réponse avant la question (« calmes », « la colère explose »). On peut ajouter un faux suspect plausible (l'époque, le leader, la taille de la manif).
3. **Un verdict net à la fin de chaque exemple** (« Gagné. » / « Perdu. »), après une phrase complète qui dit le résultat en clair.
4. **L'appel à commenter AVANT la réponse, en phrase complète** : « Alors, pourquoi l'une a gagné et pas l'autre ? Écris ta réponse en commentaire, avant que je te la donne. » Les gens commentent sans quitter la vidéo.
5. **Le « presque »** : on reprend la réponse la plus probable et on dit « presque », comme le « non… presque » au bar. Puis on montre le détail qu'il a raté dans l'exemple 1. C'est le head fake.
6. **La règle trouvée ne donne raison à aucun camp** : elle s'applique aux deux (aux manifestants ET à la police). C'est ce qui permet de faire réfléchir sans faire la leçon.
7. **On ramène la règle dans l'actu**, avec une transition : « Et cette règle, elle se joue en France en ce moment. »

---

## 4. Le moteur : la liaison entre les idées (le plus important)

**Règle n°1, celle de Parker et Stone (South Park), reprise par Kallaway :** entre deux idées, jamais « et puis ». Toujours **« donc »** (une conséquence) ou **« mais / sauf que »** (une complication).
- Test : écris la liaison dans la marge, à côté de chaque phrase.
- Si tu peux inverser deux phrases sans que ça casse, c'est une liste : réécris-la.

**Règle n°2, la théorie des paragraphes (Patouneur) :** chaque bloc suit le même schéma.
- On énonce l'idée.
- On la prouve (une scène, un chiffre).
- La dernière phrase **ouvre déjà le bloc suivant** (« Mais cette croissance n'est pas sans risque »).
- Aucun bloc ne finit sur une conclusion fermée, sauf le dernier.

**Règle n°3, la boucle d'addiction (Kallaway, sur la neuroscience de la dopamine) :**
- **Les enjeux** : qui, ce qu'il risque, pourquoi maintenant.
- **La grande question** : assez précise pour qu'on puisse parier.
- **Le head fake** : une surprise qui reste logique. Plante l'indice avant.
- **Le re-hook** : la boucle se ferme et une autre s'ouvre **dans la même phrase**. Jamais de blanc entre les deux.
- Le pic de dopamine se situe *juste avant* la réponse, pas après.

**Règle n°4 : chaque idée naît de la limite de la précédente** (EGO, TheGreatReview). Le schéma : un fait, puis « c'est bien, mais ça n'explique pas… », puis une question courte, puis une réponse courte.

**Règle n°5 : aucune nouvelle personne, aucun nouveau lieu sans pont.** Un chercheur, un pays ou l'actu n'arrivent jamais « comme ça ». On les amène par la question qu'ils résolvent : « Mais est-ce que les émeutes ont vraiment fait élire Nixon ? C'est ce qu'un chercheur de Princeton a voulu vérifier. » · « Et si tu crois que c'est une vieille histoire américaine, regarde la France cette semaine. » Un nom jamais présenté (« Seligman corrige sa théorie ») devient « un des deux chercheurs ».

**Règle n°6 : chaque « ça », « la règle », « ils » renvoie à quelque chose de déjà dit clairement.** À l'oral, on ne peut pas revenir en arrière : si le spectateur doit deviner de quoi tu parles, il décroche. Pareil pour un objet d'une expérience : on dit ce que c'est et ce qu'il fait (« un bouton devant eux, ils appuient dessus avec le museau, et ça s'arrête »), jamais juste « un panneau ».

### La bibliothèque de liaisons (à varier, jamais la même deux fois par script)

- **Complication** : « Sauf que… » · « Mais voilà le problème : » · « Le souci, c'est que… » · « Et c'est là que ça se complique. » · « Ce qui aurait pu s'arrêter là, sauf que… »
- **Conséquence** : « Du coup… » · « Et ça explique pourquoi… » · « Ce qui nous amène à un truc gênant : » · « Et forcément… »
- **Limite → question** : « Bon, c'est bien. Mais c'est pas assez. Alors comment on sait si… ? » · « Ça marche en labo. Mais dans la vraie vie ? »
- **Objection prêtée au spectateur** : « Tu vas me dire : “c'est évident”. Sauf que les chercheurs ne se sont pas arrêtés là. » · « Je te vois venir… » · « Et là, tu te dis sûrement que… Et t'aurais raison. Mais… »
- **Rappel du fil rouge** : « Tu te souviens du feu rouge ? » · « Reprenons notre conducteur. » · « Rappelle-toi l'avocat. »
- **Bilan, puis manque** : « Bon. On sait maintenant que X. Mais ça n'explique toujours pas Y. »
- **Annonce d'un détour** : « Juste avant, pour que t'aies toutes les pièces du puzzle… » · « On quitte deux secondes la police pour aller voir… »
- **Sortie d'explication** : « En gros, … » · « Bref, … »

### Les re-hooks (un toutes les 10 à 15 s)

- « Mais c'est pas le plus fou. »
- « Et le pire, c'est que… »
- « Et c'est là que ça devient bizarre. »
- « Attends, ça devient plus étrange : … » (seulement si c'est un vrai résultat)
- **La fausse résolution** : « Donc maintenant que tu le sais, tu ne te feras plus avoir ? Eh bien… c'est plus compliqué. » C'est le meilleur re-hook du corpus (Gnooki) : à placer vers 40-50 % du script.
- **La réponse cachée** : « Et la réponse se cache derrière un seul chiffre. »
- **L'aveu de manipulation** : « Je t'ai un peu menti au début. » (CroustiJu, What a Fail) : à n'utiliser que si c'est vrai dans le script.
- **La boucle longue** : promettre à 5 s quelque chose qui ne sera payé qu'à la fin (« et dans 40 secondes, tu vas comprendre pourquoi ta réponse te trahit »).

---

## 5. Amener une étude, un chiffre ou un concept

1. **La scène d'abord, le nom ensuite.** Le spectateur vit le biais (il choisit, il prédit), puis on nomme : « Ça a un nom : l'effet de halo. » On ne nomme qu'un seul concept par vidéo.
2. **L'étude en 4 temps au maximum, au présent, racontée :**
   - le contexte en une phrase (« Chicago, 1984. Un chercheur décroche son téléphone. ») ;
   - ce qu'on leur fait ;
   - le résultat ;
   - l'anomalie ou la nuance.
   Le lieu tient en une ligne : le spectateur complète le reste (Philipp Humm).
3. **Faire prédire avant de révéler** : « À ton avis, qui a le mieux noté la police ? » Une fois par vidéo au plus, si le format s'y prête.
4. **Rendre le chiffre sensible** : on le compare à quelque chose de concret ou on en tire une conséquence (« 25 secondes deviennent 97 : à peine une minute de plus »). Les chiffres exacts vont à l'écran, la voix dit l'ordre de grandeur.
5. **Une petite ironie sur le chiffre** rend le moment mémorable (EGO : « 20 % de la puissance de calcul. Tout va bien alors. »).
6. **Toujours nommer la source** (auteur, année, pays). C'est LA différence avec Laganne et Lacrimosophia, qui restent vagues. **On n'invente jamais un chiffre.** Les exemples de ce skill sont des modèles de forme : chaque chiffre se vérifie avant d'être utilisé.
7. **Une condition de validité** : « ça ne marche que si… ». Ça rend le propos crédible et ça nourrit le débat.
8. **La phrase intérieure du spectateur**, la meilleure arme de Laganne : « Tu n'es pas lâche, tu te recentres. Tu n'es pas radin, tu fais attention. » Trois phrases en « tu », et il entend sa propre voix.
9. **Quand un chercheur corrige sa propre théorie** (Seligman en 2016), on l'annonce comme une correction (« Mais le plus fou, c'est qu'en 2016, un des deux chercheurs corrige sa propre théorie »), sinon le spectateur croit qu'on s'est contredit.

---

## 6. Les deux camps et l'honnêteté (le moteur des commentaires)

- **Présente le débat comme deux valeurs légitimes qui s'opposent** (sécurité contre liberté, autorité contre dialogue, responsabilité individuelle contre conditions), pas comme les gentils contre les méchants (Perell).
- **Inclus-toi dans le biais** : « J'ai longtemps cru que… » ou « je me serais fait avoir aussi ». Personne ne se sent jugé, donc personne ne part.
- **Désamorce le camp vexé en une demi-phrase** : « Je dis pas que X a tort. » · « C'est pas totalement vrai, mais c'est pas totalement faux non plus. »
- **Avoue la limite de l'étude** : c'est crédible, et ça ne laisse pas le contradicteur prendre la main en commentaires.
- **La morale arrive après la preuve**, jamais avant. Pas de sermon.
- **La question finale divise vraiment, et elle a une réponse.** Si tu poses une question, donne ton avis ou ta piste (Patouneur déteste le « dis-le en commentaire » vide). Une position un peu tranchée fait plus réagir qu'une fausse neutralité.
- **Le commentaire épinglé « Team X ou team Y ? »** lance le débat sans rallonger la fin de la vidéo.

---

## 7. La voix : parler, pas réciter

- **Écris comme un vocal à un pote**, pas comme un texte. Ce qui compte, c'est que ce soit dit à voix haute, pas lu. Lis chaque phrase à voix haute : si tu butes, réécris.
- **Le rythme en dents de scie** : alterne phrases courtes, moyennes et longues (Gary Provost). Test : une phrase par ligne. Si le bord droit fait des dents de scie, c'est bon ; si toutes les lignes s'arrêtent au même endroit, c'est monotone.
- **Les phrases-chocs font 2 à 4 mots** (« Il encaisse. » « Sauf que non. »). Les phrases longues servent à raconter.
- **Des marqueurs oraux dosés** (2 ou 3 par script) : « Bon, » · « En gros, » · « Du coup, » · « Honnêtement, » · « Et là, » · « Genre » · « Bref, ». Plus un ou deux mots familiers (« galère », « relou », « choper »).
- **Le « tu » partout.** Le « je » sert seulement aux aveux et aux opinions : c'est ce qui donne une personnalité à un compte sans visage.
- **Des mots précis plutôt que vagues** : « barrage » plutôt que « contrôle », « choper » plutôt qu'« avoir ». Pas de « chose », pas de « truc » (sauf effet oral voulu).
- **Pas de phrase qui fait buter** (« ce qui s'apprend, c'est que ce que tu fais, ça change quelque chose ») : deux « que » d'affilée, on réécrit (« Ce qu'on apprend, c'est l'inverse. Qu'agir, ça marche. »).
- **Interdits :**
  - les phrases-titres sans verbe enchaînées (« Chicago. 1984. 1 575 habitants. ») ;
  - les listes de chiffres ;
  - le jargon dans la bouche du spectateur ;
  - « premièrement / deuxièmement » ;
  - les tournures écrites comme « en effet », « ainsi », « par conséquent ».
- **Pour l'enregistrement** (Patouneur) :
  - parle plus fort et articule plus que d'habitude, et sur-joue un peu l'émotion : on ne te voit pas ;
  - la phrase descend vers le point final ;
  - ne garde jamais la même intonation deux phrases de suite ;
  - pas plus de 0,2 s de blanc entre deux phrases, sauf pour **le** silence volontaire (avec le TTS, c'est le nettoyage du skill `son` qui s'en charge).

### Les figures de style (le phrasé qui reste en tête)

Noam aime les figures de style. Le but n'est pas d'être « poétique » au sens Victor Hugo, mais d'avoir le phrasé d'une punchline de rap ou de stand-up : des mots qui sonnent, qu'on a envie de répéter. Elles servent aux moments clés (hook, retournement, chute), **2 ou 3 par vidéo**, jamais au prix de la clarté, et toujours faciles à dire à voix haute.

| Figure | Ce que c'est | Exemple |
|---|---|---|
| **Allitération** | répéter un son | « Les caméras captent pas les causes. Elles captent les coups. » |
| **Antithèse** | deux idées opposées côte à côte | « La poubelle brûle une nuit. L'image, des années. » |
| **Parallélisme** | deux phrases construites pareil | « On retient pas qui avait raison. On retient qui faisait peur. » |
| **Chiasme** | A-B / B-A | « Tu crois choisir tes idées. Ce sont tes idées qui te choisissent. » |
| **Paronomase** | deux mots qui se ressemblent | hook « ça aide ou ça la **dessert** ? », chute « elle **sert** qui ? » |
| **Antanaclase** | le même mot, deux sens | « C'est pas celui qui frappe fort qui gagne. C'est celui qui frappe les esprits. » |
| **Anaphore** | répéter le début de phrase | « Pas de matraques, pas d'images. Pas d'images, pas de loi. » |
| **Métaphore filée** | une image qui revient du début à la fin | le feu : la poubelle qui brûle, la colère qui explose, l'image qui brûle des années |
| **Gradation** | monter en intensité | « Ils bloquent. Ils crient. Ils brûlent. » |
| **Ellipse** | couper ce qui est évident | « Sans images, pas de loi. » |

**Les phrases qui se citent.** Comme les phrases qu'on voit passer sur TikTok (« Ta mort est plus sûre que ton mariage. Alors au lieu de chercher ton âme sœur, cherche ton âme. »), une vidéo gagne à avoir **une ou deux phrases qu'on pourrait recopier en commentaire**. La recette : une antithèse ou un parallélisme, puis un petit twist sur un mot. On les place **juste après le retournement** ou **à la chute**, sans les annoncer comme des citations : elles doivent tomber naturellement dans le fil.

### 7 bis. Montrer plutôt que dire (la voix et l'écran se partagent le travail)

- **Ce que l'image montre, la voix ne le décrit pas.** On montre une poubelle qui brûle, et la voix dit juste : « Ça, est-ce que ça aide une cause… ou ça la dessert ? » Une phrase qui décrit l'image sonne littéraire.
- **Les dates, les lieux et les chiffres exacts vont à l'écran** (« Selma, Alabama, 1965 », « 413 lycées perturbés »). La voix garde le sens : « Trois ans après », « des centaines ».
- **Pour gagner du temps**, un détail peut passer à l'écran sans être dit (l'affiche de l'avion foudroyé en flash pendant la liste des pannes de Truman).
- **Dans le script, chaque bloc indique `[ÉCRAN : …]`** pour qu'on sache ce qui est montré et ce qui est dit.

---

## 8. Ne pas sonner écrit, ni « IA »

Adapté de *Wikipedia : Signs of AI writing* (version d'octobre 2026) et de l'ancien skill humanizer-fr (aujourd'hui `references/anti-ia.md`), appliqué à une voix off. Un spectateur ne sait pas dire pourquoi un texte « sonne IA », mais il le sent en deux phrases et il scrolle.

### Le principe : le flou qui crie fort

Une IA prédit le mot le plus probable. Elle **remplace donc le détail précis (rare) par une formule générique (fréquente), et compense en exagérant l'importance.** Wikipedia le résume ainsi : on crie de plus en plus fort que le portrait montre quelqu'un d'unique, pendant que le portrait lui-même passe d'une photo nette à un croquis flou. Exemple : « l'inventeur du premier attelage de wagon » devient « un titan révolutionnaire de l'industrie ».

**La règle qui en découle :** à chaque phrase, demande-toi « est-ce que ça pourrait s'appliquer à n'importe quel autre sujet ? ». Si oui, remplace par le détail précis, même petit. « 97 secondes » plutôt que « beaucoup plus longtemps ». « Un barrage en Australie, à 2 h du matin » plutôt que « lors de contrôles routiers ».

**Le test de base : est-ce qu'un pote dirait ça, à voix haute, au bar ?** Si tu n'as jamais entendu une phrase dans la bouche de quelqu'un, coupe-la.

### Les 20 tics à chasser

| Tic | Exemple à bannir | Version parlée |
|---|---|---|
| **Le gonflement de l'importance** | « un tournant majeur », « une empreinte indélébile », « profondément ancré », « un paysage en pleine évolution », « qui s'inscrit dans un mouvement plus large », « qui témoigne de » | dis le fait, point : « Il a montré un truc simple. » |
| **L'analyse superficielle en participe présent** | « …les policiers expliquent pourquoi, **renforçant** la confiance et **soulignant** le pouvoir du respect » | « Les policiers expliquent pourquoi. Et du coup, les gens leur font plus confiance. » |
| **Le « ce n'est pas X, c'est Y » à répétition** | « Ce n'est pas la peur. C'est la légitimité. Ce n'est pas une étude. C'est un miroir. » | autorisé **une seule fois** par script, au moment du retournement. |
| **La variante inversée « Y plutôt que X »** | « …en misant sur le dialogue plutôt que sur la sanction » en fin de phrase, à chaque bloc | dis-le franchement, en deux phrases : « Ils n'ont pas sanctionné plus. Ils ont parlé. » |
| **« Non seulement… mais aussi… »** | « non seulement la peur, mais aussi le respect » | une idée par phrase. |
| **La règle de trois systématique** | « écoutés, respectés et compris » à chaque phrase | varie : parfois deux, parfois un seul mot. Garde le trio pour **un** moment fort. |
| **L'évitement du verbe « être » ou « avoir »** | « constitue », « représente », « se présente comme », « fait figure de », « offre », « affiche », « propose » | « c'est », « il y a », « il a » |
| **Les mots raides au lieu des mots simples** | « rédigé », « utilisé » (pour « s'est servi de »), « tenté », « décédé », « relocalisé », « effectuer » | « écrit », « s'est servi », « essayé », « mort », « déménagé », « faire » |
| **Les connecteurs de dissertation** | « De plus », « Par ailleurs », « En outre », « Ainsi », « Néanmoins », « Il convient de noter » | « Et », « Mais », « Du coup », « Sauf que », « Le truc, c'est que » |
| **Le vocabulaire IA** | crucial, essentiel, clé, fascinant, véritable, complexe, enjeu, au cœur de, mettre en lumière, souligner, favoriser, renforcer, plonger dans, un voyage, une riche mosaïque, naviguer, « dans un monde où » | des mots concrets : « bizarre », « gênant », « flippant », « le problème », « en vrai » |
| **Le lien vague** | « lié à », « associé à », « en lien avec », « en relation avec » | dis la relation exacte : « il dirigeait », « il a financé », « il a prouvé » |
| **Les synonymes en cascade** | « le chercheur… le scientifique… l'universitaire… l'expert américain » | répète le même mot, ou dis « il ». À l'oral, la répétition ne choque pas. |
| **La substantivation** | « la mise en place d'une approche de justice procédurale » | des verbes : « quand le flic t'explique pourquoi il t'arrête » |
| **Les attributions floues et gonflées** | « des études montrent », « les experts estiment », « de nombreux chercheurs », alors qu'il n'y a qu'une source | nommer : « Tom Tyler, un chercheur américain, en 1984 ». Une source, c'est une source. |
| **L'insistance sur la notoriété** | « une étude largement relayée par les médias », « publiée dans une revue prestigieuse », « reconnue internationalement » | dis ce que l'étude **a trouvé**, pas à quel point elle est célèbre. |
| **Les précautions de bibliothécaire** | « les informations disponibles ne permettent pas d'affirmer… », « à considérer comme… plutôt que comme… », « il est important de noter que » | une nuance franche, à l'oral : « Bon, c'est une seule étude. Mais elle est solide. » |
| **Les questions rhétoriques en rafale** | « Et si tout était faux ? Et si on se trompait ? Et si… ? » | une seule question, puis la réponse. |
| **Les fins vagues ou les résumés** | « En résumé… », « Au final… », « Une chose est sûre… », « À méditer », « L'avenir nous le dira », « Et ça, c'est puissant » | une image précise, ou une question qui pique (§10) |
| **Les phrases trop équilibrées** | « Plus on punit, moins on convainc ; plus on écoute, plus on est obéi. » à chaque bloc | pas à chaque bloc : 2 ou 3 phrases construites (figures de style, §7) aux moments clés, et c'est tout. |
| **Le teaser creux** | « La réponse va te surprendre », « Tu ne vas pas en revenir », « Spoiler : » | donner un indice concret : « La réponse tient en quatre phrases. » |

**Ponctuation et texte à l'écran :**
- **Pas de tiret long (—)**, c'est un des tics les plus connus. On remplace par un point, une virgule ou « … ».
- Les **points de suspension** marquent une vraie respiration de la voix, pas une décoration.
- Des **phrases sans verbe**, une ou deux par script maximum, pour un choc (« Trois h du mat'. Personne. »), jamais en série.
- **À l'écran**, pas de listes « Mot en gras : explication » ni de titres Avec Des Majuscules À Chaque Mot. Un mot-clé, ou une phrase courte.

### Ce qui sonne humain (d'après la même page de Wikipedia)

Les textes écrits par des humains contiennent beaucoup plus souvent :
- **Des tournures simples** : « il y a », « c'est », « il a ».
- **Des mots ordinaires** : « écrit », « mort », « essayé », « s'est servi de ».
- **Des affirmations nettes et des superlatifs assumés** : « c'est le seul », « c'était le premier », « c'est l'étude la plus simple que j'aie vue ».
- **Des petits mots de nuance** : « très », « peut-être », « en général », « a tendance à ».
- **Un mélange de familier et de précis** : Wikipedia note que mélanger un registre décontracté et un registre technique n'est **pas** un signe d'IA. C'est même ta voix : « Le mec a interrogé 1 500 personnes. Et le résultat est clair. »

Et dans une voix off en particulier :
- **Une opinion assumée** : « Honnêtement, ça m'a mis mal à l'aise. »
- **Une auto-correction** : « Enfin, pas exactement. » · « Bon, je simplifie un peu. »
- **Un détail précis, presque inutile, mais vrai** : « 97 secondes. Pas 100. 97. »
- **Un peu d'humour ou d'ironie sèche** : « Tout va bien, alors. » · « Pratique, pour un mec qui vit sur une île. »
- **Des phrases irrégulières** : une longue qui prend son temps, puis une de trois mots.
- **Un aveu** : « J'ai longtemps cru l'inverse. »

**Attention au faux remède :** Wikipedia prévient qu'il ne suffit pas de retirer les tics de surface. Le vrai problème, c'est le contenu générique. Un script sans « crucial » ni tiret long, mais sans détail précis et sans opinion, sonne toujours faux.

---

## 9. Faire ressentir et faire réfléchir (même en 1 minute)

Un fait se comprend en une seconde et s'oublie en une heure. Une émotion reste. Ce qu'on vise, ce n'est pas que le spectateur sache quelque chose de plus : c'est qu'il se **voie** autrement à la fin.

### Choisis UNE émotion cible par vidéo

Avant d'écrire, décide ce qu'il doit ressentir au moment du retournement : **vertige** (« je ne suis pas qui je crois »), **gêne** (« je fais ça aussi »), **malaise** (« on nous manipule »), **indignation** (« c'est injuste »), **soulagement** (« ce n'est pas que moi »), ou **émerveillement** (« c'est fou que ça marche comme ça »). Une seule, sinon aucune ne prend.

### La trajectoire émotionnelle d'une vidéo de 60-90 s

1. **La curiosité** (0-10 s) : une question qu'il ne peut pas laisser sans réponse.
2. **La certitude** (10-20 s) : on le laisse croire qu'il a la réponse. On l'y installe confortablement.
3. **Le doute** (20-35 s) : « sauf que… ». La certitude se fissure.
4. **Le choc** (35-50 s) : le retournement, avec le silence. C'est là qu'on vise l'émotion cible.
5. **Le retour à soi** (50-75 s) : « et toi, dans ta vie, ça donne quoi ? ».
6. **La pensée qui reste** (fin) : une image ou une question qu'il emporte en scrollant.

### 10 techniques pour l'embarquer

1. **Le faire participer avec son corps ou sa mémoire.** « Réponds dans ta tête. » · « Pense à la dernière fois que tu as… » · « Ferme les yeux deux secondes. » Un souvenir personnel déclenche une émotion instantanée : c'est **son** histoire, plus la tienne.
2. **La phrase intérieure** (Laganne) : dis tout haut ce qu'il pense tout bas. « Tu te dis : “moi, je ne suis pas comme ça.” » Il se sent vu, et c'est là qu'on l'a.
3. **Un détail sensoriel au lieu d'une généralité** (Philipp Humm, Powers) : pas « la nuit, sur la route », mais « le clic du clignotant, la rue vide, le rouge qui se reflète sur le pare-brise ». Un seul détail juste suffit à faire exister la scène.
4. **Un humain derrière l'étude.** Pas « les participants », mais « un conducteur, fatigué, qui veut juste rentrer chez lui ». On ne s'émeut pas pour des statistiques, on s'émeut pour quelqu'un.
5. **L'enjeu personnel** (Stanton, « fais-moi m'en soucier ») : relie chaque fait à ce qu'il risque, lui. « Ça veut dire que la prochaine fois qu'un flic t'arrête… »
6. **Donne 2 + 2, pas 4** (Stanton) : pose deux faits, puis laisse un temps. C'est **lui** qui fait le lien, et ce qu'on comprend soi-même, on y croit plus. Une demi-seconde de silence avant la réponse vaut plus qu'une explication.
7. **Le contraste émotionnel** : léger, puis lourd. Une petite blague, puis le fait qui dérange. Le rire baisse la garde, et ce qui vient juste après touche plus fort.
8. **La vulnérabilité du narrateur** : « Moi aussi, je m'arrête au feu rouge. Et j'étais sûr de savoir pourquoi. » Si tu admets être concerné, il accepte de l'être aussi.
9. **Le changement d'échelle** (Powers) : de toi, puis à la société, puis retour à toi. « Toi, au feu rouge… un pays entier face à sa police… et toi, encore, au feu rouge. » C'est ce qui donne de la profondeur sans faire long.
10. **Montrer l'émotion, ne jamais la nommer** : interdit de dire « c'est bouleversant », « c'est fascinant », « c'est triste ». Décris ce qui se passe, et laisse-le ressentir.

### Faire réfléchir sans faire la leçon

- **Déplace une certitude, n'humilie pas.** Tu ne lui dis pas qu'il a tort : tu lui montres qu'il pensait comme tout le monde, toi compris.
- **Une question ouverte qui le concerne vraiment.** Pas « Qu'en pensez-vous ? », mais « Et toi, tu t'arrêtes par peur… ou parce que c'est juste ? ». Elle doit pouvoir le suivre toute la soirée.
- **Laisse un espace.** En 60 s, la tentation est de tout remplir. Une demi-seconde de silence au bon moment fait plus réfléchir que trois phrases d'explication.
- **La morale, jamais.** Une image finale fait le travail mieux qu'une conclusion. « Le feu est toujours rouge. Mais tu sais maintenant pourquoi tu t'arrêtes. »
- **Ne culpabilise pas le personnage piégé** (« il lui manquait pas du courage ») : la phrase-formule doit répondre au jugement du hook, pas en ajouter un.

### Le rythme émotionnel (pour la voix et le montage)

- **On accélère sur les faits**, on **ralentit sur l'émotion** : phrases plus courtes, voix plus basse, un silence.
- **Un seul moment « frisson » par vidéo**, au retournement : le drop de la musique, le noir, la phrase qui claque. Si tout est intense, plus rien ne l'est.
- **Pas de pathos** : une musique triste plus une voix tremblante plus un mot fort, c'est trop. Un seul des trois.

---

## 10. La fin

- **Elle répond au hook**, idéalement en le réutilisant avec un nouveau sens : le même feu rouge, mais la réponse a changé. C'est la boucle de replay.
- **Une phrase-slogan symétrique** qu'on peut citer en commentaire : « Elle peut t'éclairer ou t'aveugler. » · « Occuper la lumière, ou la partager. » · « Tout est explicable, mais pas justifiable. »
- **Une seule métaphore filée** pendant toute la vidéo (l'avocat, la lumière, la recette, le feu rouge). On la reprend 2 ou 3 fois pour lier les blocs, et elle sert à la chute.
- **Pas de « abonne-toi »** : ça casse l'immersion et les tests montrent que ça ne change presque rien. On finit sur une émotion ou une question qui divise.
- **Pas de tire-larmes appuyé.** La fin doit marcher pour quelqu'un qui n'est pas de la niche.

### 10 bis. La boucle parfaite, sans redescente (vidéos de moins de 90 s ; validée sur Truman)

Noam le demande : sur une vidéo courte, le spectateur ne doit **pas sentir la fin**. La dernière phrase s'enchaîne avec la première, et il se dit « attends… ça a redémarré ? ».
- Chaque tour de boucle compte comme une vue de plus, et c'est un des signaux les plus forts pour l'algorithme.
- Les gens regardent jusqu'au bout et relancent sans s'en rendre compte.
- Sur les vidéos longues, on garde seulement la boucle de sens du §10.

**Ça se prépare au script, pas au montage.** On écrit la chute **en même temps que le hook**, comme une seule phrase coupée en deux : la fin de la vidéo est le début de la phrase, et le hook en est la suite.

**Pas de redescente avant :**
- **Pas de morale après le pic.** La phrase-formule (« C'était jamais l'envie qui lui manquait. C'était juste une fois où ça marche. ») remonte **avant** l'accélération finale.
- **La fin est en pleine action**, avec des phrases de plus en plus courtes (« Il prend la mer. Il continue. Son bateau tape dans le ciel. Il monte l'escalier. »).

**Quatre façons de raccorder :**
1. **La phrase coupée (la plus forte).** La dernière réplique s'arrête sur un mot de liaison, et le hook la termine.
   - Fin : « …Et propose-lui la première. Parce qu'à trente ans, tu sais quoi ? » → début : « Un ami proche, c'est à peu près deux cents heures passées ensemble. »
   - Fin : « …et c'est exactement pour ça que » → début : « tu passes au rouge à trois heures du matin. »
2. **La phrase qui finit sur les mots du hook (Truman).**
   - On l'écrit en entier pour le TTS : « Et il ouvre la porte qu'il a cherchée pendant trente ans. »
   - On **coupe les derniers mots au montage**, pour que la vidéo reparte sur « Trente ans. » comme si c'était la suite.
3. **La question qui renvoie au hook.** La dernière phrase pose la question à laquelle le hook répond. Fin : « Alors, combien d'heures il te faut ? » → début : « Un ami proche, c'est deux cents heures. »
4. **L'objet ou le chiffre qui revient.** La fin ramène l'image et le mot exacts du début (le compteur, le feu rouge), sans conclure.

**Règles :**
- **Test obligatoire :** lire à voix haute la dernière phrase **puis** la première, d'une traite. Si ça sonne comme deux phrases séparées, ou s'il faut une pause pour comprendre, réécrire.
- Le hook doit marcher **dans les deux sens** : seul (premier visionnage) et comme suite de la fin (au replay). Il commence donc sans « Alors », sans « Bon », sans contexte qui suppose un avant.
- **Pas de mot de fin** : ni « voilà », ni « bref », ni conclusion fermée, ni « abonne-toi », ni long silence final. La voix s'arrête en pleine énergie, comme au milieu d'une phrase.
- **Le dernier plan est le premier plan** (même cadrage), pour que la boucle soit aussi visuelle.
- Dans le script livré, écrire la ligne **« Boucle : [dernière phrase] → [première phrase] »** juste après la voix off, pour le découpage et le son.

### 10 ter. La passe « décrochage » : où le spectateur quitte la vidéo

Noam l'a demandé le 24/10/2026 : sur chaque script, une passe dédiée, en plus du Conseil.

On estime le temps de chaque phrase avec le débit de la voix (§2). Puis on cherche les moments où quelqu'un swipe :
- **une phrase floue**. On ne comprend pas, on décroche. Exemple : « Et déjà, il lui faut deux places. », sans dire qu'une F1 n'en a qu'une ;
- **une phrase trop longue** : plus de 4 s (≈ 18 mots). Une phrase = un souffle ;
- **un passage sans relance de plus de 15 s**, ou un bloc technique trop dense ;
- **5 s de voix sans rien de nouveau à l'écran** : chaque tranche de 5 s a son `[ÉCRAN : …]` ;
- **un nom ou un mot que le public ne connaît pas**, amené avant la raison de s'y intéresser. On donne le fait fort d'abord, le nom ensuite ;
- **une promesse déjà payée**. Quand la question du hook a sa réponse, il faut une nouvelle boucle ouverte, sinon il part ;
- **la cadence de fin** : un bilan, un résumé, une phrase-slogan, « vingt-six ans… jamais… », « au final », une baisse d'énergie.
  - Dès que le spectateur sent que c'est fini, il swipe avant la boucle et ne finit pas la vidéo.
  - La fin doit tomber **en pleine info**, sur un fait nouveau ou une chute courte, et enchaîner tout de suite sur le hook (§10 bis).
  - Ce qui sonne comme une conclusion se déplace plus tôt dans le script.

On note aussi les **déclencheurs à leur seconde** : `manque 0 s, reconnaissance 2 s, preuve 9 s, rupture 31 s…` La preuve arrive avant 15 s, dans la zone de verrouillage (§3). Liste complète : `references/pratiques-script-viral.md` §4.

Le rendu : un tableau « temps · phrase · risque · pourquoi · correction », puis la version corrigée.

---

## 11. Ce qui a raté dans la v2 du « feu rouge » (pour ne pas recommencer)

| Raté | Pourquoi | Correction |
|---|---|---|
| « Chicago. Tom Tyler interroge 1 575 habitants, puis il en rappelle 804… » | une liste de faits, des chiffres à l'oral | « Il y a un chercheur américain qui s'est posé exactement cette question… » + « plus de 1 500 » |
| Des blocs qui commencent sans liaison | « et puis » implicite | « Sauf que… », « Et le plus fou, c'est que… », « Du coup… » |
| « Le ministère va dans le même sens » | une erreur de logique (la certitude d'être pris, c'est encore de la peur) | « Ça veut pas dire que la peur sert à rien. Mais c'est pas la taille de l'amende… » |
| Des phrases toutes de la même longueur | monotone, ça sonne robot | des phrases courtes et longues, et des marqueurs oraux |

**Et ce qui a raté dans la v1 de « la poubelle » :**

| Raté | Pourquoi | Correction |
|---|---|---|
| « Une poubelle qui brûle. Ça aide la cause… ou ça la tue ? » | trop littéraire : la voix décrit ce que l'image peut montrer | l'image montre la poubelle, la voix dit « Ça, est-ce que ça aide une cause… ou ça la dessert ? » |
| « On joue. Toi, tu trouves la règle. » | on ne sait pas de quelle règle il s'agit | « Toi, tu dois trouver pourquoi l'une a gagné et pas l'autre. » |
| « …une loi protège le droit de vote des Noirs. Gagné. » | on apprend après coup pour quoi ils marchaient | le contexte d'abord : « Sur le papier, les Noirs ont le droit de voter. En vrai, on les en empêche. » |
| « Juste pas du même côté. » | trop elliptique | « Sauf que ceux qui frappaient, c'était les policiers. » |
| Le chercheur, puis l'actu, puis la chute arrivent sans pont | on décroche | une question qui amène chacun (règle n°5, §4) |
| (Conseil, sur la v2) l'énigme se devine en 3 s : seule la 1re manif est « calme », seule la 2e est violente | rien à chercher | mettre de la violence dans les deux exemples, enlever les adjectifs qui donnent la réponse |
| (Conseil, sur la v2) « sa réponse, c'est oui » à propos de Wasow | surinterprétation, attaquable en commentaire | « il estime que ça a **probablement** fait basculer l'élection » |

**Et ce qui a raté dans les v1 à v5 de « Truman » (13 oct.) :**

| Raté | Pourquoi | Correction |
|---|---|---|
| « Ce mec a passé 30 ans dans une prison… et il essaie même pas de sortir » | faux, et jamais corrigé ensuite : dans le film, il essaie 4 fois | une fausse piste est permise dans le hook, mais la vidéo doit la corriger juste après et en faire un re-hook |
| On définit « l'impuissance apprise », puis « ça s'apprend pas » | le spectateur entend « on m'a menti pendant 30 s » | l'annoncer comme une correction du chercheur lui-même, en une phrase simple |
| « Certains peuvent les couper avec un panneau » | on ne visualise pas ce qu'est le panneau | « Certains ont un bouton devant eux. Ils appuient dessus avec le museau, et ça s'arrête. » + on le montre |
| « Truman, c'est le chien sans panneau » | dépend d'un mot déjà flou | « Truman, il est exactement comme ces chiens-là. » |
| « Et il vit sur une île. » | demi-vanne, on ne capte pas | « Pratique, pour un mec qui vit sur une île. » |
| « Ce qui s'apprend, c'est que ce que tu fais, ça change quelque chose » | imprononçable, on bute | « Ce qu'on apprend, c'est l'inverse. Qu'agir, ça marche. » |
| « Seligman corrige sa théorie » alors que Seligman n'a jamais été présenté | nom sorti de nulle part | « un des deux chercheurs » |
| « Il lui manquait pas du courage » | culpabilise quelqu'un qui était piégé | « C'était jamais l'envie qui lui manquait » (répond à la phrase du hook) |
| Morale, puis question, puis fin | la vidéo « redescend », les gens partent | la boucle sans redescente (§10 bis) |
| Un plan figé en 3 parties (« 3 barreaux », triade sombre) quand le sujet n'en a pas besoin | Noam : pas obligé d'avoir trois trucs pour dire trois trucs | une grille seulement si elle sert le sujet |
| Analyser le méchant (Christof) alors que Noam voulait parler de Truman | on a pris l'exemple « méchant » au pied de la lettre | on garde la mécanique (le film explique un concept), pas forcément le méchant |

---

## 12. La checklist de relecture (à passer sur chaque script)

- [ ] Le concept est noté (recette ou pari, ×n calculé ou `×-`) et la porte est M ou L (§0) ? Le sujet n'a pas été fait dans les 4 dernières semaines ?
- [ ] Le format est choisi et noté en tête du script (§0 bis), et il sert le sujet (pas d'énigme forcée, pas de grille plaquée) ?
- [ ] Le sujet coche au moins 5 des 7 critères (§0) ? Il y a un dilemme entre deux valeurs et un personnage ?
- [ ] Il y a une phrase que tout le monde a déjà dite, sur laquelle on peut être pour ou contre (§0 ter) ? Le commentaire épinglé « team X ou team Y » est prêt ?
- [ ] Le sujet est clair en 2 s, à l'oral ET à l'écran ? Le hook est en « tu » ou porte un nom propre fort ?
- [ ] Les 4 S du hook (sujet, enjeu, vitesse, super clair) et une note de 7/10 ou plus ? Le texte à l'écran fait 2 lignes max, sans ponctuation, aligné avec l'image et la voix (§3) ?
- [ ] La promesse est confirmée et une preuve arrive avant 15 s (zone de verrouillage) ?
- [ ] Le hook contient un contraste (A contre B) et reste sur le sujet promis ? S'il exagère ou lance une fausse piste, la vérité est rétablie juste après (idéalement avant 15 s), sous forme de re-hook ?
- [ ] Entre chaque idée, il y a un « donc » ou un « mais », jamais « et puis » ? Aucune paire de phrases n'est interchangeable ?
- [ ] La dernière phrase de chaque bloc ouvre le suivant ?
- [ ] Un re-hook toutes les 10 à 15 s ? Une fausse résolution vers 40-50 % ?
- [ ] Une seule étude principale, sourcée (auteur, année) ? Aucun chiffre inventé : ce qu'on n'a pas encore vérifié est écrit `{{à remplir}}` et listé ? La limite est dite ?
- [ ] Un seul concept nommé, **après** la scène ? Chaque objet d'une expérience est expliqué (ce que c'est, ce que ça fait) ?
- [ ] Une métaphore ou un fil rouge repris jusqu'à la chute ?
- [ ] Les deux camps peuvent commenter, sans que personne ne soit traité de méchant ?
- [ ] Le rythme fait des dents de scie, avec 2 ou 3 marqueurs oraux et zéro tournure écrite ? Après deux phrases longues, une phrase de 5 mots ou moins (ginyboi : long, court, long, court) ?
- [ ] Le script est au moins au niveau 4 de l'échelle du conteur (§2) : fausses pistes, enjeu personnel, boucles qui s'ouvrent et se ferment ?
- [ ] Aucun des 20 tics « IA » (§8) : pas de participe présent en fin de phrase, pas de « par ailleurs », pas de « crucial / souligne / met en lumière », pas de « constitue / représente » à la place de « c'est », pas de lien vague, pas de tiret long, au plus un « ce n'est pas X, c'est Y » ?
- [ ] Le test du flou (§8) : aucune phrase ne pourrait s'appliquer à n'importe quel autre sujet ? Chaque idée a son détail précis ?
- [ ] Chaque nouveau personnage, lieu ou retour à l'actu arrive par un pont ? Chaque « ça » ou « la règle » est clair ? Chaque nom est présenté avant d'être utilisé ?
- [ ] Dans chaque exemple, le contexte (qui, ce qu'ils veulent) vient avant le résultat ?
- [ ] La voix ne décrit pas ce que l'écran montre ? Les dates et chiffres exacts sont à l'écran ?
- [ ] 2 ou 3 figures de style aux moments clés, et une ou deux phrases qu'on pourrait recopier en commentaire ?
- [ ] Une émotion cible choisie (§9), et je sais à quelle seconde elle doit frapper ?
- [ ] Le spectateur est embarqué (il se reconnaît, il se souvient, ou il participe si le format s'y prête) ?
- [ ] Il y a un humain dans l'histoire, un détail sensoriel, et l'émotion est montrée, jamais nommée ?
- [ ] La fin ne redescend pas : la phrase-formule est avant l'accélération, et la dernière phrase s'enchaîne sur le hook, lue d'une traite à voix haute, sans mot de fin (§10 bis) ? La ligne « Boucle : … → … » est écrite ?
- [ ] La passe « décrochage » (§10 ter) est faite : aucune phrase floue, aucune phrase de plus de 4 s, pas de trou de plus de 15 s, aucune cadence de fin avant la boucle ? Les déclencheurs sont notés à leur seconde ?
- [ ] Les portes « générique » et « interchangeable » passent : si un autre créateur de la niche reprenait ce script, est-ce qu'il lui irait aussi bien ? Si oui, il manque l'angle, la preuve ou les mots de la chaîne.
- [ ] Lu à voix haute sans buter ? Chaque phrase sert ? La durée tient dans la limite fixée par Noam, mesurée sur le fichier (§2) ?
- [ ] Aucun caractère invisible dans la voix off (texte copié d'une page : `references/pratiques-script-viral.md` §9) ?
- [ ] Le test du pote : si je l'envoie en vocal à quelqu'un qui n'y connaît rien, il suit et il réagit ?

---

## 13. Le format de rendu

0. **Le format choisi** (§0 bis), la phrase-promesse, et la ligne `concept : … (preuve, ×n, recette ou pari) · porte S/M/L`.
1. **3 ou 4 hooks à tester**, chacun avec sa formule et sa note sur 10 (§3).
2. **La voix off seule**, propre et lisible d'un trait. Le seul silence est marqué par « (silence) ». C'est ce que Noam enregistre. La dernière phrase est écrite en entier (on coupe au montage pour la boucle). Juste après : la ligne **« Boucle : … → … »** et la ligne **Notes** (`hook 8/10 · Déclencheurs : manque 0 s, preuve 9 s, rupture 31 s · 312 mots ≈ 1 min 05`). Dans un projet du studio, la voix off va dans la section « ## Voix off » de `script.md` : c'est elle que lit le bouton Voix.
2 bis. **Le tableau de la passe « décrochage »** (§10 ter).
2 ter. **À remplir** : la liste des trous `{{…}}`. Elle doit être vide avant de générer la voix.
3. **Le découpage plan par plan**, au format du §16 de la bible `da-koan` (`_styles/da-koan/bible.md`) : temps, voix off, ce qu'on voit, technique, animation et mot déclencheur, transition, son, lapin, image à fournir. Puis la liste des **images à fournir** et des **sprites nouveaux**.
4. **Les sources**, avec un lien pour chaque fait utilisé.
5. **La question des commentaires (commentaire épinglé) et la chute.**
6. **La voix générée et nettoyée** avec le skill `son`, quand Noam le demande.
7. **Le rangement** : un dossier par vidéo (script final, voix finale, recherche, transcriptions de référence). On ne garde que la voix validée.

**Le modèle à suivre** : le script « La poubelle » v2 (Project, `claude/script-poubelle-v1.md`), validé par Noam comme « beaucoup plus naturel ». Pour le format film → concept : `claude/script-truman-v6.md`. Voix très orale, contexte avant le résultat, un pont avant chaque nouvelle personne, `[ÉCRAN : …]` pour ce qui est montré, 2 à 5 figures de style aux moments clés.

**Toujours le Conseil des Padawans.** Avant de rendre un script, passe-le **systématiquement** au Conseil des Padawans (`references/conseil.md`) : 5 conseillers en parallèle (Sonnet), relecture croisée anonyme, synthèse du président (Opus). Rends à Noam le verdict en français, avec ce que le conseil garderait tel quel et ce qu'il changerait (avec les réécritures proposées).

Avant de rendre quoi que ce soit, passe la voix off dans la checklist (§12) puis dans `references/anti-ia.md`.

---

## 14. Le format « un film pour expliquer un concept » (méthode Laganne)

Tiré de l'analyse des 60 vidéos de Laganne (`claude/analyse-laganne.md`). Ses vidéos qui partent d'une œuvre (méchants, « Le film qui… », personnages de séries) font environ **4× plus de vues par mois** que ses vidéos psycho sans œuvre.

- **On ne résume jamais le film.** Chaque scène sert à prouver une idée, puis se termine en règle générale. Noam : « se servir du film pour expliquer quelque chose, pas faire un résumé ».
- **Un seul concept** (psycho, socio, philo), et **le film le rend visible**. On analyse le personnage principal ou un mécanisme du film, pas forcément le méchant.
- **La thèse à l'envers en 10 s** : une évidence, « sauf que », la vraie thèse.
- **Le micro-détail caché** est l'arme principale (« t'avais pas vu ça ») : la pipe de Landa, les 8 verres de lait, l'affiche de l'avion foudroyé.
- **Le cycle de base** : le concept nommé → « en gros… » → une scène ou un exemple du quotidien → une phrase-formule qui oppose deux idées.
- **Le pont vers le spectateur** : le personnage est ramené à la vraie vie (« cette phrase, on la dit tous, au pote qui reste dans un taf qu'il déteste »).
- **Faire mieux que Laganne sur les sources** : il en donne beaucoup d'approximatives (Mehrabian, l'« effet Nova », des chiffres ronds). Chaque fait du film et chaque étude se vérifient (GPT via Codex, puis contrôle).
- **Avant d'écrire, vérifier que l'angle est libre** : regarder ou faire transcrire les vidéos existantes sur le même film. Pour Truman, les 5 vidéos fournies par Noam traitaient la téléréalité, Dieu, Baudrillard, la prison du confort, Pavlov et le brownout. Personne ne parlait d'impuissance apprise, donc l'angle était libre.
- **Les images du film** : redessinées en pixel, en personnage original ou en silhouette (pas le visage de l'acteur, pas de copie de l'affiche officielle). Le titre du film en texte seul.
- **Rendu de la voix** : skill `son` (génération Gemini, nettoyage des bruits de bouche, silences à 120 ms, pas d'égaliseur).