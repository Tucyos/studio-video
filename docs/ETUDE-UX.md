# Étude UX du studio (20/10/2026)

Demande de Noam : « une UX vraiment propre, **plus pratique que belle** ; celle de Creatorize est pas mal ; un onglet pour les couvertures et les miniatures, à partir des images des vidéos ; TikTok **et YouTube** ».

Maquette cliquable : `ui/maquette/index.html`, servie par le studio sur `http://localhost:5170/__studio/maquette/index.html`.
- Rien n'y est branché. Elle affiche tes vraies données, en lecture seule : statistiques et rétention de Koan, DA, niches.
- Captures : `out/maquette/*.png`, en 1920×1080 et 1366×768.

## Sur quoi elle s'appuie

1. **L'interface de Creatorize** : les 37 images de son cours (`tiktok-motion/recherches/creatorize/frames/haiku_frames_cours.md`). C'est la seule source fiable sur Creatorize : Codex n'a trouvé aucune doc publique de ses écrans.
2. **Les règles d'UX du skill « UI UX Pro Max »** (99 règles, classées par priorité).
   - Il est sur ton PC, mais désactivé (`~/.claude/skills-off/`), et sa base de données est faite de liens cassés : seules ses règles sont lisibles.
   - **Taste Skill et Impeccable ne sont pas installés.** Ils n'ont pas servi ici.
3. **Une recherche Codex sur 16 outils** : CapCut, Descript, Captions, VEED, Runway, Canva, Opus Clip, Submagic, YouTube Studio, TikTok Studio, vidIQ, TubeBuddy, Pikzels, ThumbnailTest… Docs officielles et avis d'utilisateurs.
   - Vérifiée par sondage : Captions (cliquer un élément de la timeline l'attache à la demande, Maj pour plusieurs, on continue à travailler pendant que l'IA traite) et YouTube (l'onglet Inspiration est retiré depuis août 2026 au profit d'« Ask Studio »).
4. **L'audit chiffré du studio actuel** (ci-dessous).

## Ce qui ne va pas aujourd'hui (chiffres)

| Problème | Chiffre | Règle |
|---|---|---|
| Trop d'entrées dans la barre de gauche, au même niveau | 14 entrées | Navigation : 5 entrées au plus au premier niveau |
| Icônes en emoji (🎵 📋 ◫ 🎥…) | partout | « pas d'emoji comme icônes », un seul jeu d'icônes |
| Texte trop petit | 24 × 11 px, 5 × 10 px | 12 px au minimum, 13-14 px pour lire |
| Boutons-icônes sans texte, compris seulement au survol | 23 | Ne jamais dépendre du survol ; libellé ou aide visible |
| Fenêtres par-dessus (dialogues) | 9 | Préférer des onglets ou des panneaux du projet |
| Couleur « info » #6c6f77 sur le fond | contraste 3,7:1 | 4,5:1 au minimum pour le petit texte |
| Couvertures, résultats et publication hors du projet | — | Ce qui concerne une vidéo vit **dans** son projet |

## Ce qu'on garde de Creatorize (il a raison)

- **L'éditeur** :
  - les plans à gauche, l'aperçu au centre, Claude à droite, la timeline en bas ;
  - un plan = une phrase de la voix ;
  - le pipeline par étapes avec un bouton chacune.
- **Viser avant de demander** : on clique un objet de l'aperçu ou une plage de la timeline, puis la portée Sélection / Plan / Toute la vidéo.
- **La carte « Appliqué »** : durée, coût, fichiers +/−, avant / après, Voir, Annuler.
- Chercher partout avec **Ctrl K**.
- Un sélecteur d'espace en haut à gauche (chez nous : la **chaîne**).

## Les principes retenus (pratique avant beau)

1. **Cinq entrées principales** : Accueil, Projets, Idées, Bibliothèque, Statistiques. En bas, à part : tâches en cours, Connexions et réglages.
2. **Tout ce qui concerne une vidéo est dans son projet**, en onglets libres (pas des étapes imposées) : Vidéo · Script · Couverture · Publier · Résultats.
3. **Un seul bouton principal par écran** (jaune), à droite de l'en-tête du projet : Exporter, Enregistrer les couvertures, Fabriquer la V2.
4. **La cible de l'IA toujours affichée** avant l'envoi (« Plan 2 », « Sélection : texte “T'as peur” », « Toute la vidéo »). Sans sélection, c'est toute la vidéo. *(Erreur n° 1 des outils étudiés : laisser l'IA deviner.)*
5. **Les petites retouches ne passent pas par le chat** : durée, volume, texte, position se règlent à la main (timeline, champs). Le chat sert aux vrais changements.
6. **Les tâches longues sont visibles partout** (bas de la barre) : étape, cible, annuler ; on continue à travailler pendant ce temps. Pas de faux pourcentage.
7. **Tout s'annule** : Ctrl Z sur la timeline, « Annuler » sur chaque demande à Claude, et les versions du projet (git).
8. **Les chiffres sont toujours comparés** à la moyenne de la chaîne (▲ ▼), avec leur source. « Pas assez de données » est une vraie réponse.
9. **Une recommandation = observation + preuve + changement proposé** (ex. « −42 % dès la 1re seconde » sur la courbe → « T'as peur. » en premier mot). La V2 est une **nouvelle version** : la vidéo publiée reste intacte.
10. **« Publié » seulement quand c'est vrai** : la publication reste manuelle ; plus tard, on affichera le lien de la vidéo publiée.
11. **Couvertures depuis la vidéo**, vérifiées **en situation** : grille du profil TikTok, miniature YouTube à taille réelle sur téléphone, zone sûre mesurée sur ton iPhone. Plusieurs variantes (YouTube en teste 3, mais pas pour les Shorts).
12. **Lisible et constant** : texte de 13-14 px, un seul jeu d'icônes à traits, contraste ≥ 4,5:1, focus visible au clavier, chiffres alignés.

## Les écrans de la maquette

| Écran | Ce qu'il montre | Capture |
|---|---|---|
| **Accueil** | « Qu'est-ce qu'on fait pour Koan aujourd'hui ? » : la discussion avec l'IA (contexte affiché : chaîne, DA, niches, hooks, stats), des suggestions, puis **À faire**, trois lignes avec une action chacune. Ta vraie dernière vidéo (457 vues, 3 % vont au bout) mène à « Voir la V2 proposée ». | `accueil-*.png` |
| **Projet · Vidéo** | L'éditeur de Creatorize, plus deux choses : les **chapitres** et la recherche dans les plans (Creatorize montait à 111 plans), et la **bascule 9:16 / 16:9** pour YouTube. | `video-*.png`, `video-169-*.png` |
| **Projet · Couverture** | Les images de la vidéo à gauche, la toile au centre (titre éditable, zone sûre, colonne des boutons TikTok), et à droite : variantes A/B/C, sorties TikTok 1080×1920 / YouTube 1280×720 (recomposée, pas recadrée) / Instagram, ta grille de profil TikTok, la miniature YouTube à taille réelle. | `couverture-*.png` |
| **Projet · Résultats** | Vraies stats de « T'as pas la flemme. T'as peur. » comparées à la moyenne Koan, vraie courbe de rétention avec la zone du hook, propositions pour la V2 à cocher, « Fabriquer la V2 ». | `resultats-*.png` |
| **Idées** | Sujets prêts à lancer pour Koan, atelier des hooks (les formules qui marchent, avec un exemple réel), niches classées par vues. | `idees-*.png` |
| **Bibliothèque** | DA (86), modèles 3D, sons, règles retenues, copies en cours : tout ce qui se réutilise, au même endroit. | `bibliotheque-*.png` |
| **Statistiques** | Tableau par vidéo (vues, temps moyen, vont au bout, j'aime) + « Analyser », TikTok / YouTube. | `stats-*.png` |
| **Bienvenue** (plus tard) | 4 étapes passables : ton IA (abonnement Claude, ChatGPT/Codex, ou clé API), tes comptes, toi, ta niche. | `bienvenue-*.png` |

Codex proposait une autre barre : Accueil, Projets, **Publications**, **Résultats**, Bibliothèque. J'ai gardé **Idées** en premier niveau, parce que les niches et les hooks sont ce qui te distingue. Publication et résultats vont dans le projet, et le global dans Statistiques. À trancher avec toi.

## Les 10 erreurs à éviter (vues chez les autres)

1. Laisser l'IA deviner la portée de « change ça ».
2. Faire passer chaque petite retouche par le chat.
3. Faire payer les corrections sans montrer le coût.
4. Des changements sans retour arrière clair.
5. Un sablier pendant plusieurs minutes.
6. Découvrir une limite seulement à l'export.
7. Présenter un score comme une garantie de vues.
8. Une coupe qui désynchronise la voix, les sous-titres et les objets (Canva).
9. Annoncer « publié » trop tôt (TikTok Studio).
10. Un verdict statistique sans dire comment il est calculé.

Sources : rapport Codex du 20/10 (Descript, Captions, Canva, TikTok Studio, YouTube, NN/g, *Guidelines for Human-AI Interaction*, CHI 2019).

## Questions pour Noam

1. La barre : **Idées** en premier niveau (ma proposition), ou **Publications + Résultats** (celle de Codex) ?
2. L'accueil en « discussion d'abord » te va, ou tu préfères arriver directement sur tes projets ?
3. J'installe **Taste Skill** et **Impeccable** (GitHub, MIT et Apache-2.0) pour une passe de critique avant de coder la vraie interface ?

## Ensuite (après ton retour)

- Passer la vraie interface du studio sur ce modèle, écran par écran, sans casser l'éditeur.
- L'onglet Couverture pour de vrai : `render.mjs --snap` pour les images, composition 9:16 et 16:9.
- Le style visuel final, une fois la structure validée.
