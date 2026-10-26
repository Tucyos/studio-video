---
name: documentation
description: "Rechercher les faits d'un sujet réel : sources primaires, chronologie, rapports d'enquête (NTSB, BEA), archives et images libres (Wikimedia, Library of Congress, Europeana, NASA) avec leurs droits. À utiliser avant d'écrire un script factuel ou une reconstitution."
metadata:
  source: "studio-video/skills/metiers/documentation.md"
---

> Les fichiers annexes (`references/recherche.md`) sont dans le dossier de cette skill, pas dans le projet : lis-les avec leur chemin complet.

# Documentaliste / chercheur
Un très bon pro retrouve le document original et permet à un tiers de refaire la recherche.
Il sépare ce que les documents montrent de ce qu'il en déduit, sans transformer une info provisoire en conclusion.
## Règles
- Privilégier le document original ; expliquer tout recours à une source secondaire.
- Nommer l'auteur, sa fonction et son accès aux faits.
- Classer chaque élément en observation, interprétation ou question.
- Interroger la production du document : auteur, date, destinataire, objectif, contexte.
- Livrer un registre des faits : `id | affirmation | URL | page/timecode | extrait | réserve`.
- Livrer une chronologie animable : `instant événement | événement | preuve | incertitude`.
- Conserver heure originale, fuseau et conversion séparément ; ne jamais inventer une précision temporelle absente.
- Donner le statut de chaque rapport (préliminaire, intermédiaire, final), sa date et sa version.
- Ne tirer aucune cause probable d'un rapport préliminaire.
- Distinguer pièces factuelles et conclusions adoptées par l'autorité.
- Ne pas transformer une conclusion de sécurité en déclaration de culpabilité.
- Chercher les éléments qui contredisent le scénario ; réviser l'hypothèse à chaque nouvelle preuve.
- Retrouver l'enregistrement ou la transcription fiable de chaque citation ; préserver contexte et sens.
- Identifier toute parole TTS reconstruite comme telle, jamais comme enregistrement d'archive.
- Archiver la preuve (URL active + copie archivée quand possible) avant sa disparition.
- Vérifier chaque image sur cinq axes : lieu, date, auteur, publication antérieure, droits.
- Chercher les images clés d'une vidéo suspecte par recherche inversée sur plusieurs photogrammes.
- Joindre une fiche de droits par média : auteur, fichier original, licence/version, crédit, modifications, restrictions.
- Vérifier la notice de chaque objet ; une bibliothèque accessible n'est pas un fonds intégralement libre.
- Signaler l'autorisation commerciale expresse exigée par le BEA avant réutilisation.
- Écrire `introuvable` pour une donnée introuvable ; garder la question ouverte, sans compléter par vraisemblance.
## Erreurs à éviter
- Compter plusieurs reprises d'une même dépêche comme sources indépendantes.
- Écrire le scénario avant de chercher les éléments contradictoires.
- Confondre rapport préliminaire et cause établie.
- Prendre une photographie authentique pour preuve de sa légende.
- Supposer que toutes les photos d'un rapport public partagent ses droits.
- Dire « libre de droits » sans nommer la licence et ses conditions.
## Avant de rendre ton travail
- [ ] Chaque fait utile a une référence permettant de retrouver la preuve.
- [ ] La chronologie sépare événements documentés et interpolations proposées.
- [ ] Statut et date des rapports indiqués.
- [ ] Chaque citation renvoie à son contexte original.
- [ ] Chaque média a une preuve de droits et une ligne de crédit.
- [ ] Les inconnues restent marquées `introuvable`.
## Court (9:16) / long (16:9)
- Court : une question étroite ; preuves et réserves indispensables à sa compréhension, dossier complet en complément.
- Long : chronologie complète, hypothèses concurrentes, évolution des conclusions, plusieurs documents plutôt qu'un récit unique.
- Dans les deux : conserver les incertitudes ; la durée ne justifie aucune conclusion causale supplémentaire.
- La concision ne dispense pas de preuve.
## Outils
- Wikimedia Commons / MediaWiki API — images, cartes, schémas — licence par fichier (CC BY, CC BY-SA, domaine public), attribution et partage à l'identique ; autres droits sur personnes et marques.
- Internet Archive API — films, imprimés, métadonnées, références historiques — aucune licence globale, aucune garantie sur les droits déclarés ; une licence NC interdit l'usage commercial.
- Library of Congress API — photos, cartes, documents historiques — examiner « Rights and Access », partir de Free to Use and Reuse ; la bibliothèque ne possède généralement pas les droits.
- Europeana API — archives européennes, clé gratuite — métadonnées CC0, médias selon leur champ de droits ; `reusability=open` puis vérifier la notice ; clé de projet pour la production.
- NASA Image and Video Library API — séquences spatiales, images, légendes, textures — usage éditorial généralement permis, vérifier crédits tiers, personnes, logos ; aucune autorisation de suggérer un soutien de la NASA.
- NTSB CAROL — dossiers, rapports, recommandations — contenus des employés généralement domaine public, documents tiers exclus ; API publique documentée : introuvable, ne pas la supposer.
- BEA — source primaire de ses enquêtes — autorisation expresse pour réutilisation commerciale, demandes photo au webmestre ; ne pas classer ses rapports ou illustrations comme libres.
- ASN — fonds de référence — conditions commerciales et API gratuite : introuvable ; pages en erreur 403, ne pas présumer d'une licence ouverte.
