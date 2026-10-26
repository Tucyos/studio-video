# DA « Koan » : la bible visuelle

Chaîne TikTok « Koan » : sans visage, motion design fait en code (canvas 1080×1920, moteur `studio/`), vidéos **informatives** (vulgarisation, contre-intuition, énigme, récit, démontage… le format est choisi dans `storytelling-tiktok`), public 25-35 ans. Mascotte : un petit lapin.
Validée par le Conseil des Padawans (v2). Cette bible est la référence pour **écrire le découpage du script** et pour **fabriquer la vidéo**. Si une règle gêne la compréhension, la compréhension gagne, et on note l'exception dans le script.

## 0 bis. Deux looks possibles
- **Koan papier** (ce document) : vulgarisation, études, énigmes.
- **« 3D pixel »** (voxels + schémas 2D pixel sur brume + B-roll + vrais extraits sonores) : vidéos sur une œuvre ou un personnage (Landa, Truman). La **palette vient de l'œuvre** et s'écrit dans `docs/da.md` de la vidéo ; elle remplace §3 et le fond papier. Ce qui **tient** : un seul accent = l'idée à retenir (§2 Rouge, avec la couleur d'accent de l'œuvre), sous-titres (§5), hiérarchie et zone sûre (§6), typos (§4), rythme (§9), boucle (§15 bis), droits (§13).
  Ce qui est **remplacé** : palette (§3) et fond papier (§7) → palette de l'œuvre + brume animée pour la 2D ; pinceau et trame (§2, §13) → schémas 2D pixel, B-roll non tramé dans un cadre ; transitions (§8) → transition pixel `pixTrans` ; le lapin (§10) devient optionnel ; interdits et checklist (§18-19) : ceux qui parlent de papier, trame, pinceau ou lapin ne s'appliquent pas.
  Règles complètes : `realisateur-koan` §0 bis.

## 0. Les 6 principes (à relire avant chaque script)
1. **On doit apprendre quelque chose.** Chaque plan a UN point focal, et le spectateur sait toujours où regarder.
2. **Une technique = un rôle.** Pixel = les choses. Pinceau = le raisonnement. Trame = le réel et les passages.
3. **Le rouge = l'idée à retenir.** La réponse d'une énigme, la révélation, ou l'idée clé d'une explication. Il n'apparaît qu'à ce moment-là.
4. **Le lapin agit, il ne décore pas.** Il apparaît seulement quand il apporte une info ou une émotion.
5. **Lisible sur téléphone, sans le son.** Sous-titres continus, gros textes, tout dans la zone sûre.
6. **La DA s'adapte au format.** Une énigme a son rituel (§11). Une vulgarisation, un récit ou un démontage ont le leur (§11 bis). Aucun format n'est obligatoire.

## 1. L'identité en une phrase
Du papier crème, de l'encre noire, du pixel art pour montrer, du pinceau pour expliquer, des points pour le réel, et un seul rouge : celui de l'idée à retenir. Aucun logo, aucun sceau à l'écran.

Pour ne pas ressembler à Krusty Jus : jamais de rose, jamais de glow, jamais de fond gris ou anthracite, jamais de poussière de pixels roses.

## 2. La grammaire : quelle technique pour quoi

### Pixel art : montrer ce qui doit être compris tout de suite
- **Pour :** les objets (poubelle, télé, téléphone, pancarte), les personnes génériques (« un policier », « un manifestant », « un électeur »), les lieux schématiques (carte de France, pont, rue), les icônes (✓, ✗, ?, loupe, horloge), les interfaces, les graphiques (barres, jauges), les cartes de l'énigme, le lapin.
- **Comment :** contour encre de 1 pixel, intérieur `light`, ombres `ink2`/`grey`. Taille du pixel : 12 à 18 px pour un objet principal, 8 à 12 px pour une icône secondaire. Pas d'anticrénelage.
- **Apparition :** pop avec rebond (0,45 s), ou cases qui se révèlent dans le désordre (0,4 s), ou chute avec rebond pour une carte.
- **Jamais :** pour une personne réelle nommée (John Lewis, Nixon). Exception : la silhouette pixel « sans visage » quand on n'a pas d'image libre ou que la personne ne doit pas être reconnaissable.

### Pinceau : montrer le raisonnement
- **6 gestes seulement :**
  1. **souligner** un mot-clé ;
  2. **entourer** un chiffre ou un détail d'image ;
  3. **barrer** une fausse piste ;
  4. **relier** deux éléments (trait courbe) ;
  5. **flèche** vers ce qu'il faut regarder ;
  6. **accolade ou séparateur** pour grouper ou opposer.
- **Comment :** encre `ink`, trait avec pression (fin, épais, fin) et pinceau sec en fin de trait. Épaisseur de 14 à 24 px pour une annotation, jusqu'à 80 px pour un geste fort.
- **Ordre :** le trait se trace sur le mot de la voix qui le justifie (0,3 à 0,5 s).
- **Priorité :** le pinceau passe toujours au-dessus de la trame, avec un liseré papier de 6 px autour du trait pour rester lisible.
- **Jamais :** dessiner des objets ou du décor au pinceau. L'ensō (grand cercle) est réservé à un seul moment fort par vidéo, au maximum.

### Trame (points) : montrer le réel, et faire les passages
- **Pour :**
  - les photos réelles : archives, actu, personnes réelles ;
  - les pages d'études (la une, le titre, le graphique original) ;
  - le fond animé ;
  - deux transitions (« points qui couvrent » et « objet qui se défait en points »).
- **Jamais pour :**
  - une info qui doit être lue (chiffre, nom, date) ;
  - une carte de l'énigme à comprendre en moins d'une seconde ;
  - un objet que le pixel montre mieux.
- **Budget de trame :** à l'écran, au plus UN usage de trame à la fois.
  - Une photo tramée à l'écran : le fond tramé se coupe (papier seul).
  - Une transition trame en cours : rien d'autre en trame.
- **Réglages des photos** (testés sur téléphone) :

| Preset | Usage | Espacement des points | Taille max | Contraste |
|---|---|---|---|---|
| `portrait` | une personne, un visage | 6 px | 0,8 × espacement | +15 %, fond simplifié |
| `scene` | une rue, une foule, un pont | 8 px | 0,8 × espacement | normal |
| `doc` | page d'étude, une de journal | 4 px (léger) ou image nette avec grain | — | texte lisible obligatoire |
| `fond` | fond animé | 36 px, très clair | 8 px | — |

- **Règle de lisibilité :** une photo tramée doit se comprendre sur téléphone, à bout de bras, en une seconde, avec sa légende. Sinon on passe en preset plus fin, ou on recadre plus serré, ou on remplace par du pixel.
- **Une photo tramée a TOUJOURS :**
  - une légende pixel (`LIEU · ANNÉE` en VT323) ;
  - un cadre (carte pixel ou télé pixel) ;
  - si besoin, un geste au pinceau qui montre où regarder.

### Rouge : l'idée à retenir
- Le rouge apparaît **au moment où l'idée principale tombe** :
  - format énigme : le tampon « RÉPONSE », le mot-clé de la règle juste après, le ✓ de la bonne réponse ;
  - vulgarisation : l'étape clé du mécanisme ou la conséquence inattendue (entourée ou tamponnée) ;
  - démontage : le tampon « FAUX » ou « VRAI » sur l'idée reçue ;
  - récit : le tournant (une date, un mot).
- Une à deux apparitions par vidéo. Jamais avant le moment de la révélation.
- Le rouge est toujours porté **avec une forme** (tampon, entourage, mot), jamais par la couleur seule, pour rester lisible par les daltoniens.
- **Jamais :** feu, sang, alerte, décoration, mise en avant d'un mot en dehors de l'idée à retenir.

## 3. Palette (tokens)
| Rôle | Token | HEX | Remarque |
|---|---|---|---|
| Fond papier | paper | #EEE5D1 | + grain léger + vignette chaude |
| Encre (texte, contours, trame, pinceau) | ink | #1C1A18 | |
| Encre secondaire (ombres pixel) | ink2 | #4A4540 | |
| Gris (fumée, feu, détails) | grey | #6E655B | **jamais pour du texte** (contraste trop faible) |
| Intérieur clair des objets | light | #FBF6EA | |
| Ombre portée des cartes | shade | rgba(40,25,10,.18) | décalage de 14 px |
| Idée à retenir (réponse, révélation) | red | #C2352B | voir §2 |

Plans noirs : seulement au cœur d'une transition (moins de 0,3 s).

## 4. Typographie
| Police | Usage | Taille |
|---|---|---|
| **Playfair Display 700** | questions, phrases clés, la règle | 56–104 px (règle seule : 90–110 px) |
| **VT323 (pixel)** | dates, lieux, chiffres, légendes, labels, compteurs, mot « ÉNIGME » (format énigme) | 50–120 px ; chiffre géant jusqu'à 380 px |
| **Montserrat 800** | sous-titres continus | 52 px |
| **Montserrat 900** | uniquement dans le tampon rouge | — |

- Au plus 2 polices par plan, sous-titres en plus.
- Au plus 12 mots de texte « de plan » à l'écran, hors sous-titres.
- Apparition des phrases Playfair : mot par mot, du flou au net (0,3 s, décalage de 0,1 s). La règle peut aller plus lentement.

## 5. Sous-titres (obligatoires)
- Toute la voix off est sous-titrée : environ 85 % des gens regardent sans le son.
- Montserrat 800, 52 px, encre sur un bandeau papier `paper` à 92 % d'opacité, coins droits.
- Zone fixe : y 1300 → 1480, centrés, 2 lignes maximum, 4 à 7 mots par carton, synchronisés sur `words.py`.
- Le mot prononcé passe en gras souligné, jamais en couleur.
- Pas de sous-titre quand le même texte est déjà écrit en grand à l'écran (la question, la règle) : on évite le doublon.
- Le bandeau des sous-titres passe toujours au-dessus de la trame et du pinceau.

## 6. Hiérarchie et composition
- **Un seul point focal par plan.** On définit l'ordre de lecture : 1) ce qui bouge en premier, 2) le texte, 3) le détail.
- **Grille verticale :**

| Bande | y | Contenu |
|---|---|---|
| Titre | 200 → 440 | question ou titre |
| Scène | 460 → 1280 | élément principal |
| Sous-titres | 1300 → 1480 | sous-titres |
| Lapin | 1380 → 1520 | à gauche (x 90 → 300), il remonte au-dessus des sous-titres s'il y en a |

- **Zone sûre :** x 90 → 930, y 200 → 1520. Rien d'important dans la colonne de droite (x > 930) ni sous y 1520 : l'interface TikTok les couvre.
- **Deux camps :** deux cartes identiques (même taille, même cadrage, même hauteur). Seul le contenu change, et le pinceau relie ou oppose.

## 7. Fond
| Situation | Fond |
|---|---|
| Par défaut | papier + trame `fond` qui ondule (centre propre, points plus visibles sur les bords) |
| Photo tramée, page d'étude ou graphique à l'écran | papier seul |
| Question au spectateur / compte à rebours | papier + trame `fond` plus visible, ou labyrinthe vivant (réaction-diffusion), **jamais sous du texte**, 3 s au plus |
| Règle (phrase seule) | papier seul, rien d'autre |

## 8. Transitions (chacune a un sens)
| Transition | Sens | Quand l'utiliser | Durée |
|---|---|---|---|
| **Points qui couvrent puis découvrent** (`trameWipe`) | changement de chapitre | récit → preuve, passé → présent (USA → France) | 0,8 s (on change de plan à 0,4 s) |
| **Objet qui se défait en points et se recompose** (`morph`) | continuité | passer d'un élément à un élément lié : une carte qui devient la suivante, une photo qui devient un graphique, un objet qui devient sa version France | 0,6–0,9 s |
| **Balayage au pinceau** (`brushWipe`) | retournement | pivot, « Raté. », avant le tampon rouge, ou avant la conséquence inattendue | 0,9 s |
| **Carte qui se retourne** (`card flip`) | révéler | cacher puis montrer une info de l'énigme | 0,45 s |
| **Cut sec** | impact | sur un mot fort, après un silence | 0 s |

- **Budget :** au plus une transition « spectaculaire » (trame ou pinceau) toutes les 10 s, soit environ 4 à 6 par vidéo.
- Le balayage au pinceau est réservé au pivot, une à deux fois par vidéo.
- **Interdits :** whip latéral flou, zooms rapides gratuits, transitions empilées.

## 9. Rythme (une seule règle)
- Un **nouvel élément visuel** toutes les 1,5 à 3 s (annotation, pop, mot), déclenché par un mot de la voix (`M.at('mot')`).
- Un **changement de plan** toutes les 4 à 8 s.
- Une **info importante** reste lisible au moins 2 s **après** son apparition complète.
- Caméra quasi fixe, légère dérive de 100 → 103 % par plan. Petite secousse uniquement au tampon.

## 10. Le lapin
**Qui il est :** le spectateur qui cherche. Il ne parle pas et n'a pas de bulle de texte. Il **agit** dans la vidéo.

**Quand il apparaît, en format énigme (et seulement là) :**

| Moment | Ce qu'il fait | Expression |
|---|---|---|
| 1. Hook (0–3 s) | entre en sautant, regarde l'objet du hook | neutre |
| 2. Question au spectateur | réfléchit (bulle pixel « … » qui clignote), puis **propose la mauvaise réponse** : il lève une pancarte pixel avec la fausse piste, que le pinceau barre au moment du « Raté » | réfléchit |
| 3. Révélation | sursaut au tampon RÉPONSE, oreilles droites | surpris |
| 4. Fin (optionnel) | regarde le spectateur, ou pointe la zone commentaires | neutre |

**Dans les autres formats** (3 apparitions au plus) :

| Format | Moments du lapin |
|---|---|
| Vulgarisation | 1) hook : il subit le mécanisme (il scrolle, il clique) ; 2) au moment clé : il comprend (sursaut, oreilles droites) ; 3) fin : il fait le geste utile (ferme l'appli, regarde le spectateur) |
| Démontage | 1) il tient la pancarte de l'idée reçue ; 2) la pancarte est barrée ou tamponnée « FAUX » ; 3) fin (optionnel) |
| Récit | absent, ou seulement à la fin pour le retour au spectateur |
| Deux camps | il passe d'un camp à l'autre (pancarte A, puis B), sans jamais trancher |

- **Hors de ces moments, il n'est pas à l'écran.** Il sort en sautant hors champ, ou par un cut.
- **Sujets graves** (violence, blessés, morts, victimes) : il est absent pendant le passage grave. Sur une vidéo grave, il ne fait que les moments 2 et 3, en expression « sérieux » (oreilles basses, pas de saut).
- **Collisions :** s'il y a sous-titres, légende ou compteur dans sa zone, il remonte ou passe à droite (x 700 → 900), jamais par-dessus.
- **Sprites à avoir :** neutre, réfléchit, surpris, sérieux, avec pancarte. Il fait 13 px par pixel, et sa pancarte 10 px.
- **Gag récurrent** (signature, format énigme et démontage) : il propose toujours la mauvaise réponse en premier.

## 11. Le rituel de l'énigme (seulement quand le format est « énigme »)
1. **Hook :** objet pixel + question. Le mot « ÉNIGME » en VT323 est en haut pendant toute la phase de question, pour que le spectateur comprenne le jeu.
2. **Les indices :** cartes pixel ou photos tramées. **L'indice qui donne la clé est visible avant la réponse.** Il est discret mais présent, et la réponse le refera revoir.
3. **La question au spectateur :** « Écris ta réponse en commentaire » + compte à rebours pixel 3, 2, 1 (3 s). Le lapin réfléchit puis lève la fausse piste.
4. **La fausse piste :** le pinceau barre la pancarte (« Raté. »).
5. **Silence de 0,5 à 1 s**, puis balayage pinceau.
6. **Tampon rouge RÉPONSE** + secousse + lapin surpris.
7. **La règle :** phrase Playfair seule sur papier, mot-clé en rouge. C'est l'image à retenir.
8. **Preuves**, puis nuance, puis **retour à l'image du hook** (même cadrage).
9. **Rappel de la règle** en une ligne (le même visuel que le n° 7, en plus petit) avant la dernière question.

## 11 bis. Les autres formats
Ils n'ont ni « ÉNIGME » en haut, ni compte à rebours, ni tampon RÉPONSE.

**Vulgarisation (« comment ça marche »)**
1. **Hook :** une scène du quotidien en pixel (un téléphone, un fil d'actu) + la question en Playfair.
2. **Le mécanisme se construit à l'écran, étape par étape :**
   - une étape = un élément pixel qui pop, plus un geste au pinceau qui le relie au précédent ;
   - au plus 3 étapes, numérotées en VT323 ;
   - le schéma final reste à l'écran au moins 3 s pour qu'on puisse le lire en entier.
3. **L'analogie :** quand on en utilise une, elle est dessinée en pixel à côté du schéma et reliée au pinceau.
4. **La conséquence inattendue :** balayage pinceau, puis l'élément clé entouré ou tamponné en rouge.
5. **Les preuves :** l'étude ou le rapport en trame `doc`, puis le graphique en pixel.
6. **La fin :** retour au hook, en montrant ce qui a changé.

**Démontage**
1. L'idée reçue sur la pancarte du lapin, ou en Playfair.
2. D'où vient l'idée : une archive tramée et une date.
3. Ce que disent les sources : un chiffre en pixel et la source.
4. Le tampon rouge « FAUX », ou « À MOITIÉ VRAI » quand c'est nuancé.
5. Pourquoi l'idée survit : un schéma au pinceau.

**Récit**
- Les photos tramées du personnage et des lieux, avec des cartes `LIEU · ANNÉE` qui s'enchaînent (morph).
- Une frise au pinceau, qui se trace au fil de l'histoire.
- Le tournant en rouge.
- Peu de pixel, et pas de lapin.

**Deux camps**
- L'écran est coupé en deux colonnes identiques.
- Le meilleur argument de chaque camp s'affiche dans sa colonne (pixel + Playfair).
- Les données sont au centre (graphique pixel).
- Pas de rouge pour un camp : le rouge sert seulement à l'idée qui met tout le monde d'accord, s'il y en a une.

## 12. Types de contenu : traitement exact
| Contenu | Technique | Ce qu'on voit | Animation |
|---|---|---|---|
| Hook / question | pixel + Playfair | objet pixel au centre, question au-dessus (« ÉNIGME » en haut seulement en format énigme) | objet qui pop, question mot par mot, lapin qui entre |
| Récit d'un fait réel | pixel (carte) + trame (photo dans la carte) | carte pixel avec photo tramée + `LIEU · ANNÉE` | carte qui tombe, puis se retourne, puis photo qui se dessine en points |
| Personne réelle nommée | trame `portrait` | photo tramée dans un cadre + nom et âge en VT323 | points qui poussent depuis le visage ; entourage pinceau si besoin |
| Personne générique | pixel | sprite (policier, manifestant…) | pop |
| Deux camps | pixel (+ trame si fait réel) + pinceau | deux cartes identiques, trait de pinceau qui relie ou accolade qui oppose | cartes l'une après l'autre (décalage de 0,3 s) |
| Chiffre | pixel (VT323) + pinceau | compteur géant + unité + source en petit | le compteur défile (0,8 s) ; entouré au pinceau si c'est le chiffre clé |
| Étude / preuve | trame `doc` → pixel | 1) la une réelle de l'étude (titre, revue, année) ; 2) morph vers le graphique redessiné en pixel ; source en VT323 (« Wasow · APSR · 2020 ») | morph points ; les barres montent une par une ; la barre clé est entourée |
| Citation | Playfair + VT323 | citation entre guillemets + nom et date | mot par mot |
| Actu France | trame `scene` + pixel | photo d'actu tramée dans une télé pixel ou une carte + bandeau date ; les chiffres en VT323 (à l'écran, pas dits) | trameWipe en entrée (chapitre) |
| Question au spectateur | pixel + fond vivant | compte à rebours 3-2-1 géant, « Écris ta réponse », lapin qui réfléchit | voir §11 |
| Fausse piste | Playfair + pinceau | le mot (ou la pancarte du lapin) barré | geste « barrer » sur « Raté » |
| Révélation | pinceau + rouge | balayage, puis tampon RÉPONSE | voir §11 |
| Règle | Playfair (+ rouge) | phrase seule sur papier | lente, silence |
| Nuance / garde-fou | même image que plus tôt | retour au plan concerné, calme | aucun effet |
| Mécanisme / « comment ça marche » | pixel + pinceau | schéma qui se construit : éléments pixel numérotés, reliés par des flèches au pinceau | une étape par phrase de la voix ; schéma complet ≥ 3 s |
| Analogie | pixel | l'objet de l'analogie (ex. une bulle, un entonnoir) à côté du schéma, relié au pinceau | pop, puis trait qui relie |
| Définition d'un mot | Playfair + VT323 | le mot en grand, la définition courte en dessous | mot par mot |
| Avant / après | pixel | même cadrage, deux états du même objet | morph points entre les deux états |
| Chute / boucle | pixel | retour à l'objet du hook, même cadrage | lent zoom, dernière question |

## 13. Images réelles : le circuit
**Au moment du script**, Claude ajoute une section **« Images à fournir »**. Pour chaque image, elle donne :
- le n° de plan ;
- une description précise : « CRS de face, casque et bouclier, plan américain, photo nette, fond simple » ;
- le cadrage (vertical ou horizontal) et le preset de trame visé ;
- une piste de source : Wikimedia Commons, Library of Congress, archives du domaine public, banque libre, capture de l'étude elle-même ;
- un **plan B** si l'image est introuvable : silhouette pixel ou carte sans photo.

**Ce que fait Noam :** il dépose l'image brute dans `videos/Koan/<slug>/assets/raw/`, ou la version déjà passée dans Stochaster. Il note la source dans `sources.md`.

**Ce que fait Claude :**
1. recadre l'image ;
2. la convertit en trame avec le preset prévu ;
3. vérifie qu'elle est lisible ;
4. si elle n'est pas lisible : preset plus fin, recadrage, ou plan B.

**Droits et éthique :**
- Tramer une photo n'efface pas ses droits. On privilégie le domaine public et les licences libres. Une photo de presse (AFP, Reuters) ne s'utilise qu'avec un droit clair, sinon on passe au plan B.
- **Mineurs :** jamais identifiables (foule lointaine, trame forte, ou pixel).
- Pas de visage de victime en gros plan.
- Les manifestants ou policiers identifiables d'une actu récente passent en plan large ou en pixel.
- Une étude se cite par une capture courte de la une ou du graphique, avec auteurs, revue et année à l'écran.
- On ne fabrique jamais de faux document présenté comme réel. Une image reconstituée est marquée « illustration » en VT323.

## 14. Son
| Événement | Son |
|---|---|
| Pop pixel, carte qui se retourne | blip 8-bit doux / flip de carte |
| Geste au pinceau | frottement de pinceau sur papier |
| Transition trame | grain qui coule (sable) |
| Tampon RÉPONSE | thud sourd + froissement de papier |
| Compte à rebours | tick pixel |

Musique lo-fi ou ambient discrète, coupée net au silence avant la révélation. Voix off Gemini TTS (Velvet Anchor 3). Niveau final : -14 LUFS.

## 15. Signature, ouverture, cover
- **Pas de logo ni de sceau.** La chaîne se reconnaît au papier crème, au pixel noir, aux points, au tampon rouge et au lapin.
- **Ouverture** (0,4 s, identique à chaque vidéo) : la trame se retire depuis le centre et révèle le hook, avec toujours le même son de grain. Elle ne retarde jamais le hook.
- **Cover / première image** :
  - papier crème ;
  - l'objet pixel du hook en grand ;
  - 3 ou 4 mots en Playfair ;
  - **une seule touche rouge** (un « ? », un mot, un entourage) comme unique tache de couleur.
  
  La première image doit se lire figée.
- Plus tard, une fois le rythme tenu : numéros (« ÉNIGME #12 »), rubriques (« Contre-koan »).

## 15 bis. La boucle parfaite (vidéos courtes, moins de 90 s)
Demande de Noam : sur une vidéo courte, on ne doit pas voir la fin. La dernière image se raccorde à la première, et le spectateur se dit « ça a redémarré ? ». Le script prépare le raccord à la voix (`storytelling-tiktok` §10 bis : ligne « Boucle : … → … ») ; l'image et le son le terminent.

**À l'image :**
- **La dernière image = la première image** : même décor, même cadrage, même objet au même endroit, même état (le compteur affiche la même valeur, le lapin est à la même place, la même pose). Le dernier plan revient donc au décor du hook, au plus tard 1,5 s avant la fin.
- **Le mouvement continue à travers la coupe** : si la caméra dérive, si des nuages ou des passants bougent, ils sont au même endroit et vont dans le même sens à la dernière et à la première image. Pas d'arrêt sur image, pas de ralenti de fin.
- **L'ouverture devient le raccord** : la trame couvre l'écran sur les 0,2 dernières secondes, et la vidéo commence par la trame qui se retire (§15). La boucle passe donc par les points, sans image noire. Variante : un cut sec, si la dernière image et la première sont identiques au pixel près.
- **Interdits en fin de vidéo courte** : fondu au noir, fondu au papier, écran de fin, logo, « suis-moi », texte de conclusion qui reste à l'écran, lapin qui salue.
- Les sous-titres de la dernière phrase restent jusqu'à la toute dernière image (pas de blanc).

**Au son :**
- La voix s'arrête au plus 0,1 s avant la fin du fichier, et commence au plus 0,1 s après le début : pas de blanc audible au raccord.
- La musique boucle sur elle-même : longueur de la vidéo calée sur un nombre entier de mesures, ou la fin de la musique reprend la mesure du début (même accord, même tempo). **Jamais de cadence finale**, de coup de cymbale ou de note tenue qui conclut.
- Le son du grain de l'ouverture (§14) est coupé en deux : le début à la fin de la vidéo, la suite au début.
- Vérification : rendre `out/loop_check.mp4` = les 3 dernières secondes suivies des 3 premières, et le regarder. Si on sent la coupe, corriger.

## 16. Format obligatoire du découpage (dans chaque script)
Chaque script livré contient, après la voix off, ce tableau plan par plan :

| # | Temps | Voix off (phrase exacte) | Ce qu'on voit (point focal en gras) | Technique | Animation + mot déclencheur | Transition de sortie | Son | Lapin | Image à fournir |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 0:09–0:14 | « La première, c'est aux États-Unis, en 1965. » | **carte pixel 1965** qui se retourne : photo tramée du pont, légende `SELMA · 1965` | pixel + trame `scene` | carte qui tombe sur « première », se retourne sur « 1965 », points qui poussent | morph → carte 2 | flip + grain | absent | pont Edmund Pettus, 7 mars 1965, marcheurs face à la police (Library of Congress, domaine public) |

Puis la liste des **images à fournir** (§13), et la liste des **sprites nouveaux** à dessiner.

## 17. Production
- **Un dossier par vidéo :** `videos/Koan/<slug>/` avec `script.md`, `plans.json`, `assets/raw/`, `assets/trame/`, `voice/`, `out/`, `sources.md`.
- **Ordre de production :**
  1. script + découpage, puis Conseil des Padawans ;
  2. images ;
  3. voix ;
  4. `words.py` (cues) ;
  5. `plans.json` ;
  6. aperçu 540p (`--preview`) ;
  7. corrections ;
  8. rendu final ;
  9. test sur téléphone sans le son.
- **Composants du moteur** (`studio/lib/`, à consolider dans `koan.js`), sans en créer de nouveau en cours de vidéo :
  - pixel : `sprite`, `card`, `pixText`, `counter`, `pixFrame`, `tv` ;
  - pinceau : `brush` (gestes : souligner, entourer, barrer, relier, flèche, accolade) ;
  - trame : `photo` (presets), `trameWipe`, `morph`, `bgTrame`, `RD` ;
  - rouge : `stamp` ;
  - texte : `inkWords`, `subtitles` ;
  - lapin : `bunny(expr)`.
- **Durées types :**

| Plan | Durée |
|---|---|
| Hook | 3 s |
| Carte | 4–5 s |
| Chiffre | 3 s |
| Question + compte à rebours | 5 s |
| Révélation | 3 s |
| Règle | 4 s |
| Boucle | 3 s |

- **Après 3 vidéos :** regarder la rétention (le moment où les gens décrochent) et ajuster la bible avec des données.

## 18. Interdits (récap)
- Sceau « KOAN », logo ou filigrane à l'écran.
- Rose, glow, fond gris ou anthracite, poussière de pixels roses.
- Trame sur une info à lire, ou deux usages de trame en même temps.
- Rouge en dehors du moment de l'idée à retenir.
- Ensō permanent ou cercle obligatoire au centre.
- Gris `grey` pour du texte.
- Lapin hors de ses moments, lapin joyeux sur un passage grave.
- Image de mineur identifiable, faux document, photo de presse sans droit.

## 19. Checklist avant rendu (vérifiable)
- [ ] Chaque plan du découpage a une technique, et elle correspond au tableau §12.
- [ ] Le rouge n'apparaît qu'au moment de l'idée à retenir (vérifier chaque `red` dans le code).
- [ ] Jamais deux usages de trame en même temps.
- [ ] Chaque photo tramée a une légende `LIEU · ANNÉE` et passe le test du téléphone.
- [ ] Les sous-titres couvrent toute la voix, dans la bande y 1300 → 1480.
- [ ] Rien d'important hors de x 90 → 930, y 200 → 1520.
- [ ] Le lapin n'apparaît qu'aux moments prévus pour ce format (§10), et pas sur les passages graves.
- [ ] Le rituel suit le format choisi (§11 ou §11 bis), sans énigme forcée.
- [ ] Chaque info importante reste au moins 2 s après son apparition.
- [ ] Au plus une transition spectaculaire toutes les 10 s.
- [ ] Toutes les sources des images et des études sont notées dans `sources.md`.
- [ ] Vidéo courte : dernière image = première image (décor, cadrage, état), pas de fondu ni d'écran de fin, son sans blanc au raccord, musique sans cadence finale, `out/loop_check.mp4` regardé (§15 bis).