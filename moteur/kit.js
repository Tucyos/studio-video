// kit.js : la boîte à outils des sections (moteur des nouveaux projets, version dans moteur/VERSION).
// Repris de la lib auto du Mans 66 (core, post, fonts, d2) et de motion.js. Tout est fonction pure du temps : pas de Math.random, pas d'état d'une image à l'autre.
import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';
import { KTX2Loader } from '/node_modules/three/examples/jsm/loaders/KTX2Loader.js';
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';
import { makePost, LOOKS } from './post.js';
export { THREE, LOOKS };

const PJ = await fetch('/project.json').then(r => r.json());
export const W = PJ.format === '16:9' ? 1920 : 1080, H = PJ.format === '16:9' ? 1080 : 1920;
const DRAFT = location.search.includes('draft');

// ---------- 3D partagée (une scène, une caméra ; chaque section a son Group) ----------
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(DRAFT ? 1 : 1.5); renderer.setSize(W, H, false);   // 3D suréchantillonnée ×1,5 (anti-crénelage), comme le Mans 66
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(40, W / H, .1, 6000);
const POST = makePost(renderer);
export const LOOK = { bloom: .07, thr: 1.05, knee: .6, scatter: .62, ca: .0012, vig: .3, grain: .022, sat: 1.08, contrast: 1.07, wb: [1.01, 1, .98], shadow: [.003, .004, .007], fire: 0, roll: 0, hot: 1, exp: 1 };   // le réglage du Mans 66

// remet la scène commune à zéro avant chaque image (appelé par le moteur, pas par les sections)
export function remise() {
  camera.position.set(0, 1.6, 8); camera.up.set(0, 1, 0); camera.fov = 40; camera.near = .1; camera.far = 6000; camera.zoom = 1; camera.aspect = W / H; camera.updateProjectionMatrix(); camera.lookAt(0, 1, 0);
  scene.background = null; scene.fog = null; scene.environment = null; renderer.toneMappingExposure = 1;
}
// rend la 3D (avec le post-traitement) et la colle sur le canvas 2D de la scène : les textes viennent APRÈS, sur g
export function rendre3D(g, T, look = LOOK) { POST.render(scene, camera, { ...look, frame: Math.floor(T * 60 + 1e-4) }); g.drawImage(renderer.domElement, 0, 0, W, H); }
export const ecran = v => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, ok: p.z < 1 }; };   // point 3D -> pixels

// modèles GLB : chargés une fois par page, chaque appel rend une copie
// modèles GLB : chargés une fois par page, chaque appel rend une copie (SkeletonUtils : les personnages riggés restent riggés)
const gl = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(new KTX2Loader().setTranscoderPath('/node_modules/three/examples/jsm/libs/basis/').detectSupport(renderer)), GLB = new Map();   // textures KTX2 de la bibliothèque
const charge = url => { if (!GLB.has(url)) GLB.set(url, gl.loadAsync(url)); return GLB.get(url); };
export async function glb(url) { return SkeletonUtils.clone((await charge(url)).scene); }

// ---------- la bibliothèque commune (copiée dans assets/bib/<nom>/ par « Ajouter au projet ») ----------
// Convention : mètres, +Y en haut, l'avant regarde vers +Z, posé au sol (y = 0), centré en X et Z (sauf « origine libre » : voir la fiche).
// Vérifiée au chargement : la taille doit être celle de la fiche (sinon erreur visible, comme une section cassée).
const FICHES = new Map();
export async function fiche(nom) { if (!FICHES.has(nom)) FICHES.set(nom, fetch(`/assets/bib/${nom}/fiche.json`).then(r => { if (!r.ok) throw new Error(`« ${nom} » n'est pas dans le projet (Ajouter au projet depuis la Bibliothèque)`); return r.json(); })); return FICHES.get(nom); }
export async function bib(nom) {
  const f = await fiche(nom), o = await glb(`/assets/bib/${nom}/${f.fichier}`);
  const b = new THREE.Box3().setFromObject(o, true), d = b.getSize(new THREE.Vector3()).toArray(), tol = Math.max(.01, Math.max(...f.dims_m) * .01);
  if (f.dims_m.some((x, i) => Math.abs(x - d[i]) > tol) || Math.abs(b.min.y) > tol) {
    const m = `bibliothèque : « ${nom} » chargé à ${d.map(x => x.toFixed(2)).join(' × ')} m (fiche : ${f.dims_m.join(' × ')}), bas à y = ${b.min.y.toFixed(2)}`;
    console.error(m); (window.ERREURS ||= {})['bib:' + nom] = m;
  }
  o.name ||= nom; o.userData.bib = nom; return o;
}
export async function animations(nom) { const f = await fiche(nom); return (await charge(`/assets/bib/${nom}/${f.fichier}`)).animations; }
// joue une animation comme fonction pure du temps : anime(perso, clips, 'Walk_Loop', t) ; t en secondes depuis le début du geste
const MIX = new WeakMap();
export function anime(objet, clips, nom, t, { boucle = true } = {}) {
  let m = MIX.get(objet); if (!m) MIX.set(objet, m = { mixer: new THREE.AnimationMixer(objet), act: null });
  const clip = clips.find(c => c.name === nom); if (!clip) throw new Error(`animation « ${nom} » introuvable (${clips.map(c => c.name).join(', ')})`);
  const a = m.mixer.clipAction(clip); if (m.act !== a) { m.mixer.stopAllAction(); a.play(); m.act = a; }
  a.setLoop(boucle ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); a.clampWhenFinished = !boucle;
  m.mixer.setTime(boucle ? t : Math.min(t, clip.duration - 1e-4));   // jamais update(dt) : l'image ne dépend que de t
}

// ---------- mouvements de caméra nommés (fonctions pures : p = 0..1, ou T) ----------
const V = (a) => a.isVector3 ? a : new THREE.Vector3(...a);
export const cam = {
  // tourne autour de centre ; angle en degrés (0 = devant, côté +Z de l'objet), tours = nombre de tours sur la durée
  orbite(centre, { rayon = 6, hauteur = 1.6, depart = 30, tours = .15, p = 0, fov = 35 } = {}) {
    const c = V(centre), a = (depart + 360 * tours * p) * Math.PI / 180;
    camera.position.set(c.x + rayon * Math.sin(a), c.y + hauteur, c.z + rayon * Math.cos(a)); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(c);
  },
  // glisse de « de » à « a » en regardant « cible » (ease.inOut)
  travelling(de, a, cible, p, { fov = 35, f = ease.inOut } = {}) { camera.position.lerpVectors(V(de), V(a), f(clamp(p))); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(V(cible)); },
  // avance vers la cible (distance d0 -> d1) sur l'axe de visée
  dolly(cible, dir, d0, d1, p, { fov = 35, f = ease.inOut } = {}) { const c = V(cible), u = V(dir).clone().normalize(); camera.position.copy(c).addScaledVector(u, lerp(d0, d1, f(clamp(p)))); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(c); },
  // vue de dessus qui descend (h0 -> h1), le haut de l'image vers -Z
  plongee(cible, h0, h1, p, { fov = 40, f = ease.out } = {}) { const c = V(cible); camera.position.set(c.x, c.y + lerp(h0, h1, f(clamp(p))), c.z + .001); camera.up.set(0, 0, -1); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(c); camera.up.set(0, 1, 0); },
  // suit un objet : caméra dans son repère (décalage x, y, z ; +Z = devant lui), regarde un point de l'objet
  suivi(objet, decalage = [2.5, 1.4, -6], vise = [0, .6, 0], { fov = 35 } = {}) { objet.updateMatrixWorld(true); camera.position.copy(objet.localToWorld(V(decalage).clone())); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(objet.localToWorld(V(vise).clone())); },
};

// ---------- éclairages prêts à l'emploi (à appeler dans build, sur k.groupe) -> renvoie le réglage de rendu à passer à rendre3D ----------
export function eclairage(groupe, nom = 'nuit') {
  const L = [];
  if (nom === 'nuit') {   // nuit de course (Mans 66) : ciel bleu-gris bas, projecteurs froids des stands, une lune pour les ombres
    L.push(new THREE.HemisphereLight('#9fb2c8', '#1a1d22', .9));
    const lune = new THREE.DirectionalLight('#dbe6f5', .7); lune.position.set(-20, 40, 15); L.push(lune);
    for (const x of [-12, 12]) { const s = new THREE.SpotLight('#eef4ff', 400, 80, .55, .6, 1.6); s.position.set(x, 14, -10); s.target.position.set(0, 0, 0); L.push(s, s.target); }
    groupe.add(...L); return { ...LOOK, exp: .95, sat: .9, wb: [.97, 1, 1.04], vig: .36, bloom: .1 };
  }
  if (nom === 'jour') {   // plein jour (Monza, Mugello) : soleil franc, ciel clair
    const sol = new THREE.DirectionalLight('#fff1dc', 2.4); sol.position.set(-30, 50, 25); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
    const c = sol.shadow.camera; c.left = c.bottom = -30; c.right = c.top = 30; c.far = 200;
    groupe.add(sol, new THREE.HemisphereLight('#cfe3ff', '#5b5a4f', .8)); return { ...LOOKS.day };
  }
  if (nom === 'studio') {   // fond neutre, trois points (présentation d'un objet seul)
    for (const [x, y, z, i] of [[-4, 5, 4, 2.2], [5, 3, 3, .9], [0, 4, -6, 1.6]]) { const d = new THREE.DirectionalLight('#ffffff', i); d.position.set(x, y, z); groupe.add(d); }
    groupe.add(new THREE.HemisphereLight('#ffffff', '#30343a', .5)); return { ...LOOK, bloom: .03, vig: .2, grain: .01 };
  }
  throw new Error(`éclairage « ${nom} » inconnu (nuit, jour, studio)`);
}

// sujets 3D (voitures, personnages) : check.mjs contrôle sol, traversées, caméra dedans, à-coups
window.SUJETS ||= {};
export function sujet(nom, obj) { window.SUJETS[nom] = obj; return obj; }

// ---------- temps ----------
export function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const hash = (i, s = 1) => rng((i * 374761393 + s * 668265263) | 0)();   // 0..1, toujours le même pour (i, s)
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const grille = t => Math.round(t * 30) / 30;   // coupes sur la grille des images
export const ease = {
  linear: p => p, out: p => 1 - Math.pow(1 - p, 4), outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOut: p => (p < .5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2), in: p => p ** 3,
  back: (p, s = .9) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),   // dépasse ~4 %
};
export const anim = (t, t0, dur, fn = ease.out) => fn(clamp((t - t0) / dur));   // 0..1 d'une anim qui part à t0 et dure dur
export function keys(t, ks) {   // clés façon After Effects : [[t, v, ease?], ...]
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const [t0, v0] = ks[i - 1], [t1, v1, fn] = ks[i]; return lerp(v0, v1, (fn || ease.inOut)((t - t0) / (t1 - t0))); }
  return ks[ks.length - 1][1];
}
export function spring(t, k = 170, d = 26) {   // ressort amorti 0 -> 1
  if (t <= 0) return 0; const w0 = Math.sqrt(k), z = d / (2 * w0);
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}
const noise = (x, seed = 1) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1; };
export const wiggle = (t, freq, amp, seed = 1) => noise(t * freq, seed) * amp;

// ---------- la voix ----------
const WJ = await fetch('/audio/words.json').then(r => r.ok ? r.json() : []).catch(() => []);
export const MOTS = Array.isArray(WJ) ? WJ : WJ.words || [];
export const PHRASES = Array.isArray(WJ) ? null : WJ.phrases || null;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
export function at(mot, n = 1, apres = 0) {   // instant (T global) où la voix dit `mot` (n-ième fois, à partir de `apres`)
  const l = MOTS.filter(x => norm(x.w) === norm(mot) && x.start >= apres);
  if (!l[n - 1]) { console.warn('mot introuvable', mot, n, apres); return apres; } return l[n - 1].start;
}

// ---------- 2D : couleurs, polices, textes (DA auto) ----------
export const C = { nuit: '#07090C', nuit2: '#121821', blanc: '#F4F6F8', gris: '#9AA3AE', jaune: '#FFD23F', rouge: '#E10600', vert: '#2BD47D', bleu: '#5AA9E6' };
export const F = { titre: '"Mont"', ui: '"Inter"', mono: '"JB"' };
await Promise.all([['Mont', 'montserrat-latin-900-italic', { style: 'italic', weight: '900' }], ['Inter', 'inter-latin-wght-normal', { weight: '100 900' }], ['JB', 'jetbrains-mono-latin-wght-normal', { weight: '100 900' }]]
  .map(async ([n, f, d]) => { const ff = new FontFace(n, `url(/moteur/fonts/${f}.woff2)`, d); await ff.load(); document.fonts.add(ff); }));

// un texte (toujours fillText sur g : c'est ce que relève le contrôle). Titres : f: F.titre, italic: 'italic ', w: 900
export function texte(g, s, x, y, { f = F.ui, size = 48, w = 800, color = C.blanc, align = 'center', base = 'middle', ombre = true, alpha = 1, italic = '', ls = 0 } = {}) {
  if (alpha <= 0) return; g.save(); g.globalAlpha *= clamp(alpha); g.font = `${italic}${w} ${size}px ${f}`; g.textAlign = align; g.textBaseline = base; if (ls) g.letterSpacing = ls + 'px';
  if (ombre) { g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 14; g.shadowOffsetY = 3; }
  g.fillStyle = color; g.fillText(s, x, y); g.restore();
}
// coupe un texte en lignes qui tiennent dans maxW (réduit la taille si besoin) -> { l: [lignes], size }
export function lignes(g, s, maxW, size, w = 800, f = F.ui, n = 2) {
  const L = (t, z) => { g.save(); g.font = `${w} ${z}px ${f}`; const r = g.measureText(t).width; g.restore(); return r; }, ws = s.split(' ');
  for (let z = size; z > 14; z -= 2) {
    const l = ['']; for (const wd of ws) { const t = l[l.length - 1] ? l[l.length - 1] + ' ' + wd : wd; if (L(t, z) <= maxW) l[l.length - 1] = t; else l.push(wd); }
    if (l.length <= n && l.every(t => L(t, z) <= maxW)) return { l, size: z };
  }
  return { l: [s], size: 14 };
}
// une carte sombre arrondie (fond de texte)
export function carte(g, x, y, w, h, { alpha = 1, col = 'rgba(8,10,14,.84)', r = 18 } = {}) {   // pas de liseré (option barre retirée : ça « fait IA »)
  if (alpha <= 0) return; g.save(); g.globalAlpha *= clamp(alpha); g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();
  g.restore();
}

// ---------- sous-titres (dessinés par le moteur après chaque section, jamais par les sections) ----------
// mot dit = blanc, mot en cours = jaune, mots à venir = gris (DA du Mans 66). Groupes = phrases du fichier de mots, sinon coupés aux pauses et à la ponctuation.
const GROUPES = (() => {
  const G = []; let cur = [];
  MOTS.forEach((m, i) => { cur.push(m); const nx = MOTS[i + 1];
    const fin = !nx || (PHRASES ? nx.phrase !== m.phrase : (/[.?!…:,]$/.test(m.w) || nx.start - m.end > .35 || cur.length >= 7));
    if (fin) { G.push(cur); cur = []; } });
  return G;
})();
export function sousTitres(g, T, { y = 1425 } = {}) {
  T = Math.floor(T * 30 + 1e-6) / 30;
  const k = GROUPES.findLastIndex(gr => T >= gr[0].start - .05); if (k < 0) return; const gr = GROUPES[k], nx = GROUPES[k + 1];
  if (T > gr[gr.length - 1].end + .6 || (nx && T >= nx[0].start - .05)) return;
  const sh = g.createLinearGradient(0, y - 125, 0, y + 135); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.5, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(0, y - 125, W, 260);
  const cur = gr.filter(x => T >= x.start).pop();
  g.save(); g.font = `800 52px ${F.ui}`; const L = [[]]; let lw = 0;
  for (const x of gr) { const sw = g.measureText(x.w + ' ').width; if (lw + sw > Math.min(W - 180, 2 * (895 - 540) - 10) && L[L.length - 1].length) { L.push([]); lw = 0; } L[L.length - 1].push([x, sw]); lw += sw; }
  const show = L.length > 2 ? L.slice(Math.max(0, L.findIndex(l => l.some(([x]) => x === cur)) - 1)).slice(0, 2) : L;
  show.forEach((l, i) => { let x = W / 2 - l.reduce((a, [, sw]) => a + sw, 0) / 2;
    for (const [q, sw] of l) { g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 10; g.fillStyle = q === cur ? C.jaune : T >= q.start ? C.blanc : 'rgba(255,255,255,.55)'; g.fillText(q.w, x, y + i * 64); x += sw; } });
  g.restore();
}
export const projet = PJ;
