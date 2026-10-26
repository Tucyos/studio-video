
# La direction artistique : une bibliothèque de fiches

Les DA vivent **toutes** dans `C:\claude\studio-projets\_styles\<id>\`. Il y en a des dizaines, et Noam en crée sans cesse : on n'en charge **qu'une**, celle du projet.

## Une fiche
| Fichier | Contenu |
|---|---|
| `da.md` | le look complet et les consignes pour le refaire |
| `bible.md` | (DA d'un compte de Noam : `da-auto`, `da-koan`, `da-pixel-rose`) la bible détaillée du compte : couleurs, typos, habillage, interdits |
| `son.md` | le son de la DA : la voix (Enzo pour le compte auto, Velvet Anchor 3 pour Koan…), musique ou pas, style des bruitages, réglages de mix |
| `regles.md` | règles chiffrées (copie d'une vidéo) ou retenues à la main |
| `fiche.json` | genre (`da` ou `inspiration`), famille, titre générique, statut (validée, utilisée, aimée, essai, rejetée…), origine, compte |
| `exemples/`, `refs/` | images de référence |

## Trouver la DA d'une vidéo
1. Le `README.md` de la vidéo dit `DA : <id>` (dans le studio : `project.json` → `style`).
2. Sinon, la DA par défaut du compte (skill `video` §2).
3. Une vidéo copiée sur un créateur : chercher `tt-<compte>` dans `_styles/` (ex. `tt-racing-geometry`, `tt-3blue1brown`).

Lire `da.md`, puis `bible.md`, `son.md` et `regles.md` s'ils existent. Rien d'autre.

## Créer une DA
Un nouveau dossier `_styles/<id>/` (id court, il ne change jamais) avec `da.md` + `son.md` (la voix et les sons qui vont avec ce look) + `fiche.json` (titre **générique** : ce qu'on voit, pas le nom d'un compte) + `exemples/`. Les planches et essais d'une vidéo restent aussi dans `<vidéo>/da/` (mémoire « garder les planches de DA »).

## Règles de Noam (tous comptes)
- **Se mettre d'accord avant de fabriquer** : demander ce qu'il veut, une seule référence, peu d'images finies (mémoire du 19/10).
- Les essais de DA se font **en code** (Python, canvas, Three.js, Blender), pas avec un générateur d'images, sauf s'il le demande.
- **Jamais de liseré coloré** à gauche d'un titre ou d'une étiquette (« fait IA »).
- Une vidéo dont on ne garde que des idées est une **inspiration**, pas une DA.

Règles des pros (repères chiffrés) : `references/pratiques-pro.md`.
