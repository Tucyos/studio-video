// node .studio/bibliotheque.mjs <nom> : copie un élément de la bibliothèque commune dans assets/bib/<nom>/ (puis await k.bib('<nom>') dans une section)
// node .studio/bibliotheque.mjs : la liste des éléments (nom, type, taille, ce que c'est)
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const P = resolve(import.meta.dirname, '..'), S = '__STUDIO__', nom = process.argv[2];
if (!nom) { const { index } = await import(`file:///${S}/lib/bibliotheque.mjs`); for (const e of index().elements) console.log(`${e.nom} · ${e.type} · ${e.dims_m.map(x => x.toFixed(2)).join('×')} m · ${(e.quoi || e.notes || '').slice(0, 110)}`); process.exit(0); }
const r = spawnSync(process.execPath, [`${S}/lib/bibliotheque.mjs`, P, nom], { stdio: 'inherit' }); process.exit(r.status ?? 1);
