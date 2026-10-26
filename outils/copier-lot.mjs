// copier-lot.mjs : copie toutes les DA d'un lot de liens (lot-meta.mjs d'abord) — un compte = une DA (_styles/tt-<compte>/), 7 vidéos au plus
// (les plus vues), deux comptes à la fois. Reprise : un compte déjà fait est sauté ; une limite d'utilisation de Claude = pause puis on recommence le compte.
//   node outils/copier-lot.mjs <dossier du lot> [--seulement compte1,compte2] [--niches]
// Journal : <lot>/journal.txt. À la fin (ou avec --niches seul) : <lot>/niches.md, la synthèse des niches de tous les comptes du lot.
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { STYLES, cloner, telecharger } from './clone-style.mjs';
import { nichesJson } from './niches-json.mjs';

const L = process.argv[2], opt = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const meta = JSON.parse(readFileSync(join(L, 'meta.json'), 'utf8')), seul = opt('seulement')?.split(',');
const log = m => { const l = `${new Date().toLocaleTimeString('fr-FR')} ${m}`; console.log(l); appendFileSync(join(L, 'journal.txt'), l + '\n'); };
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const lire = f => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return {}; } };
const fait = nom => !!lire(join(STYLES, nom, 'fiche.json')).auto?.titre && existsSync(join(STYLES, nom, 'regles.md'));
const LIMITE = /limit|usage|quota|rate|overloaded|429|529|credit|session/i;

async function compte(c) {
  const nom = 'tt-' + slug(c), D = join(STYLES, nom);
  if (fait(nom)) return log(`= @${c} déjà copié (${nom})`);
  // l'adresse propre de chaque vidéo : jamais le lien de partage (son « _t » est un jeton lié au compte de Noam)
  const V = meta.videos.filter(v => meta.comptes[c].includes(v.id)).sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 7)
    .map(({ lien, ...v }) => ({ ...v, webpage_url: `https://www.tiktok.com/@${c}/video/${v.id}` }));
  mkdirSync(D, { recursive: true }); const F = join(D, 'fiche.json'), avant = lire(F);
  writeFileSync(F, JSON.stringify({ ...avant, createur: `@${c}`, nom_du_compte: V[0].channel || c, lien: `https://www.tiktok.com/@${c}`, genre: avant.genre || 'da', origine: `Copiée de @${c} (TikTok)` }, null, 1));
  for (let essai = 1; ; essai++) {
    try {
      const fichiers = V.map(v => telecharger(v.webpage_url, D, m => log(`@${c} ${m}`)));
      const r = await cloner(nom, fichiers, { metas: V, log: m => log(`@${c} ${m}`) });
      return log(`✓ @${c} -> ${nom} : ${r.bonnes} règles vérifiées, ${r.doutes} à vérifier, ≈ ${r.cout.toFixed(2)} $ API`);
    } catch (e) {
      if (LIMITE.test(e.message) && essai <= 12) { log(`@${c} : limite d'utilisation (${e.message.slice(0, 120)}) -> pause 15 min, puis on reprend ce compte`); await new Promise(ok => setTimeout(ok, 15 * 60e3)); continue; }
      return log(`✗ @${c} : ${e.message.slice(0, 300)}`);
    }
  }
}
// la synthèse des niches : Opus lit les compte.md du lot (vues comprises) -> niches.md (pour la future « idée de niche » du studio)
async function niches() {
  const comptes = Object.keys(meta.comptes).map(c => 'tt-' + slug(c)).filter(n => existsSync(join(STYLES, n, 'compte.md')));
  const tmp = join(tmpdir(), `studio-niches-${Date.now()}`); mkdirSync(tmp, { recursive: true });
  writeFileSync(join(tmp, 'comptes.md'), comptes.map(n => readFileSync(join(STYLES, n, 'compte.md'), 'utf8')).join('\n\n---\n\n'));
  log(`Opus : synthèse des niches (${comptes.length} comptes)`);
  const texte = await new Promise((ok, ko) => { const p = spawn('claude', ['-p', '--model', 'opus', '--effort', 'high', '--setting-sources', 'project', '--tools', 'Read', '--allowedTools', 'Read', '--output-format', 'json', '--no-session-persistence'], { cwd: tmp, shell: process.platform === 'win32', stdio: ['pipe', 'pipe', 'inherit'] });
    let o = ''; p.stdout.on('data', d => o += d); p.on('close', () => { try { const r = JSON.parse(o); r.is_error ? ko(new Error(r.result)) : ok(r.result); } catch { ko(new Error('réponse illisible')); } });
    p.stdin.end(`Lis comptes.md (Read) : la fiche de ${comptes.length} comptes TikTok / Shorts (niche, sujets, accroches, structure, ton, chiffres, idées). Écris en français, en Markdown, une synthèse pour Noam, créateur de vidéos motion design en code (comptes Koan : psychologie, société ; Automobile : sport auto, cinéma) :
1. les niches regroupées (tableau : niche, comptes, vues médianes, format, ce qui marche) ;
2. les formules d'accroche qui reviennent, citées ;
3. les structures de vidéo qui reviennent ;
4. les niches les plus prometteuses pour lui, et pourquoi (avec les chiffres) ;
5. 30 idées de sujets concrètes, chacune avec la niche et la DA qui irait.
N'invente aucun chiffre.`); });
  writeFileSync(join(L, 'niches.md'), texte); rmSync(tmp, { recursive: true, force: true }); log(`✓ ${join(L, 'niches.md')}`);
  await nichesJson(L, log);   // pour la page « Idées de niche »
}

if (!process.argv.includes('--niches') || seul) {
  const file = Object.keys(meta.comptes).filter(c => !seul || seul.includes(c)); log(`lot : ${file.length} compte(s) à copier`);
  await Promise.all([0, 1].map(async () => { while (file.length) await compte(file.shift()); }));   // deux comptes à la fois
}
if (!seul || process.argv.includes('--niches')) await niches();
