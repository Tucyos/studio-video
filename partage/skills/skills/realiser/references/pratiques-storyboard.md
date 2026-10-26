# Storyboard : découper et décrire chaque section

*Repères tirés de Huashu Design (MIT), mesurés sur des démos de produit 16:9, plus lentes qu'un TikTok. Les règles chiffrées de la DA du projet (mesurées sur ses vidéos de référence) passent avant.*

## Où vit le storyboard

- `project.json` : chaque section porte déjà `t0`/`t1`. Son champ `brief` tient sur 1-2 lignes et contient les champs ci-dessous dans l'ordre ; il ne réécrit pas les temps, il donne le numéro et la durée.
- `storyboard.md` : une ligne COURTE par section (ce qu'on voit, en une phrase) : il est donné en entier à chaque constructeur, la carte complète reste dans le brief.
- Le brief est la seule source du constructeur : ce qui n'y est pas n'existe pas à l'image.

## Les 8 champs, dans l'ordre

1. **Numéro** de section.
2. **Temps** : `t0`–`t1` (déjà portés par la section) + durée.
3. **Cadrage** : palier d'échelle (0,78 large · 1× plein · 1,3-1,45 moyen · 1,8 rapproché · 2,3 gros plan) et ce que le cadre coupe.
4. **CAMÉRA** : mouvement + motif, c'est-à-dire la question du spectateur à laquelle il répond. En 3D : travelling, dolly (vraie parallaxe), orbite, FOV ; un zoom n'est pas un dolly.
5. **Composition** : en pourcentages, ≥ 3 chiffres (sujet, sol, ciel), marge de sécurité 8 %, avant / plan moyen / arrière-plan nommés.
6. **Animation clé** : une seule par plan, avec son état de départ et son état d'arrivée.
7. **Transition vers la section suivante** : le procédé, jamais un champ vide.
8. **Images de vérification** : 1-2 instants T écrits d'avance, qui deviendront les `--snap` du correcteur. La barre est fixée avant de coder.

## Règles de rédaction

- Aucun champ vide.
- « Statique » est un mouvement légal, mais il faut écrire pourquoi (lisibilité, respiration, attente d'un résultat).
- Un plan = une animation. Deux effets dans le même plan : aucun des deux n'est vu.
- Le zoom finit sur un ancrage concret (logo, chiffre, poignée, phare, visage), jamais sur du fond ou de l'ambiance.
- Une seule ligne de guidage par plan = le mouvement de caméra. Si on ne la trouve pas, on corrige la composition, on n'invente pas un mouvement.
- Tout mouvement de caméra répond à « quelle question ça résout pour le spectateur ? », sinon on le supprime.
- La caméra arrive avant l'action, pas après.
- Pas d'effet de pompe : on ne revient pas à 1× entre deux zooms rapprochés.
- Le décor dépasse le cadre d'au moins l'amplitude du panoramique + 8 % : sinon on voit le bord du monde. Contrôle aux deux extrémités de chaque travelling.
- La composition change à chaque plan ; le style (couleurs, matières, lumière) est fixé une fois. Jamais l'inverse.
- Chaque image pose un manque que la suivante comble (setup → payoff).
- Densité : 1 sujet concret + ≤ 3 éléments actifs + 1 foyer par image figée. Un élément entre ⇒ un ancien sort (disparaît, recule, flou + assombri).
- Texte à l'image : 2-6 caractères chinois ≈ 2-4 mots courts en français ; verbe d'abord, déterminant ensuite ; posé dans l'espace négatif ; couleur pleine, jamais de contour blanc creux.
- Test des 3 mètres : le plus gros mot doit rester lisible sur une miniature à taille de téléphone.

## Grisaille (thumbnail pass) avant le code

- Page jetable : blocs gris + libellés, aucune police choisie, aucune couleur, aucune ombre.
- 3-5 images seulement : ouverture, héros, un plan d'escalade, pic, clôture.
- Trois questions : (1) cache les textes — les compositions diffèrent-elles ? (2) chaque image passe-t-elle le test de couverture (≤ 3 éléments actifs) ? (3) la ligne de guidage est-elle désignable ?
- On ne code qu'après. Coût faible, et cela vaut l'étape « images fixes » quand le sujet est déjà arrêté.

## Squelette d'énergie

- Quatre tronçons : ouverture 8-12 % (énergie basse, mot-marque tenu ≥ 1 s) ; vedette seule 12-15 % (le plus lent, geste complet ≥ 3 s) ; escalade 55-65 % (énergies haute et basse en alternance, une carte de respiration après 1-2 plans) ; clôture 13-16 % (pic d'énergie, tout le monde à l'image). *(rythme démo produit : à adapter)*
- Retirer du budget les immobilités obligatoires avant de répartir l'animation : mot-marque ≥ 1 s, 0,5 s statique après un effet de lot, geste d'ouverture ≥ 3 s, 0,5 s avant un résultat clé, ≥ 0,8 s de plan large final si les réglages demandent « fin : plan large ». *(rythme démo produit : à adapter)*
- Les images de transition se prennent sur les plans voisins, pas dans un plan supplémentaire.
- Pic d'énergie à 75-80 % de la durée, pas à la fin : la fin sert à atterrir. *(rythme démo produit : à adapter)*
- Carte de respiration : gros texte 2-6 caractères (2-4 mots courts), vide partout, zéro décor. Maximum 3 cartes de titre, retenu ≤ 2. *(rythme démo produit : à adapter)*
- Jamais deux plans de forte énergie à la suite.
- Densité de plans de référence : 12-15 plans pour 30 s, soit 2-3 s par plan ; ≤ 6 plans/min, retenu ≤ 4 ; écart entre deux changements de caméra ≥ 2,6-3,0 s ; un plan de < 1,2 s ne mérite pas de mouvement ; en cas de doute, ne pas bouger. *(rythme démo produit : à adapter)*
- Ces valeurs ne sont pas des défauts TikTok : les coupes franches et les bascules rapides mesurées sur la DA du projet passent avant.

## Transitions entre sections

- Lire d'abord les réglages : « coupes sèches permises » ou « aucune coupe sèche » (transitions liées).
- Si les réglages disent « coupes sèches permises » : la coupe franche sur la grille d'images est le procédé par défaut ; le champ 7 l'écrit et donne le prétexte (fin de geste, impact, mot).
- Si les réglages demandent « aucune coupe sèche », chaque raccord est lié, trois familles possibles :
  - Marquées : flash blanc (2-4 images de pic, 5 images de chaque côté) ; fondu au noir `rgba(20,20,20,0.9)` ≤ 0,6 s ; relais flou (0→8 px sortant, 8→0 px entrant, ≥ 8 images de recouvrement, flou ≤ 24 px) ; carton noir tenu ≥ 1 s, ≤ 2 par film ; whip-pan (tenue ≥ 20 images puis 8 images de balayage sur 1,5 écran, pic ≥ 300 px/image) ; mask-wipe en courbe `(0.4 ; 0 ; 0.6 ; 1)` dont la forme sort d'un élément déjà à l'image.
  - Coupes cachées : flash, objet au premier plan qui traverse l'écran, coupe sur flou de vitesse.
  - Voyage : élément partagé entre les deux plans, traversée d'une lettre creuse ≥ 1/3 de la hauteur.
- Un seul procédé par raccord, choisi par le saut d'énergie entre les deux sections.
- Pas d'écran vide > 0,3 s entre deux scènes (hors carton voulu) : recouvrir, ou garder une ancre (la phrase principale) à l'image. *(rythme démo produit : à adapter)*
- Fin : si les réglages demandent « fin : boucle », la dernière image retombe sur la première, sans fondu au noir qui la casse. Si les réglages demandent « fin : plan large », plan large immobile ≥ 0,8 s *(rythme démo produit : à adapter)* et jamais de clôture en gros plan. Aucune des deux n'est une règle générale.

## Exemple de brief rempli (3 s, TikTok voiture)

Section 03, t 12,0-15,0 s.

`03 · 3,0 s · plan 3/4 avant taille basse · CAM dolly latéral gauche→droite 1,3× arrêt sur le logo de calandre, motif = longer la ligne d'épaule · compo : voiture 55 % de la largeur, sol 30 % en bas, ciel 15 %, marge 8 % · anim clé : portière ouverte jusqu'à 45°, chrome qui s'allume à l'arrêt · transition : coupe franche sur la fin d'ouverture (réglage « coupes sèches permises ») · vérif : T 13,5 s (portière à 45°), T 15,0 s (logo plein cadre).`

- Version `storyboard.md` : « 03 (12,0-15,0 s) : la portière s'ouvre, on longe l'épaule jusqu'au logo. »
- Si les réglages demandent « aucune coupe sèche », remplacer le champ 7 par « whip-pan de 8 images vers l'intérieur, motif = phare » ou « mask-wipe depuis la portière, courbe `(0.4 ; 0 ; 0.6 ; 1)` ».
