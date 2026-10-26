// player.mjs : le lecteur commun. Ouvre n'importe quelle page de scène (contrat : <canvas id="c">, window.READY, window.SCENE, window.seek(T))
// dans un Chromium GPU, et donne seek(T) -> pixels bruts (RGBA) ou PNG. Les pixels repartent de la page par fetch binaire, pas par base64.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const STUDIO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.wav': 'audio/wav' };

// Serveur statique sur le dossier du projet (lecture seule). /node_modules/ absent du projet -> celui du studio.
// POST /__frame/<id> : une image brute envoyée par une page, recopiée dans sinks.get(id) (un flux, en général l'entrée de ffmpeg).
export function serve(root) {
  const sinks = new Map();
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (req.method === 'POST' && url.startsWith('/__frame/')) {
      const sink = sinks.get(url.slice(9));
      if (!sink) { res.writeHead(404); return res.end(); }
      req.pipe(sink, { end: false }); req.on('end', () => res.end()); return;
    }
    for (const base of url.startsWith('/node_modules/') ? [root, STUDIO] : [root]) {
      try { const p = join(base, url); const body = await readFile(p); res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }); return res.end(body); } catch {}
    }
    res.writeHead(404); res.end();
  }).listen(0);
  return { port: server.address().port, sinks, close: () => server.close() };
}

const ARGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];   // GPU (RTX) pour three.js, comme dans tiktok-motion

// Une page = un navigateur (chaque Chromium a son propre processus GPU : les pages en parallèle ne se bloquent pas entre elles).
// init : chemin d'un script injecté avant la page (mode contrôle : lib/qa-page.js)
export async function openPlayer(srv, pageUrl, { scale = 1, onError, init } = {}) {
  const t0 = Date.now();
  const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), args: ARGS });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  if (init) await page.addInitScript({ path: init });
  const fail = msg => { console.error(msg); onError ? onError(msg) : process.exit(1); };
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text().slice(0, 300)); if (m.text().startsWith('cue introuvable')) fail('cue introuvable'); });
  page.on('pageerror', e => fail('[page error] ' + e.message));
  await page.goto(`http://localhost:${srv.port}/${pageUrl.replace(/^\//, '')}`);
  await page.waitForFunction(() => window.READY, null, { timeout: 180000 });
  const info = await page.evaluate(async () => {
    await window.READY;
    const c = document.getElementById('c'), gl = document.createElement('canvas').getContext('webgl'), ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    // Jamais de getImageData sur le canvas de la scène : après quelques lectures, Chrome le passe en rendu 2D logiciel et l'image change
    // (textes, dégradés : 11 % des octets, ±4). On copie l'image dans un canvas à nous (lecture fréquente, en mémoire) et on lit celui-là.
    const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; const kg = k.getContext('2d', { willReadFrequently: true });
    window.__grab = () => { kg.drawImage(c, 0, 0); return kg.getImageData(0, 0, k.width, k.height).data; };
    return { from: window.SCENE.from, to: window.SCENE.to, sub: window.SCENE.sub, w: c.width, h: c.height, gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '?' };
  });
  info.load = (Date.now() - t0) / 1000;
  return {
    page, info,
    seek: T => page.evaluate(T => window.seek(T), T),
    // PNG sans perte de l'image à T (comme snap.mjs)
    png: async T => Buffer.from((await page.evaluate(async T => { await window.seek(T); return document.getElementById('c').toDataURL('image/png'); }, T)).slice(22), 'base64'),
    // rend les temps ts (sub sous-images par image) et envoie chaque image brute (RGBA, w*h*4 octets) vers srv.sinks.get(id), dans l'ordre.
    // Flou de mouvement : moyenne des sub sous-images dans la page, arrondie comme le tmix de ffmpeg (au plus proche, moitié vers le haut :
    // vérifié sur toutes les sommes pour sub 2-8). On n'envoie donc qu'une image sur sub : 8 Mo, c'est le transfert qui coûte.
    // warm : un seek jeté avant la 1re image, pour qu'une tranche démarre dans le même état qu'un rendu d'un seul tenant.
    frames: (ts, id, sub = 1, warm = null) => page.evaluate(async ({ ts, url, sub, warm }) => {
      if (warm != null) await window.seek(warm);
      const lut = new Uint8Array(255 * sub + 1).map((_, s) => Math.floor(s / sub + .5));
      let q = Promise.resolve(), acc;
      for (let i = 0; i < ts.length; i += sub) {
        let out;
        if (sub === 1) { await window.seek(ts[i]); out = window.__grab(); }
        else {
          for (let s = 0; s < sub; s++) { await window.seek(ts[i + s]); const d = window.__grab(); if (s === 0) (acc ||= new Uint16Array(d.length)).set(d); else for (let j = 0; j < d.length; j++) acc[j] += d[j]; }
          out = new Uint8Array(acc.length); for (let j = 0; j < acc.length; j++) out[j] = lut[acc[j]];
        }
        const b = new Blob([out]);                                   // Blob : 10x plus rapide qu'un tableau en corps de fetch
        q = q.then(() => fetch(url, { method: 'POST', body: b }));   // envoi pendant le rendu de l'image suivante
        if (i / sub % 4 === 3) await q;                              // au plus 4 images en vol
      }
      await q;
    }, { ts, url: `/__frame/${id}`, sub, warm }),
    close: () => browser.close(),
  };
}
