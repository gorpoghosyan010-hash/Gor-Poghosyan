"""R4 compositor: RAW pass + FINISHED pass (+ data EXRs) -> region reveals, laser layout lines, glow, logo, end card.

usage: python3.11 compose.py <render_dir> <intro_dir> <overlay_dir> <out_dir> [--step 2] [--frames a,b,c --stills]
  render_dir : raw_####.png, fin_####.png, raw_data_####.exr, fin_data_####.exr, camera.json (from scene.py)
  intro_dir  : L02_000..179.png (render_l02_frames.js);  overlay_dir: overlays.js output
  writes out_dir/room.mp4 (room part at 30/step fps), out_dir/endcard.mp4 (30 fps) — or PNG stills with --stills.
Times below are in seconds of ROOM time (0 = first frame after the 6 s logo intro).
"""
import sys, os, json, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import OpenEXR
from scipy.ndimage import gaussian_filter, zoom

RD, INTRO, OV, OUT = [os.path.abspath(a) for a in sys.argv[1:5]]
argv = sys.argv[5:]
def arg(n, d): return argv[argv.index(n) + 1] if n in argv else d
STEP = int(arg('--step', '1'))
STILLS = '--stills' in argv
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
FPS = 30
CAM = json.load(open(os.path.join(RD, 'camera.json')))
PAPER = np.array([245, 245, 243], np.float32) / 255
ROOM_END = 13.0          # end card starts
TOTAL = 16.0             # room-time length incl. end card (video = 6 + 16 = 22 s)

def ease(x, k='io'):
    x = min(max(x, 0.0), 1.0)
    if k == 'out': return 1 - (1 - x) ** 3
    if k == 'in': return x ** 3
    return x * x * (3 - 2 * x) if k == 'smooth' else (4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2)
def clamp01(a): return np.clip(a, 0, 1)

# ---------------------------------------------------------------- reveal plan (regions = pass_index in scene.py)
# mode radial: front = |P - origin| < R(t);  rise: front = P.z < R(t)
REVEALS = [
    dict(r=[1], t0=1.75, dur=1.25, mode='radial', o=(-1.9, 2.2, 1.58), rmax=4.2),
    dict(r=[2], t0=3.95, dur=1.35, mode='rise', o=(1.8, 1.64, 0.0), rmax=3.0),
    dict(r=[3], t0=5.85, dur=1.5, mode='radial', o=(-0.25, 0.9, 0.0), rmax=6.8),
    dict(r=[4], t0=8.55, dur=1.4, mode='radial', o=(2.35, 0.05, 0.45), rmax=4.6),
    dict(r=[5, 6, 0], t0=10.7, dur=1.5, mode='radial', o=(0.9, 0.2, 2.9), rmax=7.5),
]
def circle(cx, cy, r, z=0.004, n=64):
    return [(cx + r * math.cos(a), cy + r * math.sin(a), z) for a in np.linspace(0, 2 * math.pi, n)]
Z = 0.004
WX = -0.88
# laser layout lines: (t_start, t_draw, reveal_index, polyline)
LASERS = [
    (0.55, 0.9, 0, [(-0.35, -1.7, Z), (-0.35, 2.245, Z), (-0.35, 2.245, 2.1)]),
    (0.75, 0.7, 0, [(-0.35, 2.245, Z), (-2.99, 2.245, Z), (-2.99, 2.245, 2.89)]),
    (1.0, 0.55, 0, [(-2.55, 2.245, Z), (-2.55, 1.77, Z), (-1.25, 1.77, Z), (-1.25, 2.245, Z)]),
    (1.1, 0.45, 0, [(WX - 0.18, 2.245, Z), (WX - 0.18, 1.71, Z), (WX + 0.18, 1.71, Z), (WX + 0.18, 2.245, Z)]),
    (2.9, 0.75, 1, [(0.6, -1.5, Z), (0.6, 1.64, Z), (2.99, 1.64, Z)]),
    (3.25, 0.6, 1, [(0.6, 1.64, Z), (0.6, 1.64, 2.62), (2.99, 1.64, 2.62)]),
    (3.3, 0.45, 1, [(0.6, 2.245, Z), (0.6, 1.64, Z)]),
    (4.95, 0.8, 2, [(-2.0, -2.0, Z), (-2.0, 2.24, Z)]),
    (5.0, 0.8, 2, [(-2.99, 0.9, Z), (2.99, 0.9, Z)]),
    (5.1, 0.7, 2, [(1.6, -2.2, Z), (1.6, 2.24, Z)]),
    (7.35, 0.7, 3, [(2.99, -1.05, Z), (2.0, -1.05, Z), (2.0, 1.15, Z), (2.99, 1.15, Z)]),
    (7.5, 0.9, 3, [(0.55, -1.25, Z), (2.35, -1.25, Z), (2.35, 1.35, Z), (0.55, 1.35, Z), (0.55, -1.25, Z)]),
    (7.8, 0.6, 3, circle(1.45, 0.05, 0.43)),
    (7.9, 0.5, 3, circle(2.55, -1.55, 0.24)),
    (7.6, 0.8, 3, [(2.99, -1.95, Z), (2.99, -1.95, 2.89), (2.99, 1.62, 2.89), (2.99, 1.62, Z)]),
    (9.95, 0.8, 4, [(2.99, 2.24, Z), (2.99, 2.24, 2.895), (-2.99, 2.24, 2.895)]),
    (10.05, 0.8, 4, [(2.99, 2.24, 2.895), (2.99, -2.24, 2.895), (2.99, -2.24, Z)]),
    (10.15, 0.7, 4, [(-0.2, -2.2, 2.895), (-0.2, 2.2, 2.895)]),
    (10.2, 0.7, 4, [(-2.9, 0.2, 2.895), (2.9, 0.2, 2.895)]),
]
LASER_CORE = np.array([0.80, 0.96, 1.0], np.float32)
LASER_GLOW = np.array([0.10, 0.48, 1.0], np.float32)
FRONT_COL = np.array([0.80, 0.92, 1.0], np.float32)

# ---------------------------------------------------------------- io
def load_png(p):
    return np.asarray(Image.open(p).convert('RGB'), np.float32) / 255
def load_exr(p):
    f = OpenEXR.File(p)
    ch = f.parts[0].channels
    out = {}
    for name, c in ch.items():
        out[name] = np.asarray(c.pixels, np.float32)
    return out
def data_arrays(d):
    pos = None; idx = None
    for k, v in d.items():
        if 'Position' in k:
            if v.ndim == 3: pos = v[..., :3]
        if 'IndexOB' in k:
            idx = v if v.ndim == 2 else v[..., 0]
    if pos is None:  # split channels
        pos = np.stack([d[[k for k in d if 'Position' in k and k.endswith(a)][0]] for a in ('X', 'Y', 'Z')], -1)
    return pos, (np.rint(idx).astype(np.int32) if idx is not None else None)

def cam_proj(fr, pts, w, h):
    M = np.array(CAM['frames'][str(fr)], np.float64); Mi = np.linalg.inv(M)
    P = np.c_[np.asarray(pts, np.float64), np.ones(len(pts))] @ Mi.T
    depth = -P[:, 2]
    k = CAM['lens_mm'] / CAM['sensor_height_mm'] * h
    with np.errstate(divide='ignore', invalid='ignore'):
        x = w / 2 + P[:, 0] / depth * k; y = h / 2 - P[:, 1] / depth * k
    return x, y, depth
def cam_pos(fr):
    return np.array(CAM['frames'][str(fr)], np.float64)[:3, 3]

def resample_line(poly, step=0.025):
    pts = []
    for a, b in zip(poly[:-1], poly[1:]):
        a, b = np.array(a), np.array(b); n = max(2, int(np.linalg.norm(b - a) / step) + 1)
        for i in range(n - (1 if len(pts) else 0) if False else n):
            pts.append(a + (b - a) * i / (n - 1))
    return np.array(pts)
LASER_PTS = [(t0, td, ri, resample_line(poly)) for t0, td, ri, poly in LASERS]

OV_IMG = {n: np.asarray(Image.open(os.path.join(OV, n + '.png')).convert('RGBA'), np.float32) / 255
          for n in ('ec_logo', 'ec_rule', 'ec_cats', 'ec_horizon', 'ec_url', 'corner_logo')}
INTRO_LAST = load_png(os.path.join(INTRO, 'L02_179.png'))
RNG = np.random.default_rng(3)
VIGN = None

def over(img, rgba, alpha=1.0, dy=0.0, xmask=None):
    a = rgba[..., 3:4] * alpha
    src = rgba[..., :3]
    if dy:
        sh = int(round(dy)); a = np.roll(a, sh, 0); src = np.roll(src, sh, 0)
    if xmask is not None: a = a * xmask[None, :, None]
    return img * (1 - a) + src * a

# ---------------------------------------------------------------- room frame (render-res maths, then 1080x1920)
def room_frame(fr, t):
    raw = load_png(os.path.join(RD, f'raw_{fr:04d}.png'))
    fin = load_png(os.path.join(RD, f'fin_{fr:04d}.png'))
    fpos, idx = data_arrays(load_exr(os.path.join(RD, f'fin_data_{fr:04d}.exr')))
    rpos, _ = data_arrays(load_exr(os.path.join(RD, f'raw_data_{fr:04d}.exr')))
    h, w = raw.shape[:2]
    M = np.zeros((h, w), np.float32); G = np.zeros((h, w), np.float32); RIP = np.zeros((h, w), np.float32)
    for rv in REVEALS:
        sel = np.isin(idx, rv['r'])
        if not sel.any(): continue
        p = (t - rv['t0']) / rv['dur']
        if p <= 0:
            # touch ripple just before the reveal: two thin rings racing out on the surfaces
            if p > -0.35 and rv['mode'] == 'radial':
                d = np.linalg.norm(fpos - np.array(rv['o']), axis=-1)
                q = (p + 0.35) / 0.35
                for k, lag in ((1.0, 0), (0.6, 0.25)):
                    rr = 0.02 + 0.45 * ease(max(q - lag, 0), 'out')
                    RIP += k * (1 - q) * np.exp(-((d - rr) / 0.012) ** 2)
            continue
        R = ease(p, 'smooth') * rv['rmax'] if p < 1 else 1e9
        if rv['mode'] == 'radial': d = np.linalg.norm(fpos - np.array(rv['o']), axis=-1)
        else: d = fpos[..., 2]
        soft = 0.10
        m = clamp01((R - d) / soft)
        M = np.where(sel, np.maximum(M, m), M)
        if p < 1.15:
            fade = 1.0 if p < 0.85 else max(0.0, (1.15 - p) / 0.3)
            g = np.exp(-((d - R + soft * 0.5) / 0.07) ** 2) * fade
            G = np.where(sel, np.maximum(G, g), G)
    M = gaussian_filter(M, 0.8)
    img = raw * (1 - M[..., None]) + fin * M[..., None]
    # bloom (window, LEDs, spots)
    lum = img.mean(-1)
    hi = clamp01((lum - 0.78) / 0.22)[..., None] * img
    img = img + 0.28 * gaussian_filter(hi, (9, 9, 0)) + 0.12 * gaussian_filter(hi, (30, 30, 0))
    # reveal front glow + sparks
    if G.max() > 0.01:
        spark = (RNG.random((h, w)) > 0.992).astype(np.float32) * G
        glow = G * 0.4 + gaussian_filter(G, 3) * 0.45 + gaussian_filter(G, 12) * 0.35 + gaussian_filter(spark, 0.7) * 3.0
        img = img + glow[..., None] * FRONT_COL
    if RIP.max() > 0.01:
        img = img + (RIP * 0.9 + gaussian_filter(RIP, 4) * 1.2)[..., None] * LASER_CORE
    # surface position for laser occlusion
    spos = np.where((M > 0.5)[..., None], fpos, rpos)
    # upscale to 1080x1920 (Lanczos) + light sharpen
    im8 = Image.fromarray((clamp01(img) * 255 + 0.5).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    im8 = im8.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=1))
    out = np.asarray(im8, np.float32) / 255
    # lasers
    out = draw_lasers(out, fr, t, spos)
    return out

def draw_lasers(out, fr, t, spos):
    h, w = spos.shape[:2]
    core = Image.new('L', (W, H), 0); dc = ImageDraw.Draw(core)
    cam = cam_pos(fr)
    any_ = False
    for t0, td, ri, pts in LASER_PTS:
        rv = REVEALS[ri]
        if t < t0: continue
        fade_t = rv['t0'] + rv['dur'] * 0.55
        alpha = 1.0 - clamp01((t - fade_t) / 0.6)
        if alpha <= 0: continue
        n = len(pts); k = int(math.ceil(n * ease((t - t0) / td, 'io')))
        if k < 2: continue
        P = pts[:k]
        x, y, dep = cam_proj(fr, P, W, H)
        # occlusion vs. visible surface (sampled at render res)
        xs = np.clip((x / W * w).astype(int), 0, w - 1); ys = np.clip((y / H * h).astype(int), 0, h - 1)
        surf = np.linalg.norm(spos[ys, xs] - cam, axis=-1)
        dist = np.linalg.norm(P - cam, axis=-1)
        vis = (dep > 0.08) & (dist < surf + 0.08) & (x > -400) & (x < W + 400) & (y > -400) & (y < H + 400)
        val = int(255 * alpha)
        run = []
        for i in range(k):
            if vis[i]: run.append((float(x[i]), float(y[i])))
            if (not vis[i] or i == k - 1) and len(run) > 1:
                dc.line(run, fill=val, width=4, joint='curve'); any_ = True
            if not vis[i]: run = []
        if 0 < (t - t0) / td < 1 and vis[k - 1]:   # bright laser head
            dc.ellipse([x[k - 1] - 7, y[k - 1] - 7, x[k - 1] + 7, y[k - 1] + 7], fill=val); any_ = True
    if not any_: return out
    c = np.asarray(core, np.float32) / 255
    g1 = np.asarray(core.filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
    g2 = np.asarray(core.filter(ImageFilter.GaussianBlur(24)), np.float32) / 255
    out = out + c[..., None] * LASER_CORE * 0.95 + g1[..., None] * LASER_GLOW * 1.6 + g2[..., None] * LASER_GLOW * 1.4
    return out

def finish(out, t, fr_seed):
    global VIGN
    if VIGN is None:
        yy, xx = np.mgrid[0:H, 0:W]; r = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
        VIGN = (1 - 0.22 * clamp01(r - 0.35) ** 1.6)[..., None].astype(np.float32)
    out = out * VIGN
    out = out + np.random.default_rng(fr_seed).normal(0, 0.010, (H, W, 1)).astype(np.float32)
    # opening: from the light logo frame into an over-exposed room (like the reference's first frame)
    if t < 1.0:
        k = ease(t / 1.0, 'io')
        out = 1 - (1 - out) * (0.15 + 0.85 * k)
        a = 1 - ease(min(max((t - 0.05) / 0.45, 0), 1), 'io')
        if a > 0:
            s = 1 + 0.15 * ease(min(t / 0.6, 1), 'in')
            im = Image.fromarray((INTRO_LAST * 255).astype(np.uint8)).resize((int(W * s), int(H * s)), Image.BICUBIC)
            l = (im.width - W) // 2; tp = int((im.height - H) * (158 + 700) / 1920)
            iv = np.asarray(im.crop((l, tp, l + W, tp + H)), np.float32) / 255
            out = out * (1 - a) + iv * a
    # corner logo
    ca = ease((t - 0.8) / 0.5, 'io') * 0.95 * (1 - ease((t - ROOM_END) / 0.4, 'io'))
    if ca > 0: out = over(out, OV_IMG['corner_logo'], ca)
    return clamp01(out)

def endcard(base, t):
    """base: last room image (1080x1920 float). Times relative to ROOM_END, R2 v2 end-card rhythm."""
    u = (t - ROOM_END) * FPS  # frames since end-card start (R2: 666)
    def kf(keys):
        if u <= keys[0][0]: return keys[0][1]
        for (a, va, ez), (b, vb, *_ ) in zip(keys[:-1], keys[1:]):
            if u < b: return va + (vb - va) * ease((u - a) / (b - a), ez)
        return keys[-1][1]
    blur = kf([(0, 0, 'smooth'), (26, 8, 'smooth')])
    img = base
    if blur > 0.3:
        img = np.asarray(Image.fromarray((clamp01(base) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur)), np.float32) / 255
    veil = kf([(0, 0, 'smooth'), (24, 0.9, 'io'), (98, 0.94, 'smooth'), (113, 1.0, 'smooth')])
    img = img * (1 - veil) + PAPER * veil
    o = kf([(10, 0, 'out'), (28, 1, 'out')]); dy = kf([(10, 14, 'out'), (28, 0, 'out')])
    if o > 0: img = over(img, OV_IMG['ec_logo'], o, dy)
    sx = kf([(20, 0, 'out'), (32, 1, 'out')])
    if sx > 0:
        xm = (np.abs(np.arange(W) - 540) <= 32 * sx + 0.5).astype(np.float32); img = over(img, OV_IMG['ec_rule'], 1, 0, xm)
    o = kf([(26, 0, 'out'), (38, 1, 'out')]); dy = kf([(26, 10, 'out'), (38, 0, 'out')])
    if o > 0: img = over(img, OV_IMG['ec_cats'], o, dy)
    sx = kf([(6, 0, 'io'), (28, 1, 'io')])
    if sx > 0:
        xm = (np.arange(W) <= W * sx).astype(np.float32); img = over(img, OV_IMG['ec_horizon'], 1, 0, xm)
    o = kf([(36, 0, 'out'), (46, 1, 'out')])
    if o > 0: img = over(img, OV_IMG['ec_url'], o)
    return clamp01(img)

# ---------------------------------------------------------------- main
def available(fr): return os.path.exists(os.path.join(RD, f'fin_data_{fr:04d}.exr')) and os.path.exists(os.path.join(RD, f'raw_{fr:04d}.png'))
def to8(a): return (clamp01(a) * 255 + 0.5).astype(np.uint8)

def ff(path, fps):
    return subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)

if STILLS:
    frs = [int(v) for v in arg('--frames', '0').split(',')]
    tts = [float(v) for v in arg('--tt', '').split(',')] if '--tt' in argv else [f / FPS for f in frs]
    if len(frs) == 1: frs = frs * len(tts)
    for fr, t in zip(frs, tts):
        img = finish(room_frame(fr, t), t, fr)
        if t >= ROOM_END: img = endcard(img, t)
        Image.fromarray(to8(img)).save(os.path.join(OUT, f'still_{fr:04d}_{t:05.2f}.png'))
        print('still', fr, flush=True)
    sys.exit(0)

# room part (t < ROOM_END) at 30/STEP fps
last_fr = int(ROOM_END * FPS)
p = ff(os.path.join(OUT, 'room.mp4'), FPS / STEP)
cache = {}
for fr in range(0, last_fr, STEP):
    t = fr / FPS
    img = finish(room_frame(fr, t), t, fr)
    p.stdin.write(to8(img).tobytes())
    if fr % 30 == 0: print('room', fr, flush=True)
p.stdin.close(); p.wait()
# end card at 30 fps: room keeps gliding under the veil until the last rendered frame, then holds
p = ff(os.path.join(OUT, 'endcard.mp4'), FPS)
rendered = sorted(int(f[4:8]) for f in os.listdir(RD) if f.startswith('fin_') and f.endswith('.png'))
maxfr = max(fr for fr in rendered if available(fr))
prev = None
for fr in range(last_fr, int(TOTAL * FPS)):
    t = fr / FPS
    src = min(fr, maxfr)
    if src % STEP: src -= src % STEP
    if src not in cache:
        cache = {src: finish(room_frame(src, src / FPS), src / FPS, src)}
    base = cache[src]
    p.stdin.write(to8(endcard(base, t)).tobytes())
p.stdin.close(); p.wait()
print('done')
