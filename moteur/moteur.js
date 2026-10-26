// moteur.js : la page d'un projet du studio. Lit les plans de project.json, importe chaque scenes/sNN.js, appelle build(kit) une fois,
// puis seek(T) donne la main à la section active : update(T, t) (T = temps global de la voix, t = T - t0 de la section).
// Contrat de page (le même que tiktok-motion) : canvas#c, window.READY, window.SCENE {from, to, sub}, window.seek(T).
import * as K from './kit.js';
const { projet: PJ, W, H, scene } = K;

const c = document.getElementById('c'); c.width = W; c.height = H;
const g = c.getContext('2d');
const plans = (PJ.plans || []).map(p => ({ ...p, t0: K.grille(p.t0), t1: K.grille(p.t1) })).sort((a, b) => a.t0 - b.t0);
window.ERREURS = {};   // id de section -> message (une section cassée n'empêche pas les autres de se rendre)
const erreur = (p, e) => { const m = String(e?.stack || e).split('\n').slice(0, 3).join(' | '); if (window.ERREURS[p.id] !== m) console.error(`[${p.id}] ${m}`); window.ERREURS[p.id] = m; };

for (const p of plans) {
  p.groupe = new K.THREE.Group(); p.groupe.name = p.id; p.groupe.visible = false; scene.add(p.groupe);
  try {
    const mod = await import(`/${p.fichier}?v=${Date.now()}`);
    p.s = await mod.build({ ...K, g, groupe: p.groupe, t0: p.t0, t1: p.t1, id: p.id });
  } catch (e) { erreur(p, e); }
}

function carteErreur(p) {   // la section cassée s'affiche en rouge, sur sa plage seulement
  g.fillStyle = '#3a0505'; g.fillRect(0, 0, W, H);
  K.texte(g, `${p.id} : ERREUR`, W / 2, H / 2 - 60, { size: 64, w: 900, color: '#ff6b6b' });
  (window.ERREURS[p.id].slice(0, 220).match(/.{1,48}/g) || []).forEach((l, i) => K.texte(g, l, W / 2, H / 2 + 20 + i * 42, { size: 30, w: 500, f: K.F.mono, color: '#ffd0d0' }));
}

const DUR = PJ.duree || (plans.length ? plans[plans.length - 1].t1 : 1);
const sansSous = location.search.includes('nosub') || location.search.includes('cover') || PJ.sous_titres === false;
window.SCENE = { from: 0, to: DUR, sub: PJ.sub || 4 };
window.seek = async T => {
  g.reset(); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let k = -1; for (let i = 0; i < plans.length; i++) if (T >= plans[i].t0 - 1e-6) k = i;
  const p = plans[k];
  K.remise(); for (const q of plans) q.groupe.visible = q === p;
  if (p) {
    if (window.ERREURS[p.id] && !p.s) carteErreur(p);
    else try { g.save(); await p.s?.update?.(T, T - p.t0); g.restore(); } catch (e) { g.restore(); erreur(p, e); carteErreur(p); }
  }
  if (!sansSous) K.sousTitres(g, T);
  return true;
};
window.MOTEUR = { version: 3, plans: plans.map(({ id, t0, t1, fichier }) => ({ id, t0, t1, fichier })) };
window.READY = Promise.resolve(true);
