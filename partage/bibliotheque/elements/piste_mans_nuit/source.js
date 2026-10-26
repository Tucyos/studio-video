// objets.js : les objets 3D partagés du Mans 66 (créateur d'objets). Les sections les placent dans leur k.groupe ; rien n'est ajouté à la scène ici.
// Repère commun : Y vers le haut, sol (asphalte) à y = 0, 1 unité = 1 mètre. Sens de la course = +Z.
//
// ── await gt40_1(k, o) · await gt40_2(k, o) · await gt40_5(k, o)  →  THREE.Group (async : modèle GLB)
//    Ford GT40 Mk II : n°1 bleu clair (Miles / Hulme), n°2 noire (McLaren / Amon), n°5 or (Bucknum / Hutcherson).
//    Taille : 4,1 m de long (z −1,85 → +2,24), 1,77 m de large, 1,03 m de haut.
//    Origine : au sol (y = 0, roues posées), au milieu des deux essieux. Le NEZ regarde +Z (voiture.lookAt(cible) l'oriente vers la cible).
//    Fournit : phares blanc chaud #FFE6A8 (projecteur + cône visible + halos), feux arrière rouges, reflets étirés sur la piste mouillée,
//    ombre douce au sol, gerbes d'eau derrière les roues, roues qui tournent.
//    À appeler à CHAQUE image (fonction pure de T) : voiture.userData.maj(T, { vitesse, distance, phares })
//      vitesse  : m/s (règle les gerbes ; 0 = pas de gerbe). distance : mètres parcourus (fait tourner les roues ; défaut vitesse × T).
//      phares   : 0..1 (défaut 1 ; 0 = phares et feux éteints, ex. partie « film » de s02).
//    voiture.userData.ancre : point sur le toit (y 1,2 m) pour ecran() et les étiquettes. Déclarer : sujet('gt40_1', voiture).
//    Options o : { phares: 1, gerbes: 1 (force des gerbes), ombre: true }.
//
// ── piste_nuit(k, o)  →  THREE.Group
//    Ligne droite des stands du Mans, la nuit sous la pluie. Longueur o.longueur (défaut 900 m) : z de −450 à +450.
//    Origine : centre de la piste, au sol. Piste x −7 → +7 (lignes blanches en x ±6,75), muret des stands en x −7,8 (1,05 m de haut),
//    voie des stands x −21 → −8, stands éclairés en blanc froid en x −17 → −29 (z −170 → +170), rail en x +9,6,
//    tribunes illuminées à gauche (x +13,5 → +28), lampadaires de 11 m tous les 35 m, lumières lointaines tout autour, ciel de nuit (dôme).
//    À appeler à chaque image : piste.userData.ambiance(k.scene) → brume de pluie (le moteur remet scene.fog à zéro avant chaque image).
//    Options o : { longueur: 900, brume: .0042 }.
//
// ── pluie(k, o)  →  THREE.Mesh
//    Pluie en traits fins (1,5 px, 20 à 60 px de long, penchés de 8° vers la gauche à l'écran), surtout visibles dans les faisceaux des phares
//    et autour des lampadaires (elle trouve seule les phares et lampadaires visibles). Elle suit la caméra : la poser n'importe où dans k.groupe.
//    À appeler à chaque image : pluie.userData.maj(T). Options o : { n: 7000, graine: 11, force: 1, devant: 26 (m devant la caméra), taille: [30, 22, 60] }.
//    Les gerbes d'eau derrière les roues sont fournies par chaque voiture (userData.maj avec la vitesse).
//
// Exemple dans une section :
//   const piste = piste_nuit(k), bleue = sujet('gt40_1', await gt40_1(k)), eau = pluie(k); k.groupe.add(piste, bleue, eau);
//   update(T) { piste.userData.ambiance(k.scene); bleue.position.set(-2, 0, 60 * T); bleue.userData.maj(T, { vitesse: 60 }); eau.userData.maj(T); … rendre3D(g, T, k.LOOKS.night); }

const CACHE = new Map();
const une = (cle, f) => { if (!CACHE.has(cle)) CACHE.set(cle, f()); return CACHE.get(cle); };
const LOGV = '#include <common>\n#include <logdepthbuf_pars_vertex>\n', LOGF = '#include <logdepthbuf_pars_fragment>\n';
const PHARE = [1, .9, .66], FROID = 0xe8f0ff;

// halo rond (dégradé radial blanc)
function texRond(k) {
  return une('rond', () => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.22, 'rgba(255,255,255,.5)'); gr.addColorStop(.55, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new k.THREE.CanvasTexture(c);
  });
}

// environnement de nuit pour les reflets (stands blanc froid d'un côté, tribunes de l'autre, lampadaires au-dessus)
function envNuit(k) {
  return une('env', () => {
    const T = k.THREE, s = new T.Scene(); s.background = new T.Color(0x06090e);
    const bas = (c, i) => new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(i), side: T.DoubleSide });
    const add = (geo, mat, x, y, z, ry = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; s.add(m); };
    add(new T.CylinderGeometry(80, 80, 14, 48, 1, true), bas(0x1a2331, 1), 0, 2, 0);
    add(new T.PlaneGeometry(70, 2.6), bas(0xdfe9ff, 5), -14, 1.6, 0, Math.PI / 2);
    add(new T.PlaneGeometry(70, 1.2), bas(0xdfe9ff, 2), -14, 5, 0, Math.PI / 2);
    add(new T.PlaneGeometry(70, 1.5), bas(0xf0ede6, 3), 16, 7, 0, -Math.PI / 2);
    for (let i = -3; i <= 3; i++) add(new T.SphereGeometry(.6, 8, 6), bas(FROID, 22), i % 2 ? -7 : 9, 11, i * 11);
    add(new T.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), bas(0x030405, 1), 0, -1, 0);
    const pm = new T.PMREMGenerator(k.renderer), rt = pm.fromScene(s, .02); pm.dispose(); return rt.texture;
  });
}

// ───────────────────────── reflets étirés sur la piste mouillée (phares, feux, lampadaires) ─────────────────────────
// Un quad par lampe, couché au sol et tourné vers la caméra dans le shader (centré sur le point de réflexion miroir).
// L'attribut position reste à zéro (à l'origine de l'objet) : la boîte des contrôles ne voit que la voiture.
function refletsSol(k, lampes, { force = 1, long = 1, larg = .32, sol = .015 } = {}) {
  const T = k.THREE, n = lampes.length, pos = new Float32Array(n * 12), L = [], C = [], D = [], Q = [], I = [];
  lampes.forEach((e, i) => {
    for (const [a, b] of [[0, -1], [0, 1], [1, -1], [1, 1]]) { L.push(...e.p); C.push(...e.couleur, e.force ?? 1); D.push(...(e.dir || [0, 0, 0])); Q.push(a, b); }
    I.push(i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3);
  });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setIndex(I);
  geo.setAttribute('lampe', new T.Float32BufferAttribute(L, 3)); geo.setAttribute('coul', new T.Float32BufferAttribute(C, 4));
  geo.setAttribute('dirl', new T.Float32BufferAttribute(D, 3)); geo.setAttribute('coin', new T.Float32BufferAttribute(Q, 2));
  const mat = new T.ShaderMaterial({
    uniforms: { uSol: { value: sol }, uForce: { value: force }, uLong: { value: long }, uLarg: { value: larg } },
    vertexShader: LOGV + `attribute vec3 lampe; attribute vec4 coul; attribute vec3 dirl; attribute vec2 coin;
      uniform float uSol, uForce, uLong, uLarg; varying vec2 vCoin, vW; varying vec3 vC;
      void main() {
        vec3 L = (modelMatrix * vec4(lampe, 1.)).xyz;
        float h = max(L.y - uSol, .05), camH = max(cameraPosition.y - uSol, .15);
        vec2 dc = cameraPosition.xz - L.xz; float dist = max(length(dc), .01); vec2 d = dc / dist, nn = vec2(-d.y, d.x);
        vec2 c = L.xz + d * dist * h / (h + camH);
        float len = clamp((h + .4) * dist / camH * .22, .6, 45.) * uLong, w = uLarg * (.5 + .22 * h);
        vec2 q = c + d * mix(-.4, .6, coin.x) * len + nn * coin.y * w;
        float face = 1.;
        if (dot(dirl, dirl) > 0.) face = .08 + .92 * pow(max(0., dot(normalize(mat3(modelMatrix) * dirl), normalize(cameraPosition - L))), .8);
        vC = coul.rgb * coul.a * face * uForce; vCoin = coin; vW = q;
        gl_Position = projectionMatrix * viewMatrix * vec4(q.x, uSol, q.y, 1.);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: LOGF + `varying vec2 vCoin, vW; varying vec3 vC;
      float hs(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float br(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(hs(i), hs(i + vec2(1, 0)), f.x), mix(hs(i + vec2(0, 1)), hs(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        #include <logdepthbuf_fragment>
        float a = exp(-vCoin.y * vCoin.y * 3.5) * exp(-pow((vCoin.x - .4) / .28, 2.));
        float mouille = .4 + .8 * br(vW * .35) * (.7 + .3 * br(vW * 2.1));
        gl_FragColor = vec4(vC * a * mouille, 1.);
      }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
  });
  const m = new T.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 2; m.name = 'reflets'; return m;
}

// ───────────────────────── gerbes d'eau derrière les roues (particules, fonction pure de T) ─────────────────────────
function gerbes(k, n = 700, graine = 1) {
  const T = k.THREE, S = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) S.push(k.hash(i * 4 + j, graine));
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute('graine', new T.Float32BufferAttribute(S, 4));
  const mat = new T.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uV: { value: 0 }, uI: { value: 0 }, uPx: { value: 1000 }, uRouge: { value: 1 }, uCol: { value: new T.Vector3(.5, .55, .63) } },
    vertexShader: LOGV + `attribute vec4 graine; uniform float uT, uV, uI, uPx; varying float vA, vR;
      void main() {
        float vie = .45 + .4 * graine.y, age = fract(uT / vie + graine.x) * vie, u = age / vie;
        float cote = graine.z < .5 ? -1. : 1., avant = step(.78, fract(graine.z * 17.31));
        float e = fract(graine.w * 7.13), f = fract(graine.w * 3.77);
        vec3 roue = vec3(cote * .7, .06, mix(-1.17, 1.17, avant) - .32);
        vec3 p = roue + vec3(cote * (.1 + (.4 + 1.1 * e) * age), (1.2 + 1.8 * f) * age - 2.4 * age * age, -uV * (.45 + .25 * e) * age * (1. - .35 * u) - 1.2 * age);
        p.y = max(p.y, .03 + .25 * u);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1., (.18 + 1.5 * u) * (.6 + .8 * f) * (1. - .5 * avant) * uPx / max(.1, -mv.z));
        vA = uI * pow(1. - u, 1.6) * smoothstep(0., .04, age) * (1. - .55 * avant);
        vR = (1. - avant) * exp(-u * 5.);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: LOGF + `varying float vA, vR; uniform vec3 uCol; uniform float uRouge;
      void main() {
        #include <logdepthbuf_fragment>
        vec2 q = gl_PointCoord - .5; float d = dot(q, q) * 4.; if (d > 1.) discard;
        float a = (1. - d); a *= a * vA * .16;
        gl_FragColor = vec4(mix(uCol, vec3(1., .12, .06) * 1.6, vR * uRouge) * a, 1.);
      }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false,
  });
  const p = new T.Points(geo, mat); p.frustumCulled = false; p.name = 'gerbes';
  p.onBeforeRender = (r, s, cam) => { const rt = r.getRenderTarget(), h = rt ? rt.height : r.getDrawingBufferSize(new T.Vector2()).y; mat.uniforms.uPx.value = cam.projectionMatrix.elements[5] * h * .5; };
  return p;
}

// ───────────────────────── cône de phare visible dans la pluie ─────────────────────────
function cone(k, portee = 20, ouverture = .28) {
  const T = k.THREE, g = new T.CylinderGeometry(.1, portee * Math.tan(ouverture), portee, 20, 10, true).translate(0, -portee / 2, 0);
  const le = []; for (let i = 0; i < g.attributes.position.count; i++) le.push(-g.attributes.position.getY(i) / portee);
  g.rotateX(-Math.PI / 2).rotateX(.07);
  g.setAttribute('forme', g.attributes.position.clone()); g.setAttribute('le', new T.Float32BufferAttribute(le, 1));
  g.setAttribute('position', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  return g;
}
function matCone(k) {
  const T = k.THREE;
  return new T.ShaderMaterial({
    uniforms: { uForce: { value: 1 }, uCol: { value: new T.Vector3(...PHARE) } },
    vertexShader: LOGV + `attribute vec3 forme; attribute float le; varying float vT; varying vec3 vN, vV;
      void main() { vec4 w = modelMatrix * vec4(forme, 1.); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); vT = le;
        gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: LOGF + `uniform float uForce; uniform vec3 uCol; varying float vT; varying vec3 vN, vV;
      void main() {
        #include <logdepthbuf_fragment>
        float e = abs(dot(normalize(vN), normalize(vV)));
        float a = pow(e, 1.5) * pow(1. - vT, 1.8) * smoothstep(0., .06, vT) * uForce * .05;
        gl_FragColor = vec4(uCol * a, 1.);
      }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, fog: false,
  });
}

// ───────────────────────── les GT40 ─────────────────────────
const MATS = new WeakMap();
function matVoiture(k, m) {
  if (MATS.has(m)) return MATS.get(m);
  const T = k.THREE, env = envNuit(k), n = (m.name || '').toUpperCase(); let r = m;
  if (n.includes('BODY')) {
    r = new T.MeshPhysicalMaterial({ name: m.name, map: m.map, color: m.color, normalMap: m.normalMap, normalScale: m.normalScale, roughnessMap: m.roughnessMap, metalnessMap: m.metalnessMap,
      roughness: m.roughness, metalness: m.metalness, side: m.side, clearcoat: 1, clearcoatRoughness: .05, envMap: env, envMapIntensity: 1.3 });   // vernis mouillé
  } else if (n.includes('REDLIGHTS')) { r = m.clone(); r.emissive = new T.Color(0xff2010); r.emissiveIntensity = 3; r.envMap = env; }
  else if (n.includes('LIGHTS')) { r = m.clone(); r.emissive = new T.Color(0xffe6a8); r.emissiveIntensity = 2.2; r.envMap = env; }
  else { r.envMap = env; r.envMapIntensity = n.includes('GLASS') ? 1.6 : 1; }
  MATS.set(m, r); return r;
}

async function gt40(k, url, nom, o = {}) {
  const T = k.THREE, modele = await k.glb(url);
  modele.traverse(c => { if (c.isMesh) { c.material = Array.isArray(c.material) ? c.material.map(m => matVoiture(k, m)) : matVoiture(k, c.material); c.castShadow = c.receiveShadow = true; } });
  modele.rotation.y = Math.PI;   // le GLB a le nez vers −Z : on le tourne vers +Z
  const v = new T.Group(); v.name = nom; v.add(modele);
  const roues = ['roue_AVG', 'roue_AVD', 'roue_ARG', 'roue_ARD'].map(n => modele.getObjectByName(n)).filter(Boolean), r0 = roues.map(r => r.rotation.x);

  // ancre pour les étiquettes
  const ancre = new T.Object3D(); ancre.position.set(0, 1.2, 0); v.add(ancre); v.userData.ancre = ancre;

  // ombre douce au sol
  if (o.ombre !== false) {
    const om = une('ombre', () => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
      x.filter = 'blur(7px)'; x.fillStyle = '#fff'; x.beginPath(); x.roundRect(10, 12, 44, 104, 14); x.fill(); return new T.CanvasTexture(c); });
    const s = new T.Mesh(new T.PlaneGeometry(1.95, 4.3).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0, alphaMap: om, transparent: true, opacity: .85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    s.position.set(0, .012, .15); s.name = 'ombre'; v.add(s);
  }

  // phares : projecteur, cônes, halos ; feux arrière
  const PH = [[.58, .56, 1.86], [-.58, .56, 1.86]], FR = [[.63, .56, -1.74], [-.63, .56, -1.74]];
  const spot = new T.SpotLight(0xffe6a8, 0, 90, .42, .65, 1.6); spot.position.set(0, .6, 1.9); spot.target.position.set(0, 0, 26); v.add(spot, spot.target);
  const rouge = new T.PointLight(0xff2a14, 0, 9, 2); rouge.position.set(0, .55, -2.1); v.add(rouge);
  const mc = matCone(k), gc = une('cone', () => cone(k));
  for (const p of PH) { const c = new T.Mesh(gc, mc); c.position.set(...p); c.frustumCulled = false; c.name = 'faisceau'; v.add(c); }
  const halos = [], tmp = new T.Vector3(), tmp2 = new T.Vector3(), fw = new T.Vector3();
  const halo = (p, col, taille, sens, base) => {
    const m = new T.SpriteMaterial({ map: texRond(k), color: new T.Color(col).multiplyScalar(3), blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    const s = new T.Sprite(m); s.position.set(p[0], p[1], p[2] + sens * .15); s.scale.setScalar(taille); s.name = 'halo'; v.add(s); halos.push(s);
    s.onBeforeRender = (r, sc, cam) => {   // visible seulement du côté où la lampe éclaire
      s.getWorldPosition(tmp); fw.set(0, 0, sens).transformDirection(v.matrixWorld);
      const d = tmp2.copy(cam.position).sub(tmp).normalize().dot(fw); m.opacity = s.userData.force * base * Math.pow(k.clamp((d + .15) / 1.15), 1.5);
    };
  };
  PH.forEach(p => halo(p, 0xffe6a8, .95, 1, 1)); FR.forEach(p => halo(p, 0xff2010, .55, -1, .8));
  const refl = refletsSol(k, [...PH.map(p => ({ p, couleur: PHARE, force: 2.2, dir: [0, 0, 1] })), ...FR.map(p => ({ p, couleur: [1, .1, .05], force: 1.4, dir: [0, 0, -1] }))]);
  v.add(refl);
  const mq = new T.Object3D(); mq.position.set(0, .6, 1.9); mq.userData.sourcePluie = { force: 1, cos: Math.cos(.5), portee: 40, couleur: PHARE }; v.add(mq);

  // gerbes d'eau
  const eau = gerbes(k, 700, nom.length * 7 + nom.charCodeAt(nom.length - 1)); v.add(eau);

  const regler = f => {
    spot.intensity = 500 * f; rouge.intensity = 3 * f; mc.uniforms.uForce.value = f; refl.material.uniforms.uForce.value = f;
    halos.forEach(s => (s.userData.force = f, s.visible = f > 0)); mq.userData.sourcePluie.force = f; eau.material.uniforms.uRouge.value = f;
  };
  regler(o.phares ?? 1);
  v.userData.maj = (t, { vitesse = 0, distance = null, phares = null } = {}) => {
    const d = distance ?? vitesse * t;
    roues.forEach((r, i) => (r.rotation.x = r0[i] - d / Math.max(.2, r.position.y)));
    const u = eau.material.uniforms; u.uT.value = t; u.uV.value = Math.abs(vitesse); u.uI.value = (o.gerbes ?? 1) * k.clamp(Math.abs(vitesse) / 35);
    regler(phares ?? o.phares ?? 1);
  };
  v.userData.maj(0);
  return v;
}

export const gt40_1 = (k, o) => gt40(k, '/assets/models/gt40_1.glb', 'gt40_1', o);
export const gt40_2 = (k, o) => gt40(k, '/assets/models/gt40_2.glb', 'gt40_2', o);
export const gt40_5 = (k, o) => gt40(k, '/assets/models/gt40_5.glb', 'gt40_5', o);

// ───────────────────────── la piste de nuit ─────────────────────────
function texAsphalte(k) {
  return une('asphalte', () => {
    const T = k.THREE, h = k.hash, W = 256, H = 2048;   // 14 m × 112 m
    const cc = document.createElement('canvas'), rc = document.createElement('canvas'); cc.width = rc.width = W; cc.height = rc.height = H;
    const c = cc.getContext('2d'), r = rc.getContext('2d');
    c.fillStyle = '#1a1b1e'; c.fillRect(0, 0, W, H); r.fillStyle = 'rgb(0,92,0)'; r.fillRect(0, 0, W, H);
    for (let i = 0; i < 14000; i++) { const x = h(i, 3) * W, y = h(i, 4) * H, v = h(i, 5);   // grain
      c.fillStyle = `rgba(${v > .5 ? '60,62,66' : '6,6,7'},${.25 + .3 * h(i, 6)})`; c.fillRect(x, y, 1.5, 1.5);
      r.fillStyle = `rgba(0,${v > .5 ? 140 : 40},0,.35)`; r.fillRect(x, y, 1.5, 1.5); }
    for (const x0 of [.3, .7]) {   // traces des roues : plus lisses
      const gx = x0 * W, gr = r.createLinearGradient(gx - 30, 0, gx + 30, 0); gr.addColorStop(0, 'rgba(0,40,0,0)'); gr.addColorStop(.5, 'rgba(0,40,0,.6)'); gr.addColorStop(1, 'rgba(0,40,0,0)');
      r.fillStyle = gr; r.fillRect(gx - 30, 0, 60, H); }
    for (let i = 0; i < 70; i++) {   // flaques : presque des miroirs, plus noires
      const x = h(i, 7) * W, y = h(i, 8) * H, rx = 8 + 30 * h(i, 9), ry = rx * (1.5 + 3 * h(i, 10));
      for (const dy of [-H, 0, H]) for (const [ctx, col] of [[c, '8,9,10'], [r, '0,8,0']]) {
        ctx.save(); ctx.translate(x, y + dy); ctx.scale(1, ry / rx); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(.7, `rgba(${col},.7)`); gr.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore(); }
    }
    const tc = new T.CanvasTexture(cc), tr = new T.CanvasTexture(rc); tc.colorSpace = T.SRGBColorSpace;
    for (const t of [tc, tr]) { t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; }
    return { tc, tr };
  });
}

export function piste_nuit(k, o = {}) {
  const T = k.THREE, h = k.hash, L = o.longueur ?? 900, env = envNuit(k), G = new T.Group(); G.name = 'piste_nuit';
  const D = new T.Object3D(), FR = new T.Color(FROID);
  const inst = (geo, mat, list) => {   // list : [x, y, z, [sx, sy, sz]?, ry?, couleur?]
    const m = new T.InstancedMesh(geo, mat, list.length);
    list.forEach((e, i) => { D.position.set(e[0], e[1], e[2]); D.rotation.set(0, e[4] || 0, 0); D.scale.set(...(e[3] || [1, 1, 1])); D.updateMatrix(); m.setMatrixAt(i, D.matrix); if (e[5]) m.setColorAt(i, e[5]); });
    m.frustumCulled = false; G.add(m); return m;
  };
  const boite = (sx, sy, sz, mat, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z); m.receiveShadow = true; G.add(m); return m; };
  const plan = (sx, sz, mat, x, y, z) => { const m = new T.Mesh(new T.PlaneGeometry(sx, sz).rotateX(-Math.PI / 2), mat); m.position.set(x, y, z); m.receiveShadow = true; G.add(m); return m; };

  // ciel (dôme) : #07090C en haut → #121821 → lueur du circuit à l'horizon
  const ciel = new T.Mesh(new T.SphereGeometry(2600, 32, 16), new T.ShaderMaterial({
    vertexShader: LOGV + `varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      #include <logdepthbuf_vertex>
    }`,
    fragmentShader: LOGF + `varying vec3 vD; void main() {
      #include <logdepthbuf_fragment>
      float y = normalize(vD).y; vec3 haut = vec3(.0021, .0027, .0037) * 1.3, mil = vec3(.006, .0091, .0152), hor = vec3(.017, .023, .034);
      vec3 c = mix(mil, haut, smoothstep(.05, .55, y)); c = mix(hor, c, smoothstep(-.02, .14, y)); gl_FragColor = vec4(c, 1.); }`,
    side: T.BackSide, depthWrite: false, fog: false,
  }));
  ciel.renderOrder = -10; ciel.frustumCulled = false; ciel.name = 'ciel'; G.add(ciel);

  // sols
  plan(3000, 3000, new T.MeshStandardMaterial({ color: 0x07090b, roughness: .85, envMap: env, envMapIntensity: .4 }), 0, -.04, 0);
  const { tc, tr } = texAsphalte(k), rep = (w, l) => { const a = tc.clone(), b = tr.clone(); a.repeat.set(w / 14, l / 112); b.repeat.set(w / 14, l / 112); a.needsUpdate = b.needsUpdate = true; return [a, b]; };
  const asph = (w, l) => { const [a, b] = rep(w, l); return new T.MeshStandardMaterial({ map: a, roughnessMap: b, roughness: 1, metalness: 0, envMap: env, envMapIntensity: 1.4 }); };
  plan(14.6, L, asph(14.6, L), 0, 0, 0);                       // piste x −7,3 → +7,3
  plan(13.3, 360, asph(13.3, 360), -14.6, 0, 0);               // voie des stands x −21,25 → −7,95
  for (const zz of [-1, 1]) plan(5, (L - 360) / 2, asph(5, (L - 360) / 2), -10.4, 0, zz * (360 + (L - 360) / 2) / 2);

  // lignes blanches de bord de piste
  const blanc = new T.MeshStandardMaterial({ color: 0xd9dee4, roughness: .35, emissive: 0xffffff, emissiveIntensity: .03, envMap: env, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  for (const x of [-6.75, 6.75]) plan(.2, L, blanc, x, .004, 0);
  plan(.15, 340, blanc, -17.3, .004, 0);   // bord de la voie des stands

  // muret des stands
  const beton = new T.MeshStandardMaterial({ color: 0x8f959c, roughness: .8, envMap: env, envMapIntensity: .6 });
  boite(.35, 1.05, L, beton, -7.78, .525, 0).castShadow = true;
  boite(.36, .12, L, new T.MeshStandardMaterial({ color: 0xe8ecf0, roughness: .5, envMap: env }), -7.78, 1.0, 0);

  // rail côté tribunes
  const acier = new T.MeshStandardMaterial({ color: 0xaab2bb, metalness: .85, roughness: .32, envMap: env });
  for (const y of [.45, .75]) boite(.05, .28, L, acier, 9.6, y, 0);
  const poteaux = []; for (let z = -L / 2; z <= L / 2; z += 4) poteaux.push([9.7, .45, z]);
  inst(new T.BoxGeometry(.1, .9, .1), acier, poteaux);

  // stands : garages éclairés blanc froid, étage, toit
  const facade = new T.MeshStandardMaterial({ color: 0x3a4048, roughness: .75, envMap: env, envMapIntensity: .5 });
  const lum = new T.MeshBasicMaterial({ color: 0xffffff }), pil = [], fonds = [], flaques = [], fen = [];
  for (let i = 0, z = -170; z < 170; z += 5, i++) {
    pil.push([-19.1, 1.65, z]);
    fonds.push([-21.15, 1.6, z + 2.5, [1, 1, 1], Math.PI / 2, FR.clone().multiplyScalar(h(i, 21) < .12 ? .25 : 1.3 + 1.6 * h(i, 22))]);
    flaques.push([-15.2, .02, z + 2.5, [1, 1, 1], 0, FR.clone().multiplyScalar(.16 + .1 * h(i, 23))]);
    for (const dz of [1.25, 3.75]) fen.push([-17.16, 5.2, z + dz, [1, 1, 1], Math.PI / 2, FR.clone().multiplyScalar(h(i * 2 + dz, 24) < .3 ? .05 : .5 + .9 * h(i * 2 + dz, 25))]);
  }
  pil.push([-19.1, 1.65, 170]);
  inst(new T.BoxGeometry(4.2, 3.3, .35), facade, pil);
  inst(new T.PlaneGeometry(4.6, 3), lum, fonds);
  inst(new T.PlaneGeometry(2.1, 1.1), lum, fen);
  boite(4.6, .4, 342, facade, -19.3, 3.5, 0);
  boite(5, 3, 342, facade, -19.7, 5.2, 0);
  boite(5.6, .3, 342, beton, -19.9, 6.85, 0);
  boite(8, 7, 342, facade, -25.6, 3.5, 0);
  boite(.08, .1, 342, new T.MeshBasicMaterial({ color: FR.clone().multiplyScalar(4) }), -17.1, 3.28, 0);   // rampe lumineuse sous l'auvent
  const sol = c => new T.MeshBasicMaterial({ map: texRond(k), color: c, transparent: true, depthWrite: false, blending: T.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  inst(new T.PlaneGeometry(7, 9).rotateX(-Math.PI / 2), sol(0xffffff), flaques);

  // tribunes illuminées (gradins, toit, rampes de lumière, public)
  const gradin = new T.MeshStandardMaterial({ color: 0x2b3038, roughness: .8, envMap: env, envMapIntensity: .5 });
  const gens = [], tribune = (x0, z0, z1, rangs, sens, gr) => {
    const lt = z1 - z0, zc = (z0 + z1) / 2, prof = rangs * .85;
    for (let r = 0; r < rangs; r++) {
      boite(.85, 1.2 + r * .5, lt, gradin, x0 + sens * (r + .5) * .85, (1.2 + r * .5) / 2, zc);
      for (let z = z0 + .4, j = 0; z < z1 - .3; z += .62, j++) {
        const a = h(r * 9973 + j, gr); if (a < .28) continue;
        const b = h(r * 9973 + j, gr + 1), col = b > .9 ? new T.Color().setHSL(h(j, gr + 2), .35, .28) : new T.Color().setHSL(.6, .08, .06 + .1 * b);
        gens.push([x0 + sens * (r + .5) * .85, 1.2 + r * .5 + .37, z, [1, .8 + .4 * h(j, gr + 3), 1], 0, col.multiplyScalar(1 + .6 * (1 - r / rangs))]);
      }
    }
    const ht = 1.2 + rangs * .5 + 3.6, xr = x0 + sens * prof / 2;
    boite(prof + 2.5, .35, lt, facade, xr, ht, zc);
    boite(.5, ht, lt, gradin, x0 + sens * (prof + .25), ht / 2, zc);
    const piliers = []; for (let z = z0; z <= z1; z += 12) piliers.push([x0 + sens * (prof - .3), ht / 2, z]);
    inst(new T.BoxGeometry(.3, ht, .3), facade, piliers);
    for (const f of [.15, .55]) boite(.25, .1, lt, new T.MeshBasicMaterial({ color: FR.clone().multiplyScalar(5) }), x0 + sens * prof * f, ht - .25, zc);
    const lampes = []; for (let z = z0 + 4; z < z1; z += 8) lampes.push([x0 + sens * prof * .35, ht - .3, z]);
    inst(new T.PlaneGeometry(prof * 1.2, 7).rotateX(Math.PI / 2), sol(0xffffff), lampes.map(p => [p[0], p[1] - .02, p[2], [1, 1, 1], 0, FR.clone().multiplyScalar(.3)]));
  };
  tribune(13.5, -190, 110, 16, 1, 31);
  tribune(14.5, 125, 255, 12, 1, 37);
  tribune(15, Math.min(L / 2 - 120, 300), Math.min(L / 2 + 20, 440), 10, 1, 41);
  tribune(-30, Math.max(-L / 2 - 20, -440), Math.max(-L / 2 + 120, -300), 12, -1, 43);
  inst(new T.BoxGeometry(.44, .74, .36), new T.MeshBasicMaterial({ color: 0xffffff }), gens);

  // lampadaires (11 m, tous les 35 m, des deux côtés) : mâts, têtes blanc froid, halos, taches de lumière au sol, reflets
  const tetes = [], mats = [], bras = [], halosP = [], taches = [];
  for (let z = -L / 2 + 10; z <= L / 2 - 5; z += 35) for (const [xm, xt, dz] of [[11.6, 9.9, 0], [-8.3, -6.5, 17.5]]) {
    const zz = z + dz; if (zz > L / 2) continue;
    mats.push([xm, 5.5, zz]); bras.push([(xm + xt) / 2, 11, zz, [Math.abs(xm - xt) + .3, 1, 1]]); tetes.push([xt, 10.9, zz]);
    halosP.push(xt, 10.7, zz); taches.push([xt + (xt > 0 ? -2 : 2), .02, zz, [1, 1, 1], 0, FR.clone().multiplyScalar(.22)]);
  }
  const fer = new T.MeshStandardMaterial({ color: 0x4a5058, metalness: .6, roughness: .5, envMap: env });
  inst(new T.CylinderGeometry(.1, .15, 11, 8), fer, mats);
  inst(new T.BoxGeometry(1, .12, .12), fer, bras);
  inst(new T.BoxGeometry(1, .22, .45), new T.MeshBasicMaterial({ color: FR.clone().multiplyScalar(8) }), tetes);
  inst(new T.PlaneGeometry(17, 17).rotateX(-Math.PI / 2), sol(0xffffff), taches);
  const hg = new T.BufferGeometry(); hg.setAttribute('position', new T.Float32BufferAttribute(halosP, 3));
  const hp = new T.Points(hg, new T.PointsMaterial({ map: texRond(k), color: FR.clone().multiplyScalar(1.3), size: 4, sizeAttenuation: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
  hp.frustumCulled = false; G.add(hp);
  G.add(refletsSol(k, tetes.map(p => ({ p: [p[0], p[1], p[2]], couleur: [.85, .92, 1], force: 1.1 })), { larg: .55, long: .8 }));
  const sourcesPluie = new T.Object3D(); sourcesPluie.userData.sourcesPluie = tetes.map(p => ({ p: [p[0], p[1] - .3, p[2]], portee: 15, force: .8, couleur: [.85, .92, 1] })); G.add(sourcesPluie);

  // lumières lointaines (ville, parkings, autres tribunes) : profondeur au téléobjectif
  const lp = [], lc = [];
  for (let i = 0; i < 1800; i++) {
    const a = h(i, 51) * Math.PI * 2, r = 280 + 1200 * h(i, 52) ** .7, y = h(i, 53) < .1 ? 15 + 30 * h(i, 54) : 1 + 8 * h(i, 54), f = .4 + 1.6 * h(i, 55) ** 3;
    lp.push(Math.cos(a) * r, y, Math.sin(a) * r);
    const c = h(i, 56) < .45 ? [1, .78, .5] : [.8, .9, 1]; lc.push(c[0] * f, c[1] * f, c[2] * f);
  }
  const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(lp, 3)); lg.setAttribute('color', new T.Float32BufferAttribute(lc, 3));
  const loin = new T.Points(lg, new T.PointsMaterial({ map: texRond(k), size: 2.4, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false }));
  loin.frustumCulled = false; G.add(loin);

  // lumière d'ensemble : ciel de nuit bleuté + éclairage froid des stands
  G.add(new T.HemisphereLight(0x2a3a52, 0x050608, .6));
  const dl = new T.DirectionalLight(0xcfdcff, .5); dl.position.set(-40, 60, 20); G.add(dl, dl.target);

  const brume = new T.FogExp2(0x0c1118, o.brume ?? .0042);
  G.userData.ambiance = scene => { scene.fog = brume; };
  return G;
}

// ───────────────────────── la pluie ─────────────────────────
export function pluie(k, o = {}) {
  const T = k.THREE, n = o.n ?? 7000, gr = o.graine ?? 11, NS = 12;
  const S = [], Q = [], I = [];
  for (let i = 0; i < n; i++) {
    const s = [k.hash(i * 4, gr), k.hash(i * 4 + 1, gr), k.hash(i * 4 + 2, gr), k.hash(i * 4 + 3, gr)];
    for (const [a, b] of [[0, -1], [0, 1], [1, -1], [1, 1]]) { S.push(...s); Q.push(a, b); }
    I.push(i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3);
  }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 12), 3)); geo.setIndex(I);
  geo.setAttribute('graine', new T.Float32BufferAttribute(S, 4)); geo.setAttribute('coin', new T.Float32BufferAttribute(Q, 2));
  const u = {
    uT: { value: 0 }, uVit: { value: 9.5 }, uLong: { value: .7 }, uBase: { value: .22 }, uForce: { value: o.force ?? 1 },
    uCentre: { value: new T.Vector3() }, uTaille: { value: new T.Vector3(...(o.taille || [30, 22, 60])) }, uVent: { value: new T.Vector3(-.8, 0, 0) }, uRes: { value: new T.Vector2(1080, 1920) },
    uSrc: { value: Array.from({ length: NS }, () => new T.Vector4()) }, uDir: { value: Array.from({ length: NS }, () => new T.Vector4()) },
    uCol: { value: Array.from({ length: NS }, () => new T.Vector3()) }, uN: { value: 0 },
  };
  const mat = new T.ShaderMaterial({
    uniforms: u,
    vertexShader: LOGV + `attribute vec4 graine; attribute vec2 coin;
      uniform float uT, uVit, uLong, uBase, uForce; uniform vec3 uCentre, uTaille, uVent; uniform vec2 uRes;
      uniform vec4 uSrc[${NS}]; uniform vec4 uDir[${NS}]; uniform vec3 uCol[${NS}]; uniform int uN;
      varying vec2 vCoin; varying vec3 vC;
      void main() {
        vec3 S = uTaille; float vit = uVit * (.85 + .3 * graine.w);
        vec3 p0 = graine.xyz * S + uVent * uT - vec3(0., vit * uT, 0.);
        vec3 p = uCentre + mod(p0 - uCentre + .5 * S, S) - .5 * S;   // goutte fixe dans le monde, recyclée autour de la caméra
        vec4 c0 = projectionMatrix * viewMatrix * vec4(p, 1.), c1 = projectionMatrix * viewMatrix * vec4(p + vec3(0., uLong, 0.), 1.);
        vCoin = coin; vC = vec3(0.);
        if (c0.w < .3 || c1.w < .3) { gl_Position = vec4(0., 0., 2., 1.); }
        else {
          vec2 s0 = c0.xy / c0.w * .5 * uRes, s1 = c1.xy / c1.w * .5 * uRes; float sc = uRes.y / 1920.;
          float L = clamp(length(s1 - s0), 20. * sc, 60. * sc);
          vec2 dir = vec2(.139, .990), nn = vec2(-dir.y, dir.x);   // penchée de 8° : elle tombe vers la gauche
          vec2 s = s0 + dir * L * coin.x + nn * coin.y * .9 * sc;
          gl_Position = vec4(s / (.5 * uRes) * c0.w, c0.z, c0.w);
          vec3 li = vec3(.62, .7, .82) * uBase;
          for (int i = 0; i < ${NS}; i++) { if (i >= uN) break;
            vec3 v = p - uSrc[i].xyz; float d = length(v), f = max(0., 1. - d / uSrc[i].w); f *= f;
            if (uDir[i].w > 0.) f *= smoothstep(uDir[i].w, mix(uDir[i].w, 1., .5), dot(v / max(d, 1e-3), uDir[i].xyz)) * 2.4; else f *= .7;
            li += uCol[i] * f; }
          vC = li * smoothstep(.8, 2.5, c0.w) * exp(-c0.w / 90.) * uForce;
        }
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: LOGF + `varying vec2 vCoin; varying vec3 vC;
      void main() {
        #include <logdepthbuf_fragment>
        float a = (1. - vCoin.y * vCoin.y) * smoothstep(0., .25, vCoin.x) * (1. - smoothstep(.6, 1., vCoin.x));
        gl_FragColor = vec4(vC * a, 1.);
      }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false,
  });
  const m = new T.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 5; m.name = 'pluie';
  const cd = new T.Vector3(), cp = new T.Vector3(), bas = new T.Vector3();
  m.onBeforeRender = (r, scene, cam) => {
    const rt = r.getRenderTarget(); rt ? u.uRes.value.set(rt.width, rt.height) : r.getDrawingBufferSize(u.uRes.value);
    cam.getWorldPosition(cp); u.uCentre.value.copy(cam.getWorldDirection(cd)).multiplyScalar(o.devant ?? 26).add(cp);
    const c = [];   // phares (projecteurs) et lampadaires visibles
    scene.traverseVisible(ob => {
      const s = ob.userData.sourcePluie, l = ob.userData.sourcesPluie;
      if (s && s.force > 0) c.push({ p: ob.getWorldPosition(new T.Vector3()), d: bas.set(0, -.07, 1).normalize().transformDirection(ob.matrixWorld).clone(), cos: s.cos, portee: s.portee, col: s.couleur, f: s.force });
      if (l) for (const e of l) if (e.force > 0) c.push({ p: new T.Vector3(...e.p).applyMatrix4(ob.matrixWorld), d: null, portee: e.portee, col: e.couleur, f: e.force });
    });
    const ce = u.uCentre.value; c.sort((a, b) => (!!b.d - !!a.d) || a.p.distanceTo(ce) - b.p.distanceTo(ce));
    const N = Math.min(NS, c.length); u.uN.value = N;
    for (let i = 0; i < N; i++) { const e = c[i];
      u.uSrc.value[i].set(e.p.x, e.p.y, e.p.z, e.portee); u.uDir.value[i].set(...(e.d ? [e.d.x, e.d.y, e.d.z, e.cos] : [0, 0, 0, 0])); u.uCol.value[i].set(e.col[0] * e.f, e.col[1] * e.f, e.col[2] * e.f); }
  };
  m.userData.maj = t => { u.uT.value = t; };
  return m;
}
