// qa-page.js : injecté AVANT la page, en mode contrôle seulement (jamais au rendu). À chaque seek(T), relève :
//  - les textes dessinés sur le canvas de la scène (#c) : chaîne, taille, boîte, en pixels de la référence 1080 de large ;
//  - au 1er rendu 3D en perspective : la caméra et les sujets de l'adaptateur (boîtes orientées, sol, traversées, caméra dedans, cadre) ;
//  - une vignette 135×240 pour la luminosité et l'écart avec l'image précédente.
// Les scènes Three.js se signalent d'elles-mêmes par __THREE_DEVTOOLS__ (constructeurs de Scene et WebGLRenderer, three 0.186).
(() => {
  const Q = window.__qa = { T: 0, texts: [], cam: null, renders: 0, sujets: {}, local: new Map(), sol: null, three: null, prev: null };

  // ---------- textes ----------
  const P = CanvasRenderingContext2D.prototype;
  for (const fn of ['fillText', 'strokeText']) {
    const orig = P[fn];
    P[fn] = function (s, x, y) {
      let cache = false;
      if (this.canvas.id === 'c' && this.globalAlpha > .05 && String(s).trim()) {
        const m = this.measureText(s), t = this.getTransform(), k = 1080 / this.canvas.width;   // measureText tient compte de textAlign / textBaseline
        const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)?.[1] || 0);
        const pts = [[x - m.actualBoundingBoxLeft, y - m.actualBoundingBoxAscent], [x + m.actualBoundingBoxRight, y + m.actualBoundingBoxDescent]]
          .flatMap(([a, b], i, l) => [[a, b], [a, l[1 - i][1]]]).map(([a, b]) => [(t.a * a + t.c * b + t.e) * k, (t.b * a + t.d * b + t.f) * k]);
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        const e = { s: String(s), size: +(px * Math.hypot(t.a, t.b) * k).toFixed(1), a: +this.globalAlpha.toFixed(2), box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(v => Math.round(v)),
          font: this.font, fill: typeof this.fillStyle === 'string' ? this.fillStyle : null, trait: fn === 'strokeText', ombre: this.shadowBlur > 0 && !/rgba\([^)]*,\s*0\)$/.test(this.shadowColor) };   // pour les lettres absentes et le contraste
        Q.texts.push(e); cache = !!Q.masque?.(e);   // calque du studio : textes masqués (sous-titres, ou tous)
      }
      return cache ? undefined : orig.apply(this, arguments);
    };
  }

  // ---------- 3D ----------
  const dt = window.__THREE_DEVTOOLS__ = new EventTarget();
  dt.addEventListener('observe', e => {
    const r = e.detail; if (!r || !r.isWebGLRenderer) return;
    const orig = r.render;   // posé dans le constructeur, avant que post.js ne le lie : notre version passe donc aussi par le post-traitement
    r.render = function (scene, camera) {
      Q.renders++;
      if (!Q.cam && camera && camera.isPerspectiveCamera && Q.three) { Q.mainCam ||= camera; window.__qaSeed3d?.(Q.T, scene, camera); Q.cam = mesure(scene, camera); }
      if (Q.camLibre && camera === Q.mainCam) { const a = [...arguments]; a[1] = Q.camLibre; return orig.apply(this, a); }   // outil caméra du studio
      return orig.apply(this, arguments);
    };
  });

  const visible = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
  function localBox(o) {   // boîte exacte du sujet dans son propre repère, d'après les sommets (calculée une fois). Pas les boîtes des pièces :
    // celle d'une roue tournée grossit aux coins et passerait sous le sol.
    const { Box3, Matrix4, Vector3 } = Q.three.T, b = new Box3(), inv = o.matrixWorld.clone().invert(), m = new Matrix4(), v = new Vector3();
    o.traverse(c => { const pos = c.isMesh && c.geometry?.attributes.position; if (!pos) return; m.multiplyMatrices(inv, c.matrixWorld);
      for (let i = 0; i < pos.count; i++) b.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(m)); });
    return b;
  }
  function mesure(scene, camera) {
    const { T, OBB } = Q.three; scene.updateMatrixWorld(); camera.updateMatrixWorld();
    const cam = { p: camera.position.toArray().map(v => +v.toFixed(4)), d: camera.getWorldDirection(new T.Vector3()).toArray().map(v => +v.toFixed(5)), sujets: {}, inter: [], dedans: [] };
    const obbs = {};
    for (const [n, o] of Object.entries(Q.sujets)) {
      if (!o || !visible(o)) continue;
      if (!Q.local.has(o)) Q.local.set(o, localBox(o));
      const lb = Q.local.get(o); if (lb.isEmpty()) continue;
      const obb = obbs[n] = new OBB().fromBox3(lb).applyMatrix4(o.matrixWorld);
      const corners = []; for (const x of [lb.min.x, lb.max.x]) for (const y of [lb.min.y, lb.max.y]) for (const z of [lb.min.z, lb.max.z]) corners.push(new T.Vector3(x, y, z).applyMatrix4(o.matrixWorld));
      const minY = Math.min(...corners.map(c => c.y));
      const scr = corners.map(c => c.clone().project(camera)).filter(c => c.z < 1 && c.z > -1).map(c => [(c.x + 1) / 2 * 1080, (1 - c.y) / 2 * 1920]);
      const box = scr.length ? [Math.min(...scr.map(c => c[0])), Math.min(...scr.map(c => c[1])), Math.max(...scr.map(c => c[0])), Math.max(...scr.map(c => c[1]))].map(Math.round) : null;
      const ctr = obb.center.clone().project(camera);
      cam.sujets[n] = { minY: +minY.toFixed(3), box, devant: scr.length === 8, ctr: ctr.z < 1 ? [+((ctr.x + 1) / 2 * 1080).toFixed(1), +((1 - ctr.y) / 2 * 1920).toFixed(1)] : null };
      const cp = obb.clone(); cp.halfSize.addScalar(camera.near); if (cp.containsPoint(camera.position)) cam.dedans.push(n);
    }
    const ns = Object.keys(obbs); for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) if (obbs[ns[i]].intersectsOBB(obbs[ns[j]])) cam.inter.push([ns[i], ns[j]]);
    return cam;
  }

  // ---------- contraste texte / fond (rapport WCAG), dans la vignette 135×240 déjà lue ----------
  // Le fond = la médiane d'une rangée juste au-dessus et d'une juste au-dessous de la boîte (8 px de l'image) ; on garde la meilleure des deux
  // (l'autre peut tomber sur la ligne voisine d'un sous-titre). Pas de mesure pour un texte à contour ou ombré : c'est lui qui donne le contraste.
  const lum = (r, g, b) => { const f = c => (c /= 255) <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const norm = document.createElement('canvas').getContext('2d');
  const rgba = s => { norm.fillStyle = '#000'; norm.fillStyle = s; const v = norm.fillStyle; if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)).concat(1); const m = v.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m[3] ?? 1]; };
  function contraste(e, d) {
    if (!e.fill || e.trait || e.ombre || e.a < .95) return null;
    const c = rgba(e.fill); if (c[3] < .95) return null;
    const Lt = lum(c[0], c[1], c[2]), x0 = Math.max(0, Math.floor(e.box[0] / 8)), x1 = Math.min(134, Math.ceil(e.box[2] / 8)); let best = null;
    for (const y of [Math.floor(e.box[1] / 8) - 1, Math.ceil(e.box[3] / 8) + 1]) {
      if (y < 0 || y > 239 || x1 < x0) continue;
      const L = []; for (let x = x0; x <= x1; x++) { const i = (y * 135 + x) * 4; L.push(lum(d[i], d[i + 1], d[i + 2])); }
      const Lf = L.sort((a, b) => a - b)[L.length >> 1], r = (Math.max(Lt, Lf) + .05) / (Math.min(Lt, Lf) + .05);
      best = Math.max(best ?? 0, r);
    }
    return best == null ? null : +best.toFixed(2);
  }

  // ---------- lettres absentes de la police : « police, monospace » mesure comme « monospace » seul, et pareil avec serif = la police n'a pas la lettre ----------
  // (vérifié le 23/10 : trouve ğ, → et 漢 absents de l'Inter « latin » du moteur. Comparer « police, monospace » à « police, serif » ratait les lettres
  // qu'aucune des deux polices de secours n'a : le navigateur prend alors la même police système des deux côtés. Les caractères de la zone privée
  // d'Unicode ne sont pas détectables : Chrome ne cherche pas de police de secours pour eux.)
  const essai = document.createElement('canvas').getContext('2d'), GENERIQUES = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+)$/i;
  const w = (c, f) => { essai.font = '100px ' + f; return essai.measureText(c).width; };
  const manque = (fam, c) => w(c, `"${fam}", monospace`) === w(c, 'monospace') && w(c, `"${fam}", serif`) === w(c, 'serif');
  Q.glyphes = paires => paires.map(([font, ch]) => {
    const fam = /\d(?:\.\d+)?px\s+(.+)$/.exec(font)?.[1].split(',')[0].trim().replace(/^["']|["']$/g, '');
    if (!fam || GENERIQUES.test(fam) || !ch.trim()) return null;   // les espaces : leur largeur peut coïncider, sans risque visible
    if (manque(fam, 'a')) return { fam, absente: 'police' };   // la police elle-même n'est pas chargée
    return manque(fam, ch) ? { fam, absente: ch } : null;
  });

  // appelé par check.mjs une fois la page prête : charge three (le même module que la page) et pose les sujets de l'adaptateur
  Q.init = async ({ sujets = {}, sol = null } = {}) => {
    try { const T = await import('/node_modules/three/build/three.module.js'), { OBB } = await import('/node_modules/three/examples/jsm/math/OBB.js'); Q.three = { T, OBB }; } catch (e) { Q.three = null; }
    for (const [n, expr] of Object.entries(sujets)) { try { Q.sujets[n] = (0, eval)(expr); } catch { Q.sujets[n] = null; } }
    if (!Object.keys(sujets).length && window.SUJETS) Q.sujets = window.SUJETS;   // moteur du studio : sujets déclarés par kit.sujet()
    Q.sol = sol;
    const c = document.getElementById('c'), v = document.createElement('canvas'); v.width = 135; v.height = 240; const vg = v.getContext('2d', { willReadFrequently: true });
    const seek = window.seek;
    // une image analysée : seek + relevés + vignette (lue sur notre canvas : jamais de getImageData sur #c, cf. phase 1)
    // studio : une image, sans les mesures de pixels (lecture en temps réel)
    Q.voir = async T => { Q.T = T; Q.texts = []; Q.cam = null; await seek(T); return { texts: Q.texts, cam: Q.cam }; };
    Q.frame = async T => {
      Q.T = T; Q.texts = []; Q.cam = null; Q.renders = 0;
      await seek(window.__qaSeedT ? window.__qaSeedT(T) : T);
      window.__qaSeed2d?.(T, c.getContext('2d'));
      vg.drawImage(c, 0, 0, 135, 240); const d = vg.getImageData(0, 0, 135, 240).data, h = new Uint32Array(256);
      let s = 0, s2 = 0, df = 0, df2 = 0; const n = d.length / 4, P2 = Q.prev2;
      for (let i = 0; i < d.length; i += 4) { const l = Math.round(.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]); h[l]++; s += l; s2 += l * l; if (Q.prev) df += Math.abs(d[i] - Q.prev[i]) + Math.abs(d[i + 1] - Q.prev[i + 1]) + Math.abs(d[i + 2] - Q.prev[i + 2]); if (P2) df2 += Math.abs(d[i] - P2[i]) + Math.abs(d[i + 1] - P2[i + 1]) + Math.abs(d[i + 2] - P2[i + 2]); }
      const pct = q => { let a = 0; for (let i = 0; i < 256; i++) if ((a += h[i]) >= q * n) return i; return 255; };
      for (const e of Q.texts) e.contraste = contraste(e, d);
      const out = { T, renders: Q.renders, texts: Q.texts, cam: Q.cam, luma: { moy: +(s / n).toFixed(1), ect: +Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)).toFixed(1), p05: pct(.05), p95: pct(.95) }, diff: Q.prev ? +(df / n / 3).toFixed(2) : null, diff2: P2 ? +(df2 / n / 3).toFixed(2) : null };   // diff2 : écart avec l'image d'il y a 2 (pics d'une image)
      Q.prev2 = Q.prev; Q.prev = d; return out;
    };
    return { three: !!Q.three, sujets: Object.fromEntries(Object.entries(Q.sujets).map(([n, o]) => [n, !!o])) };
  };
})();
