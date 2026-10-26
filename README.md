# Studio vidéo

Un logiciel local qui fabrique des TikToks de motion design **en code**. Les scènes sont écrites en JavaScript avec Three.js, rendues image par image par Chromium (Playwright), puis encodées avec ffmpeg. Une équipe d'agents Claude Code (directeur, constructeurs, correcteurs, polisseur) écrit les scènes à partir d'une voix off.

Partagé tel quel, pour un essai : c'est un projet personnel en cours, pas un produit fini.

**Si tu donnes ce dépôt à une IA, dis-lui de lire d'abord [`GUIDE-POUR-TON-IA.md`](GUIDE-POUR-TON-IA.md)** : ce qui marche, ce qui n'est pas fini, et comment l'adapter (vidéos de mode, b-roll, copie du style d'un créateur). Les skills et les 86 DA en texte sont dans `partage/`.

## Ce qu'il faut sur la machine
- **Windows** : le studio a été fait et testé sous Windows 10, avec une RTX 3060.
- **Node.js 22 ou plus**, puis `npm install` et `npx playwright install chromium`.
- **ffmpeg** et **ffprobe** dans le PATH.
- **Claude Code** (`claude`) connecté : la discussion et l'équipe d'agents passent par `claude -p`.
- Pour le son, en option : Python 3 avec `numpy`, `soundfile`, `librosa` et `openai-whisper`, plus une clé `GEMINI_API_KEY` **en variable d'environnement** (jamais dans un fichier) pour la voix.

## Lancer
```
npm install
npx playwright install chromium
npm start -- <dossier d'un projet>      # puis http://localhost:5170
```
Autres commandes : `node render.mjs <projet>` (rendu), `node check.mjs <projet>` (contrôles automatiques) et `node lib/skills.mjs` (fabrique le plugin de skills). Tout est décrit dans `CLAUDE.md`.

## Ce qui n'est PAS dans ce dépôt (et pourquoi certaines pages seront vides)
Le studio s'appuie sur des dossiers du poste d'origine, avec des chemins écrits en dur :
- `C:/claude/tiktok-motion` : les anciens projets, l'ancien moteur et des skills ;
- `C:/claude/studio-projets` : les projets du studio, la bibliothèque 3D, les DA copiées et le plugin de skills ;
- `C:/tiktok/chat/sfx` : la sonothèque ;
- `C:/claude/tiktok-tracker` : la base de statistiques TikTok.

Sans eux, le studio démarre, mais les pages Projets, Bibliothèque, DA, Statistiques et Sons sont vides. Le moteur des nouveaux projets (`moteur/`), les contrôles, les rôles des agents (`roles/`), les genres (`genres/`) et les skills écrites ici (`skills/`) sont bien inclus.

## Où lire
- `CLAUDE.md` : l'état complet, phase par phase, avec les décisions prises.
- `docs/SYSTEME-SKILLS.md` : le système de skills et d'agents.
- `docs/CAHIER-DES-CHARGES-LOGICIEL.md` : le cahier des charges.
