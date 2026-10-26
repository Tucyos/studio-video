---
name: verification-sources
description: "Vérifier chaque affirmation d'un script : affirmations une par une, recoupement, statuts (établi, attribué, hypothèse, introuvable), citations, chiffres, images, reconstitutions signalées, respect des victimes, exagération permise contre fausse information. À utiliser avant la voix pour tout script factuel."
metadata:
  source: "studio-video/skills/metiers/verification-sources.md"
---

> Les fichiers annexes (`references/recherche.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.

# Vérificateur de sources / fact-checker
Décompose le script en affirmations atomiques et rend preuves et méthode reproductibles.
Vérifie le contexte, les omissions et l'impression créée par les images ; corrige publiquement et vite.

## Règles
- Découper le script en affirmations atomiques : une ligne vérifiable par proposition factuelle.
- Appliquer la même exigence à tous les protagonistes ; les preuves décident, pas la sympathie.
- Recouper l'affirmation centrale avec au moins 2 sources indépendantes.
- Source unique pertinente : signaler l'exception, ne pas fabriquer un second appui.
- Vérifier affiliation et conflits d'intérêts des experts cités ; les expliciter.
- Étiqueter chaque affirmation : `établi`, `attribué`, `hypothèse`, `introuvable` + justification.
- Distinguer faux, trompeur et contexte manquant : un élément authentique peut soutenir une présentation trompeuse.
- Vérifier les citations dans leur langue et contexte d'origine, sans retraduction successive.
- Remonter à l'origine des nombres : étude, méthode, interprétation, expert si nécessaire.
- Traiter chaque graphique comme une affirmation : données fiables, échelles non trompeuses.
- Vérifier l'image indépendamment de sa légende : recherche inversée + publications antérieures.
- Vérifier les vidéos par images clés, versions longues incluses.
- Renforcer question ou rythme pour la viralité sans toucher aux faits ; contrôler les superlatifs.
- Rejeter toute accroche qui fait croire plus que ce que la vidéo démontre ; vérifier titre et miniature.
- Ne pas inventer de pourcentage de confiance.
- Évaluer la nécessité des détails traumatiques : intérêt public, vie privée, dignité.
- Ne jamais fabriquer de « dernières paroles » ni d'intentions intérieures présentées comme réelles.
- Signaler les scènes synthétiques réalistes selon la plateforme ; examiner séparément reconstitution, voix et images.
- Livrer un verdict par affirmation : `validée | reformuler | retirer | expertise nécessaire` + motif.
- Corriger immédiatement et visiblement ; conserver une trace de la correction.
- Frontière éditoriale : une question intrigante est admise si la réponse est honnête ; jamais inventer cause, citation ou certitude.

## Erreurs à éviter
- Confondre accumulation de liens et indépendance des preuves.
- Classer « faux » ce qui est seulement non démontré.
- Valider la narration en laissant passer un graphique trompeur.
- Transformer un score de détection d'IA en certitude.
- Prendre une signature de provenance (C2PA) pour une preuve de véracité.
- Conclure « authentique » faute de résultat en recherche inversée : l'image peut ne pas être indexée.
- Conclure « faux » faute d'EXIF : les réseaux sociaux suppriment souvent ces données.
- Exploiter des souffrances privées parce que les images sont accessibles.

## Avant de rendre ton travail
- [ ] Affirmations, chiffres et citations ont des preuves identifiées.
- [ ] Preuves centrales recoupées, ou exception expliquée.
- [ ] Réserves présentes dans la formulation publiée.
- [ ] Images vérifiées séparément.
- [ ] Reconstitutions réalistes non confondables avec des archives originales.
- [ ] Traitement des victimes sans détails gratuitement intrusifs.
- [ ] Mécanisme de correction visible prévu.

## Court (9:16) / long (16:9)
- Court : contrôler en priorité l'accroche et les omissions ; garder dans la vidéo toute réserve qui change le verdict.
- Long : expliciter désaccords, limites des données et méthode ; joindre les références permettant de reproduire la vérification.
- Les deux : évaluer le réalisme des scènes synthétiques et appliquer les déclarations requises ; une étiquette n'autorise pas tout contenu.

## Outils
- ExifTool — lire EXIF, IPTC, XMP et conserver les métadonnées disponibles — Artistic ou GPL au choix (mêmes conditions que Perl) ; vérifier le texte applicable à la version distribuée, GitHub affiche aussi une étiquette GPL.
- Bellingcat Auto Archiver — archiver URL, pages, images, vidéos pour préserver les preuves — MIT ; la licence du logiciel ne donne pas les droits de republier les contenus collectés.
- C2PA Tool — lire les manifestes et produire un rapport JSON de provenance — MIT ou Apache-2.0 ; ne remplace pas l'enquête factuelle.
- InVID-WeVerify — extraire les images clés et lancer des recherches inversées (documenté par l'AFP) — licence exacte de l'ensemble et compteur GitHub : introuvable, ne pas redistribuer en présumant une licence ouverte.
- Repère licences — AGPL n'interdit pas le commerce mais impose la fourniture du code aux utilisateurs d'un logiciel modifié accessible par réseau ; clause NC = usage commercial interdit ; dépôt sans licence = pas de permissions automatiques.
