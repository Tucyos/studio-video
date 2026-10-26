# Recherche Codex (gpt-6.1-sol, 22/10/2026), brute, sources comprises

Les fiches ci-dessous distinguent **normes**, **méthodes professionnelles** et **règles proposées pour votre studio**, marquées **[studio]**. Les recommandations TikTok citées concernent principalement la publicité ; leur application aux documentaires et fictions est une adaptation éditoriale. [TikTok](https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en)

Les étoiles sont les valeurs arrondies affichées dans les pages GitHub consultées. Une garantie de reproductibilité bit à bit est indiquée **« not found »** lorsqu’elle n’est pas documentée ; PyTorch ne la garantit pas entre versions, matériels ou CPU/GPU. [PyTorch](https://docs.pytorch.org/docs/2.14/notes/randomness.html)

## Sound designer

**1. Ce que fait un très bon professionnel**

- Conçoit le son dès le scénario pour raconter, orienter l’attention et suggérer le hors-champ. [Randy Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
- Choisit une perspective sonore cohérente avec le personnage, le lieu et l’émotion. [Randy Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
- Évalue ensemble spectre, dynamique et déroulement dramatique ; sait supprimer des sons. [Entretien avec Randy Thom](https://designingsound.org/2011/01/12/behind-the-art-randy-thom/)
- Compose aussi les silences et leur entrée, au lieu de remplir chaque intervalle. [Randy Thom, *Contact*](https://www.filmsound.org/QA/creating-silence.htm)

**2. Règles concrètes**

1. Prévoir les événements sonores avant de figer les scènes — dès scénario/storyboard. [Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
2. Donner une fonction à chaque son — lieu, époque, personnage, tension ou information. [Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
3. Employer le hors-champ pour suggérer une information avant de la montrer — repère narratif. [Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
4. Choisir les couches selon leur complémentarité spectrale et dynamique — retirer celles qui ne contribuent pas. [Thom, entretien](https://designingsound.org/2011/01/12/behind-the-art-randy-thom/)
5. Réserver whooshes et impacts aux accents utiles — **[studio]**, aucun quota par seconde documenté : **not found**. [Principe de sélection](https://designingsound.org/2011/01/12/behind-the-art-randy-thom/)
6. Caler le transitoire de l’impact sur le contact visible — **[studio]**, cible : décalage intentionnel nul. [Synchronisation EBU R37](https://tech.ebu.ch/docs/r/r037.pdf)
7. Distinguer anticipation artistique et défaut technique de synchronisation — EBU : son au maximum 5 ms en avance ou 15 ms en retard à chaque étape. [EBU R37](https://tech.ebu.ch/docs/r/r037.pdf)
8. Décrire chaque événement par identifiant, position, durée et média — **[studio]**, fiche de cues compatible avec les marqueurs de timeline. [OpenTimelineIO](https://opentimelineio.readthedocs.io/en/latest/tutorials/time-ranges.html)
9. Faire précéder un changement de lieu par son ambiance lorsque cela crée une anticipation utile — J-cut. [Adobe](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
10. Laisser une ambiance ou résonance traverser le changement d’image lorsque la continuité l’exige — L-cut. [Adobe](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
11. Ajouter un fondu court aux coupes audio qui cliquent — durée universelle : **not found**. [Audacity](https://manual.audacityteam.org/man/fade_and_crossfade.html)
12. Tester un fondu à puissance constante entre ambiances non corrélées — éviter le creux au milieu. [Audacity](https://manual.audacityteam.org/man/fade_and_crossfade.html)
13. Préserver une décroissance naturelle aux sons résonants — repère : enveloppe exponentielle. [Audacity](https://manual.audacityteam.org/man/fade_and_crossfade.html)
14. Construire le silence par retrait sélectif avant d’essayer le zéro numérique — repère dramaturgique. [Designing Sound](https://designingsound.org/2014/06/28/designing-silence/)
15. Préparer l’entrée dans un silence total si une coupure paraît accidentelle — exemple : extinction progressive dans *Contact*. [Thom](https://www.filmsound.org/QA/creating-silence.htm)
16. Choisir et monter la musique pour laisser les mots audibles — pas d’écart voix/musique universel documenté : **not found**. [TikTok, contrôle audio](https://www.tiktok.com/business/library/Top_Tips_One_Pager_SMB.pdf)
17. Enregistrer auteur, URL et licence de chaque bruitage — CC BY : attribution ; exclure CC BY-NC du catalogue commercial sans autorisation adaptée. [Freesound](https://freesound.org/help/faq/)
18. Pré-rendre puis figer les sons générés ou séparés avant le rendu image par image — **[studio]**, éviter une nouvelle génération aléatoire à chaque rendu. [Demucs, décalages aléatoires](https://github.com/facebookresearch/demucs)

**3. Erreurs fréquentes à interdire**

- Ajouter des effets sans fonction dramatique identifiable. [Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
- Empiler les couches sans écouter leurs interactions. [Thom, entretien](https://designingsound.org/2011/01/12/behind-the-art-randy-thom/)
- Remplir toutes les respirations et supprimer le contraste. [Designing Sound](https://designingsound.org/2014/06/28/designing-silence/)
- Couper une ambiance ou une résonance avec un clic audible. [Audacity](https://manual.audacityteam.org/man/fade_and_crossfade.html)
- Couvrir la voix avec la musique. [TikTok](https://www.tiktok.com/business/library/Top_Tips_One_Pager_SMB.pdf)
- Assimiler « téléchargement gratuit » à « utilisation commerciale autorisée ». [Freesound](https://freesound.org/help/faq/)

**4. Check-list de fin**

- [ ] Chaque cue possède une fonction narrative explicite. [Thom](https://www.filmsound.org/articles/designing_for_sound.htm)
- [ ] Les contacts son/image sont synchronisés ; les anticipations sont intentionnelles. [EBU R37](https://tech.ebu.ch/docs/r/r037.pdf)
- [ ] Aucun clic aux coupes ni creux indésirable aux fondus. [Audacity](https://manual.audacityteam.org/man/fade_and_crossfade.html)
- [ ] Tous les mots restent audibles avec musique et bruitages. [TikTok](https://www.tiktok.com/business/library/Top_Tips_One_Pager_SMB.pdf)
- [ ] Une passe de suppression des sons superflus a été effectuée. [Thom, entretien](https://designingsound.org/2011/01/12/behind-the-art-randy-thom/)
- [ ] Les sources et attributions des sons sont consignées. [Freesound](https://freesound.org/help/faq/)

**5. Outils et banques utiles**

| Outil ou banque | Étoiles ; licence | Usage dans le studio ; alertes |
|---|---|---|
| [jsfxr](https://github.com/chr15m/jsfxr) | ≈446 ; Unlicense | Générer clics, bips et impacts stylisés en JavaScript, exporter WAV. Génération et mutation de paramètres : figer les fichiers retenus ; garantie bit à bit : **not found**. |
| [Audacity](https://github.com/audacity/audacity) | ≈18,8 k ; [GPLv3](https://github.com/audacity/audacity/blob/master/LICENSE.txt) | Édition manuelle et contrôle des bruitages ; fondus et nettoyage. Copyleft à examiner si redistribution du logiciel ; garantie bit à bit des traitements : **not found**. |
| [Demucs](https://github.com/facebookresearch/demucs) | ≈10,4 k ; MIT | Extraire voix, batterie, basse et accompagnement d’un média autorisé. **Aléatoire avec `shifts` ; dépôt archivé et non maintenu.** |
| [Freesound](https://freesound.org/help/faq/) | Étoiles : **not found** ; licences par fichier | Ambiances, foley et bruitages. Filtrer CC0/CC BY ; **CC BY-NC bloque l’usage commercial sans permission adaptée**. |
| [Kenney Audio](https://kenney.nl/assets/category:Audio) | Étoiles : **not found** ; [CC0](https://kenney.nl/support) | Sons d’interface et effets stylisés. Usage commercial permis ; attribution facultative. |

La GPL du logiciel ne s’applique généralement pas aux médias que vous traitez avec vos propres données ; elle impose des conditions lors de la redistribution du logiciel concerné. [FAQ GNU](https://www.gnu.org/licenses/gpl-faq.en.html)

**6. Court vertical / long horizontal**

| Court vertical | Long YouTube 16:9 |
|---|---|
| **[studio]** Faire entendre rapidement l’identité ou l’enjeu sonore ; tester l’accroche dans les 6 premières secondes, repère publicitaire TikTok. [TikTok](https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en) | **[studio]** Développer davantage les ambiances, perspectives et évolutions sonores au service de l’histoire. [Thom](https://www.filmsound.org/articles/designing_for_sound.htm) |
| **[studio]** Limiter les accents concurrents pendant les phrases denses. [Principe de sélection](https://designingsound.org/2011/01/12/behind-the-art-randy-thom/) | **[studio]** Organiser des contrastes et silences à l’échelle des séquences. [Designing Sound](https://designingsound.org/2014/06/28/designing-silence/) |

## Mixeur / ingénieur du son

**1. Ce que fait un très bon professionnel**

- Rend le message intelligible et conserve une voix naturelle. [Sound On Sound](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
- Fait reculer la musique pendant la parole sans pompage gênant. [Sound On Sound](https://www.soundonsound.com/techniques/ducking-mixdown)
- Mesure séparément sonie intégrée, dynamique et crêtes vraies. [EBU R128](https://tech.ebu.ch/publications/r128)
- Adapte la livraison au contexte de lecture ; distingue normalisation et compression dynamique. [Meta Engineering](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/)

**2. Règles concrètes**

1. Mesurer sonie et true peak avec un algorithme documenté — référence actuelle : ITU-R BS.1770-5. [UIT](https://www.itu.int/rec/r-rec-bs.1770/_page.print)
2. Appliquer les −14 LUFS demandés au mix final complet — **[studio]**, pas à chaque piste ; la mesure de programme caractérise l’ensemble. [EBU R128](https://tech.ebu.ch/publications/r128)
3. Ne pas présenter −14 LUFS comme la cible EBU — R128 : −23 LUFS, tolérance générale ±0,5 LU. [EBU R128](https://tech.ebu.ch/docs/r/r128.pdf)
4. Mesurer les crêtes inter-échantillons — dBTP, pas seulement les maxima d’échantillons en dBFS. [Sound On Sound](https://www.soundonsound.com/techniques/end-loudness-war)
5. Proposer un plafond initial de −1 dBTP — **[studio]**, repère EBU pour audio linéaire ; les codecs peuvent nécessiter davantage de marge. [EBU Tech 3343](https://tech.ebu.ch/docs/tech/tech3343-v2.pdf)
6. Corriger la source TTS avant d’accentuer son traitement — **[studio]**, conserver une version éditée non traitée. [Pratique voix off](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
7. Débruiter seulement si nécessaire — employer la réduction minimale acceptable. [Audacity](https://manual.audacityteam.org/man/noise_reduction.html)
8. Écouter le résidu du débruitage — rejeter le réglage s’il retire des fragments reconnaissables de parole. [Audacity](https://manual.audacityteam.org/man/noise_reduction.html)
9. Filtrer les graves uniquement si un défaut le justifie — 80 Hz est un exemple professionnel, pas un preset universel pour TTS. [Sound On Sound](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
10. Employer une compression modérée pour stabiliser la voix — ratio universel : **not found**. [Sound On Sound](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
11. Vérifier les fins de mots après gate ou suppression de silence — préserver notamment T/P et respirations utiles. [Sound On Sound](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
12. Déclencher le ducking musical avec la piste voix — sidechain dédié. [FFmpeg](https://ffmpeg.org/ffmpeg-filters.html#sidechaincompress)
13. Désactiver le gain de compensation automatique du ducker — éviter de remonter le fond musical. [Sound On Sound](https://www.soundonsound.com/techniques/ducking-mixdown)
14. Régler le ducking sur des phrases complètes — atténuation, attaque et retour universels : **not found** ; refuser les remontées gênantes entre syllabes. [Sound On Sound](https://www.soundonsound.com/techniques/ducking-mixdown)
15. Pour un fichier fini, employer une normalisation en deux passes — conserver les mesures d’entrée. [FFmpeg](https://ffmpeg.org/ffmpeg-filters.html#loudnorm)
16. Vérifier le mode réellement appliqué — `loudnorm` peut revenir au mode dynamique si le mode linéaire ne respecte pas les contraintes. [FFmpeg](https://ffmpeg.org/ffmpeg-filters.html#loudnorm)
17. Fixer explicitement la sortie audio — YouTube recommande 48 kHz ; `loudnorm` dynamique suréchantillonne en interne à 192 kHz. [YouTube](https://support.google.com/youtube/answer/1722171?hl=en) · [FFmpeg](https://ffmpeg.org/ffmpeg-filters.html#loudnorm)
18. Remesurer le fichier final décodé après encodage — **[studio]**, contrôler sonie et true peak, compte tenu des transformations par codec. [EBU Tech 3343](https://tech.ebu.ch/docs/tech/tech3343-v2.pdf)
19. Compenser le délai des traitements avant validation image/son — DeepFilterNet expose une compensation STFT/lookahead. [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)
20. Comparer le traitement assisté à une référence choisie pour le programme — Matchering reproduit notamment RMS, spectre, crête et largeur, sans garantir à lui seul vos −14 LUFS. [Matchering](https://github.com/sergree/matchering)

**Sonie par plateforme : ce qui est effectivement documenté**

| Destination | Cible officielle d’upload trouvée | Décision proposée |
|---|---|---|
| YouTube / Shorts | LUFS et plafond dBTP : **not found** dans les recommandations d’encodage consultées ; 48 kHz et 384 kb/s stéréo documentés. [YouTube](https://support.google.com/youtube/answer/1722171?hl=en) | Garder vos −14 LUFS comme cible interne ; vérifier la version encodée. [Méthode de mesure](https://www.itu.int/rec/r-rec-bs.1770/_page.print) |
| TikTok | LUFS et plafond dBTP : **not found** dans les spécifications officielles consultées. [TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) | Garder la même cible interne, puis contrôler une publication test autorisée ; aucun autre chiffre n’est présenté ici comme norme TikTok. [Spécifications](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) |
| Instagram Reels | Cible numérique universelle : **not found** ; Meta décrit une gestion de sonie et dynamique au lecteur selon le contexte. [Meta](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/) | Tester la lecture sur téléphone et casque avec le même master initial. [Contextes de lecture Meta](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/) |

**3. Erreurs fréquentes à interdire**

- Confondre crête d’échantillon et true peak. [Sound On Sound](https://www.soundonsound.com/techniques/end-loudness-war)
- Écraser la voix pour atteindre une valeur de sonie. [Sound On Sound](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
- Débruiter une TTS propre et introduire des artefacts. [Audacity](https://manual.audacityteam.org/man/noise_reduction.html)
- Laisser le ducker pomper ou compenser automatiquement son atténuation. [Sound On Sound](https://www.soundonsound.com/techniques/ducking-mixdown)
- Confondre RMS apparié et sonie intégrée conforme. [Matchering](https://github.com/sergree/matchering) · [UIT](https://www.itu.int/rec/r-rec-bs.1770/_page.print)
- Oublier le délai ajouté par le traitement neuronal. [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet)

**4. Check-list de fin**

- [ ] Chaque mot reste intelligible dans le mix complet. [TikTok](https://www.tiktok.com/business/library/Top_Tips_One_Pager_SMB.pdf)
- [ ] Aucun mot coupé par gate ou nettoyage. [Sound On Sound](https://www.soundonsound.com/techniques/producing-professional-voiceovers-home-part-1)
- [ ] Le ducking ne produit aucune remontée gênante. [Sound On Sound](https://www.soundonsound.com/techniques/ducking-mixdown)
- [ ] Le rapport final contient LUFS intégrés, LRA et true peak. [EBU](https://tech.ebu.ch/publications/r128)
- [ ] Le fichier encodé respecte le plafond choisi. [EBU Tech 3343](https://tech.ebu.ch/docs/tech/tech3343-v2.pdf)
- [ ] La sortie YouTube est à 48 kHz. [YouTube](https://support.google.com/youtube/answer/1722171?hl=en)
- [ ] Les délais audio/vidéo ont été contrôlés après traitement. [EBU R37](https://tech.ebu.ch/docs/r/r037.pdf)

**5. Outils open source utiles**

| Outil | Étoiles ; licence | Usage ; alertes |
|---|---|---|
| [Matchering](https://github.com/sergree/matchering) | ≈2,7 k ; GPL-3.0 | Mastering par appariement à une référence ; candidat pour musique et comparaison de masters. **Copyleft si redistribution du logiciel** ; reproductibilité bit à bit : **not found**. |
| [automix-toolkit](https://github.com/csteinmetz1/automix-toolkit) | 119 ; Apache-2.0 | Expérimenter le mixage neuronal de stems. Les [exemples préentraînés](https://github.com/csteinmetz1/automix-toolkit/blob/main/README.md) portent sur la batterie ; adaptation voix/musique : travail supplémentaire. Déterminisme et licence distincte des checkpoints : **not found**. |
| [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet) | ≈4,9 k ; code MIT ou Apache-2.0 | Débruiter la parole en 48 kHz ; compensation de délai disponible. Garantie bit à bit : **not found** ; pour l’exécution PyTorch, voir les [limites de reproductibilité](https://docs.pytorch.org/docs/2.14/notes/randomness.html). |
| [RNNoise](https://github.com/xiph/rnnoise) | ≈5,9 k ; BSD-3-Clause | Suppression de bruit de parole, bibliothèque C ; exemple mono PCM 48 kHz. L’entraînement dépend des graines aléatoires ; garantie bit à bit en inférence : **not found**. |
| [FFmpeg](https://github.com/FFmpeg/FFmpeg) | ≈65,5 k ; LGPL principalement, GPL selon composants | Automatiser ducking, assemblage, normalisation et analyse avec [les filtres](https://ffmpeg.org/ffmpeg-filters.html). **Vérifier la compilation distribuée** : certaines combinaisons `nonfree` ne sont pas redistribuables. [Licence](https://ffmpeg.org/legal.html) |

**6. Court vertical / long horizontal**

- **Court : [studio]** contrôler chaque export court séparément et privilégier l’intelligibilité immédiate sur téléphone ; le contexte mobile peut modifier la dynamique à la lecture. [Meta](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/)
- **Long : [studio]** vérifier aussi les transitions entre séquences ; employer la LRA pour décider de la compression selon genre et public, sans imposer une valeur unique. [EBU Tech 3343](https://tech.ebu.ch/docs/tech/tech3343-v2.pdf)
- **Les deux :** ne pas déduire une cible LUFS du seul rapport 9:16 ou 16:9 ; les sources consultées décrivent des exigences d’encodage et des contextes de lecture. [YouTube](https://support.google.com/youtube/answer/1722171?hl=en) · [Meta](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/)

## Monteur

**1. Ce que fait un très bon professionnel**

- Choisit les coupes selon émotion, récit, rythme et direction du regard. [Walter Murch, *In the Blink of an Eye*, extrait](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- Assemble d’abord la structure principale, puis les images qui l’éclairent. [Guide de production, Land Trust Alliance](https://a.storyblok.com/f/120093/x/21ae37aee6/creating-video-for-impact.pdf)
- Décale intelligemment les coupes son et image pour anticiper ou prolonger une scène. [Adobe](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
- Vérifie la compréhension et révise les passages problématiques à partir de la rétention. [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)

**2. Règles concrètes**

1. Arbitrer les coupes selon l’ordre de Murch — émotion 51 %, récit 23 %, rythme 10 %, regard 7 %, plan 5 %, espace 4 % ; pondérations indicatives. [Extrait de Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
2. Préférer une coupe émotionnellement juste à une continuité spatiale parfaite — repère : hiérarchie précédente. [Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
3. Construire le montage principal avant de remplir de b-roll — narration/interview d’abord. [Land Trust Alliance](https://a.storyblok.com/f/120093/x/21ae37aee6/creating-video-for-impact.pdf)
4. Choisir chaque insert pour expliquer ou contextualiser la phrase — **[studio]**, consigner sa fonction. [Land Trust Alliance](https://a.storyblok.com/f/120093/x/21ae37aee6/creating-video-for-impact.pdf)
5. Ancrer les inserts réactifs sur les mots de la voix finale — **[studio]**, utiliser des timestamps par mot puis vérifier. [WhisperX](https://github.com/m-bain/whisperX)
6. Réviser manuellement l’alignement des nombres et mots non alignés — WhisperX signale des limites sur certains caractères et formes écrites. [WhisperX](https://github.com/m-bain/whisperX)
7. Faire commencer le son suivant avant son image pour préparer une révélation — J-cut. [Adobe](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
8. Prolonger le son précédent sur l’image suivante pour maintenir le lien — L-cut. [Adobe](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
9. Motiver les match cuts par une correspondance visuelle ou sonore — forme, mouvement ou continuité perceptive. [Adobe](https://www.adobe.com/in/creativecloud/video/discover/match-cut.html)
10. Employer les changements de rythme comme accents narratifs — **[studio]** ; cadence universelle de « pattern interrupt » : **not found**. [Priorités de Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
11. Pour TikTok, tester une proposition compréhensible dans les 3 premières secondes — repère publicitaire. [TikTok](https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en)
12. Pour TikTok, concentrer l’accroche dans les 6 premières secondes — point de départ à tester, pas garantie de succès. [TikTok](https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en)
13. Pour YouTube long, vérifier la promesse titre/miniature dans les 30 premières secondes — repère du rapport « intro ». [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)
14. Examiner chaque pic de rétention — il peut signaler un intérêt fort ou une incompréhension nécessitant relecture. [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)
15. Examiner les creux avant d’ajouter des effets — ils correspondent à des abandons ou sauts. [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)
16. Définir les clips par début et durée ; employer une fin exclusive — **[studio]**, éviter images doubles et trous aux jonctions. [OpenTimelineIO](https://opentimelineio.readthedocs.io/en/latest/tutorials/time-ranges.html)
17. Distinguer temps du média source et temps de la timeline — ne pas réutiliser un timestamp sans conversion. [OpenTimelineIO](https://opentimelineio.readthedocs.io/en/latest/tutorials/time-ranges.html)
18. Réserver les images nécessaires aux transitions — les plages visibles dépassent les plages coupées. [OpenTimelineIO](https://opentimelineio.readthedocs.io/en/latest/tutorials/time-ranges.html)
19. Conserver la cadence de production à l’export YouTube — éviter une conversion sans nécessité. [YouTube](https://support.google.com/youtube/answer/1722171?hl=en)
20. Vérifier textes et sujets dans la zone sûre du placement — TikTok fournit des gabarits variables selon format et interface. [TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en)

**3. Erreurs fréquentes à interdire**

- Couper uniquement sur le beat en sacrifiant récit et émotion. [Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- Ajouter du b-roll décoratif qui n’éclaire pas la narration. [Land Trust Alliance](https://a.storyblok.com/f/120093/x/21ae37aee6/creating-video-for-impact.pdf)
- Croire qu’un pic de rétention prouve toujours la réussite du passage. [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)
- Appliquer la suppression automatique à toutes les pauses dramatiques. **[studio]** [Fonction d’Auto-Editor](https://github.com/WyattBlue/auto-editor) · [Priorité émotionnelle](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- Confondre timestamp source, timestamp de piste et position d’un marqueur. [OpenTimelineIO](https://opentimelineio.readthedocs.io/en/latest/tutorials/time-ranges.html)
- Reprendre une composition horizontale sans vérifier les masques de l’interface verticale. [TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en)

**4. Check-list de fin**

- [ ] Chaque coupe sert émotion, récit ou rythme. [Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/)
- [ ] Chaque insert apporte une information ou un contexte. [Land Trust Alliance](https://a.storyblok.com/f/120093/x/21ae37aee6/creating-video-for-impact.pdf)
- [ ] Les J/L-cuts sont intentionnels et correctement orientés. [Adobe](https://helpx.adobe.com/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
- [ ] Les jonctions et plages de transition sont valides. [OpenTimelineIO](https://opentimelineio.readthedocs.io/en/latest/tutorials/time-ranges.html)
- [ ] Les inserts et sous-titres correspondent à la voix finale vérifiée. [WhisperX](https://github.com/m-bain/whisperX)
- [ ] Les éléments essentiels restent dans la zone sûre de chaque déclinaison. [TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en)
- [ ] Le début tient la promesse éditoriale ; les données de rétention disponibles ont été examinées. [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)

**5. Outils open source utiles**

| Outil | Étoiles ; licence | Usage ; alertes |
|---|---|---|
| [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO) | ≈2 k ; Apache-2.0 | Décrire clips, pistes, transitions et marqueurs ; échanger la timeline entre agents. C’est un format/API éditorial, pas le moteur de rendu Three.js. |
| [WhisperX](https://github.com/m-bain/whisperX) | ≈24,8 k ; BSD-2-Clause | Produire l’alignement mot à mot pour inserts, sous-titres et cues. Vérifier les licences des modèles sélectionnés ; **reproductibilité bit à bit non garantie par PyTorch**. [Limites](https://docs.pytorch.org/docs/2.14/notes/randomness.html) |
| [Auto-Editor](https://github.com/WyattBlue/auto-editor) | ≈5,6 k ; Unlicense | Proposer un premier retrait de silences à partir de l’analyse audio ; valider les coupes avant adoption. Garantie bit à bit : **not found**. |

**6. Court vertical / long horizontal**

| Court vertical | Long YouTube 16:9 |
|---|---|
| Tester proposition à 3 s et accroche dans les 6 premières secondes ; repères issus des publicités TikTok. [TikTok](https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en) | Évaluer particulièrement les 30 premières secondes et leur cohérence avec titre/miniature. [YouTube](https://support.google.com/youtube/answer/9314415?hl=en) |
| Recomposer les inserts et textes pour le 9:16 et les zones sûres. [TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) | Exploiter le cadre 16:9 standard du lecteur sur ordinateur. [YouTube](https://support.google.com/youtube/answer/1722171?hl=en) |
| **[studio]** Limiter chaque insert à une fonction immédiatement identifiable. [Principe du b-roll](https://a.storyblok.com/f/120093/x/21ae37aee6/creating-video-for-impact.pdf) | **[studio]** Faire varier les durées selon compréhension et émotion ; aucune durée universelle de plan documentée : **not found**. [Murch](https://blogs.ischool.berkeley.edu/i290-viznarr-s12/the-rule-of-six-walter-murch/) |

**Cinq rôles ou contrôles supplémentaires proposés**

1. **Responsable de reproductibilité** — figer versions, modèles, graines et médias intermédiaires ; comparer les sorties avant validation. [Limites PyTorch](https://docs.pytorch.org/docs/2.14/notes/randomness.html)
2. **Contrôleur de synchronisation** — vérifier début, milieu et fin après traitements ; utiliser un flash/blip dans une copie technique. [EBU R37](https://tech.ebu.ch/docs/r/r037.pdf)
3. **Responsable des droits et de la provenance** — conserver licences et attributions des sons ; distinguer droits des médias et licence du logiciel. [Freesound](https://freesound.org/help/faq/) · [GNU](https://www.gnu.org/licenses/gpl-faq.en.html)
4. **Réviseur voix/sous-titres** — contrôler noms propres, nombres, texte prononcé et alignement final. [Limites WhisperX](https://github.com/m-bain/whisperX)
5. **Contrôleur de publication et rétention** — vérifier le rendu effectivement lu sur plateforme, puis transformer pics et creux en hypothèses de remontage. [Meta](https://engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/) · [YouTube](https://support.google.com/youtube/answer/9314415?hl=en)
