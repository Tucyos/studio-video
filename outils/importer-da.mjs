// importer-da.mjs : remplit la bibliothèque de DA (C:/claude/studio-projets/_styles/) avec les DA déjà testées dans tiktok-motion (lu, jamais modifié)
// et les exemples de design montrés dans les vidéos Creatorize. Une DA = _styles/<id>/ : fiche.json (ce qu'affiche la page DA), da.md (ce que lisent
// Claude et l'équipe), exemples/ (images et vidéos, liens physiques). Relançable : les champs de Noam déjà saisis (notes, tags…) sont gardés.
//   node outils/importer-da.mjs [--seulement id1,id2]
// Noms génériques (compréhensibles par quelqu'un qui ne connaît pas les comptes) ; l'id du dossier ne change jamais (les projets le citent).
import { mkdirSync, writeFileSync, readFileSync, existsSync, linkSync, copyFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { STYLES } from './clone-style.mjs';

const TM = 'C:/claude/tiktok-motion', K = 'videos/Koan', H = `${K}/_bibliotheque-da/hooks`, P = `${K}/ordre-de-naissance/out/hooks`;
const SRC = 'C:/claude/studio-projets/_styles/_sources/creatorize/images';   // images tirées des vidéos Creatorize téléchargées (20/10), à côté de la bibliothèque
const CZ = 'recherches/creatorize/frames', CZO = 'Exemple montré par le créateur de Creatorize (chaîne g russ)', CZS = ['recherches/creatorize/SYNTHESE.md', `${CZ}/haiku_frames_cours.md`];
export const FAMILLES = ['3D réaliste', '3D stylisée', 'Pixel art', 'Papier et illustration', '2D vectorielle', 'Collage', 'Écran et typographie', 'Impression'];
export const STATUTS = { validée: 'validée par Noam', utilisée: 'utilisée dans une vidéo', aimée: 'aimée, à garder', testée: 'essai', rejetée: 'essai rejeté', idée: 'jamais utilisée', exemple: 'exemple Creatorize' };

// c = { id, titre, famille, statut, verdict, compte, origine, skill, utilisee, exemples (chemins tiktok-motion), look: { couleurs, typo, rendu, mouvement }, sources }
const DA = [
  // ---------- 3D réaliste ----------
  { id: 'da-auto', titre: '3D réaliste façon retransmission sportive', famille: '3D réaliste', statut: 'validée', compte: 'Automobile', skill: 'da-auto',
    verdict: 'DA de base du compte auto : radar « parfait », Bugatti v6 finale, Rush, Tesla, Le Mans 66 publiés. Les règles de rythme copiées de deux références 3D (pit stop, Tesla) y sont jointes.',
    utilisee: ['tesla-roadster', 'radar', 'bugatti', 'rush', 'cout-f1', 'fast-furious-nos', 'le-mans-66', 'monza-2021', 'pitstop'],
    exemples: ['videos/Automobile/le-mans-66/out/Le Mans 66 - couverture.png', 'videos/Automobile/tesla-roadster/out/tesla_couverture.png', 'videos/Automobile/radar/out/radar_couverture.png', 'videos/Automobile/pitstop/out/pitstop_couverture.png', 'videos/Automobile/bugatti/out/bugatti_couverture.png', 'videos/Automobile/rush/out/couv/couverture.png'],
    look: { couleurs: 'fond #07090C, jaune « broadcast » #FFD23F, rouge #E10600 (impact et danger seulement), vert #2BD47D, sépia archive #2A1E14 → #E9D7B4', typo: 'Montserrat 900 italique, Inter 700, JetBrains Mono',
      rendu: 'Three.js matériaux physiques + vernis, ACES, décors cuits dans Blender, foules MakeHuman, voitures Sketchfab ; trois régimes : 3D réaliste, données en surimpression, 2D illustrée figée (flash blanc 2 images) quand on entre dans la tête du pilote', mouvement: 'caméras de retransmission, rembobinage VHS, étiquette « RECONSTITUTION 3D »' },
    sources: ['archives/skills-2026-10-26/da-auto/SKILL.md', 'videos/Automobile/grosjean/BRIEF-CLAUDE-CODE.md'] },
  // ---------- 3D stylisée ----------
  { id: 'voxel-toon-brume', titre: '3D voxel en aplats, schémas pixel sur brume', famille: '3D stylisée', statut: 'validée', compte: 'Koan',
    verdict: 'Validée sur « Hans Landa, le méchant parfait ? » et langage corporel (16/10), puis abandonnée le 17-18/10 : « la 3D pixel ne marche plus ».',
    utilisee: ['landa', 'truman', 'ariane5', 'langage-corporel', 'mauvaise-personne', 'tdah', 'message-relu'],
    exemples: [`${K}/landa/out/cover.png`, `${K}/truman/out/cover.png`, `${K}/ariane5/out/cover.png`, `${K}/langage-corporel/out/cover.png`, `${K}/mauvaise-personne/out/cover.png`, `${K}/tdah/out/cover.png`, `${K}/landa/docs/palettes.png`],
    look: { couleurs: 'une palette par vidéo (Ferme et fumée, Technicolor, Seahaven, Kourou 1996, Bar de nuit, Salon du soir, Chambre la nuit…) ; un seul accent pour l\'idée clé, souvent rouge #E8412C', typo: 'Playfair, VT323, Montserrat 800',
      rendu: 'voxels Three.js rendus en 540×960 agrandis ×2 sans lissage, ombrage toon 3 tons ; schémas en pixel 2D toujours sur une brume animée teintée par chapitre, jamais de 2D posée sur la 3D', mouvement: 'transition en blocs de pixels (pixTrans), « zap » neige de télé' },
    sources: ['archives/skills-2026-10-26/realisateur-koan/SKILL.md', `${K}/landa/docs/da.md`, `${K}/truman/docs/da.md`] },
  { id: 'nuit-encre', titre: 'Nuit d\'encre : décor 3D sombre, lampe froide, pixel os', famille: '3D stylisée', statut: 'utilisée', compte: 'Koan',
    verdict: 'Livrée sur Death Note, Manipulés, Parents (« c\'est la DA nuit qu\'il veut ») ; plus tard « le bleu nuit ne marchait pas ».',
    utilisee: ['death-note', 'manipules', 'parents'], exemples: [`${K}/death-note/out/cover.png`, `${K}/manipules/out/cover.png`, `${K}/parents/out/cover.png`, 'studio/out/da/piste1.png'],
    look: { couleurs: 'fond #05070B, os #E8E2D4, acier #8FA0BE, rouge #C2352B deux fois seulement', typo: 'Playfair sur noir', rendu: 'décor 3D avec une lampe froide, faisceau et poussière ; brume d\'encre tramée en gros pixels de 8 px ; extraits d\'anime ou de télé étalonnés bleu-noir', mouvement: 'dissolution en pixels' },
    sources: [`${K}/death-note/decoupage.md`, 'studio/lib/nuit3d.js', 'studio/lib/nuit.js'] },
  { id: 'diorama-tilt-shift', titre: 'Diorama : maquette, lampe ambrée, tilt-shift', famille: '3D stylisée', statut: 'testée', compte: 'Koan', verdict: 'Piste 2 du mood board de Death Note, non retenue.',
    exemples: ['studio/out/da/piste2.png'], look: { rendu: 'maquette miniature, lampe d\'appoint ambrée, flou de bascule (tilt-shift)' }, sources: ['studio/da/mood.html'] },
  { id: 'archive-nocturne', titre: 'Archive nocturne : bitume mouillé, lampadaire sodium', famille: '3D stylisée', statut: 'testée', compte: 'Koan', verdict: 'Piste 3 du mood board de Death Note, non retenue.',
    exemples: ['studio/out/da/piste3.png'], look: { rendu: 'bitume mouillé, lampadaires au sodium, ville floue' }, sources: ['studio/da/mood.html'] },
  { id: 'maison-de-poupee', titre: 'Maison de poupée en coupe', famille: '3D stylisée', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches (17-18/10) ; l\'idée des pièces en coupe a été reprise en pixel (DA pixel fin ambré).',
    exemples: [`${H}/hook_maison.mp4`, `${K}/_bibliotheque-da/images-test/2_maison-en-coupe.png`, `${P}/planche_maison.png`], look: { rendu: 'diorama miniature la nuit, pièces éclairées, flou de maquette' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'pate-a-modeler', titre: 'Pâte à modeler', famille: '3D stylisée', statut: 'aimée', compte: 'Koan', verdict: '« aimée : à garder pour un autre compte ou d\'autres TikTok plus tard ».',
    exemples: [`${H}/hook_pate.mp4`, `${K}/_bibliotheque-da/images-test/3_pate-a-modeler.png`, `${P}/planche_pate.png`], look: { rendu: 'argile bosselée avec empreintes de doigts, lumière chaude', mouvement: 'animation à 12 images/s' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'figurines-plastique', titre: 'Figurines en plastique', famille: '3D stylisée', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_jouets.mp4`, `${P}/planche_jouets.png`], look: { rendu: 'jouets en plastique brillant, échelle de figurine' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'low-poly-ps1', titre: '3D low-poly volontairement « mal faite » façon PS1', famille: '3D stylisée', statut: 'utilisée', compte: 'CTRL', verdict: 'V4 livrée après les retours de Noam (« pas la 3D pixel de Landa/Truman »).',
    utilisee: ['CTRL/15h'], exemples: ['videos/CTRL/15h/out/cover.png', 'videos/CTRL/15h/out/contact.png'],
    look: { rendu: 'peu de polygones, facettes, sommets aimantés sur une grille, petites textures non lissées en mapping affine, sans effet pixel', mouvement: 'personnages à 12 i/s, caméra à 30 i/s' }, sources: ['videos/CTRL/concept-compte.md', 'videos/CTRL/15h/etat.md'] },
  { id: 'gros-pixel-3d-blender', titre: 'Gros pixel 3D ambré (Blender)', famille: '3D stylisée', statut: 'rejetée', compte: 'Koan', verdict: 'Vendetta, 19/10 : « aucune DA, affreux ».',
    exemples: [`${K}/vendetta/blender/out/stills/planche_7.png`, `${K}/vendetta/blender/out/hook_image1.png`], look: { rendu: '180×320 agrandi ×6, ombrage toon 3 tons (référence t3ssel8r)' }, sources: [`${K}/vendetta/etat.md`] },
  { id: 'hd-2d', titre: 'HD-2D façon Octopath (et Lego)', famille: '3D stylisée', statut: 'rejetée', compte: 'Koan', verdict: 'Vendetta, 19/10 : « horribles » à côté des images de référence.',
    exemples: [`${K}/vendetta/blender/out/hook_hd2d.png`, `${K}/vendetta/blender/out/hook_lego.png`, `${K}/vendetta/blender/out/styles/planche_styles.png`], look: { rendu: 'sprites pixel dans un décor 3D avec profondeur de champ (HD-2D) ; variante briques Lego' }, sources: [`${K}/vendetta/etat.md`] },
  // ---------- Pixel art ----------
  { id: 'da-pixel-rose', titre: 'Pixel rose lumineux sur fond anthracite', famille: 'Pixel art', statut: 'utilisée', compte: 'Koan', skill: 'da-pixel-rose',
    verdict: 'Première vidéo Koan (« La poubelle »), puis remplacée ; reprise recolorée le 18/10 (DA pixel fin ambré).', utilisee: ['La poubelle'],
    exemples: ['studio/out/c_s02.png', 'studio/out/c_s08.png', 'studio/out/c_s12.png', 'studio/out/decors_contact.png'],
    look: { couleurs: 'fond #343434 uni, rose #FFBFEA, rose pâle #FFD7FB, rose vif #D365AF, ombre mauve #8A4A75', typo: 'Montserrat 900 en capitales + VT323', rendu: 'lueur (glow) sur tout : c\'est la signature ; poussière de pixels roses ; archives VHS/CRT', mouvement: 'transitions en « whip »' },
    sources: ['archives/skills-2026-10-26/da-pixel-rose/SKILL.md', 'studio/lib/da.js'] },
  { id: 'pixel-fin-ambre', titre: 'Pixel fin ambré, décors en coupe', famille: 'Pixel art', statut: 'validée', compte: 'Koan',
    verdict: '18/10 : « la DA de base en ambre, avec un pixel plus fin » ; Noam valide le niveau de détail mais veut « plus de trucs, pas qu\'une personne ». Variante menthe non retenue.',
    utilisee: ['ordre-de-naissance', 'procrastination'], exemples: [`${K}/ordre-de-naissance/out/cover.png`, `${H}/hook_base_ambre_hd.mp4`, `${P}/planche_base_ambre_hd.png`, `${K}/procrastination/out/cover.png`, `${P}/planche_base_menthe.png`],
    look: { couleurs: 'la grammaire du pixel rose, recolorée en ambre (ou menthe) sur anthracite', rendu: 'pixel fin (1 pixel = 9 px) avec formes ombrées et tramage ; chaque lieu est une maison de poupée en coupe' },
    sources: [`${K}/_bibliotheque-da/README.md`, `${K}/ordre-de-naissance/scenes/pixfin.js`, `${K}/ordre-de-naissance/scenes/da_base.js`] },
  { id: 'pixel-nuit-parallaxe', titre: 'Pixel de nuit en parallaxe', famille: 'Pixel art', statut: 'validée', compte: 'Koan',
    verdict: 'Vendetta (19/10) : « j\'aime beaucoup », « ça tue » sur l\'accroche ; mieux en ×2. Jugée ensuite « trop artistique, trop sombre » pour l\'actualité.',
    utilisee: ['vendetta'], exemples: [`${K}/vendetta/out/cover.png`, `${K}/vendetta/out/x2/planche.png`, `${K}/vendetta/pixel/out/hook_pixel_titre.png`, `${K}/_bibliotheque-da/idees/ref_pixel_pont_nuit.png`],
    look: { couleurs: 'bleu nuit / sarcelle #04060c → #3d5664, ambre sodium #d9672e → #fff1c6 ; rouge #e0252c seulement dans les textes', typo: 'VT323 crème #ecd3a2 / ambre #f8b040',
      rendu: 'grille 270×480 agrandie (×2 préféré), plans en profondeur dans Three.js, tramage Bayer 4×4, bloom, flou de profondeur, grain' }, sources: [`${K}/vendetta/docs/da.md`, `${K}/vendetta/etat.md`] },
  { id: 'pixel-clair-jeu-video', titre: 'Pixel clair façon jeu vidéo', famille: 'Pixel art', statut: 'validée', compte: 'Koan',
    verdict: '20/10 : « cette DA est bien, on part là-dessus pour toute la vidéo » (V1 « pas assez détaillée », V2 un décor détaillé par plan).',
    utilisee: ['bouc-emissaire'], exemples: [`${K}/bouc-emissaire/out/couverture.png`, `${K}/bouc-emissaire/out/planche_v2.png`, `${K}/bouc-emissaire/out/planche_da.png`],
    look: { couleurs: 'aplats vifs, contour sombre #2b2d42 de 1 px, 2 tons par matière ; ciel de fin d\'après-midi ; schémas sur fond clair #eef2f5 à points ; rouge #e0252c pour les mots clés', typo: 'VT323 blanc cerné d\'encre', rendu: 'grille 540×960 ×2, pas de brume, de bloom ni de flou' },
    sources: [`${K}/bouc-emissaire/etat.md`] },
  { id: 'ardoise', titre: 'Ardoise : pixel bleu, accent corail', famille: 'Pixel art', statut: 'utilisée', compte: 'Koan', verdict: 'Méritocratie (remplace Nuit d\'encre).',
    utilisee: ['meritocratie'], exemples: [`${K}/meritocratie/out/cover.png`, `${K}/meritocratie/out/planche.png`, `${K}/meritocratie/out/stills_quad.png`],
    look: { couleurs: 'fond ardoise #1B2830, grille #243642 ou brume lagon ; bleus #0F4C5C / #2A9DB0 / #7FD6E3 / #D9F4F7 ; corail #FF7B5C = l\'idée à retenir', mouvement: 'des lignes qui se détachent et s\'envolent' },
    sources: [`${K}/meritocratie/docs/da.md`, 'studio/lib/ardoise.js'] },
  // ---------- Papier et illustration ----------
  { id: 'da-koan', titre: 'Papier crème, encre et trame', famille: 'Papier et illustration', statut: 'validée', compte: 'Koan', skill: 'da-koan',
    verdict: 'Bible officielle du compte (validée par le Conseil, v2) ; sur Amis 200 h : « fond trop blanc, trop vide, pas assez d\'animation ».', utilisee: ['amis-200h', 'parents (1re version)'],
    exemples: [`${K}/amis-200h/out/cover.png`],
    look: { couleurs: 'papier #EEE5D1, encre #1C1A18 / #4A4540, clair #FBF6EA, rouge #C2352B = l\'idée à retenir', typo: 'Playfair Display 700, VT323, sous-titres Montserrat 800', rendu: '« Pixel = les choses. Pinceau = le raisonnement. Trame = le réel. » ; mascotte lapin', mouvement: 'balayage tramé, morphose, coup de pinceau' },
    sources: ['archives/skills-2026-10-26/da-koan/SKILL.md', 'studio/lib/koan.js'] },
  { id: 'bd-tramee', titre: 'BD tramée en couleur façon Spider-Verse', famille: 'Papier et illustration', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_bd.mp4`, `${P}/planche_bd.png`], look: { rendu: 'points de trame, décalages CMJN, onomatopées (« KRAAASH »)' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'doodle-feutre', titre: 'Dessin au feutre (doodle)', famille: 'Papier et illustration', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_doodle.mp4`, `${P}/planche_doodle.png`], look: { typo: 'Ink Free', rendu: 'gribouillis au feutre' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'ombres-chinoises', titre: 'Ombres chinoises', famille: 'Papier et illustration', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_ombres.mp4`, `${P}/planche_ombres.png`], look: { rendu: 'silhouettes de marionnettes en ombre' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'stickman-plat', titre: 'Personnages bâtons en 2D plate + vues 3D', famille: '2D vectorielle', statut: 'utilisée', compte: 'Survie', verdict: 'En cours (Survie, « The 101 ») ; pas de validation notée.',
    utilisee: ['Survie/station'], exemples: ['videos/Survie/station/out/cover.png', 'videos/Survie/station/da/planche_v2.jpg', 'videos/Survie/station/da/planche_3d.jpg'],
    look: { couleurs: 'tons sourds (sauge, brun, crème), un seul rouge vif pour le danger', typo: 'Roboto Condensed gras', rendu: '2D vectorielle plate, personnages bâtons, faible profondeur de champ, vignettage marqué ; vues aériennes Three.js ; HUD de jeu' },
    sources: ['recherches/brainextends/DA.md', 'videos/Survie/station/da/da2.html'] },
  // ---------- Collage ----------
  { id: 'papier-decoupe', titre: 'Papier découpé et collage', famille: 'Collage', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_papier.mp4`, `${K}/_bibliotheque-da/images-test/1_papier-decoupe.png`, `${P}/planche_papier.png`], look: { rendu: 'marionnettes de papier façon South Park, page d\'album, scotch, lettres de rançon, grain', mouvement: 'poses à 12 i/s' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'mixed-media', titre: 'Mixed media minimaliste (photos découpées, grain)', famille: 'Collage', statut: 'idée', compte: 'Koan', verdict: 'Jamais utilisée : valeurs tirées d\'une analyse de Gemini (« approximations »).',
    look: { couleurs: 'nuit #12151B / papier #F1EDE4 ; bleu #3B6FB6 contre rouge #D94848 pour A/B ; surligneur jaune #EBC94B ; menthe #46B29A pour la science', typo: 'Inter, Playfair, JetBrains Mono', rendu: 'grain permanent qui « bout » à 24 i/s ; photos découpées avec ombre douce et léger angle ; objets 3D mats façon argile (références : Vox, Johnny Harris, 3Blue1Brown)' },
    sources: ['studio/da-mixed-media.md'] },
  // ---------- Écran et typographie ----------
  { id: 'ecran-telephone', titre: 'Écran du téléphone (faux système, conversations)', famille: 'Écran et typographie', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches ; l\'idée a été reprise dans « Message relu ».',
    exemples: [`${H}/hook_ecran.mp4`, `${K}/_bibliotheque-da/images-test/4_ecran-du-telephone.png`, `${P}/planche_ecran.png`], look: { rendu: 'faux système de téléphone, conversations de famille' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'typo-cinetique', titre: 'Typographie cinétique', famille: 'Écran et typographie', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_typo.mp4`, `${P}/planche_typo.png`], look: { rendu: 'le texte seul porte l\'image' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  // ---------- Impression ----------
  { id: 'un-bit-trame', titre: '1 bit tramé (deux tons)', famille: 'Impression', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_1bit.mp4`, `${K}/_bibliotheque-da/images-test/5_1bit-trame.png`, `${P}/planche_1bit.png`], look: { rendu: 'deux tons, tramage Bayer, façon Return of the Obra Dinn' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  { id: 'risographie', titre: 'Risographie deux encres', famille: 'Impression', statut: 'testée', compte: 'Koan', verdict: 'Essai des 11 accroches, non retenu.',
    exemples: [`${H}/hook_riso.mp4`, `${P}/planche_riso.png`], look: { rendu: 'impression riso à deux encres, décalages et grain' }, sources: [`${K}/_bibliotheque-da/README.md`] },
  // ---------- exemples montrés dans les vidéos Creatorize (styles prêts de l'outil ; seulement les captures déjà sur le disque) ----------
  { id: 'crz-reconstitution-claire', titre: '3D de reconstitution, maquette claire', famille: '3D stylisée', statut: 'exemple', origine: CZO, verdict: 'Style « 3D reconstruction », look « Studio » de Creatorize : le reportage façon documentaire 3D (le cargo qui percute le pont de Baltimore, le sous-marin des narcos, l\'océan qui se forme en Afrique, les ados qui ont piraté la CIA, l\'avalanche du Broad Peak). Référence d\'un tiers : la chaîne « Reconstructed ».',
    exemples: [[786, 822, 810, 858, 870, 1566].map(t => `${SRC}/reconst_n1El_${String(t).padStart(4, '0')}.png`), [522, 606, 738, 762, 774, 786, 798, 846, 1014, 1038, 1086, 1098].map(t => `${SRC}/reconst_MWUo_${String(t).padStart(4, '0')}.png`)].flat(),
    look: { couleurs: 'tons blanc-gris ou sable, sans texture photo', typo: 'titres en capitales blanches grasses, étiquettes dans un cadre sombre avec un trait, date incrustée, badge « RECONSTRUCTION » en haut à droite ; carte de fin en texte noir gras centré',
      rendu: 'low-poly propre façon diorama, éclairage mat doux, eau qui reflète ; vrais modèles 3D, cartes et relief réels, photos d\'archive (jusqu\'à 4 par minute)', mouvement: 'plans de 4 à 8 s, mouvements de caméra pris dans une liste de mouvements nommés ; ambiances vent / drone / eau vers −30 dB' }, sources: CZS },
  { id: 'crz-reconstitution-enquete', titre: 'Reconstitution d\'enquête sombre, mannequins brillants', famille: '3D stylisée', statut: 'exemple', origine: CZO, verdict: 'Look « Investigation » du style 3D reconstruction (attaque de l\'aéroport de Riyad). Variante « tableau d\'indices » (true crime) vue sans image.',
    exemples: [`${CZ}/autres/A8C_Sw-wNok_9m30.jpg`, `${CZ}/autres/juMQ_mHKbb0_2m45.jpg`],
    look: { couleurs: 'gris presque monochrome, une lumière froide ; barre rouge sur les noms', typo: 'bandeau de nom en capitales blanches grasses, ligne de source en bas, « ● RECONSTRUCTION »', rendu: '« un look cinéma sombre, des mannequins sans visage brillants et une lumière froide » ; rôles (suspect, victime, témoin…) en finition mate, brillante ou lueur orange ; ombres portées douces' }, sources: CZS },
  { id: 'crz-enquete-tableau-indices', titre: 'Enquête true crime : mannequins et tableau d\'indices', famille: '3D stylisée', statut: 'exemple', origine: CZO,
    verdict: 'Deuxième jour de la « semaine des styles » de Creatorize (un meurtre sous-traité cinq fois, vidéo LgpWOqPjQPg) : le look Investigation enrichi d\'un tableau d\'indices copié d\'un tutoriel After Effects.',
    exemples: [[1098, 1086, 1110].map(t => `${SRC}/indices_LgpW_${String(t).padStart(4, '0')}.png`), [1266, 1302, 1314, 1326, 1338, 1350, 1422].map(t => `${SRC}/indices_LgpW_${String(t).padStart(4, '0')}.png`)].flat(),
    look: { couleurs: 'nuit, bureaux sombres, ville éclairée derrière les vitres ; mannequins de couleur par rôle (rose, bleu, vert, crème) ; tableau gris-bleu, fil rouge entre les photos', typo: 'étiquettes noires inclinées en capitales blanches (« KEPT MOST OF IT », « PASSED IT DOWN »), sommes en grand (« ¥270,000 UP FRONT »)',
      rendu: 'mannequins sans visage, brillants, éclairés par une lumière froide ; tableau d\'indices avec photos-silhouettes, fil rouge, cercles et soulignés jaunes ; documents (carte d\'identité caviardée) en gros plan ; vraies vidéos réparties dans le film', mouvement: 'caméra qui avance avec intention, éclairage dramatique mais lisible, sujet bien détaché du fond' }, sources: CZS },
  { id: 'crz-shorts-mannequins', titre: 'Shorts 3D de mannequins, faits insolites (façon Zack D. Films)', famille: '3D stylisée', statut: 'exemple', origine: CZO,
    verdict: 'Trois shorts faits avec Creatorize en imitant la chaîne Zack D. Films (vidéo BVVD26jnv0M : fausse équipe de basket paralympique, sursaut d\'endormissement, survivant d\'Hiroshima et Nagasaki) ; d\'après le créateur, ça « colle bien au style ».',
    exemples: [438, 450, 462, 474, 390, 402, 414, 426, 486, 498, 510, 522].map(t => `${SRC}/zackd_BVVD_${String(t).padStart(4, '0')}.png`),
    look: { couleurs: 'scènes simples et saturées (chambre bleue, terrain, arbre) ou sombres ; mannequins couleur chair ou rose', typo: 'sous-titres blancs très gras cernés de noir, en capitales, au milieu de l\'écran, mot par mot',
      rendu: 'mannequins 3D articulés sans visage, décors réduits à l\'essentiel, cartes grises avec une épingle rouge pour les lieux', mouvement: 'vertical, 30 s, un geste qui illustre chaque phrase, chute et ralenti' }, sources: CZS },
  { id: 'crz-cartoon-grosse-tete', titre: 'Cartoon 3D à grosse tête', famille: '3D stylisée', statut: 'exemple', origine: CZO, verdict: 'Style « 3D cartoon shorts », looks « Cinema » et « Clean », créé en clonant des références (mélasse de Boston, Apollo 13, modem 56K…).',
    exemples: [`${CZ}/z9xfl/z_18m30.jpg`, `${CZ}/z9xfl/z_4m10.jpg`, `${CZ}/z9xfl/z_5m00.jpg`, `${CZ}/z9xfl/z_6m00.jpg`, `${CZ}/z9xfl/z_9m25.jpg`, `${CZ}/z9xfl/z_21m25.jpg`, `${CZ}/z9xfl/z_22m12.jpg`, `${CZ}/z9xfl/z_28m15.jpg`],
    look: { rendu: 'un personnage à grosse tête ronde, corps en haricot, membres en bâtons, qui vit toute l\'histoire ; visages 2D (43 expressions) collés sur la tête 3D, qui changent à chaque mot ; décor 3D dense, rendu cartoon doux avec contours, lumière chaude, profondeur de champ, lueur. Look Cinema : lumière de contre-jour, grain, vignette ; look Clean : plus clair et plat, sans grain, pour les schémas',
      mouvement: 'caméra toujours en mouvement, un nouveau visuel toutes les ~1,1 s, fondus de 6 images ; chaque chiffre dit devient un objet (compteur, jauge) ; sous-titres vers 70 % de la hauteur' }, sources: [...CZS, `${CZ}/haiku_frames_z9xfl.md`] },
  { id: 'crz-low-poly-ps1', titre: 'Shorts 3D low-poly rétro façon PS1', famille: '3D stylisée', statut: 'exemple', origine: CZO, verdict: 'Style « Low-poly shorts », look « Bright » (turbo, survivre sur Vénus). Images : aperçu de l\'outil dans la vidéo FpHBK2NAc6Y.',
    exemples: [70, 79, 82, 780, 786, 792, 798, 831, 843].map(t => `${SRC}/lowpoly_${String(t).padStart(4, '0')}.png`),
    look: { rendu: 'modèles low-poly libres, visages animés, looks « bright », « moody » et un look rétro avec post-traitement', mouvement: 'vertical, environ 1 min, animations complexes' }, sources: CZS },
  { id: 'crz-pixel-net', titre: 'Pixel art 3D rétro net (16 couleurs)', famille: 'Pixel art', statut: 'exemple', origine: CZO, verdict: 'Style « Pixel art », look « Crisp 640 » (chaîne Escaped : Doom sur calculatrice, Resident Evil 2 sur N64, Crash sur PS1…).',
    exemples: [`${CZ}/cours/c_045m30.jpg`, `${CZ}/cours/c_050m45.jpg`, `${CZ}/cours/c_061m00.jpg`, `${CZ}/cours/c_092m15.jpg`, `${CZ}/cours/c_097m45.jpg`, `${CZ}/cours/c_173m10.jpg`, `${CZ}/cours/c_174m30.jpg`, `${CZ}/cours/c_175m10.jpg`],
    look: { couleurs: 'rampes de 16 couleurs, aplats saturés, contours bleu nuit, sol quadrillé bleu nuit ; une couleur de marque (orange, corail) pour les titres', typo: 'HUD 1080p en police rétro ; titres de section « 01 THE IMPOSSIBLE CARTRIDGE » (petit chiffre orange + capitales blanches)',
      rendu: 'scènes Three.js rendues en 640×360 net, contours de profondeur et d\'objet, lumière de contour, contours qui s\'estompent dans le brouillard, vignette ; photos réelles détourées et créditées', mouvement: 'scènes calées sur les mots, ciels et transitions tramés' }, sources: CZS },
  { id: 'crz-pixel-hi-bit', titre: 'Pixel art haute définition (Hi-Bit)', famille: 'Pixel art', statut: 'exemple', origine: CZO, verdict: 'Look « Hi-Bit 640 » du style Pixel art (GTA V sur Android, vidéo a-HK6Wu0PSU) : comparaison avec l\'ancien look 16 couleurs, cartes de titre, traitements des photos réelles (CRT, net, pixel).',
    exemples: [999, 1008, 1020, 1023, 1390, 1393, 609, 1354].map(t => `${SRC}/hibit_${String(t).padStart(4, '0')}.png`),
    look: { couleurs: '~100 couleurs au lieu de 16, 5 niveaux d\'ombrage, ciel jusqu\'à 4 couleurs ; écrans et néons lumineux', rendu: 'toujours 640×360 ; photos réelles traitées CRT (lignes de balayage), nettes ou redessinées en pixels ; plein écran, carte ou écran ; photo verticale en affiche encadrée', mouvement: 'B-roll plein écran dès qu\'un objet réel est cité, transitions pixelisées' }, sources: CZS },
  { id: 'crz-coupures-journal', titre: 'Collage de coupures de journal', famille: 'Collage', statut: 'exemple', origine: CZO, verdict: 'Style « Vox », look « Press » (histoire de l\'imprimerie). Référence : les vidéos de Vox.',
    exemples: [`${CZ}/cours/c_080m35.jpg`, `${CZ}/cours/c_168m45.jpg`],
    look: { couleurs: 'papier crème, découpes en gravure ou demi-teinte grise, tampons rouges', typo: 'étiquettes à la machine à écrire, bandeaux noirs en capitales, écriture manuscrite rouge', rendu: 'une page de journal grand format, coupures collées ; scribe à la bougie en encre sépia', mouvement: 'finit sur une boucle parfaite' }, sources: CZS },
  { id: 'crz-vectoriel-plat', titre: 'Explication en dessin vectoriel plat', famille: '2D vectorielle', statut: 'exemple', origine: CZO, verdict: 'Style « Flat explainer », look « Studio » (Neuralink, intérêts composés, batterie qui meurt dans le froid).',
    exemples: [`${CZ}/cours/c_067m45.jpg`, `${CZ}/cours/c_076m58.jpg`, `${CZ}/cours/c_077m20.jpg`],
    look: { couleurs: 'fond violet nuit sans dégradé, personnage au pull jaune, pastilles jaunes et vert menthe', typo: 'sous-titres blancs gras, mot-clé en jaune', rendu: 'dessin vectoriel plat et lumineux, personnages articulés avec animations au repos ; éclairage plat ou ombrage dynamique' }, sources: CZS },
  { id: 'crz-bonshommes-paint', titre: 'Bonshommes bâtons façon Paint', famille: '2D vectorielle', statut: 'exemple', origine: CZO, verdict: 'Style « MS Paint stick figures » (comment marche le Soleil, Everest, fosse océanique). Référence : « The Paint Explainer ».',
    exemples: [`${CZ}/cours/c_113m50.jpg`],
    look: { couleurs: 'fond blanc, cercles rouges dessinés à la main, mots en bleu gras cerné de noir', typo: 'titre noir « THE PROBLEM »', rendu: 'volontairement simple et satirique, comme dessiné dans Paint ; photos réelles insérées' }, sources: CZS },
];

const abs = f => /^[a-z]:/i.test(f) ? f : join(TM, f);   // chemin de tiktok-motion, ou chemin complet (images tirées ailleurs)
const lien = (src, dest) => { if (existsSync(dest)) return; try { linkSync(src, dest); } catch { copyFileSync(src, dest); } };
export function daMd(c) {
  const L = c.look || {}, l = (k, n) => L[k] ? `- ${n} : ${L[k]}\n` : '';
  return `# DA « ${c.titre} » (${c.famille})

Statut : ${STATUTS[c.statut] || c.statut}. ${c.verdict || ''}
${c.utilisee?.length ? `Utilisée dans : ${c.utilisee.join(', ')}.\n` : ''}${c.skill ? `La bible complète de cette DA est la skill \`${c.skill}\` (copiée à côté de ce fichier dans references/).\n` : ''}
## Le look
${l('technique', 'Fabrication')}${l('couleurs', 'Couleurs')}${l('typo', 'Typographie')}${l('rendu', 'Rendu et matières')}${l('personnages', 'Personnages')}${l('decors', 'Décors')}${l('mouvement', 'Mouvement et transitions')}${l('son', 'Son')}${c.pour_refaire?.length ? `\n## Pour refaire ce style\n${c.pour_refaire.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n` : ''}
## Où regarder (images et fichiers source, en lecture seule)
${[...(c.sources || []), ...(c.exemples || [])].map(s => `- ${abs(s)}`).join('\n')}
`;
}
export function importer(seulement) {
  const R = [];
  for (const c of DA.filter(c => !seulement || seulement.includes(c.id))) {
    const D = join(STYLES, c.id), E = join(D, 'exemples'); mkdirSync(E, { recursive: true });
    const exemples = (c.exemples || []).filter(f => existsSync(abs(f))).map((f, i) => { const n = `${String(i + 1).padStart(2, '0')}_${basename(f).replace(/\s+/g, '_')}`; lien(abs(f), join(E, n)); return `exemples/${n}`; });
    const avant = existsSync(join(D, 'fiche.json')) ? JSON.parse(readFileSync(join(D, 'fiche.json'), 'utf8')) : {};
    const { exemples: _, sources, ...meta } = c;
    const garde = Object.fromEntries(['titre', 'createur', 'pays', 'lien', 'compte', 'tags', 'notes', 'genre', 'famille'].filter(k => avant[k] !== undefined).map(k => [k, avant[k]]));   // déjà là (ou modifié par Noam) : on n'écrase pas
    writeFileSync(join(D, 'fiche.json'), JSON.stringify({ ...avant, genre: 'da', origine: c.origine || `Tes vidéos (${c.compte})`, ...meta, ...garde, exemples, sources: (sources || []).map(s => `${TM}/${s}`) }, null, 1));
    writeFileSync(join(D, 'da.md'), daMd(c));
    R.push(`${c.id} : ${exemples.length} exemple(s)`);
  }
  return R;
}
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const i = process.argv.indexOf('--seulement'); console.log(importer(i > 0 ? process.argv[i + 1].split(',') : null).join('\n'));
}
