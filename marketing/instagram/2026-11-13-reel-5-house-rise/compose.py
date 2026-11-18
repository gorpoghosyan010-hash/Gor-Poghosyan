#!/usr/bin/env python3
"""R5 «House rise» compositor: owner's real photos of house-A, foundation -> frame -> finished (day) -> finished (night).

All motion is a 2D camera over the real photos plus masks/lines (no generated imagery):
  START  01-start-foundation.jpg   (empty lot + foundation formwork)
  PROG   02-progress-frame.jpg     (concrete / gas-block frame, frontal)
  DAY    04-final-day.jpg          (finished, travertine facade, daylight; enhanced by prep_day.py)
  NIGHT  03-final-night.jpg        (finished, lit, night)
Geometry: START->PROG similarity (house base on the formwork), PROG->DAY and DAY->NIGHT homographies
from hand-picked facade points (slab/box corners, window/door corners). The camera is a homography that
is interpolated through those spaces, so the move reads as one continuous camera.

Timeline is on a 125.25 BPM grid (1 beat = 0.479 s = 14.37 frames); b = beat index from content t=0.
  b0-4   START, slow push-in toward the formwork                      label Տուն / Սկիզբ
  b4-8   blue laser layout: formwork lines -> corner verticals -> house outline + floor lines
  b8-14  house rises inside its silhouette floor by floor (b8, b10, b12), ground/sky follow, camera -> PROG
                                                                       label Ընթացք (b8)
  b14-16 lasers run along slabs / box / window + door edges of the frame
  b16-19 facade turns into the finished DAY facade, band by band (ground floor, slab, upper floor, box)
  b20    label Արդյունք; DAY hold with slow push
  b22-24 dusk: DAY darkens into the NIGHT photo (lights off), lasers trace the LED lines
  b24    lights ON (kick): windows + LED strips, warm bloom
  b24-30 NIGHT photo, slow push; content ends at b30 (logo outro starts there)
usage: compose.py <assets_dir> <overlay_dir> <out.mp4> [--stills DIR --frames 0,100,...]
"""
import argparse, os, subprocess
import numpy as np, cv2

W, H, FPS = 1080, 1920, 30
BPM = 125.25
BEAT = 60.0 / BPM
NB = 30                                   # content length in beats
NF = int(round(NB * BEAT * FPS))          # 431 frames
EXT = 700                                 # sky extension on top of the DAY photo (px)
BLUE = np.array([255, 195, 79], np.float32) / 255.0      # #4fc3ff in BGR
WARM = np.array([170, 215, 255], np.float32) / 255.0

# ---------------------------------------------------------------- geometry (hand-picked, original px)
S_BASE = [(476, 952), (1333, 968)]                  # formwork bottom corners (START)
P_BASE = [(330, 1212), (1385, 1212)]                # ground-floor wall bottoms (PROG)
PD = [((238, 132), (289, 64)), ((1120, 267), (1054, 392)), ((230, 346), (286, 305)), ((1118, 465), (1054, 557)),
      ((206, 722), (276, 665)), ((206, 802), (274, 774)), ((1342, 800), (1192, 817)), ((1347, 876), (1192, 882)),
      ((400, 862), (467, 847)), ((852, 900), (837, 884))]
DN = [((289, 64), (232, 82)), ((286, 305), (222, 342)), ((1054, 557), (1072, 580)), ((276, 665), (197, 732)),
      ((274, 774), (200, 858)), ((1192, 817), (1240, 880)), ((1192, 882), (1243, 968)), ((467, 847), (367, 924)),
      ((837, 884), (810, 965))]
# house silhouette in PROG px
HOUSE_P = [(330, 1212), (330, 872), (255, 850), (206, 802), (206, 722), (345, 722), (345, 668), (275, 665),
           (230, 346), (238, 132), (965, 243), (965, 140), (1405, 220), (1405, 252), (1385, 262), (1385, 1212)]
# house silhouette in DAY px
HOUSE_D = [(289, 60), (896, 320), (896, 290), (1194, 414), (1194, 1160), (395, 1160), (395, 835), (272, 790),
           (272, 595), (292, 595), (286, 305)]


def H3(m):
    return np.vstack([m, [0, 0, 1]]) if m.shape == (2, 3) else m


def sim_cam(s, cx, cy, r=0.0):
    c, sn = np.cos(r) * s, np.sin(r) * s
    return np.array([[c, -sn, W / 2 - (c * cx - sn * cy)], [sn, c, H / 2 - (sn * cx + c * cy)], [0, 0, 1]], np.float64)


CORN = np.float32([[0, 0], [W, 0], [W, H], [0, H]])


def quad(K):
    return cv2.perspectiveTransform(CORN[None], np.linalg.inv(K))[0]


def qlerp(K0, K1, u):
    q = quad(K0) * (1 - u) + quad(K1) * u
    return cv2.getPerspectiveTransform(q.astype(np.float32), CORN).astype(np.float64)


def clamp(x, a=0.0, b=1.0):
    return np.minimum(np.maximum(x, a), b)


def ez(x):
    x = clamp(x)
    return x * x * x * (x * (x * 6 - 15) + 10)


def eout(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def warp(img, M, border=cv2.BORDER_REPLICATE):
    return cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=border)


GX, GY = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))


def world_maps(K):
    Ki = np.linalg.inv(K).astype(np.float32)
    d = Ki[2, 0] * GX + Ki[2, 1] * GY + Ki[2, 2]
    return (Ki[0, 0] * GX + Ki[0, 1] * GY + Ki[0, 2]) / d, (Ki[1, 0] * GX + Ki[1, 1] * GY + Ki[1, 2]) / d


def poly_mask(shape, pts, blur):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.int32(pts)], 255)
    m = m.astype(np.float32) / 255
    return cv2.GaussianBlur(m, (0, 0), blur) if blur else m


def line_y(p, q, x):
    return p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0])


# ---------------------------------------------------------------- lasers
class Lasers:
    """thin glowing layout lines with a bright head and soft bloom; drawn in screen space"""
    def __init__(self):
        self.core = np.zeros((H, W), np.uint8); self.thick = np.zeros((H, W), np.uint8)
        self.head = np.zeros((H, W), np.uint8); self.n = 0

    def add(self, pts_world, K, u, inten=1.0, head=True):
        if u <= 0 or inten <= 0:
            return
        P = np.float64(pts_world)
        seg = np.hypot(*np.diff(P, axis=0).T); L = seg.sum(); cut = u * L
        out = [P[0]]; acc = 0.0
        for i, s in enumerate(seg):
            if acc + s >= cut:
                out.append(P[i] + (P[i + 1] - P[i]) * ((cut - acc) / max(s, 1e-6))); break
            out.append(P[i + 1]); acc += s
        S = cv2.perspectiveTransform(np.float64(out)[None], K)[0]
        pts = np.int32(np.round(S * 4))
        v = int(255 * min(1.0, inten))
        cv2.polylines(self.core, [pts], False, v, 2, cv2.LINE_AA, shift=2)
        cv2.polylines(self.thick, [pts], False, v, 6, cv2.LINE_AA, shift=2)
        if head and u < 0.999:
            x, y = S[-1]
            cv2.circle(self.head, (int(x * 4), int(y * 4)), 4 * 5, v, -1, cv2.LINE_AA, shift=2)
        self.n += 1

    def render(self, atten=None):
        if self.n == 0:
            return None
        core = self.core.astype(np.float32) / 255
        glow = cv2.GaussianBlur(self.thick.astype(np.float32) / 255, (0, 0), 4)
        small = cv2.resize(self.thick, (W // 4, H // 4), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        bloom = cv2.resize(cv2.GaussianBlur(small, (0, 0), 5), (W, H))
        hd = self.head.astype(np.float32) / 255
        hs = cv2.resize(cv2.GaussianBlur(cv2.resize(hd, (W // 4, H // 4), interpolation=cv2.INTER_AREA), (0, 0), 4), (W, H))
        hd = cv2.GaussianBlur(hd, (0, 0), 2)
        lum = core * 0.85 + hd * 1.0
        col = glow * 0.9 + bloom * 1.1 + hs * 2.2
        if atten is not None:
            lum *= atten; col *= atten
        return lum[..., None] * np.array([1, 0.98, 0.94], np.float32) + col[..., None] * BLUE


class Sparks:
    def __init__(self, seed=7):
        self.rng = np.random.default_rng(seed); self.items = []

    def spawn(self, xs, ys, f):
        for x, y in zip(xs, ys):
            a = self.rng.uniform(-2.6, -0.5)
            sp = self.rng.uniform(2.0, 7.0)
            self.items.append([x, y, np.cos(a) * sp, np.sin(a) * sp, f, self.rng.uniform(8, 18), self.rng.uniform(0.6, 1.0)])

    def render(self, f):
        if not self.items:
            return None
        m = np.zeros((H, W), np.float32); keep = []
        for it in self.items:
            x, y, vx, vy, f0, life, b = it
            age = f - f0
            if age > life:
                continue
            keep.append(it)
            if age < 0:
                continue
            px, py = x + vx * age, y + vy * age + 0.12 * age * age
            cv2.circle(m, (int(px), int(py)), 2, float(b * (1 - age / life)), -1, cv2.LINE_AA)
        self.items = keep
        g = cv2.GaussianBlur(m, (0, 0), 3)
        return m[..., None] * np.array([1, 1, 1], np.float32) + g[..., None] * BLUE * 3.0


def add_light(img, layer):
    """screen-blend a float light layer onto an 8-bit BGR image"""
    if layer is None:
        return img
    f = img.astype(np.float32) / 255
    return (255 * (1 - (1 - f) * (1 - clamp(layer)))).astype(np.uint8)


def over(img, ov, a=1.0, dy=0):
    if a <= 0:
        return img
    rgba = ov if dy == 0 else np.roll(ov, int(dy), axis=0)
    al = rgba[..., 3:].astype(np.float32) / 255 * a
    return (img * (1 - al) + rgba[..., :3] * al).astype(np.uint8)


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('assets'); ap.add_argument('ov'); ap.add_argument('out')
    ap.add_argument('--stills'); ap.add_argument('--frames')
    a = ap.parse_args()
    rd = lambda n: cv2.imread(os.path.join(a.assets, n))
    S = rd('01-start-foundation.jpg'); P = rd('02-progress-frame.jpg'); D = rd('04-final-day.jpg'); N = rd('03-final-night.jpg')
    OV = {n: cv2.imread(os.path.join(a.ov, n + '.png'), cv2.IMREAD_UNCHANGED)
          for n in ('corner_logo', 'chip', 'section', 'stage_1', 'stage_2', 'stage_3')}

    # --- transforms
    A_SP = H3(cv2.estimateAffinePartial2D(np.float32(S_BASE), np.float32(P_BASE))[0])       # START -> PROG
    H_PD = cv2.findHomography(np.float32([p for p, q in PD]), np.float32([q for p, q in PD]), 0)[0]
    H_DN = cv2.findHomography(np.float32([p for p, q in DN]), np.float32([q for p, q in DN]), 0)[0]
    T_DX = np.array([[1, 0, 0], [0, 1, -EXT], [0, 0, 1]], np.float64)                         # D_ext px -> DAY px

    # --- DAY photo with the sky continued upward (only sky above the roof; smooth vertical gradient)
    top = cv2.GaussianBlur(D[:6].astype(np.float32).mean(0, keepdims=True), (0, 0), sigmaX=40, sigmaY=0.1)[0]
    prof = D[:400, :200].astype(np.float32).mean(1)                    # sky profile on the left (pure sky)
    slope = (prof[:40].mean(0) - prof[160:200].mean(0)) / 160.0         # colour change per px going up
    d = np.arange(EXT, 0, -1, dtype=np.float32)[:, None, None]
    ext = top[None] + slope[None, None] * 260 * (1 - np.exp(-d / 260))
    rng = np.random.default_rng(3)
    ext = ext + rng.normal(0, 0.8, ext.shape)
    D_ext = np.vstack([np.clip(ext, 0, 255).astype(np.uint8), D])
    seam = 12                                                            # blend the first photo rows into the extension
    for i in range(seam):
        k = (i + 1) / (seam + 1)
        D_ext[EXT + i] = (D_ext[EXT + i] * k + D_ext[EXT - 1] * (1 - k)).astype(np.uint8)

    # --- NIGHT "lights off" version (windows / LED strips / uplight dimmed, moonlit blue)
    Nf = N.astype(np.float32)
    V = Nf.max(2)
    lights = cv2.GaussianBlur(clamp((V - 150) / 85.0), (0, 0), 3)
    warmth = clamp((Nf[..., 2] - Nf[..., 0]) / 60.0)                   # warm interior light
    lights = clamp(lights + 0.6 * cv2.GaussianBlur(warmth * clamp((V - 90) / 80.0), (0, 0), 4))
    dim = 0.55 * (1 - lights) + 0.16 * lights
    N_off = clamp(Nf * dim[..., None] * np.array([1.05, 0.95, 0.85], np.float32), 0, 255).astype(np.uint8)
    N_glow = cv2.GaussianBlur(Nf / 255 * clamp((V - 200) / 55.0)[..., None], (0, 0), 25)
    # NIGHT sky continued upward (flat night sky, avoids border streaks while the camera comes from the DAY framing)
    def n_ext(img):
        row = cv2.GaussianBlur(img[:8].astype(np.float32).mean(0, keepdims=True), (0, 0), sigmaX=60, sigmaY=0.1)
        pad = np.repeat(row, EXT, 0)
        if img.dtype == np.uint8:
            pad = np.clip(pad + np.random.default_rng(5).normal(0, 0.8, pad.shape), 0, 255).astype(np.uint8)
        return np.vstack([pad.astype(img.dtype), img])
    N, N_off, N_glow = n_ext(N), n_ext(N_off), n_ext(N_glow.astype(np.float32))

    # --- masks
    M_houseP = poly_mask(P.shape[:2], HOUSE_P, 2)
    M_houseD = poly_mask((D.shape[0] + EXT, D.shape[1]), np.float32(HOUSE_D) + [0, EXT], 3)

    # --- lasers (world coords of each stage)
    S2P = lambda pts: cv2.perspectiveTransform(np.float64(pts)[None], A_SP)[0]
    form_bot = S2P([(476, 952), (1333, 968)]); form_top = S2P([(475, 847), (1330, 878)])
    form_l = S2P([(476, 952), (475, 847)]); form_r = S2P([(1333, 968), (1330, 878)])
    out_l = [(330, 1212), (330, 872), (255, 850), (206, 802), (206, 722), (345, 722), (345, 668), (275, 665),
             (230, 346), (238, 132), (600, 188), (965, 243)]
    out_r = [(1385, 1212), (1385, 262), (1405, 252), (1405, 220), (965, 140), (965, 243)]
    floors_P = [[(206, 722), (1342, 800)], [(206, 802), (1347, 876)], [(230, 346), (1118, 465)]]
    facade_D = [  # (start beat, polyline in DAY px)
        (14.0, [(274, 774), (1192, 882)]), (14.0, [(276, 665), (1192, 817)]),
        (14.25, [(286, 305), (1054, 557)]), (14.25, [(289, 64), (1054, 392)]),
        (14.5, [(467, 1110), (467, 847), (738, 868), (738, 1110)]), (14.5, [(837, 1135), (837, 884), (924, 888), (924, 1135)]),
        (14.75, [(286, 305), (289, 64)]), (14.75, [(1054, 557), (1054, 392)]),
        (15.0, [(1192, 1150), (1192, 416), (896, 292)]),
    ]
    led_N = [(23.0, [(1072, 580), (300, 364), (222, 342), (100, 695)]), (23.0, [(140, 850), (1245, 970)]),
             (23.3, [(1220, 1290), (1220, 400)]), (23.3, [(880, 290), (1220, 395)])]
    D2P = np.linalg.inv(H_PD)

    # --- camera keys
    KS = lambda s, cx, cy: sim_cam(s, cx, cy) @ np.linalg.inv(A_SP)      # START framing, world = PROG
    K_s0, K_s8 = KS(0.955, 905, 1008), KS(1.0, 905, 1000)          # house top (START y~85) stays in frame
    K_p12 = sim_cam(0.96, 805, 1000); K_p15 = sim_cam(0.975, 805, 995)
    K_d15 = K_p15 @ np.linalg.inv(H_PD)
    K_d19 = sim_cam(1.17, 731, 390); K_d22 = sim_cam(1.2, 731, 395)     # boxes on the ground kept to the bottom edge
    K_n22 = K_d22 @ np.linalg.inv(H_DN)
    K_n24 = sim_cam(0.952, 682, 1008); K_n30 = sim_cam(1.0, 690, 1000)

    def camera(b):
        if b < 8:
            u = b / 8; u = 1 - (1 - u) ** 2
            return 'P', qlerp(K_s0, K_s8, u) if b >= 0 else K_s0
        if b < 14:
            return 'P', qlerp(K_s8, K_p12, ez((b - 8) / 4.5))
        if b < 15:
            return 'P', qlerp(K_p12, K_p15, (b - 14))
        if b < 22:
            return 'D', qlerp(K_d15, K_d19, ez((b - 15) / 4)) if b < 19 else qlerp(K_d19, K_d22, (b - 19) / 3)
        if b < 24:
            return 'N', qlerp(K_n22, K_n24, ez((b - 22) / 2))
        return 'N', qlerp(K_n24, K_n30, ((b - 24) / 6) ** 0.9)

    # rising front (PROG y), floors land on beats 10, 12, 13.5
    def front(b):
        segs = [(8, 10, 1240, 880), (10, 12, 880, 460), (12, 13.5, 460, 100)]
        if b < 8: return 1300.0
        for b0, b1, y0, y1 in segs:
            if b < b1: return y0 + (y1 - y0) * eout((b - b0) / (b1 - b0))
        return -50.0

    sparks = Sparks()
    want = set(int(x) for x in a.frames.split(',')) if a.frames else None
    proc = None
    if not a.stills:
        proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                                 '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15',
                                 '-pix_fmt', 'yuv420p', a.out], stdin=subprocess.PIPE)
    else:
        os.makedirs(a.stills, exist_ok=True)
    rng = np.random.default_rng(11)

    for f in range(NF):
        b = f / FPS / BEAT
        if want is not None and f not in want and not (b >= 8 and b < 20):   # sparks need neighbouring frames
            continue
        world, K = camera(b)
        las = Lasers(); light = None; atten = None
        if world == 'P':
            Sw = warp(S, K @ A_SP)
            img = Sw
            WX, WY = world_maps(K)
            if b >= 7.0:
                Pw = warp(P, K)
                Mh = warp(M_houseP, K, cv2.BORDER_CONSTANT)
                yf = front(b)
                rev = Mh * clamp((WY - yf) / 18.0 + 0.5)
                rr = 1400 * ez((b - 9.0) / 4.5)                             # ground/sky follow, outward from the house base
                bg = clamp((rr - np.abs(WY - 1212)) / 220.0 + 0.5) * clamp((1995 - WY) / 120.0) * clamp((WY + 60) / 60.0) \
                    if b >= 9.0 else np.zeros_like(WY)
                base = Sw.astype(np.float32) * (1 - bg[..., None]) + Pw.astype(np.float32) * bg[..., None]
                img = base * (1 - rev[..., None]) + Pw.astype(np.float32) * rev[..., None]
                ghost = Mh * (1 - rev) * 0.16 * clamp((b - 7) / 1.0) * (1 - clamp((b - 13) / 1.0))
                img = img * (1 - ghost[..., None]) + ghost[..., None] * np.array([255, 205, 120], np.float32)
                img = clamp(img, 0, 255).astype(np.uint8)
                atten = 1 - 0.75 * rev
                if 8 <= b < 13.6:
                    band = Mh * np.exp(-((WY - yf) / 10.0) ** 2)
                    light = band[..., None] * (np.float32([1, 1, 1]) * 0.6) + \
                        cv2.GaussianBlur(band, (0, 0), 12)[..., None] * BLUE * 1.6
                    ys, xs = np.nonzero((band > 0.6)[::8, ::8])
                    if len(xs):
                        pick = rng.choice(len(xs), size=min(len(xs), 3), replace=False)
                        sparks.spawn(xs[pick] * 8.0, ys[pick] * 8.0, f)
            # layout lasers
            if b >= 4:
                u = lambda b0, b1: clamp((b - b0) / (b1 - b0))
                fade = 1 - clamp((b - 13) / 1.5)
                las.add(form_bot, K, eout(u(4, 5.5)), fade)
                las.add(form_top, K, eout(u(4.3, 5.8)), fade)
                las.add(form_l, K, u(5.5, 6.0), fade); las.add(form_r, K, u(5.5, 6.0), fade)
                las.add(out_l, K, eout(u(6.0, 7.75)), fade); las.add(out_r, K, eout(u(6.0, 7.75)), fade)
                for i, fl in enumerate(floors_P):
                    las.add(fl, K, eout(u(7.0 + 0.25 * i, 8.0 + 0.25 * i)), fade)
            if b >= 14:
                for b0, pl in facade_D:
                    las.add(cv2.perspectiveTransform(np.float64(pl)[None], D2P)[0], K, eout((b - b0) / 1.5))
        elif world == 'D':
            Pw = warp(P, K @ H_PD); Dw = warp(D_ext, K @ T_DX)
            Mh = warp(M_houseD, K @ T_DX, cv2.BORDER_CONSTANT)
            WX, WY = world_maps(K)
            sx = clamp((WX - 270) / 930.0)
            ysb = line_y((274, 774), (1192, 882), WX); yst = line_y((276, 665), (1192, 817), WX) - 70
            ybb = line_y((286, 305), (1054, 557), WX)
            T = np.where(WY > ysb, 16.0, np.where(WY > yst, 16.75, np.where(WY > ybb, 17.5, 18.25))) + 1.0 * sx
            rh = clamp((b - T) / 0.25 + 0.5)
            rsky = ez((b - 17.0) / 2.5); rgnd = ez((b - 18.0) / 2.0)
            rbg = np.where(WY > 1150, rgnd, rsky)
            rev = Mh * rh + (1 - Mh) * rbg
            cov = cv2.GaussianBlur(warp(np.ones(P.shape[:2], np.float32), K @ H_PD, cv2.BORDER_CONSTANT), (0, 0), 25)
            rev = rev * cov + (1 - cov)                                     # outside the PROG photo: DAY sky
            img = (Pw.astype(np.float32) * (1 - rev[..., None]) + Dw.astype(np.float32) * rev[..., None]).astype(np.uint8)
            atten = 1 - 0.8 * Mh * rh
            if 15.8 <= b < 19.5:
                band = Mh * np.exp(-((b - T) / 0.03) ** 2)
                light = band[..., None] * (np.float32([1, 1, 1]) * 0.25) + \
                    cv2.GaussianBlur(band, (0, 0), 8)[..., None] * BLUE * 0.6
                ys, xs = np.nonzero((band > 0.7)[::8, ::8])
                if len(xs):
                    pick = rng.choice(len(xs), size=min(len(xs), 3), replace=False)
                    sparks.spawn(xs[pick] * 8.0, ys[pick] * 8.0, f)
            fade = 1 - clamp((b - 18.5) / 1.5)
            for b0, pl in facade_D:
                las.add(pl, K, eout((b - b0) / 1.5), fade)
        else:  # NIGHT
            Dw = warp(D_ext, K @ H_DN @ T_DX)
            Nw = warp(N, K @ T_DX); Noff = warp(N_off, K @ T_DX)
            k = ez((b - 22) / 2.0)
            dusk = Dw.astype(np.float32) * (1 - 0.62 * k) * np.array([1.0, 1 - 0.12 * k, 1 - 0.25 * k], np.float32)
            WX, WY = world_maps(K)
            yn = -700 + 2900 * ez((b - 22.2) / 1.7)                         # night falls from the sky downward
            m = np.maximum(clamp((yn - WY) / 220.0 + 0.5), clamp((WY - 1150) / 150.0) * ez((b - 21.8) / 0.9))[..., None]
            img = dusk * (1 - m) + Noff.astype(np.float32) * m
            on = clamp((b - 24) / 0.2)
            if on > 0:
                img = img * (1 - on) + Nw.astype(np.float32) * on
                pulse = on * np.exp(-max(0.0, b - 24) / 0.9)
                gw = warp(N_glow, K @ T_DX, cv2.BORDER_CONSTANT)
                light = gw * WARM * 1.4 * pulse
            img = clamp(img, 0, 255).astype(np.uint8)
            for b0, pl in led_N:
                inten = 1 - clamp((b - 24) / 0.4)
                las.add(pl, K, eout((b - b0) / 1.0), inten)

        L = las.render(atten)
        out = add_light(img, L)
        out = add_light(out, light)
        out = add_light(out, sparks.render(f))
        # corner logo + labels (fade in over the first 0.3 s)
        a0 = clamp(f / 9.0)
        out = over(out, OV['corner_logo'], a0); out = over(out, OV['chip'], a0); out = over(out, OV['section'], a0)
        for i, (b0, b1) in enumerate(((-1, 8), (8, 20), (20, 99))):
            o = clamp((b - b0) / 0.4) * (1 - clamp((b - b1) / 0.4)) if b0 >= 0 else 1 - clamp((b - b1) / 0.4)
            o = o * a0
            if o > 0:
                dy = 8 * (1 - clamp((b - b0) / 0.4)) if b0 >= 0 else 0
                out = over(out, OV[f'stage_{i + 1}'], o, dy)
        if proc:
            proc.stdin.write(np.ascontiguousarray(out).tobytes())
        elif want is None or f in want:
            cv2.imwrite(os.path.join(a.stills, f'f{f:03d}.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 90])
    if proc:
        proc.stdin.close(); proc.wait()
    print('frames', NF, 'dur', round(NF / FPS, 3))


if __name__ == '__main__':
    main()
