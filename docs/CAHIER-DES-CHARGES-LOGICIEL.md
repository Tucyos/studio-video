# Cahier des charges : le « studio » vidéo de Noam (équivalent maison de Creatorize)

Rédigé le 19/10/2026, à la fin de l'étude de Creatorize. **À lire en premier par la session qui construit le logiciel, dans son nouveau dossier.**

Répondre en français, de façon concise. Noam n'est pas développeur : il juge sur les vidéos et l'interface, pas sur le code.

---

## 0. Les sources à lire avant de coder (dans `C:\claude\tiktok-motion\`)

| Quoi | Où |
|---|---|
| L'étude de Creatorize (architecture, chaîne, écarts, feuille de route) | `recherches/creatorize/SYNTHESE.md` (surtout §1, §2, §3, §4, §5 ter) |
| Le brief du compte auto (studio, qualité, vitesse, assets, son) | `videos/Automobile/IDEES-MOTEUR.md` |
| Le moteur auto le plus abouti | `videos/Automobile/le-mans-66/` : `lib/core.js`, `post.js`, `d2.js`, `motion.js`, `perso.js`, `render.mjs`, `snap.mjs`, `outils/traj.mjs`, `outils/mix.py`, `outils/trim_silence.py`, `outils/align.py` |
| Le moteur Koan | `studio/` : `render.mjs`, `snap.mjs`, `lib/*.js`, `words.py`, `audio.py`, `music.py` |
| Les méthodes écrites (à transformer en documents de référence) | `.claude/skills/` : `motion-engine`, `realisateur-koan`, `da-koan`, `da-auto`, `sound-design`, `storytelling-tiktok`, `hook-koan` |
| Les captures de l'interface Creatorize (modèle visuel) | `recherches/creatorize/frames/cours/*.jpg`, en particulier `c_044m15.jpg`, `c_045m30.jpg`, `c_067m45.jpg` |

**On ne déplace ni ne modifie rien dans `tiktok-motion`.** Le nouveau projet copie ce dont il a besoin, puis sait ouvrir un projet vidéo existant.

---

## 1. Décisions déjà prises (ne pas rediscuter)

- **Pas de Rust.** Le goulot d'étranglement, c'est la carte graphique, la lecture des pixels et l'encodage, pas le langage.
- **Les scènes restent en JavaScript + Three.js 0.186.1** (la version de tous les projets actuels). C'est ce que Claude écrit le mieux, et Playwright sait le rendre.
- **L'interface est une page web locale**, servie par Node (`npm start`, puis navigateur sur `localhost`). Electron plus tard seulement si besoin, et pas Tauri : Electron garde le même Chromium que l'export.
- **Moteur de rendu : WebGL pour l'instant** (« voie A » du brief auto). Le passage à WebGPU/TSL vient plus tard : la conversion des shaders maison est faisable, mais elle n'est pas prioritaire.
- **Tout est une fonction pure du temps T** : aucun état d'une image à l'autre, aléatoire avec graine (`hash`, jamais `Math.random`), coupes calées sur la grille des images (`Math.round(t*30)/30`).
- **Format** : 1080×1920 (9:16) par défaut, 30 i/s ; 16:9 possible.
- **Clés** : `GEMINI_API_KEY`, `FREESOUND_API_KEY` dans les variables d'environnement Windows, **jamais dans un fichier**. Aucune donnée perso (e-mail, nom) dans les requêtes réseau : Creatorize a fait cette erreur.
- **Images réelles** : sources libres (Wikimedia, CC0, CC-BY), crédit conservé. Pas de « c'est du fair use ».
- **Pas de mise en ligne automatique** sur TikTok ou YouTube. Pas de « routines » nocturnes.

---

## 2. Ce que fait le logiciel, en une phrase

Un projet vidéo = un dossier. Le logiciel affiche une **timeline** avec l'aperçu en temps réel, enchaîne les étapes (voix → calage → storyboard → scènes → contrôles → son → export), **fait construire les scènes par Claude Code** (plusieurs agents en parallèle) et vérifie tout seul ce qui cloche avant que Noam regarde.

---

## 3. Structure d'un projet vidéo

```
<projet>/
  project.json        format, fps, durée, style, liste des plans {id, t0, t1, fichier}
  script.md           texte de la voix
  sources.json        faits sourcés (source, crédibilité, citation/conclusion)
  audio/voice.wav     voix brute → audio/voice_clean.wav
  audio/words.json    mots calés [{w, start, end}]
  storyboard.md       écrit par le directeur
  constantes.md       éléments récurrents (personnages, objets, lieux)
  scenes/sNN_nom.js   un fichier par section, exporte build(kit) → {update(t), dispose()}
  cues.json           bruitages {t, son, gain}
  assets/             img/, models/*.glb, manifest.json, credits.json
  qa/                 rapports de contrôle + images
  out/                rendus
```

Le logiciel doit aussi savoir **ouvrir un projet existant** de `tiktok-motion` (au minimum `videos/Automobile/le-mans-66`) sans le casser, quitte à passer par un petit adaptateur.

---

## 4. Les briques, dans l'ordre de construction

Chaque phase se termine par une démonstration à Noam (une vidéo ou une capture), puis on attend son retour avant la suivante.

### Phase 1 : le cœur du rendu (vitesse)
- Lecteur commun : `seek(T)` → image, sur n'importe quelle scène.
- Export rapide :
  - lecture des pixels bruts (`readPixels` ou `ImageBitmap`) envoyés à ffmpeg en `rawvideo`, au lieu de `toDataURL('image/jpeg')` ;
  - **rendu en parallèle** sur 2 à 4 pages Chromium, chacune sur une tranche de temps, puis `concat`.
- Garder le flou de mouvement par sous-images (`--sub`, `--shutter`) des projets auto.
- Sorties : final, téléphone (720×1280, CRF 27, moins de 30 Mo), iPhone (2 passes, faststart), couverture.
- **Mesure obligatoire** : temps avant/après sur le hook du Mans 66 et sur une vidéo Koan, et image identique au pixel près.

### Phase 2 : les contrôles automatiques (`check`)
- Rendu d'images à des instants donnés + planche contact (l'équivalent de `snap.mjs` / `planche.sh`).
- Contrôles :
  - géométrie Three.js : objets qui se traversent, qui flottent, hors cadre, caméra dans un objet ;
  - texte : chevauchement, taille minimale lisible sur téléphone, sortie de la **zone sûre TikTok** (boutons à droite, légende en bas) ;
  - visage ou sujet derrière les sous-titres ;
  - image trop sombre, trop claire ou vide (histogramme) ;
  - **à-coups de caméra et de trajectoire** (reprendre `traj.mjs`) ;
  - images doublées aux coupes ;
  - **mots couverts par les bruitages** (reprendre `mix.py`).
- Une passe « **relecteur aveugle** » : un sous-agent (Haiku pour décrire, Opus pour juger) qui ne voit que les images, jamais le code.
- Sortie : `qa/rapport.json` (instant, plan, problème, gravité), affiché ensuite en rouge sur la timeline.

### Phase 3 : le studio (interface)
Modèle visuel : les captures de Creatorize.
- À gauche : la liste des plans (texte de la voix, début, durée, fichier) et les étapes du pipeline avec leurs boutons (Voix / Nettoyer / Caler / Storyboard / Construire / Contrôler / Son / Exporter).
- Au centre : l'aperçu temps réel avec lecture, image par image (flèches, molette) et vitesses 0,5×-2×.
- En bas, les pistes : Plans, Mots, Bruitages (pastilles qu'on fait glisser et dont on règle le volume, qui réécrivent `cues.json`), forme d'onde, Contrôles (en rouge).
- Calques à allumer et éteindre : sous-titres, 2D, zone sûre, grille des tiers, trajectoires.
- **Outil caméra** : caméra libre à la souris, bouton « copier ce cadrage » qui donne la ligne de code.
- Réglages en direct (lil-gui ou Tweakpane), avec un bouton « figer » qui réécrit la valeur dans le code.
- Rechargement à chaud : on modifie une scène, l'image se met à jour **au même T** sans recharger les modèles 3D.
- Navigateur de sons : le pack de Noam (`C:\tiktok\chat\sfx`, catalogue CSV), filtrable, avec écoute au survol.

### Phase 4 : Claude dans le studio
- À droite : un panneau qui pilote **Claude Code en ligne de commande** (`claude -p` ou Agent SDK) dans le dossier du projet, avec l'abonnement de Noam.
- Clic sur un objet de l'aperçu (raycast → plan + objet), puis demande en langage naturel, avec une portée **sélection / plan / vidéo entière**.
- Après chaque modification : liste des fichiers modifiés, « voir les changements », « annuler ». Le projet est sous **git local**, avec un commit par demande.
- « Retenir » : la correction devient une règle dans un fichier mémoire du projet ou du style.

### Phase 5 : la construction en équipe
- Le **directeur** (Opus) lit le script calé et le style, puis écrit `storyboard.md` et `constantes.md`.
- Il lance en parallèle :
  - un **constructeur par section**, chacun sur son seul fichier `scenes/sNN.js` ;
  - un **chercheur d'assets** (images libres, modèles CC0/CC-BY, crédits) ;
  - un **créateur d'objets** qui enrichit la bibliothèque commune.
- Chaque constructeur rend ses images, passe `check`, se corrige, puis rend la main.
- Ensuite, le **polisseur** (« ultra edit ») repasse plan par plan.
- Curseur de qualité : Standard / Vérifié / Soigné / Ultra.
- Les documents de référence lus par les agents (`references/*.md`) sont tirés des skills de `tiktok-motion` : style, mode d'emploi du moteur, mise en scène, liste de contrôle, assets, son.

### Phase 6 : la bibliothèque commune
- `kit/` : objets, lieux, éclairages, mouvements de caméra nommés, personnages riggés (Mixamo) avec leurs animations. Chaque élément est testé seul à taille réelle avant d'entrer.
- Navigateur d'assets : aperçus, manifeste (dimensions, marqueurs, **convention d'axes unique vérifiée au chargement**), glisser-déposer dans la scène.
- Crédits générés automatiquement pour la description.
- Allègement des modèles : glTF-Transform + meshoptimizer, textures en KTX2.

### Phase 7 : la copie de style (`clone-style`)
- Entrée : 1 à 7 vidéos de référence. Traitement :
  - extraction à 30 i/s ;
  - détection des coupes ;
  - calage des mots (Whisper) ;
  - Haiku décrit les séquences autour de chaque événement ;
  - Opus mesure et rédige.
- Sortie : `styles/<nom>/regles.md`. Une ligne par règle : `ID | règle | valeur | déclencheur | preuves (vidéo + n° d'image + mot) | méthode de mesure | confiance | exceptions`.
- Le style s'enrichit après chaque vidéo : défaut → cause → correction.
- On reprend le timing, le cadrage et la grammaire. On ne reprend ni les personnages ni l'identité visuelle de la référence.

### Plus tard
- Passage à WebGPU (les équivalents des effets WebGL existent déjà dans Three.js 0.186 : `GTAONode`, `SSRNode`, `SSGINode`, `TRAANode`, `BloomNode`, `Lut3DNode`, `DepthOfFieldNode`…). Il faudra réécrire en TSL `post.js`, la piste mouillée `WETSH`, `ReflectorNode` et les gerbes. **D'abord tester** que le Chromium sans fenêtre de Playwright fait tourner WebGPU sur la RTX.
- « Ultra Edit Plus » : une image cible générée par IA, puis retouche de la scène 3D. **Seulement si Noam le demande** : sa règle par défaut est « tout en code ».

---

## 5. Ce qui ne doit jamais casser
- La fonction pure de T et le rendu identique à chaque passage.
- Le détecteur d'à-coups.
- Les coupes sur la grille des images.
- La sortie téléphone de moins de 30 Mo.
- Le mix à −14 LUFS avec le contrôle des mots couverts.
- Les vidéos existantes de `tiktok-motion` doivent pouvoir se rendre comme avant.

## 6. Méthode de travail avec Noam
- Une phase à la fois. À la fin de chaque phase : une démonstration (vidéo ou capture), puis on attend son retour.
- Montrer l'interface par une capture avant de la peaufiner.
- Pas de DA nouvelle sans son accord : le logiciel sert ses DA existantes (Koan, auto).
- Recherches techniques : par GPT (Codex, `gpt-6.1-sol`, raisonnement moyen), puis vérifiées.
