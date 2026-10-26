# Feuille de route après la phase 7 (demandes de Noam, 20/10/2026)

**Vision d'ensemble (20/10 soir) : `docs/VISION-PRODUIT.md`** (tout-en-un pour créateurs, discussion IA au centre, skills, niches, retours TikTok → V2). Les étapes ci-dessous en font partie.

Ordre proposé ; une étape à la fois, démonstration à la fin de chacune, puis on attend le retour de Noam.

## A. Finir ce qui reste des phases 1-7
1. ✓ (20/10) **Boucler script → vidéo** : boutons Voix (Gemini TTS), Nettoyer, Caler (mots), Mixer (−14 LUFS, mots couverts) dans l'éditeur.
2. **Construction en équipe** : le correctif `controler.mjs` a tourné en vrai le 20/10 (essai-boucle-son, 4 sections, Sonnet « Vérifié », 8 min, 0 problème grave). Reste : l'à-coup de caméra de la démo phase 5, et des défauts que le contrôle ne voit pas (étiquette « MIL #1 » tronquée, « 24  H » mal espacé, voiture coupée par le bord).
3. **Essayer un style copié en vrai** : une courte vidéo construite avec `auto-3d`.
4. **Koan dans le nouveau moteur** (aujourd'hui seulement en lecture depuis tiktok-motion).
5. Petits manques : réglages en direct + « figer », atelier de couvertures, musique sous la voix (non mesurée).

## B. Nouvelles demandes
6. ✓ (20/10) **Bibliothèque de DA** : Noam donne beaucoup de vidéos de créateurs (France, Angleterre, États-Unis) ; chaque DA est copiée (phase 7), notée, rangée avec ses vidéos d'origine, ses règles et des exemples. On choisit une DA à la création d'un projet.
7. **Suivi de chaque projet** : journal lisible de ce qui a été fait (demandes, DA utilisée, versions, rendus, publication).
8. **Retours → amélioration** : retours des personnes (commentaires, avis de Noam, statistiques TikTok : rétention, vues) rattachés au projet et à sa DA ; ce qui marche ou non devient des règles de script et de DA.
9. **Codex pour la recherche** dans le studio (recherches techniques et de sujet par GPT, vérifiées ensuite).
10. ✓ (20/10, première version) **Timeline façon CapCut** : en grand (⬍), limites des plans, mots (déplacer, rogner), sons (déplacer, rogner la fin) à la souris, aimant (🧲, Alt = sans), Ctrl Z, zoom. Pas encore : couper un plan en deux, déplacer un plan entier, pistes de vraies vidéos (voir `docs/ETUDE-CAPCUT.md` §6, à décider avec Noam).
11. **Application légère** : fenêtre à part sans barre de navigateur. D'abord la plus légère possible (Edge en mode application, presque rien en mémoire) ; Electron seulement si ça ne suffit pas. Jamais Tauri.

## B bis. Ajouté le 20/10
13. ✓ **Copier des DA depuis des liens TikTok** (lot de 75 liens, 47 DA) + page Avancement + partage en lecture seule (`npm run partager`).
14. ✓ (20/10) **Idées de niche** dans le studio (page `#/niches`, à partir de `_lots/<date>/niches.json`).
16. **Le cœur : skills, outils (MCP) et équipe d'agents** (`docs/SYSTEME-SKILLS.md`, demandé le 21/10 : « le cœur du truc »). ✓ (22/10) Étape 1, le catalogue de skills et l'aiguillage. Ensuite : une recherche par métier (bonnes pratiques et outils GitHub, une skill chacun), les rôles en fichiers et les paquets, les genres (court viral, YouTube : documentaire, fiction, vulgarisation…), les réglages (mode, ton, budget), le serveur MCP, la page « Ce que sait ton IA ».
15. Pistes GitHub à essayer : `RenderPixelatedPass` (pixel art 3D), pmndrs/postprocessing, Anime.js, Troika, claude-pxl (sprites pixel) — voir `docs/RECHERCHE-GITHUB.md`.

## C. Plus tard
12. WebGPU / TSL (après vérification sur la RTX).

## D. Les fonctions de CapCut dans le studio (demandé le 21/10)
Base : `docs/capcut/annexe-timeline.md` (la bible, vérifiée dans le code de CapCut) et `docs/capcut/verifie/` (pseudo-algorithmes). On réécrit tout avec notre propre code, on ne copie jamais celui de CapCut.
16. **Moteur de montage à part, sans écran**, avec un test par règle de la bible et des tests d'actions au hasard (objectif : aucun bug). La timeline du studio est ensuite branchée dessus.
17. **Essai d'un moteur de rendu sans navigateur**, au moment de cette transition : Deno (ou Node, ou Bun) + WebGPU + Three.js (WebGPURenderer), sans Chrome. On compare avec le rendu actuel (Playwright) sur une vidéo existante : vitesse, mémoire, images identiques (`verif-pixels.mjs`). Deux inconnues : Three.js en WebGPU hors navigateur, et le dessin des textes et sous-titres sans canvas 2D. Si l'essai gagne, l'export passe dessus. Sinon, on garde l'existant. L'interface reste dans un moteur de navigateur (Electron pour la distribution).
