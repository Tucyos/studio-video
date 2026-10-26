// verif-pixels.mjs : l'image du studio est-elle la même que celle de l'ancien moteur ?
// node outils/verif-pixels.mjs <projet> <dossier temp> f1 f2 ... [--sub 4] [--shutter .5] [--fps 30] [--page scenes/film.html]
// Référence = le snap.mjs du projet (PNG sans perte = l'ancien code), sous-images moyennées par le tmix de ffmpeg (comme l'ancien render.mjs),
// prise DEUX fois : la carte graphique n'est pas parfaitement déterministe (quelques octets à ±1), l'écart ancien/ancien donne le bruit de fond.
// Studio = lib/player.mjs, le même chemin que render.mjs (moyenne dans la page), une page fraîche par image comme une tranche du rendu parallèle.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Writable } from 'node:stream';
import { serve, openPlayer } from '../lib/player.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv.splice(i, 2)[1] : d; };
const SUB = Number(opt('sub', 4)), SHUT = Number(opt('shutter', .5)), FPS = Number(opt('fps', 30)), page = opt('page', 'scenes/film.html');
const [proj, tmp, ...fs] = argv, root = resolve(proj), frames = fs.map(Number);
const T = (f, s) => f / FPS + s / SUB * SHUT / FPS;   // la même expression que l'ancien render.mjs

function diff(a, b) { let n = 0, mx = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d) { n++; if (d > mx) mx = d; } } return { n, mx, pct: n / a.length * 100 }; }
const fmt = d => d.n ? `${d.n} octets (${d.pct.toFixed(4)} %), écart max ${d.mx}` : 'identique';

function oldRef(dir) {
  mkdirSync(dir, { recursive: true });
  const times = frames.flatMap(f => Array.from({ length: SUB }, (_, s) => T(f, s))), names = frames.flatMap(f => Array.from({ length: SUB }, (_, s) => `f${f}_${s}`));
  execFileSync('node', ['snap.mjs', page, dir, ...times.map(String), '--names', names.join(',')], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
  return frames.map(f => {
    const ins = Array.from({ length: SUB }, (_, s) => ['-i', join(dir, `f${f}_${s}.png`)]).flat();
    const mix = SUB > 1 ? `${Array.from({ length: SUB }, (_, s) => `[${s}]`).join('')}concat=n=${SUB}:v=1,format=rgba,tmix=frames=${SUB},select='eq(n\\,${SUB - 1})'` : '[0]format=rgba';
    return execFileSync('ffmpeg', ['-v', 'error', ...ins, '-filter_complex', mix, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: 1e9 });
  });
}
const ref1 = oldRef(resolve(tmp, 'ancien1')), ref2 = oldRef(resolve(tmp, 'ancien2'));

const srv = serve(root), parts = []; srv.sinks.set('v', new Writable({ write(c, e, cb) { parts.push(c); cb(); } }));
let bad = 0;
for (const [i, f] of frames.entries()) {
  const p = await openPlayer(srv, page); parts.length = 0;
  await p.frames(Array.from({ length: SUB }, (_, s) => T(f, s)), 'v', SUB, f > 0 ? T(f - 1, SUB - 1) : null); await p.close();
  const st = Buffer.concat(parts), oo = diff(ref1[i], ref2[i]), so = diff(st, ref1[i]);
  // tolérance = le bruit du GPU, intermittent : ancien/ancien a donné jusqu'à 421 octets (0,005 %, ±32) sur le Mans 66.
  // Un vrai défaut se voit à des ordres de grandeur au-dessus (canvas passé en logiciel : 11 % des octets).
  if (so.pct > Math.max(.01, 3 * oo.pct)) bad++;
  console.log(`image ${f} (T=${(f / FPS).toFixed(3)})  ancien/ancien : ${fmt(oo)}  ·  studio/ancien : ${fmt(so)}`);
}
srv.close();
console.log(bad ? `✗ ${bad} image(s) au-delà du bruit du GPU` : '✓ studio = ancien moteur, au bruit du GPU près');
process.exit(bad ? 1 : 0);
