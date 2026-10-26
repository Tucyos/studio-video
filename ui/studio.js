// studio.js : l'éditeur. L'aperçu est la vraie page de la scène (même origine, dans un iframe) : seek(T) direct, comme à l'export.
import { md } from '/__studio/pages.js';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const cadre = $('#cadre'), calque = $('#calque'), cx = calque.getContext('2d'), audio = $('#voix'), tl = $('#tl'), tg = tl.getContext('2d');
let P = null, FPS = 30, DUREE = 1, T = 0, win = null, pret = false, dernier = null;   // dernier = relevés de la dernière image (textes, caméra)
let lecture = false, horloge = null, vitesse = 1, boucle = false, plage = null;     // plage = [début, fin] choisie sur la timeline
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const grille = t => Math.round(t * FPS) / FPS;
const clamp = t => Math.min(DUREE - 1 / FPS, Math.max(0, t));
const toast = (m, d = 2500) => { const e = $('#toast'); e.textContent = m; e.hidden = false; clearTimeout(e._t); e._t = setTimeout(() => e.hidden = true, d); };
const api = (u, o) => fetch('/__api/' + u, o && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).then(r => r.json());

// ================= projet =================
async function charger() {
  P = await api('projet');
  if (P.aucun) { $('#chargement').textContent = 'Aucun projet ouvert : choisis-en un dans « Projets ».'; return false; }
  FPS = P.fps || 30;
  document.title = `Studio · ${P.titre}`; $('#titre').textContent = P.titre; $('#ls').hidden = !P.lectureSeule;
  $('#etat').textContent = P.lectureSeule ? '' : '✓ enregistré dans le dossier du projet';
  $('#chipStyle').textContent = P.style ? '✦ ' + P.style.replace(/^da-/, 'DA ') : 'sans style'; $('#chipCompte').textContent = P.espace || 'aucun compte';
  P.plans = P.sections ? P.sections.slice().sort((a, b) => a.t0 - b.t0).map((s, i) => ({ id: s.id, f0: s.t0, f1: s.t1, n: i + 1, t0: Math.round(s.t0 * FPS) / FPS, t1: Math.round(s.t1 * FPS) / FPS, fichier: s.fichier.split('/').pop(), vignette: P.rapport?.plans.find(p => p.t0 >= s.t0 - .02)?.vignette,
    texte: P.mots.filter(m => m.start >= s.t0 && m.start < s.t1).map(m => m.w).join(' ') || s.brief || s.id })) : P.rapport?.plans || []; P.entrees = P.rapport?.entrees || [];
  $('#bCopierStudio').hidden = !P.lectureSeule; $('#lsClaude').hidden = !P.lectureSeule; majAppliquer(); historiqueClaude().then(etatEquipe);
  bandeau(); listePlans(); pipeline(); controles(); dessinerTl(); choisirOnglet();
  return true;
}
function bandeau() {
  const b = $('#bandeau'), e = P.etapes;
  const m = !P.page ? ['Pas encore de scène : boutons Voix, Nettoyer et Caler, puis « Construire ».'] : !e.calage ? ['Les mots de la voix ne sont pas calés : les plans ne suivent pas encore la voix.'] : !P.rapport ? ['Pas encore contrôlé : les plans et les problèmes apparaîtront après le contrôle.', 'Contrôler maintenant'] : null;
  b.hidden = !m; if (m) { b.innerHTML = esc(m[0]) + (m[1] ? `<br><button>${m[1]}</button>` : ''); const bt = b.querySelector('button'); if (bt) bt.onclick = () => tache('controle'); }
}
function listePlans() {
  $('#nbPlans').textContent = P.plans.length || '';
  const pb = n => P.entrees.filter(e => e.plan === n && e.gravite === 'grave').length, fichier = (P.page || '').split('/').pop().replace('.html', '.js');
  $('#plans').innerHTML = P.plans.length ? P.plans.map(p => `<li data-t="${p.t0}" data-n="${p.n}"><span class="n">${p.n}</span>${p.vignette ? `<img src="/__qa/${p.vignette}?${P.rapport?.duree_s}" alt="">` : '<span class="img"></span>'}
    <div><div class="tx">${esc(p.texte) || '<i class="discret">sans voix</i>'}</div><div class="tc">${fmt(p.t0)} · ${(p.t1 - p.t0).toFixed(1)} s · ${esc(p.fichier || fichier)}</div>${pb(p.n) ? `<div class="alerte">${pb(p.n)} problème(s) grave(s)</div>` : ''}</div></li>`).join('')
    : '<li class="discret" style="display:block">Pas encore de plans : ils viennent du contrôle.</li>';
  $$('#plans li[data-t]').forEach(li => li.onclick = () => aller(+li.dataset.t));
}
const planA = t => P?.plans.find(p => t >= p.t0 - .5 / FPS && t < p.t1 - .5 / FPS);   // les bornes des plans sont arrondies au millième, T est sur la grille des images
function pipeline() {
  const e = P.etapes, x = P.tache;
  const ls = P.lectureSeule ? 'lecture seule : « Copier dans le studio » d\u2019abord' : x || equipe ? 'une tâche tourne' : '', sv = ls || (!e.voix && 'pas encore de voix');
  const voix = () => (!e.voix || confirm('Refaire la voix avec Gemini ? (l\u2019ancienne est gardée dans audio/prises/)')) && tache('voix');
  const L = [['Script écrit', e.script, P.script ? ['Ouvrir', () => voirTexte(P.script)] : null], ['Voix ajoutée', e.voix, [e.voix ? 'Refaire' : 'Générer', voix, ls || (!e.script && 'pas de script.md')]],
    ['Audio nettoyé', e.nettoyage, [e.nettoyage ? 'Refaire' : 'Nettoyer', () => tache('nettoyer'), sv], 'nettoyage'],
    ['Mots calés', e.calage, [e.calage ? 'Refaire' : 'Caler', () => tache('caler'), sv], 'calage'], ['Storyboard écrit', e.storyboard, P.storyboard ? ['Ouvrir', () => voirTexte(P.storyboard)] : null], ['Scènes construites', e.scenes && !!P.sections?.length, ['Construire', ouvrirConstruire, P.page !== 'moteur/page.html' ? 'seulement pour un projet créé dans le studio' : P.lectureSeule ? 'lecture seule' : (x || equipe) && 'une tâche tourne']],
    ['Vidéo contrôlée', e.controle, [e.controle ? 'Refaire' : 'Contrôler', () => tache('controle'), x && 'une tâche tourne']], ['Son mixé', e.son, [e.son ? 'Refaire' : 'Mixer', () => tache('mixer'), sv], 'son'], ['Vidéo exportée', e.export, ['Exporter', () => $('#bExport').click(), x && 'une tâche tourne']]];
  const per = (k, ok) => ok && k && e.perime?.[k];   // une étape d'avant a changé depuis : « ! » orange, à refaire
  $('#pipeline').innerHTML = L.map(([n, ok, b, k], i) => per(k, ok) ? `<li><span class="ok perime" title="à refaire : une étape d'avant a changé">!</span><span class="nom">${n}</span><button data-i="${i}" ${b[2] ? 'disabled' : ''} title="${b[2] || ''}">${b[0]}</button></li>` : `<li><span class="ok ${ok ? 'oui' : ''}">${ok ? '✓' : ''}</span><span class="nom">${n}</span>${b ? `<button data-i="${i}" ${!b[1] || b[2] ? 'disabled' : ''} title="${b[2] || ''}">${b[0]}</button>` : ''}</li>`).join('');
  $$('#pipeline button[data-i]').forEach(bt => { const f = L[+bt.dataset.i][2][1]; if (f) bt.onclick = f; });
}
async function voirTexte(f) { const r = await api('texte?f=' + encodeURIComponent(f)); $('#tTitre').textContent = f; $('#tCorps').innerHTML = r.erreur ? esc(r.erreur) : md(r.texte); $('#tFermer').onclick = () => $('#dTexte').close(); $('#dTexte').showModal(); }
$('#bScript').onclick = () => P.script ? voirTexte(P.script) : P.storyboard ? voirTexte(P.storyboard) : toast('Pas de script dans ce projet');
$('#bDossier').onclick = () => api('dossier', {});
function controles() {
  const c = P.rapport?.compte || {}, g = k => Object.values(c).reduce((a, x) => a + x[k], 0);
  $('#resume').textContent = P.rapport ? `${g('grave')} grave(s), ${g('moyen')} moyen(s), ${g('info')} info · contrôle fait en ${P.rapport.duree_s} s` : 'Pas encore de contrôle : bouton « Contrôler » du pipeline.';
  $('#controles').innerHTML = P.entrees.map((e, i) => `<li class="${e.gravite}" data-i="${i}"><div class="t">${fmt(e.t)}${e.t1 > e.t ? ' → ' + fmt(e.t1) : ''} · plan ${e.plan || '?'} · ${esc(e.controle)}</div>${esc(e.probleme)}</li>`).join('');
  $$('#controles li').forEach(li => li.onclick = () => aller(P.entrees[+li.dataset.i].t));
}

// ================= aperçu =================
function ajuster() {   // la scène 1080×1920 tient dans la zone d'aperçu
  const v = $('#vue'); if (!v.clientWidth) return; const k = Math.min(v.clientWidth / 1080, v.clientHeight / 1920), s = $('#scene');
  s.style.transform = `scale(${k})`; s.style.left = (v.clientWidth - 1080 * k) / 2 + 'px'; s.style.top = (v.clientHeight - 1920 * k) / 2 + 'px';
}
addEventListener('resize', () => { ajuster(); pps = 0; dessinerTl(); });   // la timeline se réajuste à toute la durée
function ouvrirScene() {
  if (!P.page) { $('#chargement').textContent = 'Pas encore de scène dans ce projet.'; return; }
  pret = false; $('#chargement').hidden = false; $('#chargement').textContent = 'Chargement de la scène…';
  const q = ['studio', $('#qualite').value].filter(Boolean).join('&');
  cadre.src = `/${P.page}${P.page.includes('?') ? '&' : '?'}${q}&v=${Date.now()}`;
}
cadre.onload = async () => {
  if (!cadre.src.includes('studio')) return;   // le about:blank du départ
  win = cadre.contentWindow;
  try {
    await new Promise((ok, ko) => { const t0 = Date.now(), i = setInterval(() => { if (win.READY) { clearInterval(i); ok(); } else if (Date.now() - t0 > 180000) { clearInterval(i); ko(new Error('READY jamais arrivé')); } }, 50); });
    await win.READY; await win.__qa.init({ sujets: P.sujets || {}, sol: P.sol });
    const sc = win.SCENE; if (DUREE !== sc.to) { DUREE = sc.to; pps = 0; } masques();
    if (T < sc.from) T = sc.from;
    pret = true; $('#chargement').hidden = true; await aller(T, true);
    if (attenteApres) { const e = attenteApres; attenteApres = null; const img = vignette(win); if (img) { await api('claude/apres', { id: e.id, image: img }); e.apres = `.studio/images/${e.id}-apres.jpg`; const b = $(`#fil .demande[data-id="${e.id}"]`); if (b) carte(b, e); } }
  } catch (e) { $('#chargement').textContent = 'La scène ne se charge pas : ' + e.message; }
};
// une seule image en cours de calcul : si on demande un autre T pendant ce temps, on calcule seulement le dernier demandé
let occupe = false, voulu = null;
async function aller(t, force) {
  t = clamp(t); if (!pret) { T = t; return; }
  if (!force && !lecture) t = grille(t);
  voulu = t; if (occupe) return; occupe = true;
  try { while (voulu != null) { const x = voulu; voulu = null; T = x; dernier = await win.__qa.voir(x); dessinerCalques(); majTransport(); } }
  catch (e) { toast('Erreur de la scène : ' + e.message, 5000); }
  occupe = false;
  if (!lecture) audio.currentTime = T; dessinerTl();
}
// la liste des plans suit la lecture (pas scrollIntoView : il ferait défiler toute la page)
function majTransport() {
  $('#temps').textContent = `${fmt(T)} / ${fmt(DUREE)}`; $('#image').textContent = `image ${Math.round(T * FPS)}`;
  const p = planA(T); $('#planCourant').textContent = p ? `Plan ${p.n} · ${p.texte}` : '';
  $$('#plans li[data-n]').forEach(li => { const c = p && +li.dataset.n === p.n; if (c && !li.classList.contains('courant')) { const g = $('#plans'); if (li.offsetTop < g.scrollTop || li.offsetTop + li.offsetHeight > g.scrollTop + g.clientHeight) g.scrollTop = li.offsetTop - 60; } li.classList.toggle('courant', !!c); });
}

// ================= lecture =================
function lire(on = !lecture) {
  if (!pret) return; lecture = on; $('#bLire').textContent = on ? '⏸' : '▶';
  if (on) {
    const [a, b] = boucle && plage ? plage : [0, DUREE];
    if (T >= b - 2 / FPS || T < a) T = a;
    audio.currentTime = T; audio.playbackRate = vitesse; const debut = performance.now(), t0 = T;
    horloge = () => audio.src && !audio.paused && !audio.error ? audio.currentTime : t0 + (performance.now() - debut) / 1000 * vitesse;   // l'audio est l'horloge
    audio.play().catch(() => {});
    const tour = () => { if (!lecture) return; const t = horloge();
      if (t >= b) { if (boucle) { T = a; audio.currentTime = a; } else { lire(false); return aller(b - 1 / FPS); } }
      if (!occupe) aller(t >= b ? a : t, true); dessinerTl(); requestAnimationFrame(tour); };
    requestAnimationFrame(tour);
  } else { audio.pause(); aller(grille(T)); }
}
$('#bLire').onclick = () => lire();
$('#bPrec').onclick = () => { const i = P.plans.findIndex(p => p === planA(T)); const p = P.plans[Math.max(0, T - (P.plans[i]?.t0 ?? 0) > .3 ? i : i - 1)]; aller(p ? p.t0 : 0); };
$('#bSuiv').onclick = () => { const p = P.plans.find(p => p.t0 > T + 1e-6); if (p) aller(p.t0); };
$('#bMuet').onclick = () => { audio.muted = !audio.muted; $('#bMuet').textContent = audio.muted ? '🔇' : '🔊'; };
$('#bBoucle').onclick = () => { boucle = !boucle; $('#bBoucle').classList.toggle('actif', boucle); toast(boucle ? (plage ? 'Boucle sur la plage choisie' : 'Boucle sur toute la vidéo') : 'Boucle coupée'); };
$('#qualite').onchange = () => { toast($('#qualite').value ? 'Aperçu léger (540×960) : plus fluide, moins net' : 'Aperçu en pleine définition'); ouvrirScene(); };
$('#bPhoto').onclick = () => { if (!win) return; const a = document.createElement('a'); a.href = win.document.getElementById('c').toDataURL('image/png'); a.download = `${P.nom}_${fmt(T).replace(/[:.]/g, '-')}.png`; a.click(); toast('Image enregistrée dans tes téléchargements'); };
$('#vitesses').innerHTML = [.5, 1, 1.5, 2].map(v => `<button data-v="${v}" class="${v === 1 ? 'actif' : ''}">${String(v).replace('.', ',')}×</button>`).join('');
function choisirVitesse(v) { vitesse = v; audio.playbackRate = vitesse; $$('#vitesses button').forEach(x => x.classList.toggle('actif', +x.dataset.v === v)); if (lecture) { lire(false); lire(true); } }
$$('#vitesses button').forEach(b => b.onclick = () => choisirVitesse(+b.dataset.v));
const pas = n => { if (lecture) lire(false); aller(grille(T) + n / FPS); };
addEventListener('keydown', e => {
  if (!$('#editeur').classList.contains('vue') || onglet !== 'video' || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
  const k = e.key;
  if ((e.ctrlKey || e.metaKey) && (k === 'z' || k === 'Z')) { e.preventDefault(); annulerTl(); }
  else if (e.code === 'Space') { e.preventDefault(); lire(); }
  else if (k === 'ArrowRight') { e.preventDefault(); pas(e.shiftKey ? FPS : 1); }
  else if (k === 'ArrowLeft') { e.preventDefault(); pas(e.shiftKey ? -FPS : -1); }
  else if (k === 'Home') aller(0); else if (k === 'End') aller(DUREE);
  else if (k === 'k' || k === 'K') { if (lecture) lire(false); }
  else if (k === 'l' || k === 'L') { if (lecture) choisirVitesse(Math.min(2, vitesse + .5)); else lire(true); }
  else if (k === 'j' || k === 'J') { if (lecture) choisirVitesse(Math.max(.5, vitesse - .5)); else pas(-FPS); }
  else if (k === 'i' || k === 'I') { plage = [grille(T), plage?.[1] > T ? plage[1] : DUREE]; majPlage(); }
  else if (k === 'o' || k === 'O') { plage = [plage?.[0] < T ? plage[0] : 0, grille(T)]; majPlage(); }
  else if (k === 'Escape') { plage = null; majPlage(); }
  else if (k === '=' || k === '+') zoom(1.25); else if (k === '-') zoom(.8);
  else if ((k === 'Delete' || k === 'Backspace') && cueSel != null) supprimerCue();
});
$('#vue').addEventListener('wheel', e => { if (camLibre) return; e.preventDefault(); pas(e.deltaY > 0 ? 1 : -1); }, { passive: false });

// ================= clic sur l'aperçu : ce qu'on vise (la cible de la demande à Claude) =================
let selection = null;
calque.addEventListener('click', e => {
  if (camLibre || !dernier) return; const r = calque.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 1080, y = (e.clientY - r.top) / r.height * 1920, p = planA(T);
  const dans = b => b && x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
  const t = dernier.texts.find(t => dans(t.box)), s = Object.entries(dernier.cam?.sujets || {}).find(([, s]) => dans(s.box));
  const cible = t ? `texte « ${t.s} »` : s ? `${s[0]}` : null;
  selection = cible ? { ...(t ? { texte: t.s, box: t.box } : { nom: s[0] }), plan: p?.n, t: T } : null; $('#cible').hidden = !selection;
  if (selection) { $('#cible').textContent = `${cible} · plan ${p?.n ?? '?'} · ${fmt(T)}`; portee('selection'); $('#demande').focus();
    $('#suggestions').innerHTML = (t ? ['Le rendre plus lisible sur téléphone', 'Le décaler hors de la zone des boutons', 'Le faire apparaître sur son mot'] : ['Le rapprocher de la caméra', 'Plus de détails sur ce modèle', 'Changer sa couleur', 'Corriger sa trajectoire']).map(s => `<button>${s}</button>`).join('');
    $$('#suggestions button').forEach(b => b.onclick = () => { $('#demande').value = b.textContent; majAppliquer(); }); }
});
function portee(p) { $$('#portee button').forEach(b => b.classList.toggle('actif', b.dataset.p === p)); }
$$('#portee button').forEach(b => b.onclick = () => portee(b.dataset.p));
function suggestionsDefaut() { $('#suggestions').innerHTML = ['Revoir toute la vidéo et corriger ce qui cloche', 'Rendre tous les textes plus lisibles sur téléphone', 'Vérifier que chaque image tombe sur son mot'].map(s => `<button>${s}</button>`).join('');
  $$('#suggestions button').forEach(b => b.onclick = () => { $('#demande').value = b.textContent; majAppliquer(); }); }

// ================= calques =================
function masques() { if (!win?.__qa) return; const st = $('#kSousTitres').checked, tx = $('#kTextes').checked;
  win.__qa.masque = !tx ? () => true : !st ? e => (e.box[1] + e.box[3]) / 2 > 1250 && (e.box[1] + e.box[3]) / 2 < 1750 : null; }   // sous-titres : la bande 1250-1750
['#kSousTitres', '#kTextes'].forEach(k => $(k).onchange = () => { masques(); aller(T, true); });
['#kZone', '#kTiers', '#kBoites', '#kTraj', '#kProb'].forEach(k => $(k).onchange = dessinerCalques);
function dessinerCalques() {
  cx.clearRect(0, 0, 1080, 1920); const Z = P.zone;
  if ($('#kZone').checked) { cx.fillStyle = 'rgba(229,72,77,.16)'; cx.fillRect(0, 0, 1080, Z.haut); cx.fillRect(0, 1920 - Z.bas, 1080, Z.bas); cx.fillRect(0, Z.haut, Z.gauche, 1920 - Z.haut - Z.bas);
    cx.fillRect(1080 - Z.droite, Z.haut, Z.droite, Z.boutonsY - Z.haut); cx.fillRect(Z.boutonsX, Z.boutonsY, 1080 - Z.boutonsX, 1920 - Z.boutonsY - Z.bas); }
  if ($('#kTiers').checked) { cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 2; cx.beginPath(); for (const x of [360, 720]) { cx.moveTo(x, 0); cx.lineTo(x, 1920); } for (const y of [640, 1280]) { cx.moveTo(0, y); cx.lineTo(1080, y); } cx.stroke(); }
  if ($('#kBoites').checked && dernier) {
    cx.lineWidth = 3; cx.strokeStyle = 'rgba(120,200,255,.9)'; for (const t of dernier.texts) cx.strokeRect(t.box[0], t.box[1], t.box[2] - t.box[0], t.box[3] - t.box[1]);
    cx.strokeStyle = 'rgba(255,210,63,.95)'; cx.fillStyle = 'rgba(255,210,63,.95)'; cx.font = '700 30px system-ui';
    for (const [n, s] of Object.entries(dernier.cam?.sujets || {})) if (s.box) { cx.strokeRect(s.box[0], s.box[1], s.box[2] - s.box[0], s.box[3] - s.box[1]); cx.fillText(n, s.box[0] + 6, s.box[1] + 32); }
  }
  if ($('#kTraj').checked && P.traj) {
    const p = planA(T), tr = P.traj, i0 = p ? Math.round((p.t0 - tr.t0) * FPS) : 0, i1 = p ? Math.round((p.t1 - tr.t0) * FPS) : 0, ic = Math.round((T - tr.t0) * FPS);
    const coul = ['#4fc3f7', '#ffd23f', '#ff7a90', '#9be564'];
    Object.entries(tr.sujets).forEach(([n, pts], k) => { cx.strokeStyle = cx.fillStyle = coul[k % 4]; cx.lineWidth = 4; cx.beginPath(); let on = false;
      for (let i = i0; i < i1; i++) { const q = pts[i]; if (!q) { on = false; continue; } on ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); on = true; } cx.stroke();
      const q = pts[ic]; if (q) { cx.beginPath(); cx.arc(q[0], q[1], 12, 0, 7); cx.fill(); } });
  }
  if ($('#kProb').checked) for (const e of P.entrees) if (e.box && T >= e.t - 1e-6 && T <= e.t1 + 1e-6) {
    cx.lineWidth = 8; cx.strokeStyle = e.gravite === 'grave' ? '#e5484d' : '#f08c2e'; cx.strokeRect(e.box[0], e.box[1], e.box[2] - e.box[0], e.box[3] - e.box[1]);
    cx.fillStyle = cx.strokeStyle; cx.font = '700 28px system-ui'; cx.fillText(e.controle, e.box[0], Math.max(30, e.box[1] - 10));
  }
}

// ================= outil caméra =================
let camLibre = null, controles3D = null;
$('#bCam').onclick = async () => {
  if (camLibre) return quitterCam();
  if (!win?.__qa?.mainCam) return toast('Pas de caméra 3D dans cette image');
  let OC; try { OC = (await win.eval("import('/node_modules/three/examples/jsm/controls/OrbitControls.js')")).OrbitControls; } catch (e) { return toast('OrbitControls introuvable : ' + e.message, 5000); }
  if (lecture) lire(false);
  const m = win.__qa.mainCam; camLibre = m.clone(); win.__qa.camLibre = camLibre;
  controles3D = new OC(camLibre, calque); const d = m.getWorldDirection(new m.position.constructor()); controles3D.target.copy(m.position).addScaledVector(d, 12); controles3D.update();
  controles3D.addEventListener('change', () => { aller(T, true); ligneCam(); });
  calque.classList.add('camera'); $('#bCam').classList.add('actif'); $('#barreCam').hidden = false; ligneCam(); aller(T, true);
};
function quitterCam() { controles3D?.dispose(); controles3D = null; camLibre = null; if (win?.__qa) win.__qa.camLibre = null; calque.classList.remove('camera'); $('#bCam').classList.remove('actif'); $('#barreCam').hidden = true; aller(T, true); }
$('#bCamFin').onclick = () => quitterCam();
const v3 = v => `V3(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
function ligneCam() { if (!camLibre) return; $('#ligneCam').textContent = `cam(${v3(camLibre.position)}, ${v3(controles3D.target)}, ${Math.round(camLibre.fov)});`; }
$('#bCopier').onclick = () => { navigator.clipboard.writeText($('#ligneCam').textContent); toast('Cadrage copié : colle-le dans la scène (ou donne-le à Claude)'); };

// ================= timeline =================
const LAB = 92, PISTES = [['Règle', 20], ['Plans', 28], ['Narration', 22], ['Bruitages', 30], ['Ambiance', 22], ['Son', 40], ['Contrôles', 20]];
const AMB = c => c._amb ?? (c.dur ?? 0) >= 3;   // un son de plus de 3 s : une nappe d'ambiance
let pps = 0, debutTl = 0, onde = null, cueSel = null, glisse = null;   // pps = pixels par seconde
let kH = 1;   // les pistes (sauf la règle) s'étirent pour remplir la hauteur de la timeline
const yPiste = n => { let y = 0; for (const [k, h0] of PISTES) { const h = k === 'Règle' ? h0 : h0 * kH; if (k === n) return [y, h]; y += h; } };
const xDe = t => LAB + (t - debutTl) * pps, tDe = x => debutTl + (x - LAB) / pps;
function zoom(f, x) { const r = tl.getBoundingClientRect(); x ??= xDe(T); const t = tDe(x); pps = Math.min(400, Math.max((r.width - LAB - 10) / DUREE, pps * f)); debutTl = t - (x - LAB) / pps; dessinerTl(); }
$('#zPlus').onclick = () => zoom(1.5); $('#zMoins').onclick = () => zoom(1 / 1.5); $('#zTout').onclick = () => { pps = 0; debutTl = 0; dessinerTl(); };
function majPlage() { $('#plage').textContent = plage ? `plage ${fmt(plage[0])} → ${fmt(plage[1])} (Échap pour l'enlever)` : ''; $('#ePlageTxt').textContent = plage ? `(${fmt(plage[0])} → ${fmt(plage[1])})` : '(aucune : Maj + glisser sur la timeline)'; dessinerTl(); }
function lanes(L) { const fin = []; return L.map(c => { let k = fin.findIndex(f => f <= c.t); if (k < 0) { k = fin.length; fin.push(0); } fin[k] = c.t + Math.max(c.dur ?? dureeSon(c.file), .15) + .05; return k; }); }
function dessinerTl() {
  const r = tl.getBoundingClientRect(), dpr = devicePixelRatio || 1; if (!r.width || !P || P.aucun) return;
  if (tl.width !== Math.round(r.width * dpr) || tl.height !== Math.round(r.height * dpr)) { tl.width = Math.round(r.width * dpr); tl.height = Math.round(r.height * dpr); }
  tg.setTransform(dpr, 0, 0, dpr, 0, 0); const W = r.width, H = r.height; if (!pps) pps = (W - LAB - 10) / DUREE;
  kH = Math.max(1, (H - 20) / PISTES.slice(1).reduce((a, [, h]) => a + h, 0));
  debutTl = Math.max(0, Math.min(debutTl, DUREE - (W - LAB) / pps));
  if (lecture && xDe(T) > W - 40) debutTl = T - (W - LAB) * .1 / pps;
  tg.fillStyle = '#111214'; tg.fillRect(0, 0, W, H); tg.font = '11px system-ui'; tg.textBaseline = 'middle';
  for (const [n] of PISTES) { const [y, h] = yPiste(n); tg.fillStyle = '#18191c'; tg.fillRect(0, y, LAB, h); tg.fillStyle = '#8b8d94'; if (n !== 'Règle') tg.fillText(n, 10, y + h / 2); tg.fillStyle = '#2a2c31'; tg.fillRect(0, y + h - 1, W, 1); }
  tg.save(); tg.beginPath(); tg.rect(LAB, 0, W - LAB, H); tg.clip();
  if (plage) { tg.fillStyle = 'rgba(255,210,63,.10)'; tg.fillRect(xDe(plage[0]), 0, xDe(plage[1]) - xDe(plage[0]), H); tg.fillStyle = 'rgba(255,210,63,.7)'; tg.fillRect(xDe(plage[0]), 0, 1, H); tg.fillRect(xDe(plage[1]), 0, 1, H); }
  const pasR = [1, 2, 5, 10, 15, 30].find(s => s * pps > 60) || 60;
  tg.fillStyle = '#8b8d94'; for (let s = Math.ceil(debutTl / pasR) * pasR; s < tDe(W); s += pasR) { const x = xDe(s); tg.fillRect(x, 12, 1, 8); tg.fillText(fmt(s).replace(/\.\d+$/, ''), x + 3, 8); }
  let [y, h] = yPiste('Plans');
  for (const p of P.plans) { const x0 = xDe(p.t0), x1 = xDe(p.t1); if (x1 < LAB || x0 > W) continue; tg.fillStyle = planA(T) === p ? '#3a3d45' : '#26282d'; tg.fillRect(x0 + 1, y + 3, x1 - x0 - 2, h - 6); tg.fillStyle = '#e8e8ea'; tg.fillText(`${p.n} ${p.texte}`.slice(0, Math.max(0, Math.floor((x1 - x0 - 8) / 6))), x0 + 5, y + h / 2); }
  if (plansModifiables()) { tg.fillStyle = '#9aa0ad'; for (let i = 1; i < P.plans.length; i++) tg.fillRect(xDe(P.plans[i].t0) - 1, y + 3, 2, h - 6); }
  [y, h] = yPiste('Narration');
  for (const w of P.mots || []) { const x0 = xDe(w.start), x1 = xDe(Math.max(w.end, w.start + .05)); if (x1 < LAB || x0 > W) continue; const on = T >= w.start && T < w.end; tg.fillStyle = on ? '#ffd23f' : '#2f3238'; tg.fillRect(x0, y + 3, Math.max(2, x1 - x0 - 1), h - 6);
    if (x1 - x0 > 24) { tg.fillStyle = on ? '#111' : '#c9cbd1'; tg.fillText(w.w.slice(0, Math.floor((x1 - x0) / 6)), x0 + 3, y + h / 2); } }
  const S = P.cues?.sfx || [], ponct = S.map((c, i) => [c, i]).filter(([c]) => !AMB(c)), amb = S.map((c, i) => [c, i]).filter(([c]) => AMB(c));
  [y, h] = yPiste('Bruitages'); const lp = lanes(ponct.map(([c]) => c)), nl = Math.max(1, Math.min(3, Math.max(0, ...lp) + 1)), hl = (h - 4) / nl;
  ponct.forEach(([c, i], k) => { const x0 = xDe(c.t), x1 = xDe(c.t + Math.max(c.dur ?? dureeSon(c.file), .15)); const yy = y + 2 + (lp[k] % 3) * hl; c._y = [yy, hl - 2]; if (x1 < LAB || x0 > W) return; const fort = Math.max(.25, Math.min(1, (c.db + 40) / 35));
    tg.fillStyle = i === cueSel ? '#ffd23f' : `rgba(240,140,46,${.35 + .5 * fort})`; tg.fillRect(x0, yy, Math.max(4, x1 - x0), hl - 2);
    if (x1 - x0 > 50) { tg.fillStyle = '#111'; tg.font = '9px system-ui'; tg.fillText(`${nomSon(c.file)} ${c.db}`, x0 + 3, yy + hl / 2 - 1); tg.font = '11px system-ui'; } });
  [y, h] = yPiste('Ambiance'); const la = lanes(amb.map(([c]) => c)), na = Math.max(1, Math.min(2, Math.max(0, ...la) + 1)), ha = (h - 4) / na;
  amb.forEach(([c, i], k) => { const x0 = xDe(c.t), x1 = xDe(c.t + c.dur), yy = y + 2 + (la[k] % 2) * ha; c._y = [yy, ha - 2]; if (x1 < LAB || x0 > W) return; tg.fillStyle = i === cueSel ? '#ffd23f' : '#2d4a5e'; tg.fillRect(x0, yy, x1 - x0 - 1, ha - 2);
    if (x1 - x0 > 40) { tg.fillStyle = '#cfe3f0'; tg.font = '9px system-ui'; tg.fillText(`${nomSon(c.file)} ${c.db} dB`.slice(0, Math.floor((x1 - x0) / 5)), x0 + 4, yy + ha / 2 - 1); tg.font = '11px system-ui'; } });
  [y, h] = yPiste('Son');
  if (onde) { tg.fillStyle = '#4b6a8a'; const a = Math.max(0, Math.floor(debutTl / onde.pas)), pasPx = Math.max(1, Math.floor(1 / (pps * onde.pas)));
    for (let i = a; i < onde.pics.length; i += pasPx) { const x = xDe(i * onde.pas); if (x > W) break; let m = 0; for (let j = i; j < i + pasPx; j++) m = Math.max(m, onde.pics[j] || 0); const hh = Math.max(1, m * (h - 6)); tg.fillRect(x, y + h / 2 - hh / 2, Math.max(1, pasPx * pps * onde.pas - .5), hh); } }
  else { tg.fillStyle = '#8b8d94'; tg.fillText('pas de mix', LAB + 8, y + h / 2); }
  [y, h] = yPiste('Contrôles');
  for (const e of P.entrees) { const x0 = xDe(e.t), x1 = Math.max(xDe(e.t1 ?? e.t), x0 + 3); if (x1 < LAB || x0 > W) continue; tg.fillStyle = e.gravite === 'grave' ? '#e5484d' : e.gravite === 'moyen' ? '#f08c2e' : '#555860'; tg.fillRect(x0, y + 4, x1 - x0, h - 8); }
  if (glisse && guide != null) { tg.fillStyle = '#38d6ff'; tg.fillRect(xDe(guide) - .5, 0, 1, H); }
  const xt = xDe(T); tg.fillStyle = '#fff'; tg.fillRect(xt, 0, 1.5, H); tg.beginPath(); tg.moveTo(xt - 5, 0); tg.lineTo(xt + 6, 0); tg.lineTo(xt + .75, 7); tg.fill();
  tg.restore();
}
const nomSon = f => f.split('/').pop().replace(/\.\w+$/, '');
const durees = {}; function dureeSon(f) { if (durees[f] != null) return durees[f]; durees[f] = .5; const a = new Audio(); a.preload = 'metadata'; a.src = sonUrl(f); a.onloadedmetadata = () => { durees[f] = a.duration; dessinerTl(); }; return .5; }
const sonUrl = f => /^[a-z]:/i.test(f) ? '/__sfx/' + f.replace(/\\/g, '/').replace(/^c:\/tiktok\/chat\/sfx\//i, '') : '/' + f;
function cueA(x, y) { const s = P?.cues?.sfx || [];
  for (let i = s.length - 1; i >= 0; i--) { const c = s[i]; if (!c._y) continue; const x0 = xDe(c.t), x1 = xDe(c.t + Math.max(c.dur ?? dureeSon(c.file), .15)); if (x >= x0 - 2 && x <= Math.max(x1, x0 + 4) + 2 && y >= c._y[0] && y <= c._y[0] + c._y[1]) return i; } return null; }
let sauvegarde; function sauverCues() { clearTimeout(sauvegarde); sauvegarde = setTimeout(async () => { const propre = { ...P.cues, sfx: P.cues.sfx.map(({ _y, _amb, ...c }) => c) }; const r = await api('cues', propre); toast(r.ok ? 'cues.json enregistré' : 'Pas enregistré : ' + r.erreur, 4000); }, 400); }
function supprimerCue() { retenir('cues'); P.cues.sfx.splice(cueSel, 1); cueSel = null; sauverCues(); dessinerTl(); }
tl.addEventListener('mousedown', e => {
  const r = tl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (x < LAB) return;
  if (e.shiftKey) { glisse = { plage: grille(tDe(x)) }; plage = [glisse.plage, glisse.plage]; majPlage(); return; }
  const c = cibleTl(x, y); if (c) { if (lecture) lire(false); glisse = { ...c, x0: x, bouge: false }; if (c.cue != null) cueSel = c.cue; dessinerTl(); return; }
  cueSel = null; if (lecture) lire(false); glisse = { tete: true }; aller(tDe(x));
});
addEventListener('mousemove', e => {
  const r = tl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if (glisse?.plage != null) { const t = grille(tDe(x)); plage = [Math.min(glisse.plage, t), Math.max(glisse.plage, t)]; majPlage(); return; }
  if (glisse?.tete) return aller(tDe(x), true);
  if (glisse?.k) { if (!glisse.bouge && Math.abs(x - glisse.x0) < 3) return; tirer(glisse, tDe(x), e); dessinerTl(); return; }
  tl.style.cursor = (cibleTl(x, y) || {}).curseur || ''; bulle(x, y);
});
addEventListener('mouseup', () => { if (glisse?.k) lacher(glisse); if (glisse?.tete) aller(grille(T)); if (glisse?.plage != null && plage[1] - plage[0] < 2 / FPS) { plage = null; majPlage(); } glisse = null; });
// ---- la timeline façon CapCut : glisser une borne de plan, un mot (ou ses bords), un son (ou son bord droit) ; aimant ; Ctrl Z ----
let aimant = true, guide = null; const hist = [], MIN_PLAN = 10 / 30;
try { aimant = localStorage.getItem('studio.aimant') !== '0'; } catch {}
const plansModifiables = () => P && !P.lectureSeule && !!P.sections && P.plans.every(p => p.id);
const motsModifiables = () => P && !P.lectureSeule && !!P.mots?.length;
function cibleTl(x, y) {   // ce qui est sous la souris et se laisse tirer
  const piste = PISTES.find(([n]) => { const [py, ph] = yPiste(n); return y >= py && y < py + ph; })?.[0];
  if (piste === 'Plans' && plansModifiables()) { for (let i = 1; i < P.plans.length; i++) if (Math.abs(x - xDe(P.plans[i].t0)) <= 5) return { k: 'borne', i, curseur: 'col-resize' }; }
  if (piste === 'Narration' && motsModifiables()) { const dans = m => w => x >= xDe(w.start) - m && x <= xDe(Math.max(w.end, w.start + .05)) + m; let j = P.mots.findIndex(dans(0)); if (j < 0) j = P.mots.findIndex(dans(3)); if (j >= 0) { const w = P.mots[j], x0 = xDe(w.start), x1 = xDe(w.end);
    return x1 - x0 > 12 && x - x0 < 4 ? { k: 'motDebut', j, curseur: 'w-resize' } : x1 - x0 > 12 && x1 - x < 4 ? { k: 'motFin', j, curseur: 'e-resize' } : { k: 'mot', j, dx: tDe(x) - w.start, curseur: 'grab' }; } }
  if ((piste === 'Bruitages' || piste === 'Ambiance') && P.cues && !P.lectureSeule) { const i = cueA(x, y); if (i != null) { const c = P.cues.sfx[i], x1 = xDe(c.t + Math.max(c.dur ?? dureeSon(c.file), .15));
    return x1 - xDe(c.t) > 12 && x1 - x < 5 ? { k: 'cueFin', cue: i, curseur: 'e-resize' } : { k: 'cue', cue: i, dx: tDe(x) - c.t, curseur: 'grab' }; } }
  return null;
}
// l'aimant : la grille des images toujours ; et, à 7 px près, la tête de lecture, les bornes des plans, les mots, les débuts des sons (Alt : sans aimant)
function aimante(t, e, sauf = []) {
  t = grille(t); guide = null; if (!aimant || e.altKey) return t;
  const C = [T]; for (const p of P.plans) if (!sauf.includes(p)) C.push(p.t0, p.t1);
  for (const w of P.mots || []) if (!sauf.includes(w)) C.push(w.start, w.end);
  for (const c of P.cues?.sfx || []) if (!sauf.includes(c)) C.push(c.t);
  let m = null; for (const c of C) if (Math.abs(c - t) * pps < 7 && (m == null || Math.abs(c - t) < Math.abs(m - t))) m = c;
  if (m == null) return t; guide = m; return grille(m);
}
const etatTl = k => JSON.stringify(k === 'plans' ? P.plans.map(({ id, t0, t1, f0, f1 }) => ({ id, t0, t1, f0, f1 })) : k === 'mots' ? P.mots.map(({ start, end }) => ({ start, end })) : P.cues.sfx.map(({ _y, _amb, ...c }) => c));
function retenir(k) { hist.push({ k, avant: etatTl(k) }); if (hist.length > 50) hist.shift(); }
function tirer(g, t, e) {
  if (!g.bouge) { g.bouge = true; g.avant = etatTl(g.k === 'borne' ? 'plans' : g.k.startsWith('mot') ? 'mots' : 'cues'); retenir(g.k === 'borne' ? 'plans' : g.k.startsWith('mot') ? 'mots' : 'cues'); }
  if (g.k === 'borne') { const a = P.plans[g.i - 1], b = P.plans[g.i]; const v = Math.min(b.t1 - MIN_PLAN, Math.max(a.t0 + MIN_PLAN, aimante(t, e, [a, b]))); a.t1 = b.t0 = v; }
  else if (g.k.startsWith('mot')) { const w = P.mots[g.j], av = P.mots[g.j - 1], ap = P.mots[g.j + 1], bas = av ? av.end : 0, haut = ap ? ap.start : DUREE;
    if (g.k === 'mot') { const d = w.end - w.start, s = Math.min(haut - d, Math.max(bas, aimante(t - g.dx, e, [w]))); w.start = s; w.end = +(s + d).toFixed(3); }
    else if (g.k === 'motDebut') w.start = Math.min(w.end - 1 / FPS, Math.max(bas, aimante(t, e, [w])));
    else w.end = Math.max(w.start + 1 / FPS, Math.min(haut, aimante(t, e, [w]))); }
  else { const c = P.cues.sfx[g.cue]; c._amb ??= AMB(c);
    if (g.k === 'cue') c.t = Math.max(0, aimante(t - g.dx, e, [c]));
    else { const nat = durees[c.file] ?? 99, d = aimante(t, e, [c]) - c.t; c.dur = +Math.max(.1, c._amb ? d : Math.min(nat, d)).toFixed(3); } }   // un bruitage ne se rallonge pas au-delà de son fichier (audio.py le bouclerait)
}
async function lacher(g) {
  guide = null; if (!g.bouge) { if (g.k.startsWith('mot')) aller(tDe(g.x0)); dessinerTl(); return; }
  if (etatTl(hist.at(-1).k) === g.avant) { hist.pop(); if (g.cue != null) delete P.cues.sfx[g.cue]._amb; dessinerTl(); return; }
  if (g.k === 'borne') await sauverPlans(JSON.parse(g.avant));
  else if (g.k.startsWith('mot')) await sauverMots(JSON.parse(g.avant));
  else { delete P.cues.sfx[g.cue]._amb; sauverCues(); }
  dessinerTl();
}
// serveur = ce que le fichier contient encore : le serveur refuse si ça a changé entre-temps
// exact = les valeurs du fichier à remettre telles quelles (Ctrl Z) ; sinon seule la borne déplacée change, l'autre garde sa valeur du fichier
async function sauverPlans(serveur, exact) {
  const C = P.plans.map(p => { const s = serveur.find(s => s.id === p.id), e = exact?.find(e => e.id === p.id); if (!s || (s.t0 === p.t0 && s.t1 === p.t1)) return null;
    return { id: p.id, t0: e ? e.f0 : s.t0 !== p.t0 ? p.t0 : s.f0, t1: e ? e.f1 : s.t1 !== p.t1 ? p.t1 : s.f1, avant: { t0: s.f0, t1: s.f1 } }; }).filter(Boolean);
  if (!C.length) return; const r = await api('plans', { changements: C });
  if (!r.ok) { for (const s of serveur) Object.assign(P.plans.find(p => p.id === s.id) || {}, s); toast('Pas enregistré : ' + r.erreur, 5000); return; }
  for (const c of C) Object.assign(P.plans.find(p => p.id === c.id), { f0: c.t0, f1: c.t1 });
  toast('Plans enregistrés : la scène se recharge'); listePlans();
}
async function sauverMots(serveur) {
  const r = await api('mots', { mots: P.mots.map(({ w, start, end }) => ({ w, start, end })) });
  if (!r.ok) { serveur.forEach((s, i) => Object.assign(P.mots[i], s)); toast('Pas enregistré : ' + r.erreur, 5000); return; }
  toast('Mots recalés : seuls les sous-titres bougent (la voix reste la même)'); ouvrirScene();
}
async function annulerTl() {
  const h = hist.pop(); if (!h) return toast('Rien à annuler sur la timeline');
  const maintenant = JSON.parse(etatTl(h.k)), avant = JSON.parse(h.avant);
  if (h.k === 'plans') { for (const s of avant) Object.assign(P.plans.find(p => p.id === s.id) || {}, { t0: s.t0, t1: s.t1 }); await sauverPlans(maintenant, avant); }
  else if (h.k === 'mots') { avant.forEach((s, i) => Object.assign(P.mots[i], s)); await sauverMots(maintenant); }
  else { P.cues.sfx = avant; cueSel = null; sauverCues(); }
  dessinerTl(); toast('Annulé');
}
$('#bAimant').classList.toggle('actif', aimant);
$('#bAimant').onclick = () => { aimant = !aimant; $('#bAimant').classList.toggle('actif', aimant); try { localStorage.setItem('studio.aimant', aimant ? '1' : '0'); } catch {} toast(aimant ? 'Aimant : les objets se collent aux mots, aux plans et à la tête de lecture' : 'Aimant coupé (seulement la grille des images)'); };
function grand(on) { $('#editeur').classList.toggle('grand', on); $('#zGrand').classList.toggle('actif', on); try { localStorage.setItem('studio.tlGrand', on ? '1' : '0'); } catch {} requestAnimationFrame(() => { ajuster(); pps = 0; dessinerTl(); }); }
$('#zGrand').onclick = () => grand(!$('#editeur').classList.contains('grand'));
try { if (localStorage.getItem('studio.tlGrand') === '1') grand(true); } catch {}
tl.addEventListener('dblclick', e => { const r = tl.getBoundingClientRect(), i = cueA(e.clientX - r.left, e.clientY - r.top); if (i != null) new Audio(sonUrl(P.cues.sfx[i].file)).play(); });
tl.addEventListener('wheel', e => {
  e.preventDefault(); const r = tl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, i = cueA(x, y);
  if (e.ctrlKey) zoom(e.deltaY < 0 ? 1.25 : .8, x);
  else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) debutTl += (e.deltaX || e.deltaY) / pps;
  else if (i != null) { P.cues.sfx[i].db = Math.round(P.cues.sfx[i].db + (e.deltaY < 0 ? 1 : -1)); cueSel = i; sauverCues(); bulle(x, y); }
  else pas(e.deltaY > 0 ? 1 : -1);
  dessinerTl();
}, { passive: false });
function bulle(x, y) {
  const b = $('#bulle'), r = tl.getBoundingClientRect(); if (x < LAB || x > r.width || y < 0 || y > r.height) return b.hidden = true;
  const t = tDe(x), piste = PISTES.find(([n]) => { const [py, ph] = yPiste(n); return y >= py && y < py + ph; })?.[0]; let m = '';
  if (piste === 'Règle') m = fmt(t);
  else if (piste === 'Plans') { const c = cibleTl(x, y), p = planA(t); if (c?.k === 'borne') m = `Glisser : la limite entre le plan ${c.i} et le plan ${c.i + 1} (${fmt(P.plans[c.i].t0)})`; else if (p) m = `Plan ${p.n} · ${fmt(p.t0)} → ${fmt(p.t1)}<br>${esc(p.texte)}`; }
  else if (piste === 'Narration') { const w = P.mots.find(w => t >= w.start && t < Math.max(w.end, w.start + .05)); if (w) m = `« ${esc(w.w)} » ${fmt(w.start)}`; }
  else if (piste === 'Bruitages' || piste === 'Ambiance') { const i = cueA(x, y); if (i != null) { const c = P.cues.sfx[i]; m = `${esc(nomSon(c.file))} · ${fmt(c.t)} · ${c.db} dB${c.dur ? ' · ' + c.dur.toFixed(1) + ' s' : ''}<br><span class="discret">${esc(c.file)}</span>`; } }
  else if (piste === 'Contrôles') { const es = P.entrees.filter(e => t >= e.t - 2 / pps && t <= (e.t1 ?? e.t) + 2 / pps); if (es.length) m = es.slice(0, 4).map(e => `<b>${esc(e.controle)}</b> · ${esc(e.probleme)}`).join('<br>'); }
  if (!m) return b.hidden = true;
  b.innerHTML = m; b.hidden = false; b.style.left = Math.min(x + 12, r.width - 300) + 'px'; b.style.top = Math.max(0, y + 18) + 'px';
}
tl.addEventListener('mouseleave', () => $('#bulle').hidden = true);
tl.addEventListener('dragover', e => e.preventDefault());
tl.addEventListener('drop', e => {
  e.preventDefault(); const s = JSON.parse(e.dataTransfer.getData('text/plain') || 'null'); if (!s?.chemin || !P.cues) return;
  const r = tl.getBoundingClientRect(), t = Math.max(0, grille(tDe(e.clientX - r.left)));
  retenir('cues'); P.cues.sfx.push({ t, file: 'C:/tiktok/chat/sfx/' + s.chemin, db: -20 }); cueSel = P.cues.sfx.length - 1; sauverCues(); dessinerTl(); toast(`« ${s.nom} » ajouté à ${fmt(t)}`);
});

// ================= sons du pack =================
let ecoute = null, chercheT;
async function chercher() { const l = await api('sons?q=' + encodeURIComponent($('#qSons').value));
  $('#sons').innerHTML = l.map((s, i) => `<li draggable="true" data-i="${i}"><div>${esc(s.nom.replace(/ - [\d.]+ s - \d+\.\w+$/, ''))}</div><div class="c">${esc(s.cat)} · ${s.duree ? s.duree.toFixed(1) + ' s' : ''}</div></li>`).join('') || '<li class="discret">Rien trouvé</li>';
  $$('#sons li[draggable]').forEach(li => { const s = l[+li.dataset.i];
    li.onmouseenter = () => { ecoute?.pause(); ecoute = new Audio('/__sfx/' + s.chemin); ecoute.volume = .6; ecoute.play().catch(() => {}); };
    li.onmouseleave = () => { ecoute?.pause(); ecoute = null; };
    li.ondragstart = e => e.dataTransfer.setData('text/plain', JSON.stringify(s)); }); }
$('#qSons').oninput = () => { clearTimeout(chercheT); chercheT = setTimeout(chercher, 200); };

// ================= en-tête du projet : versions et onglets =================
let onglet = 'video';
const ONGLETS = ['video', 'script', 'couverture', 'publier', 'resultats'];
const mediane = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const jour = d => d ? d.split('-').reverse().join('/') : '';
function majVersions() {
  const V = P.versions || { lectureSeule: true }, b = $('#bVersion');
  b.hidden = !!V.lectureSeule; $('#bCreerV').hidden = V.lectureSeule || !V.figee;
  $('#bExport').classList.toggle('primaire', !V.figee && onglet === 'video');   // un seul bouton principal par écran
  $('#figee').hidden = !V.figee;
  if (V.lectureSeule) return;
  b.innerHTML = `<i class="${V.figee ? 'pt-ok' : 'pt-j'}"></i> V${V.courante} · ${V.figee ? 'publiée' : 'brouillon'} ▾`;
  $('#bCreerV').textContent = `＋ Créer la V${V.courante + 1}`;
  $('#figee').innerHTML = `<b>V${V.courante} publiée, figée.</b> Pour changer quelque chose, crée la V${V.courante + 1} (bouton en haut) : la V${V.courante} reste intacte et on pourra comparer les deux.`;
  $('#demande').disabled = !!V.figee; $('#demande').placeholder = V.figee ? `Crée la V${V.courante + 1} pour demander un changement` : 'Décris un changement, ou clique d\u2019abord sur quelque chose dans l\u2019aperçu…';
  const pub = V.publiees || [];
  $('#popVersions').innerHTML = `<div class="popTete"><b>Versions</b><span class="espace"></span><button class="ico" data-ferme>✕</button></div>
    ${pub.map(p => `<div class="ligne-v"><b>V${p.n}</b> publiée le ${jour(p.date)} · <a href="${esc(p.lien)}" target="_blank" rel="noopener">${esc(p.plateforme)}</a>${p.fichier ? ` · <a href="/__fichier?p=${encodeURIComponent(P.projet + '/' + p.fichier)}" target="_blank">la vidéo publiée</a>` : ''}</div>`).join('')}
    ${V.figee ? '' : `<div class="ligne-v"><b>V${V.courante}</b> brouillon · en cours</div>`}
    <p class="discret petit">Chaque version publiée est gardée telle quelle (étiquette git v1, v2… dans l\u2019historique du projet).</p>`;
  $('#popVersions [data-ferme]').onclick = () => $('#popVersions').hidden = true;
}
$('#bCreerV').onclick = async () => { const r = await api('versions', { action: 'nouvelle' }); if (r.erreur) return toast(r.erreur, 5000);
  await charger(); toast(`V${r.courante} créée : la V${r.courante - 1} publiée reste intacte`, 4000); };
function choisirOnglet() {
  const o = new URLSearchParams(location.hash.split('?')[1] || '').get('o');
  onglet = ONGLETS.includes(o) ? o : 'video';
  $$('#ongletsProjet a').forEach(a => a.classList.toggle('actif', a.dataset.o === onglet));
  $('#editeur').classList.toggle('autre-onglet', onglet !== 'video'); $('#ongletProjet').hidden = onglet === 'video';
  if (onglet !== 'video' && lecture) lire(false);
  if (P && !P.aucun) majVersions();
  if (onglet === 'video') { ajuster(); pps = 0; dessinerTl(); } else if (P && !P.aucun) remplirOnglet();
}
addEventListener('hashchange', () => { if (location.hash.startsWith('#/editeur')) choisirOnglet(); });
async function remplirOnglet() {
  const z = $('#ongletProjet'), o = onglet;
  z.innerHTML = '<p class="discret">Chargement…</p>';
  if (o === 'script') {
    const [s, sb] = await Promise.all([P.script ? api('texte?f=' + encodeURIComponent(P.script)) : null, P.storyboard ? api('texte?f=' + encodeURIComponent(P.storyboard)) : null]);
    if (onglet !== o) return;
    z.innerHTML = `<div class="onglet-deux"><div class="bloc"><h2>Script</h2>${s?.texte ? md(s.texte) : '<p class="discret">Pas de script.md dans ce projet.</p>'}</div>
      <div class="bloc"><h2>Storyboard</h2>${sb?.texte ? md(sb.texte) : '<p class="discret">Pas encore de storyboard : le directeur l\u2019écrit pendant la construction.</p>'}</div></div>
      <p class="discret petit">En lecture ici : changer le script rendrait la voix périmée. Pour le modifier, demande-le à Claude (à droite), puis refais la voix.</p>`;
  } else if (o === 'couverture') {
    const R = (await api('rendus?tous')).filter(r => r.projet === P.nom && (r.type === 'image' || r.type === 'couverture'));
    if (onglet !== o) return;
    z.innerHTML = `<div class="tete-onglet"><h2>Couverture</h2><span class="espace"></span><button class="${P.versions?.figee ? '' : 'primaire'}" id="bCouvT">Couverture à ${fmt(T)}</button></div>
      <p class="discret">L\u2019image de la vidéo à l\u2019instant de la tête de lecture (onglet Vidéo), en 1080×1920. Ensuite viendra l\u2019atelier complet : titre, variantes, aperçu sur ta grille TikTok et en miniature YouTube.</p>
      <div class="grille-couv">${R.map(r => `<figure><a href="${r.url}" target="_blank"><img src="${r.url}" loading="lazy" alt="${esc(r.nom)}"></a><figcaption>${esc(r.nom)}</figcaption></figure>`).join('') || '<p class="discret">Pas encore de couverture pour ce projet.</p>'}</div>`;
    $('#bCouvT').onclick = () => api('tache', { type: 'couverture', at: T }).then(r => toast(r.ok ? `Couverture à ${fmt(T)} en cours (elle apparaîtra ici)` : r.erreur || 'Une tâche tourne déjà', 4000));
  } else if (o === 'publier') {
    const V = await api('versions'), e = P.etapes || {}; if (onglet !== o) return;
    const graves = P.rapport ? Object.values(P.rapport.compte).reduce((a, c) => a + c.grave, 0) : null;
    const pub = V.publiees || [], case_ = (ok, t, aide) => `<li class="${ok ? 'ok' : ''}"><span>${ok ? '✓' : '○'}</span>${t}${ok || !aide ? '' : ` <span class="discret">· ${aide}</span>`}</li>`;
    z.innerHTML = `<div class="onglet-etroit"><h2>${V.lectureSeule ? 'Publier' : `Publier la V${V.courante}`}</h2>
      <p class="discret">Tu publies toi-même, dans TikTok ou YouTube. Ici : la liste de contrôle, puis le lien de la vidéo une fois en ligne, ce qui fige cette version.</p>
      <ul class="controle-pub">${case_(e.export, 'Vidéo exportée', 'bouton « Exporter » de l\u2019onglet Vidéo')}${case_(e.son, 'Son mixé à −14 LUFS', 'bouton « Mixer » du pipeline')}${case_(e.controle && graves === 0, 'Vidéo contrôlée, sans problème grave', graves ? graves + ' problème(s) grave(s)' : 'bouton « Contrôler »')}</ul>
      ${V.lectureSeule ? '<p class="discret">Projet de tiktok-motion, en lecture seule : « Copier dans le studio » d\u2019abord.</p>'
        : V.figee ? `<div class="bloc">La V${V.courante} est publiée et figée. Pour la suite : « Créer la V${V.courante + 1} », en haut.</div>`
        : `<label class="champ-lien">Lien de la vidéo publiée<input id="pLien" placeholder="https://www.tiktok.com/@compte/video/…" autocomplete="off"></label>
           <p class="discret petit">L\u2019adresse de la page de la vidéo (tiktok.com/@compte/video/… ou un lien YouTube), pas le lien de partage vm.tiktok.com.</p>
           <button class="primaire" id="pPublier">Marquer la V${V.courante} publiée</button>`}
      ${pub.length ? `<h3 style="margin-top:22px">Versions publiées</h3><table class="liste-projets"><tbody>${pub.map(p => `<tr><td><b>V${p.n}</b></td><td>${jour(p.date)}</td><td><a href="${esc(p.lien)}" target="_blank" rel="noopener">${esc(p.plateforme)}</a></td><td class="discret">${p.plateforme !== 'TikTok' ? 'statistiques YouTube : plus tard' : p.stats ? 'dans les statistiques' : 'pas encore dans les statistiques'}</td></tr>`).join('')}</tbody></table>` : ''}</div>`;
    const bp = $('#pPublier'); if (bp) bp.onclick = async () => {
      if (!confirm(`Marquer la V${V.courante} publiée ?\n\nElle sera figée : pour la changer, il faudra créer la V${V.courante + 1}.`)) return;
      const r = await api('versions', { action: 'publier', lien: $('#pLien').value }); if (r.erreur) return toast(r.erreur, 6000);
      await charger(); toast(`V${r.version.n} publiée et figée${r.version.stats ? '' : ' (pas encore dans les statistiques)'}`, 4000); };
  } else if (o === 'resultats') {
    const V = await api('versions'), p = (V.publiees || []).at(-1); if (onglet !== o) return;
    const vide = m => z.innerHTML = `<div class="onglet-etroit"><h2>Résultats</h2><div class="vide-onglet">${m}</div></div>`;
    if (V.lectureSeule) return vide('Projet de tiktok-motion : ses statistiques sont dans la page Statistiques.');
    if (!p) return vide('Pas encore publiée. Une fois la vidéo en ligne, colle son lien dans l\u2019onglet <a href="#/editeur?o=publier">Publier</a> : ses chiffres arriveront ici.');
    if (p.plateforme !== 'TikTok') return vide('Les statistiques YouTube arriveront plus tard (YouTube Analytics).');
    if (!p.stats) return vide(`La V${p.n} n\u2019est pas encore dans les statistiques de tiktok-tracker. Elles arrivent à la prochaine collecte.`);
    const [st, c] = await Promise.all([api('stats?compte=' + encodeURIComponent(p.stats)), api('courbe?video=' + p.id)]); if (onglet !== o) return;
    // la médiane des 20 dernières vidéos du compte (sans celle-ci) : les très anciennes (une autre époque du compte) fausseraient la comparaison
    const v = (st.videos || []).find(x => x.video_id === p.id), A = (st.videos || []).filter(x => x.video_id !== p.id).sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, 20);
    if (!v) return vide('Vidéo introuvable dans les statistiques.');
    const mV = mediane(A.map(x => x.views)), mF = mediane(A.map(x => x.finish_rate)), mT = mediane(A.filter(x => x.avg_watch_time_s != null).map(x => x.avg_watch_time_s / x.duration_s));
    const k = n => n == null ? '–' : n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(n), pc = x => x == null ? '–' : Math.round(x * 100) + ' %';
    const cmp = (a, b, f) => a == null || b == null ? '' : `<div class="cmp" style="color:${a >= b ? 'var(--ok)' : 'var(--grave)'}">${a >= b ? '▲ au-dessus' : '▼ en dessous'} de ta médiane récente (${f(b)})</div>`;
    const d = v.duration_s, W = 900, H = 230, X = s => 44 + s / d * (W - 64), Y = r => 12 + (1 - r) * (H - 34), perte = c[1] ? Math.round((1 - c[1].value) * 100) : null;
    z.innerHTML = `<div class="tete-onglet"><h2>Résultats de la V${p.n}</h2><span class="espace"></span><button class="${P.versions?.figee ? '' : 'primaire'}" id="rDemande">${P.versions?.figee ? 'Créer la V' + (p.n + 1) + ' et préparer la demande' : 'Préparer la demande à Claude'}</button></div>
      <p class="discret">Publiée le ${jour(p.date)} · chiffres de TikTok Studio (tiktok-tracker) · comparés à la <b>médiane de tes 20 dernières vidéos</b>, pas à la moyenne qu\u2019une seule vidéo très vue fausserait.</p>
      <div class="chiffres-r"><div class="bloc"><b>${k(v.views)}</b><span>vues</span>${cmp(v.views, mV, k)}</div>
        <div class="bloc"><b>${v.avg_watch_time_s == null ? '–' : v.avg_watch_time_s.toFixed(1).replace('.', ',') + ' s'}</b><span>temps moyen, sur ${Math.round(d)} s</span>${cmp(v.avg_watch_time_s == null ? null : v.avg_watch_time_s / d, mT, x => pc(x) + ' de la vidéo')}</div>
        <div class="bloc"><b>${pc(v.finish_rate)}</b><span>vont au bout</span>${cmp(v.finish_rate, mF, pc)}</div>
        <div class="bloc"><b>${v.likes ?? '–'}</b><span>j\u2019aime · ${v.saves ?? '–'} enregistrements</span></div>
        <div class="bloc"><b>${v.comments ?? '–'}</b><span>commentaires · ${v.shares ?? '–'} partages</span></div></div>
      ${c.length ? `<div class="bloc"><h3>Rétention</h3><svg viewBox="0 0 ${W} ${H}" class="courbe-r" role="img" aria-label="Courbe de rétention">
        ${[1, .5, .25].map(r => `<line x1="44" x2="${W - 20}" y1="${Y(r)}" y2="${Y(r)}" stroke="#2a2c31"/><text x="2" y="${Y(r) + 4}" fill="#a3a5ac" font-size="12">${r * 100} %</text>`).join('')}
        ${[0, 10, 20, 30, 40, 50, 60, 90, 120].filter(s => s <= d).map(s => `<text x="${X(s) - 8}" y="${H - 4}" fill="#a3a5ac" font-size="12">${s} s</text>`).join('')}
        <rect x="${X(0)}" y="12" width="${X(Math.min(3, d)) - X(0)}" height="${H - 34}" fill="#ff6b6e1f"/><text x="${X(0) + 6}" y="28" fill="#ff6b6e" font-size="12">le hook</text>
        <path d="${c.map((q, i) => `${i ? 'L' : 'M'}${X(q.second).toFixed(1)},${Y(q.value).toFixed(1)}`).join(' ')}" fill="none" stroke="#ededef" stroke-width="2.5"/></svg>
        ${perte != null ? `<p class="petit"><b style="color:var(--grave)">−${perte} % dans la 1re seconde.</b></p>` : ''}</div>` : '<p class="discret">Pas de courbe de rétention pour cette vidéo.</p>'}`;
    $('#rDemande').onclick = async () => {
      if (P.versions?.figee) { const r = await api('versions', { action: 'nouvelle' }); if (r.erreur) return toast(r.erreur, 5000); await charger(); }
      $('#demande').value = `Chiffres de la V${p.n} publiée : ${v.views} vues (médiane des 20 dernières : ${Math.round(mV ?? 0)}), temps moyen ${v.avg_watch_time_s ?? '?'} s sur ${Math.round(d)} s, ${pc(v.finish_rate)} vont au bout (médiane ${pc(mF)})${perte != null ? `, ${perte} % partent dans la 1re seconde` : ''}. Propose 3 à 5 changements pour la V${p.n + 1}, chacun relié à un de ces chiffres. Ne modifie rien encore : liste-les d\u2019abord.`;
      majAppliquer(); $('#demande').focus(); toast('Demande prête à droite : relis-la, puis « Appliquer »', 4000); };
  }
}

// ================= export =================
$('#bExport').onclick = () => {
  if (!P.page) return toast('Pas encore de scène à exporter');
  $('#eNom').value = P.nom + (P.versions?.courante > 1 ? '-v' + P.versions.courante : ''); $('#eInfo').textContent = `1080×1920, ${FPS} i/s, H.264, flou de mouvement par sous-images (obturateur ${P.shutter}), avec le mix${P.mix ? ' (' + P.mix + ')' : ' : aucun'}. Enregistré dans studio-video/out/${P.nom}/.`;
  $('#ePlage').checked = !!plage; $('#ePlage').disabled = !plage; majPlage(); $('#dExport').showModal();
};
$('#eFermer').onclick = () => $('#dExport').close();
$('#eLancer').onclick = async () => {
  const o = { type: 'export', nom: $('#eNom').value.trim() || P.nom, tel: $('#eTel').checked, iphone: $('#eIphone').checked, couverture: $('#eCouv').checked, srt: $('#eSrt').checked, ...($('#ePlage').checked && plage ? { from: plage[0], to: plage[1] } : {}) };
  const r = await api('tache', o); if (!r.ok) return toast(r.erreur || 'Une tâche tourne déjà');
  $('#eProgres').hidden = false; $('#eLancer').disabled = true; $('#eAnnuler').hidden = false; progres(0, 'démarrage…');
};
$('#eAnnuler').onclick = $('#bAnnuler').onclick = () => api('tache', { type: 'annuler' });
function progres(f, txt) { $('#eProgres div').style.width = (f * 100).toFixed(1) + '%'; $('#eProgres span').textContent = txt; }

// ================= onglets, tâches, rechargement à chaud =================
// les volets s'ouvrent près de leur bouton ; un clic ailleurs les ferme
function volet(id, bouton) {
  const v = $('#' + id), ouvert = !v.hidden; $$('.pop').forEach(p => p.hidden = true); if (ouvert) return;
  v.hidden = false; if (id === 'popSons' && !$('#sons').children.length) chercher();
  if (v.classList.contains('tiroir') || !bouton) return;
  const e = $('#editeur').getBoundingClientRect(), b = bouton.getBoundingClientRect(), w = v.offsetWidth;
  v.style.left = Math.max(8, Math.min(e.width - w - 8, b.right - e.left - w)) + 'px';
  if (b.top - e.top > e.height / 2) { v.style.top = 'auto'; v.style.bottom = (e.bottom - b.top + 6) + 'px'; }   // bouton du bas : le volet grandit vers le haut
  else { v.style.bottom = 'auto'; v.style.top = (b.bottom - e.top + 6) + 'px'; }
}
$$('[data-pop]').forEach(b => b.onclick = e => { e.stopPropagation(); volet(b.dataset.pop, b); });
$$('.pop [data-ferme]').forEach(b => b.onclick = () => b.closest('.pop').hidden = true);
addEventListener('mousedown', e => { if (!e.target.closest('.pop, [data-pop]')) $$('.pop').forEach(p => { if (!p.classList.contains('tiroir')) p.hidden = true; }); });
// discussion / historique de Claude
async function tache(type) { const r = await api('tache', { type }); if (!r.ok) toast(r.erreur || 'Une tâche tourne déjà'); else { $('#tacheEtat').hidden = false; volet('popTaches', $('#tacheEtat')); } }
const flux = new EventSource('/__api/flux');
flux.addEventListener('journal', e => { const l = JSON.parse(e.data), j = $('#journal'); j.textContent = (j.textContent + l + '\n').slice(-20000); j.scrollTop = j.scrollHeight; $('#tacheEtat').hidden = false; $('#tacheEtat').textContent = '⏳ ' + l.slice(0, 70);
  const m = /(\d+)\/(\d+) images · ([\d.]+) i\/s/.exec(l); if (m) progres(+m[1] / +m[2], `${m[1]} / ${m[2]} images · ${m[3]} i/s · encore ~${Math.round((m[2] - m[1]) / Math.max(.1, +m[3]))} s`); });
flux.addEventListener('tache', async e => { const d = JSON.parse(e.data); $('#tacheEtat').hidden = false; $('#tacheEtat').textContent = d.etat === 'en cours' ? `⏳ ${d.nom}…` : `${d.nom} : ${d.etat}${d.duree ? ' en ' + d.duree + ' s' : ''}`; $('#bAnnuler').disabled = d.etat !== 'en cours';
  if (d.etat !== 'en cours') { $('#eLancer').disabled = false; $('#eAnnuler').hidden = true; if (d.nom === 'export') progres(d.etat === 'fini' ? 1 : 0, d.etat === 'fini' ? `fini en ${d.duree} s : voir la page Rendus` : d.etat);
    const t = T; await charger(); T = t; if (['voix', 'nettoyer', 'caler', 'mixer'].includes(d.nom) && d.etat === 'fini') { sonDuProjet(); if (d.nom === 'caler') ouvrirScene(); } toast(`${d.nom === 'controle' ? 'Contrôle' : d.nom === 'export' ? 'Export' : d.nom} : ${d.etat}`); } else { P.tache = d.nom; pipeline(); } });
flux.addEventListener('recharge', e => { toast('Modifié : ' + JSON.parse(e.data) + ' → la scène se recharge au même instant'); if (camLibre) quitterCam(); ouvrirScene(); });

// ================= Claude =================
// une demande = un message ; Claude travaille dans le dossier du projet (sa propre session), le studio fait un commit par demande
let travail = null, attenteApres = null;
const ICONES = { Read: '📖', Edit: '✏️', Write: '📝', Bash: '▶', Glob: '🔎', Grep: '🔎', Skill: '📚' };
const duree = s => s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
function majAppliquer() { if (travail) return; const ok = !P?.lectureSeule && $('#demande').value.trim(); $('#bAppliquer').disabled = !ok; $('#bAppliquer').title = P?.lectureSeule ? 'Projet en lecture seule : « Copier dans le studio » d\'abord' : 'Ctrl + Entrée'; }
$('#demande').oninput = majAppliquer;
$('#demande').onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#bAppliquer').click(); };
function vignette(w, l = 270) { try { const c = w.document.getElementById('c'), o = document.createElement('canvas'); o.width = l; o.height = Math.round(l * 16 / 9); o.getContext('2d').drawImage(c, 0, 0, o.width, o.height); return o.toDataURL('image/jpeg', .8); } catch { return null; } }
function bloc(e) {   // une demande dans le fil : la question, les étapes, la réponse, la carte « Appliqué »
  const d = document.createElement('div'); d.className = 'demande'; d.dataset.id = e.id;
  const quoi = e.portee === 'selection' && e.cible ? '🎯 ' + esc(e.cible) : e.portee === 'plan' ? 'ce plan' : e.portee === 'video' ? 'vidéo entière' : '';
  d.innerHTML = `<div class="moi">${esc(e.demande)}<div class="discret">${[quoi, e.plan ? 'plan ' + e.plan : '', esc(e.modele || '')].filter(Boolean).join(' · ')}</div></div>
    <details class="etapes"><summary>${e.etapes?.length || 0} étape(s)</summary><ul></ul></details><div class="reponse md"></div><div class="carte-claude"></div>`;
  for (const x of e.etapes || []) etape(d, x);
  if (e.reponse) d.querySelector('.reponse').innerHTML = md(e.reponse.replace(/^\s*RÈGLE\s*:.*$/im, ''));
  if (e.duree != null) carte(d, e);
  $('#fil').append(d); return d;
}
function etape(d, x) {
  const ul = d.querySelector('.etapes ul'), li = document.createElement('li'), img = x.outil === 'Read' && /\.(png|jpe?g)$/i.test(x.detail) && !/^\.\.|^[a-z]:/i.test(x.detail);
  li.innerHTML = `${ICONES[x.outil] || '•'} ${x.outil === 'Bash' ? '<code>' + esc(x.detail.replace(/C:\/claude\/studio-video\//g, '').slice(0, 140)) + '</code>' : esc(x.detail)}${img ? `<br><img src="/${esc(x.detail)}?${Date.now()}" alt="">` : ''}`;
  ul.append(li); d.querySelector('.etapes summary').textContent = `${ul.children.length} étape(s)` + (travail?.id === d.dataset.id ? ' · en cours' : '');
}
function carte(d, e) {
  const c = d.querySelector('.carte-claude'), n = e.fichiers?.length || 0;
  c.innerHTML = `<div class="tete-carte ${e.erreur ? 'err' : e.annule ? 'annule' : 'ok'}">${e.erreur ? '⚠ ' + esc(e.erreur) : e.annule ? '↶ Annulé' : n ? '✓ Appliqué' : '✓ Terminé, aucun fichier modifié'} · ${duree(e.duree)}${e.cout != null ? ` <span class="discret" title="Prix équivalent si c'était payé à l'API : avec ton abonnement, rien n'est facturé">· ≈ ${e.cout.toFixed(2)} $ API</span>` : ''}</div>
    ${n ? `<ul class="fichiers">${e.fichiers.map(f => `<li><code>${esc(f.f)}</code> <span class="plus">+${f.plus}</span> <span class="moins">−${f.moins}</span></li>`).join('')}</ul>` : ''}
    ${e.avant || e.apres ? `<div class="avap">${e.avant ? `<figure><img src="/${e.avant}"><figcaption>avant</figcaption></figure>` : ''}${e.apres ? `<figure><img src="/${e.apres}?${Date.now()}"><figcaption>après</figcaption></figure>` : n && !e.annule ? '<figure class="discret">après : à la recharge…</figure>' : ''}</div>` : ''}
    ${e.refus?.length ? `<div class="refus">Refusé par le studio : ${e.refus.map(esc).join(' · ')}</div>` : ''}
    <div class="boutons-carte">${n && !e.annule ? `<button data-a="diff">Voir les changements</button><button data-a="annuler">Annuler</button>` : ''}<button data-a="retenir">Retenir…</button></div>
    <div class="retenir" hidden><textarea rows="2">${esc(e.regle || '')}</textarea><div class="ligneClaude"><span class="segment"><button data-p="projet" class="actif">Ce projet</button><button data-p="style">Tout le style</button></span><span class="espace"></span><button data-a="ok" class="primaire">Enregistrer la règle</button></div></div>`;
  c.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => {
    const a = b.dataset.a;
    if (a === 'diff') { const r = await api('claude/diff?id=' + e.id); voirDiff(e.demande, r.texte || r.erreur); }
    if (a === 'annuler') { if (!confirm('Annuler exactement cette retouche (les fichiers reviennent comme avant) ?')) return; const r = await api('claude/annuler', { id: e.id }); if (r.erreur) return toast(r.erreur, 6000); e.annule = true; carte(d, e); toast('Retouche annulée : la scène se recharge'); }
    if (a === 'retenir') { const z = c.querySelector('.retenir'); z.hidden = !z.hidden; if (!z.hidden) { const t = z.querySelector('textarea'); if (!t.value) t.value = e.demande; t.focus(); } }
    if (a === 'ok') { const z = c.querySelector('.retenir'), portee = z.querySelector('.segment .actif').dataset.p, r = await api('claude/retenir', { regle: z.querySelector('textarea').value, portee }); toast(r.ok ? `Règle retenue (${portee === 'style' ? 'tout le style' : 'ce projet'}) : Claude la relira à chaque demande` : r.erreur, 4000); z.hidden = true; }
  });
  c.querySelectorAll('.retenir .segment button').forEach(b => b.onclick = () => c.querySelectorAll('.retenir .segment button').forEach(x => x.classList.toggle('actif', x === b)));
}
function voirDiff(titre, t) {
  $('#tTitre').textContent = 'Changements : ' + titre;
  $('#tCorps').innerHTML = `<pre class="diff">${String(t).split('\n').map(l => `<span class="${/^\+(?!\+\+)/.test(l) ? 'add' : /^-(?!--)/.test(l) ? 'del' : /^@@/.test(l) ? 'hunk' : /^diff /.test(l) ? 'fic' : ''}">${esc(l)}</span>`).join('\n')}</pre>`;
  $('#tFermer').onclick = () => $('#dTexte').close(); $('#dTexte').showModal();
}
async function historiqueClaude() {
  const h = await api('claude/historique'); $('#fil').querySelectorAll('.demande').forEach(x => x.remove());
  $('#fil .vide').hidden = h.length > 0; for (const e of h) bloc(e); $('#fil').scrollTop = $('#fil').scrollHeight;
  $('#historique').innerHTML = h.length ? `<ul class="liste">${[...h].reverse().map(e => `<li data-id="${e.id}"><b>${esc(e.demande.slice(0, 90))}</b><div class="discret">${new Date(e.debut).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · ${e.erreur ? 'erreur' : e.annule ? 'annulée' : (e.fichiers?.length || 0) + ' fichier(s)'} · ${duree(e.duree || 0)}</div></li>`).join('')}</ul>` : '<p class="discret">Aucune demande pour l\'instant.</p>';
  $$('#historique li[data-id]').forEach(li => li.onclick = () => { $$('#vueClaude button')[0].click(); const b = $(`#fil .demande[data-id="${li.dataset.id}"]`); if (b) $('#fil').scrollTop = b.offsetTop - 10; });
}
$$('#vueClaude button').forEach(b => b.onclick = () => { $$('#vueClaude button').forEach(x => x.classList.toggle('actif', x === b)); $('#fil').hidden = b.dataset.v !== 'fil'; $('#historique').hidden = b.dataset.v === 'fil'; });
$('#bNouvelleConv').onclick = async () => { if (travail) return; const r = await api('claude/nouvelle', {}); if (r.erreur) return toast(r.erreur, 5000); selection = null; $('#cible').hidden = true; $('#demande').value = ''; suggestionsDefaut(); $('#fil').querySelectorAll('.demande').forEach(x => x.remove()); $('#fil .vide').hidden = false; toast('Nouvelle conversation : Claude repart sans souvenir des échanges précédents (les règles retenues restent)', 5000); };
$('#bAppliquer').onclick = async () => {
  if (travail) { await api('claude/stop', {}); return; }
  if ($('#bAppliquer').disabled) return;
  const por = $('#portee .actif').dataset.p, p = planA(T);
  if (por === 'selection' && !selection) return toast('Clique d\'abord sur quelque chose dans l\'aperçu (ou choisis « Plan » / « Vidéo entière »)', 4000);
  const o = { demande: $('#demande').value.trim(), portee: por, cible: por === 'selection' ? selection : null, plan: (por === 'selection' ? selection.plan : p?.n) ?? null, t: por === 'selection' ? selection.t : T,
    modele: $('#modele').value, effort: $('#effort').value, avant: win ? vignette(win) : null };
  const r = await api('claude', o); if (r.erreur) return toast(r.erreur, 6000);
  $('#demande').value = '';
};
function etat(t) { const s = $('#etatClaude'); s.hidden = !t; if (t) s.innerHTML = t; }
flux.addEventListener('claude', e => {
  const d = JSON.parse(e.data); let b = $(`#fil .demande[data-id="${d.id}"]`);
  if (d.type === 'debut') { $('#fil .vide').hidden = true; travail = { id: d.id, debut: Date.now(), modele: d.modele }; b = bloc({ id: d.id, demande: d.demande, etapes: [], modele: d.modele }); b.querySelector('.etapes').open = true;
    $('#bAppliquer').textContent = '■ Stop'; $('#bAppliquer').disabled = false; $('#bAppliquer').classList.add('stop');
    const m = travail; m.minuterie = setInterval(() => etat(`<span class="anim">✳</span> Claude travaille · ${duree(Math.round((Date.now() - m.debut) / 1000))} · ${esc(m.modele)}`), 1000); }
  if (!b) return;
  if (d.type === 'etape') etape(b, d);
  if (d.type === 'texte') b.querySelector('.reponse').innerHTML = md(d.texte.replace(/^\s*RÈGLE\s*:.*$/im, ''));
  if (d.type === 'refus') { const li = document.createElement('li'); li.className = 'refus'; li.textContent = '⛔ refusé : ' + d.detail.slice(0, 160); b.querySelector('.etapes ul').append(li); }
  if (d.type === 'fin') {
    clearInterval(travail?.minuterie); travail = null; etat(null); $('#bAppliquer').textContent = 'Appliquer'; $('#bAppliquer').classList.remove('stop'); majAppliquer();
    if (d.entree.fichiers?.length) attenteApres = d.entree;
    historiqueClaude();
  }
  $('#fil').scrollTop = $('#fil').scrollHeight;
});
// ================= bibliothèque dans l'éditeur (phase 6) =================
let BIBS = null;
async function listeBibs() {
  BIBS ||= (await api('bibliotheque')).elements; const q = $('#qBib').value.toLowerCase().trim();
  $('#bibs').innerHTML = BIBS.filter(e => !q || (e.nom + ' ' + (e.quoi || '') + ' ' + (e.notes || '')).toLowerCase().includes(q)).slice(0, 80)
    .map(e => `<div class="bibmini" draggable="true" data-nom="${esc(e.nom)}" title="${esc(e.quoi || e.nom)} · ${e.dims_m.map(x => x.toFixed(1)).join('×')} m"><img src="/__bib/${encodeURIComponent(e.nom)}/apercu.webp" alt=""><span>${esc(e.nom)}</span></div>`).join('');
  $$('#bibs .bibmini').forEach(d => d.ondragstart = ev => { ev.dataTransfer.setData('text/bib', d.dataset.nom); $('#depot').hidden = false; });
}
$('#bBib').addEventListener('click', () => listeBibs());
$('#qBib').oninput = () => listeBibs();
addEventListener('dragend', () => $('#depot').hidden = true);
$('#depot').ondragover = ev => ev.preventDefault();
$('#depot').ondrop = async ev => {
  ev.preventDefault(); $('#depot').hidden = true; const nom = ev.dataTransfer.getData('text/bib'); if (!nom) return;
  const r0 = $('#cadre').getBoundingClientRect(), x = Math.round((ev.clientX - r0.left) / r0.width * 1080), y = Math.round((ev.clientY - r0.top) / r0.height * 1920);
  const r = await api('bibliotheque/ajouter', { nom }); if (r.erreur) return toast(r.erreur, 5000); BIBS = null;
  const p = planA(T); portee('plan');
  $('#demande').value = `Place « ${nom} » (${r.type}, ${r.dims_m.map(v => v.toFixed(2)).join(' × ')} m, déjà dans assets/bib/ : await k.bib('${nom}')) dans ${p ? 'le plan ' + p.n : 'ce plan'}, là où je l'ai lâché : vers x = ${x}, y = ${y} (pixels 1080×1920) à ${fmt(T)}. Taille réelle, posé au sol, éclairé comme le reste.`;
  $('#demande').focus(); majAppliquer?.(); $$('.pop').forEach(p => p.hidden = true); toast(`« ${nom} » copié dans le projet : vérifie la demande à Claude puis Appliquer`, 5000);
};

// ================= construction en équipe (phase 5) =================
let equipe = null;   // { el, agents: Map id -> fiche }
async function ouvrirConstruire() {
  // réglages du projet (.studio/reglages.json), genres (genres/*.md) et budgets (lib/equipe.mjs)
  const r = await api('construire/etat'), R = r.reglages || {}, G = r.genres || [], B = r.budgets || {};
  $('#cGenre').innerHTML = '<option value="">Libre</option>' + G.map(g => `<option value="${esc(g.id)}">${esc(g.titre)} · ${esc(g.format || '')}</option>`).join('');
  $('#cGenre').value = R.genre || ''; $('#cTon').value = R.ton || '';
  const nom = { opus: 'Opus', sonnet: 'Sonnet', haiku: 'Haiku' }, effort = { high: 'effort haut', medium: 'effort moyen', low: 'effort bas' };
  $('#cBudget').innerHTML = Object.entries(B).map(([k, b]) => `<option value="${k}">${esc(b.titre)}</option>`).join(''); $('#cBudget').value = B[R.budget] ? R.budget : 'recommande';
  const infoBudget = () => { const b = B[$('#cBudget').value]; $('#cBudgetInfo').textContent = b ? `Décider (directeur) : ${nom[b.decide[0]]}, ${effort[b.decide[1]]} · fabriquer (constructeurs, correcteurs, polisseur) : ${nom[b.fabrique[0]]} · chercher les images : ${nom[b.verifie[0]]}.` : ''; };
  const equipeGenre = () => { const g = G.find(x => x.id === $('#cGenre').value);
    $('#cEquipe').innerHTML = g ? `<span class="discret">Équipe ${esc(g.titre.toLowerCase())} · ${esc(g.pour || '')} · ${esc(g.duree || '')} :</span> ` + g.equipe.map(e => `<span class="role${e.bientot ? ' bientot' : ''}"${e.bientot ? ' title="rôle d\'écriture ou de publication : pas encore branché"' : ''}>${esc(e.nom)}${e.bientot ? ' · bientôt' : ''}</span>`).join('') : '<span class="discret">Genre libre : l\'équipe suit le script et la DA.</span>'; };
  // fin et coupes : celles gardées pour le projet, sinon celles du genre (et un changement de genre reprend les siennes)
  const optionsGenre = () => { const g = G.find(x => x.id === $('#cGenre').value); $('#cFin').value = g?.fin || 'boucle'; $('#cCoupes').value = g?.coupes || 'seches'; };
  $('#cGenre').onchange = () => { equipeGenre(); optionsGenre(); }; $('#cBudget').onchange = infoBudget; equipeGenre(); infoBudget(); optionsGenre();
  if (R.fin) $('#cFin').value = R.fin; if (R.coupes) $('#cCoupes').value = R.coupes;
  $$('#cMode button').forEach(b => b.classList.toggle('actif', b.dataset.n === (R.mode || 'auto')));
  if (R.niveau) $$('#cNiveau button').forEach(b => b.classList.toggle('actif', b.dataset.n === R.niveau));
  const n = P.sections?.length; $('#cInfo').textContent = n ? `⚠ Ce projet a déjà ${n} section(s) : le directeur refait le découpage et les constructeurs réécrivent les sections (annulable).` : `${P.mots.length} mots calés dans la voix.`;
  $('#cAnnuler').onclick = () => $('#dConstruire').close();
  $('#cLancer').onclick = async () => {
    const o = { direction: $('#cDirection').value.trim(), niveau: $('#cNiveau .actif').dataset.n, budget: $('#cBudget').value, genre: $('#cGenre').value, mode: $('#cMode .actif').dataset.n, ton: $('#cTon').value.trim(), fin: $('#cFin').value, coupes: $('#cCoupes').value, max: +$('#cMax').value };
    const r = await api('construire', o); if (r.erreur) return toast(r.erreur, 6000); $('#dConstruire').close();
  };
  $('#dConstruire').showModal();
}
for (const g of ['#cNiveau', '#cMode']) $$(g + ' button').forEach(b => b.onclick = () => $$(g + ' button').forEach(x => x.classList.toggle('actif', x === b)));
const ROLES = { Directeur: '🎬', Objets: '🧊', Images: '🖼', Constructeur: '🔨', Correcteur: '🩹', Polisseur: '✨' };
function blocEquipe(etat) {
  $('#fil .vide').hidden = true;
  const el = document.createElement('div'); el.className = 'equipe';
  el.innerHTML = `<div class="moi" style="margin-bottom:8px">👥 Construction en équipe <span class="discret">· ${esc({ standard: 'Standard', verifie: 'Vérifié', soigne: 'Soigné', ultra: 'Ultra' }[etat.niveau] || etat.niveau || '')}</span></div><div class="avancement" hidden><div class="barre-av"><i></i></div><ol></ol></div><div class="phase"></div><ul class="agents"></ul><div class="bilan"></div>
    <div class="boutons-carte"><button data-a="stop">■ Tout arrêter</button></div>`;
  el.querySelector('[data-a=stop]').onclick = () => api('construire/stop', {});
  $('#fil').append(el); equipe = { el, agents: new Map(), debut: etat.debut || Date.now() };
  for (const a of etat.agents || []) majAgent(a);
  avancement(etat.etapes, el); phaseEquipe(etat.phase || ''); if (etat.attente) planAValider(etat.attente, el);
  return equipe;
}
const MARQUES = { fait: '✓', en_cours: '<span class="anim">✳</span>', a_venir: '○', saute: '–', erreur: '⚠' };
function avancement(etapes, el = equipe?.el) {
  if (!el || !etapes?.length) return; el.querySelector('.avancement').hidden = false;
  const comptees = etapes.filter(e => e.etat !== 'saute'), faites = comptees.filter(e => e.etat === 'fait').length;
  const ec = etapes.find(e => e.etat === 'en_cours'), part = ec && /^(\d+)\/(\d+)$/.exec(ec.detail || '');
  const pct = Math.round(100 * (faites + (part ? part[1] / part[2] : 0)) / Math.max(1, comptees.length));
  el.querySelector('.barre-av i').style.width = pct + '%'; el.querySelector('.barre-av').title = pct + ' %';
  el.querySelector('.avancement ol').innerHTML = etapes.map(e => `<li class="${e.etat}"><span class="m">${MARQUES[e.etat] || '○'}</span> ${esc(e.titre)}${e.detail ? ` <span class="discret">· ${esc(e.detail)}</span>` : ''}</li>`).join('');
}
function planAValider(plans, el = equipe?.el) {
  if (!el) return; el.querySelector('.valider')?.remove(); if (!plans) return;
  const d = document.createElement('div'); d.className = 'valider';
  d.innerHTML = `<ol>${plans.map(p => `<li><b>${esc(p.id)}</b> <span class="discret">${fmt(p.t0)} → ${fmt(p.t1)}</span><br>${esc(p.brief || '')}</li>`).join('')}</ol>
    <textarea rows="2" placeholder="Une remarque ? Le directeur refait le découpage avec elle."></textarea>
    <div class="boutons-carte"><button class="primaire" data-a="ok">Continuer la construction</button><button data-a="refaire">Refaire avec ma remarque</button></div>`;
  d.querySelector('[data-a=ok]').onclick = async () => { await api('construire/continuer', {}); d.remove(); };
  d.querySelector('[data-a=refaire]').onclick = async () => { const t = d.querySelector('textarea').value.trim(); if (!t) return toast('Écris d\'abord ta remarque'); await api('construire/continuer', { remarque: t }); d.remove(); };
  el.querySelector('.phase').after(d);
}
function phaseEquipe(p) { if (!equipe) return; equipe.phase = p; const n = [...equipe.agents.values()].filter(a => a.etat === 'travaille').length;
  equipe.el.querySelector('.phase').innerHTML = `<span class="anim">✳</span> ${esc(p)}${n ? ` · ${n} agent(s) au travail` : ''}`; }
function majAgent(a) {
  let li = equipe.el.querySelector(`li[data-id="${a.id}"]`);
  if (!li) { li = document.createElement('li'); li.dataset.id = a.id; li.innerHTML = '<div class="l1"></div><div class="l2"></div><div class="der"></div><ul hidden></ul>'; li.onclick = e => { if (e.target.tagName !== 'IMG') li.querySelector('ul').hidden ^= 1; }; equipe.el.querySelector('.agents').append(li); }
  const f = equipe.agents.get(a.id) || { etapes: [] }; Object.assign(f, a); equipe.agents.set(a.id, f);
  li.className = a.etat === 'arrêté' ? 'arrete' : a.etat;
  const st = a.etat === 'travaille' ? '⏳' : a.etat === 'fini' ? '✓' : '⚠';
  li.querySelector('.l1').innerHTML = `${ROLES[a.role] || '•'} <b>${esc(a.role)}</b> ${esc(a.nom || '')} <span class="espace"></span><span class="etat">${st}</span>
    <span class="discret">${a.duree != null ? duree(a.duree) : ''}${a.cout != null ? ' · ≈' + a.cout.toFixed(2) + ' $' : ''}</span>`;
  li.querySelector('.l2').innerHTML = `<span class="discret">${esc((a.fichiers || []).join(', '))}</span>${a.paquet ? ` · <a class="paquet" href="#" title="${esc((a.skills || []).map(x => 'skill ' + x).join(', ') || 'aucune skill')}">📦 ce qu'il a reçu</a>` : ''}`;
  const pq = li.querySelector('a.paquet'); if (pq) pq.onclick = e => { e.preventDefault(); e.stopPropagation(); voirTexte(a.paquet); };
  if (a.etat !== 'travaille') li.querySelector('.der').textContent = a.erreur ? '⚠ ' + a.erreur : a.touches ? (a.touches.length ? '✎ ' + a.touches.join(', ') : 'aucun fichier modifié') + (a.refus?.length ? ` · ${a.refus.length} refus` : '') : '';
  for (const x of (a.etapes || []).slice(f.vues || 0)) etapeAgent(li, x); f.vues = (a.etapes || []).length;
}
function etapeAgent(li, x) {
  const img = x.outil === 'Read' && /\.(png|jpe?g)$/i.test(x.detail) && !/^\.\.|^[a-z]:/i.test(x.detail), l = document.createElement('li');
  l.innerHTML = `${ICONES[x.outil] || '•'} ${esc(String(x.detail).replace(/C:\/claude\/studio-video\//g, '').slice(0, 120))}${img ? `<img src="/${esc(x.detail)}?${Date.now()}" alt="">` : ''}`;
  li.querySelector('ul').append(l); li.querySelector('.der').textContent = `${ICONES[x.outil] || '•'} ${String(x.detail).slice(0, 90)}`;
}
function bilanEquipe(b, el = equipe.el) {
  avancement(b.etapes, el);
  el.querySelector('.phase').innerHTML = b.erreur ? `⚠ ${esc(b.erreur)}` : '✓ Construction terminée';
  const commits = b.agents.filter(a => a.hash);
  el.querySelector('.bilan').innerHTML = `<div class="tete-carte ${b.erreur ? 'err' : 'ok'}">${commits.length} commit(s) · ${duree(b.duree)} · <span class="discret" title="Prix équivalent API : rien n'est facturé avec l'abonnement">≈ ${b.cout} $ API</span></div>
    ${b.horsFichier?.length ? `<div class="refus">⚠ Hors de leur fichier : ${b.horsFichier.map(esc).join(', ')}</div>` : commits.length ? '<div class="discret">Chaque agent n\'a touché que ses fichiers.</div>' : ''}`;
  el.querySelector('.boutons-carte').innerHTML = commits.length && !b.annule ? '<button data-a="annuler">Annuler la construction</button>' : '';
  const bt = el.querySelector('[data-a=annuler]'); if (bt) bt.onclick = async () => { if (!confirm('Annuler toute la construction (tous les commits de l\'équipe, du plus récent au plus ancien) ?')) return;
    const r = await api('construire/annuler', { id: b.id }); if (r.erreur) return toast(r.erreur, 6000); b.annule = true; bilanEquipe(b, el); toast('Construction annulée : la scène se recharge'); };
}
async function etatEquipe() {
  const r = await api('construire/etat'); $$('#fil .equipe').forEach(x => x.remove()); equipe = null;
  if (r.etat) blocEquipe(r.etat);
  else if (r.historique?.length) { const b = r.historique.at(-1); blocEquipe({ niveau: b.niveau, agents: b.agents, etapes: b.etapes }); bilanEquipe(b); equipe = null; }
}
flux.addEventListener('equipe', e => {
  const d = JSON.parse(e.data);
  if (d.type === 'debut') { $$('#fil .equipe').forEach(x => x.remove()); blocEquipe({ niveau: d.niveau, debut: Date.now(), etapes: d.etapes }); P.tache = 'construction'; pipeline(); }
  if (!equipe) return;
  if (d.type === 'phase') phaseEquipe(d.phase);
  if (d.type === 'etapes') avancement(d.etapes);
  if (d.type === 'plan') planAValider(d.plans);
  if (d.type === 'agent') { majAgent(d.agent); phaseEquipe(equipe.phase || ''); }
  if (d.type === 'etape') { const li = equipe.el.querySelector(`li[data-id="${d.id}"]`); if (li) { etapeAgent(li, d); const f = equipe.agents.get(d.id); if (f) f.vues = (f.vues || 0) + 1; } }
  if (d.type === 'fin') { bilanEquipe(d.bilan); equipe = null; P.tache = null; charger().then(() => pipeline()); }
  $('#fil').scrollTop = $('#fil').scrollHeight;
});

// copier un projet de tiktok-motion dans le studio pour pouvoir le modifier
$('#bCopierStudio').onclick = async () => {
  if (!confirm('Copier ce projet dans C:/claude/studio-projets/ ? L\'original dans tiktok-motion ne sera jamais modifié ; Claude travaillera sur la copie (avec un historique git).')) return;
  toast('Copie en cours (modèles 3D compris : quelques secondes)…', 10000); const r = await api('copier', {}); if (r.erreur) return toast(r.erreur, 6000); location.reload();
};

// ================= démarrage =================
window.STUDIO = { aller: t => aller(t), lire: () => lire(), tache };
$('#vue').appendChild($('#barreCam'));   // la barre de la caméra libre flotte en haut de l'aperçu
suggestionsDefaut(); ajuster();
function sonDuProjet() { if (P.mix) audio.src = '/' + P.mix + '?v=' + P.mixV; api('onde').then(o => { onde = o; dessinerTl(); }); }   // ?v : le .wav est en cache, il change à chaque Mixer
if (await charger()) { sonDuProjet(); ouvrirScene(); }
