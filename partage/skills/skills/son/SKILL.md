---
name: son
description: "Tout le son d'une vidéo : voix off, bruitages calés sur l'image (matière, rythme), ambiance, musique sous la voix, mix à −14 LUFS sans couvrir les mots. À utiliser pour poser ou corriger des bruitages (cues.json) ou juger un mix."
metadata:
  source: "tiktok-motion/.claude/skills/son/SKILL.md"
---

> Règles des professionnels, avec leurs repères chiffrés : `references/pratiques-bruitages.md`, `references/pratiques-mixage.md`. Lis-les avant de travailler ; leurs sources sont dans `references/recherche.md`.

> Les fichiers annexes (`references/pratiques-bruitages.md`, `references/pratiques-mixage.md`, `references/recherche.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.


# La voix off (Gemini TTS) : la méthode commune

**La voix, la musique et le style des bruitages dépendent du compte et de sa DA** : ils sont dans la fiche de DA du projet, fichier `son.md` (`C:\claude\studio-projets\_styles\<id>\son.md`). Enzo, c'est seulement le compte auto ; Velvet Anchor 3, seulement Koan. **Lire ce `son.md` avant de générer ou de mixer quoi que ce soit.** Ce skill donne la méthode commune.

- **Toujours montrer le script complet dans le chat et attendre le OK de Noam avant de générer.**
- Clé dans la variable d'environnement `GEMINI_API_KEY`. **Ne jamais l'écrire dans un fichier.**
- Modèle `gemini-3.8-flash-tts`. Le style (débit, ton) se décrit en anglais dans l'en-tête du texte envoyé. Peu de balises d'expression (`<short pause>`, `<breath>`…).
- Texte adapté à l'oral : chiffres, années et sigles écrits comme ils se disent ; tester les noms propres.
- Plusieurs prises (3), la meilleure choisie par Whisper ; chercher les bégaiements.
- Nettoyage et égalisation : les valeurs (silences, vitesse, égaliseur) sont dans le `son.md` de la DA.
- Calage au mot : Whisper → `docs/timing.json` + `scenes/words.js`. On mesure la durée sur le fichier, on ne la devine pas.
- Une retouche (un passage plus lent, un mot) : ne refaire que ce passage.

---

# Sound design

Le son, c'est la moitié de la rétention. Trois couches, toujours dans cet ordre de priorité : **voix > bruitages > musique**.
La voix doit rester compréhensible à 100 % sur un haut-parleur de téléphone.

Outils (tout est local et gratuit) :
| Couche | Outil | Où |
|---|---|---|
| Voix | chaîne ffmpeg ci-dessous | `voix-off/` |
| Bruitages réels | `studio/freesound.py` (Freesound, CC0) | clé `FREESOUND_API_KEY` en variable d'env |
| Bruitages calés sur la vidéo | MMAudio (vidéo → son), local sur la RTX 3060 | `C:\claude\tools\MMAudio` + venv `C:\claude\tools\mmaudio-venv` |
| Bruitages de secours | synthèse de `studio/audio.py` (paper, whoosh, thud, riser, pop…) | |
| Musique | `studio/music.py` — composée et synthétisée de zéro | |
| Mix final | `studio/audio.py cues.json` | `out/mix.wav` |

## 1. Voix off : le mixage « storytelling »

Après génération (et après raccourcissement si besoin : silences ramenés à 0,2 s + `atempo` ≤ 1,08, au-delà la voix sonne pressée) :

```
ffmpeg -i vo.wav -af "highpass=f=75,equalizer=f=150:t=q:w=1:g=2.5,equalizer=f=380:t=q:w=1.4:g=-3,equalizer=f=3200:t=q:w=1.2:g=2.5,highshelf=f=9000:g=2,deesser=i=0.4,acompressor=threshold=-21dB:ratio=3:attack=6:release=90:makeup=3,aecho=0.8:0.3:22|37:0.12|0.07,alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=8" -ar 48000 vo_mix.wav
```
Ce que fait chaque maillon, pour savoir quoi toucher :
- `highpass 75` : enlève les grondements. `+2,5 dB à 150 Hz` : chaleur, voix « proche du micro ».
- `-3 dB à 380 Hz` : enlève le son « carton ». `+2,5 dB à 3,2 kHz` + `aigus à 9 kHz` : présence et clarté sur téléphone.
- `deesser` : adoucit les « s ». Compresseur 3:1 : voix régulière, intime, qui ne disparaît pas sous la musique.
- `aecho` très court : une petite pièce, pour que la voix ne sonne pas « IA sèche ». Ne jamais mettre une vraie réverbe longue.
- Réglages : voix trop sourde → monter 3,2 kHz ; trop agressive → baisser 3,2 kHz ou `deesser=i=0.6` ; trop « boîte » → plus de coupe à 380 Hz.

## 2. Bruitages : le « spotting »

**Quand** : une fois la vidéo rendue (`out/final.mp4`), avec `docs/shotlist.md` et `scenes/words.js` sous les yeux.

**Étape A — la liste.** Regarder la vidéo scène par scène (extraire des images avec ffmpeg et les ouvrir avec Read) et écrire `docs/sound.md`, un tableau `t | ce qu'on voit | son | source | niveau`. Pour chaque action visible, penser **matière + geste + taille** :
- un pas → sur quoi ? verre (`footsteps broken glass`), terre (`footsteps dirt`), sable (`footsteps sand`), bitume, parquet, neige ;
- des cartes qui volent → `cards shuffle flutter` ; papier → `paper rustle`, `paper slide` ; un tampon → `rubber stamp` ;
- feu → `fire crackle`, foule → `crowd protest distant`, sirène, verre qui casse, matraque → `body impact`.
Puis le son du **motion** lui-même (c'est ce qui rend une vidéo « pro ») :
- texte qui apparaît → `pop`/`tick` léger ; transition de scène → `whoosh`/`swish` ;
- avant une révélation → `riser` qui se coupe net ; mot clé / verdict (« Gagné. », « Perdu. ») → `thud`/impact sourd ;
- chiffre qui défile → ticks rapides ; archive VHS (DA) → souffle de bande, `vhs click`.
Et une **ambiance** de fond par scène (rue, pièce, foule lointaine) à -28/-32 dB, qui change avec le lieu.

Règle d'or : **pas tout sonoriser**. Un son toutes les 1-3 s maximum, et garder des trous. Le silence avant une phrase clé vaut plus qu'un effet.

**Étape B — les sons.** Pour chaque ligne, dans cet ordre :
1. **Freesound** (vrais enregistrements, le plus réaliste) — requêtes en anglais :
   `python freesound.py "footsteps broken glass" --list` puis `python freesound.py "footsteps broken glass" --pick 2 --out assets/sfx/pas_verre.mp3`
1 bis. **Openverse** quand Freesound n'a rien : un seul moteur de recherche pour Freesound, Jamendo (musique), Wikimedia et ccMixter. Pas besoin de clé (le nombre de requêtes est limité). Le filtre `license_type=commercial,modification` écarte les licences NC et ND, interdites sur un compte monétisé :
   `curl -s "https://api.openverse.org/v1/audio/?q=fire%20crackling&license_type=commercial,modification&page_size=10"` → pour chaque résultat, `title`, `source`, `license`, `duration` (en ms) et `url` (le fichier). Une licence CC BY oblige à créditer l'auteur (`creator`) dans la description. Comme tout nouveau son, il va ensuite dans le pack de Noam, avec sa ligne au catalogue (source + licence).
2. **MMAudio** quand le son doit suivre exactement l'image (plusieurs pas, un objet qui roule, une foule animée) — il regarde la vidéo et génère le son synchronisé :
   ```
   ffmpeg -ss 12.0 -to 18.0 -i out/final.mp4 -an out/clip_s3.mp4
   C:\claude\tools\mmaudio-venv\Scripts\python C:\claude\tools\MMAudio\demo.py --video out/clip_s3.mp4 --prompt "footsteps on sand, wind" --negative_prompt "music, voice" --duration 6 --skip_video_composite --output out/mmaudio
   ```
   Clips de 8 s max (il est entraîné sur 8 s). Le modèle `large_44k_v2` (par défaut) monte à 5,8 Go de VRAM sur 6 : fermer les autres applis GPU ; en cas d'erreur mémoire, ajouter `--variant small_16k`. Sans `--video`, il fait aussi du texte → son.
   Il marche mieux sur des images « réalistes » ; sur du pixel art, toujours donner un `--prompt` précis.
3. **Synthèse** d'`audio.py` pour les sons de motion génériques si rien de mieux.

**Étape C — caler.** Chaque son se cale sur le **même mot/temps que l'animation** (`words.js`), 1 à 2 images *avant* l'impact visuel (le son qui arrive tard paraît décalé). Noms de fichiers dans `assets/sfx/<type>.wav` → utilisables par type dans `cues.json`.

## 3. Musique de fond : `music.py`

Composée de zéro (piano additif, nappe, basse, batterie lo-fi, arpège chiptune 8-bit qui rappelle le pixel art). Pas de sample, pas de droits.
```
python music.py --dur 130 --out audio/music.wav --bpm 88 --key A --seed 3 --levels "0:1,10:2,45:0,52:2,65:0,72:1,85:2,105:1,115:0"
```
- `--levels` suit **l'arc de l'histoire**, en temps global de la voix (prendre les temps dans `words.js`) :
  0 = suspens/phrase clé (nappe + piano seul) · 1 = récit · 2 = action, révélation · 3 = climax (arpège chiptune).
- Descendre à 0 juste **avant** les phrases importantes, remonter juste après : le contraste fait l'effet.
- Pour un vrai « drop du silence » (musique coupée net), utiliser `silences` dans `cues.json`.
- Changer d'ambiance : `--seed` (autre mélodie), `--bpm` (70 = grave, 100 = énergique), `--key`.
- Pas assez bien ? Variante possible plus tard : mêmes notes jouées par une banque de sons réelle (soundfont piano) au lieu de la synthèse.

## 4. Mix final

`cues.json` (voir l'en-tête d'`audio.py`) : voix mixée, musique (`music_db` -20 environ, ducking automatique sous la voix), SFX avec `db`.
Niveaux de départ : impacts/whoosh -8 à -12 dB, pops/ticks -14 à -18, ambiances -28 à -32, musique -18 à -24.
Cible : **-14 LUFS intégré, crête -1 dBFS** (TikTok). `pip install pyloudnorm` sinon la normalisation est sautée.
Puis assembler : `ffmpeg -i out/final.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/final_son.mp4`.

**Écoute de contrôle** (obligatoire avant de livrer) : extraire 3 passages (hook, révélation, fin) et vérifier avec `ffmpeg ... -af ebur128` que la voix domine, qu'aucun SFX ne masque un mot, et que la musique ne « pompe » pas. Livrer à Noam la vidéo + `docs/sound.md` pour qu'il puisse demander « change le son à 0:42 ».
