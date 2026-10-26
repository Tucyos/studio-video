// node .studio/controler.mjs [début] [fin] : contrôles automatiques -> qa/rapport.json (toute la vidéo) ou qa/plage_<début>_<fin>/qa/rapport.json
// (une plage a son propre rapport : plusieurs agents contrôlent leurs sections en même temps)
import { spawnSync } from 'node:child_process';
import { resolve, relative } from 'node:path';
const P = resolve(import.meta.dirname, '..'), S = '__STUDIO__', [a, b] = process.argv.slice(2);
const out = a ? resolve(P, 'qa', `plage_${a}_${b || 'fin'}`) : P;
const lacher = await (await import(`file:///${S}/lib/verrou.mjs`)).prendre();
const r = spawnSync(process.execPath, [`${S}/check.mjs`, P, ...(a ? ['--from', a] : []), ...(b ? ['--to', b] : []), '--workers', '1', '--out', out], { stdio: 'inherit' });
lacher(); console.log(`\nRapport à lire : ${relative(P, resolve(out, 'qa', 'rapport.json')).split('\\').join('/')}`); process.exit(r.status ?? 1);
