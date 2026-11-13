"""R3 v3 preprocessing: geometry-matched renovation stages (RAW → PROGRESS → FINISHED).

usage: python3 04-R3-prep.py <repo_root> <out_dir> [shot_id,...] [--debug]
Reads items.R3.shots of 04-render-spec.json (next to this file). For every shot writes
  <out_dir>/<id>.jpg   the photo warped into WINDOW-LOCAL coordinates (window = 940×1253 units) over the shot's
                       `extent` [x0,y0,x1,y1] (default the window itself), at items.R3.prep.px_per_unit px per unit, q92
  <out_dir>/manifest.json  per shot: canvas size, extent, mapping matrix (src px → window units), local scale
                       (window units per source px, min/max over the canvas), coverage (must be 1.0)
  --debug: <out_dir>/_dbg/<seq>_<a>_<b>.jpg  50 % blends + edge overlays of consecutive stages of a sequence
Alignment (items.R3.shots[].align):
  {"crop_frac":[x0,y0,x1,y1]}          anchor of a sequence: a 3:4 crop of the source = the window
  {"ref":id,"pairs":[[sx,sy,rx,ry,w],…],"model":"similarity"|"homography","warp":0..1,"max_scale":s}
      landmark pairs (source fraction ↔ fraction of the REF source, weight w) — window corners, door jambs, floor
      lines, pipe stubs… Similarity = uniform scale + translation (weighted least squares, no rotation). Homography
      (≥4 pairs) is blended toward the similarity by `warp` (0 = similarity only, 1 = full homography) by
      interpolating where the canvas corners land → a SLIGHT perspective correction only. `max_scale` clamps the
      scale (window units per source px) around the weighted landmark centroid so nothing is upscaled > 1.35×
      on screen at the shot's max camera scale. `fixed_scale` forces the scale (translation still from the pairs);
      `offset_units` [dx,dy] nudges the result.
  mirror: true → the source is flipped horizontally FIRST (all fractions refer to the flipped image).
Grade (items.R3.shots[].grade): gray-world WB, gamma, contrast, saturation, warmth, highlight roll-off, sharpen —
applied to the source before warping (same family as tools/enhance_photos.py, milder).
blur_rects_frac: soft gaussian blur of small regions (labels, printed text) in source fractions (after mirror).
Deterministic.
"""
import json, os, sys
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else 'r3_prep')
ARGS = [a for a in sys.argv[3:] if not a.startswith('--')]
ONLY = ARGS[0].split(',') if ARGS else None
DEBUG = '--debug' in sys.argv
SPEC = json.load(open(os.path.join(HERE, '04-render-spec.json'), encoding='utf-8'))
IT = SPEC['items']['R3']
WW, WH = IT['window']['rect']['w'], IT['window']['rect']['h']
PPU = IT['prep']['px_per_unit']
SHOTS = {s['id']: s for s in IT['shots']}
os.makedirs(OUT, exist_ok=True)

_src_cache = {}


def load(sh):
    key = (sh['src'], bool(sh.get('mirror')))
    if key not in _src_cache:
        im = cv2.imread(os.path.join(ROOT, sh['src']), cv2.IMREAD_COLOR)
        if im is None:
            raise SystemExit('missing ' + sh['src'])
        if sh.get('mirror'):
            im = np.ascontiguousarray(im[:, ::-1])
        _src_cache[key] = im
    return _src_cache[key]


def grade(im, g):
    if not g:
        return im
    x = im.astype(np.float32) / 255.0
    if g.get('wb_gray'):
        lab = cv2.cvtColor(x, cv2.COLOR_BGR2LAB)
        a, b = lab[..., 1].mean(), lab[..., 2].mean()
        lab[..., 1] -= a * g['wb_gray']
        lab[..., 2] -= b * g['wb_gray']
        x = np.clip(cv2.cvtColor(lab, cv2.COLOR_LAB2BGR), 0, 1)
    if g.get('gamma', 1) != 1:
        x = np.power(x, g['gamma'])
    if g.get('exposure', 1) != 1:
        x = x * g['exposure']
    if g.get('highlights'):  # soft roll-off of blown windows (keeps detail after exposure lift)
        k = g['highlights']
        x = np.where(x > 1 - k, 1 - k + k * np.tanh((x - (1 - k)) / k), x)
    if g.get('contrast', 1) != 1:
        x = (x - 0.5) * g['contrast'] + 0.5
    x = np.clip(x, 0, 1)
    if g.get('saturation', 1) != 1 or g.get('warmth'):
        lab = cv2.cvtColor(x, cv2.COLOR_BGR2LAB)
        lab[..., 1] *= g.get('saturation', 1)
        lab[..., 2] *= g.get('saturation', 1)
        if g.get('warmth'):
            lab[..., 2] += g['warmth']
            lab[..., 1] += g['warmth'] * 0.25
        x = np.clip(cv2.cvtColor(lab, cv2.COLOR_LAB2BGR), 0, 1)
    out = (x * 255 + 0.5).astype(np.uint8)
    if g.get('sharpen'):
        bl = cv2.GaussianBlur(out, (0, 0), 1.2)
        out = cv2.addWeighted(out, 1 + g['sharpen'], bl, -g['sharpen'], 0)
    return out


def blur_rects(im, rects, sigma):
    if not rects:
        return im
    h, w = im.shape[:2]
    bl = cv2.GaussianBlur(im, (0, 0), sigma)
    m = np.zeros((h, w), np.float32)
    for x0, y0, x1, y1 in rects:
        m[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)] = 1
    m = cv2.GaussianBlur(m, (0, 0), sigma * 1.5)[..., None]
    return (im * (1 - m) + bl * m).astype(np.uint8)


def crop_matrix(sh, im):
    h, w = im.shape[:2]
    x0, y0, x1, y1 = sh['align']['crop_frac']
    s = WW / ((x1 - x0) * w)
    sy = WH / ((y1 - y0) * h)
    if abs(s / sy - 1) > 0.01:
        raise SystemExit(f"{sh['id']}: crop_frac is not 3:4 (sx {s:.4f} sy {sy:.4f})")
    return np.array([[s, 0, -x0 * w * s], [0, s, -y0 * h * s], [0, 0, 1]], np.float64)


def apply(M, pts):
    p = np.c_[pts, np.ones(len(pts))] @ M.T
    return p[:, :2] / p[:, 2:3]


_mat = {}


def matrix(sid):
    """src px (after mirror) → window units"""
    if sid in _mat:
        return _mat[sid]
    sh = SHOTS[sid]
    im = load(sh)
    al = sh['align']
    if 'crop_frac' in al:
        M = crop_matrix(sh, im)
    else:
        ref = SHOTS[al['ref']]
        Mr = matrix(al['ref'])
        rh, rw = load(ref).shape[:2]
        h, w = im.shape[:2]
        P = np.array([[p[0] * w, p[1] * h] for p in al['pairs']], np.float64)
        Q = apply(Mr, np.array([[p[2] * rw, p[3] * rh] for p in al['pairs']], np.float64))  # targets in window units
        Wt = np.array([p[4] if len(p) > 4 else 1.0 for p in al['pairs']], np.float64)
        pc, qc = (P * Wt[:, None]).sum(0) / Wt.sum(), (Q * Wt[:, None]).sum(0) / Wt.sum()
        dp, dq = P - pc, Q - qc
        s = (Wt * (dp * dq).sum(1)).sum() / (Wt * (dp * dp).sum(1)).sum()
        if al.get('fixed_scale'):
            s = al['fixed_scale']
        if al.get('scale_mul'):
            s *= al['scale_mul']
        if al.get('max_scale') and s > al['max_scale']:
            s = al['max_scale']
        S = np.array([[s, 0, qc[0] - s * pc[0]], [0, s, qc[1] - s * pc[1]], [0, 0, 1]], np.float64)
        if al.get('offset_units'):
            S[0, 2] += al['offset_units'][0]
            S[1, 2] += al['offset_units'][1]
        M = S
        if al.get('model') == 'homography' and len(P) >= 4 and al.get('warp', 0) > 0:
            Hh, _ = cv2.findHomography(P, Q, 0)
            corners = np.array([[0, 0], [w, 0], [w, h], [0, h]], np.float64)
            a, b = apply(S, corners), apply(Hh, corners)
            k = al['warp']
            M = cv2.getPerspectiveTransform(corners.astype(np.float32), ((1 - k) * a + k * b).astype(np.float32)).astype(np.float64)
        res = np.sqrt(((apply(M, P) - Q) ** 2).sum(1))
        sh['_residual_units'] = [round(float(r), 1) for r in res]
    _mat[sid] = M
    return M


def local_scale(M, ext):
    """window units per src px — min/max singular value of the inverse map's Jacobian, sampled over the extent"""
    Mi = np.linalg.inv(M)
    xs = np.linspace(ext[0], ext[2], 9)
    ys = np.linspace(ext[1], ext[3], 9)
    vals = []
    for x in xs:
        for y in ys:
            p = apply(Mi, np.array([[x, y], [x + 1, y], [x, y + 1]]))
            J = np.array([p[1] - p[0], p[2] - p[0]]).T  # src px per unit
            sv = np.linalg.svd(J, compute_uv=False)
            vals += [1 / sv.max(), 1 / sv.min()]
    return min(vals), max(vals)


def render(sid):
    sh = SHOTS[sid]
    im = load(sh)
    im = blur_rects(im, sh.get('blur_rects_frac'), sh.get('blur_sigma', 6))
    im = grade(im, sh.get('grade'))
    M = matrix(sid)
    ext = sh.get('extent', [0, 0, WW, WH])
    cw, ch = int(round((ext[2] - ext[0]) * PPU)), int(round((ext[3] - ext[1]) * PPU))
    C = np.array([[PPU, 0, -ext[0] * PPU], [0, PPU, -ext[1] * PPU], [0, 0, 1]], np.float64) @ M
    lo, hi = local_scale(M, ext)
    # downscale with area filtering first (warpPerspective has no area filter): pre-shrink when C shrinks a lot
    pre = min(1.0, hi * PPU * 1.25)
    if pre < 0.95:
        im2 = cv2.resize(im, (int(im.shape[1] * pre), int(im.shape[0] * pre)), interpolation=cv2.INTER_AREA)
        C2 = C @ np.diag([1 / pre, 1 / pre, 1])
    else:
        im2, C2 = im, C
    out = cv2.warpPerspective(im2, C2, (cw, ch), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(245, 245, 243))
    cov = cv2.warpPerspective(np.full(im2.shape[:2], 255, np.uint8), C2, (cw, ch), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    coverage = float((cov > 0).mean())
    cv2.imwrite(os.path.join(OUT, sid + '.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 92])
    cam = sh.get('_cam_max', 1.0)
    rec = {'canvas_px': [cw, ch], 'extent': ext, 'matrix_src_to_window': [[round(v, 8) for v in r] for r in M.tolist()],
           'scale_units_per_src_px': [round(lo, 4), round(hi, 4)], 'coverage': round(coverage, 5),
           'residual_units': sh.get('_residual_units')}
    return rec, out


def cam_max(sh):
    """max camera scale the renderer will apply to this shot (sequence camera or own camera)"""
    cams = IT['cameras']
    c = cams[sh['camera']]
    return max(k[1] for k in c['scale']) if isinstance(c['scale'], list) else c['scale']


def main():
    man = {}
    mp = os.path.join(OUT, 'manifest.json')
    if ONLY and os.path.exists(mp):
        man = json.load(open(mp))
    imgs = {}
    for sid, sh in SHOTS.items():
        if ONLY and sid not in ONLY:
            continue
        sh['_cam_max'] = cam_max(sh)
        rec, out = render(sid)
        rec['max_screen_upscale'] = round(rec['scale_units_per_src_px'][1] * sh['_cam_max'], 3)
        man[sid] = rec
        imgs[sid] = out
        flag = '' if rec['coverage'] >= 0.9999 and rec['max_screen_upscale'] <= 1.35 else '   <-- CHECK'
        print(f"{sid:14s} canvas {rec['canvas_px']} scale {rec['scale_units_per_src_px']} cam {sh['_cam_max']} → upscale {rec['max_screen_upscale']} cov {rec['coverage']} res {rec['residual_units']}{flag}")
    json.dump(man, open(mp, 'w'), indent=1)
    if DEBUG:
        dd = os.path.join(OUT, '_dbg')
        os.makedirs(dd, exist_ok=True)
        for sid, sh in SHOTS.items():
            nxt = sh.get('debug_pair_with')
            if not nxt or sid not in imgs or nxt not in imgs:
                continue
            a, b = [win_crop(SHOTS[k], imgs[k]) for k in (sid, nxt)]
            blend = cv2.addWeighted(a, 0.5, b, 0.5, 0)
            ea = cv2.Canny(cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), 60, 160)
            eb = cv2.Canny(cv2.cvtColor(b, cv2.COLOR_BGR2GRAY), 60, 160)
            edge = np.full_like(a, 255)
            edge[ea > 0] = (40, 40, 220)
            edge[eb > 0] = (200, 120, 20)
            edge[(ea > 0) & (eb > 0)] = (0, 0, 0)
            cv2.imwrite(os.path.join(dd, f'{sid}__{nxt}.jpg'), np.hstack([a, blend, edge, b]), [cv2.IMWRITE_JPEG_QUALITY, 85])


def win_crop(sh, img):
    ext = sh.get('extent', [0, 0, WW, WH])
    x0, y0 = int(round(-ext[0] * PPU)), int(round(-ext[1] * PPU))
    c = img[y0:y0 + int(WH * PPU), x0:x0 + int(WW * PPU)]
    return cv2.resize(c, (470, 626), interpolation=cv2.INTER_AREA)


if __name__ == '__main__':
    main()
