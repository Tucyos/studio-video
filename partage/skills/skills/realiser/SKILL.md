---
name: realiser
description: "Découper une voix calée au mot près en plans : cadrage, mouvement de caméra, mode visuel par plan, rythme des coupes, storyboard. À utiliser par le directeur avant toute construction, ou pour revoir le découpage d'une vidéo."
metadata:
  source: "tiktok-motion/.claude/skills/realiser/SKILL.md"
---

> Écrite pour Koan (fichiers da.md, storyboard.md, assets.md de tiktok-motion). Dans le studio : le découpage va dans project.json (plans) et storyboard.md, la DA est references/<style>.md du projet.

> Règles des professionnels, avec leurs repères chiffrés : `references/pratiques-pro.md`, `references/pratiques-storyboard.md`, `references/pratiques-image-figee.md`, `references/pratiques-camera.md`. Lis-les avant de travailler ; leurs sources sont dans `references/recherche.md`.

> Les fichiers annexes (`references/pratiques-pro.md`, `references/pratiques-storyboard.md`, `references/pratiques-image-figee.md`, `references/pratiques-camera.md`, `references/recherche.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.


# Le Réalisateur Koan

> `da-koan`, `da-auto`… sont des fiches de DA dans `C:\claude\studio-projets\_styles\<id>\` (`da.md` + `bible.md`) : voir le skill `direction-artistique`. Les § cités renvoient à la bible.

Le script dit **quoi**. La DA (`da-koan`) dit **à quoi ça ressemble**. Le moteur (`fabriquer`) **fabrique**. Le Réalisateur décide **comment on le montre, plan par plan, au bon moment** : quel plan, quelle caméra, quel mode visuel, quelle transition, quel effet, sur quel mot, à quelle milliseconde.

Il ne change pas le texte. S'il trouve qu'une phrase ne se montre pas bien, il le signale, mais c'est `ecrire-script` qui réécrit.

**Qui gagne en cas de conflit :**
- `da-koan` garde le dernier mot sur le **look** : palette, typo, pixel, pinceau, trame, rouge, lapin, sous-titres, zone sûre, interdits, droits des images.
- Le Réalisateur a le dernier mot sur la **mise en scène** : plans, caméra, 3D, B-roll, timing, transitions.
- La règle « caméra quasi fixe » de `da-koan` §9 devient : **caméra fixe par défaut, mouvement seulement s'il a un sens** (§4 ci-dessous).
- **Exception, la DA « 3D pixel » (§0 bis)** : quand la vidéo est portée par une œuvre (film, série, manga, jeu), c'est la palette de l'œuvre, écrite dans `docs/da.md` de la vidéo, qui remplace la palette papier/encre de `da-koan`. De `da-koan`, seuls tiennent : un seul accent = l'idée à retenir, sous-titres, zone sûre, typos, boucle (détail : `da-koan` §0 bis).

---

## 0 bis. La DA « 3D pixel » (née sur Landa, octobre 2026)

À choisir quand la vidéo parle d'une œuvre ou d'un personnage (Landa, Truman…). Validée par Noam sur « Hans Landa, le méchant parfait ? » (`videos/Koan/landa/`, à relire comme modèle : `etat.md`, `outils/plans_v2.py`, `scenes/`).

**Les quatre sources d'images, mélangées :**
1. **3D voxel** (Three.js, `scenes/vox.js`) : les lieux et les personnages. Rendu 540×960 agrandi ×2 sans lissage, toon 3 tons. Un lieu fil rouge qui revient (Landa : la salle de cinéma dont le rideau change de couleur par chapitre ; Truman : le mur-ciel avec l'escalier et la porte).
2. **2D pixel** : les schémas, toujours sur un **fond de brume animée** teintée par chapitre (`fond2D` dans `ui.js`). **Jamais de 2D posée sur la 3D.** Seules exceptions sur la 3D : légendes VT323, bulles de dialogue, sous-titres.
3. **B-roll réel** (photo, page d'article, archive) : traité comme de la 2D, donc sur la brume, avec sa légende.
4. **Vrais extraits sonores** de l'œuvre ou d'archives (une réplique culte, un cri), trouvés sur internet avec l'accord de Noam pour chaque téléchargement, normalisés vers -16 LUFS puis calés au mot. Une réplique parlée ne marche que si la voix off laisse un trou ; sinon, seulement des sons (foule, tempête, impact).

**La palette s'adapte à l'œuvre.** Chaque vidéo a son `docs/da.md` : une palette recommandée + deux variantes, en tableau, avec une famille de couleurs par « monde » de la vidéo (Truman : Seahaven pastel / régie nuit / labo vert hôpital / mer). Un seul accent (pas forcément rouge : celui qui colle à l'œuvre), réservé à l'idée à retenir (3 à 5 apparitions dans toute la vidéo), et rien d'autre de cette couleur à l'écran. Repères de Noam :
| Œuvre | Ambiance couleur |
|---|---|
| Blade Runner | cyberpunk rétro-futuriste : nuit bleu pétrole, néons magenta et cyan, orange sodium |
| Batman | sombre : noir bleuté, violet foncé, un peu de jaune signal |
| Mr. Robot | rouge et noir, gris béton, vert terminal |
| One Piece | vif : bleu mer, rouge, jaune paille, blanc |
| Inglourious Basterds (Landa) | ferme et fumée : anthracite chaud, bois, crème, gris-vert ; accent rouge vif |
| The Truman Show | pastel de Seahaven, ciel peint ; nuit de la régie ; accent rouge |
Les personnages réels (acteurs) : évoqués par leurs signes (costume, coiffure, accessoire), ou statue d'après références si Noam le demande ; jamais de photo d'acteur détournée.

**Ce que Noam a validé ou refusé sur Landa (à appliquer d'office) :**
- Plans fluides : la caméra bouge dès la 1re image ; raccords dans le mouvement (le dernier cadre d'un plan = le 1er du suivant quand c'est le même lieu) ; raccords d'objet (le verre de lait du hook → le même verre à la ferme ; le chien couché → Truman couché sur son volant).
- **Transition pixel** (`pixTrans`, blocs `round(1 + b²·40)`) à chaque changement 2D ↔ 3D ou de chapitre, sauf raccord voulu (`trans: 'cut'`) ; les sous-titres sont dessinés **après** la pixellisation (ils ne se pixellisent jamais).
- 2D = de **vrais schémas** (flèches, icônes, avant/après, inventaires, cartes). Pas de jauges isolées ni de barres de score : Noam a refusé les premières jauges de Landa. Format validé à la place : la « fiche » (une ligne par trait avec son icône, barre de 10 cases qui se remplit, note à droite ; `jauges()` dans `landa/scenes/ui.js`).
- Les personnages doivent toujours être **visibles et lisibles** dans le cadre (pas cachés par un autre, pas en contre-jour total).
- Bulles de dialogue sur la 3D, gardées dans la zone sûre.
- Musique **composée** (`audio/musique.py`) qui démarre à 0 s et suit le texte (couches par chapitre, coupures nettes sur les phrases chocs) ; mix par pistes (`outils/mix.sh`) : musique ~19 dB sous la voix + sidechain, -14 LUFS / -1 dBTP.
- **Transition « zap »** (neige de télé, bandes décalées, `zap(g, T, tCut)` dans `truman/scenes/ui.js`) : seulement pour entrer dans un écran ou une régie, ou pour en sortir (le sens compte). Elle marche aussi pour les coupes au milieu d'un plan, que `pixTrans` ne gère pas.
- **Personnages** : articulés (`truman/scenes/perso.js` : tronc + tête d'un bloc, bras et jambes qui pivotent aux épaules et aux hanches), modélisés d'après des captures du film cherchées par Codex et téléchargées dans `recherches/refs/` avec l'accord de Noam. Planche de test (face, trois-quarts, dos, pose) avant de les mettre en scène. Couleurs sombres (noir, anthracite) : prendre une teinte plus claire, le toon 3 tons les écrase en noir.
- **Boucle visuelle** : la dernière image = la première, sur une pose forte (Truman bras tendus dans la porte) ; vérifier avec `ssim` entre les deux images, au-dessus des sous-titres.
- **Pièges vus sur Truman** : (1) un début de plan arrondi au millième tombe entre deux images : `inPlan` garde une marge d'une demi-image, sinon la 1re image d'un plan montre un autre plan ; (2) dans `plans.py`, ajouter les nouveaux événements à la fin de la liste d'un plan, ne jamais en retirer au milieu (les `ev(id, i)` des scènes se décalent) ; (3) caméra : portée lointaine 300, sinon les grands décors (dôme) sont coupés ; (4) une erreur de page fait échouer le rendu d'un plan sans casser les autres : lire chaque ligne de `rendu.sh`, ne pas seulement compter.
- **Revue de fin** : une bande d'images autour de chaque coupe (−0,1 / −0,03 / 0 / +0,03 / +0,1 s) et la 1re image de chaque plan, en plus des planches par plan.
- Salle de montage par vidéo (`studio/salle`, une config `salle-<slug>` dans `C:\claude\.claude\launch.json`) : Noam voit chaque plan avec sa voix et y laisse ses notes (`retouches.md`).

**Les sorties, comme Landa :** `outils/plans.py` (source unique, copie de `landa/outils/plans_v2.py` : un appel `P(...)` par plan, événements calés sur l'index du mot) → `plans.json` (salle), `docs/plans.json` (scènes + son), `docs/storyboard.md` (pour Noam). Plus `docs/da.md` et `docs/assets.md` (B-roll et extraits avec source et droits, rien téléchargé avant l'accord de Noam). Calage de la voix : Whisper (`openai-whisper`, venv `C:\claude	ools\mmaudio-venv`) aligné sur le texte du script (`truman/outils/caler.py`).

---

## 1. Où il se place dans la chaîne

1. Script validé, puis Conseil des Padawans (`ecrire-script` et son `references/conseil.md`). Le script contient seulement des **intentions visuelles** courtes (`[ÉCRAN : …]`).
2. **Voix off** : Gemini TTS, `gemini-3.8-flash-tts`, voix Velvet Anchor 3 → `audio/vo.wav`.
3. **Calage au mot** : `python3 align.py audio/vo.wav docs/voix.txt` → `docs/timing.json` + `scenes/words.js` (§2).
4. **Le Réalisateur** (ce skill) → `docs/storyboard.md`, `docs/plans.json`, `docs/assets.md`.
5. **Noam lit le storyboard écrit** (timecodes, plan par plan) et valide ou corrige, avant toute fabrication. Pas d'animatique par défaut (§12).
6. Images, vidéos, sprites et modèles 3D à fournir ou à créer (`docs/assets.md`).
7. **Fabrication** avec `fabriquer`, scène par scène, à partir de `plans.json`.
8. Son (`audio.py`, à partir des `sfx` de `plans.json`), assemblage, test téléphone.

**Pourquoi la voix avant le storyboard :** c'est la voix qui donne le rythme réel (pauses, mots appuyés, débit). Un storyboard fait sur le texte seul se trompe de 20 à 40 % sur les durées.

---

## 2. L'entrée : la voix calée à la milliseconde

`align.py` (code dans le Project, voir les annexes) :
1. faster-whisper transcrit la voix avec l'horodatage de chaque mot, le script servant d'amorce ;
2. les mots sont **alignés sur le texte du script** : l'orthographe vient du script, un mot mal entendu prend le temps de ses voisins ;
3. après chaque pause, le début du mot suivant est **recalé sur l'énergie réelle du son** (enveloppe à 5 ms). Ce sont les points de coupe les plus importants ;
4. sortie : `docs/timing.json` = `{duration, fps, words:[{i,w,start,end,phrase}], phrases:[{i,text,start,end}], pauses:[{after,start,end,dur}]}`, et `scenes/words.js` pour `M.at()`.

**Précision obtenue :** environ 20 à 50 ms sur les mots ordinaires, mieux après une pause (recalage sur le son). Une image dure 33 ms à 30 i/s, donc c'est assez précis pour couper à l'image près.

**À vérifier à l'oreille :** les mots qui commencent par un son doux (s, f, ch, v) démarrent plus tôt que leur pic d'énergie. Pour les 3 à 5 coupes clés de la vidéo, on vérifie sur la forme d'onde :
```bash
ffmpeg -y -ss 7.6 -t 0.8 -i audio/vo.wav -filter_complex "showwavespic=s=1600x300:colors=black" -frames:v 1 out/onde.png
```

**Dans le cloud :** si le modèle Whisper ne se télécharge pas, on lance `align.py` sur le PC de Noam (Cowork), puis on rapatrie `timing.json`. Si `faster-whisper` plante sur `av`, le script passe déjà par ffmpeg pour décoder l'audio.

---

## 3. La méthode, étape par étape

1. **Lire le script et `timing.json`.** Noter : la durée, les pauses de plus de 0,4 s (les silences voulus), les mots appuyés (balises TTS), le format (`ecrire-script` §0 bis) et l'émotion cible (§9).
2. **Découper en beats.** Un beat = une idée à faire comprendre, souvent une phrase, de 3 à 8 s. Pour chacun : sa fonction (hook, enjeu, contexte, preuve, re-hook, retournement, retour à soi, nuance, chute), l'info à faire passer, le mot-clé, l'émotion.
3. **Dessiner la courbe d'intensité** (§7). Placer d'abord le **moment fort** (en général au retournement), puis les respirations, puis le reste.
4. **Choisir le mode visuel de chaque beat** avec l'arbre de décision (§5).
5. **Choisir le plan, la caméra et le point focal** (§4). Un seul point focal par plan.
6. **Tenir le fil visuel** (§9) : objet du hook, axe de déplacement, échelle, motif récurrent.
7. **Choisir chaque transition selon le lien logique** entre les deux beats (§6).
8. **Caler chaque événement sur son mot**, à l'image près (§8).
9. **Placer le son** (§10) : SFX, ambiances, coupe de musique, J-cut et L-cut.
10. **Vérifier les budgets et la checklist** (§14).
11. **Écrire** `storyboard.md`, `plans.json`, `assets.md` (§11). Le storyboard écrit sert de scénario précis pour la fabrication, et c'est lui que Noam valide.

---

## 4. La grammaire des plans et de la caméra

### Les valeurs de plan (adaptées au motion design)
| Plan | Ce qu'il dit | Exemples Koan |
|---|---|---|
| **Large / d'ensemble** | le lieu, le contexte, « où on est » | la ville pixel de nuit, la carte de France |
| **Moyen** | l'action, qui fait quoi | deux groupes pixel face à face |
| **Serré / gros plan** | le détail, l'émotion, l'insistance | un visage tramé, une main sur un téléphone |
| **Insert** | l'objet à lire : chiffre, document, écran | le compteur VT323, la une de l'étude |
| **Vue de dessus** | le système, la stratégie, les positions | l'échiquier, le pont vu du ciel, un réseau |
| **Plongée** (on regarde d'en haut) | la petitesse, la vulnérabilité | un marcheur seul au milieu |
| **Contre-plongée** (d'en bas) | le pouvoir, la menace | la ligne de policiers, un serveur géant |
| **Subjectif / vue à la 1re personne** | « c'est toi » : l'empathie, l'immersion | face aux policiers, ton écran de téléphone |
| **Deux cartes / split** | la comparaison | les deux manifs, avant / après |
| **Écran dans l'écran** | le monde numérique | un fil TikTok dans un téléphone pixel |

### Les mouvements de caméra (chacun a un sens)
| Mouvement | Sens | Durée / vitesse | Remarques |
|---|---|---|---|
| **Fixe + dérive 100 → 103 %** | lisibilité (défaut) | tout le plan | obligatoire quand un texte important se lit |
| **Push-in** (on avance) | insister, monter la tension, entrer dans une idée | 1,5 à 4 s, 100 → 115 % (2D) | finit sur le point focal |
| **Pull-out / révélation** (on recule) | montrer ce qui était caché, le « en fait… » | 1 à 2,5 s | idéal sur un « sauf que » |
| **Travelling / pan** | suivre, parcourir une frise ou une liste | vitesse constante | les éléments défilent dans le sens de lecture (gauche → droite) |
| **Tilt** (haut ↔ bas) | du détail au tout, ou l'inverse | 1 à 2 s | |
| **Orbite** (on tourne autour) | montrer un objet 3D sous plusieurs faces | 3 à 6 s, lente | 3D seulement |
| **Drone qui plonge** | passer du système à l'individu | 0,8 à 1,5 s | souvent 2D → 3D (§13) |
| **Vue subjective (FPV)** | vivre la scène à la place de quelqu'un | 2 à 4 s | 3D, avec un léger balancement de marche |
| **Dolly zoom** (effet *Vertigo*) | le vertige, « tout bascule » | 1 à 1,5 s | une fois par vidéo au plus, 3D |
| **Secousse** | l'impact (tampon rouge) | 0,15 à 0,25 s | `da-koan` |

**Règles :**
- Un seul mouvement de caméra par plan. Un mouvement commence et finit en douceur (ressort ou `inOut`), jamais linéaire, sauf le travelling.
- On ne bouge pas pendant qu'un texte important se lit : le texte arrive caméra posée, ou la caméra s'arrête avant.
- Un mouvement se déclenche sur un mot (souvent le mot-clé), et il finit au plus tard sur la fin de la phrase.
- **Interdits** : whip pan flou, zoom rapide gratuit, caméra qui tremble en continu, deux mouvements empilés.

---

## 5. L'arbre de décision : quel mode visuel pour ce beat ?

On pose les questions dans l'ordre, et on prend la première réponse « oui ».

1. **C'est un fait réel précis** (une personne, un lieu, une date, un événement) ?
   → **B-roll réel** : photo ou vidéo d'archive, tramée (§13), avec légende `LIEU · ANNÉE`. Si rien n'est libre de droits → reconstitution pixel ou 3D marquée « illustration ».
2. **C'est un mécanisme, une cause, une logique** ?
   → **Schéma pixel + pinceau** : les éléments pixel numérotés, reliés au pinceau, une étape par phrase.
3. **C'est une question d'espace** (positions, distances, foule, stratégie, échelle, trajet) ?
   → **Asset 3D** (§13), vue de dessus ou orbite lente : l'échiquier, le pont, une salle, un plan de ville, une maquette.
4. **Il faut vivre la scène, ressentir à la place de quelqu'un** ?
   → **Séquence 3D subjective** (le moment fort), ou à défaut un plan pixel serré en plongée ou contre-plongée.
5. **C'est un chiffre** ?
   → **Insert chiffre** : compteur VT323 ou graphique pixel, source en petit.
6. **C'est la phrase à retenir, la règle, la question** ?
   → **Texte seul** (Playfair) sur papier, sans rien d'autre.
7. **C'est une respiration, une émotion lente** ?
   → **B-roll lent** (photo ou vidéo réelle, ralentie) ou **une seule image fixe** qui dure.
8. **Ça parle du spectateur, de son téléphone, de son fil** ?
   → **Écran dans l'écran** (téléphone pixel) ou **subjectif**.
9. Sinon → **scène pixel 2D** (objets et personnages génériques).

**Règles de variété :**
- Pas plus de 3 plans de suite dans le même mode.
- Après un plan chargé (schéma, document), un plan simple (texte seul, image unique).
- Le mode du hook revient à la chute (la boucle), avec le même cadrage.

---

## 6. Les transitions : elles traduisent le lien logique

Le script relie ses idées par **« donc »** ou par **« mais / sauf que »** (`ecrire-script` §4). Le Réalisateur traduit ce lien en image.

| Lien entre les deux beats | Transition | Durée | Exemple |
|---|---|---|---|
| **« donc »** : même idée, on continue | **morph** (l'objet se défait en points et se recompose) ou **match cut** (même forme, même place) | 0,6 à 0,9 s / 0 s | la bulle devient une pupille au même endroit |
| **« donc »** : on entre dans le détail | **zoom-through** : on plonge dans un objet, qui devient la scène suivante | 0,5 à 0,8 s | on entre dans l'écran du téléphone, et son fil devient le plan suivant |
| **« donc »** : du système à la personne | **drone qui plonge**, souvent 2D → 3D (§13) | 0,8 à 1,5 s | le pont vu du ciel, puis un marcheur, puis sa vue |
| **« mais / sauf que »** : rupture | **cut sec**, souvent sur le silence, ou **pull-out** qui révèle | 0 s / 1 à 2 s | « Sauf que… » sur papier vide |
| **le retournement** | **brushWipe** puis tampon rouge (`da-koan`) | 0,9 s | |
| **changement de chapitre** (lieu, époque) | **trameWipe** | 0,8 s | USA 1965 → France aujourd'hui |
| **révéler une info cachée** | **carte qui se retourne** | 0,45 s | |
| **ambiance qui arrive avant l'image** | **J-cut** : le son du plan suivant démarre 0,2 à 0,5 s avant la coupe | | la rumeur de la foule avant de voir la foule |
| **émotion qui reste** | **L-cut** : le son du plan continue sur le suivant | | |

**Budgets :**
- au plus une transition spectaculaire (trame, pinceau, zoom-through, drone) toutes les 10 s environ ;
- brushWipe : 1 à 2 fois par vidéo ;
- le reste en cut ou en morph discret ;
- jamais deux transitions empilées, jamais une transition sans lien logique.

---

## 7. Le rythme et la courbe d'intensité

### L'échelle d'intensité (notée pour chaque plan)
| Niveau | C'est quoi |
|---|---|
| 1 | une image fixe, un texte seul, du silence |
| 2 | un élément qui bouge, une annotation |
| 3 | plusieurs éléments, un mouvement de caméra lent, un B-roll |
| 4 | une transition forte, un tampon rouge, un rythme rapide |
| 5 | **le moment fort** : séquence 3D, passage 2D → 3D, dolly zoom |

### La courbe (elle suit la trajectoire émotionnelle de `ecrire-script` §9)
- **Hook** : 3 à 4. Ça accroche, mais on garde de la marge.
- **Contexte, enjeux** : 2 à 3.
- **Re-hooks** : petits pics à 3-4.
- **Retournement** : **5**, une seule fois en court.
- **Juste après un 5** : on redescend à 1-2 (respiration, silence, image qui dure).
- **Retour à soi, nuance** : 2 à 3.
- **Chute** : 3, calme, le même cadrage que le hook.

### Les budgets
| | Court (60-90 s) | Long (10 min) |
|---|---|---|
| Niveau 5 | 1 | 1 par acte au plus, et 1 grand moment fort pour toute la vidéo |
| Niveau 4 | 3 au plus | 2 à 3 par acte |
| Séquence 3D (moment fort) | 1 | 2 à 4 |
| Asset 3D d'illustration | 3 au plus | sans limite fixe, s'il explique mieux |
| B-roll réel | 2 à 5 plans | 1 toutes les 1 à 2 min au moins |

### Les cadences (rappel `da-koan` §9, précisé)
- un nouvel élément visuel toutes les 1,5 à 3 s ;
- un changement de plan toutes les 3 à 8 s ;
- un plan dure au moins 1,2 s, sauf dans une **rafale** voulue (3 à 6 plans de 0,4 à 0,8 s sur une énumération) ;
- une info importante reste lisible au moins 2 s après son apparition complète ;
- jamais plus de 3 s sans aucun changement à l'écran, sauf un silence voulu.

---

## 8. Le timing à l'image près

Tous les temps sont en **secondes, 3 décimales**, puis **arrondis à la grille des images** : `t = round(t × 30) / 30`.

| Événement | Où le placer | Pourquoi |
|---|---|---|
| **Coupe** sur un mot | 1 à 2 images (33 à 67 ms) **avant** le début du mot | L'œil accepte une image un peu en avance sur le son, pas en retard. Selon la norme ITU-R BT.1359, un son en avance se remarque dès 45 ms environ, un son en retard seulement vers 125 ms. |
| **Coupe sur un silence** (pause ≥ 0,4 s) | à la fin du mot d'avant + 1 image, ou pile au début du mot suivant | on laisse l'image remplir le silence |
| **Pop pixel** (rebond 0,45 s) | 2 images avant le mot | le pic du rebond tombe sur la syllabe |
| **Texte mot par mot** | 1 image avant chaque mot | |
| **Geste au pinceau** | démarre sur le mot, dure 0,3 à 0,5 s | le trait suit la parole |
| **Tampon rouge** | pile sur la syllabe forte du mot | avec la secousse et le son sourd |
| **Mouvement de caméra** | démarre sur le mot-clé, finit avant la fin de la phrase | |
| **Transition** | son milieu (le changement d'image) tombe 1 à 2 images avant le mot qui ouvre le plan suivant | |
| **SFX** | 0 à 1 image avant l'événement visuel | un son en retard casse l'impact |

**Interdits :**
- couper au milieu d'un mot ;
- faire apparaître une image après le mot qui la nomme ;
- deux événements forts dans la même demi-seconde (sauf un pop et son SFX).

**Dans `plans.json`**, chaque temps garde deux formes : le mot (`{"word":"police","n":1,"offset":-0.067}`), qui sert si on régénère la voix, et le temps calculé (`"t": 6.973`), qui sert au rendu.

---

## 9. Le fil visuel et les raccords

- **L'objet du hook revient à la chute**, au même cadrage, avec un détail qui a changé : c'est la boucle visuelle.
- **Un motif récurrent** par vidéo (la bulle, le fil, le pont…). Il suit la métaphore filée du script.
- **Le sens de déplacement ne change pas** sans raison : si les marcheurs vont de gauche à droite, ils y vont toute la vidéo. Le changer veut dire « tout s'inverse ».
- **Une échelle cohérente** : un même objet garde la même taille d'un plan à l'autre, sauf si on la change exprès.
- **Le raccord de forme (match cut)** : on finit un plan sur une forme (un cercle) et on ouvre le suivant sur la même forme, à la même place.
- **Le raccord de regard** : si un personnage regarde vers la droite, le plan suivant montre ce qu'il voit.
- **Le point focal** d'un plan apparaît près de l'endroit où était celui du plan d'avant, pour que l'œil ne cherche pas.

---

## 10. Le son (le Réalisateur fait aussi le « spotting »)

- Chaque événement important a son SFX (`da-koan` §14), noté dans `plans.json` (`"sfx":"blip"`).
- **Les ambiances** : rumeur de foule, ville la nuit, salle. Basses, en J-cut (elles arrivent avant l'image).
- **Musique** : lo-fi discrète, **coupée net** au silence avant le retournement, et reprise au plan suivant ou à la chute.
- **3D** : drone qui plonge = souffle grave qui monte. Vue subjective = pas, respiration, foule proche.
- **B-roll vidéo réel** : jamais le son d'origine, sauf si on en a le droit. On recrée l'ambiance.
- Le silence voulu du script est un **vrai silence** : pas de SFX, pas de musique, image stable.

---

## 11. Les sorties

### `docs/storyboard.md` (pour Noam)
En tête :
- le format, l'émotion cible, la durée ;
- la courbe d'intensité en une ligne, par exemple `3 2 3 3 4 2 5 1 3 2 3` ;
- les budgets vérifiés : niveau 5, transitions fortes, 3D, B-roll, trame.

Puis une ligne par plan :

| # | Temps | Voix (phrase exacte) | Beat | Mode | Plan / caméra | Ce qu'on voit (point focal en **gras**) | Événements (mot → action, temps) | Transition de sortie | Son | Lapin | Int. | Assets | Pourquoi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

La colonne **Pourquoi** est obligatoire : une phrase qui dit ce que ce choix apporte. Si on ne sait pas l'écrire, le choix est gratuit.

### `docs/plans.json` (pour le moteur)
```json
{"video":"slug","fps":30,"duration":61.4,"plans":[
 {"id":"P07","beat":"retournement","from":34.967,"to":38.1,
  "start_cue":{"word":"Sauf","n":1,"offset":-0.067},
  "mode":"3d-sequence","shot":"drone → subjectif",
  "camera":{"move":"drone-plonge puis fpv","keys":[[34.967,"vue de dessus ortho"],[35.9,"plonge"],[36.6,"fpv"]]},
  "focal":"la ligne de policiers","voir":"description courte de l'image",
  "events":[{"cue":{"word":"police","n":2,"offset":-0.067},"t":36.84,"what":"la ligne se resserre","sfx":"pas"}],
  "transition_out":{"type":"cut","dur":0},
  "intensity":5,"bunny":"absent","red":false,
  "assets":["3d:pont_voxel","sprite:policier"],
  "scene":"s05","note":"pourquoi ce choix"}
]}
```
- `mode` : `pixel2d`, `schema`, `photo`, `video`, `texte`, `chiffre`, `ecran`, `3d-asset`, `3d-sequence` (on peut en combiner deux : `pixel2d + trame`).
- `scene` : le fichier `scenes/sNN.html` qui fabrique ce plan. Plusieurs plans continus (une séquence 3D, un schéma qui se construit) vont dans **la même scène**.

### `docs/assets.md`
| Asset | Type | Plan | Description précise | Source et licence | Plan B |
|---|---|---|---|---|---|

Types : `img` (photo à tramer), `video` (B-roll, avec les timecodes du passage), `sprite` (pixel à dessiner), `3d` (à construire en code, ou modèle libre), `sfx`.

---

## 12. L'animatique (optionnelle, seulement si Noam la demande)

Par défaut, **on ne la fait pas** : le storyboard écrit avec les timecodes suffit à Noam, et à Claude pour fabriquer. On la rend seulement si Noam la demande, par exemple pour une vidéo longue au rythme difficile.

C'est un brouillon vidéo calé sur la vraie voix. Chaque plan y apparaît comme une fiche : ce qu'on verra, la caméra, les événements qui s'allument sur leur mot, la transition, l'intensité, la frise des plans. Il se rend en 10 à 15 s pour une minute.

```bash
# dans le dossier de la vidéo (lib/, render.mjs et node_modules accessibles)
node render.mjs scenes/animatic.html --preview
ffmpeg -y -i out/animatic_preview.mp4 -i audio/vo.wav -c:v copy -c:a aac -shortest out/animatique.mp4
```
`scenes/animatic.html` (mettre `to` à la durée de la voix) :
```html
<!doctype html><meta charset="utf-8"><style>html,body{margin:0}</style>
<canvas id="c"></canvas>
<script src="/lib/motion.js"></script><script src="/lib/animatic.js"></script>
<script>M.mount({from:0, to:61.4, sub:1, draw:(g,T)=>ANIMATIC.draw(g,T)});</script>
```
Le code de `lib/animatic.js` est dans le Project (voir les annexes).

Ce qu'elle permet de vérifier : est-ce que ça change assez souvent, est-ce que le moment fort tombe au bon endroit, est-ce qu'un plan est trop long ou trop court.

---

## 13. Les trois sources d'images : réel, code, 3D

### A. Le B-roll réel (photo ou vidéo)
- **Photo** : tramée (`da-koan`, presets), avec un léger push ou pan (Ken Burns) de 3 à 5 s, une légende `LIEU · ANNÉE` et un cadre pixel.
- **Vidéo** : un passage de **2 à 4 s**, jamais plus de 6 s.
  - **Sources** : Library of Congress, Internet Archive (collection Prelinger, souvent dans le domaine public), Wikimedia Commons, NASA, archives publiques ; Pexels ou Pixabay pour du générique récent (on vérifie la licence à chaque fois).
  - **Jamais** : un extrait de JT, de film, de TikTok ou de YouTube sans droit clair. L'INA est payant. La trame n'efface pas les droits.
  - **Exception DA « 3D pixel »** (§0 bis) : quand la vidéo analyse une œuvre, de courts extraits **sonores** de cette œuvre (quelques secondes, cités) sont permis, avec l'accord de Noam. Pas d'images du film : on les refait en voxels.
  - **Traitement** : on extrait les images, puis on les trame **en grille fixe**. Une trame aléatoire (Poisson) scintille d'une image à l'autre. On garde le contraste fort, un cadre (télé pixel ou carte) et une légende. Pour un effet archive : 12 à 15 i/s, image tenue.
  ```bash
  ffmpeg -ss 00:01:12.4 -t 3.2 -i brut.mp4 -vf "fps=15,scale=540:-1,format=gray" assets/video/selma_%03d.png
  ```
  - **Dans la scène** : `frame = floor((T - t0) × 15)`, on dessine l'image tramée correspondante. Le composant `videoTrame` (trame en grille, déterministe) est à ajouter à `koan.js` au premier usage.
- **Ralenti** : il sert l'émotion (respiration après un pic), pas l'info.

### B. Le code (pixel, pinceau, texte)
C'est le mode par défaut, décrit par `da-koan` : il explique le mieux et coûte le moins. Une reconstitution d'un fait réel en pixel ou en 3D porte la mention « illustration » en VT323.

### C. La 3D (Three.js, dans le même moteur)
Deux usages :
- **L'asset 3D d'illustration** : un objet ou une petite maquette qui explique mieux en volume. Par exemple l'échiquier vu de dessus avec les pièces sur le côté, le pont, une salle, un globe, une file d'attente. Caméra lente : vue de dessus, orbite, push. Intensité 2 à 3. Jusqu'à 3 par vidéo courte.
- **La séquence 3D (moment fort)** : mouvement de caméra complexe, passage 2D → 3D, vue de drone, vue subjective, dolly zoom. Intensité 5. Une par vidéo courte.

**La 3D doit rester Koan, sinon on tombe dans le jeu vidéo :**
- **Rendu en basse définition, agrandi sans lissage** (270×480 ou 360×640, puis ×4 ou ×3) : la 3D devient du pixel et se raccorde aux sprites 2D.
- **Palette fermée** : paper, ink, ink2, light, et le rouge seulement pour l'idée à retenir Matériau `MeshToonMaterial` à 3 tons, contours encre (`EdgesGeometry`), fond papier (transparent par-dessus le fond du moteur). **DA « 3D pixel » (§0 bis)** : palette de l'œuvre, toon 3 tons, pas de contours encre, fond = le décor 3D lui-même.
- **Formes** : primitives (cubes, cylindres) ou **voxels**. Les sprites pixel de la vidéo, extrudés case par case, deviennent leur propre version 3D : c'est le raccord parfait 2D → 3D.
- **Modèles externes** : seulement low-poly sous licence CC0 (Kenney, Quaternius ; Poly Pizza en vérifiant chaque licence), chargés avec `GLTFLoader` et recolorés dans la palette.
- **Interdits** : textures photo, rendu réaliste (PBR), ciel bleu, reflets, glow, flou de profondeur, lens flare. **DA « 3D pixel »** : ciel, lumières colorées, reflets de verre et lueurs (appliques, écrans) sont permis s'ils servent le décor de l'œuvre ; toujours pas de PBR, de textures photo ni de lens flare.
- **Comme tout le moteur** : la caméra et les objets sont une **fonction pure de T**, pas d'horloge, pas de `Math.random`.
- **Le code Three.js va dans un fichier `.js` à part** (`<script type="module" src="…">`), pas dans un `<script>` intégré.
- **Testé** : WebGL marche dans le rendu Playwright du cloud (SwiftShader). Une scène 3D de 4 s se rend en 8 s en aperçu et 14 s en final.

**Le passage 2D → 3D, la recette :**
1. Fin du plan 2D : la scène pixel vue de face ou de dessus.
2. La même scène existe en 3D voxel, avec la même disposition. La caméra 3D démarre **de très loin, avec un angle très fermé** (champ de 2 à 3°). Elle voit alors la scène presque à plat, exactement comme le plan 2D : on coupe sans que ça se voie.
3. La caméra se rapproche en ouvrant l'angle (vers 35 à 50°) : la scène prend du volume, c'est la plongée de drone.
4. Elle descend jusqu'à hauteur d'yeux d'un personnage : vue subjective, léger balancement de marche (±1 % en hauteur, 1,8 Hz).
5. Retour au 2D : cut sec sur un silence, ou le chemin inverse.

Gabarit 3D testé : dans le Project (voir les annexes).

---

## 14. La checklist du Réalisateur

- [ ] `timing.json` vérifié : plus de 85 % des mots reconnus, les 3 à 5 coupes clés vérifiées sur la forme d'onde ?
- [ ] Chaque plan a un beat, un point focal unique et une ligne « Pourquoi » ?
- [ ] Le mode visuel de chaque beat suit l'arbre de décision (§5), et il n'y a pas plus de 3 plans de suite dans le même mode ?
- [ ] Chaque transition traduit un lien logique (donc / mais / chapitre / retournement) ?
- [ ] La courbe d'intensité a son pic au retournement, une respiration juste après, et une chute calme ?
- [ ] Budgets respectés : niveau 5, niveau 4, transitions fortes, 3D, B-roll, trame (un usage à la fois) ?
- [ ] Toutes les coupes tombent 1 à 2 images avant leur mot, aucune au milieu d'un mot, aucune image en retard sur le son ?
- [ ] Un changement à l'écran toutes les 3 s au plus (hors silence voulu), un plan d'au moins 1,2 s (hors rafale) ?
- [ ] La caméra ne bouge jamais pendant la lecture d'un texte important ? Un seul mouvement par plan ?
- [ ] L'objet du hook revient à la chute, au même cadrage ? Le sens de déplacement est constant ?
- [ ] La 3D respecte la palette, la basse définition agrandie, les contours encre, sans réalisme ?
- [ ] Chaque B-roll a une source, une licence et un plan B, et aucun n'a de son d'origine sans droit ?
- [ ] Le silence voulu est un vrai silence, et la musique est coupée avant le retournement ?
- [ ] Le storyboard écrit (timecodes, plan par plan) est validé par Noam avant la fabrication ?

---

## 15. Exemple : la scène du pont (Selma, 1965)

Voix (extrait de test) : « Il est trois heures du matin. Le pont Edmund Pettus, à Selma. Six cents marcheurs avancent face à la police. Sauf que personne ne s'attendait à ça. »

| # | Temps | Mode | Plan / caméra | Ce qu'on voit | Événements | Sortie | Int. | Pourquoi |
|---|---|---|---|---|---|---|---|---|
| P01 | 0,000 → 1,900 | pixel2d | large, push lent | **horloge pixel** sur une ville de nuit | « trois » 0,34 : aiguilles sur 3:00 (tick) | cut 2 images avant « Le » (1,965) | 2 | pose le lieu et l'heure sans texte |
| P02 | 1,900 → 4,933 | pixel2d + trame | vue de dessus, fixe | **le pont** vu du ciel, colonne de marcheurs pixel, légende `SELMA · 1965` | « pont » 2,10 : le pont se dessine en cases (blip) ; « Selma » 4,06 : légende | drone qui plonge, 2D → 3D, 0,9 s | 3 | la vue de dessus montre le système : deux groupes, un passage étroit |
| P03 | 4,933 → 7,900 | 3d-sequence | drone → subjectif | **la ligne de policiers** vue par un marcheur | « Six » 4,995 : compteur 600 (tick) ; « police » 7,04 : la ligne se resserre | cut sec sur le silence | 5 | le spectateur devient un marcheur : c'est le moment fort |
| P04 | 7,900 → 10,600 | texte + pinceau | fixe | **« Sauf que… »** sur papier seul | « personne » 8,58 : brushWipe ; « ça » 9,84 : tampon rouge (thud) | brushWipe | 4 | rupture, donc cut sec, puis le retournement |

Les temps de cet exemple viennent d'une voix de test calée par `align.py`.

---

## Annexes : les fichiers outils

Le code complet et testé de `align.py`, `lib/animatic.js`, `scenes/animatic.html` et du gabarit 3D est dans le Project « motion design » : **`claude/outils-realisateur.md`**. Au début d'une vidéo, s'ils manquent dans `studio/`, les lire avec `project_read` et les écrire tels quels (`align.py` à la racine, `animatic.js` dans `lib/`, le gabarit dans `scenes/<scène>/`). Dépendances : `npm i three`, `pip install faster-whisper numpy soundfile --break-system-packages`, ffmpeg.
