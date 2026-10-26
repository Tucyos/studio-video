# Son de la DA « da-auto » (compte auto MatouMécano)

## Voix : Enzo (compte auto uniquement)
- Modèle `gemini-3.8-flash-tts`, voix `en-us-enzo`, langue `fr-FR`. Script de référence : `videos/Automobile/bmw-modeles/outils/gen_voix.py` (texte phonétique dans `voix/chunks.json`).
- **Texte phonétique** : « Formule 1 » et jamais « F1 » (lu à l'anglaise), chiffres et années en toutes lettres (« trois cent vingt dé », « mille neuf cent soixante-quatre »), sigles épelés à tester (« A M G »), noms étrangers en phonétique si Enzo bute.
- Style dans l'en-tête, en anglais : demander un débit **rapide**. Un style « tendu » fait ralentir Enzo.
- D'une seule traite, **3 prises**, la meilleure choisie par Whisper (taux de mots reconnus ; un taux bas peut venir des chiffres écrits en lettres).
- Nettoyage (mémoires « rythme de la voix » et « voix claire sur téléphone ») :
  - blancs ramenés à **160 ms** (`videos/Koan/langage-corporel/outils/trim_silence.py`, version corrigée), fins de mots gardées (marge 120 + 80 ms), les blancs coupés seulement dans le vrai silence ;
  - **atempo 1,06** ;
  - **réglage E** : passe-haut 110 Hz, −4 dB à 250 Hz, +5 dB à 3,2 kHz, aigus +5 dB, compression 2:1 ; gain simple.
  - Chercher les bégaiements avant le montage.
- Calage au mot : Whisper (medium) → `docs/timing.json` + `scenes/words.js` (outil d'alignement du dossier `radar/` ou de `bmw-modeles/`).
- Enzo dit environ **4,4 mots par seconde** une fois nettoyé. On ne devine pas la durée : on mesure le fichier.
- Noam peut demander d'accélérer ou ralentir un passage précis (ex. les badges du hook BMW à 1,25) : ne retoucher que ce passage.


## Ambiance sonore : sobre
- **Pas de musique** (`music.py` retiré : « pas fou »), ou alors une vraie musique du pack de Noam, proposée et validée.
- **Pas de moteur ni de passages de F1 en continu** (« pas utiles »). Ponctuels, ils passent : un démarrage, un geste mécanique, une voiture qui passe sur un plan qui roule.
- Des sons de motion design : un whoosh discret à chaque coupe (≈ −22 dB), un clic sur les titres et badges, des pops, des impacts sourds, des sons d'interface.
- **Pas de glitch numérique ni de grésillement** (« bug » pour Noam) : une coupure = silence + impact sourd.

## Bruitages et mix
- Le pack de Noam d'abord (`C:	iktok\chat\sfx`, catalogue CSV), puis Freesound ; tout nouveau son s'ajoute au pack, renommé, avec sa ligne au catalogue.
- Réglés sur leur **volume perçu** sous la voix (≈ −8 dB pendant la parole), jamais sur la crête ; contrôle chiffré avant de livrer.
- Chaîne de référence : `videos/Automobile/bmw-modeles/outils/sons.py` → `cues.json` → `outils/mix.py` (sidechain sous la voix, −14 LUFS, limiteur 0,83, contrôle des mots couverts).
