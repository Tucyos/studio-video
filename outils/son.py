# son.py : la chaîne script -> voix -> mix d'un projet du studio (boutons Voix / Nettoyer / Caler / Mixer de l'éditeur).
#   python outils/son.py voix <projet> [--prises 2]       script.md -> audio/voice.wav (Gemini TTS, meilleure prise selon Whisper)
#   python outils/son.py nettoyer <projet>                audio/voice.wav -> audio/voice_clean.wav (blancs, atempo, chaîne du compte)
#   python outils/son.py caler <projet> [--modele medium]  audio/voice_clean.wav + script.md -> audio/words.json
#   python outils/son.py mixer <projet> [--duree s]        cues.json -> audio/mix.wav (-14 LUFS) + out/stem_*.wav, contrôle des mots couverts
# Repris de tiktok-motion (gen_unbloc.py, tts_poubelle.py, trim_silence.py, begaiements.py, align.py, mix.py ; studio/audio.py est appelé tel quel).
# Clé : variable d'environnement GEMINI_API_KEY uniquement. Réglages par compte (REGLAGES), remplaçables par "son": {...} dans project.json.
import sys, os, re, json, time, shutil, base64, struct, difflib, unicodedata, argparse, subprocess
import numpy as np, soundfile as sf, warnings
warnings.filterwarnings('ignore')   # Whisper / pyloudnorm : avertissements sans conséquence, ils noient le journal du studio

ap = argparse.ArgumentParser()
ap.add_argument('etape', choices=['voix', 'nettoyer', 'caler', 'mixer']); ap.add_argument('projet')
ap.add_argument('--prises', type=int, default=2); ap.add_argument('--modele', default='medium'); ap.add_argument('--duree', type=float)
a = ap.parse_args()
P = os.path.abspath(a.projet); os.chdir(P)
TM_AUDIO = 'C:/claude/tiktok-motion/studio/audio.py'
lire = lambda f, d=None: json.load(open(f, encoding='utf-8')) if os.path.exists(f) else d
ecrire = lambda f, o: open(f, 'w', encoding='utf-8').write(json.dumps(o, ensure_ascii=False, indent=1))
def ff(*args): subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)

# ---------- réglages par compte (validés par Noam dans tiktok-motion) ----------
TRANCHANTE = ('highpass=f=95,equalizer=f=110:t=q:w=1:g=2,equalizer=f=300:t=q:w=1.0:g=-5,equalizer=f=3400:t=q:w=0.9:g=5.5,highshelf=f=9500:g=4,'
              'deesser=i=0.55,acompressor=threshold=-24dB:ratio=4:attack=4:release=70:makeup=4,alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=7')   # Rush v4, redemandée le 17/10
REGLAGES = {
  'Automobile': dict(voix='en-us-enzo', blancs_ms=150, atempo=1.04, chaine=TRANCHANTE,   # Le Mans 66 : blancs 150 ms, atempo 1,04
    style="Narrateur de vidéo TikTok sur l'automobile, en français de France avec un accent parisien neutre (aucun accent anglais ou américain), "
          "mais les noms propres anglais prononcés à l'anglaise et les italiens à l'italienne. Voix grave, captivante, proche du micro, ton de conteur complice, "
          "au rythme d'un créateur TikTok. Lis exactement le texte, mot pour mot, sans rien ajouter ni enlever, d'un seul trait. "
          "Débit RAPIDE et enlevé : environ quatre mots et demi par seconde, presque aucune pause entre les phrases, jamais de silence dramatique. "
          "Les relances tombent net, avec de la tension."),
  'Koan': dict(voix='voice_bq7fpjbz86qi', blancs_ms=160, atempo=1.06, chaine='equalizer=f=3000:t=q:w=1:g=3,highshelf=f=7000:g=4',   # Velvet Anchor 3 ; Vendetta 19/10 + aigus 20/10
    style="## Audio profile\nA 22-year-old guy from France telling a story on TikTok. Native French (France) accent, no foreign accent. "
          "He sounds like he's explaining something fascinating to a friend at a bar: relaxed, a bit playful, confident, never like a news anchor or an audiobook narrator.\n\n"
          "## Director's notes\n- Language: French from France. Casual spoken French.\n- Overall style: conversational storytelling, intimate, slightly amused, curious.\n"
          "- Pace: FAST, punchy TikTok delivery. Tight, almost no gaps between sentences.\n- Pauses are very short: never let silence drag.\n"
          "- Words in CAPITALS get a light emphasis, not shouted.\n"),
}
PJ = lire('project.json', {}); ESPACE = PJ.get('espace') if PJ.get('espace') in REGLAGES else 'Automobile'
R = {**REGLAGES[ESPACE], **PJ.get('son', {})}
AD_F = '.studio/adaptateur.json'; AD = lire(AD_F, {})
def adapter(**k): AD.update(k); os.makedirs('.studio', exist_ok=True); ecrire(AD_F, AD)

def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)

def texte():
    """Le texte de la voix : la section « ## Voix off » de script.md s'il y en a une, sinon tout le fichier sans les titres."""
    if not os.path.exists('script.md'): sys.exit('✗ pas de script.md dans le projet')
    s = open('script.md', encoding='utf-8').read()
    m = re.search(r'^##\s*Voix( off)?\s*$(.*?)(?=^#|\Z)', s, re.M | re.S)
    if m: s = m.group(2)
    s = re.sub(r'\*\*|__', '', '\n'.join(l for l in s.splitlines() if not l.lstrip().startswith('#'))).strip()
    if not s or s.startswith('Sujet :'): sys.exit("✗ le script n'est pas encore écrit (script.md ne contient qu'un sujet) : demande-le à Claude d'abord")
    return s
parle = lambda s: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>|\[[^\]]+\]|\(silence\)', ' ', s)).strip()   # sans les balises d'expression <short pause>…

# ---------- 1. voix ----------
def tts(cl, s):
    if ESPACE == 'Koan':   # voix personnalisée : generate_content_stream + VoiceConfig(voice=ID) (tts_poubelle.py)
        from google.genai import types
        conf = types.GenerateContentConfig(temperature=1, response_modalities=['audio'],
            speech_config=types.SpeechConfig(language_code='fr-FR', voice_config=types.VoiceConfig(voice=R['voix'])))
        pcm, mime = bytearray(), ''
        for ch in cl.models.generate_content_stream(model='gemini-3.8-flash-tts', contents=[types.Content(role='user', parts=[types.Part.from_text(text=R['style'] + '\n## Transcript:\n' + s)])], config=conf):
            if ch.parts and ch.parts[0].inline_data and ch.parts[0].inline_data.data: pcm.extend(ch.parts[0].inline_data.data); mime = ch.parts[0].inline_data.mime_type
        rate = int((re.search(r'rate=(\d+)', mime) or [0, 24000])[1]); bits = int((re.search(r'audio/L(\d+)', mime) or [0, 16])[1])
        return struct.pack('<4sI4s4sIHHIIHH4sI', b'RIFF', 36 + len(pcm), b'WAVE', b'fmt ', 16, 1, 1, rate, rate * bits // 8, bits // 8, bits, b'data', len(pcm)) + bytes(pcm)
    it = cl.interactions.create(model='gemini-3.8-flash-tts',   # voix Enzo : interactions (gen_unbloc.py du Mans 66)
        input=[{'type': 'text', 'text': s, 'annotations': [{'type': 'speech_metadata', 'style': R['style']}]}],
        response_format={'type': 'audio', 'mime_type': 'audio/wav'},
        generation_config={'speech_config': [{'voice': R['voix'], 'language': 'fr-FR'}]})
    return base64.b64decode(it.output_audio.data)

def voix():
    s = texte()
    if not os.environ.get('GEMINI_API_KEY'): sys.exit('✗ variable d\'environnement GEMINI_API_KEY absente')
    from google import genai
    import whisper
    os.makedirs('audio/prises', exist_ok=True); h = time.strftime('%Y%m%d-%H%M%S')
    if os.path.exists('audio/voice.wav'):   # les .wav ne sont pas dans git : l'ancienne voix est gardée ici
        shutil.copy2('audio/voice.wav', f'audio/prises/ancienne_{h}.wav'); print(f'ancienne voix gardée : audio/prises/ancienne_{h}.wav')
    cl = genai.Client(api_key=os.environ['GEMINI_API_KEY']); wm = whisper.load_model(a.modele); ref = [norm(w) for w in parle(s).split() if norm(w)]
    print(f'{ESPACE} · voix {R["voix"]} · {len(ref)} mots · {a.prises} prise(s)', flush=True); best = None
    for k in range(a.prises):
        f = f'audio/prises/prise_{h}_{k + 1}.wav'; open(f, 'wb').write(tts(cl, s))
        hyp = [norm(w) for w in wm.transcribe(f, language='fr')['text'].split() if norm(w)]
        r = difflib.SequenceMatcher(None, ref, hyp, autojunk=False).ratio(); d = sf.info(f).duration
        print(f'prise {k + 1} : {r * 100:.0f} % des mots reconnus, {d:.1f} s', flush=True)
        if best is None or r > best[0]: best = (r, f)
    shutil.copy2(best[1], 'audio/voice.wav'); print(f'✓ audio/voice.wav = {best[1]} ({best[0] * 100:.0f} %)')
    if best[0] < .85: print('⚠ moins de 85 % des mots reconnus : écouter la prise (mot sauté ou inventé ?)')

# ---------- 2. nettoyer ----------
def blancs(x, sr, keep_ms):   # trim_silence.py : chaque blanc plus long que keep_ms est ramené à keep_ms (fondus de 12 ms)
    mono = x if x.ndim == 1 else x.mean(1); win = int(sr * .01); n = len(mono) // win
    db = 20 * np.log10(np.sqrt(np.mean(mono[:n * win].reshape(n, win) ** 2, axis=1) + 1e-12)); sil = db < max(db.max() - 45, -50)
    segs, i = [], 0
    while i < n:
        if sil[i]:
            j = i
            while j < n and sil[j]: j += 1
            if (j - i) * 10 >= max(60, keep_ms + 24): segs.append((i * win, j * win))   # plus court : gardé tel quel (sinon la voix est recopiée en double)
            i = j
        else: i += 1
    keep, fade, parts, cur = int(sr * keep_ms / 1000), int(sr * .012), [], 0
    for s0, s1 in segs:
        if s0 == 0: cur = max(0, s1 - fade); continue
        if s1 >= len(mono) - win: parts.append(x[cur:s0 + fade]); cur = None; break
        parts.append(x[cur:s0 + keep // 2]); cur = s1 - keep // 2
    if cur is not None: parts.append(x[cur:])
    y = parts[0].copy()
    for p in parts[1:]:
        f = min(fade, len(y), len(p)); r = np.linspace(0, 1, f)
        if y.ndim > 1: r = r[:, None]
        y[-f:] = y[-f:] * (1 - r) + p[:f] * r; y = np.concatenate([y, p[f:]])
    f = int(sr * .01); r = np.linspace(0, 1, f)
    if y.ndim > 1: r = r[:, None]
    y[:f] *= r; y[-f:] *= r[::-1]
    return y

def begaiements(f):   # begaiements.py : un bout de 80-200 ms recopié juste derrière lui-même (défaut connu du TTS)
    x, sr = sf.read(f, always_2d=True); m = x.mean(1); h = int(.012 * sr); ts = set()
    for L in range(int(.08 * sr), int(.2 * sr), int(.002 * sr)):
        A = m[:len(m) - L - h]; n = len(A) // h; A = A[:n * h].reshape(n, h); B = m[L:L + n * h].reshape(n, h)
        c = (A * B).sum(1) / (np.linalg.norm(A, axis=1) * np.linalg.norm(B, axis=1) + 1e-9)
        ts.update(np.round(np.where((c > .995) & (np.sqrt((A ** 2).mean(1)) >= .01))[0] * h / sr, 2))
    ts = sorted(ts); return [t for k, t in enumerate(ts) if k == 0 or t - ts[k - 1] > .05]

def nettoyer():
    if not os.path.exists('audio/voice.wav'): sys.exit('✗ pas encore de voix (audio/voice.wav) : bouton Voix d\'abord')
    x, sr = sf.read('audio/voice.wav'); y = blancs(x, sr, R['blancs_ms']); os.makedirs('out', exist_ok=True)
    sf.write('out/voice_blancs.wav', y, sr); print(f'blancs ramenés à {R["blancs_ms"]} ms : {len(x) / sr:.1f} s -> {len(y) / sr:.1f} s')
    ff('-i', 'out/voice_blancs.wav', '-af', f'atempo={R["atempo"]},{R["chaine"]}', '-ar', '48000', '-ac', '1', 'audio/voice_clean.wav')
    if 'loudnorm' not in R['chaine']:   # Koan : un simple gain, crête à -1 dB (jamais de compression ni d'écrêtage)
        z, sr2 = sf.read('audio/voice_clean.wav'); sf.write('audio/voice_clean.wav', z * (10 ** (-1 / 20) / np.abs(z).max()), sr2)
    d = sf.info('audio/voice_clean.wav').duration; print(f'✓ audio/voice_clean.wav : atempo {R["atempo"]}, chaîne {ESPACE}, {d:.2f} s')
    b = begaiements('audio/voice_clean.wav')
    print('bégaiements : aucun' if not b else f'⚠ {len(b)} bégaiement(s) possible(s) à écouter : ' + ', '.join(f'{t:.2f} s' for t in b))

# ---------- 3. caler ----------
def caler():
    src = 'audio/voice_clean.wav' if os.path.exists('audio/voice_clean.wav') else 'audio/voice.wav'
    if not os.path.exists(src): sys.exit('✗ pas encore de voix : boutons Voix puis Nettoyer')
    toks = [t for t in re.findall(r"[\wÀ-ÿ'’-]+(?:\s?[.,;:!?…»\"])*|[«\"]", parle(texte())) if re.search(r'\w', t)]   # « fratrie ? » : la ponctuation française reste à son mot
    import whisper
    m = whisper.load_model(a.modele)
    pcm = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout, np.float32)
    segs = m.transcribe(pcm, language='fr', word_timestamps=True, beam_size=5)['segments']   # pas d'initial_prompt : il décale les horodatages
    hyp = [(w['word'].strip(), w['start'], w['end']) for s in segs for w in s['words'] if norm(w['word'])]
    S = [norm(t) for t in toks]; H = [norm(h[0]) for h in hyp]; times = [None] * len(toks)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=S, b=H, autojunk=False).get_opcodes():   # align.py : alignement sur le script
        if tag == 'equal':
            for k in range(i2 - i1): times[i1 + k] = (hyp[j1 + k][1], hyp[j1 + k][2])
        elif tag == 'replace' and j2 > j1:
            t0, t1 = hyp[j1][1], hyp[j2 - 1][2]; L = [max(1, len(S[i])) for i in range(i1, i2)]; acc = t0
            for n, i in enumerate(range(i1, i2)): d = (t1 - t0) * L[n] / sum(L); times[i] = (acc, acc + d); acc += d
    reconnus = sum(1 for t in times if t); i = 0
    while i < len(times):
        if times[i] is None:
            j = i
            while j < len(times) and times[j] is None: j += 1
            t0 = times[i - 1][1] if i > 0 else 0.0; t1 = times[j][0] if j < len(times) else (hyp[-1][2] if hyp else t0 + .3 * (j - i))
            L = [max(1, len(S[k])) for k in range(i, j)]; acc = t0
            for n, k in enumerate(range(i, j)): d = (t1 - t0) * L[n] / sum(L); times[k] = (acc, acc + d); acc += d
            i = j
        i += 1
    y, sr = sf.read(src)   # débuts après une pause recalés sur l'énergie du son
    if y.ndim > 1: y = y.mean(1)
    hop = int(sr * .005); db = 20 * np.log10(np.sqrt(np.convolve(y ** 2, np.ones(hop * 2) / (hop * 2), 'same'))[::hop] + 1e-9); thr = np.percentile(db, 95) - 30; recales = 0
    for k in range(1, len(times)):
        g0 = times[k - 1][1]
        if times[k][0] - g0 > .12:
            seg = db[int(g0 / .005):int((times[k][0] + .1) / .005)]; q = np.where(seg < thr)[0]
            on = np.where(seg[q[0]:] > thr)[0] + q[0] if len(q) else []
            if len(on):
                t = (int(g0 / .005) + on[0]) * .005
                if abs(t - times[k][0]) < .25: times[k] = (round(t, 3), max(times[k][1], t + .05)); recales += 1
    words, phrases, cur = [], [], []
    for k, (t, (s, e)) in enumerate(zip(toks, times)):
        words.append({'i': k, 'w': t.strip('.,;:!?…«»" '), 'start': round(s, 3), 'end': round(e, 3), 'phrase': len(phrases)}); cur.append(k)
        if re.search(r'[.!?…]$', t) or k == len(toks) - 1:
            phrases.append({'i': len(phrases), 'text': ' '.join(toks[x] for x in cur), 'start': words[cur[0]]['start'], 'end': words[cur[-1]]['end']}); cur = []
    pauses = [{'after': k - 1, 'start': words[k - 1]['end'], 'end': words[k]['start'], 'dur': round(words[k]['start'] - words[k - 1]['end'], 3)}
              for k in range(1, len(words)) if words[k]['start'] - words[k - 1]['end'] >= .15]
    dur = round(len(y) / sr, 3); ecrire('audio/words.json', {'duration': dur, 'fps': 30, 'source': src, 'words': words, 'phrases': phrases, 'pauses': pauses})
    adapter(mots='audio/words.json')
    print(f'✓ audio/words.json : {len(words)} mots ({reconnus} reconnus tels quels, {recales} débuts recalés sur le son), {len(phrases)} phrases, {dur} s')
    if reconnus < .85 * len(words): print('⚠ moins de 85 % de mots reconnus : vérifier le texte du script, ou relancer avec --modele large')
    if os.path.exists('project.json'):
        if PJ.get('plans'):
            fin = PJ['plans'][-1]['t1']
            if abs(fin - dur) > .1: print(f'⚠ les sections de project.json finissent à {fin} s, la voix dure {dur} s : elles ont été coupées pour l\'ancienne voix (refaire « Construire »)')
        else: PJ['duree'] = round(np.ceil(dur * 30) / 30, 3); ecrire('project.json', PJ); print(f'project.json : durée {PJ["duree"]} s')

# ---------- 4. mixer ----------
def mixer():
    cues = lire('cues.json', {'sfx': []})
    if not cues.get('vo'):   # la voix du mix : la voix nettoyée (écrite dans cues.json, que le studio et Claude relisent)
        v = next((f for f in ('audio/voice_clean.wav', 'audio/voice.wav') if os.path.exists(f)), None)
        if not v: sys.exit('✗ pas encore de voix : boutons Voix puis Nettoyer')
        cues['vo'] = v; ecrire('cues.json', cues)
    dur = a.duree or PJ.get('duree') or sf.info(cues['vo']).duration + .5
    gain = cues.get('fx_db', AD.get('gain_bruitages_db', 0))   # gain d'ensemble des bruitages (Le Mans : +13, sources ramenées à -20 LUFS)
    os.makedirs('out', exist_ok=True)
    subprocess.run([sys.executable, TM_AUDIO, 'cues.json', '--dur', str(dur), '--out', 'out/mix_brut.wav'], check=True, env=dict(os.environ, STEMS='1', PYTHONIOENCODING='utf-8', PYTHONUTF8='1', PYTHONWARNINGS='ignore'))
    ff('-i', 'out/stem_fx.wav', '-i', 'out/stem_voice.wav', '-filter_complex', '[0]apad=pad_dur=2[a];[1]apad=pad_dur=2[b];[a][b]sidechaincompress=threshold=0.03:ratio=3:attack=4:release=180:makeup=1[d]', '-map', '[d]', '-t', str(dur), 'out/stem_fx_duck.wav')   # apad + -t : sinon ffmpeg perd la dernière seconde
    import pyloudnorm as pyln
    v, SR = sf.read('out/stem_voice.wav'); f, _ = sf.read('out/stem_fx_duck.wav'); mu, _ = sf.read('out/stem_music.wav'); n = round(dur * SR)
    v, f, mu = (np.pad(x, (0, max(0, n - len(x))))[:n] for x in (v, f, mu))
    f = f * 10 ** (gain / 20); mix = v + f + mu
    M = pyln.Meter(SR); mix = pyln.normalize.loudness(mix, M.integrated_loudness(mix), -14.0)   # un gain, pas de compression
    sf.write('out/mix_pre.wav', mix.astype(np.float32), SR)
    for _ in range(3):   # limiteur à anticipation, jamais de tanh ; une voix sans compresseur (Koan) y perd ~1 dB : on remonte le gain et on relimite
        ff('-i', 'out/mix_pre.wav', '-af', 'alimiter=limit=0.83:attack=3:release=60:level=disabled', 'audio/mix.wav')
        out, _ = sf.read('audio/mix.wav'); manque = -14.0 - M.integrated_loudness(out)
        if abs(manque) < .25: break
        mix = mix * 10 ** (manque / 20); sf.write('out/mix_pre.wav', mix.astype(np.float32), SR)
    out, _ = sf.read('audio/mix.wav'); print(f'✓ audio/mix.wav : {M.integrated_loudness(out):.1f} LUFS, crête {20 * np.log10(np.abs(out).max()):.1f} dBFS, {dur:.2f} s')
    adapter(mix='audio/mix.wav', voix='out/stem_voice.wav', bruitages='out/stem_fx_duck.wav', gain_bruitages_db=gain)   # lus par check.mjs (mots couverts, sonie)
    W = lire(AD.get('mots', 'audio/words.json'), {}).get('words', []); rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12); bad = []
    for w in W:   # mix.py : sur chaque mot, la voix doit dépasser les bruitages d'au moins 6 dB
        i0, i1 = int(w['start'] * SR), int(max(w['end'], w['start'] + .08) * SR); d = 20 * np.log10(rms(v[i0:i1]) / rms(f[i0:i1]))
        if d < 6: bad.append(f"« {w['w']} » à {w['start']:.2f} s (+{d:.1f} dB)")
    print('mots couverts : aucun' if not bad else f'⚠ {len(bad)} mot(s) couvert(s) par les bruitages : ' + ', '.join(bad))

{'voix': voix, 'nettoyer': nettoyer, 'caler': caler, 'mixer': mixer}[a.etape]()
