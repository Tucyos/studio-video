// render.mjs : export rapide d'un projet vidéo (pixels bruts -> ffmpeg, plusieurs Chromium en parallèle, puis concat).
// node render.mjs <projet> [page.html] [--from T] [--to T] [--sub N] [--shutter .5] [--fps 30] [--workers 2] [--preview]
//                 [--name x] [--out dossier] [--audio mix.wav] [--tel] [--iphone]
// node render.mjs <projet> [page.html] --cover [--at T]      -> <nom> - couverture.png (page ouverte avec ?cover)
// node render.mjs <projet> [page.html] --snap T1 T2 ...       -> PNG sans perte aux temps donnés
// Sorties dans studio-video/out/<nom>/ (jamais dans le projet).
import { spawn } from 'node:child_process';
import { mkdir, writeFile, stat, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, basename, join } from 'node:path';
import { serve, openPlayer } from './lib/player.mjs';

const argv = process.argv.slice(2);
const has = k => argv.includes('--' + k);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const num = (k, d) => { const v = opt(k); return v == null ? d : Number(v); };
const VAL = ['from', 'to', 'sub', 'shutter', 'fps', 'workers', 'name', 'out', 'audio', 'at'];   // options suivies d'une valeur
const isnap = has('snap') ? argv.indexOf('--snap') : Infinity;
const pos = argv.filter((a, i) => !a.startsWith('--') && !VAL.includes(argv[i - 1]?.slice(2)) && i < isnap);
const root = resolve(pos[0] || '.');
let pageUrl = pos[1] || (existsSync(join(root, 'moteur', 'page.html')) ? 'moteur/page.html' : 'scenes/film.html');
const preview = has('preview'), FPS = num('fps', 30), SHUT = num('shutter', .5);   // .5 = obturateur 180° (projets auto) ; Koan : --shutter 1
const name = opt('name', basename(root)) + (preview ? '_preview' : '');
const OUT = resolve(opt('out', join(import.meta.dirname, 'out', basename(root))));
await mkdir(OUT, { recursive: true });

const run = (cmd, args, input) => new Promise((ok, ko) => { const p = spawn(cmd, args, { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
  p.on('close', c => c === 0 ? ok() : ko(new Error(`${cmd} a échoué (${c})`))); if (input) p.stdin.end(input); });
const srv = serve(root);
const t0 = Date.now(), sec = t => ((Date.now() - t) / 1000).toFixed(1);

// ---------- images fixes ----------
if (has('cover') || has('snap')) {
  if (has('cover')) pageUrl += (pageUrl.includes('?') ? '&' : '?') + 'cover';
  const p = await openPlayer(srv, pageUrl); console.log(`page prête en ${p.info.load}s (${p.info.gpu})`);
  if (has('cover')) { const f = join(OUT, `${name} - couverture.png`); await writeFile(f, await p.png(num('at', 0))); console.log('✓', f); }
  else for (const T of argv.slice(isnap + 1).filter((a, i, l) => !a.startsWith('--') && !VAL.includes(l[i - 1]?.slice(2))).map(Number)) { const f = join(OUT, `t${T.toFixed(3)}.png`); await writeFile(f, await p.png(T)); console.log('✓', f); }
  await p.close(); srv.close(); process.exit(0);
}

// ---------- vidéo ----------
const NW = Math.max(1, num('workers', 2));
const players = await Promise.all(Array.from({ length: NW }, () => openPlayer(srv, pageUrl, { scale: preview ? .5 : 1 })));
const { info } = players[0];
console.log(`${NW} page(s) prête(s) en ${sec(t0)}s · ${info.w}×${info.h} · GPU : ${info.gpu}`);
const SUB = preview ? 1 : num('sub', info.sub || 2);
const from = num('from', info.from), to = num('to', info.to);
// bornes calées sur la grille globale des images ; T exactement comme l'ancien render.mjs (le grain et les coupes en dépendent)
const f0 = Math.round(from * FPS), N = Math.round(to * FPS) - f0;
const Tof = (f, s) => f / FPS + s / SUB * SHUT / FPS;
const vf = 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p';   // le flou (moyenne des sous-images) est déjà fait dans la page
const TAGS = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];

const tr = Date.now(); let done = 0;
const segs = await Promise.all(players.map(async (p, k) => {
  const a = f0 + Math.floor(N * k / NW), b = f0 + Math.floor(N * (k + 1) / NW);   // tranche [a, b) d'images de sortie
  const seg = join(OUT, `${name}.part${k}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${info.w}x${info.h}`, '-framerate', String(FPS), '-i', '-',
    '-map', '0:v', '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-crf', preview ? '23' : '16', ...TAGS, seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise((ok, ko) => ff.on('close', c => c === 0 ? ok() : ko(new Error('ffmpeg ' + c))));
  srv.sinks.set(String(k), ff.stdin);
  const step = 15;   // images de sortie par appel (progression)
  for (let f = a; f < b; f += step) {
    const ts = []; for (let g = f; g < Math.min(b, f + step); g++) for (let s = 0; s < SUB; s++) ts.push(Tof(g, s));
    await p.frames(ts, String(k), SUB, f === a && f > f0 ? Tof(f - 1, SUB - 1) : null);   // 1er seek d'une tranche : on rejoue l'image d'avant (état identique au rendu d'un seul tenant)
    done += ts.length / SUB; process.stdout.write(`\r${name} : ${done}/${N} images · ${(done / ((Date.now() - tr) / 1000)).toFixed(1)} i/s   `);
  }
  ff.stdin.end(); await closed; await p.close(); return seg;
}));
const rt = (Date.now() - tr) / 1000;
console.log(`\nrendu : ${rt.toFixed(1)}s pour ${N} images (${(N / rt).toFixed(1)} i/s, ${(N * SUB / rt).toFixed(1)} sous-images/s)`);

// assemblage sans réencodage (+ le son, recalé sur [from, to])
const list = join(OUT, `${name}.list.txt`);
await writeFile(list, segs.map(s => `file '${s.replace(/\\/g, '/')}'`).join('\n'));
const audio = opt('audio') && resolve(root, opt('audio'));
const final = join(OUT, `${name}.mp4`);
await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
  ...(audio ? ['-ss', String(f0 / FPS), '-t', String(N / FPS), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  '-c:v', 'copy', '-movflags', '+faststart', final]);
for (const s of [...segs, list]) await rm(s);
console.log('✓', final);

// version téléphone : 720×1280, CRF 27, moins de 30 Mo (on remonte le CRF si besoin)
if (has('tel')) {
  const tel = join(OUT, `${name}_tel.mp4`);
  for (let crf = 27; ; crf += 2) {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', final, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', ...TAGS,
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', tel]);
    const mo = (await stat(tel)).size / 1e6; console.log(`✓ ${tel} (${mo.toFixed(1)} Mo, CRF ${crf})`);
    if (mo < 30 || crf >= 40) break;
  }
}
// version iPhone : H.264 2 passes, 4 700 kb/s, faststart
if (has('iphone')) {
  const ip = join(OUT, `${name} (iPhone).mp4`), log = join(OUT, `${name}.2pass`);
  const base = ['-y', '-loglevel', 'error', '-i', final, '-c:v', 'libx264', '-b:v', '4700k', '-preset', 'slow', '-passlogfile', log, ...TAGS];
  await run('ffmpeg', [...base, '-pass', '1', '-an', '-f', 'mp4', process.platform === 'win32' ? 'NUL' : '/dev/null']);
  await run('ffmpeg', [...base, '-pass', '2', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', ip]);
  for (const f of [`${log}-0.log`, `${log}-0.log.mbtree`]) if (existsSync(f)) await rm(f);
  console.log(`✓ ${ip} (${((await stat(ip)).size / 1e6).toFixed(1)} Mo)`);
}
srv.close();
console.log(`total : ${sec(t0)}s`);
