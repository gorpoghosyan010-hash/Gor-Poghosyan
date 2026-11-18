#!/usr/bin/env python3
"""Preview-only beat track: loops one 4-beat bar of the reference song (starts at 3.165 s, 4*60/125.25 s long,
12 ms edge fades) from t=0 through the whole video, 1.2 s fade-out at the end. A kick lands at t=0 and on every beat
of the 125.25 BPM grid the reel is cut on. usage: beat_preview.py song.wav out.wav duration_s"""
import sys, wave
import numpy as np

src, out, dur = sys.argv[1], sys.argv[2], float(sys.argv[3])
with wave.open(src, 'rb') as w:
    sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
    raw = w.readframes(w.getnframes())
assert sw == 2, 'expects 16-bit PCM'
y = np.frombuffer(raw, np.int16).reshape(-1, ch).astype(np.float32) / 32768
BAR = 4 * 60 / 125.25
s0 = int(round(3.165 * sr))
n_total = int(round(dur * sr))
bar = y[s0:s0 + int(round(BAR * sr))].copy()
f = int(0.012 * sr)
ramp = np.linspace(0, 1, f)[:, None]
bar[:f] *= ramp; bar[-f:] *= ramp[::-1]
out_y = np.zeros((n_total, ch), np.float32)
k = 0
while True:
    a = int(round(k * BAR * sr))              # place each bar on the exact grid (no drift)
    if a >= n_total:
        break
    e = min(n_total, a + len(bar))
    out_y[a:e] += bar[:e - a]
    k += 1
fo = int(1.2 * sr)
out_y[-fo:] *= np.linspace(1, 0, fo)[:, None]
pcm = (np.clip(out_y * 0.89, -1, 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
print('beat preview', out, round(dur, 3), 's, bars', k)
