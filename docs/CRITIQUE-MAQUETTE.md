# Critique de la maquette UX (Impeccable + Taste Skill, 20/10/2026)

**Méthode.** Deux évaluations séparées, qui ne se sont pas vues l'une l'autre :
- **A, la revue de design** : grille d'Impeccable (heuristiques de Nielsen, charge cognitive, personas) et règles des écrans d'application de Taste Skill.
- **B, les mesures dans un vrai navigateur.** Le détecteur d'Impeccable n'a **pas** été lancé, car son lanceur télécharge puis exécute un programme. Il a été remplacé par les outils locaux de Taste Skill (`lint.mjs` et `inspect.mjs --app`, sans réseau) et par des mesures Playwright.

Cible : `ui/maquette/index.html` (8 écrans), à 1920, 1440 et 1366 px de large. Mode : *Operate* (un logiciel dans lequel on travaille).

## Note de santé : 23/40 (« acceptable »)

| # | Heuristique | Note | Problème clé |
|---|---|---|---|
| 1 | Voir où en est le système | 3 | Tâche dans la barre et carte « Appliqué » visibles ; mais la timeline n'a ni règle, ni tête de lecture |
| 2 | Parler la langue de l'utilisateur | 3 | Du jargon : `scenes/s01_hook.js +14 −6`, « nappe −31 dB », « Opus · effort moyen » |
| 3 | Contrôle et liberté | 2 | On modifie une vidéo marquée « ✓ Publiée », sans V1 / V2 visible |
| 4 | Cohérence | 2 | Le jaune sert à tout ; deux styles d'onglets |
| 5 | Prévenir les erreurs | 2 | « Fabriquer la V2 » et « Exporter » ne disent ni la durée, ni le coût ; Script et Publier ne sont pas dessinés |
| 6 | Reconnaître plutôt que se souvenir | 3 | Cible affichée, mais les variantes A/B/C sont des lettres, sans image |
| 7 | Rapidité pour l'habitué | 2 | « Ctrl K » n'est pas un vrai bouton ; pas de J K L, de I / O ni de zoom sur la timeline |
| 8 | Sobriété | 3 | Calme ; la page Idées empile tout |
| 9 | Se remettre d'une erreur | 1 | Aucun état d'échec dessiné (rendu raté, Claude en erreur, problème grave) |
| 10 | Aide | 2 | De bonnes notes en contexte, rien d'autre |

## Le verdict

- **La structure est propre au produit**, et c'est ce qui compte en mode *Operate* :
  - la portée de l'IA toujours visible ;
  - la couverture vérifiée sur ta grille TikTok et en miniature YouTube à taille réelle ;
  - le hook sur la courbe de rétention ;
  - la zone sûre de ton iPhone ;
  - les vraies données.
- **L'habillage, lui, est générique** (fond noir, accent jaune, pastilles).
- **Le plus gros défaut** : l'image de la vidéo n'est l'élément principal de l'écran que sur Couverture. Ailleurs, on ne la voit pas assez.

## Ce qui marche

1. La **portée visible avant l'envoi** (Sélection / Plan 2 / Toute la vidéo). Le champ la reprend : « Que faut-il changer au plan 2 ? ».
2. **Résultats** suit le fil observation → preuve → proposition (« −42 % dès la 1re seconde » → « T'as peur. » en premier mot).
3. **Tout ce qui concerne une vidéo est dans son projet**, en onglets. Les chapitres et la recherche de plans règlent la limite des 111 plans de Creatorize.

## Problèmes prioritaires

1. **[P1] Une vidéo publiée se modifie sur place.**
   - L'en-tête dit « ✓ Publiée » pendant que Claude modifie la scène.
   - → Une fois publiée, la V1 est **figée** (bandeau « V1 publiée ») ; le bouton principal devient « Créer la V2 » ; un sélecteur V1 / V2 à côté du titre.
2. **[P1] « Projets » ne mène à aucune liste.**
   - Le lien ouvre directement un projet : pas de liste, pas de « Nouveau projet ».
   - → Une page Projets : miniature, titre, état (brouillon / prête / publiée / V2), plateforme, date, et « Nouveau projet ». Un fil d'Ariane « Projets › T'as pas la flemme ».
3. **[P1] Le jaune fait tous les métiers.**
   - Il sert au bouton principal, aux onglets actifs, à la portée, à la variante, au focus, au badge.
   - Résultat : deux boutons jaunes dans l'éditeur, sur Idées et sur Bienvenue.
   - → Jaune plein = **un seul** bouton par écran. Les éléments sélectionnés prennent un fond gris clair et un texte blanc. Le focus devient blanc ou bleu.
4. **[P1] La timeline est un bandeau, pas un outil.**
   - Pas de règle des secondes ni de tête de lecture ; libellés coupés (« 1 « T' », « wh ») ; mots en 10 px illisibles.
   - → La barre de transport (lecture, image par image, J K L, zoom) passe entre l'aperçu et la timeline. Ajouter une règle et une tête de lecture sur toutes les pistes, garder des pistes de 28 px ou plus, et le numéro du plan seul quand c'est étroit. **C'est l'endroit où ira ta reconstruction de CapCut.**
5. **[P2] On ne voit pas les images là où il faut juger.**
   - La carte « Appliqué » n'a ni avant / après, ni coût.
   - Dans la grille TikTok, la couverture apparaît sans son titre.
   - Les variantes A/B/C sont des lettres.
   - L'étiquette « zone sûre » est illisible.
   - → Deux vignettes avant / après et le coût sur la carte ; la couverture composée dans la grille ; 3 mini-vignettes pour les variantes ; l'étiquette sur un fond opaque.

## Mesures (évaluation B) : vrais défauts à corriger

- **Couverture** : la colonne d'images déborde (jusqu'à y = 1352 pour 768 de haut), et toute la page défile au lieu de la seule colonne.
- L'en-tête du projet mesure 62 px, mais le calcul de la page compte 59 px : une barre de défilement inutile apparaît (Vidéo, Couverture).
- **Focus invisible** sur deux champs : la saisie de l'Accueil et l'atelier des hooks (`outline: none`, sans remplacement).
- **Contraste** : les bruitages de la timeline (« whoosh », « pop ») n'ont que 3,47:1.
- **Texte de 10 px** : les mots de la timeline et les vues de la grille TikTok.
- **Petites cibles** : les boutons de portée font 28 px de haut ; le champ des hooks fait 20 px.
- Aucun défilement horizontal, une seule police, focus jaune net partout ailleurs.

Faux positifs, propres aux pages vitrine (les mesures les signalent, mais ils ne valent pas pour un logiciel) :
- les filets de 1 px entre panneaux ;
- la barre de l'onglet actif ;
- les hachures de la colonne des boutons TikTok ;
- l'ombre du titre posé sur la vidéo ;
- les « vides de hero ».

## Personas

- **Toi (créateur seul, tu juges sur les images)** :
  - tu ne peux pas juger une retouche de Claude sans image avant / après ;
  - « Annuler » est un petit lien bleu ;
  - la puce « 9:16 » reste affichée en mode 16:9. Il faut que la puce **soit** la bascule.
- **L'habitué** : Ctrl K n'est pas un vrai bouton ; aucun raccourci affiché ; 12 boutons « Analyser » au lieu de lignes cliquables ; colonnes non triables.
- **Un nouveau créateur (la vision)** : Bienvenue lui demande de choisir entre Claude Code, Codex et une clé API sans lui dire ce que ça change. « DA », « Construire », « V2 » ne sont expliqués nulle part.

## Remarques plus petites

- **Moyenne trompeuse.** La moyenne Koan de 27 k vues est tirée par une seule vidéo à 184 k ; la médiane est d'environ 4,5 k. Avec la moyenne, presque toute nouvelle vidéo sort en rouge : **comparer à la médiane**.
- **À 1366 px** : titre coupé, puces masquées, textes de la barre qui passent à la ligne. Il faut une barre réduite aux icônes sous 1440 px.
- **Bibliothèque** : la grille est plate, sans familles, statuts ni recherche. La page DA actuelle les a : c'est un recul.
- **Idées** : les onglets ne filtrent rien ; les exemples de hooks sont en anglais sans traduction ; « 3,4 M » n'est pas expliqué (vues médianes de quoi, sur quelle période ?).
- **Artefacts de maquette** à ne pas reprendre : l'image « B · Technicolor » dans l'aperçu, la note du pipeline qui se lit comme du contenu, les images d'autres vidéos dans Couverture.

## Questions de fond

1. Une vidéo publiée doit-elle encore avoir un onglet Vidéo modifiable, ou la publication fige-t-elle tout, la V2 étant le seul chemin ?
2. L'Accueil doit-il s'ouvrir sur une question vide, ou directement sur la réponse : « ta V2 est prête », côte à côte avec la V1 ?
3. Si l'IA est au centre, l'avant / après d'une retouche ne devrait-il pas être grand, juste après l'aperçu ?

## Maquette v2 (21/10) : ce qui a été corrigé

Références prises dans **Inspo** (MCP de Nutlope : vraies pages de sites, ajouté à Claude Code pour ce projet). Seulement des sites vitrine, donc utile pour le style, pas pour la disposition. Diffusion Studio (un éditeur vidéo et motion design), Krea et Creatorize font pareil : fond presque noir, une seule police sans empattement, **bouton principal blanc**, la couleur réservée à un usage. Mobbin n'était pas encore visible dans cette session.

1. **V1 figée, V2 à part.** Un sélecteur de version est à côté du titre.
   - En V1 publiée : un bandeau « figée », Claude désactivé, et le seul bouton principal est « Créer la V2 ».
   - En V2 : un brouillon modifiable, « Exporter la V2 ».
2. **Page Projets** : liste avec miniature, chaîne, format, état, date, et le bouton « Nouveau projet ». Un fil d'Ariane « Projets › titre » en haut de chaque projet.
3. **Couleurs** :
   - blanc = l'unique action principale de l'écran ;
   - jaune = « maintenant » (tête de lecture, mot en cours, rendu qui tourne) ;
   - sélection = fond gris clair + contour blanc ;
   - focus = blanc.
4. **Timeline** : une barre de transport (précédent, lecture, suivant, temps), la bascule 9:16 / 16:9 et le zoom (« 10 s visibles »). Ajout d'une règle des secondes et d'une tête de lecture sur toutes les pistes. Les pistes font 36 px ; seul le numéro du plan reste quand c'est étroit, avec le titre complet au survol.
5. **Carte « Appliqué »** : vignettes avant / après, coût (« compris dans ton abonnement »), gros bouton « Annuler ce changement ». Le chemin de fichier a disparu.
6. **Couverture** :
   - colonne d'images qui défile seule ;
   - barre de texte (police, taille, position, couleur) ;
   - variantes en mini-couvertures ;
   - couverture composée dans la grille TikTok ;
   - étiquette de zone sûre sur fond opaque.
7. **État d'erreur dessiné** : un rendu échoué, en tête de l'Accueil et dans les tâches, avec « Voir le plan 3 » et « Demander à Claude de corriger ».
8. **Médiane** à la place de la moyenne (Résultats, Statistiques).
9. **Les autres écrans** :
   - **Statistiques** : lignes cliquables et tri ;
   - **Idées** : les onglets filtrent vraiment, les exemples de hooks sont en français d'abord, « vues médianes » est expliqué, et « Recherches » montre ce qu'on y trouvera quand c'est vide ;
   - **Bibliothèque** : familles, recherche, statut ;
   - **Bienvenue** : un seul bouton principal, et ce que change chaque choix d'IA ;
   - **Publier** : la liste de contrôle, et « publiée » seulement après avoir collé le lien.
10. **Défauts mesurés** :
    - plus de débordement ni de barre de défilement inutile ;
    - focus visible sur toutes les saisies ;
    - bruitages en texte sombre sur orange ;
    - plus de texte sous 12 px ;
    - boutons de portée de 32 px ;
    - le volet Claude à 16 px du bord.

Inspecteur de Taste (`--app`) après correction : il reste des points, que je défends.
- Les échecs à 390 et 768 px sont des tailles téléphone et tablette, or le studio est un logiciel de bureau.
- Les « bordures fortes » sont les contours blancs de la sélection et de l'erreur.
- Les ombres de texte sont celles du titre de la couverture, c'est-à-dire le contenu de la vidéo.
- 47 % du texte est entre 12 et 13 px (sous-lignes, timeline), ce que la règle des écrans d'application admet.

Trouvé au passage dans le vrai studio : le dossier `.gpu` (le verrou de la carte graphique) apparaissait dans la liste des projets. Corrigé (commit d6aff54).

## Ajout (21/10) : la barre de gauche se range

Demande de Noam, comme dans Creatorize : un bouton en haut de la barre (ou **Ctrl B**) la réduit à une colonne d'icônes de 60 px.
- Dans un projet, elle est rangée d'office, pour laisser la place à l'éditeur (+160 px pour l'aperçu et la timeline). Ailleurs, elle est dépliée.
- Si tu la ranges ou la déplies à la main, ton choix est retenu.
- Barre rangée, chaque icône garde son nom au survol, le « 3 » de l'Accueil reste visible, et les tâches deviennent deux pastilles : jaune = en cours, rouge = échec.
