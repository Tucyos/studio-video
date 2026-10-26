// lot-meta.mjs : les informations d'une liste de liens (TikTok, YouTube…), sans télécharger les vidéos -> meta.json, regroupées par compte.
//   node outils/lot-meta.mjs <dossier du lot>      (le dossier contient liens.txt ; un lien par ligne)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
const D = process.argv[2], liens = [...new Set(readFileSync(join(D, 'liens.txt'), 'utf8').split(/\s+/).filter(l => /^https?:\/\//.test(l)))];
const CH = ['id', 'uploader', 'uploader_id', 'channel', 'title', 'description', 'tags', 'duration', 'view_count', 'like_count', 'comment_count', 'repost_count', 'upload_date', 'webpage_url', 'track', 'artists', 'width', 'height'];
const un = l => new Promise(ok => execFile('yt-dlp', ['-J', '--no-warnings', '--no-playlist', l], { maxBuffer: 1e8, encoding: 'utf8' }, (e, o) => {
  if (e) return ok({ lien: l, erreur: String(e.message).split('\n').slice(-2).join(' ').slice(0, 300) });
  const d = JSON.parse(o); ok({ lien: l, ...Object.fromEntries(CH.map(k => [k, d[k] ?? null])) });
}));
const R = []; for (let i = 0; i < liens.length; i += 6) { R.push(...await Promise.all(liens.slice(i, i + 6).map(un))); process.stdout.write(`${R.length}/${liens.length}\r`); }
const comptes = {}; for (const v of R.filter(v => !v.erreur)) (comptes[v.uploader] ||= []).push(v.id);
writeFileSync(join(D, 'meta.json'), JSON.stringify({ date: new Date().toISOString(), videos: R, comptes }, null, 1));
console.log(`\n${R.length} liens, ${R.filter(v => v.erreur).length} en erreur, ${Object.keys(comptes).length} comptes`);
for (const [c, ids] of Object.entries(comptes).sort((a, b) => b[1].length - a[1].length)) { const V = R.filter(v => ids.includes(v.id)); console.log(`@${c} · ${V[0].channel || ''} · ${ids.length} vidéo(s) · ${Math.round(V.reduce((s, v) => s + (v.duration || 0), 0))} s · vues médianes ${V.map(v => v.view_count || 0).sort((a, b) => a - b)[V.length >> 1]}`); }
for (const v of R.filter(v => v.erreur)) console.log('✗', v.lien, v.erreur);
