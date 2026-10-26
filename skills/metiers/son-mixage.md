# Mixeur / ingénieur du son

Rend le message intelligible en gardant une voix naturelle ; fait reculer la musique sous la parole sans pompage.
Mesure séparément sonie intégrée, dynamique et crêtes vraies ; distingue normalisation et compression dynamique.

## Règles

- Mesurer sonie et true peak avec un algorithme documenté — référence ITU-R BS.1770-5.
- Appliquer −14 LUFS au mix final complet, pas piste par piste : la mesure de programme caractérise l'ensemble.
- Ne pas présenter −14 LUFS comme la cible EBU : R128 = −23 LUFS, tolérance générale ±0,5 LU.
- Mesurer les crêtes inter-échantillons en dBTP, pas les maxima d'échantillons en dBFS.
- Plafond initial : −1 dBTP ; les codecs peuvent exiger plus de marge.
- Corriger la source TTS avant d'accentuer son traitement ; garder une version éditée non traitée.
- Débruiter seulement si nécessaire, avec la réduction minimale acceptable.
- Filtrer les graves seulement si un défaut le justifie ; 80 Hz est un exemple, pas un preset TTS.
- Compresser modérément pour stabiliser la voix ; ratio universel : non documenté.
- Vérifier les fins de mots après gate ou suppression de silence : préserver T, P et respirations utiles.
- Déclencher le ducking via une piste de sidechain dédiée à la voix.
- Désactiver la compensation automatique de gain du ducker.
- Régler le ducking sur des phrases complètes ; refuser les remontées entre syllabes.
- Normaliser un fichier fini en deux passes et conserver les mesures d'entrée.
- Vérifier le mode réellement appliqué : `loudnorm` retombe en dynamique si le mode linéaire viole les contraintes.
- Fixer explicitement la sortie audio : 48 kHz pour YouTube ; `loudnorm` dynamique suréchantillonne à 192 kHz en interne.
- Remesurer le fichier final décodé après encodage : sonie et true peak, selon les transformations du codec.
- Compenser le délai des traitements avant validation image/son ; DeepFilterNet expose une compensation STFT/lookahead (à tester).
- Comparer tout traitement assisté à une référence choisie pour le programme.
- Sur YouTube, garder −14 LUFS comme cible interne ; l'encodage documenté est 48 kHz, 384 kb/s stéréo.

## Erreurs à éviter

- Confondre crête d'échantillon et true peak.
- Écraser la voix pour atteindre une valeur de sonie.
- Débruiter une TTS propre et introduire des artefacts.
- Laisser le ducker pomper ou compenser automatiquement son atténuation.
- Confondre RMS apparié et sonie intégrée conforme.
- Oublier le délai ajouté par un traitement neuronal.

## Avant de rendre ton travail

- [ ] Chaque mot reste intelligible dans le mix complet (le studio le contrôle : mots couverts).
- [ ] Aucun mot coupé par gate ou nettoyage.
- [ ] Le ducking ne produit aucune remontée gênante.
- [ ] Le rapport final contient LUFS intégrés, LRA et true peak.
- [ ] Le fichier encodé respecte le plafond choisi.
- [ ] La sortie YouTube est à 48 kHz.
- [ ] Les délais audio/vidéo ont été contrôlés après traitement.

## Court (9:16) / long (16:9)

- Court : contrôler chaque export séparément, viser l'intelligibilité immédiate sur téléphone.
- Long : vérifier aussi les transitions entre séquences.
- Long : utiliser la LRA pour décider de la compression selon genre et public, sans valeur unique imposée.
- Les deux : ne pas déduire une cible LUFS du seul ratio 9:16 ou 16:9.

## Outils

- Matchering — mastering par appariement à une référence ; reproduit RMS, spectre, crête et largeur (à tester) ; GPL-3.0, copyleft si redistribution du logiciel.
- automix-toolkit — mixage neuronal de stems ; exemples préentraînés sur la batterie, adaptation voix/musique à faire (à tester) ; Apache-2.0.
- DeepFilterNet — débruitage parole 48 kHz avec compensation de délai ; MIT ou Apache-2.0 ; aléatoire possible via PyTorch.
- RNNoise — suppression de bruit de parole, bibliothèque C, exemple mono PCM 48 kHz (à tester) ; BSD-3-Clause ; entraînement dépendant de graines aléatoires.
- FFmpeg — ducking, assemblage, normalisation, analyse ; LGPL surtout, GPL selon composants ; vérifier la compilation distribuée, certaines combinaisons `nonfree` ne sont pas redistribuables.
