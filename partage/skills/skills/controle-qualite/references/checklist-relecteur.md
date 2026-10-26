# Check-list du relecteur vidéo

*Repères tirés de Huashu Design (MIT), mesurés sur des démos de produit 16:9, plus lentes qu'un TikTok. Les règles chiffrées de la DA du projet (mesurées sur ses vidéos de référence) passent avant.*

## Posture

- Deux couches : la mesure objective (ffmpeg, pixels, métadonnées) est le **plancher** ; le modèle lit le sens, l'intention, la composition. Ne jamais faire compter par un modèle ce qu'un filtre peut compter.
- **La détection objective est le plancher de la boucle ; le modèle juge le sens.** Sans le tableau des images figées, le relecteur IA ne trouvait que 3 segments morts sur 14.
- Le contrôle mécanique **ne dit jamais si c'est beau**. Il rend : cassé, limite, ou propre.
- Joindre le brief et la note de réalisation au relecteur : sans eux, une intention passe pour un défaut, et un défaut pour une intention.
- Gravité : ⚠️ fatal = `grave` (à corriger avant de publier) ; ⚡ important = `moyen` ; 💡 suggestion = `info` (goût, pas faute).

## Les 8 points, dans l'ordre

1. **Noir, vide, rendu incomplet** — image noire, cadre vide, objet manquant, rendu arrêté avant la fin. Aucune image vide > 0,3 s hors carton voulu : un fondu sortant + entrant + cascade ≈ 1 s se lit comme un blocage.
2. **Texte** — coupé, débordant, faute, mojibake, lettres superposées. Vérifier aussi que le texte dessiné est bien celui du script.
3. **Recouvrements** — éléments qui se chevauchent à tort (pas ceux qui se masquent volontairement).
4. **Continuité et nature des transitions** — classer chaque raccord : coupe sèche / fondu enchaîné / morphing. Ne jamais confondre un fondu rapide avec une coupe (piège à 15 i/s). Si les réglages demandent « coupes sèches permises », une coupe franche est normale ; si « aucune coupe sèche », elle est ⚡. Un fondu là où le brief demande un morphing est 💡 « transition paresseuse ». Un seul procédé par raccord.
5. **Héros continu** — 1 ou 2 éléments-héros du début à la fin ; chaque scène est un changement d'état du héros, jamais un nouvel objet. Test : « c'est un PPT avec voix ? » = échec.
6. **Segments morts** — d'après les mesures (« passage mort » du rapport : rien ne bouge ≥ 1,5 s ; « plan figé » en dessous), jamais à l'œil. Seuil de démo produit : 3 s. À juger : pause voulue avant une révélation, ou passage mort.
7. **Son contre image** — croiser la table des attaques (`silencedetect`) et la liste des cues : chaque attaque de SFX correspond-elle à un événement visible ? Les cues P0 (frappe, clic, focus, pose de logo) tombent à l'image près.
8. **Composition** — déséquilibre, vide inutile, élément collé au bord, objet sans rôle narratif. En 3D : bords du décor visibles aux deux extrémités de chaque travelling (captures à T début et T fin), et texel < 1 sur les textures vues de près.

## Seuils de la vidéo finie

- Résolution et cadence **exactes** (1080×1920, 30 i/s).
- Durée : ±2 % **ou** ±0,2 s, le plus grand des deux.
- Piste audio présente (ffprobe), même silencieuse.
- `blackdetect d=0.1 pix_th=0.10` : noir au début (< 0,3 s) = échec (décalage d'enregistrement) ; noir à la fin = échec (retour de boucle) ; noir au milieu = avertissement.
- LUFS : cible −14 ± 4 ; alerte hors −18…−10.
- Dans le studio, `check.mjs --video` mesure le noir (début, fin, milieu), les gels et la durée ; la sonie se mesure sur le mix. Un fondu rapide vu sur une seule image peut passer pour une coupe : rendre les images voisines (`node .studio/rendre.mjs`) avant de trancher.

## Lisibilité mesurée

- **Glyphe absent** : chaque caractère doit exister dans la police. Nos polices pixel peuvent manquer `œ`, `«»`, l'espace fine insécable U+202F, `’` → carré ou vide. Le contrôle du studio teste chaque caractère (« lettre absente ») : il compare sa largeur avec deux polices de secours différentes. `document.fonts.check` ne suffit pas : il répond oui même quand le navigateur remplace la lettre.
- **Contraste** : ≥ 4,5 pour le texte normal ; ≥ 3 pour le grand (≥ 24 px, ou ≥ 18,66 px en gras 700). Calculer en composant l'alpha sur le fond opaque le plus proche ; sur image, dégradé ou canvas, répondre « non calculable ». Un élément réutilisé sur fond clair et sombre n'a pas de couleur en dur.
- **Tailles** : à 1080 de large lu sur téléphone, corps ≥ 36 px, étiquette ≥ 28 px, titre ≥ 2,5× le corps (3× idéal). Ces seuils viennent d'images fixes, pas de sous-titres vidéo : à confirmer sur nos captures. Une animation se regarde avec moins d'attention qu'une image fixe → le texte ne rétrécit jamais.
- ≤ 4 couleurs, ≤ 2 polices, écarts sur une grille de 8, vide ≥ 40 % de la surface.
- Test des 3 m : réduire à la taille d'un téléphone ; le plus gros mot doit rester lisible.

## Marques de « fait par IA »

- **Décor de gabarit** (jaune = à supprimer) : ≥ 3 petits libellés en majuscules, interlettrage ≥ 0,06 em, ≤ 15 px ; ≥ 2 chaînes « A · B · C » ; libellés « MOT — fragment » ; ≥ 2 flèches « → » en fin de bouton ; ≥ 4 libellés en chasse fixe ; **un seul mot coloré ou italique dans un titre** (≤ 40 % du titre) ; ≥ 3 numéros 01/02/03 ; même rayon + même ombre répétés ≥ 4 fois. On supprime la structure ; changer le symbole pour esquiver le détecteur ne compte pas.
- **Filet coloré à gauche** : `border-left: 4px solid` + coins arrondis = signature de carte IA, même conclusion que notre règle « jamais de liseré coloré ». Détectable sur canvas : rectangle fin (≤ 12 px) et haut, collé au bord gauche d'un texte, de couleur ≠ texte (pas encore mesuré par le contrôle : à regarder sur les images).

## Tester l'outil de test

- Un aperçu rapide peut mentir : les miniatures du système laissent passer des chevauchements ; LibreOffice rend le chinois en carrés. Passer au même moteur un fichier **connu bon** : s'il échoue aussi, c'est l'environnement, pas le livrable.
- Toujours doubler d'un contrôle mécanique indépendant du moteur : texte source ↔ texte produit, nombre d'éléments par page.
- `test-check.mjs` (21 défauts plantés) vérifie le contrôleur, pas la vidéo.
- Texte = script (pas encore automatique) : comparer les textes visibles à `script.md` / `words.json`, accents, `œ` et guillemets compris.

## Ce que le relecteur ne tranche pas

- Fin et coupes sont des réglages du projet : si « fin : boucle », exiger l'identité première/dernière image ; si « fin : plan large », exiger ≥ 0,8 s immobile (rythme démo produit : à adapter). Aucun des deux n'est un défaut en soi.
- La beauté, la température, l'audace d'une DA ne se mesurent pas : elles se montrent et se choisissent.
