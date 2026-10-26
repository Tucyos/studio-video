// niches-json.mjs : la synthèse des niches d'un lot (niches.md, écrite par Opus) mise en données pour la page « Idées de niche » -> niches.json
//   node outils/niches-json.mjs <dossier du lot>
// Sonnet convertit sans rien inventer ; le studio relie ensuite chaque compte cité à sa DA (_styles/tt-<compte>).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { claudeJson, objet } from './clone-style.mjs';

export async function nichesJson(L, log = console.log) {
  const tmp = join(tmpdir(), `studio-niches-json-${Date.now()}`); mkdirSync(tmp, { recursive: true });
  try {
    copyFileSync(join(L, 'niches.md'), join(tmp, 'niches.md'));
    log('Sonnet met la synthèse des niches en données');
    const r = await claudeJson('sonnet', `Lis niches.md (Read) : une synthèse des niches de comptes TikTok, écrite pour Noam (comptes « Koan » : psychologie, société ; « Automobile » : sport auto, mécanique, cinéma).
Convertis-la en JSON, fidèlement : ne rien inventer, ne rien résumer davantage, garder les chiffres et les citations tels quels. Les comptes : le pseudo SANS @.
Réponds UNIQUEMENT en JSON :
{"intro": "la note d'introduction (source, limites)",
 "niches": [{"nom": "...", "comptes": ["pseudo"], "vues_mediane": nombre ou null, "nb_videos": nombre ou null, "format": "...", "ce_qui_marche": "..."}],
 "remarques": ["remarques hors tableau (ex. aucun compte cinéma)"],
 "accroches": [{"formule": "...", "exemples": [{"texte": "...", "compte": "pseudo"}]}],
 "structures": [{"nom": "...", "comptes": ["pseudo"], "deroule": "..."}],
 "points_communs": ["..."],
 "pour_toi": [{"compte_noam": "Koan | Automobile | Les deux", "titre": "...", "priorite": 1, "points": ["chaque puce, telle quelle"], "comptes": ["pseudo cités"]}],
 "idees": [{"n": 1, "sujet": "...", "compte_noam": "Koan | Automobile", "niche": "...", "compte_modele": "pseudo", "da": "la DA qui irait, telle quelle"}],
 "avertissement_idees": "la phrase sur les faits à vérifier"}`, tmp, 'low', objet);
    writeFileSync(join(L, 'niches.json'), JSON.stringify(r.o, null, 1));
    log(`✓ ${join(L, 'niches.json')} : ${r.o.niches?.length} niches, ${r.o.idees?.length} idées, ≈ ${r.cout.toFixed(2)} $ API`); return r.o;
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
if (process.argv[1] && import.meta.filename === process.argv[1]) await nichesJson(process.argv[2]);
