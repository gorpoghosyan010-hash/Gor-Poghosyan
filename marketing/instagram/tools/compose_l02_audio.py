"""Original soundtrack for the L02 launch reel (26 s, 120 BPM), synthesized from scratch.
Timed to items.L02.audio.beat_map in 04-render-spec.json. Usage: python compose_l02_audio.py out.wav [--intro-only]
--r2: intro for the R2 «Առաջ / Հետո» reel (2026-11-12-reel-2, items.R2.audio.beat_map): 24.0 s file, sound 0-4.6 s
      (outline ticks, pour, gold impact on the 2.0 s downbeat, glint, shutter accent at 4.0 s), digital silence after.
      The default L02 output is unchanged (the R2 branch runs before any L02 code and uses its own RNG)."""
import sys, numpy as np, wave
SR = 48000; DUR = 26.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt(0.5 * (1 - pan)); R[i:j] += s * np.sqrt(0.5 * (1 + pan))

def env(n, a=0.005, d=0.3, curve=4.0):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, x - a) / d)
    return e

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for k in range(len(x)): acc = (1 - a) * x[k] + a * acc; y[k] = acc
    return y

def lp_fast(x, fc):  # vectorised one-pole via FFT approximation
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

def hp_fast(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * (f / fc) ** 2 / np.sqrt(1 + (f / fc) ** 4), len(x))

def note(m): return 440.0 * 2 ** ((m - 69) / 12)

if "--r2" in sys.argv:  # ---------------- R2 intro (24 s file, 120 BPM, frames/30 = seconds)
    DUR = 24.0; N = int(SR * DUR); t = np.arange(N) / SR; L = np.zeros(N); R = np.zeros(N)
    rng = np.random.default_rng(11)
    def whoosh2(length, f_lo, gain, start, pan=0.0, rise=True):
        n = int(length * SR); x = np.arange(n) / SR; noise = rng.standard_normal(n)
        lo = lp_fast(noise, f_lo); hi = lp_fast(noise, 4000)
        w = (x / length) if rise else (1 - x / length)
        shape = np.sin(np.pi * np.clip(x / length, 0, 1)) ** 1.5
        add(((1 - w) * lo + w * hi) * shape * 0.35, start, gain, pan)
    # pad: Dm9 -> Bbmaj7 (one bar each), slow swell, held into the shutter
    n = int(4.8 * SR); x = np.arange(n) / SR; pad = np.zeros(n)
    for ch, s0, s1 in (([50, 57, 60, 64, 65], 0.0, 2.2), ([46, 53, 57, 60, 62], 1.9, 4.8)):
        g = np.clip((x - s0) / 0.4, 0, 1) * np.clip((s1 - x) / 0.4, 0, 1)
        for m in ch:
            for det in (-0.07, 0.0, 0.07):
                f = note(m) * 2 ** (det / 12); pad += ((x * f + rng.uniform(0, 1)) % 1 * 2 - 1) * 0.1 * g
    pad = lp_fast(pad, 850) * np.interp(x, [0, 1.6, 3.6, 4.8], [0, 0.6, 0.8, 0.7])
    add(pad, 0.0, 0.5)
    # outline ticks (f4/10/18) + dimension tick (f30)
    for k, s in enumerate((0.133, 0.333, 0.6, 1.0)):
        n = int(0.06 * SR); x = np.arange(n) / SR
        add(np.sin(2 * np.pi * (2300 + 280 * k) * x) * env(n, 0.001, 0.02), s, 0.22, -0.35 + 0.23 * k)
    # pour f34-58: low rising fill
    whoosh2(0.95, 300, 0.55, 1.1, -0.1)
    n = int(0.9 * SR); x = np.arange(n) / SR
    add(np.sin(2 * np.pi * np.cumsum(55 + 25 * x / 0.9) / SR) * np.sin(np.pi * x / 0.9) ** 2, 1.1, 0.25)
    # gold fill = soft impact on the 2.0 s downbeat (f60)
    n = int(2.2 * SR); x = np.arange(n) / SR
    add(np.sin(2 * np.pi * np.cumsum(42 + 60 * np.exp(-x * 9)) / SR) * env(n, 0.003, 1.0, 3)
        + lp_fast(rng.standard_normal(n), 1400) * env(n, 0.001, 0.18, 5) * 0.4, 2.0, 0.85)
    # glint shimmer f66
    for k, m in enumerate((86, 89, 93, 98)):
        n = int(1.4 * SR); x = np.arange(n) / SR
        add((np.sin(2 * np.pi * note(m) * x) + 0.3 * np.sin(2 * np.pi * note(m) * 2.76 * x)) * env(n, 0.002, 0.8, 3), 2.2 + 0.07 * k, 0.11, -0.5 + 0.33 * k)
    # wordmark air f72
    whoosh2(0.8, 1500, 0.22, 2.35, 0.3, rise=False)
    # shutter f120: pre-whoosh into a low hit + one felt-piano-like pluck chord
    whoosh2(0.7, 500, 0.4, 3.35, 0.2)
    n = int(1.4 * SR); x = np.arange(n) / SR
    add(np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-x * 12)) / SR) * env(n, 0.002, 0.6, 3), 4.0, 0.6)
    for k, m in enumerate((62, 69, 74, 77)):
        n = int(1.2 * SR); x = np.arange(n) / SR; f = note(m)
        add(sum(np.sin(2 * np.pi * f * h * x) / h ** 1.6 for h in range(1, 6)) * env(n, 0.003, 0.4, 4), 4.0 + 0.05 * k, 0.09, -0.3 + 0.2 * k)
    def reverb2(x, seed):
        r = np.random.default_rng(seed); n = int(1.8 * SR)
        ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.6); ir = lp_fast(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
        m = len(x) + n; F = 1 << (m - 1).bit_length()
        return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[: len(x)]
    L = L + 0.28 * reverb2(L, 3); R = R + 0.28 * reverb2(R, 4)
    fade = np.interp(t, [0, 0.03, 4.05, 4.6, DUR], [0, 1, 1, 0, 0]); L *= fade; R *= fade
    mx = max(np.abs(L).max(), np.abs(R).max()); L /= mx; R /= mx
    L = np.tanh(L * 1.3) / np.tanh(1.3) * 0.89; R = np.tanh(R * 1.3) / np.tanh(1.3) * 0.89
    L[t >= 4.6] = 0; R[t >= 4.6] = 0
    out = (np.stack([L, R], 1) * 32767).astype(np.int16)
    with wave.open([a for a in sys.argv[1:] if not a.startswith('--')][0], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
    print('ok (r2)', sys.argv[1]); sys.exit(0)

# --- pad: Dm9 | Bbmaj7 | Fmaj7 | Csus  (2 bars each = 4 s), warm detuned saws
chords = [[50, 57, 60, 64, 65], [46, 53, 57, 60, 62], [41, 53, 57, 60, 64], [48, 55, 60, 62, 67]]
pad = np.zeros(N)
for c in range(7):
    ch = chords[c % 4]; s0 = c * 4.0; n = int(4.6 * SR); x = np.arange(n) / SR
    seg = np.zeros(n)
    for m in ch:
        for det in (-0.08, 0.0, 0.08):
            f = note(m) * 2 ** (det / 12)
            ph = rng.uniform(0, 1)
            seg += ((x * f + ph) % 1 * 2 - 1) * 0.12
    seg = lp_fast(seg, 900) * np.minimum(1, x / 0.8) * np.minimum(1, (4.6 - x) / 0.8)
    i = int(s0 * SR); j = min(N, i + n); pad[i:j] += seg[: j - i]
padenv = np.interp(t, [0, 2.5, 6, 22.5, 24, 26], [0, 0.55, 0.7, 0.7, 0.9, 0])
add(pad * padenv, 0, 0.55)

# --- ticks as stems rise (f45/50/55)
for k, s in enumerate((1.5, 1.667, 1.833)):
    n = int(0.06 * SR); x = np.arange(n) / SR
    add(np.sin(2 * np.pi * (2400 + 300 * k) * x) * env(n, 0.001, 0.02), s, 0.25, -0.3 + 0.3 * k)

def whoosh(length, f0, f1, gain, start, pan=0.0):
    n = int(length * SR); x = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweep by blending band-limited noises
    fc = np.geomspace(f0, f1, n)
    lo = lp_fast(noise, 600); mid = lp_fast(noise, 2500); hi = noise
    w = np.clip((np.log(fc) - np.log(600)) / (np.log(6000) - np.log(600)), 0, 1)
    sig = (1 - w) * lo + w * 0.5 * (mid + hi)
    shape = np.sin(np.pi * np.clip(x / length, 0, 1)) ** 1.5
    add(sig * shape * 0.35, start, gain, pan)

whoosh(0.9, 400, 5000, 0.5, 1.75)            # roof bands extrude
# --- impact at 3.5 s: sub boom + noise burst
n = int(2.5 * SR); x = np.arange(n) / SR
f = 40 + 70 * np.exp(-x * 9)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 1.2, 3)
burst = lp_fast(rng.standard_normal(n), 1800) * env(n, 0.001, 0.25, 5) * 0.6
add(boom + burst, 3.5, 1.0)
whoosh(0.6, 300, 3000, 0.35, 2.95)            # pre-impact suck
# --- glint shimmer at 4.0–4.6
for k, m in enumerate((86, 89, 93, 98)):
    n = int(1.6 * SR); x = np.arange(n) / SR
    bell = (np.sin(2 * np.pi * note(m) * x) + 0.3 * np.sin(2 * np.pi * note(m) * 2.76 * x)) * env(n, 0.002, 0.9, 3)
    add(bell, 4.05 + 0.07 * k, 0.12, -0.5 + 0.33 * k)

# --- groove 6.0–22.5 s
def kick():
    n = int(0.45 * SR); x = np.arange(n) / SR
    f = 48 + 110 * np.exp(-x * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.35, 4)
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return hp_fast(rng.standard_normal(n), 7000) * env(n, 0.001, 0.2 if open_ else 0.03, 5)
def rim():
    n = int(0.12 * SR); x = np.arange(n) / SR
    return (hp_fast(rng.standard_normal(n), 1500) * 0.6 + np.sin(2 * np.pi * 1700 * x)) * env(n, 0.001, 0.05, 5)
def pluck(m):
    n = int(0.7 * SR); x = np.arange(n) / SR; f = note(m)
    s = sum(np.sin(2 * np.pi * f * h * x) / h ** 1.6 for h in range(1, 6))
    return s * env(n, 0.003, 0.35, 4)

K, H, Hopen, Rm = kick(), hat(), hat(True), rim()
arp = [[62, 65, 69, 72], [58, 62, 65, 69], [57, 60, 64, 65], [60, 62, 67, 72]]
b = 6.0
while b < 22.5 - 1e-6:
    beat = int(round((b - 6.0) / 0.5))
    if beat % 2 == 0: add(K, b, 0.9)
    else: add(Rm, b, 0.18, 0.15)
    add(H, b + 0.25, 0.10, 0.35)
    if beat % 4 == 3: add(Hopen, b + 0.25, 0.06, 0.35)
    ch = arp[int(b // 4) % 4]
    add(pluck(ch[beat % 4]), b, 0.10, -0.25)
    add(pluck(ch[(beat + 2) % 4] + 12), b + 0.25, 0.05, 0.25)
    b += 0.5

# transitions: gold-piece openings (rising chime), wipes (whoosh), roof-band accents (whoosh + low hit)
for s in (6.0, 10.5, 15.0, 19.5):
    for k, m in enumerate((74, 79, 83)):
        n = int(1.0 * SR); x = np.arange(n) / SR
        add(np.sin(2 * np.pi * note(m) * x) * env(n, 0.002, 0.5, 3), s - 0.12 + 0.04 * k, 0.09, 0.2)
for s in (7.0, 11.5, 16.0, 20.5, 21.5):
    whoosh(0.55, 500, 6000, 0.45, s - 0.3, 0.3)
for s, g in ((8.5, 0.6), (13.0, 0.6), (17.5, 0.85)):
    whoosh(0.8, 300, 5000, 0.5, s - 0.55, -0.3)
    n = int(1.2 * SR); x = np.arange(n) / SR
    add(np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-x * 12)) / SR) * env(n, 0.002, 0.6, 3), s, g * 0.7)

# end card 22.5: final hit + resolve
n = int(3.5 * SR); x = np.arange(n) / SR
add(np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-x * 8)) / SR) * env(n, 0.003, 1.6, 2.5), 22.5, 0.9)
for k, m in enumerate((62, 69, 74, 77, 81)):
    add(pluck(m) * 1.2, 22.5 + 0.06 * k, 0.12, -0.4 + 0.2 * k)

# --- reverb (stereo exponential-noise IR)
def reverb(x, seconds=2.2, seed=1):
    r = np.random.default_rng(seed); n = int(seconds * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.2); ir = lp_fast(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n; F = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[: len(x)]
L = L + 0.28 * reverb(L, seed=1); R = R + 0.28 * reverb(R, seed=2)

# master: fade, soft clip, normalise to -1 dBFS
INTRO_ONLY = "--intro-only" in sys.argv
fade = np.interp(t, [0, 0.05, 25.0, 26.0], [0, 1, 1, 0])
if INTRO_ONLY:  # owner keeps only the 0-6 s intro; music after 6 s is added in Instagram
    fade *= np.interp(t, [0, 5.4, 5.98, 26.0], [1, 1, 0, 0])
L *= fade; R *= fade
mx = max(np.abs(L).max(), np.abs(R).max()); L /= mx; R /= mx
L = np.tanh(L * 1.3) / np.tanh(1.3) * 0.89; R = np.tanh(R * 1.3) / np.tanh(1.3) * 0.89
out = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open([a for a in sys.argv[1:] if not a.startswith('--')][0], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('ok', sys.argv[1])
