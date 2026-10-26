// node .studio/telecharger.mjs <url> <nom.ext> "<licence>" "<auteur>" "<page source>"
// Télécharge une image ou un modèle libre dans assets/img/ ou assets/models/ et note le crédit dans assets/credits.json.
// Seulement Wikimedia Commons et Poly Haven ; licences libres seulement ; aucune donnée perso dans la requête (User-Agent neutre).
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
const P = resolve(import.meta.dirname, '..');
const [url, nom, licence, auteur, source] = process.argv.slice(2);
const stop = m => { console.error('refusé : ' + m); process.exit(1); };
if (!url || !nom || !licence || !source) stop('usage : node .studio/telecharger.mjs <url> <nom.ext> "<licence>" "<auteur>" "<page source>"');
const u = new URL(url); if (u.protocol !== 'https:' || !/(^|\.)(wikimedia\.org|polyhaven\.org|polyhaven\.com)$/.test(u.hostname)) stop('source non permise (Wikimedia Commons ou Poly Haven seulement) : ' + u.hostname);
if (!/^(CC0|CC[- ]?BY([- ]SA)?( [\d.]+)?|domaine public|public domain|PD)/i.test(licence)) stop('licence non libre : ' + licence);
const ext = extname(nom).toLowerCase(), dossier = { '.jpg': 'img', '.jpeg': 'img', '.png': 'img', '.webp': 'img', '.svg': 'img', '.glb': 'models', '.hdr': 'img' }[ext];
if (!dossier || !/^[\w.-]+$/.test(nom)) stop('nom de fichier invalide (lettres, chiffres, - _ . ; extension jpg png webp svg glb hdr) : ' + nom);
const r = await fetch(u, { headers: { 'User-Agent': 'StudioVideo/1.0 (outil local)' }, redirect: 'follow' });
if (!r.ok) stop(`téléchargement impossible (${r.status})`);
const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 30e6) stop('fichier trop gros (> 30 Mo)');
mkdirSync(join(P, 'assets', dossier), { recursive: true }); const f = join(P, 'assets', dossier, nom); writeFileSync(f, buf);
const cf = join(P, 'assets', 'credits.json'), c = existsSync(cf) ? JSON.parse(readFileSync(cf, 'utf8')) : [];
c.push({ fichier: `assets/${dossier}/${nom}`, url, source, licence, auteur: auteur || '', date: new Date().toISOString().slice(0, 10) }); writeFileSync(cf, JSON.stringify(c, null, 1));
console.log(`✓ assets/${dossier}/${nom} (${(buf.length / 1e3).toFixed(0)} ko) — crédit noté. Dans le kit : /assets/${dossier}/${nom}`);
