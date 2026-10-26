// verrou.mjs : places sur la carte graphique pour tout le poste (RTX 3060 6 Go : 2 Chromium au plus, cf. phase 1).
// Un rendu ou un contrôle lancé par un agent prend une place ; s'il n'y en a plus, il attend. Une place dont le processus est mort est reprise.
import { openSync, writeSync, closeSync, readFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const D = 'C:/claude/studio-projets/.gpu', PLACES = 2;
const vivant = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

export async function prendre({ attente = 15 * 60e3, dire = console.error } = {}) {
  mkdirSync(D, { recursive: true });
  const t0 = Date.now(); let dit = false;
  for (;;) {
    for (let i = 0; i < PLACES; i++) {
      const f = join(D, `place${i}`);
      try { const fd = openSync(f, 'wx'); writeSync(fd, String(process.pid)); closeSync(fd);
        const lacher = () => { process.off('exit', lacher); try { unlinkSync(f); } catch {} }; process.on('exit', lacher); return lacher;
      } catch {
        try { if (!vivant(+readFileSync(f, 'utf8'))) unlinkSync(f); } catch {}   // place périmée (processus tué) : libérée, reprise au tour suivant
      }
    }
    if (Date.now() - t0 > attente) throw new Error('carte graphique occupée depuis trop longtemps');
    if (!dit) { dire('(carte graphique occupée par un autre agent : j\'attends ma place)'); dit = true; }
    await new Promise(r => setTimeout(r, 400));
  }
}

// node lib/verrou.mjs : essai (3 processus pour 2 places : le 3e attend)
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  if (process.argv[2] === 'fils') { const l = await prendre({ dire: () => console.log('attend', process.pid) }); console.log('prend', Date.now() % 1e5, process.pid); await new Promise(r => setTimeout(r, 1500)); l(); console.log('lâche', Date.now() % 1e5, process.pid); }
  else { const { spawn } = await import('node:child_process'); const ps = [0, 1, 2].map(() => spawn(process.execPath, [process.argv[1], 'fils'], { stdio: 'inherit' }));
    await Promise.all(ps.map(p => new Promise(r => p.on('close', r)))); }
}
