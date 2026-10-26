// partager.mjs : `npm run partager` — lance la page en lecture seule (vitrine.mjs) et un tunnel Cloudflare gratuit (sans compte) vers elle,
// puis affiche le lien public à donner. Le lien vit tant que cette fenêtre reste ouverte (Ctrl+C pour tout couper) ; il change à chaque lancement.
// cloudflared : %LOCALAPPDATA%/cloudflared/cloudflared.exe (signé Cloudflare, Inc., téléchargé le 20/10/2026).
import { spawn } from 'node:child_process';
import { join } from 'node:path';
const CF = join(process.env.LOCALAPPDATA || '', 'cloudflared', 'cloudflared.exe'), PORT = 5171;
const vitrine = spawn(process.execPath, [join(import.meta.dirname, '..', 'vitrine.mjs'), '--port', String(PORT)], { stdio: 'inherit' });
const tunnel = spawn(CF, ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${PORT}`]);
let vu = false;
const lire = d => { const m = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(String(d)); if (m && !vu) { vu = true; console.log(`\n  Lien à partager (lecture seule) : ${m[0]}\n  (il marche tant que cette fenêtre est ouverte ; Ctrl+C pour couper)\n`); } };
tunnel.stdout.on('data', lire); tunnel.stderr.on('data', lire);
tunnel.on('error', e => { console.error('cloudflared introuvable : ' + CF + ' (' + e.message + ')'); vitrine.kill(); process.exit(1); });
const fin = () => { tunnel.kill(); vitrine.kill(); process.exit(0); };
process.on('SIGINT', fin); process.on('SIGTERM', fin);
