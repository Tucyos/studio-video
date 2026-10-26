// post.js : post-traitement (bloom, étalonnage ACES, aberration, vignettage, grain), repris tel quel du Mans 66 (tiktok-motion). Le grain ne dépend que de frame.
// Chaîne : scène -> cible HDR (MSAA 4x, demi-flottants) -> bloom (seuil doux + pyramide 13 taps / tente) -> étalonnage + ACES (celui du renderer) +
//          aberration chromatique + vignettage + grain fin.  Tout est une fonction pure des options (le grain ne dépend que de `frame`, jamais de Math.random).
// Usage : const post = makePost(renderer); post.render(scene, camera, { ...LOOKS.night, frame }) ; post.raw = le renderer.render d'origine.
//  - over:true  = calque transparent (2e passe de drawFocus) : pas de bloom, vignettage/grain pondérés par l'alpha, alpha conservé.
import * as THREE from '/node_modules/three/build/three.module.js';
const T = THREE;

export const LOOKS = {
  // nuit sous projecteurs : noirs profonds teintés bleu, projecteurs froids, feu qui reste chaud (masque de teinte), léger voile de bloom
  night: { bloom: .16, thr: 1.0, knee: .7, scatter: .72, ca: .0016, vig: .42, grain: .045, sat: 1.04, contrast: 1.07, wb: [.94, .985, 1.07], shadow: [.004, .0085, .019], fire: 1, roll: 2.4, hot: 1.35, exp: .8 },
  // jour (Mugello) : neutre, bloom discret
  day: { bloom: .05, thr: 1.1, knee: .6, scatter: .6, ca: .0011, vig: .24, grain: .024, sat: 1.02, contrast: 1.03, wb: [1, 1, 1], shadow: [.003, .004, .006], fire: 0, roll: 0, hot: 1, exp: 1 },
};

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
// descente 13 taps (Jimenez / CoD) ; au 1er niveau : seuil doux + moyenne de Karis (pas de lucioles)
const FS_DOWN = `uniform sampler2D t; uniform vec2 px; uniform float first, thr, knee; varying vec2 vUv;
  vec3 pre(vec3 c){ if(first < .5) return c; float br = max(max(c.r, c.g), c.b); float s = clamp(br - thr + knee, 0., 2. * knee); s = s * s / (4. * knee + 1e-4);
    return c * (max(s, br - thr) / max(br, 1e-4)); }
  vec3 S(vec2 o){ return pre(texture2D(t, vUv + o * px).rgb); }
  float kw(vec3 c){ return first > .5 ? 1. / (1. + dot(c, vec3(.2126, .7152, .0722))) : 1.; }
  void main(){
    vec3 a=S(vec2(-2,2)), b=S(vec2(0,2)), c=S(vec2(2,2)), d=S(vec2(-2,0)), e=S(vec2(0,0)), f=S(vec2(2,0)), g=S(vec2(-2,-2)), h=S(vec2(0,-2)), i=S(vec2(2,-2));
    vec3 j=S(vec2(-1,1)), k=S(vec2(1,1)), l=S(vec2(-1,-1)), m=S(vec2(1,-1));
    vec3 g0 = (j+k+l+m)*.25, g1 = (a+b+d+e)*.25, g2 = (b+c+e+f)*.25, g3 = (d+e+g+h)*.25, g4 = (e+f+h+i)*.25;
    float w0 = kw(g0), w1 = kw(g1), w2 = kw(g2), w3 = kw(g3), w4 = kw(g4);
    gl_FragColor = vec4((g0*w0*.5 + (g1*w1 + g2*w2 + g3*w3 + g4*w4) * .125) / (w0*.5 + (w1+w2+w3+w4)*.125), 1.); }`;
// remontée : tente 3x3 du niveau inférieur + niveau courant
const FS_UP = `uniform sampler2D t, lo; uniform vec2 px; uniform float scatter; varying vec2 vUv;
  void main(){ vec3 s = texture2D(lo, vUv + vec2(-1,1) * px).rgb + 2. * texture2D(lo, vUv + vec2(0,1) * px).rgb + texture2D(lo, vUv + vec2(1,1) * px).rgb
      + 2. * texture2D(lo, vUv + vec2(-1,0) * px).rgb + 4. * texture2D(lo, vUv).rgb + 2. * texture2D(lo, vUv + vec2(1,0) * px).rgb
      + texture2D(lo, vUv + vec2(-1,-1) * px).rgb + 2. * texture2D(lo, vUv + vec2(0,-1) * px).rgb + texture2D(lo, vUv + vec2(1,-1) * px).rgb;
    gl_FragColor = vec4(texture2D(t, vUv).rgb + s / 16. * scatter, 1.); }`;
// composition finale : le ShaderMaterial garde le tone mapping (ACES) et l'encodage sRGB du renderer -> même exposition que le rendu direct
const FS_OUT = `uniform sampler2D tScene, tBloom; uniform vec2 res; uniform float ss, frame, bloom, ca, vig, grain, sat, contrast, over, fire, roll, hot, exp; uniform vec3 wb, shadow; varying vec2 vUv;
  float hash13(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
  void main(){
    vec2 d = vUv - .5, off = d * dot(d, d) * 4. * ca;
    vec4 s0 = texture2D(tScene, vUv);
    vec3 c = vec3(texture2D(tScene, vUv + off).r, s0.g, texture2D(tScene, vUv - off).b);
    float a = over > .5 ? clamp(s0.a, 0., 1.) : 1.;                             // radar : le ciel HDR arrive avec alpha 0 dans la cible ; opaque hors calque
    if (a < .999) c /= max(a, 1e-3);                                         // calque transparent : on dépremultiplie avant l'étalonnage
    c += texture2D(tBloom, vUv).rgb * bloom * (1. - over);
    c *= exp;
    float q = (c.r - c.b) / (c.r + c.b + .02), warm = fire * smoothstep(.25, .6, q);   // le feu garde sa teinte chaude
    c *= mix(wb, vec3(1.), warm);
    c /= 1. + warm * roll * max(max(c.r, max(c.g, c.b)) - .8, 0.);               // le feu garde sa teinte : on écrase les pointes avant ACES (sinon il vire au blanc-jaune)
    float L = dot(c, vec3(.2126, .7152, .0722)); c = max(mix(vec3(L), c, sat * mix(1., hot, warm)), 0.);
    c = .18 * pow(c / .18, vec3(contrast));
    gl_FragColor = vec4(c, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    vec3 o = gl_FragColor.rgb;
    float l = dot(o, vec3(.2126, .7152, .0722));
    o += shadow * pow(1. - clamp(l * 2.2, 0., 1.), 3.);                       // noirs bleutés, jamais bouchés
    vec2 p = floor(gl_FragCoord.xy / ss);
    float n = hash13(vec3(p, mod(frame, 977.))) - .5, n2 = hash13(vec3(p + 311., mod(frame, 977.) + 5.)) - .5;
    o += (n + .3 * vec3(n2, -n2, n)) * grain * (.35 + 1.3 * l * (1. - l) * 2.);  // grain surtout dans les demi-teintes
    float r = length(d * vec2(1., res.y / res.x) * 1.1);                      // vignettage doux, plus fort aux coins
    o *= 1. - vig * smoothstep(.28, .98, r);
    gl_FragColor = vec4(o * a, a); }`;

export function makePost(renderer) {
  const raw = renderer.render.bind(renderer), tmp = new T.Vector2();
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); geo.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new T.Mesh(geo, null), qs = new T.Scene(); quad.frustumCulled = false; qs.add(quad);
  const mk = (fs, u, extra = {}) => new T.ShaderMaterial({ vertexShader: VS, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false, blending: T.NoBlending, ...extra });
  const mDown = mk(FS_DOWN, { t: { value: null }, px: { value: new T.Vector2() }, first: { value: 0 }, thr: { value: 1 }, knee: { value: .5 } });
  const mUp = mk(FS_UP, { t: { value: null }, lo: { value: null }, px: { value: new T.Vector2() }, scatter: { value: .7 } });
  const mOut = mk(FS_OUT, { tScene: { value: null }, tBloom: { value: null }, res: { value: new T.Vector2() }, ss: { value: 1 }, frame: { value: 0 }, bloom: { value: 0 }, ca: { value: 0 }, vig: { value: 0 }, grain: { value: 0 },
    sat: { value: 1 }, contrast: { value: 1 }, over: { value: 0 }, fire: { value: 1 }, roll: { value: 1 }, hot: { value: 1 }, exp: { value: 1 }, wb: { value: new T.Vector3(1, 1, 1) }, shadow: { value: new T.Vector3() } }, { toneMapped: true });
  const mkRT = (w, h, samples = 0) => new T.WebGLRenderTarget(w, h, { type: T.HalfFloatType, samples, depthBuffer: samples > 0, minFilter: T.LinearFilter, magFilter: T.LinearFilter });
  let W = 0, H = 0, scn = null, dn = [], up = [];
  function size() { renderer.getDrawingBufferSize(tmp); if (tmp.x === W && tmp.y === H) return; W = tmp.x; H = tmp.y; [scn, ...dn, ...up].forEach(r => r && r.dispose());
    scn = mkRT(W, H, 4); dn = []; up = []; for (let i = 1; i <= 5; i++) { const w = Math.max(2, W >> i), h = Math.max(2, H >> i); dn.push(mkRT(w, h)); up.push(mkRT(w, h)); } }
  function pass(m, target) { quad.material = m; renderer.setRenderTarget(target); raw(qs, cam); }
  function render(scene, camera, o = {}) {
    const L = { ...LOOKS.night, ...o }; size();
    const ac = renderer.autoClear; renderer.setRenderTarget(scn); raw(scene, camera); renderer.autoClear = false;
    const bl = L.bloom > 0 && !L.over;
    if (bl) {
      let src = scn.texture, sw = W, sh = H;
      dn.forEach((r, i) => { mDown.uniforms.t.value = src; mDown.uniforms.px.value.set(1 / sw, 1 / sh); mDown.uniforms.first.value = i === 0 ? 1 : 0; mDown.uniforms.thr.value = L.thr; mDown.uniforms.knee.value = L.knee;
        pass(mDown, r); src = r.texture; sw = r.width; sh = r.height; });
      mUp.uniforms.scatter.value = L.scatter;
      for (let i = 3; i >= 0; i--) { mUp.uniforms.t.value = dn[i].texture; mUp.uniforms.lo.value = i === 3 ? dn[4].texture : up[i + 1].texture; mUp.uniforms.px.value.set(1 / dn[i + 1].width, 1 / dn[i + 1].height); pass(mUp, up[i]); }
    }
    const u = mOut.uniforms; u.tScene.value = scn.texture; u.tBloom.value = bl ? up[0].texture : scn.texture; u.res.value.set(W, H); u.ss.value = renderer.getPixelRatio(); u.frame.value = L.frame || 0;
    u.bloom.value = bl ? L.bloom : 0; u.ca.value = L.ca; u.vig.value = L.vig; u.grain.value = L.grain; u.sat.value = L.sat; u.contrast.value = L.contrast; u.over.value = L.over ? 1 : 0; u.fire.value = L.fire; u.roll.value = L.roll; u.hot.value = L.hot; u.exp.value = L.exp;
    u.wb.value.set(...L.wb); u.shadow.value.set(...L.shadow);
    renderer.autoClear = ac; pass(mOut, null);
  }
  return { render, raw };
}
