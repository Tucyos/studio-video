# DA « Pixel rose sur anthracite » — TikTok 9:16

Cette DA a été relevée sur de vraies captures des vidéos de référence, avec les couleurs mesurées au pixel. **Le code de `lib/da.js` (en bas) est la source de vérité.** Toute couleur, police ou durée passe par `DA.C`, `DA.F` et `DA.T`, jamais en dur dans une scène. La version de référence est aussi dans le Project « motion design » (`claude/skill-da-pixel-rose.md`).

## L'identité en une phrase
Un fond gris anthracite uni, avec des éléments roses en pixel art et des titres blancs et roses qui brillent doucement. C'est de la vulgarisation façon « jeu vidéo rétro posé » : une voix off, aucune face cam.

## Palette (`DA.C`)
| Rôle | Token | HEX |
|---|---|---|
| Fond de presque tous les plans (uni, sans texture) | bg | #343434 |
| Fond des plans « document » | black | #000000 |
| Texte principal, axes, flèches | white | #FFFFFF |
| Accent : mots-clés, labels, icônes | pink | #FFBFEA |
| Aplats clairs (barre A) | pinkPale | #FFD7FB |
| Accent fort (barre B) | pinkHot | #D365AF |
| Ombrage du pixel art | mauve / mauveDark | #8A4A75 / #5E2E4F |
| Graphiques recolorés dans un document | docPink | #FF5CCB |
| **Exception** : séquences 3D voxel avec deux camps | voxBlue / voxRed | #5BA4D6 / #E36B6B |

Règle : **une seule teinte d'accent, le rose.** Pour opposer deux groupes, on utilise le rose pâle contre le rose foncé, jamais du bleu contre du rouge. Le bleu et le rouge sont réservés aux rares plans 3D voxel.

## Typographie (`DA.F`)
- **Montserrat 900, en MAJUSCULES** (`DA.title`) : mots d'impact et étiquettes de groupe (DÉMO, RÉPU, PREUVES). En blanc ou en rose, toujours avec glow.
- **Montserrat 800** (`DA.rich`) : phrases et citations en blanc. Les mots-clés passent en rose avec la syntaxe `*mots*`. C'est la couleur qui sert de surligneur, pas un rectangle.
- **VT323, police pixel** (`DA.label`, `DA.counter`) : axes, chiffres, légendes de graphiques. Les légendes de groupe sont en rose, les autres en blanc.
- **Glow sur tout** : chaque texte, ligne et icône a un halo doux de sa propre couleur (`DA.glow`). C'est la signature visuelle.
- Tailles TikTok : au minimum 48 px pour une phrase, 90 à 130 px pour un titre. Pas plus de 4 lignes de citation.

## Éléments graphiques
- **Pixel art** (`DA.sprite`) : icônes roses avec un contour noir de 1 pixel, ajouté automatiquement, plus une ombre douce et un léger glow. Sprites inclus : `people`, `person`, `button`, `check`, `cross`, `bulb`. Pour en ajouter un, on le dessine en grille de caractères dans `SPRITES` (palette : `P L H M D W G S K`). Pour une icône complexe (cerveau, juge, globe), on génère un PNG pixel art rose avec ComfyUI, on le met dans `assets/img/`, on le charge avec `DA.loadImages`, puis `DA.sprite(g, 'cle', x, y, { w: 400 })` (rendu sans lissage).
- **Graphiques** (`DA.bars`, `DA.ruler`, `DA.path`) : axes blancs de 4 px avec glow, barres rose pâle et rose foncé (la foncée est cerclée de noir), labels pixel, barres qui montent les unes après les autres.
- **Flèche** (`DA.arrow`) : blanche et épaisse, avec une queue qui s'efface en dégradé et une pointe nette.
- **Fond** : `DA.frame` dessine l'anthracite, une poussière de pixels roses très discrète en amas tramés qui **dérivent et se déforment lentement** (fluide, environ 6 px/s), et une vignette légère. Réglages : `dust` (intensité, 0 pour l'éteindre) et `dustSpeed` dans les options de `DA.frame`. **Pas de grain, pas de texture papier.**

## Images réelles
- **Archives vidéo/photo** (`DA.archive`) : effet VHS/CRT, avec désaturation, aberration chromatique rouge/cyan, scanlines et vignette. En 9:16, on empile deux archives verticalement pour une opposition, chacune avec son titre en rose (ex. DÉMOCRATE) et un nom en blanc.
- **Documents scientifiques** (`DA.doc3d`) : page inclinée en perspective sur fond noir, avec une profondeur de champ (centre net, bords flous) et un léger zoom. On recolore le graphique de l'étude en `docPink` avant de l'importer.
- **3D voxel** (personnages en blocs, plateau) : rare, réservé aux grands moments. On utilise Three.js sur un canvas secondaire piloté par T, ou une base générée avec ComfyUI.
- On ne fabrique jamais de faux documents présentés comme réels. Les sources viennent de l'utilisateur.

## Mouvement (`DA.T`)
- Les titres et les icônes apparaissent en **pop** : échelle avec un overshoot (`ease.back`) en 0.45 s. Les phrases montent ligne par ligne (0.35 s, décalage de 0.12 s entre lignes).
- Entre deux scènes, deux transitions possibles :
  - un **push latéral rapide** (`DA.whip`, 0.25 s, avec `SCENE.sub = 6` pour le flou de mouvement) ;
  - des **éléments qui s'écartent** vers les bords de l'écran (`DA.spread`).
- Caméra quasi fixe : dérive de 100 % à 103 % et micro-tremblement très léger. C'est plus calme que dans un documentaire.
- **Tout se déclenche sur les mots de la voix** (`M.at('mot')`). Un nouvel élément apparaît toutes les 1.5 à 3 s.

## Zone sûre TikTok
Tout ce qui compte tient dans `DA.SAFE` (x 90 → 930, y 220 → 1520).

## Son
| Événement | SFX |
|---|---|
| Une icône ou un titre fait pop | pop |
| Barres qui montent | pop à -12 dB, une par barre |
| Push ou changement de scène | whoosh / swish |
| Le curseur d'une échelle bouge | tick |
| Révélation | thud |
| Montée de tension | riser, puis coupure sèche |
Musique : lo-fi, chiptune doux ou ambient, qui va bien avec le pixel art. Elle se coupe net au moment du pivot. Voix : calme, posée, complice. Niveau final : -14 LUFS.

## Structure TikTok (45–75 s)
- 0–2 s : hook sous forme de question au spectateur (citation `DA.rich`)
- 2–15 s : le contexte, avec les deux camps
- 15–35 s : l'expérience et les données (échelle, histogramme)
- 35–45 s : le pivot, avec un silence
- 45 s jusqu'à la fin : l'explication et le retour au spectateur

## lib/da.js
```js
// da.js — DA "Pixel rose sur anthracite" (relevée sur captures réelles), TikTok 9:16. Charger après motion.js.
(function () {
  const { clamp, lerp, ease, anim, rng, noise, wiggle } = M;
  const W = 1080, H = 1920;

  // ---------- TOKENS (mesurés sur les captures de référence) ----------
  const C = {
    bg: '#343434',          // fond anthracite uni (95 % des plans)
    black: '#000000',       // fond des plans "document" / archives
    white: '#FFFFFF', grey: '#C9C9C9',
    pinkPale: '#FFD7FB',    // barres claires, aplats clairs
    pink: '#FFBFEA',        // texte accent, icônes, labels
    pinkHot: '#D365AF',     // barres foncées, accent fort
    mauve: '#8A4A75', mauveDark: '#5E2E4F', // ombrage pixel art
    docPink: '#FF5CCB',     // recoloration des graphiques dans les documents
    voxBlue: '#5BA4D6', voxRed: '#E36B6B',  // UNIQUEMENT pour les séquences 3D voxel (dualité 2 camps)
    outline: '#0A0A0A',
  };
  const F = { title: '"Montserrat"', pixel: '"VT323"' };
  const SAFE = { x: 90, y: 220, w: 840, h: 1300 };
  const CX = W / 2, CY = SAFE.y + SAFE.h / 2;
  const T = { word: 0.35, pop: 0.45, chart: 0.9, cam: 0.6, whip: 0.25 };

  // ---------- POLICES ----------
  const fonts = [['Montserrat', 'montserrat-700', '700'], ['Montserrat', 'montserrat-800', '800'], ['Montserrat', 'montserrat-900', '900'], ['VT323', 'vt323', '400']]
    .map(([fam, f, w]) => new FontFace(fam, `url(/assets/fonts/${f}.woff2)`, { weight: w }));
  fonts.forEach(f => document.fonts.add(f));
  window.DA_READY = Promise.all(fonts.map(f => f.load()));
  function makeCanvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }

  // ---------- GLOW ----------
  function glow(g, color, blur = 18) { g.shadowColor = color; g.shadowBlur = blur; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
  function noGlow(g) { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
  const glowOf = col => col === C.white ? 'rgba(255,255,255,0.55)' : 'rgba(255,150,220,0.6)';

  // ---------- FOND : anthracite + poussière de pixels roses qui flotte ----------
  // Grille fixe de petits carrés (12 px). Un champ de "nuages" invisibles dérive lentement ; chaque case s'allume
  // quand le champ dépasse son seuil aléatoire -> amas tramés aux bords qui se dissolvent, mouvement fluide et très lent.
  const DUST_S = 12, DUST_COLS = Math.ceil(W / DUST_S) + 8, DUST_ROWS = Math.ceil(H / DUST_S) + 8;
  const DUST_TH = (() => { const r = rng(42), a = new Float32Array(DUST_COLS * DUST_ROWS); for (let i = 0; i < a.length; i++) a[i] = r(); return a; })();
  const DUST_BLOBS = (() => { const r = rng(7); return Array.from({ length: 6 }, () => ({
    x: r() * W, y: r() * H, rx: 140 + r() * 220, ry: 110 + r() * 180, ax: 60 + r() * 90, ay: 50 + r() * 80, f: 0.04 + r() * 0.05, ph: r() * 6.28 })); })();
  function dust(g, Tt, amt = 1, speed = 1) {
    const t = Tt * speed, B = DUST_BLOBS.map(b => ({ x: b.x + Math.sin(t * b.f * 6.28 + b.ph) * b.ax, y: b.y + Math.cos(t * b.f * 5.1 + b.ph) * b.ay,
      rx: b.rx * (1 + 0.15 * Math.sin(t * 0.21 + b.ph)), ry: b.ry * (1 + 0.15 * Math.cos(t * 0.17 + b.ph)) }));
    const ox = (t * 6) % DUST_S, oy = (t * 3) % DUST_S;                // dérive globale très lente (≈ 6 px/s)
    g.save(); g.fillStyle = C.pink;
    for (let j = 0; j < DUST_ROWS; j++) for (let i = 0; i < DUST_COLS; i++) {
      const x = (i - 4) * DUST_S + ox, y = (j - 4) * DUST_S + oy;
      let f = 0; for (const b of B) { const dx = (x - b.x) / b.rx, dy = (y - b.y) / b.ry; f += Math.exp(-(dx * dx + dy * dy) * 1.6); }
      f += 0.18 * Math.sin(x * 0.011 + t * 0.35) * Math.sin(y * 0.009 - t * 0.28);   // casse les bords
      const th = DUST_TH[j * DUST_COLS + i];
      if (f > 0.55 + th * 1.0) { g.globalAlpha = amt * Math.min(0.24, 0.07 + (f - 0.55 - th * 1.0) * 0.6); g.fillRect(x, y, th < 0.7 ? 7 : 9, th < 0.7 ? 7 : 9); }
    }
    g.restore();
  }
  // opts: {bg:'bg'|'black', dust:1 (intensité, 0 = off), dustSpeed:1, cam:{x,y,zoom,rot}, from, to, drift:true, shake:0}
  function frame(g, Tt, opts, drawFn) {
    const o = Object.assign({ bg: 'bg', dust: 1, drift: true, shake: 0, cam: {} }, opts);
    g.fillStyle = o.bg === 'black' ? C.black : C.bg; g.fillRect(0, 0, W, H);
    const p = o.from != null ? clamp((Tt - o.from) / (o.to - o.from)) : 0;
    const zoom = (o.cam.zoom ?? 1) * (o.drift ? lerp(1, 1.03, p) : 1);
    const cx = (o.cam.x ?? 0) + wiggle(Tt, 0.6, 1.5 + o.shake, 11), cy = (o.cam.y ?? 0) + wiggle(Tt, 0.6, 1.5 + o.shake, 23);
    g.save(); g.translate(CX, CY); g.rotate((o.cam.rot ?? 0) * Math.PI / 180); g.scale(zoom, zoom); g.translate(-CX - cx, -CY - cy);
    if (o.dust && o.bg !== 'black') dust(g, Tt, o.dust, o.dustSpeed ?? 1);
    drawFn(g);
    g.restore();
    const v = g.createRadialGradient(CX, H / 2, H * 0.3, CX, H / 2, H * 0.8);   // vignette légère
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.28)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  }

  // ---------- TEXTE ----------
  function font(g, kind = 'title', size = 80, weight = 800) { g.font = kind === 'pixel' ? `${size}px ${F.pixel}` : `${weight} ${size}px ${F.title}`; }
  // Titre / mot d'impact : MAJUSCULES Montserrat 900 + glow. entry 'pop' (scale overshoot) ou 'slide'
  function title(g, str, x, y, o = {}) {
    const { t, t0 = 0, size = 120, weight = 900, color = C.pink, align = 'center', entry = 'pop', out, kind = 'title' } = o;
    let p = t == null ? 1 : clamp((t - t0) / (entry === 'pop' ? T.pop : T.word));
    if (out != null && t != null) p = Math.min(p, 1 - clamp((t - out) / 0.2));
    if (p <= 0) return 0;
    font(g, kind, size, weight); g.textAlign = align; g.textBaseline = 'alphabetic';
    const w = g.measureText(str).width;
    g.save(); g.globalAlpha = clamp(p * 3);
    if (entry === 'pop') { const s = ease.back(p, 1.2); g.translate(x, y - size * 0.35); g.scale(s, s); g.translate(-x, -(y - size * 0.35)); }
    else if (entry === 'slide') g.translate(0, (1 - ease.outExpo(p)) * 36);
    glow(g, glowOf(color), size * 0.18); g.fillStyle = color; g.fillText(str, x, y);
    noGlow(g); g.fillText(str, x, y); g.restore(); return w;
  }
  // Phrase riche : *mots en rose*, retour à la ligne auto, centré, glow, apparition ligne par ligne
  function rich(g, src, x, y, o = {}) {
    const { t, t0 = 0, size = 52, weight = 800, maxW = SAFE.w, lineH = 1.45, stagger = 0.12, color = C.white, accent = C.pink } = o;
    font(g, 'title', size, weight);
    const toks = []; src.split(/(\*[^*]+\*)/).forEach(seg => { const hl = seg.startsWith('*'); (hl ? seg.slice(1, -1) : seg).split(/(\s+)/).forEach(w => w && toks.push({ w, hl })); });
    const lines = [[]]; let lw = 0;
    for (const tk of toks) { const ww = g.measureText(tk.w).width; if (lw + ww > maxW && tk.w.trim()) { lines.push([]); lw = 0; if (!tk.w.trim()) continue; } lines[lines.length - 1].push(tk); lw += ww; }
    const y0 = y - (lines.length - 1) * size * lineH / 2;
    lines.forEach((ln, i) => {
      while (ln.length && !ln[ln.length - 1].w.trim()) ln.pop();
      const p = t == null ? 1 : anim(t, t0 + i * stagger, T.word, ease.outExpo); if (p <= 0) return;
      const tot = ln.reduce((s, tk) => s + g.measureText(tk.w).width, 0); let cx = x - tot / 2;
      g.save(); g.globalAlpha = p; g.translate(0, (1 - p) * 30); g.textAlign = 'left';
      for (const tk of ln) { const col = tk.hl ? accent : color; glow(g, glowOf(col), 14); g.fillStyle = col; g.fillText(tk.w, cx, y0 + i * size * lineH); cx += g.measureText(tk.w).width; }
      noGlow(g); g.restore();
    });
  }
  // Label pixel (VT323) : axes, légendes de graphiques, petites étiquettes
  function label(g, str, x, y, o = {}) {
    const { size = 46, color = C.white, align = 'center', t, t0 = 0 } = o;
    const p = t == null ? 1 : anim(t, t0, 0.25); if (p <= 0) return;
    font(g, 'pixel', size); g.textAlign = align; g.save(); g.globalAlpha = p;
    String(str).split('\n').forEach((l, i) => { glow(g, glowOf(color), 10); g.fillStyle = color; g.fillText(l, x, y + i * size * 0.95); });
    noGlow(g); g.restore();
  }
  // Compteur mono pixel (chiffres qui défilent)
  function counter(g, from, to, x, y, o = {}) {
    const { t, t0 = 0, dur = 1.0, decimals = 0, size = 120, color = C.pink, suffix = '' } = o;
    const v = lerp(from, to, anim(t, t0, dur, ease.out));
    label(g, v.toFixed(decimals) + suffix, x, y, { size, color });
  }

  // ---------- PIXEL ART ----------
  // Sprites en grille de caractères. Palette : . vide, W blanc, P rose, L rose pâle, H rose foncé, M mauve, D mauve sombre, G gris, S gris clair, K noir.
  const PAL = { W: C.white, P: C.pink, L: C.pinkPale, H: C.pinkHot, M: C.mauve, D: C.mauveDark, G: '#8C8C8C', S: '#D9D9D9', K: C.outline };
  const SPRITES = {
    person: [
      '....PPPP....', '...PPPPPP...', '...PPPPPP...', '...PPPPPP...', '....PPPP....', '.....PP.....',
      '..PPPPPPPP..', '.PPPPPPPPPP.', '.PPPPPPPPPP.', '.PPPPPPPPPP.', '.PPPPPPPPPP.'],
    people: [
      '.....PPP..........PPP.....',
      '....PPPPP........PPPPP....',
      '...PPPPPPP......PPPPPPP...',
      '...PPPPPPP.LLLL.PPPPPPP...',
      '...PPPPPPKLLLLLLKPPPPPP...',
      '....PPPPKLLLLLLLLKPPPP....',
      '.....PPP.LLLLLLLL.PPP.....',
      '.........LLLLLLLL.........',
      '...PPPPPPKLLLLLLKPPPPPP...',
      '..PPPPPPPPKLLLLKPPPPPPPP..',
      '.PPPPPPPKKKK..KKKKPPPPPPP.',
      '.PPPPPPKLLLLLLLLLLKPPPPPP.',
      '.PPPPPKLLLLLLLLLLLLKPPPPP.',
      '.PPPPKLLLLLLLLLLLLLLKPPPP.',
      '.PPPPKLLLLLLLLLLLLLLKPPPP.',
      '......LLLLLLLLLLLLLL......',
      '......LLLLLLLLLLLLLL......',
    ],
    button: [
      '....HHHHHHHH....', '..HHPPPPPPPPHH..', '.HPPPPPPPPPPPPH.', '.HPPPPPPPPPPPPH.', '.HHPPPPPPPPPPHH.', '.SHHHHHHHHHHHHS.',
      'SSSSSSSSSSSSSSSS', 'GGSSSSSSSSSSSSGG', '.GGGSSSSSSSSGGG.', '...GGGGGGGGGG...'],
    check: ['.........PP', '........PPP', '.......PPP.', 'PP....PPP..', 'PPP..PPP...', '.PPPPPP....', '..PPPP.....', '...PP......'],
    cross: ['PP.....PP', 'PPP...PPP', '.PPP.PPP.', '..PPPPP..', '...PPP...', '..PPPPP..', '.PPP.PPP.', 'PPP...PPP', 'PP.....PP'],
    bulb: ['...LLLL...', '..LLLLLL..', '.LLLLLLLL.', '.LLLWLLLL.', '.LLLLLLLL.', '..LLLLLL..', '...LLLL...', '...GGGG...', '...SSSS...', '....GG....'],
  };
  const SPR_CACHE = {};
  // Rend un sprite en pixels nets, contour noir auto
  function spriteCanvas(name) {
    if (SPR_CACHE[name]) return SPR_CACHE[name];
    const rows = SPRITES[name], h = rows.length + 2, w = Math.max(...rows.map(r => r.length)) + 2;
    const filled = (x, y) => y >= 1 && y <= rows.length && rows[y - 1][x - 1] && rows[y - 1][x - 1] !== '.';
    return SPR_CACHE[name] = makeCanvas(w, h, (c) => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (filled(x, y)) { c.fillStyle = PAL[rows[y - 1][x - 1]]; c.fillRect(x, y, 1, 1); }
        else if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled(x + dx, y + dy))) { c.fillStyle = C.outline; c.fillRect(x, y, 1, 1); }
      }
    });
  }
  // Sprite (ou PNG chargé sous la même clé) : pop, ombre douce, glow léger, sans lissage
  function sprite(g, name, x, y, o = {}) {
    const { px = 12, t, t0 = 0, entry = 'pop', glowCol = 'rgba(255,170,230,0.35)' } = o;
    const src = IMG[name] || spriteCanvas(name);
    const p = t == null ? 1 : clamp((t - t0) / T.pop); if (p <= 0) return;
    const w = (IMG[name] ? (o.w || src.width) : src.width * px), h = w * src.height / src.width;
    const s = entry === 'pop' ? ease.back(p, 1.3) : 1;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = clamp(p * 3); g.imageSmoothingEnabled = false;
    g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 14; g.drawImage(src, -w / 2, -h / 2, w, h);
    glow(g, glowCol, 24); g.globalAlpha *= 0.5; g.drawImage(src, -w / 2, -h / 2, w, h);
    g.restore();
  }

  // ---------- GRAPHIQUES ----------
  function path(g, pts, p, o = {}) {
    const { color = C.white, width = 5, alpha = 1, dash, glowCol } = o; if (p <= 0) return pts[0];
    let L = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let rem = L * clamp(p);
    g.save(); g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'square'; g.lineJoin = 'miter';
    if (dash) g.setLineDash(dash); glow(g, glowCol || glowOf(color), 12);
    g.beginPath(); g.moveTo(...pts[0]); let end = pts[0];
    for (let i = 1; i < pts.length && rem > 0; i++) { const k = Math.min(1, rem / seg[i - 1]); end = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; g.lineTo(...end); rem -= seg[i - 1]; }
    g.stroke(); g.restore(); return end;
  }
  // Flèche blanche épaisse, queue qui s'efface en dégradé, pointe nette, glow
  function arrow(g, x1, y1, x2, y2, o = {}) {
    const { t, t0 = 0, dur = 0.5, color = C.white, width = 8 } = o;
    const p = t == null ? 1 : anim(t, t0, dur, ease.outExpo); if (p <= 0) return;
    const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1), s = 34;
    const gr = g.createLinearGradient(x1, y1, ex, ey); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.35, color); gr.addColorStop(1, color);
    g.save(); glow(g, 'rgba(255,255,255,0.6)', 16); g.strokeStyle = gr; g.lineWidth = width; g.lineCap = 'butt';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(ex - Math.cos(a) * s * 0.6, ey - Math.sin(a) * s * 0.6); g.stroke();
    g.fillStyle = color; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - s * Math.cos(a - 0.5), ey - s * Math.sin(a - 0.5)); g.lineTo(ex - s * 0.6 * Math.cos(a), ey - s * 0.6 * Math.sin(a)); g.lineTo(ex - s * Math.cos(a + 0.5), ey - s * Math.sin(a + 0.5)); g.closePath(); g.fill();
    g.restore();
  }
  // Histogramme groupé façon référence : axes blancs, labels pixel, barres pâle / foncée (foncée cerclée de noir)
  // groups: [{label:'Contradiction\nde Bush', values:[3.8,2.1]}], series:['Démo','Répu']
  function bars(g, x, y, w, h, o = {}) {
    const { groups, series = ['A', 'B'], min = 1, max = 4, ticks = [1, 2, 3, 4], t, t0 = 0, stagger = 0.12, cols = [C.pinkPale, C.pinkHot] } = o;
    const pa = t == null ? 1 : anim(t, t0, 0.5, ease.outExpo);
    const Y = v => y + h - (v - min) / (max - min) * h;
    path(g, [[x, y - 30], [x, y + h], [x + w * pa, y + h]], pa, { width: 4 });
    ticks.forEach(v => { label(g, v, x - 40, Y(v) + 14, { size: 54, t, t0 }); path(g, [[x - 14, Y(v)], [x, Y(v)]], pa, { width: 4 }); });
    const gw = w / groups.length, bw = gw * 0.26;
    groups.forEach((gr, i) => {
      const gx = x + gw * i + gw / 2;
      if (i > 0) path(g, [[x + gw * i, y + h], [x + gw * i, y + h + 60]], pa, { width: 3 });
      gr.values.forEach((v, j) => {
        const p = t == null ? 1 : anim(t, t0 + 0.3 + (i * 2 + j) * stagger, T.chart, ease.outExpo);
        const bx = gx + (j === 0 ? -bw - 14 : 14), top = lerp(y + h, Y(v), p);
        g.save(); glow(g, 'rgba(255,170,230,0.35)', 14); g.fillStyle = cols[j]; g.fillRect(bx, top, bw, y + h - top);
        if (j === 1) { noGlow(g); g.strokeStyle = C.outline; g.lineWidth = 4; g.strokeRect(bx, top, bw, y + h - top); }
        g.restore();
        label(g, series[j], bx + bw / 2, y + h + 50, { size: Math.min(50, gw / 6), t, t0: t0 + 0.2 });
      });
      label(g, gr.label, gx, y + h + 120, { size: Math.min(48, gw / 6.6), color: C.pink, t, t0: t0 + 0.4 + i * stagger });
    });
  }
  // Échelle verticale graduée (1→4) avec curseur triangulaire qui se déplace (valeur animée via M.track)
  function ruler(g, x, yTop, yBot, o = {}) {
    const { ticks = [1, 2, 3, 4], value, t, t0 = 0 } = o;
    const p = t == null ? 1 : anim(t, t0, 0.6, ease.outExpo); const Y = v => lerp(yBot, yTop, (v - ticks[0]) / (ticks[ticks.length - 1] - ticks[0]));
    path(g, [[x, yBot], [x, lerp(yBot, yTop, p)]], 1, { width: 14 });
    ticks.forEach(v => { if (Y(v) < lerp(yBot, yTop, p) - 1) return; path(g, [[x - 28, Y(v)], [x + 28, Y(v)]], 1, { width: 12 }); title(g, String(v), x - 90, Y(v) + 26, { size: 76, t, t0: t0 + 0.1, entry: 'slide' }); });
    if (value != null) { const vy = Y(value); g.save(); g.fillStyle = '#CFCFCF'; g.beginPath(); g.moveTo(x + 50, vy); g.lineTo(x + 90, vy - 26); g.lineTo(x + 90, vy + 26); g.closePath(); g.fill(); g.restore(); }
  }

  // ---------- IMAGES ----------
  const IMG = {};
  function loadImages(list) {
    const ps = Object.entries(list).map(([k, src]) => new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => rej(new Error('image ' + src)); i.src = src; }));
    window.DA_READY = Promise.all([window.DA_READY, ...ps]);
  }
  function cover(g, img, x, y, w, h, zoom = 1) { const s = Math.max(w / img.width, h / img.height) * zoom, iw = img.width * s, ih = img.height * s; g.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); }
  // Image d'archive façon VHS/CRT : désaturée, aberration chromatique, scanlines, léger flou, zoom lent
  function archive(g, key, x, y, w, h, o = {}) {
    const { t, t0 = 0, zoom = 1.05, split = 6 } = o; const img = IMG[key]; if (!img) return;
    const p = t == null ? 1 : anim(t, t0, 0.3); if (p <= 0) return;
    const z = zoom + (t == null ? 0 : (t - t0) * 0.01);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.globalAlpha = p;
    g.filter = 'saturate(0.7) contrast(1.05) blur(0.6px)'; cover(g, img, x, y, w, h, z);
    g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.22 * p;
    g.filter = 'saturate(0) sepia(1) hue-rotate(-50deg) saturate(6) blur(1px)'; cover(g, img, x + split, y, w, h, z);   // frange rouge/magenta
    g.filter = 'saturate(0) sepia(1) hue-rotate(160deg) saturate(5) blur(1px)'; cover(g, img, x - split, y, w, h, z);   // frange cyan
    g.filter = 'none'; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.16 * p; g.fillStyle = '#000';
    for (let yy = y; yy < y + h; yy += 4) g.fillRect(x, yy, w, 2);                                                  // scanlines
    g.globalAlpha = p; const v = g.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)'); g.fillStyle = v; g.fillRect(x, y, w, h);
    g.restore();
  }
  // Document scientifique en 3D incliné sur fond noir, profondeur de champ (centre net, bords flous)
  const DOC_CACHE = {};
  function doc3d(g, key, o = {}) {
    const { t, t0 = 0, tilt = 0.22, width = 980, cy = CY, focusY = 0.35 } = o; const img = IMG[key]; if (!img) return;
    const p = t == null ? 1 : anim(t, t0, 0.8, ease.outExpo); if (p <= 0) return;
    const ck = key + tilt + width;
    if (!DOC_CACHE[ck]) {                                    // pré-rendu une fois : version nette + version floue, en perspective
      const w = width, h = w * img.height / img.width, strips = 60;
      const draw = (c) => { for (let i = 0; i < strips; i++) { const u = i / strips, sc = 1 + tilt * (u - 0.5) * 0.7, sw = img.width / strips;
        c.drawImage(img, i * sw, 0, sw + 1, img.height, u * w, (h - h * sc) / 2, w / strips + 1, h * sc); } };
      const sharp = makeCanvas(w, h, draw);
      const blur = makeCanvas(w, h, (c) => { c.filter = 'blur(5px) brightness(0.8)'; c.drawImage(sharp, 0, 0); });
      DOC_CACHE[ck] = { sharp, blur, w, h };
    }
    const D = DOC_CACHE[ck], s = lerp(0.9, 1, p) * (t == null ? 1 : 1 + (t - t0) * 0.01);
    const w = D.w * s, h = D.h * s, x0 = CX - w / 2, y0 = cy - h * focusY;
    g.save(); g.globalAlpha = p; g.drawImage(D.blur, x0, y0, w, h);
    g.beginPath(); g.ellipse(CX, cy, w * 0.42, h * 0.22, 0, 0, Math.PI * 2); g.clip(); g.drawImage(D.sharp, x0, y0, w, h); g.restore();
  }

  // ---------- TRANSITIONS ----------
  // Push/whip latéral : offset caméra autour de tCut. Rendre la scène avec SCENE.sub = 6 pour un vrai flou de mouvement.
  const whip = (t, tCut, dir = 1, dist = 1400) => {
    const d = T.whip / 2; if (t < tCut - d || t > tCut + d) return 0;
    return t < tCut ? dir * dist * ease.in((t - (tCut - d)) / d) : -dir * dist * (1 - ease.out((t - tCut) / d));
  };
  // Les éléments s'écartent vers les bords : renvoie l'offset x pour un élément du côté side (-1/1)
  const spread = (t, t0, side, dist = 700, dur = 0.35) => side * dist * ease.in(clamp((t - t0) / dur));

  window.DA = { W, H, C, F, SAFE, CX, CY, T, frame, dust, glow, noGlow, font, title, rich, label, counter,
    SPRITES, sprite, path, arrow, bars, ruler, loadImages, IMG, archive, doc3d, whip, spread };
})();
```