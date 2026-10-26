// lot.mjs : l'avancement d'un lot de liens copiés en DA (outils/copier-lot.mjs), lu sur le disque. Utilisé par le studio (page Avancement)
// et par vitrine.mjs (la page en lecture seule partagée aux amis).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
export const STYLES = 'C:/claude/studio-projets/_styles';
export const lireFiche = d => { try { return JSON.parse(readFileSync(join(STYLES, d, 'fiche.json'), 'utf8')); } catch { return {}; } };
// l'avancement d'un lot de liens (outils/copier-lot.mjs) : chaque étape d'un compte laisse un fichier dans _styles/tt-<compte>/
const ETAPES_LOT = ['téléchargé', 'mesuré', 'son mesuré', 'images décrites', 'règles', 'fiche', 'fini'];
export function lot(d) {
  const B = join(STYLES, '_lots'); let ds = []; try { ds = readdirSync(B).filter(x => existsSync(join(B, x, 'meta.json'))).sort(); } catch {}
  d = ds.includes(d) ? d : ds.at(-1); if (!d) return { aucun: true };
  const M = JSON.parse(readFileSync(join(B, d, 'meta.json'), 'utf8')), jf = join(B, d, 'journal.txt'), J = existsSync(jf) ? readFileSync(jf, 'utf8').split('\n').filter(Boolean) : [];
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const comptes = Object.entries(M.comptes).map(([c, ids]) => {
    const nom = 'tt-' + slug(c), D = join(STYLES, nom), n = Math.min(7, ids.length), f = lireFiche(nom), refs = existsSync(join(D, 'refs')) ? readdirSync(join(D, 'refs')) : [];
    const a = x => refs.filter(r => existsSync(join(D, 'refs', r, x))).length, src = existsSync(join(D, 'sources')) ? readdirSync(join(D, 'sources')).length : 0;
    const fini = refs.length > 0 && refs.every(r => existsSync(join(D, 'refs', r, 'images', '.elague')));
    const etape = fini ? 6 : f.auto?.titre ? 5 : existsSync(join(D, 'regles.md')) ? 4 : a('descriptions.json') >= n ? 3 : a('son.json') >= n ? 2 : a('mesures.json') >= n ? 1 : src >= n ? 0 : -1;
    const erreur = J.filter(l => l.includes(`✗ @${c} `)).at(-1) || null, dernier = J.filter(l => l.includes(`@${c} `)).at(-1) || null;
    const V = M.videos.filter(v => ids.includes(v.id));
    return { compte: c, nom, videos: ids.length, vues: V.map(v => v.view_count || 0).sort((x, y) => x - y)[V.length >> 1], etape, etat: etape < 0 ? 'en attente' : ETAPES_LOT[etape], titre: f.auto?.titre || null, famille: f.auto?.famille || null,
      erreur: fini || !erreur || erreur !== dernier ? null : erreur, dernier: dernier?.replace(/^\S+ /, ''), heure: dernier?.split(' ')[0] || null };
  });
  // durée moyenne d'un compte fini (journal : première et dernière ligne de chaque compte) -> fin estimée (deux comptes à la fois)
  const sec = h => { const [a, b, c] = h.split(':').map(Number); return a * 3600 + b * 60 + c; }, durees = [];
  for (const c of comptes.filter(x => x.etape === 6)) { const L = J.filter(l => l.includes(`@${c.compte} `)); if (L.length > 1) { let s = sec(L.at(-1).split(' ')[0]) - sec(L[0].split(' ')[0]); if (s < 0) s += 86400; durees.push(s); } }
  const moy = durees.length ? durees.reduce((x, y) => x + y, 0) / durees.length : null, reste = comptes.filter(c => c.etape < 6 && !c.erreur).length;
  const actif = J.length && (Date.now() - statSync(jf).mtimeMs) < 20 * 60e3;
  return { lot: d, lots: ds, etapes: ETAPES_LOT, comptes, faits: comptes.filter(c => c.etape === 6).length, erreurs: comptes.filter(c => c.erreur).length, total: comptes.length,
    minutes_par_compte: moy && Math.round(moy / 60), fin_estimee: moy && actif ? Date.now() + reste * moy / 2 * 1000 : null, actif, journal: J.slice(-12) };
}
