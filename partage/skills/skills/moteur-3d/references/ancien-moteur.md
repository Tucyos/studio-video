
> **Principes d'animation** (timing, courbes, chorégraphie, principes Disney) : `mouvement/SKILL.md` dans le dossier de ce skill (LottieFiles, licence MIT : `mouvement/LICENSE`).
> **Le moteur 3D actuel** du compte auto (Three.js r186 + Playwright, tout est une fonction du temps T) : partir du dossier vidéo le plus récent (`videos/Automobile/bmw-modeles/` : `lib/`, `render.mjs`, `snap.mjs`, `scenes/`) et de `videos/Automobile/REPRISE.md`. Ce qui suit décrit le moteur canvas d'origine.

# Motion engine — vidéos motion design rendues en code

Le prompt compte pour 10 % de la vidéo, l'outillage pour 90 %. Ce skill décrit l'outillage : comment on rend une vidéo, comment on la découpe et comment on la critique. Le style visuel vient du skill de DA (`da-pixel-rose`), qui se charge toujours avec celui-ci.

La version de référence de ce skill est aussi dans le Project claude.ai « motion design » (`claude/skill-motion-engine.md`).

## Règles de rendu (non négociables)
- Chaque scène est une **fonction pure du temps** : `window.seek(T)` dessine l'image du temps T. Pas de transition CSS, pas de setTimeout, pas de requestAnimationFrame, et aucun état conservé d'une image à l'autre.
- `Math.random` est interdit : on utilise `M.rng(seed)` / `M.noise`, pour que deux rendus donnent exactement la même vidéo.
- **T = le temps global de la voix off.** Une scène couvre `[from, to]` en temps global, ce qui permet de concaténer les scènes sans décalage avec l'audio.
- Format 1080×1920, 30 i/s, 2 sous-images fusionnées par image (motion blur). Une scène avec whip ou push rapide déclare `sub: 6` dans `SCENE` pour un vrai flou de mouvement. Pour un aperçu rapide : `--preview` (sans motion blur).

## Arborescence du projet
```
projet/
  lib/motion.js      moteur (ce skill)
  lib/da.js          DA (fiche da-pixel-rose)
  render.mjs  audio.py  words.py
  assets/fonts/ assets/img/ assets/sfx/
  audio/vo.wav  audio/music.wav
  scenes/words.js    timecodes de la voix (généré)
  scenes/s01.html s02.html ...
  docs/script.md docs/shotlist.md docs/review_log.md
  out/
```
Mise en place (une fois par projet) : écrire les fichiers ci-dessous **tels quels**, puis lancer :
```bash
npm init -y && npm i -D playwright @fontsource/montserrat @fontsource/vt323
pip install numpy soundfile pyloudnorm --break-system-packages
mkdir -p assets/fonts assets/img assets/sfx audio scenes docs out
for w in 700 800 900; do cp node_modules/@fontsource/montserrat/files/montserrat-latin-$w-normal.woff2 assets/fonts/montserrat-$w.woff2; done
cp node_modules/@fontsource/vt323/files/vt323-latin-400-normal.woff2 assets/fonts/vt323.woff2
```
Si Playwright ne trouve pas son navigateur : `export CHROME=/opt/pw-browsers/chromium`, ou le chemin d'un Chrome installé. **Ne pas lancer `playwright install`** dans le cloud Cowork.

## Pipeline d'une vidéo (avec des étapes de validation)
1. **Script** (`docs/script.md`) : voix off complète, écrite avec le skill storytelling. **Attendre l'accord de l'utilisateur.**
2. **Voix off** → `audio/vo.wav`, puis `python3 words.py ...` → `scenes/words.js`. La voix pilote toute la timeline.
   - Avec ElevenLabs (clé dans `.env`, jamais dans le prompt), utiliser l'endpoint *with-timestamps* et passer le JSON à `words.py --elevenlabs`.
   - Si l'utilisateur enregistre sa voix : lancer faster-whisper sur son PC, car le téléchargement du modèle est bloqué dans le cloud. Sinon, il fournit les timecodes.
3. **Shotlist** (`docs/shotlist.md`) : découper par **moments narratifs**, de 5 à 15 s par scène. Pour chaque scène : from/to, ce qui est à l'écran, sur quel mot chaque élément se déclenche (`M.at('mot', n)`), les SFX, la transition. Il doit se passer quelque chose toutes les 2 à 3 s. **Attendre l'accord de l'utilisateur.**
4. **Images fixes** : une image par moment clé de chaque scène → planche contact → critique. On corrige à ce stade, avant d'animer.
5. **Animation scène par scène** : une scène = un fichier `scenes/sNN.html`. Commencer par `--preview`, critiquer, corriger, puis faire le rendu final. Ne refaire que les scènes qui ont un problème.
6. **Son** : `cues.json` (SFX calés sur les mêmes mots que les animations, silences, automation de la musique) → `python3 audio.py cues.json`.
7. **Assemblage** :
```bash
(cd out && ls s[0-9]*.mp4 | grep -v preview | sed "s/.*/file '&'/" > list.txt)
ffmpeg -y -f concat -safe 0 -i out/list.txt -c copy out/silent.mp4
ffmpeg -y -i out/silent.mp4 -i out/mix.wav -c:v copy -c:a aac -b:a 192k -shortest out/final.mp4
```
8. Livrer `out/final.mp4`, la planche contact, et une ligne sur ce qu'il faudrait améliorer ensuite.

**Pourquoi scène par scène plutôt qu'une minute d'un coup** : le script et la shotlist sont écrits en une fois pour toute la vidéo, ce qui garde l'histoire cohérente. L'animation, elle, se fait par scène : moins de bugs, une critique plus précise, et une scène ratée se refait seule sans tout relancer. Si plusieurs sous-agents travaillent en parallèle, ils partagent `lib/da.js` et `docs/shotlist.md`, et chacun ne touche qu'à sa scène.

**Temps de rendu** (mesuré) : environ 3 s de calcul par seconde de vidéo en aperçu, 4 à 6 s avec 2 sous-images, 12 s avec 4. Une minute finale prend donc 5 à 12 min. Une commande Bash est limitée à environ 3 min : rendre une scène à la fois, ou lancer le rendu en arrière-plan (`nohup ... &`) et vérifier ensuite.

## Squelette d'une scène
```html
<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}</style>
<canvas id="c"></canvas>
<script src="/lib/motion.js"></script><script src="/lib/da.js"></script><script src="/scenes/words.js"></script>
<script>
DA.loadImages({ bush: '/assets/img/bush.png' });
const { C, CX, CY } = DA, at = M.at;
M.mount({ from: 12.4, to: 19.8, draw(g, T) {
  DA.frame(g, T, { from: 12.4, to: 19.8 }, () => {
    DA.rich(g, 'Les gens *intelligents* sont plus biaisés', CX, CY - 300, { t: T, t0: at('gens'), size: 60 });
    DA.title(g, 'DÉMO', 290, CY + 200, { t: T, t0: at('démocrates'), color: C.white });
    DA.sprite(g, 'people', 290, CY + 390, { t: T, t0: at('démocrates') + 0.1 });
  });
}});
</script>
```
Rendu : `node render.mjs scenes/s01.html --preview`, puis `node render.mjs scenes/s01.html`.

## Boucle de critique (au minimum 2 tours par scène)
```bash
ffmpeg -y -i out/s01_preview.mp4 -vf "fps=2,scale=270:-1,tile=6x3" -frames:v 1 out/contact.png   # planche contact
ffmpeg -y -ss 3.0 -i out/s01_preview.mp4 -vf "scale=320:-1,tile=12x1" -frames:v 1 out/strip.png   # 12 images autour d'un moment rapide
ffmpeg -y -i out/s01.mp4 -vf "fps=1,scale=360:-1,tile=5x2" -frames:v 1 out/phone.png              # test de lisibilité sur téléphone
```
Ouvrir les images avec Read et se comporter en **directeur motion exigeant, pas en auteur fier de son travail**. Noter de 1 à 10 :
hook dans les 2 premières secondes · lisibilité à 360 px de large · qualité du mouvement (rien de linéaire, aucune image morte) · un élément nouveau toutes les 2-3 s · composition dans la zone sûre TikTok · respect de la DA · synchro avec la voix.
Lister les 3 pires problèmes avec leur timecode : textes qui se chevauchent, éléments hors de la zone sûre, texte trop petit, image morte, fondu générique, couleur décorative. Corriger, ne refaire le rendu que des scènes concernées, et noter tout dans `docs/review_log.md`. On continue tant qu'une note est sous 8.

## Interdits génériques
Titre centré sur un dégradé, fondu d'entrée sur tous les éléments, étiquettes dans les coins, cadres autour de la vidéo, explosions de particules, `will-change` sur des éléments mis à l'échelle (le texte devient flou), plus de 3 s sans aucun changement à l'écran.

## Outils en plus (installés le 19/10/2026)
- **Timing et easing** : `mouvement/SKILL.md` (LottieFiles). Il est pensé pour les interfaces : pour une vidéo, garder les principes (anticipation, débordement, courbes selon la matière, la règle du 1/3, les trois couches primaire / secondaire / ambiante) et allonger les durées.
- **Physique 3D** : Rapier (`@dimforge/rapier3d-compat`), pour l'effondrement en cubes et les débris qui rebondissent. Il est déterministe : on avance la simulation d'un pas fixe (`world.step()`, 1/60 s), `round(T × 60)` fois depuis le début, donc la même image ressort à chaque rendu.
- **Effets** : `postprocessing` (pmndrs), pour le bloom, le flou de profondeur, la vignette, le grain et l'aberration chromatique, en quelques lignes (`EffectComposer` + `EffectPass`).
- Exemple qui marche, avec l'importmap des deux paquets : `studio/scenes/exemple_physique.html`.

## Fichiers du moteur

### lib/motion.js
```js
// motion.js — moteur générique. Tout est fonction pure du temps T (secondes, temps global de la voix off).
(function () {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;

  // Ressort amorti en forme close : 0 -> 1
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }
  // Valeur qui passe par plusieurs cibles : somme d'un ressort par changement. keys=[[t,v],...]
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }
  const ease = {
    linear: p => p,
    out: p => 1 - Math.pow(1 - p, 4),                       // entrée rapide, décélération longue
    outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),  // "ease out 80%" façon AE
    inOut: p => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2),
    in: p => p ** 3,
    back: (p, s = 0.9) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2), // overshoot ~4%
  };
  // Progression 0..1 d'une anim qui démarre à t0 et dure dur
  const anim = (t, t0, dur, fn = ease.out) => fn(clamp((t - t0) / dur));
  // Clés façon After Effects : [[t,v,easeFn?],...]
  function keys(t, ks) {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 1; i < ks.length; i++) {
      if (t < ks[i][0]) {
        const [t0, v0] = ks[i - 1], [t1, v1, fn] = ks[i];
        return lerp(v0, v1, (fn || ease.inOut)((t - t0) / (t1 - t0)));
      }
    }
    return ks[ks.length - 1][1];
  }
  // Aléatoire déterministe (mulberry32) — jamais Math.random
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (i, s) => rng((i * 374761393 + s * 668265263) | 0)();
  // Bruit lisse 1D -> [-1,1] (pour wiggle)
  function noise(x, seed = 1) {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1;
  }
  const wiggle = (t, freq, amp, seed = 1) => noise(t * freq, seed) * amp;

  // Cues de la voix off : window.WORDS = [{w,start,end}] (généré par words.py)
  function at(word, n = 1) {
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9']/g, '');
    const list = (window.WORDS || []).filter(x => norm(x.w) === norm(word));
    if (!list[n - 1]) { console.warn('cue introuvable', word, n); return 0; }
    return list[n - 1].start;
  }

  // Monte une scène : SCENE = {from, to, sub?, draw(g, T)}
  function mount(scene, W = 1080, H = 1920) {
    const c = document.getElementById('c');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    window.SCENE = scene;
    window.seek = T => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); scene.draw(g, T); return true; };
    window.READY = (window.DA_READY || Promise.resolve()).then(() => true);
  }

  window.M = { clamp, lerp, spring, track, ease, anim, keys, rng, noise, wiggle, at, mount };
})();
```

### render.mjs
```js
// node render.mjs scenes/s01.html [--fps 30] [--sub 2] [--from T] [--to T] [--preview]
// Sort out/<nom>.mp4. --preview = sans flou de mouvement (sub 1), ~3x plus rapide, pour vérifier.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';

const argv = process.argv.slice(2);
const file = argv.find(a => a.endsWith('.html'));
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? Number(argv[i + 1]) : d; };
const preview = argv.includes('--preview');
const FPS = opt('fps', 30);
const scale = preview ? 0.5 : 1;

// Petit serveur statique (évite les blocages file:// pour modules, fonts, images)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try { const p = join(process.cwd(), decodeURIComponent(req.url.split('?')[0]));
    const body = await readFile(p);
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

await mkdir('out', { recursive: true });
// CHROME=/chemin/vers/chrome si Playwright ne trouve pas son navigateur
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
page.on('pageerror', e => { console.error('[page error]', e.message); process.exit(1); });
await page.goto(`http://localhost:${port}/${file}`);
await page.waitForFunction(() => window.READY);
await page.evaluate(() => window.READY);
const sc = await page.evaluate(() => ({ from: window.SCENE.from, to: window.SCENE.to, sub: window.SCENE.sub }));
const SUB = preview ? 1 : opt('sub', sc.sub || 2);  // SCENE.sub = 6 pour les scènes avec whip (flou de mouvement fort)
const from = opt('from', sc.from), to = opt('to', sc.to);
const name = basename(file, '.html') + (preview ? '_preview' : '');
const out = `out/${name}.mp4`;

const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB` : 'null';
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
  '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-crf', preview ? '23' : '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round((to - from) * FPS * SUB);
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  await page.evaluate(T => window.seek(T), from + i / (FPS * SUB));
  const b64 = await page.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.95).slice(23));
  const img = Buffer.from(b64, 'base64');
  if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % (FPS * SUB) === 0) process.stdout.write(`\r${name}: ${(i / (FPS * SUB)).toFixed(0)}s / ${(to - from).toFixed(1)}s`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close(); server.close();
console.log(`\n✓ ${out} (${((Date.now() - t0) / 1000).toFixed(0)}s de rendu)`);
```

### audio.py
```python
#!/usr/bin/env python3
"""audio.py — SFX + musique + voix off -> out/mix.wav (-14 LUFS).
Usage : python3 audio.py cues.json [--dur 60]
cues.json :
{
  "vo": "audio/vo.wav",                  # optionnel
  "music": "audio/music.wav",            # optionnel
  "music_db": -18,                       # niveau de base de la musique
  "music_keys": [[0,-24],[8,-16]],       # automation (t, dB) interpolée
  "silences": [[21.3, 22.6]],            # "drop du silence" : musique coupée net (fade 30 ms)
  "sfx": [{"t": 0.5, "type": "paper", "db": -6}, ...]
}
Types SFX : paper, marker, tick, whoosh, thud, riser, swish, pop.
Si assets/sfx/<type>.wav existe, il remplace la synthèse (préférer de vrais sons quand possible).
"""
import sys, json, os, argparse
import numpy as np, soundfile as sf

SR = 48000
ap = argparse.ArgumentParser(); ap.add_argument('cues'); ap.add_argument('--dur', type=float); ap.add_argument('--out', default='out/mix.wav')
a = ap.parse_args()
cfg = json.load(open(a.cues))
rs = np.random.default_rng(42)

def load(path):
    x, sr = sf.read(path, always_2d=True); x = x.mean(axis=1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x.astype(np.float32)

def lp(x, fc):  # passe-bas 1 pôle (son "mat", feutré)
    a_ = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a_) * v + a_ * s; y[i] = s
    return y
def bp(x, lo, hi): return lp(x, hi) - lp(x, lo)
def env(n, att, dec):
    t = np.arange(n) / SR; return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / dec)

def synth(kind):
    n = lambda s: int(s * SR); t = lambda s: np.arange(n(s)) / SR
    if kind == 'paper':   x = bp(rs.standard_normal(n(.35)), 300, 3500) * env(n(.35), .03, .09) * 1.6
    elif kind == 'marker':x = bp(rs.standard_normal(n(.4)), 1500, 5000) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * t(.4))) * env(n(.4), .02, .2) * 1.2
    elif kind == 'tick':  x = np.sin(2 * np.pi * 2400 * t(.03)) * env(n(.03), .0005, .006) * .7
    elif kind == 'whoosh':
        k = n(.45); x = lp(rs.standard_normal(k), 900) * np.sin(np.pi * np.linspace(0, 1, k)) ** 2 * 2.2
    elif kind == 'swish':
        k = n(.18); x = bp(rs.standard_normal(k), 600, 2500) * np.sin(np.pi * np.linspace(0, 1, k)) ** 1.5 * 1.8
    elif kind == 'thud':
        tt = t(.9); x = np.sin(2 * np.pi * (75 - 35 * tt) * tt) * env(n(.9), .004, .25) + lp(rs.standard_normal(n(.9)), 200) * env(n(.9), .002, .03) * 1.5
    elif kind == 'riser':
        tt = t(2.0); x = lp(rs.standard_normal(n(2.0)), 2500) * (tt / 2.0) ** 2 * 1.5 + np.sin(2 * np.pi * (110 + 220 * (tt / 2) ** 2) * tt) * (tt / 2) ** 2 * .25
    elif kind == 'pop':   x = np.sin(2 * np.pi * (500 + 700 * t(.12)) * t(.12)) * env(n(.12), .002, .03) * .5
    else: raise SystemExit(f'type SFX inconnu : {kind}')
    return lp(x.astype(np.float32), 6000)

def place(buf, x, t, gain=1.0):
    s = int(t * SR); e = min(len(buf), s + len(x))
    if s < len(buf): buf[s:e] += x[:e - s] * gain

vo = load(cfg['vo']) if cfg.get('vo') else None
dur = a.dur or (len(vo) / SR + 1.0 if vo is not None else max([c['t'] for c in cfg.get('sfx', [])] + [5]) + 2)
N = int(dur * SR)
voice = np.zeros(N, np.float32); fx = np.zeros(N, np.float32); mus = np.zeros(N, np.float32)
if vo is not None: place(voice, vo, 0)
cache = {}
for c in cfg.get('sfx', []):
    k = c['type']
    if k not in cache: cache[k] = load(f'assets/sfx/{k}.wav') if os.path.exists(f'assets/sfx/{k}.wav') else synth(k)
    place(fx, cache[k], c['t'], 10 ** (c.get('db', -8) / 20))

if cfg.get('music'):
    m = load(cfg['music']); m = np.tile(m, int(np.ceil(N / len(m))))[:N]
    tt = np.arange(N) / SR
    keys = cfg.get('music_keys') or [[0, cfg.get('music_db', -18)]]
    db = np.interp(tt, [k[0] for k in keys], [k[1] for k in keys])
    g = 10 ** (db / 20)
    for t0, t1 in cfg.get('silences', []):   # drop du silence
        f = 0.03; g *= np.clip(np.maximum((t0 - tt) / f, (tt - t1) / f), 0, 1)
    if vo is not None:                        # ducking doux sous la voix (-6 dB)
        e = np.convolve(np.abs(voice), np.ones(int(.2 * SR)) / int(.2 * SR), 'same')
        g *= 1 - 0.5 * np.clip(e / (e.max() * 0.15 + 1e-9), 0, 1)
    mus = m * g

mix = voice + fx + mus
try:
    import pyloudnorm as pyln
    meter = pyln.Meter(SR); mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
except Exception as ex: print('loudnorm ignoré :', ex)
peak = np.abs(mix).max(); lim = 10 ** (-1 / 20)
if peak > lim: mix = np.tanh(mix / lim) * lim     # limiteur doux, crête ~ -1 dBFS
os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
sf.write(a.out, mix.astype(np.float32), SR)
print(f'✓ {a.out} ({dur:.1f}s)')
```

### words.py
```python
#!/usr/bin/env python3
"""words.py — timecodes mot par mot de la voix off -> scenes/words.js (window.WORDS).
  python3 words.py audio/vo.wav                    # faster-whisper (sur ton PC si le cloud bloque le modèle)
  python3 words.py --elevenlabs audio/vo_alignment.json   # alignement renvoyé par ElevenLabs (with-timestamps)
  python3 words.py --json audio/words.json         # liste déjà prête [{w,start,end}]
"""
import sys, json
args = sys.argv[1:]
if args[0] == '--json':
    words = json.load(open(args[1]))
elif args[0] == '--elevenlabs':
    al = json.load(open(args[1])); al = al.get('alignment', al)
    ch, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    words, cur, s = [], '', None
    for c, a, b in zip(ch + [' '], st + [0], en + [0]):
        if c.isspace():
            if cur: words.append({'w': cur.strip(".,;:!?«»\"…"), 'start': round(s, 3), 'end': round(last, 3)}); cur = ''
        else:
            if not cur: s = a
            cur += c; last = b
else:
    from faster_whisper import WhisperModel
    m = WhisperModel('small', device='cpu', compute_type='int8')
    segs, _ = m.transcribe(args[0], language='fr', word_timestamps=True)
    words = [{'w': w.word.strip().strip(".,;:!?«»\"…"), 'start': round(w.start, 3), 'end': round(w.end, 3)} for s in segs for w in s.words]
open('scenes/words.js', 'w').write('window.WORDS = ' + json.dumps(words, ensure_ascii=False) + ';\n')
print(f'✓ scenes/words.js ({len(words)} mots, {words[-1]["end"]:.1f}s)')
```