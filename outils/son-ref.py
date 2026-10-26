# son-ref.py : le son d'une vidéo de référence, MESURÉ en local (aucune clé, rien n'est envoyé) -> son.json
#   python outils/son-ref.py <video> <mots.json> <sortie.json>
# Approximatif, mais chiffré : niveau de la voix et du fond entre les mots, musique (part harmonique/percussive, tempo, régularité du battement),
# bruitages (attaques nettes : instant, force, timbre, pendant ou hors de la voix), silences, brillance de la voix.
import sys, json, subprocess, warnings
import numpy as np
warnings.filterwarnings('ignore')
import librosa

video, motsf, sortie = sys.argv[1:4]
SR = 22050
y = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).copy()
dur = len(y) / SR
mots = json.load(open(motsf, encoding='utf-8')).get('mots', [])
hop = 512; t = librosa.frames_to_time(np.arange(1 + len(y) // hop), sr=SR, hop_length=hop)
voix = np.zeros(len(t), bool)
for m in mots: voix[(t >= m['start'] - .05) & (t <= m['end'] + .05)] = True
db = lambda x: float(round(20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-9), 1)) if len(x) else None
rms = librosa.feature.rms(y=y, hop_length=hop)[0][:len(t)]; rdb = 20 * np.log10(rms + 1e-9)
r = {'duree': round(dur, 2), 'methode': 'mesure locale (librosa), approximative'}
r['niveau_voix_db'] = round(float(np.median(rdb[voix])), 1) if voix.any() else None
r['niveau_fond_db'] = round(float(np.median(rdb[~voix])), 1) if (~voix).any() else None
if r['niveau_voix_db'] is not None and r['niveau_fond_db'] is not None: r['fond_sous_la_voix_db'] = round(r['niveau_voix_db'] - r['niveau_fond_db'], 1)
# musique : énergie harmonique hors voix + battement régulier
H, P = librosa.effects.hpss(y)
hr, pr = librosa.feature.rms(y=H, hop_length=hop)[0][:len(t)], librosa.feature.rms(y=P, hop_length=hop)[0][:len(t)]
env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=env, sr=SR, hop_length=hop)
ib = np.diff(librosa.frames_to_time(beats, sr=SR, hop_length=hop)); reg = float(1 - np.std(ib) / np.mean(ib)) if len(ib) > 4 else 0
hors = ~voix
harm_hors = float(np.median(20 * np.log10(hr[hors] + 1e-9))) if hors.any() else -120
r['musique'] = {'probable': bool(reg > .8 and harm_hors > -50), 'tempo_bpm': float(round(float(np.atleast_1d(tempo)[0]), 1)), 'regularite_du_battement': round(reg, 2),
  'niveau_harmonique_hors_voix_db': round(harm_hors, 1), 'part_percussive': round(float(np.sum(pr ** 2) / (np.sum(hr ** 2) + np.sum(pr ** 2) + 1e-12)), 2)}
# où la musique change : sauts d'énergie harmonique lissée sur 2 s
lis = np.convolve(20 * np.log10(hr + 1e-9), np.ones(86) / 86, 'same'); d = np.diff(lis[::43])
r['musique']['changements_s'] = [round(float(t[i * 43]), 1) for i in np.where(np.abs(d) > 6)[0]][:20]
# bruitages : attaques nettes (pics d'attaque bien au-dessus du fond local), avec timbre
on = librosa.onset.onset_detect(onset_envelope=env, sr=SR, hop_length=hop, backtrack=False)
cent = librosa.feature.spectral_centroid(y=y, sr=SR, hop_length=hop)[0]
# pendant la voix, chaque syllabe fait une attaque : seuls les impacts graves (< 150 Hz, que la voix n'a pas) comptent ; sans séparation des pistes,
# un bruitage aigu sous la voix n'est pas mesurable (noté dans le JSON)
M = librosa.feature.melspectrogram(y=y, sr=SR, hop_length=hop, n_mels=64, fmax=8000); fm = librosa.mel_frequencies(n_mels=64, fmax=8000)
grave = librosa.onset.onset_strength(S=librosa.power_to_db(M[fm < 150]), sr=SR, hop_length=hop)
bru = []; W = 43   # ±1 s autour de l'attaque
for f in on:
    pv = bool(voix[min(f, len(voix) - 1)]); src = grave if pv else env
    k = src[min(f, len(src) - 1)] / (np.median(src[max(0, f - W):f + W]) + 1e-9)
    if pv or k < 2.5: continue   # ponytail: bruitages sous la voix non mesurés ; séparer les pistes (Demucs) si un jour il le faut
    c = float(cent[min(f, len(cent) - 1)]); bru.append({'t': round(float(t[f]), 2), 'force': round(float(k), 1),
      'timbre': 'grave (impact, boum)' if c < 800 else 'médium' if c < 3000 else 'aigu (clic, whoosh, cloche)', 'pendant_la_voix': bool(voix[min(f, len(voix) - 1)])})
r['bruitages_probables'] = bru[:60]; r['nb_bruitages_probables'] = len(bru); r['bruitages_limite'] = 'seulement dans les pauses de la voix (sans séparation des pistes, un bruitage sous la voix ne se distingue pas d’une syllabe)'
# silences (sous le fond habituel), brillance de la voix
sil = rdb < (np.percentile(rdb, 10) + 3); s, out = None, []
for i, v in enumerate(sil):
    if v and s is None: s = i
    if (not v or i == len(sil) - 1) and s is not None:
        if t[i] - t[s] >= .3: out.append({'t': round(float(t[s]), 2), 'duree': round(float(t[i] - t[s]), 2)})
        s = None
r['silences'] = out[:30]
r['brillance_voix_hz'] = int(np.median(cent[:len(t)][voix])) if voix.any() else None
json.dump(r, open(sortie, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"✓ son : voix {r['niveau_voix_db']} dB, fond {r.get('fond_sous_la_voix_db')} dB sous la voix, musique {'oui' if r['musique']['probable'] else 'non'} ({r['musique']['tempo_bpm']} bpm), {len(bru)} bruitages probables")
