// test-check.mjs : chaque contrôle de check.mjs doit attraper un défaut planté exprès. Un contrôle qui ne sonne jamais ne prouve rien.
// node outils/test-check.mjs <copie du projet le-mans-66>   (sur 0-8,5 s ; ne modifie pas le projet : les défauts sont injectés dans la page)
import { check } from '../check.mjs';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const projet = resolve(process.argv[2]), tmp = join(import.meta.dirname, '..', 'out', 'test-check'); mkdirSync(tmp, { recursive: true });
const A = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'adaptateurs', 'le-mans-66.json'), 'utf8'));
// son : bruitages remontés de 20 dB ; mix baissé de 6 dB (≈ -20 LUFS)
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(projet, A.mix), '-af', 'volume=-6dB', join(tmp, 'mix_faible.wav')]);
writeFileSync(join(tmp, 'adaptateur.json'), JSON.stringify({ ...A, traj: false, boucle: false, gain_bruitages_db: A.gain_bruitages_db + 20, mix: join(tmp, 'mix_faible.wav') }));
// vidéo : 1 s de mire, 0,3 s de noir, 1 s de mire, puis 0,5 s figée
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=270x480:r=30:d=1', '-f', 'lavfi', '-i', 'color=black:s=270x480:r=30:d=0.3', '-f', 'lavfi', '-i', 'testsrc2=s=270x480:r=30:d=1',
  '-filter_complex', '[0][1][2]concat=n=3,tpad=stop_mode=clone:stop_duration=0.5', '-pix_fmt', 'yuv420p', join(tmp, 'defauts.mp4')]);

const seed = `
window.__qaSeed3d = (T, scene, camera) => { const C = DBG.W.CAR;
  if (T >= 1 && T < 1.2) C.n1.grp.position.y -= .3;                                     // voiture 30 cm sous le sol
  if (T >= 1.5 && T < 1.7) C.n2.grp.position.copy(C.n1.grp.position);                   // deux voitures l'une dans l'autre
  if (T >= 2 && T < 2.2) camera.position.copy(C.n5.grp.position).add(new camera.position.constructor(0, .7, 0));   // caméra dans la n°5
  if (Math.abs(T - 2.5) < 1e-6) camera.position.x += .12;                               // à-coup d'une image
};
window.__qaSeed2d = (T, g) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fff'; g.font = '700 60px sans-serif';
  if (T >= .3 && T < .5) g.fillText('BAS', 400, 1800);                                  // sous la légende TikTok
  if (T >= .6 && T < .8) g.fillText('DROITE', 960, 1200);                               // sous les boutons
  if (T >= .9 && T < 1) { g.font = '18px sans-serif'; g.fillText('minuscule', 400, 900); }
  if (T >= 3.6 && T < 3.7) { g.fillText('AAAAA', 300, 1000); g.fillText('BBBBB', 330, 1008); }   // deux textes l'un sur l'autre
  if (T >= 4 && T < 4.1) { const b = Object.values(window.__qa.cam?.sujets || {}).map(x => x.box).filter(Boolean).map(b => [Math.max(b[0], 40), Math.max(b[1], 0), Math.min(b[2], 1040), Math.min(b[3], 1920)]).filter(b => b[2] > b[0] + 100 && b[3] > b[1] + 100).sort((a, c) => (c[2] - c[0]) * (c[3] - c[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0]; if (b) { const px = Math.min(180, (b[3] - b[1]) / 2.5); g.font = '700 ' + px + 'px sans-serif'; g.textBaseline = 'middle';   // sous-titre mot par mot sur la voiture la plus visible
    for (const [k, l] of [['un', 'sous', 'titre'], ['sur', 'la', 'voiture']].entries()) { let x = b[0]; for (const w of l) { g.fillText(w, x, (b[1] + b[3]) / 2 + (k - .5) * px * 1.1); x += g.measureText(w).width + px / 4; } } } }
  if (T >= 6 && T < 6.1) { g.font = '700 60px Arial'; g.fillText('KANJI 漢', 300, 1000); }                  // lettre absente de la police (Arial n'a pas les idéogrammes)
  if (T >= 6.3 && T < 6.5) { g.fillStyle = '#fff'; g.fillRect(200, 800, 680, 320); g.fillStyle = '#ddd'; g.font = '700 80px Arial'; g.fillText('GRIS', 420, 990); }   // gris clair sur blanc
  if (T >= 3 && T < 3.1) { g.fillStyle = '#000'; g.fillRect(0, 0, 1080, 1920); window.__qa.texts.length = 0; }   // image noire (sans texte : sinon c'est un carton)
  g.restore(); };
window.__qaSeedT = T => Math.abs(T - 3.5) < 1e-6 ? 3.5 - 1 / 30          // image doublée
  : Math.abs(T - 4.5) < 1e-6 ? 20                                           // pic d'une image
  : T >= 4.972 && T < 5.5 ? T + 10                                          // coupe à 4,972 s, hors de la grille des images
  : T >= 6.8 && T < 8.4 ? 6.8 : T;                                          // 1,6 s où rien ne bouge
`;
const r = await check({ projet, adaptateur: join(tmp, 'adaptateur.json'), from: 0, to: 8.5, workers: 2, video: join(tmp, 'defauts.mp4'), out: tmp, seed, quiet: true });
const attendus = [['sous le sol', 1], ['traversée', 1.5], ['caméra dans un objet', 2], ['à-coup', 2.5], ['zone sûre', .3], ['zone sûre', .6], ['texte petit', .9], ['image noire', 3],
  ['image doublée', 3.5], ['textes superposés', 3.6], ['sujet sous un texte', 4], ["pic d'une image", 4.5], ['coupe hors grille', 4.967], ['mot couvert', null], ['sonie', null], ['vidéo : noir', 1], ['vidéo : gel', null],
  ['lettre absente', 6], ['contraste faible', 6.3], ['passage mort', 7.5], ['vidéo : durée', null]];
let ko = 0;
for (const [c, t] of attendus) {
  const ok = r.entrees.some(e => e.controle === c && (t == null || (e.t <= t + .05 && e.t1 >= t - .05)));
  if (!ok) ko++; console.log(`${ok ? '✓' : '✗'} ${c}${t != null ? ' à ' + t + ' s' : ''}`);
}
console.log(ko ? `✗ ${ko} contrôle(s) n'ont pas vu leur défaut` : `✓ les ${attendus.length} défauts plantés sont tous vus`);
process.exit(ko ? 1 : 0);
