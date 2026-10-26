// pages.js : la navigation (barre de gauche, espaces Koan / Automobile, Ctrl K) et les pages hors éditeur.
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const api = (u, o) => fetch('/__api/' + u, o && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).then(r => r.json());
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const nb = (x, d = 0) => x == null ? '-' : Number(x).toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d });
const date = ms => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' + new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const toast = (m, d = 2500) => { const e = $('#toast'); e.textContent = m; e.hidden = false; clearTimeout(e._t); e._t = setTimeout(() => e.hidden = true, d); };
// petit rendu Markdown (titres, listes, gras, code) pour les styles et la mémoire
export function md(t) {
  const lignes = esc(t).split('\n'); let h = '', liste = false, table = false;
  const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[\[(.+?)\]\]/g, '<i>$1</i>');
  for (const l of lignes) {
    if (/^\s*\|/.test(l)) {   // tableau (page de règles d'un style copié)
      if (/^\s*\|[\s|:-]+\|\s*$/.test(l)) continue;
      const c = l.trim().replace(/^\||\|$/g, '').split('|').map(x => inline(x.trim()));
      h += (table ? '' : '<table class="regles"><thead>') + `<tr>${c.map(x => table ? `<td>${x}</td>` : `<th>${x}</th>`).join('')}</tr>` + (table ? '' : '</thead><tbody>'); table = true; continue;
    }
    if (table) { h += '</tbody></table>'; table = false; }
    const m = /^(#{1,4}) (.*)/.exec(l), li = /^\s*[-*] (.*)/.exec(l);
    if (li) { if (!liste) { h += '<ul>'; liste = true; } h += `<li>${inline(li[1])}</li>`; continue; }
    if (liste) { h += '</ul>'; liste = false; }
    if (m) h += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; else if (l.trim()) h += `<p>${inline(l)}</p>`;
  }
  return h + (liste ? '</ul>' : '') + (table ? '</tbody></table>' : '');
}

// ================= espaces, barre de gauche =================
let PROJET = null, CATALOGUE = null;
const ESPACES = { Koan: { compte: 'koan', style: 'da-koan' }, Automobile: { compte: 'matoumecano', style: 'da-auto' } };
const lire = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, ecrire = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
let espace = lire('espace', null);
const majChaine = () => { $('#chaineAv').textContent = espace[0]; $('#chaineNom').textContent = espace; $('#bChaine').title = `${espace} · passer à ${espace === 'Koan' ? 'Automobile' : 'Koan'}`; };
function choisirEspace(e) { espace = e; ecrire('espace', e); majChaine(); route(); }
$('#bChaine').onclick = () => choisirEspace(espace === 'Koan' ? 'Automobile' : 'Koan');
// la barre : dépliée ou rangée (icônes seules). Sans choix de Noam : rangée dans l'éditeur, dépliée ailleurs ; un clic ou Ctrl B fixe son choix.
function barre(deplie) { document.body.classList.toggle('deplie', deplie); const b = $('#bDeplier'), t = deplie ? 'Ranger la barre (Ctrl B)' : 'Déplier la barre (Ctrl B)'; b.title = t; b.setAttribute('aria-label', t.replace(' (Ctrl B)', '')); dispatchEvent(new Event('resize')); }
const basculerBarre = () => { const d = !document.body.classList.contains('deplie'); ecrire('barre', d ? 'depliee' : 'rangee'); barre(d); };
$('#bDeplier').onclick = basculerBarre;
addEventListener('keydown', e => { if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'b' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); basculerBarre(); } }, true);

// ================= routes =================
const PAGES = { accueil, projets, styles, memoire, bibliotheque, couvertures, rendus, stats, reglages, lot, niches };
async function route() {
  const nom = (location.hash.slice(2) || (PROJET?.aucun ? 'projets' : 'editeur')).split('?')[0];
  $$('.page').forEach(p => p.classList.toggle('vue', p.dataset.page === nom));
  $$('#rail a.lien').forEach(a => a.classList.toggle('actif', a.dataset.g === (GROUPE[nom] || nom)));
  const choix = lire('barre', null); barre(choix ? choix === 'depliee' : nom !== 'editeur');
  if (nom === 'editeur') return;
  const sec = $(`.page[data-page="${nom}"]`); if (sec && PAGES[nom]) { sec.innerHTML = '<div class="contenu discret">Chargement…</div>'; await PAGES[nom](sec);
    if (BIBLIO[nom]) sec.querySelector('.contenu')?.insertAdjacentHTML('afterbegin', `<nav class="onglets-biblio" aria-label="La bibliothèque">${Object.entries(BIBLIO).map(([k, l]) => `<a href="#/${k}" class="${k === nom ? 'actif' : ''}">${l}</a>`).join('')}</nav>`); }
}
const GROUPE = { editeur: 'projets', niches: 'idees', styles: 'bibliotheque', bibliotheque: 'bibliotheque', memoire: 'bibliotheque', lot: 'bibliotheque', couvertures: 'bibliotheque', rendus: 'bibliotheque' };
const BIBLIO = { styles: 'DA', bibliotheque: 'Modèles 3D', memoire: 'Règles retenues', lot: 'Copies en cours', couvertures: 'Couvertures', rendus: 'Rendus' };
addEventListener('hashchange', route);

// ================= Accueil =================
async function accueil(sec) {
  const [cat, rd] = await Promise.all([catalogue(), api('rendus?tous')]), mes = cat.filter(p => !espace || p.espace === espace);
  const st = await api('stats?compte=' + ESPACES[espace || 'Koan'].compte).catch(() => null), v = st?.videos || [];
  const semaine = v.filter(x => Date.now() - new Date(x.published_at) < 7 * 864e5);
  sec.innerHTML = `<div class="contenu">
    <div class="tete"><h1>Bonjour Noam</h1><span class="chip">${esc(espace || 'tous les comptes')}</span><span class="espace"></span><button class="primaire" onclick="document.querySelector('#bNouveau').click()">＋ Nouveau projet</button></div>
    ${PROJET && !PROJET.aucun ? `<div class="bloc"><h3>En cours</h3><div style="display:flex;gap:14px;align-items:center">
      <div><b style="font-size:16px">${esc(PROJET.titre)}</b><div class="discret">${esc(PROJET.projet)}</div>
      <div style="margin-top:6px">${PROJET.rapport ? `Dernier contrôle : <b style="color:var(--grave)">${Object.values(PROJET.rapport.compte).reduce((a, c) => a + c.grave, 0)} grave(s)</b>, ${Object.values(PROJET.rapport.compte).reduce((a, c) => a + c.moyen, 0)} moyen(s)` : 'Pas encore contrôlé'}</div></div>
      <span class="espace"></span><a href="#/editeur"><button class="primaire">Ouvrir l'éditeur</button></a></div></div>` : ''}
    <div class="kpis">
      <div class="kpi"><div class="v">${nb(v.length)}</div><div class="l">vidéos suivies (${esc(espace || 'Koan')})</div></div>
      <div class="kpi"><div class="v">${nb(v.reduce((a, x) => a + (x.views || 0), 0))}</div><div class="l">vues au total</div></div>
      <div class="kpi"><div class="v">${nb(semaine.reduce((a, x) => a + (x.views || 0), 0))}</div><div class="l">vues des vidéos de la semaine</div></div>
      <div class="kpi"><div class="v">${nb(v.reduce((a, x) => a + (x.rewards_total || 0), 0), 2)} €</div><div class="l">récompenses au total</div></div>
    </div>
    <h3 style="margin-left:0">Projets récents</h3><div class="grille">${mes.slice(0, 6).map(carteProjet).join('')}</div>
    <h3 style="margin:20px 0 6px">Derniers rendus</h3><div class="grille">${rd.filter(r => r.type !== 'image' && mes.some(p => p.nom === r.projet)).slice(0, 6).map(carteRendu).join('') || '<p class="discret">Aucun rendu.</p>'}</div>
  </div>`;
  brancherCartes(sec, cat, rd);
}

// ================= Projets =================
async function catalogue() { return CATALOGUE ||= await api('catalogue'); }
const carteProjet = p => `<div class="carte" data-projet="${esc(p.chemin)}"><div class="vign ${p.couverture ? '' : 'vide'}" style="${p.couverture ? `background-image:url('${p.couverture}')` : ''}">${p.couverture ? '' : '🎬'}
  <div class="tags">${p.final ? '<span class="tag vert">livré</span>' : ''}${p.lectureSeule ? '<span class="tag">tiktok-motion</span>' : '<span class="tag jaune">studio</span>'}${p.copie ? '<span class="tag jaune">copie</span>' : ''}</div></div>
  <div class="corps"><b>${esc(p.titre || p.nom)}</b><div class="meta">${esc(p.espace || '?')} · ${p.pages.length} scène(s) · ${p.mp4} vidéo(s) · ${date(p.date)}</div></div></div>`;
// l'état d'un projet, en mots : ce qui compte pour Noam (ouvert, livré, exporté, brouillon, ancienne vidéo)
const etatProjet = p => p.chemin === PROJET?.projet?.replace(/\\/g, '/') ? ['ouvert dans l\u2019éditeur', 'ok'] : p.final ? ['livrée', 'ok'] : p.lectureSeule ? ['ancienne vidéo · lecture seule', ''] : p.mp4 ? ['exportée', ''] : ['brouillon', ''];
async function projets(sec) {
  const cat = await catalogue(), ouvert = PROJET && !PROJET.aucun ? cat.find(p => p.chemin === PROJET.projet?.replace(/\\/g, '/')) : null;
  sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Projets</h1><span class="segment" id="fEsp"><button data-e="">Tous</button><button data-e="Koan">Koan</button><button data-e="Automobile">Automobile</button></span>
    <input id="fQ" placeholder="Chercher un projet" aria-label="Chercher un projet"><span class="espace"></span><button class="primaire" onclick="document.querySelector('#bNouveau').click()">＋ Nouveau projet</button></div>
    ${ouvert ? `<div class="bloc projet-ouvert"><span class="vign-p" style="${ouvert.couverture ? `background-image:url('${ouvert.couverture}')` : ''}"></span><div><b>${esc(ouvert.titre || ouvert.nom)}</b><div class="discret">Ouvert dans l\u2019éditeur · ${esc(ouvert.espace || '')}</div></div><span class="espace"></span><a href="#/editeur"><button>Reprendre</button></a></div>` : ''}
    <table class="liste-projets"><thead><tr><th>Vidéo</th><th>Chaîne</th><th>État</th><th class="n">Modifiée</th><th></th></tr></thead><tbody id="gProjets"></tbody></table>
    <p class="discret petit">Les vidéos de tiktok-motion s\u2019ouvrent en lecture seule : « Copier dans le studio » pour les modifier.</p></div>`;
  let fe = espace || '';
  const dessiner = () => { const q = $('#fQ').value.toLowerCase(), L = cat.filter(p => (!fe || p.espace === fe) && (p.nom + ' ' + (p.titre || '')).toLowerCase().includes(q));
    $('#gProjets').innerHTML = L.map(p => { const [e, c] = etatProjet(p); return `<tr class="clic" data-projet="${esc(p.chemin)}" tabindex="0"><td><span class="vign-p" style="${p.couverture ? `background-image:url('${p.couverture}')` : ''}"></span>${esc(p.titre || p.nom)}</td><td>${esc(p.espace || '–')}</td><td><span class="tag ${c === 'ok' ? 'vert' : ''}">${e}</span></td><td class="n">${date(p.date)}</td><td class="n discret">›</td></tr>`; }).join('')
      || '<tr><td colspan="5" class="discret">Aucun projet ne correspond.</td></tr>';
    $$('#fEsp button').forEach(b => b.classList.toggle('actif', b.dataset.e === fe)); brancherCartes(sec, cat);
    sec.querySelectorAll('tr[data-projet]').forEach(r => r.onkeydown = e => { if (e.key === 'Enter') r.click(); }); };
  $('#fQ').oninput = dessiner; $$('#fEsp button').forEach(b => b.onclick = () => { fe = b.dataset.e; dessiner(); }); dessiner();
}
function brancherCartes(sec, cat, rd) {
  sec.querySelectorAll('[data-projet]').forEach(c => c.onclick = () => ouvrirProjet(cat.find(p => p.chemin === c.dataset.projet)));
  sec.querySelectorAll('[data-rendu]').forEach(c => c.onclick = () => voirRendu(rd.find(r => r.chemin === c.dataset.rendu)));
}
async function ouvrirProjet(p) {
  let page = null;
  if (!p.pages.length) toast('Ce projet n\'a pas encore de scène : il s\'ouvre quand même (pipeline, script…)', 4000);
  else if (p.pages.length > 1 && !p.pages.includes('scenes/film.html')) {   // projets Koan : une page par séquence
    page = await choisir(`Quelle séquence de « ${p.titre || p.nom} » ?`, p.pages); if (!page) return;
  }
  const r = await api('ouvrir', { chemin: p.chemin, page }); if (r.erreur) return toast(r.erreur);
  location.hash = '#/editeur'; location.reload();
}
function choisir(titre, options) { return new Promise(ok => { const d = $('#dTexte'); $('#tTitre').textContent = titre;
  $('#tCorps').innerHTML = `<ul class="liste">${options.map(o => `<li data-o="${esc(o)}">${esc(o)}</li>`).join('')}</ul>`;
  $('#tCorps').querySelectorAll('li').forEach(li => li.onclick = () => { d.close(); ok(li.dataset.o); }); $('#tFermer').onclick = () => { d.close(); ok(null); }; d.showModal(); }); }

// ================= Rendus =================
const taille = o => o > 1e9 ? nb(o / 1e9, 2) + ' Go' : nb(o / 1e6, 1) + ' Mo';
const carteRendu = r => `<div class="carte" data-rendu="${esc(r.chemin)}"><div class="vign" style="${r.type === 'image' || r.type === 'couverture' ? `background-image:url('${r.url}')` : ''}">${r.type === 'image' || r.type === 'couverture' ? '' : `<video src="${r.url}#t=1" preload="metadata" muted style="width:100%;height:100%;object-fit:cover"></video>`}
  <div class="tags"><span class="tag jaune">${esc(r.type)}</span></div></div><div class="corps"><b>${esc(r.nom)}</b><div class="meta">${esc(r.projet)} · ${taille(r.taille)} · ${date(r.date)}</div></div></div>`;
async function rendus(sec) {
  let tous = false, rd = await api('rendus');
  const dessiner = async () => { sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Rendus</h1><span class="discret">${tous ? 'tous les projets (les 120 derniers)' : 'projet ouvert : ' + esc(PROJET?.nom || '')}</span><span class="espace"></span>
    <span class="segment"><button data-t="0" class="${tous ? '' : 'actif'}">Projet ouvert</button><button data-t="1" class="${tous ? 'actif' : ''}">Tous les projets</button></span></div>
    <div class="grille">${rd.map(carteRendu).join('') || '<p class="discret">Aucun rendu pour ce projet.</p>'}</div></div>`;
    sec.querySelectorAll('.segment button').forEach(b => b.onclick = async () => { tous = b.dataset.t === '1'; rd = await api('rendus' + (tous ? '?tous' : '')); dessiner(); }); brancherCartes(sec, [], rd); };
  dessiner();
}
function voirRendu(r) {
  const d = $('#dVideo'), v = $('#vLecteur'), im = $('#vImage'), image = /\.png$/i.test(r.nom);
  $('#vTitre').textContent = `${r.nom} · ${taille(r.taille)}`; v.hidden = image; im.hidden = !image;
  if (image) im.src = r.url; else { v.src = r.url; v.play().catch(() => {}); }
  $('#vDossier').onclick = () => api('dossier', { chemin: r.chemin.replace(/\/[^/]*$/, '') });
  $('#vFermer').onclick = () => { v.pause(); d.close(); }; d.onclose = () => v.pause(); d.showModal();
}

// ================= Statistiques =================
async function stats(sec) {
  let compte = ESPACES[espace || 'Koan'].compte, tri = 'published_at', sens = -1, sel = null;
  const charger = async () => {
    const st = await api('stats?compte=' + compte); if (st.erreur) { sec.innerHTML = `<div class="contenu"><p>${esc(st.erreur)}</p></div>`; return; }
    const v = st.videos, som = k => v.reduce((a, x) => a + (x[k] || 0), 0), avecFin = v.filter(x => x.finish_rate != null);
    const vq = v.filter(x => x.rpm != null && x.rewards_total != null);
    const cols = [['published_at', 'Publiée'], ['description', 'Vidéo'], ['duration_s', 'Durée', 1], ['views', 'Vues', 1], ['likes', 'J\'aime', 1], ['shares', 'Partages', 1], ['saves', 'Favoris', 1], ['finish_rate', 'Vue jusqu\'au bout', 1], ['avg_watch_time_s', 'Temps moyen', 1], ['rewards_total', 'Récompenses', 1], ['rpm', 'RPM', 1]];
    v.sort((a, b) => { const x = a[tri], y = b[tri]; return (x == null) - (y == null) || (x > y ? 1 : x < y ? -1 : 0) * sens; });
    const fmt = (k, x) => x[k] == null ? '-' : k === 'published_at' ? new Date(x[k]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(new Date(x[k]).getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}) }) : k === 'finish_rate' ? nb(x[k] * (x[k] <= 1 ? 100 : 1), 1) + ' %'
      : k === 'avg_watch_time_s' || k === 'duration_s' ? nb(x[k], 1) + ' s' : k === 'rewards_total' ? nb(x[k], 2) + ' €' : k === 'rpm' ? nb(x[k], 2) + ' €' : k === 'description' ? esc(x[k]) : nb(x[k]);
    sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Statistiques TikTok</h1><span class="segment">${st.comptes.map(c => `<button data-c="${c.name}" class="${c.name === compte ? 'actif' : ''}">${esc(c.nickname)}</button>`).join('')}</span>
      <span class="espace"></span><span class="discret">base locale de tiktok-tracker${st.maj ? ' · ' + esc(st.maj) : ''} · « - » = donnée manquante</span></div>
      <div class="kpis"><div class="kpi"><div class="v">${nb(v.length)}</div><div class="l">vidéos</div></div><div class="kpi"><div class="v">${nb(som('views'))}</div><div class="l">vues</div></div>
        <div class="kpi"><div class="v">${nb(som('likes'))}</div><div class="l">j'aime</div></div>
        <div class="kpi"><div class="v">${avecFin.length ? nb(avecFin.reduce((a, x) => a + x.finish_rate * (x.finish_rate <= 1 ? 100 : 1), 0) / avecFin.length, 1) + ' %' : '-'}</div><div class="l">vue jusqu'au bout (moyenne)</div></div>
        <div class="kpi"><div class="v">${nb(som('rewards_total'), 2)} €</div><div class="l">récompenses</div></div>
        <div class="kpi"><div class="v">${vq.length ? nb(vq.reduce((a, x) => a + x.rewards_total, 0) / Math.max(1, vq.reduce((a, x) => a + x.rewards_total / x.rpm * 1000, 0)) * 1000, 2) + ' €' : '-'}</div><div class="l">RPM moyen (pondéré)</div></div></div>
      <div class="bloc" id="detail" ${sel ? '' : 'hidden'}></div>
      <div class="bloc" style="padding:0;overflow:auto;max-height:calc(100vh - 330px)"><table><thead><tr>${cols.map(([k, l, n]) => `<th data-k="${k}" class="${n ? 'n' : ''}">${l}${tri === k ? (sens > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead>
      <tbody>${v.map(x => `<tr class="lig ${sel === x.video_id ? 'sel' : ''}" data-v="${x.video_id}">${cols.map(([k, , n]) => `<td class="${n ? 'n' : ''} ${k === 'description' ? 'desc' : ''}">${fmt(k, x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    sec.querySelectorAll('.segment button').forEach(b => b.onclick = () => { compte = b.dataset.c; sel = null; charger(); });
    sec.querySelectorAll('th').forEach(th => th.onclick = () => { sens = tri === th.dataset.k ? -sens : -1; tri = th.dataset.k; charger(); });
    sec.querySelectorAll('tr.lig').forEach(tr => tr.onclick = () => { sel = tr.dataset.v; detail(v.find(x => x.video_id === sel)); sec.querySelectorAll('tr.lig').forEach(t => t.classList.toggle('sel', t === tr)); });
    if (sel) detail(v.find(x => x.video_id === sel));
  };
  async function detail(x) {
    const d = $('#detail'); d.hidden = false; const c = await api('courbe?video=' + x.video_id);
    const W = 640, H = 170, max = Math.max(1, ...c.map(p => p.value)), dur = Math.max(1, ...c.map(p => p.second));
    const pts = c.map(p => `${(p.second / dur * W).toFixed(1)},${(H - p.value / max * H).toFixed(1)}`).join(' ');
    d.innerHTML = `<div style="display:flex;gap:20px;align-items:flex-start"><div style="flex:1"><b>${esc(x.description)}</b><div class="discret" style="margin:4px 0 10px">${nb(x.views)} vues · ${x.finish_rate == null ? '-' : nb(x.finish_rate * (x.finish_rate <= 1 ? 100 : 1), 1) + ' %'} jusqu'au bout · temps moyen ${x.avg_watch_time_s == null ? '-' : nb(x.avg_watch_time_s, 1) + ' s'} sur ${nb(x.duration_s, 1)} s · <a href="${esc(x.url)}" target="_blank" style="color:var(--accent)">ouvrir sur TikTok</a></div>
      ${c.length ? `<h3 style="margin:0 0 4px">Rétention (part des spectateurs encore là, seconde par seconde)</h3><svg viewBox="0 -6 ${W} ${H + 24}" style="width:100%;max-width:${W}px;height:auto">
        <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#2a2c31"/><line x1="0" y1="0" x2="${W}" y2="0" stroke="#2a2c31" stroke-dasharray="3 4"/>
        <polyline points="${pts}" fill="none" stroke="#ffd23f" stroke-width="2.2"/><text x="0" y="${H + 16}" fill="#8b8d94" font-size="11">0 s</text><text x="${W}" y="${H + 16}" fill="#8b8d94" font-size="11" text-anchor="end">${nb(dur)} s</text>
        <text x="4" y="10" fill="#8b8d94" font-size="11">${nb(max * (max <= 1 ? 100 : 1))} %</text></svg>` : '<p class="discret">Pas de courbe de rétention pour cette vidéo.</p>'}</div></div>`;
  }
  charger();
}

// ================= Styles, Mémoire, Couvertures, Réglages =================
// ================= bibliothèque de DA : DA (classées par famille) et inspirations (idées tirées de vidéos de créateurs) =================
const FAMILLES_DA = ['3D réaliste', '3D stylisée', 'Pixel art', 'Papier et illustration', '2D vectorielle', 'Collage', 'Écran et typographie', 'Impression'];
const STATUT_DA = { validée: ['validée', 'vert'], utilisée: ['utilisée', 'bleu'], aimée: ['aimée', 'jaune'], testée: ['essai', ''], rejetée: ['rejetée', 'rouge'], idée: ['jamais faite', ''], exemple: ['exemple Creatorize', 'violet'], copiée: ['copiée', ''] };
const ORIGINES_DA = [['', 'Toutes origines'], ['tes', 'Tes vidéos'], ['crz', 'Exemples Creatorize'], ['copie', 'Copiées de vidéos']];
let genreDA = 'da', familleDA = '', origineDA = '', chercheDA = '';
const origineDe = s => s.id.startsWith('crz-') ? 'crz' : (s.origine || '').startsWith('Tes vidéos') ? 'tes' : 'copie';
const imageDe = s => s.fiche?.exemples?.find(e => !e.video)?.url || s.fiche?.auto?.apercu?.[0] || null;
async function styles(sec, ouvrir) {
  const L = await api('styles');
  const vis = () => L.filter(s => s.genre === genreDA && (!familleDA || s.famille === familleDA) && (!origineDA || origineDe(s) === origineDA)
    && (!chercheDA || [s.titre, s.famille, s.description, s.origine, s.statut, ...(s.fiche?.auto?.tags || []), ...(s.fiche?.tags || []), s.fiche?.notes, s.fiche?.verdict].join(' ').toLowerCase().includes(chercheDA)));
  const fams = [...FAMILLES_DA, ...new Set(L.map(s => s.famille))].filter((f, i, a) => a.indexOf(f) === i && L.some(s => s.genre === genreDA && s.famille === f));
  const nb = (n, m) => `${n} ${m}${n > 1 ? 's' : ''}`, nDA = L.filter(s => s.genre === 'da').length, nInsp = L.length - nDA;
  sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Bibliothèque de DA</h1><p class="discret">Les directions artistiques, rangées par famille : celles de tes vidéos (validées, utilisées ou seulement essayées), les exemples montrés par Creatorize, et celles copiées depuis des vidéos. Les inspirations sont des vidéos dont on garde les idées, pas un style à suivre. On choisit une DA en créant un projet : Claude et l'équipe lisent son look et ses règles.</p><button class="primaire" id="bCopierStyle">＋ Copier depuis des vidéos</button></div>
    <div class="filtres"><span class="segment" id="daGenre"><button data-g="da" class="${genreDA === 'da' ? 'actif' : ''}">DA <em>${nDA}</em></button><button data-g="inspiration" class="${genreDA === 'inspiration' ? 'actif' : ''}">Inspirations <em>${nInsp}</em></button></span>
      <select id="daOrigine">${ORIGINES_DA.map(([k, l]) => `<option value="${k}" ${k === origineDA ? 'selected' : ''}>${l}</option>`).join('')}</select><input id="daQ" placeholder="Chercher (ex. pixel, nuit, papier, validée)" value="${esc(chercheDA)}"></div>
    <div class="filtres"><span class="segment" id="daFamilles">${[['', 'Toutes les familles'], ...fams.map(f => [f, f])].map(([k, l]) => `<button data-f="${esc(k)}" class="${k === familleDA ? 'actif' : ''}">${esc(l)}</button>`).join('')}</span></div>
    <div id="daGrille"></div></div>`;
  const carte = s => { const im = imageDe(s), st = STATUT_DA[s.statut] || [s.statut, ''];
    return `<div class="carte" data-s="${s.id}"><div class="vign ${im ? '' : 'vide'}" ${im ? `style="background-image:url('${im}')"` : ''}>${im ? '' : '✦'}<span class="tags">${st[0] ? `<span class="tag ${st[1]}">${esc(st[0])}</span>` : ''}${s.projets.length ? `<span class="tag vert">${nb(s.projets.length, 'projet')}</span>` : ''}</span></div>
      <div class="corps"><b>${esc(s.titre)}</b><div class="meta">${esc(s.famille)}${s.fiche?.compte ? ' · ' + esc(s.fiche.compte) : ''}</div><div class="meta">${esc(s.origine)}</div></div></div>`; };
  const grille = () => { const V = vis(), G = familleDA ? [familleDA] : [...new Set(V.map(s => s.famille))].sort((a, b) => (FAMILLES_DA.indexOf(a) + 1 || 99) - (FAMILLES_DA.indexOf(b) + 1 || 99));
    $('#daGrille').innerHTML = G.map(f => { const l = V.filter(s => s.famille === f); return l.length ? `<h3 class="famille">${esc(f)} <span class="discret">${l.length}</span></h3><div class="grille da">${l.map(carte).join('')}</div>` : ''; }).join('') || '<p class="discret">Rien ne correspond.</p>';
    $$('#daGrille .carte').forEach(c => c.onclick = () => ficheDA(sec, L.find(s => s.id === c.dataset.s))); };
  $$('#daGenre button').forEach(b => b.onclick = () => { genreDA = b.dataset.g; familleDA = ''; styles(sec); });
  $$('#daFamilles button').forEach(b => b.onclick = () => { familleDA = b.dataset.f; $$('#daFamilles button').forEach(x => x.classList.toggle('actif', x === b)); grille(); });
  $('#daOrigine').onchange = e => { origineDA = e.target.value; grille(); };
  $('#daQ').oninput = e => { chercheDA = e.target.value.toLowerCase().trim(); grille(); };
  $('#bCopierStyle').onclick = () => copierStyle(null, () => styles(sec));
  grille();
  const o = ouvrir && L.find(s => s.id === ouvrir); if (o) ficheDA(sec, o);
  const lt = await api('lot'); if (!lt.aucun && (lt.actif || lt.faits < lt.total) && !o) { const b = document.createElement('a'); b.href = '#/lot'; b.className = 'bloc lot-bandeau'; b.innerHTML = `${lt.actif ? '●' : '○'} Copie des DA du lot ${esc(lt.lot)} : <b>${lt.faits} / ${lt.total}</b> comptes${lt.fin_estimee ? ' · fin estimée vers ' + new Date(lt.fin_estimee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''} — voir l'avancement →`; sec.querySelector('.contenu').insertBefore(b, sec.querySelector('.filtres')); }
}
function ficheDA(sec, s) {
  const f = s.fiche || {}, a = f.auto || {}, lien = /^https?:\/\//.test(f.lien || '') ? f.lien : null, st = STATUT_DA[s.statut] || [s.statut, ''];
  const ex = f.exemples || [], large = a.videos?.some(v => v.format !== '9:16');
  sec.innerHTML = `<div class="contenu da-fiche"><button id="daRetour" class="lienBtn">← Toute la bibliothèque</button>
    <div class="tete"><div><h1>${esc(s.titre)}</h1><p class="discret">${[esc(s.famille), s.genre === 'inspiration' ? 'inspiration' : '', st[0] && `<span class="tag ${st[1]}">${esc(st[0])}</span>`, esc(s.origine), f.compte && 'compte ' + esc(f.compte), f.createur && 'par ' + esc(f.createur), f.pays && esc(f.pays), lien && `<a href="${esc(lien)}" target="_blank" rel="noopener">voir la source ↗</a>`].filter(Boolean).join(' · ')}</p></div>
      <span class="espace"></span><button id="daModifier">Modifier la fiche</button><button id="daAjouter">＋ Vidéos de référence</button>${s.genre === 'da' ? '<button class="primaire" id="daProjet">Créer un projet avec cette DA</button>' : ''}</div>
    ${f.verdict ? `<p class="verdict">${esc(f.verdict)}</p>` : ''}
    ${ex.length ? `<div class="da-exemples">${ex.map(e => e.video ? `<video src="${e.url}" controls muted loop preload="metadata"></video>` : `<a href="${e.url}" target="_blank"><img src="${e.url}" loading="lazy"></a>`).join('')}</div>` : ''}
    ${a.apercu?.length ? `<div class="da-images ${large ? 'large' : ''}">${a.apercu.map(u => `<img src="${u}" loading="lazy">`).join('')}</div><p class="discret petit">Images clés des vidéos de référence (le milieu de chaque moment).</p>` : ''}
    ${!ex.length && !a.apercu?.length ? '<p class="discret">Pas encore d’image pour cette DA.</p>' : ''}
    ${a.en_bref?.length ? `<div class="bloc"><h3>En bref</h3><ul>${a.en_bref.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${a.pour ? `<p><b>Pour :</b> ${esc(a.pour)}</p>` : ''}<p>${(a.tags || []).map(t => `<span class="puce">${esc(t)}</span>`).join(' ')}</p></div>` : ''}
    ${s.textes.da ? `<div class="bloc md">${md(s.textes.da.split('## Où regarder')[0])}</div>` : ''}
    ${f.tags?.length || f.notes ? `<div class="bloc"><h3>Tes notes</h3><p>${(f.tags || []).map(t => `<span class="puce">${esc(t)}</span>`).join(' ')}</p>${f.notes ? `<p style="white-space:pre-wrap">${esc(f.notes)}</p>` : ''}</div>` : ''}
    ${a.videos?.length ? `<div class="bloc"><h3>Vidéos de référence</h3><div class="da-videos">${a.videos.map(v => `<figure class="${v.format === '9:16' ? '' : 'large'}"><video src="${v.url}" controls preload="metadata" ${v.format === '9:16' ? '' : 'data-large'}></video><figcaption>${v.id} · ${esc(v.nom)} · ${v.duree} s${v.langue ? ' · ' + v.langue : ''}</figcaption></figure>`).join('')}</div></div>` : ''}
    <div class="bloc"><h3>Utilisée dans</h3>${f.utilisee?.length ? `<p>Tes vidéos : ${f.utilisee.map(esc).join(', ')}</p>` : ''}${s.projets.length ? `<ul class="liste">${s.projets.map(p => `<li data-p="${esc(p.chemin)}">${esc(p.titre)} <span class="discret">projet du studio</span></li>`).join('')}</ul>` : ''}${!f.utilisee?.length && !s.projets.length ? '<p class="discret">Aucune vidéo pour l’instant.</p>' : ''}</div>
    ${s.textes.compte ? `<details class="bloc" open><summary><b>La DA du compte : niche, accroches, structure, chiffres, idées de sujets</b></summary><div class="md">${md(s.textes.compte.replace(/^# .*\n/, ''))}</div></details>` : ''}
    ${s.textes.skill ? `<details class="bloc"><summary><b>La bible complète de cette DA</b> <span class="discret">— lue par Claude et l'équipe</span></summary><div class="md">${md(s.textes.skill)}</div></details>` : ''}
    ${s.textes.regles ? `<details class="bloc"><summary><b>${s.regles ? `Les ${s.regles} règles chiffrées, avec leurs preuves` : 'Les règles retenues'}</b> <span class="discret">— lues par Claude et l'équipe</span></summary><div class="md">${md(s.textes.regles)}</div></details>` : ''}</div>`;
  $('#daRetour').onclick = () => styles(sec);
  if ($('#daProjet')) $('#daProjet').onclick = () => ouvrirNouveau(s.id, ['Koan', 'Automobile'].includes(f.compte) ? f.compte : null);
  $$('[data-p]').forEach(li => li.onclick = async () => { await api('ouvrir', { chemin: li.dataset.p }); location.hash = '#/editeur'; location.reload(); });
  $('#daAjouter').onclick = () => copierStyle(s, () => styles(sec, s.id));
  $('#daModifier').onclick = () => {
    const d = $('#dFicheDA'); for (const k of ['titre', 'createur', 'pays', 'lien', 'compte', 'notes']) $('#fd_' + k).value = f[k] || ''; $('#fd_genre').value = s.genre; $('#fd_famille').innerHTML = [...new Set([...FAMILLES_DA, s.famille])].map(x => `<option ${x === s.famille ? 'selected' : ''}>${esc(x)}</option>`).join(''); $('#fd_tags').value = (f.tags || []).join(', ');
    $('#fdAnnuler').onclick = () => d.close();
    $('#fdOk').onclick = async () => { const o = { id: s.id, tags: $('#fd_tags').value.split(','), genre: $('#fd_genre').value, famille: $('#fd_famille').value }; for (const k of ['titre', 'createur', 'pays', 'lien', 'compte', 'notes']) o[k] = $('#fd_' + k).value.trim();
      const r = await api('styles/fiche', o); if (r.erreur) return toast(r.erreur, 4000); d.close(); toast('Fiche enregistrée'); styles(sec, s.id); };
    d.showModal();
  };
}
// ================= idées de niche (synthèse d'un lot de comptes copiés : _lots/<date>/niches.json) =================
let pourNiche = '';
const ouvrirDA = id => { location.hash = '#/styles'; setTimeout(() => styles($('.page[data-page="styles"]'), id), 300); };
async function niches(sec) {
  const N = await api('niches'); if (N.aucun) { sec.innerHTML = '<div class="contenu"><h1>Idées de niche</h1><p class="discret">Pas encore de synthèse : elle se fait à la fin d\u2019une copie de DA depuis des liens.</p></div>'; return; }
  const daDe = h => N.da[String(h || '').replace(/^@/, '').toLowerCase()], vues = n => n == null ? '—' : n >= 1e6 ? (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' M' : Math.round(n / 1e3) + ' k';
  const puce = h => { const d = daDe(h); return d ? `<a class="puce da-lien" data-da="${d.id}" title="${esc(d.titre)}">${d.image ? `<img src="${d.image}">` : ''}@${esc(h)}</a>` : `<span class="puce">@${esc(h)}</span>`; };
  const garde = c => !pourNiche || c === pourNiche || /les deux/i.test(c || '');
  sec.innerHTML = `<div class="contenu niches"><div class="tete"><div><h1>Idées de niche</h1><p class="discret">Ce que montrent les ${Object.keys(N.da).length ? 'comptes copiés' : 'comptes'} du lot du ${esc(N.lot)} : les niches qui font des vues, les accroches et les structures qui reviennent, ce qui irait à tes comptes, et des idées de sujets prêtes à lancer. ${esc(N.intro || '')}</p></div></div>
    <div class="filtres"><span class="segment" id="nPour">${[['', 'Tout'], ['Koan', 'Koan'], ['Automobile', 'Automobile']].map(([k, l]) => `<button data-p="${k}" class="${k === pourNiche ? 'actif' : ''}">${l}</button>`).join('')}</span></div>
    <h2>Pour toi</h2><div class="pour-toi">${(N.pour_toi || []).filter(p => garde(p.compte_noam)).sort((a, b) => (a.priorite || 9) - (b.priorite || 9)).map(p => `<div class="bloc"><div class="pt-tete"><span class="tag jaune">${esc(p.compte_noam)}</span><b>${esc(p.titre)}</b></div><ul>${(p.points || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul><p>${(p.comptes || []).map(puce).join(' ')}</p></div>`).join('')}</div>
    <h2>Les niches <span class="discret">(vues médianes)</span></h2><div class="niches-grille">${(N.niches || []).slice().sort((a, b) => (b.vues_mediane || 0) - (a.vues_mediane || 0)).map(n => `<div class="bloc niche"><div class="n-vues">${vues(n.vues_mediane)}</div><b>${esc(n.nom)}</b><div class="discret petit">${n.nb_videos ? n.nb_videos + ' vidéo(s) · ' : ''}${esc(n.format || '')}</div><p>${esc(n.ce_qui_marche || '')}</p><p>${(n.comptes || []).map(puce).join(' ')}</p></div>`).join('')}</div>
    ${(N.remarques || []).map(r => `<p class="verdict">${esc(r)}</p>`).join('')}
    <h2>Idées de sujets</h2><p class="discret">${esc(N.avertissement_idees || '')}</p>
    <table class="idees"><tr><th>#</th><th>Sujet</th><th>Pour</th><th>Niche et compte modèle</th><th>DA qui irait</th><th></th></tr>${(N.idees || []).filter(i => garde(i.compte_noam)).map(i => { const d = daDe(i.compte_modele);
      return `<tr><td>${i.n}</td><td><b>${esc(i.sujet)}</b></td><td>${esc(i.compte_noam || '')}</td><td>${esc(i.niche || '')}<br>${i.compte_modele ? puce(i.compte_modele) : ''}</td><td class="discret">${esc(i.da || '')}</td><td><button data-idee="${i.n}" ${d ? `data-style="${d.id}"` : ''}>Créer le projet</button></td></tr>`; }).join('')}</table>
    <h2>Les accroches qui marchent</h2>${(N.accroches || []).map(a => `<div class="bloc"><b>${esc(a.formule)}</b><ul>${(a.exemples || []).map(e => `<li>« ${esc(e.texte.replace(/^«\s*|\s*»$/g, ''))} » ${e.compte ? puce(e.compte) : ''}</li>`).join('')}</ul></div>`).join('')}
    <h2>Les structures qui reviennent</h2><ol class="structures">${(N.structures || []).map(s => `<li><b>${esc(s.nom)}</b> ${(s.comptes || []).map(puce).join(' ')}<div>${esc(s.deroule || '')}</div></li>`).join('')}</ol>
    ${N.points_communs?.length ? `<div class="bloc"><b>Points communs à presque tous les comptes</b><ul>${N.points_communs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    <details class="bloc"><summary><b>Le rapport complet</b> <span class="discret">— écrit par Opus à partir des 47 fiches de compte</span></summary><div class="md">${md(N.rapport || '')}</div></details></div>`;
  $$('#nPour button').forEach(b => b.onclick = () => { pourNiche = b.dataset.p; niches(sec); });
  sec.querySelectorAll('[data-da]').forEach(a => a.onclick = e => { e.preventDefault(); ouvrirDA(a.dataset.da); });
  sec.querySelectorAll('[data-idee]').forEach(b => b.onclick = () => { const i = N.idees.find(x => x.n == b.dataset.idee); ouvrirNouveau(b.dataset.style || null, ['Koan', 'Automobile'].includes(i.compte_noam) ? i.compte_noam : null, i.sujet,
    `Niche : ${i.niche}${i.compte_modele ? ` (compte modèle : @${i.compte_modele}, sa fiche est dans la bibliothèque de DA)` : ''}. DA visée : ${i.da}. ${N.avertissement_idees || 'Faits et études à vérifier et sourcer.'}`); });
}
// ================= avancement d'un lot de liens (copier-lot.mjs) =================
let minuterieLot = null;
async function lot(sec) {
  clearTimeout(minuterieLot);
  const L = await api('lot'); if (L.aucun) { sec.innerHTML = '<div class="contenu"><h1>Avancement</h1><p class="discret">Aucun lot de liens en cours.</p></div>'; return; }
  const pc = Math.round(100 * L.comptes.reduce((s, c) => s + c.etape + 1, 0) / (L.total * L.etapes.length));
  const h = t => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  sec.innerHTML = `<div class="contenu"><div class="tete"><div><h1>Copie des DA : lot du ${esc(L.lot)}</h1><p class="discret">${L.total} comptes TikTok, une DA chacun. Deux comptes à la fois ; pour chacun : téléchargement, mesures du montage, son mesuré, images décrites par Haiku, règles par Opus, fiche détaillée (look, fabrication, niche du compte). Page mise à jour toute seule.</p></div></div>
    <div class="bloc lot-resume"><div class="lot-barre"><div style="width:${pc}%"></div></div>
      <p><b>${pc} %</b> · ${L.faits} / ${L.total} comptes finis${L.erreurs ? ` · <span class="rouge">${L.erreurs} en erreur</span>` : ''} · ${L.actif ? '<span class="vert">● en cours</span>' : '<span class="discret">○ arrêté</span>'}${L.minutes_par_compte ? ` · ~${L.minutes_par_compte} min par compte` : ''}${L.fin_estimee ? ` · fin estimée vers <b>${h(L.fin_estimee)}</b>` : ''}</p></div>
    <table class="lot"><tr><th>Compte</th><th>Vidéos</th><th>Vues (médiane)</th><th>Étape</th><th>DA trouvée</th><th>Dernière ligne du journal</th></tr>
    ${L.comptes.sort((a, b) => (b.etape > -1 && b.etape < 6) - (a.etape > -1 && a.etape < 6) || b.etape - a.etape).map(c => `<tr class="${c.erreur ? 'err' : c.etape === 6 ? 'ok' : c.etape >= 0 ? 'encours' : ''}">
      <td>@${esc(c.compte)}</td><td>${c.videos}</td><td>${(c.vues || 0).toLocaleString('fr-FR')}</td>
      <td><span class="pastilles">${L.etapes.map((e, i) => `<i class="${i <= c.etape ? 'pleine' : ''}" title="${e}"></i>`).join('')}</span> ${c.erreur ? 'erreur' : esc(c.etat)}</td>
      <td>${c.titre ? `<a href="#/styles" data-da="${c.nom}">${esc(c.titre)}</a> <span class="discret">${esc(c.famille || '')}</span>` : ''}</td>
      <td class="discret petit">${esc(c.erreur || c.dernier || '')}</td></tr>`).join('')}</table>
    <h3>Journal</h3><pre class="journal">${esc(L.journal.join('\n'))}</pre></div>`;
  sec.querySelectorAll('[data-da]').forEach(a => a.onclick = e => { e.preventDefault(); location.hash = '#/styles'; setTimeout(() => styles($('.page[data-page="styles"]'), a.dataset.da), 300); });
  minuterieLot = setTimeout(() => { if (location.hash === '#/lot') lot(sec); }, 15000);
}
// ================= copie d'une DA (phase 7) : une nouvelle, ou des vidéos de plus pour une DA existante =================
function copierStyle(da, apres) {
  const d = $('#dStyle'); $('#sJournal').textContent = ''; $('#sFichiers').value = ''; $('#sChemins').value = ''; $('#sLancer').disabled = false;
  $('#sTitre').textContent = da ? `Vidéos de référence pour « ${da.titre || da.id} »` : 'Copier depuis des vidéos';
  $('#sNom').value = da ? da.id : ''; $('#sNom').disabled = !!da; $('#sQui').hidden = !!da;
  for (const k of ['createur', 'pays', 'lien']) $('#s_' + k).value = ''; $('#s_compte').value = 'Automobile';
  $('#sAnnuler').onclick = () => d.close();
  $('#sLancer').onclick = async () => {
    const nom = $('#sNom').value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!nom) return toast('Donne un nom à la DA', 3000);
    const chemins = $('#sChemins').value.split('\n').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    for (const f of $('#sFichiers').files) {   // les vidéos choisies sont copiées dans la DA (sources/)
      $('#sJournal').textContent += `envoi de ${f.name} (${(f.size / 1e6).toFixed(0)} Mo)…\n`;
      const r = await fetch(`/__api/styles/televerser?nom=${nom}&f=${encodeURIComponent(f.name)}`, { method: 'POST', body: f }).then(r => r.json()); if (r.erreur) return toast(r.erreur, 5000); chemins.push(r.chemin);
    }
    const deja = da?.fiche?.auto?.videos?.length || 0;
    if (!chemins.length || chemins.length + deja > 7) return toast(`1 à 7 vidéos par DA${deja ? ` (elle en a déjà ${deja})` : ''}`, 4000);
    const fiche = da ? null : { titre: $('#sNom').value.trim(), createur: $('#s_createur').value.trim(), pays: $('#s_pays').value.trim(), lien: $('#s_lien').value.trim(), compte: $('#s_compte').value, genre: $('#s_genre').value, origine: 'Copiée de ' + ($('#s_createur').value.trim() || 'vidéos de référence') };
    const r = await api('styles/copier', { nom, chemins, ajouter: !!da, fiche }); if (r.erreur) return toast(r.erreur, 5000); $('#sLancer').disabled = true;
    const fl = new EventSource('/__api/flux');
    fl.addEventListener('journal', e => { const j = $('#sJournal'); j.textContent += JSON.parse(e.data) + '\n'; j.scrollTop = j.scrollHeight; });
    fl.addEventListener('tache', e => { const t = JSON.parse(e.data); if (t.etat !== 'en cours') { fl.close(); $('#sJournal').textContent += `— ${t.etat}${t.duree ? ' en ' + t.duree + ' s' : ''}\n`; if (t.etat === 'fini') { toast('DA enregistrée dans la bibliothèque', 5000); apres?.(); } } });
  };
  d.showModal();
}
async function memoire(sec) {
  const [L, R] = await Promise.all([api('memoire'), api('regles')]); let sel = L[0];
  const studio = [...R.projet.map(r => ['projet ' + R.nom, r]), ...Object.entries(R.styles).flatMap(([k, l]) => l.map(r => ['style ' + k, r]))];
  const dessiner = () => { sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Mémoire</h1><p class="discret">Ce que Claude a retenu de tes retours. Dans l'éditeur, « Retenir… » sous une retouche ajoute une règle au projet ou à tout le style : Claude la relit à chaque demande.</p></div>
    <div class="bloc"><h3>Retenu depuis le studio</h3>${studio.length ? `<ul class="liste">${studio.map(([o, r]) => `<li><span class="tag jaune">${esc(o)}</span> ${esc(r)}</li>`).join('')}</ul>` : '<p class="discret">Rien pour le moment.</p>'}</div>
    <h3 style="margin:16px 0 8px">Mémoire de Claude pour tiktok-motion</h3>
    <div style="display:grid;grid-template-columns:320px 1fr;gap:16px"><ul class="liste bloc">${L.map(m => `<li data-m="${m.fichier}" class="${m === sel ? 'sel' : ''}"><span class="tag jaune">${esc(m.type)}</span> <b>${esc(m.nom)}</b><div class="discret" style="font-size:12px">${esc(m.description)}</div></li>`).join('')}</ul>
    <div class="bloc md">${sel ? md(sel.texte) : ''}</div></div></div>`;
    sec.querySelectorAll('[data-m]').forEach(li => li.onclick = () => { sel = L.find(m => m.fichier === li.dataset.m); dessiner(); }); };
  dessiner();
}
// ================= Bibliothèque commune (phase 6) =================
const TYPES_BIB = [['', 'Tout'], ['voiture', 'Voitures'], ['decor', 'Décors'], ['accessoire', 'Accessoires'], ['personnage', 'Personnages'], ['lieu', 'Lieux']];
const KIT_BIB = [['Éclairage', "k.eclairage(k.groupe, 'nuit')", 'nuit de course : ciel bas, projecteurs des stands, lune'], ['Éclairage', "k.eclairage(k.groupe, 'jour')", 'plein jour, soleil franc, ombres'], ['Éclairage', "k.eclairage(k.groupe, 'studio')", 'trois points, fond neutre'],
  ['Caméra', 'k.cam.orbite(centre, {p})', 'tourne autour'], ['Caméra', 'k.cam.travelling(de, a, cible, p)', 'glisse d\u2019un point à un autre'], ['Caméra', 'k.cam.dolly(cible, dir, d0, d1, p)', 'avance vers la cible'],
  ['Caméra', 'k.cam.plongee(cible, h0, h1, p)', 'vue de dessus qui descend'], ['Caméra', 'k.cam.suivi(objet, décalage)', 'accrochée à un objet qui roule'], ['Personnage', "k.anime(perso, clips, 'Walk_Loop', t)", 'joue une animation (fonction du temps)']];
let filtreBib = '', chercheBib = '';
async function bibliotheque(sec) {
  const B = await api('bibliotheque'), E = B.elements;
  const vis = () => E.filter(e => (!filtreBib || e.type === filtreBib) && (!chercheBib || (e.nom + ' ' + (e.quoi || '') + ' ' + (e.notes || '')).toLowerCase().includes(chercheBib)));
  const mo = n => n > 1e6 ? (n / 1e6).toFixed(1) + ' Mo' : Math.round(n / 1e3) + ' ko';
  sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Bibliothèque</h1><p class="discret">${E.length} éléments communs à tous les projets, chacun testé seul à taille réelle avant d'entrer (silhouette de 1,80 m, grille de 1 m). Convention : ${esc(B.convention || '')}.</p></div>
    <div class="filtres"><span class="segment" id="bibTypes">${TYPES_BIB.map(([t, l]) => `<button data-t="${t}" class="${t === filtreBib ? 'actif' : ''}">${l} <em>${t ? E.filter(e => e.type === t).length : E.length}</em></button>`).join('')}</span><input id="bibQ" placeholder="Chercher (ex. tribune, pneu, pilote)" value="${esc(chercheBib)}"></div>
    <div class="grille bib" id="bibGrille"></div>
    <h3>Dans le kit du moteur</h3><p class="discret">Pas des modèles : des fonctions prêtes que Claude utilise dans les sections.</p>
    <table class="kitBib">${KIT_BIB.map(([t, f, d]) => `<tr><td>${t}</td><td><code>${esc(f)}</code></td><td class="discret">${esc(d)}</td></tr>`).join('')}</table></div>`;
  const grille = () => { $('#bibGrille').innerHTML = vis().map(e => `<div class="carte" data-nom="${esc(e.nom)}" draggable="true"><div class="vign carre" style="background-image:url('/__bib/${encodeURIComponent(e.nom)}/apercu.webp')">${e.dans ? '<span class="tags"><span class="tag">dans le projet</span></span>' : ''}</div>
      <div class="corps"><b>${esc(e.quoi || e.nom)}</b><div class="meta">${e.dims_m.map(x => x.toFixed(2)).join(' × ')} m · ${mo(e.octets)}${e.animations?.length ? ' · ' + e.animations.length + ' anim.' : ''}</div></div></div>`).join('') || '<p class="discret">Rien ne correspond.</p>';
    $$('#bibGrille .carte').forEach(c => { c.onclick = () => ficheBib(E.find(e => e.nom === c.dataset.nom), B.modifiable, () => bibliotheque(sec)); c.ondragstart = ev => ev.dataTransfer.setData('text/bib', c.dataset.nom); }); };
  grille();
  $$('#bibTypes button').forEach(b => b.onclick = () => { filtreBib = b.dataset.t; $$('#bibTypes button').forEach(x => x.classList.toggle('actif', x === b)); grille(); });
  $('#bibQ').oninput = e => { chercheBib = e.target.value.toLowerCase().trim(); grille(); };
}
function ficheBib(e, modifiable, apres) {
  $('#bTitre').textContent = e.quoi || e.nom; $('#bPlanche').src = `/__bib/${encodeURIComponent(e.nom)}/planche.png`;
  const L = [['Nom dans le code', `<code>await k.bib('${esc(e.nom)}')</code>`], ['Type', esc(e.type)], ['Taille', e.dims_m.map(x => x.toFixed(2)).join(' × ') + ' m (largeur × hauteur × longueur)'],
    ['Poids', `${(e.octets / 1e6).toFixed(1)} Mo (source : ${(e.octets_source / 1e6).toFixed(1)} Mo) · ${nb(e.tris)} triangles${e.textures?.length ? ' · textures ' + e.textures.join(', ') : ''}`],
    ...(e.os ? [['Squelette', e.os + ' os']] : []), ...(e.animations?.length ? [['Animations', e.animations.map(a => esc(a.nom)).join(', ')]] : []),
    ...(e.marqueurs?.length ? [['Marqueurs', e.marqueurs.map(esc).join(', ')]] : []), ['Repère', esc(e.convention || '')],
    ['Licence', esc(e.licence) + (e.auteur ? ' · ' + esc(e.auteur) : '')], ['Crédit', e.credit ? esc(e.credit) : '<span class="discret">aucun à afficher</span>'],
    ...(e.notes ? [['Notes', esc(e.notes)]] : []), ['Entré le', esc(e.date)]];
  $('#bInfos').innerHTML = '<table>' + L.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') + '</table><p class="discret">La planche : face, profil, dessus et 3/4, à côté d\u2019une silhouette de 1,80 m sur une grille de 1 m.</p>';
  const b = $('#bAjouter'); b.hidden = !modifiable; b.disabled = e.dans; b.textContent = e.dans ? '✓ Dans le projet' : 'Ajouter au projet';
  b.onclick = async () => { const r = await api('bibliotheque/ajouter', { nom: e.nom }); if (r.erreur) return toast(r.erreur, 5000); e.dans = true; b.disabled = true; b.textContent = '✓ Dans le projet'; toast(`« ${e.nom} » copié dans le projet (assets/bib/) avec son crédit : Claude peut l'utiliser`, 4000); apres?.(); };
  $('#bFermer').onclick = () => $('#dBib').close(); $('#dBib').showModal();
}
async function couvertures(sec) {
  const cat = (await catalogue()).filter(p => p.couverture && (!espace || p.espace === espace));
  sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Couvertures</h1><p class="discret">Les couvertures de tes vidéos${espace ? ' ' + esc(espace) : ''}. Leur fabrication depuis le studio (bouton « Couverture » de l'export) existe ; un atelier dédié viendra plus tard.</p></div>
    <div class="grille">${cat.map(p => `<div class="carte" data-projet="${esc(p.chemin)}"><div class="vign" style="background-image:url('${p.couverture}')"></div><div class="corps"><b>${esc(p.titre || p.nom)}</b></div></div>`).join('') || '<p class="discret">Aucune couverture trouvée.</p>'}</div></div>`;
  brancherCartes(sec, cat);
}
async function reglages(sec) {
  const r = await api('reglages'), m = r.machine;
  const ok = v => `<span class="etat"><i class="${v ? 'oui' : ''}"></i>${v ? 'oui' : 'non'}</span>`;
  sec.innerHTML = `<div class="contenu"><div class="tete"><h1>Réglages</h1></div>
    <div class="deuxcol"><div class="bloc"><h3>Rendu</h3>
      <label>Pages Chromium en parallèle <select id="rW">${[1, 2, 3].map(n => `<option ${n === r.reglages.workers ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <p class="discret">2 est le mieux sur ta RTX 3060 (6 Go) : à 3, la mémoire graphique sature et tout ralentit.</p>
      <h3>Zone sûre TikTok (mesurée sur ton iPhone)</h3><p>Haut ${r.zone.haut} px · bas ${r.zone.bas} px · bords ${r.zone.gauche} px · boutons à partir de x = ${r.zone.boutonsX}, y = ${r.zone.boutonsY}</p></div>
    <div class="bloc"><h3>Machine</h3><table>
      <tr><td>Node</td><td>${esc(m.node)}</td></tr><tr><td>ffmpeg</td><td>${esc(m.ffmpeg || 'introuvable')}</td></tr><tr><td>Claude Code</td><td>${esc(m.claude || 'introuvable')}</td></tr>
      ${Object.entries(m.cles).map(([k, v]) => `<tr><td>Clé ${k}</td><td>${ok(v)} <span class="discret">(variable d'environnement, jamais affichée)</span></td></tr>`).join('')}
      ${Object.entries(m.chemins).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${ok(v)}</td></tr>`).join('')}
      <tr><td>Pack de sons</td><td>${nb(m.sons)} sons au catalogue</td></tr></table></div></div></div>`;
  $('#rW').onchange = async e => { await api('reglages', { workers: +e.target.value }); toast('Enregistré'); };
}

// ================= nouveau projet =================
async function ouvrirNouveau(style, compte, titre, consignes) {   // style : depuis la fiche d'une DA ; titre et consignes : depuis une idée de sujet (page Idées de niche)
  const st = (await api('styles')).filter(s => s.genre === 'da' || s.id === style), fams = [...new Set(st.map(s => s.famille))].sort((a, b) => (FAMILLES_DA.indexOf(a) + 1 || 99) - (FAMILLES_DA.indexOf(b) + 1 || 99));
  $('#nStyle').innerHTML = fams.map(fa => `<optgroup label="${esc(fa)}">${st.filter(s => s.famille === fa).map(s => `<option value="${s.id}">${esc(s.titre)}${STATUT_DA[s.statut] && s.statut !== 'validée' ? ' (' + STATUT_DA[s.statut][0] + ')' : ''}</option>`).join('')}</optgroup>`).join('');
  $('#nEspace').value = compte || espace || 'Koan'; $('#nStyle').value = style || ESPACES[$('#nEspace').value].style; $('#nTitre').value = titre || ''; $('#nScript').value = titre || ''; $('#nDirection').value = consignes || ''; $('#dNouveau').showModal(); $('#nTitre').focus();
}
$('#bNouveau').onclick = () => ouvrirNouveau();
$('#nEspace').onchange = () => $('#nStyle').value = ESPACES[$('#nEspace').value].style;
let mode = 'claude'; $$('#nMode button').forEach(b => b.onclick = () => { mode = b.dataset.m; $$('#nMode button').forEach(x => x.classList.toggle('actif', x === b)); $('#nScript').placeholder = mode === 'moi' ? 'Colle ton script ici' : 'Un sujet, ex. : la photo d\'arrivée du Mans 1966 (ensuite, demande à Claude d’écrire le script)'; });
$('#nAnnuler').onclick = () => $('#dNouveau').close();
async function creer() {
  if (!$('#nTitre').value.trim()) return toast('Il faut un titre');
  const r = await api('nouveau', { titre: $('#nTitre').value.trim(), espace: $('#nEspace').value, style: $('#nStyle').value, format: $('#nFormat').value, duree: +$('#nDuree').value,
    script: mode === 'moi' ? $('#nScript').value : `Sujet : ${$('#nScript').value}`, direction: $('#nDirection').value });
  if (r.erreur) return toast(r.erreur, 4000); location.hash = '#/editeur'; location.reload();
}
$('#nCreer').onclick = creer; $('#dNouveau').addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) creer(); });

// ================= Ctrl K : chercher ou lancer =================
async function palette() {
  const cat = await catalogue(), d = $('#dPalette'), q = $('#pQ'), ul = $('#pListe');
  const actions = [['Page', 'Accueil', () => location.hash = '#/accueil'], ['Page', 'Projets', () => location.hash = '#/projets'], ['Page', 'Éditeur', () => location.hash = '#/editeur'], ['Page', 'DA (styles)', () => location.hash = '#/styles'],
    ['Page', 'Mémoire', () => location.hash = '#/memoire'], ['Page', 'Bibliothèque', () => location.hash = '#/bibliotheque'], ['Page', 'Couvertures', () => location.hash = '#/couvertures'], ['Page', 'Rendus', () => location.hash = '#/rendus'], ['Page', 'Statistiques TikTok', () => location.hash = '#/stats'], ['Page', 'Réglages', () => location.hash = '#/reglages'],
    ['Action', 'Nouveau projet', () => $('#bNouveau').click()], ['Action', 'Contrôler la vidéo', () => window.STUDIO?.tache('controle')], ['Action', 'Exporter', () => $('#bExport').click()], ['Action', 'Lecture / pause', () => window.STUDIO?.lire()],
    ...(PROJET?.rapport?.plans || []).map(p => ['Plan ' + p.n, p.texte || '(sans voix)', () => { location.hash = '#/editeur'; window.STUDIO?.aller(p.t0); }]),
    ...cat.map(p => ['Projet', (p.titre || p.nom) + (p.espace ? ' · ' + p.espace : ''), () => ouvrirProjet(p)])];
  let i = 0, L = actions;
  const dessiner = () => { const m = q.value.toLowerCase().split(/\s+/).filter(Boolean); L = actions.filter(a => m.every(x => (a[0] + ' ' + a[1]).toLowerCase().includes(x))).slice(0, 40); i = Math.min(i, L.length - 1);
    ul.innerHTML = L.map((a, k) => `<li class="${k === i ? 'sel' : ''}" data-k="${k}"><span class="k">${esc(a[0])}</span>${esc(a[1])}</li>`).join(''); ul.querySelectorAll('li').forEach(li => li.onclick = () => { d.close(); L[+li.dataset.k][2](); }); };
  q.value = ''; q.oninput = () => { i = 0; dessiner(); };
  q.onkeydown = e => { if (e.key === 'ArrowDown') { i = Math.min(L.length - 1, i + 1); dessiner(); e.preventDefault(); } else if (e.key === 'ArrowUp') { i = Math.max(0, i - 1); dessiner(); e.preventDefault(); } else if (e.key === 'Enter' && L[i]) { d.close(); L[i][2](); } };
  dessiner(); d.showModal(); q.focus();
}
$('#bRecherche').onclick = palette;
addEventListener('keydown', e => { if (e.key.toLowerCase() === 'k' && e.ctrlKey) { e.preventDefault(); palette(); } }, true);

// ================= démarrage =================
PROJET = await api('projet');
if (!espace) espace = PROJET.espace || 'Koan';
majChaine();
$('#pointEditeur').hidden = !!PROJET.aucun;
catalogue().then(c => $('#nProjets').textContent = c.length);
route();
