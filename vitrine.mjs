// vitrine.mjs : une page EN LECTURE SEULE à partager (ex. par un tunnel Cloudflare) : l'avancement du lot de DA et les fiches des DA finies.
//   node vitrine.mjs [--port 5171]        puis   cloudflared tunnel --url http://127.0.0.1:5171
// Jamais le studio lui-même (il lance Claude, lit des fichiers, rend des vidéos). Ici : GET seulement, trois adresses, aucun chemin de fichier,
// aucune vidéo (seulement les images clés), pas le journal (il contient des chemins du PC).
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { lot, lireFiche, STYLES } from './lib/lot.mjs';

const PORT = +(process.argv[process.argv.indexOf('--port') + 1] || 0) || 5171;
const fini = c => c.etape === 6;
function donnees() {
  const L = lot(); if (L.aucun) return { aucun: true };
  return { lot: L.lot, faits: L.faits, total: L.total, erreurs: L.erreurs, actif: L.actif, fin_estimee: L.fin_estimee, minutes_par_compte: L.minutes_par_compte, etapes: L.etapes,
    comptes: L.comptes.map(c => ({ compte: c.compte, videos: c.videos, vues: c.vues, etape: c.etape, etat: c.erreur ? 'erreur, sera refait' : c.etat, titre: c.titre, famille: c.famille })),
    das: L.comptes.filter(fini).map(c => { const f = lireFiche(c.nom), a = f.auto || {}; let compte = '';
      try { compte = readFileSync(join(STYLES, c.nom, 'compte.md'), 'utf8'); } catch {}
      return { nom: c.nom, compte: c.compte, titre: a.titre, famille: a.famille, en_bref: a.en_bref || [], tags: a.tags || [], pour: a.pour || '', look: a.look || {}, pour_refaire: a.pour_refaire || [], images: (a.apercu || []).length, compte_md: compte.replace(/^# .*\n/, '') }; }) };
}

createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  const u = new URL(req.url, 'http://x'), p = u.pathname;
  const ent = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' };
  if (p === '/') { res.writeHead(200, { ...ent, 'Content-Type': 'text/html; charset=utf-8' }); return res.end(PAGE); }
  if (p === '/api') { res.writeHead(200, { ...ent, 'Content-Type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify(donnees())); }
  const m = /^\/img\/(tt-[a-z0-9-]+)\/(\d+)$/.exec(p);   // la n-ième image clé d'une DA finie du lot, rien d'autre
  if (m) {
    const L = lot(), c = !L.aucun && L.comptes.find(x => x.nom === m[1] && fini(x)), ap = c ? lireFiche(c.nom).auto?.apercu || [] : [], rel = ap[+m[2]];
    const f = rel && resolve(STYLES, c.nom, rel);
    if (f && f.startsWith(resolve(STYLES, c.nom) + sep) && /\.jpe?g$/i.test(f) && existsSync(f)) { res.writeHead(200, { ...ent, 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=3600' }); return createReadStream(f).pipe(res); }
  }
  res.writeHead(404, ent); res.end();
}).listen(PORT, '127.0.0.1', () => console.log(`vitrine (lecture seule) : http://127.0.0.1:${PORT}`));

const PAGE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Studio · copie des DA</title>
<style>
:root{--fond:#111214;--panneau:#1a1c20;--bord:#2a2d33;--texte:#e8e8ea;--discret:#9a9ca3;--accent:#ffd23f;--ok:#4cd38a;--rouge:#ff7b7b}
*{box-sizing:border-box}body{margin:0;background:var(--fond);color:var(--texte);font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:28px 0 10px}.discret{color:var(--discret)}
.bloc{background:var(--panneau);border:1px solid var(--bord);border-radius:12px;padding:14px 16px;margin:14px 0}
.barre{height:12px;background:var(--bord);border-radius:6px;overflow:hidden}.barre div{height:100%;background:var(--accent);transition:width .6s}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.carte{background:var(--panneau);border:1px solid var(--bord);border-radius:10px;overflow:hidden;cursor:pointer}.carte:hover{border-color:#555}
.carte .im{aspect-ratio:9/16;background:#000 center/cover no-repeat}.carte .c{padding:8px 10px}.carte b{font-size:13px;display:block}.carte span{font-size:11px;color:var(--discret)}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{padding:6px;border-bottom:1px solid #1f2126;text-align:left;vertical-align:top}th{color:var(--discret);font-weight:500}
.p{display:inline-flex;gap:3px;margin-right:6px;vertical-align:middle}.p i{width:8px;height:8px;border-radius:50%;background:var(--bord)}.p i.on{background:var(--accent)}tr.ok .p i.on{background:var(--ok)}tr.ok td:first-child{color:var(--ok)}tr.en td:first-child{color:var(--accent);font-weight:600}
dialog{background:var(--panneau);color:var(--texte);border:1px solid var(--bord);border-radius:14px;max-width:900px;width:calc(100% - 24px);padding:18px}dialog::backdrop{background:#000b}
.ims{display:flex;gap:6px;overflow-x:auto;margin:10px 0}.ims img{height:260px;border-radius:6px}
.md h1,.md h2,.md h3{font-size:15px;margin:16px 0 6px}.md table{margin:8px 0}.puce{display:inline-block;background:var(--bord);border-radius:10px;padding:1px 8px;font-size:12px;margin:2px}
button{background:var(--bord);color:var(--texte);border:0;border-radius:8px;padding:6px 12px;cursor:pointer}
@media (max-width:600px){.cache-mobile{display:none}.ims img{height:200px}}
</style></head><body><main>
<h1>Copie des directions artistiques</h1><p class="discret">Un studio vidéo maison copie le style de vidéos TikTok, compte par compte : montage, caméra, son, look, et la « niche » de chaque compte. Page en lecture seule, mise à jour toute seule.</p>
<div id="app" class="discret">Chargement…</div></main>
<dialog id="d"><div id="dc"></div><p><button onclick="d.close()">Fermer</button></p></dialog>
<script>
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const md=t=>{const L=esc(t).split('\\n');let h='',tab=false;for(const l of L){if(/^\\|/.test(l)){if(/^\\|[-| :]+\\|$/.test(l))continue;const c=l.split('|').slice(1,-1);h+=(tab?'':'<table>')+'<tr>'+c.map(x=>'<td>'+x.trim()+'</td>').join('')+'</tr>';tab=true;continue}if(tab){h+='</table>';tab=false}
 if(/^#+ /.test(l))h+='<h3>'+l.replace(/^#+ /,'')+'</h3>';else if(/^\\s*[-*] /.test(l))h+='<div>• '+l.replace(/^\\s*[-*] /,'')+'</div>';else if(/^\\d+\\. /.test(l))h+='<div>'+l+'</div>';else if(l.trim())h+='<p>'+l+'</p>'}
 if(tab)h+='</table>';return h.replace(/\\*\\*(.+?)\\*\\*/g,'<b>$1</b>').replace(/\\*(.+?)\\*/g,'<i>$1</i>')};
let D=null;
async function charger(){try{D=await fetch('/api').then(r=>r.json())}catch{return}dessiner()}
function dessiner(){const a=document.getElementById('app');if(D.aucun){a.textContent='Aucune copie en cours.';return}
 const pc=Math.round(100*D.comptes.reduce((s,c)=>s+c.etape+1,0)/(D.total*D.etapes.length)),h=t=>new Date(t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 a.className='';a.innerHTML='<div class="bloc"><div class="barre"><div style="width:'+pc+'%"></div></div><p style="margin:10px 0 0"><b>'+pc+' %</b> · '+D.faits+' / '+D.total+' comptes finis · '+(D.actif?'<span style="color:var(--ok)">● en cours</span>':'○ en pause')+(D.fin_estimee?' · fin estimée vers <b>'+h(D.fin_estimee)+'</b>':'')+'</p></div>'
 +'<h2>Les DA déjà copiées ('+D.das.length+')</h2><div class="grille">'+D.das.map((x,i)=>'<div class="carte" data-i="'+i+'"><div class="im" style="background-image:url(/img/'+x.nom+'/'+(x.images>1?1:0)+')"></div><div class="c"><b>'+esc(x.titre)+'</b><span>'+esc(x.famille)+' · @'+esc(x.compte)+'</span></div></div>').join('')+'</div>'
 +'<h2>Tous les comptes</h2><table><tr><th>Compte</th><th class="cache-mobile">Vidéos</th><th class="cache-mobile">Vues</th><th>Étape</th><th class="cache-mobile">DA trouvée</th></tr>'
 +D.comptes.slice().sort((x,y)=>((y.etape>-1&&y.etape<6)-(x.etape>-1&&x.etape<6))||y.etape-x.etape).map(c=>'<tr class="'+(c.etape===6?'ok':c.etape>=0?'en':'')+'"><td>@'+esc(c.compte)+'</td><td class="cache-mobile">'+c.videos+'</td><td class="cache-mobile">'+(c.vues||0).toLocaleString('fr-FR')+'</td><td><span class="p">'+D.etapes.map((e,i)=>'<i class="'+(i<=c.etape?'on':'')+'" title="'+e+'"></i>').join('')+'</span>'+esc(c.etat)+'</td><td class="cache-mobile">'+esc(c.titre||'')+'</td></tr>').join('')+'</table>';
 a.querySelectorAll('.carte').forEach(el=>el.onclick=()=>fiche(D.das[+el.dataset.i]))}
function fiche(x){const L=x.look||{},l=(k,n)=>L[k]?'<p><b>'+n+' :</b> '+esc(L[k])+'</p>':'';
 document.getElementById('dc').innerHTML='<h1>'+esc(x.titre)+'</h1><p class="discret">'+esc(x.famille)+' · copiée de @'+esc(x.compte)+'</p><div class="ims">'+Array.from({length:x.images},(_,i)=>'<img loading="lazy" src="/img/'+x.nom+'/'+i+'">').join('')+'</div>'
 +'<div class="bloc"><b>En bref</b>'+x.en_bref.map(p=>'<p>'+esc(p)+'</p>').join('')+(x.pour?'<p><b>Pour :</b> '+esc(x.pour)+'</p>':'')+'<p>'+x.tags.map(t=>'<span class="puce">'+esc(t)+'</span>').join('')+'</p></div>'
 +'<div class="bloc"><b>Le look</b>'+l('technique','Fabrication')+l('couleurs','Couleurs')+l('typo','Typographie')+l('rendu','Rendu')+l('personnages','Personnages')+l('decors','Décors')+l('mouvement','Mouvement')+l('son','Son')+'</div>'
 +(x.pour_refaire.length?'<div class="bloc"><b>Pour refaire ce style</b><ol>'+x.pour_refaire.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ol></div>':'')
 +(x.compte_md?'<div class="bloc md"><b>Le compte : niche, accroches, chiffres, idées</b>'+md(x.compte_md)+'</div>':'');
 document.getElementById('d').showModal()}
charger();setInterval(charger,20000);
</script></body></html>`;
