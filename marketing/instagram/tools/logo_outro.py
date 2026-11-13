#!/usr/bin/env python3
"""Re-cut a GARON reel so it OPENS with the pictures and ENDS with the L02 logo build.

Owner request (2026-11-13): start straight with the photos/footage; the logo
build-up that used to open the reel plays at the end (like the REM100 reference:
content -> white -> logo), then settles into the end card
(logo + «Լողավազաններ · Տներ · Վերանորոգում» + garon.am) with a slow push-in.

The source reel must have the standard layout: 0-6 s L02 intro (with its sound),
content, then the paper end card. Usage:

  python logo_outro.py SRC.mp4 OUT.mp4 --content START END

Audio: the intro sound moves with the logo (it starts when the logo build starts);
the content part is silent so the owner can add music in Instagram.
"""
import argparse, subprocess, json
import numpy as np, cv2

W, H, FPS = 1080, 1920, 30
INTRO = 6.0          # length of L02 intro in the source
XFADE = 0.40         # content -> paper
MOVE = 0.80          # logo glides into end-card position
HOLD = 2.20          # end card hold (text fades in, slow push-in)

# measured on the 1080x1920 frames (R2/R3/R4 share the same L02 intro / end card)
INTRO_LOGO_C = (536.5, 948.0)
END_LOGO_C = (541.0, 706.0)
SCALE = (671 - 411) / (763 - 321)      # mark width end / intro
TEXT_ROWS = (860, 1200)                # services line, divider, garon.am


def frames(path, t0, t1):
    cap = cv2.VideoCapture(path)
    cap.set(cv2.CAP_PROP_POS_MSEC, t0 * 1000)
    n = int(round((t1 - t0) * FPS))
    for _ in range(n):
        ok, f = cap.read()
        if not ok:
            break
        yield f


def last_frame(path):
    cap = cv2.VideoCapture(path)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.set(cv2.CAP_PROP_POS_FRAMES, n - 2)
    ok, f = cap.read()
    return f


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def warp(img, s, c_from, c_to, bg):
    M = np.array([[s, 0, c_to[0] - s * c_from[0]], [0, s, c_to[1] - s * c_from[1]]], np.float32)
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=bg)


def beat_track(path, bpm, dur, stop_at, sr=44100):
    """Simple synthetic four-on-the-floor loop, only so the owner can SEE the cuts land on the beat.
    It is not for publishing: the real song is added in Instagram."""
    import wave
    n = int(dur * sr); y = np.zeros(n, np.float32); spb = 60.0 / bpm
    t = np.arange(int(0.25 * sr)) / sr
    kick = np.sin(2 * np.pi * (45 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
    rng = np.random.default_rng(1)
    hat = rng.standard_normal(int(0.05 * sr)) * np.exp(-np.arange(int(0.05 * sr)) / sr * 90) * 0.25
    clap = rng.standard_normal(int(0.12 * sr)) * np.exp(-np.arange(int(0.12 * sr)) / sr * 35) * 0.35
    b = 0
    while b * spb < stop_at - 0.05:
        i = int(b * spb * sr)
        for snd, at in ((kick, i), (hat, i + int(spb / 2 * sr))) + (((clap, i),) if b % 2 else ()):
            e = min(n, at + len(snd)); y[at:e] += snd[:e - at] * 0.6
        b += 1
    fade = int(0.4 * sr); s = int(stop_at * sr)
    y[max(0, s - fade):s] *= np.linspace(1, 0, s - max(0, s - fade)); y[s:] = 0
    pcm = (np.clip(y, -1, 1) * 32000).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--content', nargs=2, type=float, required=True)
    ap.add_argument('--end-src', help='take the end-card text from this reel instead (e.g. L02 has «Շուտով»)')
    ap.add_argument('--speed', type=float, default=1.0,
                    help='content speed factor, e.g. 123/120 to move a 120 BPM cut grid onto a 123 BPM song')
    ap.add_argument('--beat-preview', help='also write OUT with a synthetic beat at this BPM (preview only)')
    a = ap.parse_args()
    c0, c1 = a.content

    intro = list(frames(a.src, 0.0, INTRO))
    end = last_frame(a.end_src or a.src)
    paper = intro[-1].copy()
    bg = tuple(int(v) for v in np.median(paper.reshape(-1, 3), 0))
    clean = np.full_like(paper, bg, dtype=np.uint8)

    # text layer of the end card (services + divider + garon.am) as alpha over a clean bg
    y0, y1 = TEXT_ROWS
    band = end[y0:y1].astype(np.float32)
    bgest = cv2.medianBlur(end[y0:y1], 31).astype(np.float32)
    alpha = np.clip(np.abs(band - bgest).max(2, keepdims=True) / 40.0, 0, 1)
    # the faint full-width horizon line is part of the design; keep it

    proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24',
                             '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
                             a.out + '.v.mp4'], stdin=subprocess.PIPE)
    put = lambda f: proc.stdin.write(np.ascontiguousarray(f, dtype=np.uint8).tobytes())

    content = list(frames(a.src, c0, c1))
    if a.speed != 1.0:   # resample on the 30 fps grid (nearest frame): 2-3 % change is invisible
        n = int(round(len(content) / a.speed))
        content = [content[min(int(i * a.speed + 0.5), len(content) - 1)] for i in range(n)]
    nx = int(XFADE * FPS)
    for f in content[:-nx]:
        put(f)
    for i, f in enumerate(content[-nx:]):        # content dissolves into the blank paper of intro f0
        k = ease((i + 1) / nx)
        put(cv2.addWeighted(f, 1 - k, intro[0], k, 0))
    for f in intro:
        put(f)
    last = intro[-1]
    nm, nh = int(MOVE * FPS), int(HOLD * FPS)
    for i in range(nm):
        k = ease((i + 1) / nm)
        s = 1 + (SCALE - 1) * k
        c = (INTRO_LOGO_C[0] + (END_LOGO_C[0] - INTRO_LOGO_C[0]) * k,
             INTRO_LOGO_C[1] + (END_LOGO_C[1] - INTRO_LOGO_C[1]) * k)
        put(warp(last, s, INTRO_LOGO_C, c, bg))
    settled = warp(last, SCALE, INTRO_LOGO_C, END_LOGO_C, bg)
    for i in range(nh):
        t = i / FPS
        f = settled.copy().astype(np.float32)
        ta = ease(t / 0.6) * alpha
        f[y0:y1] = f[y0:y1] * (1 - ta) + band * ta
        z = 1 + 0.035 * (i / nh)                       # slow push-in like the reference
        f = warp(f.clip(0, 255).astype(np.uint8), z, (W / 2, 800), (W / 2, 800), bg)
        put(f)
    proc.stdin.close(); proc.wait()

    total = len(content) + len(intro) + nm + nh
    dur = total / FPS
    intro_at = (len(content)) / FPS
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.out + '.v.mp4',
                    '-t', str(INTRO), '-i', a.src,
                    '-filter_complex', f'[1:a]atrim=0:{INTRO},adelay={int(intro_at*1000)}:all=1,apad,atrim=0:{dur}[a]',
                    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', '-t', str(dur), a.out], check=True)
    if a.beat_preview:
        beat_track(a.out + '.beat.wav', float(a.beat_preview), dur, intro_at)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.out, '-i', a.out + '.beat.wav',
                        '-filter_complex', '[0:a][1:a]amix=inputs=2:normalize=0[a]', '-map', '0:v', '-map', '[a]',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
                        a.out.replace('.mp4', '_beat-preview.mp4')], check=True)
        subprocess.run(['rm', '-f', a.out + '.beat.wav'])
    subprocess.run(['rm', '-f', a.out + '.v.mp4'])
    print(json.dumps({'out': a.out, 'dur': round(dur, 2), 'logo_starts': round(intro_at, 2)}))


if __name__ == '__main__':
    main()
