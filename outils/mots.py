"""mots.py : les mots d'une vidéo et leurs instants (Whisper, horodatage des mots). Langue détectée, jamais imposée.
  python outils/mots.py video.mp4 sortie.json [--model small]
"""
import sys, json, argparse, subprocess
import numpy as np
import whisper

ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('sortie'); ap.add_argument('--model', default='small')
a = ap.parse_args()
pcm = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', a.video, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout, np.float32)
m = whisper.load_model(a.model)
r = m.transcribe(pcm, word_timestamps=True, fp16=False, condition_on_previous_text=False)
mots = [{'w': w['word'].strip(), 'start': round(w['start'], 3), 'end': round(w['end'], 3)} for s in r['segments'] for w in s.get('words', []) if w['word'].strip()]
json.dump({'langue': r.get('language'), 'mots': mots, 'phrases': [{'texte': s['text'].strip(), 'start': round(s['start'], 3), 'end': round(s['end'], 3)} for s in r['segments']]},
          open(a.sortie, 'w', encoding='utf-8'), ensure_ascii=False)
print(f"{len(mots)} mots ({r.get('language')})")
