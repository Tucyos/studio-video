// node .studio/rendre.mjs T1 T2 … : images PNG de ce projet aux instants donnés (secondes) -> qa/snaps/
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const P = resolve(import.meta.dirname, '..'), S = '__STUDIO__';
const lacher = await (await import(`file:///${S}/lib/verrou.mjs`)).prendre();   // 2 rendus à la fois au plus sur le poste
const r = spawnSync(process.execPath, [`${S}/render.mjs`, P, '--snap', ...process.argv.slice(2), '--out', resolve(P, 'qa/snaps')], { stdio: 'inherit' });
lacher(); process.exit(r.status ?? 1);
