# Style « tt-lemondedelaf1 »

Tiré de 1 référence(s) : r1 = TikTok_7698252864820497697.mp4 (90.87 s, 9:16, fr). Le 20/10/2026.
Mesuré par le code : plan médian 4 s ; coupes par 10 s 1.65 ; bascules de caméra par 10 s 0 (durée médiane null s) ; 213 mots/min ; voix sur 73 % de la durée ; -21.6 LUFS.
Non mesuré : niveau de la musique sous la voix (pistes séparées nécessaires) ; fondus (décrits par Haiku). Caméra : estimation approximative.
On reprend le rythme, le cadrage et la grammaire ; jamais les personnages ni l'identité visuelle des références. Images numérotées à 30 i/s (planches dans refs/rN/planches/).

| ID | règle | valeur | déclencheur | preuves (vidéo#image « mot ») | méthode | confiance | exceptions |
|---|---|---|---|---|---|---|---|
| R01 | [Rythme et coupes] Garde des plans de 4 s en médiane ; ne descends pas sous 2,2 s (p10) et monte jusqu'à environ 11,4 s (p90) | plan_median_s 4 (120 images) ; plan_p10_s 2.2 (66 images) ; plan_p90_s 11.43 (343 images) | Chaque nouveau plan | r1#1 « En » (plan 1-124 = 4,13 s) ; r1#2007 « Mais » (plan 2000-2152 = 5,1 s) | mesure | basse | — |
| R03 | [Rythme et coupes] Aucun plan de moins de 1 s ; le plus court fait 53 images | plans_courts_moins_1s 0 ; plan le plus court 1,77 s (2153-2205) | Envie de couper vite sur un mot | r1#2159 « trafic » (plan 2153-2205) | mesure | basse | — |
| R04 | [Rythme et coupes] La majorité des plans dure plus de 3 s ; réserve les plans de 11 à 14 s aux mises en situation et à la conclusion | plans_longs_plus_3s 10 sur 16 ; 11,43 s, 11,27 s et 13,83 s | Récit d'une situation (« Imagine »), résolution, conclusion | r1#348 « tu » (plan 318-660, 11,43 s) ; r1#1667 « Elle » (plan 1662-1999, 11,27 s) ; r1#2324 « pourquoi » (plan 2312-2726, 13,83 s) | mesure | basse | — |
| R05 | [Rythme et coupes] Dans une énumération, donne un plan à chaque élément et raccourcis : 1,77 à 5,1 s | plans 2000-2152 (5,1 s), 2153-2205 (1,77 s), 2206-2311 (3,53 s) | Liste de risques ou d'étapes dite d'une traite | r1#2102 « Des » ; r1#2157 « du » ; r1#2210 « un » | mesure | basse | — |
| R06 | [Rythme et coupes] Un plan = une idée : chaque moment narratif commence sur une coupe | moments 16 = plans 16 ; moment_median_s 4 | Nouvelle phrase-idée ou nouvelle étape du raisonnement | r1#764 « quatre » (moment 751-816) ; r1#1281 « Freinez » (moment 1278-1496) | mesure | basse | — |
| R07 | [Rythme et coupes] Place la coupe juste avant l'attaque du mot qui ouvre le plan, environ 3 images avant | coupe_moins_mot_images_median 3 ; coupes_a_2_images_d_un_mot 0.13 | Premier mot du plan suivant | r1#663 « Box, » (coupe à 661) ; r1#1281 « Freinez » (coupe à 1278) ; r1#2157 « du » (coupe à 2153) | mesure | basse | coupe 751 → quatre@764 (13 images) |
| R08 | [Rythme et coupes] Entre deux phrases, mets la coupe dans le silence et non sur la fin du mot | coupe 2000 entre places.@1968 et Mais@2007 ; coupe 817 entre repars.@806 et Pendant@836 ; coupe 125 entre piste.@112 et Tu@141 | Fin de phrase suivie d'une pause | r1#1968 « places. » ; r1#806 « repars. » ; r1#112 « piste. » | mesure | basse | — |
| R09 | [Rythme et coupes] Laisse le mot d'accroche (« Imagine, », « Toi, », « Voilà ») sur le plan précédent et coupe avant la suite de la phrase | Imagine,@315 → coupe 318 ; Toi,@1154 → coupe 1162 ; Voilà@2311 → coupe 2312 | Interjection ou apostrophe qui lance la phrase suivante | r1#315 « Imagine, » ; r1#1154 « Toi, » ; r1#2311 « Voilà » | mesure | basse | — |
| R10 | [Caméra] Caméra fixe sur tous les plans : pas de panoramique, pas d'inclinaison, pas de zoom mesurables | 16/16 « fixe ou lent » ; pan_pct, tilt_pct et zoom_pct à 0 | Tous les plans | r1#1 « En » ; r1#360 « voiture » ; r1#2324 « pourquoi » | mesure | basse | Les descriptions voient un « zoom lent en entrée » (moment 2, 125-317) et un « zoom léger » (moment 7, 1084-1161), non confirmés par la mesure |
| R11 | [Caméra] Aucune bascule de caméra : on change de point de vue uniquement par la coupe | bascules_camera 0 ; bascules_par_10s 0 | Changement de zone à montrer | r1#1497 « suivant, » (nouvelle zone de piste après la coupe 1497) | mesure | basse | — |
| R12 | [Caméra] Le mouvement vient de l'intérieur du cadre : les objets se déplacent et les trajectoires se dessinent progressivement, la caméra ne bouge pas | — | Explication d'une action (dépasser, rentrer, ressortir) | r1#35 « dépasser » ; r1#280 « Undercut » ; r1#1771 « la » (« elle rejoint la piste ») | observation | basse | — |
| R13 | [Cadrage] Format vertical 9:16 | 576×1024, 30 i/s | Tout le montage | r1#1 « En » | mesure | basse | — |
| R14 | [Cadrage] Plan large vu de dessus, avec tout le terrain de l'action dans le cadre | 14 moments décrits sur 16 en plan large ou très large | Mise en situation, position relative des éléments | r1#360 « voiture » ; r1#1730 « ligne » ; r1#2367 « duel » | observation | basse | moments 7 et 8 (1084-1277) en gros plan relatif |
| R15 | [Cadrage] Resserre sur un seul objet (environ 40 % de l'image) quand la voix parle d'une de ses propriétés | gros plan relatif sur 2 moments (1084-1161, 1162-1277) | Focus sur un détail (pneus, température) | r1#1124 « pneus » ; r1#1206 « température, » | observation | basse | — |
| R16 | [Cadrage] Garde le même angle d'un plan à l'autre : la coupe change la zone montrée, pas l'axe de prise de vue | tous les moments décrits « vue aérienne » | Chaque coupe | r1#125 (coupe) → r1#141 « Tu » ; r1#1579 (coupe) → r1#1589 « Et » | observation | basse | — |
| R17 | [Textes à l'écran] Mets un titre fixe en haut, en majuscules sans-serif grasses, à raison d'un titre par plan, remplacé à la coupe | — | Chaque nouveau plan | r1#368 « rouge. » (« BLOQUÉ DERRIÈRE ») ; r1#663 « Box, » (« LA DÉCISION ») ; r1#2159 « trafic » (« DU TRAFIC À LA SORTIE ») | observation | basse | Un même titre court sur 2 plans : 1084-1277 et 1497-1661 |
| R18 | [Textes à l'écran] Le titre résume le plan en 2 à 5 mots et reprend les mots que dit la voix | « L'UNDERCUT », « QUATRE PNEUS NEUFS », « UN ARRÊT RATÉ » | Mot-clé prononcé dans le plan | r1#280 « Undercut » ; r1#764 « quatre » ; r1#2215 « arrêt » | observation | basse | — |
| R19 | [Textes à l'écran] Dans un plan long, change le titre à chaque étape de l'énoncé au lieu de couper | 3 titres dans 1278-1496 ; 2 titres dans 1662-1999 et dans 2312-2726 | Énoncé en plusieurs phases dans un même plan | r1#1281 « Freinez » ; r1#1324 « Passez » ; r1#1369 « Réaccélérez » | observation | basse | — |
| R20 | [Textes à l'écran] Sous-titres en bas, petits, qui affichent les mots-clés au fil de la voix | — | Chaque mot-clé prononcé | r1#505 « impossible » ; r1#964 « énormément » ; r1#2057 « échouer. » | observation | basse | Moment 16 : texte descriptif long en bas |
| R21 | [Textes à l'écran] Ouvre et ferme sur un titre en forme de question | « DÉPASSER SANS DOUBLER ? » en ouverture, « TU RENTRES OU TU RESTES ? » en fin | Premier plan et dernier plan | r1#1 « En » ; r1#2645 « ou » | observation | basse | — |
| R22 | [Textes à l'écran] Fais apparaître des encadrés en surimpression sur le mot de la décision clé | encadrés entre 661 et 750 | Ordre ou décision décisive dans le récit | r1#663 « Box, » ; r1#729 « quittes » | observation | basse | — |
| R23 | [Transitions] Uniquement des coupes franches : pas de fondu, pas de volet, pas d'effet | 15 coupes « franche » sur 15 ; fondus non mesurés, toutes les descriptions disent « coupe franche » | Chaque changement de plan | r1#663 « Box, » ; r1#1589 « Et » ; r1#2324 « pourquoi » | mesure | basse | — |
| R24 | [Transitions] À l'intérieur d'un plan, le changement passe par des éléments qui s'ajoutent un par un (annotations, trajectoires) | — | Information ajoutée sans changer de plan | r1#1854 « Aucun » ; r1#1012 « Mais » | observation | basse | — |
| R25 | [Mot -> image] Fais apparaître l'élément qui illustre le mot-clé à environ 10 images du mot, avant ou après | impossible@505 → image 513 ; température@1206 → image 1195 | Mot-clé concret | r1#505 « impossible » ; r1#1206 « température, » | observation | basse | terrain@987 → image 1045 (58 images de retard) |
| R26 | [Mot -> image] Montre chaque action de l'énoncé par la position de l'objet sur le décor (entrée, milieu, sortie) | 1278-1340, 1371-1403 et 1434-1496 | Suite de verbes d'action | r1#1281 « Freinez » ; r1#1324 « Passez » ; r1#1369 « Réaccélérez » | observation | basse | — |
| R27 | [Mot -> image] Donne à chaque protagoniste un code visuel constant et fais-le désigner par ce code à l'oral | — | Récit à deux protagonistes | r1#368 « rouge. » ; r1#444 « bleue. » ; r1#1539 « bleue » | observation | basse | — |
| R28 | [Voix et son] Débit rapide et voix presque continue | mots_par_minute_de_voix 213 ; part_de_voix 0.73 ; 236 mots | Toute la narration | r1#28 « tu » ; r1#1206 « température, » | mesure | basse | — |
| R29 | [Voix et son] Pauses courtes entre les phrases | pause_mediane_s 0.58 (environ 17 images) ; pause_p90_s 0.9 (27 images) | Fin de phrase | r1#215 « devant. » → Ça@250 ; r1#1968 « places. » → Mais@2007 | mesure | basse | — |
| R30 | [Voix et son] Narration au « tu » et à l'impératif, qui place le spectateur dans l'action | — | Toute la narration | r1#28 « tu » ; r1#1615 « regarde » ; r1#2489 « tu » | observation | basse | — |
| R31 | [Voix et son] Sonie intégrée visée | lufs -21.6 ; musique sous voix non mesurée | Mixage final | r1#1 « En » | mesure | basse | — |

## À vérifier (preuve ou valeur non retrouvée par le contrôle)

| ID | règle | valeur | déclencheur | preuves | méthode | confiance | exceptions | problème |
|---|---|---|---|---|---|---|---|---|
| R02 | [Rythme et coupes] Coupe à une cadence lente et régulière, sans rafale | coupes_par_10s 1.65 ; 16 plans pour 90,87 s | Toute la durée | r1#663 « Box, » (coupe à 661) ; r1#1168 « si » (coupe à 1162) | mesure | basse | — | ⚠ valeur « coupes_par_10s 1.65 ; 16 plans pour 90,87 s » : 90.87 introuvable(s) dans les mesures |

## Retenu depuis le studio (défaut -> cause -> correction)

| ID | règle | valeur | déclencheur | preuves | méthode | confiance | exceptions |
|---|---|---|---|---|---|---|---|

