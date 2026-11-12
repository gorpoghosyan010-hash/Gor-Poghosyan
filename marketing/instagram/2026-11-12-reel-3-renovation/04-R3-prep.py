"""R3 v2 preprocessing: photo crops + architect line drawings generated from the photos themselves.

usage: python3 04-R3-prep.py <repo_root> <out_dir> [shot_id,...] [--debug]
Reads items.R3.shots of 04-render-spec.json (next to this file). For every shot writes
  <out_dir>/<id>.jpg          the crop (crop_frac of the source), resampled to photo_px (= window × max push), q92
  <out_dir>/<id>_lines.json   (shots with a sketch only) vector line drawing in WINDOW-LOCAL px (940×1253 at push 1):
                              {"w":940,"h":1253,"paths":[{"d":"M…","w":stroke_px,"o":opacity,"t0":0..1,"t1":0..1,"k":"line|curve"}]}
  <out_dir>/<id>_lines.png    (--debug) the drawing rendered on paper, for review
Method (items.R3.line_art): crop at window×work_scale → 5× bilateral + edge-preserving filter → Lab.
(a) long straight structure (walls, ceilings, window frames, cabinets): OpenCV LSD on L, merged when collinear, ≥ min_len,
drawn crisp with a small architect overshoot at both ends; (b) everything else (furniture, plants, lamp, objects): XDoG on
contrast-normalised L (thresholded), small specks (texture) removed by connected-component size, Zhang–Suen thinning,
pixels on (a) removed, chains traced into polylines, short/tortuous chains dropped, gaussian-smoothed + simplified
(Douglas–Peucker); stroke weight from the XDoG blob thickness and contrast. Stroke weight ∝ local contrast and length.
t0/t1 = draw-in window inside the shot's sketch.draw frames: structure first (long lines), then curves (big to small).
Deterministic (no randomness except a seeded jitter of start times).
"""
import json, os, sys, math
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else 'r3_prep')
ONLY = [a for a in sys.argv[3:] if not a.startswith('--')]
ONLY = ONLY[0].split(',') if ONLY else None
DEBUG = '--debug' in sys.argv
SPEC = json.load(open(os.path.join(HERE, '04-render-spec.json'), encoding='utf-8'))
IT = SPEC['items']['R3']
WIN = IT['window']['rect']
WW, WH = WIN['w'], WIN['h']
LA = IT['line_art']
os.makedirs(OUT, exist_ok=True)


def crop(src, fr):
    h, w = src.shape[:2]
    x0, y0, x1, y1 = fr
    return src[int(round(y0 * h)):int(round(y1 * h)), int(round(x0 * w)):int(round(x1 * w))]


def filtered(img, p):
    """edge-preserving smoothing → Lab (texture flattened, object/wall boundaries kept)"""
    x = img.copy()
    for _ in range(p['bilateral_passes']):
        x = cv2.bilateralFilter(x, p['bilateral_d'], p['bilateral_sigma_color'], p['bilateral_sigma_space'])
    if p.get('edge_preserving'):
        x = cv2.edgePreservingFilter(x, flags=1, sigma_s=p['edge_preserving'][0], sigma_r=p['edge_preserving'][1])
    return cv2.cvtColor(x, cv2.COLOR_BGR2LAB)


def lsd_lines(g, scale, prm):
    lsd = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    segs = lsd.detect(g)[0]
    if segs is None:
        return []
    segs = segs.reshape(-1, 4)
    out = []
    for x0, y0, x1, y1 in segs:
        L = math.hypot(x1 - x0, y1 - y0)
        if L >= prm['min_len'] * scale:
            out.append([x0, y0, x1, y1])
    return merge_collinear(out, scale, prm)


def merge_collinear(segs, scale, prm):
    """greedy merge of nearly collinear segments that overlap or have small gaps"""
    ang_tol = math.radians(prm['merge_angle_deg'])
    dist_tol = prm['merge_dist'] * scale
    gap_tol = prm['merge_gap'] * scale
    segs = [list(s) for s in segs]
    changed = True
    while changed:
        changed = False
        segs.sort(key=lambda s: -math.hypot(s[2] - s[0], s[3] - s[1]))
        res = []
        used = [False] * len(segs)
        for i, a in enumerate(segs):
            if used[i]:
                continue
            ax0, ay0, ax1, ay1 = a
            for j in range(i + 1, len(segs)):
                if used[j]:
                    continue
                b = segs[j]
                ta = math.atan2(ay1 - ay0, ax1 - ax0)
                tb = math.atan2(b[3] - b[1], b[2] - b[0])
                d = abs((ta - tb + math.pi / 2) % math.pi - math.pi / 2)
                if d > ang_tol:
                    continue
                ux, uy = math.cos(ta), math.sin(ta)
                nx, ny = -uy, ux
                # perpendicular distance of b's endpoints to a's line
                if max(abs((b[0] - ax0) * nx + (b[1] - ay0) * ny), abs((b[2] - ax0) * nx + (b[3] - ay0) * ny)) > dist_tol:
                    continue
                pa = [0, (ax1 - ax0) * ux + (ay1 - ay0) * uy]
                pb = sorted([(b[0] - ax0) * ux + (b[1] - ay0) * uy, (b[2] - ax0) * ux + (b[3] - ay0) * uy])
                lo, hi = min(pa), max(pa)
                if pb[0] > hi + gap_tol or pb[1] < lo - gap_tol:
                    continue
                lo2, hi2 = min(lo, pb[0]), max(hi, pb[1])
                ax0, ay0, ax1, ay1 = ax0 + ux * lo2, ay0 + uy * lo2, ax0 + ux * hi2, ay0 + uy * hi2
                used[j] = True
                changed = True
            res.append([ax0, ay0, ax1, ay1])
        segs = res
    return segs


def trace_chains(edges):
    """8-connected edge pixels → list of polylines (ordered point lists)"""
    H, W = edges.shape
    on = edges > 0
    visited = np.zeros_like(on)
    nb = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    ys, xs = np.nonzero(on)
    pad = np.pad(on, 1).astype(np.uint8)
    cnt = sum(pad[1 + dy:1 + dy + H, 1 + dx:1 + dx + W] for dy, dx in nb)
    order = sorted(zip(ys, xs), key=lambda p: (cnt[p] != 1, p))  # endpoints first
    chains = []
    for y, x in order:
        if visited[y, x]:
            continue
        chain = [(x, y)]
        visited[y, x] = True
        cy, cx = y, x
        while True:
            nxt = None
            for dy, dx in nb:
                yy, xx = cy + dy, cx + dx
                if 0 <= yy < H and 0 <= xx < W and on[yy, xx] and not visited[yy, xx]:
                    nxt = (yy, xx)
                    if dy == 0 or dx == 0:
                        break
            if nxt is None:
                break
            visited[nxt] = True
            cy, cx = nxt
            chain.append((cx, cy))
        chains.append(chain)
    return chains


def smooth(pts, sigma):
    """gaussian smoothing of a chain's coordinates (ends pinned) — removes pixel staircase"""
    a = np.array(pts, np.float32)
    if sigma <= 0 or len(a) < 5:
        return a
    r = int(3 * sigma)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    xs = np.convolve(np.pad(a[:, 0], r, mode='reflect' if len(a) > r else 'edge'), k, 'valid')
    ys = np.convolve(np.pad(a[:, 1], r, mode='reflect' if len(a) > r else 'edge'), k, 'valid')
    out = np.stack([xs, ys], 1)
    out[0], out[-1] = a[0], a[-1]
    return out


def thin(mask):
    """Zhang–Suen thinning (vectorised numpy) → 1-px skeleton"""
    img = (mask > 0).astype(np.uint8)
    while True:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4, p5 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:], P[2:, 2:]
            p6, p7, p8, p9 = P[2:, 1:-1], P[2:, :-2], P[1:-1, :-2], P[:-2, :-2]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(x.astype(np.int32) for x in nb)
            A = sum(((nb[i] == 0) & (nb[(i + 1) % 8] == 1)).astype(np.int32) for i in range(8))
            if step == 0:
                c = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                c = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            rm = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c
            if rm.any():
                img[rm] = 0
                changed = True
        if not changed:
            return img * 255


def xdog_mask(lab, prm):
    """XDoG line mask on contrast-normalised L: catches thin dark objects AND tonal boundaries (white tub vs wall)"""
    X = prm['xdog']
    L = lab[:, :, 0].astype(np.float32) / 255
    mu = cv2.GaussianBlur(L, (0, 0), X['norm_sigma'])
    sd = np.sqrt(cv2.GaussianBlur((L - mu) ** 2, (0, 0), X['norm_sigma'])) + X['norm_floor']
    Ln = (L - mu) / sd * X['norm_gain'] + 0.5
    g1 = cv2.GaussianBlur(Ln, (0, 0), X['sigma'])
    g2 = cv2.GaussianBlur(Ln, (0, 0), X['sigma'] * X['k'])
    D = (1 + X['p']) * g1 - X['p'] * g2
    return (D < X['eps']).astype(np.uint8) * 255


def curves(lab, line_mask, gm, gmax, scale, prm):
    m = xdog_mask(lab, prm)
    # texture suppression: drop small connected specks (rug weave, grain, leaf speckle)
    n, lb, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    keep = np.zeros(n, bool)
    keep[1:] = (np.maximum(st[1:, 2], st[1:, 3]) >= prm['min_extent'] * scale) & (st[1:, 4] >= prm['min_pixels'] * scale)
    m = np.where(keep[lb], 255, 0).astype(np.uint8)
    thick = cv2.distanceTransform(m, cv2.DIST_L2, 3)  # half stroke thickness of the XDoG blob → line weight
    # filled dark areas (shadows, black frames): use their OUTLINE, not their medial axis (thinning a fill puts the line
    # in the middle of the shape, e.g. inside a table's shadow instead of on the table edge)
    fp = prm.get('fill_px', 0)
    if fp:
        core = (thick > fp * scale).astype(np.uint8)
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(2 * fp * scale) * 2 + 1,) * 2)
        fill = cv2.dilate(core, k) & (m > 0).astype(np.uint8)
        edge = fill - cv2.erode(fill, np.ones((3, 3), np.uint8))
        m = np.where(((m > 0) & (fill == 0)) | (edge > 0), 255, 0).astype(np.uint8)
        thick = np.minimum(thick, fp * scale)
    e = thin(m)
    e[line_mask > 0] = 0
    chains = trace_chains(e)
    out = []
    for c in chains:
        if len(c) < prm['min_chain'] * scale:
            continue
        sm = smooth(c, prm['smooth_sigma'])
        L = float(np.sum(np.hypot(*np.diff(sm, axis=0).T)))
        chord = float(np.hypot(*(sm[-1] - sm[0])))
        # squiggles (short + tortuous) are texture, not drawing
        if L < prm['squiggle_len'] * scale and L > prm['squiggle_tortuosity'] * max(chord, 1):
            continue
        # crumbs: very short chains survive only when they are almost straight (corners, ticks), never as wiggles
        if L < prm['crumb_len'] * scale and L > 1.08 * max(chord, 1):
            continue
        ap = cv2.approxPolyDP(sm.astype(np.float32).reshape(-1, 1, 2), prm['simplify'] * scale, False).reshape(-1, 2)
        if len(ap) >= 2:
            th = float(np.median([thick[min(thick.shape[0] - 1, int(y)), min(thick.shape[1] - 1, int(x))] for x, y in c]))
            out.append((ap, th))
    return out, m


def grad_mag(g):
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    return cv2.GaussianBlur(cv2.magnitude(gx, gy), (5, 5), 0)


def sample_strength(gm, pts):
    vals = []
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        for t in np.linspace(0, 1, 6):
            x, y = int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t)
            if 0 <= y < gm.shape[0] and 0 <= x < gm.shape[1]:
                vals.append(gm[y, x])
    return float(np.median(vals)) if vals else 0.0


def process(shot):
    src = cv2.imread(os.path.join(ROOT, shot['src']))
    c = crop(src, shot['crop_frac'])
    pw, ph = IT['photo_px']
    photo = cv2.resize(c, (pw, ph), interpolation=cv2.INTER_AREA if c.shape[1] >= pw else cv2.INTER_LANCZOS4)
    if shot.get('blur_rects_frac'):  # readable text / brand marks (fractions of the crop): feathered soft blur, reads as depth of field
        m = np.zeros((ph, pw), np.float32)
        for r in shot['blur_rects_frac']:
            x0, y0, x1, y1 = [int(v) for v in (r[0] * pw, r[1] * ph, r[2] * pw, r[3] * ph)]
            m[y0:y1, x0:x1] = 1.0
        m = cv2.GaussianBlur(m, (0, 0), 14)[:, :, None]
        bl = cv2.GaussianBlur(photo, (0, 0), shot.get('blur_sigma', 7))
        photo = (photo * (1 - m) + bl * m).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, shot['id'] + '.jpg'), photo, [cv2.IMWRITE_JPEG_QUALITY, 92])
    info = {'id': shot['id'], 'crop_px': [int(c.shape[1]), int(c.shape[0])], 'photo_px': [pw, ph],
            'max_upscale_vs_source': round(WW * IT['max_push'] / c.shape[1], 3)}
    if not shot.get('sketch'):
        return info
    # ---- line art at work scale
    S = LA['work_scale']
    work = cv2.resize(c, (int(WW * S), int(WH * S)), interpolation=cv2.INTER_AREA if c.shape[1] >= WW * S else cv2.INTER_CUBIC)
    prm = dict(LA)
    prm.update(shot.get('line_art_override', {}))
    LP = dict(LA['lines']); LP.update(shot.get('line_art_override', {}).get('lines', {}))
    CP = dict(LA['curves']); CP.update(shot.get('line_art_override', {}).get('curves', {}))
    FP = dict(LA['filter']); FP.update(shot.get('line_art_override', {}).get('filter', {}))
    lab = filtered(work, FP)
    g = lab[:, :, 0]
    gm = grad_mag(g)
    gmax = float(np.percentile(gm, 99.5)) + 1e-6
    segs = lsd_lines(g, S, LP)
    lmask = np.zeros(g.shape, np.uint8)
    for x0, y0, x1, y1 in segs:
        cv2.line(lmask, (int(x0), int(y0)), (int(x1), int(y1)), 255, int(LP['mask_px'] * S))
    cps, emap = curves(lab, lmask, gm, gmax, S, CP)
    paths = []
    ov = LP['overshoot'] * S
    for x0, y0, x1, y1 in segs:
        L = math.hypot(x1 - x0, y1 - y0)
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        o = ov * min(1.0, L / (LP['overshoot_full_len'] * S))
        a = (x0 - ux * o, y0 - uy * o); b = (x1 + ux * o, y1 + uy * o)
        st = min(1.0, sample_strength(gm, [(x0, y0), (x1, y1)]) / gmax)
        wl = min(1.0, L / (LP['len_for_full_weight'] * S))
        paths.append({'k': 'line', 'pts': [a, b], 'len': L, 'st': st, 'wl': wl})
    for ap, th in cps:
        pts = [tuple(p) for p in ap]
        L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:]))
        st = min(1.0, 0.5 * sample_strength(gm, pts) / gmax + 0.5 * min(1.0, th / CP['thick_full']))
        paths.append({'k': 'curve', 'pts': pts, 'len': L, 'st': st, 'wl': min(1.0, L / (CP['len_for_full_weight'] * S))})
    # optional clean primitives: circles (round mirrors …) fitted with HoughCircles replace the texture-broken rings
    CI = shot.get('line_art_override', {}).get('circles')
    if CI:
        cs = cv2.HoughCircles(cv2.medianBlur(g, 5), cv2.HOUGH_GRADIENT, 1.2, CI['min_dist'] * S, param1=CI['param1'], param2=CI['param2'],
                              minRadius=int(CI['r'][0] * S), maxRadius=int(CI['r'][1] * S))
        cs = [] if cs is None else [c for c in cs[0] if CI.get('y_frac', [0, 1])[0] * WH * S <= c[1] <= CI.get('y_frac', [0, 1])[1] * WH * S][:CI['max']]
        for cx, cy, r in cs:
            band = CI['band'] * S
            ann = CI.get('clear_annulus', [1.0, 1.0])
            def on_ring(q):
                d = math.hypot(q[0] - cx, q[1] - cy)
                return abs(d - r) < band or ann[0] * r <= d <= ann[1] * r
            paths = [p for p in paths if not (p['k'] == 'curve' and sum(on_ring(q) for q in p['pts']) >= 0.6 * len(p['pts']))]
            for rr, wk in ((r, 1.0), (r * CI.get('inner_ratio', 0), 0.8)):
                if rr <= 0:
                    continue
                n = 72
                a0 = -math.pi / 2
                pts = [(cx + rr * math.cos(a0 + 2 * math.pi * i / n), cy + rr * math.sin(a0 + 2 * math.pi * i / n)) for i in range(n + 1)]
                paths.append({'k': 'curve', 'pts': pts, 'len': 2 * math.pi * rr, 'st': wk, 'wl': 1.0})
        info['circles'] = [[round(float(v) / S, 1) for v in c] for c in cs]
    # drop exclusion zones (fractions of the crop)
    ex = [[v * (WW * S if i % 2 == 0 else WH * S) for i, v in enumerate(r)] for r in shot.get('no_lines_rects_frac', [])]
    def inside(p, r): return r[0] <= p[0] <= r[2] and r[1] <= p[1] <= r[3]
    if ex:
        paths = [p for p in paths if not any(all(inside(q, r) for q in p['pts']) for r in ex)]
    # weights / opacity
    W = LA['stroke']
    for p in paths:
        imp = 0.55 * p['st'] + 0.45 * p['wl']
        if p['k'] == 'line':
            p['w'] = W['line_w'][0] + (W['line_w'][1] - W['line_w'][0]) * imp
            p['o'] = W['line_o'][0] + (W['line_o'][1] - W['line_o'][0]) * imp
        else:
            p['w'] = W['curve_w'][0] + (W['curve_w'][1] - W['curve_w'][0]) * imp
            p['o'] = W['curve_o'][0] + (W['curve_o'][1] - W['curve_o'][0]) * imp
        p['imp'] = imp
    # cap count: keep the most important
    paths.sort(key=lambda p: -(p['imp'] * (1.4 if p['k'] == 'line' else 1.0) + min(1, p['len'] / (400 * S))))
    paths = paths[:LA['max_paths']]
    # draw order: lines (long first), then curves (long first); seeded jitter
    rng = np.random.default_rng(shot.get('seed', 1))
    lines = sorted([p for p in paths if p['k'] == 'line'], key=lambda p: -p['len'])
    curvs = sorted([p for p in paths if p['k'] == 'curve'], key=lambda p: -p['len'])
    D = LA['draw']
    for rank, p in enumerate(lines):
        s = D['lines_start'][0] + (D['lines_start'][1] - D['lines_start'][0]) * (rank / max(1, len(lines) - 1)) ** 0.8
        s += rng.uniform(-0.03, 0.03)
        p['t0'] = max(0.0, s); p['t1'] = min(1.0, p['t0'] + D['line_dur'][0] + (D['line_dur'][1] - D['line_dur'][0]) * min(1, p['len'] / (900 * S)))
    for rank, p in enumerate(curvs):
        s = D['curves_start'][0] + (D['curves_start'][1] - D['curves_start'][0]) * (rank / max(1, len(curvs) - 1)) ** 0.9
        s += rng.uniform(-0.03, 0.03)
        p['t0'] = max(0.0, s); p['t1'] = min(1.0, p['t0'] + D['curve_dur'][0] + (D['curve_dur'][1] - D['curve_dur'][0]) * min(1, p['len'] / (600 * S)))
    # construction lines: the longest straight edges extended across the whole sheet, very faint (drafting look)
    CL = LA['construction']
    cons = []
    for x0, y0, x1, y1 in sorted(segs, key=lambda s: -math.hypot(s[2] - s[0], s[3] - s[1])):
        L = math.hypot(x1 - x0, y1 - y0)
        if L < CL['min_len'] * S or len(cons) >= CL['max']:
            break
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        if any(abs(ux * c[1] - uy * c[0]) < 0.02 and abs((x0 - c[2]) * -c[1] + (y0 - c[3]) * c[0]) < CL['min_sep'] * S for c in cons):
            continue
        cons.append((ux, uy, x0, y0))
    for k, (ux, uy, x0, y0) in enumerate(cons):
        R2 = 3000 * S
        a, b = (x0 - ux * R2, y0 - uy * R2), (x0 + ux * R2, y0 + uy * R2)
        t0 = CL['t'][0] + (CL['t'][1] - CL['t'][0]) * k / max(1, len(cons) - 1)
        lines.insert(k, {'k': 'cons', 'pts': [a, b], 'w': CL['w'], 'o': CL['o'], 't0': t0, 't1': min(1.0, t0 + CL['dur'])})
    outp = []
    for p in lines + curvs:
        d = 'M' + ' L'.join(f'{x / S:.1f} {y / S:.1f}' for x, y in p['pts'])
        outp.append({'d': d, 'w': round(float(p['w']), 2), 'o': round(float(p['o']), 3), 't0': round(float(p['t0']), 3), 't1': round(float(p['t1']), 3), 'k': p['k']})
    json.dump({'w': WW, 'h': WH, 'paths': outp}, open(os.path.join(OUT, shot['id'] + '_lines.json'), 'w'))
    info.update({'lines': len(lines) - len(cons), 'construction': len(cons), 'curves': len(curvs)})
    if DEBUG:
        R = 2
        can = np.full((WH * R, WW * R, 3), (243, 245, 245), np.uint8)
        for p in lines + curvs:
            pts = np.array([[x / S * R, y / S * R] for x, y in p['pts']], np.int32)
            col = int(255 * (1 - p['o']) + 0x2a * p['o'])
            cv2.polylines(can, [pts], False, (col, col, col), max(1, int(round(p['w'] * R))), cv2.LINE_AA)
        can = cv2.resize(can, (WW, WH), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(OUT, shot['id'] + '_lines.png'), can)
        cv2.imwrite(os.path.join(OUT, shot['id'] + '_edges.png'), emap)
    return info


if __name__ == '__main__':
    man = []
    for sh in IT['shots']:
        if ONLY and sh['id'] not in ONLY:
            continue
        info = process(sh)
        print(json.dumps(info, ensure_ascii=False))
        man.append(info)
    if not ONLY:
        json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
