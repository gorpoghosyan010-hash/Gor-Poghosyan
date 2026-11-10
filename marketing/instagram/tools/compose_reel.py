#!/usr/bin/env python3
"""Compose a Reel from a timeline.json written by render_batch.js.

usage: compose_reel.py <timeline.json> <out.mp4>

Per frame (30 fps): scene picture (Ken Burns with sub-pixel affine sampling, or blurred
'contain' layout, or solid background) + scene gradient overlays, transitions (cut /
crossfade Nf / dip to colour), then timed transparent text/logo PNG layers with
fade/rise animations. Frames are piped as raw RGB into ffmpeg: H.264 High yuv420p BT.709,
CRF 18, silent AAC 48 kHz stereo track, +faststart.
"""
import json
import math
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter

tl = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
W, H, FPS = tl["w"], tl["h"], tl["fps"]
NFR = int(round(tl["duration"] * FPS))
DARK = (12, 13, 14)


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def in_out_sine(p):
    return -(math.cos(math.pi * p) - 1) / 2


def ease_out_cubic(p):
    return 1 - (1 - p) ** 3


_src_cache = {}


def src(path):
    if path not in _src_cache:
        _src_cache[path] = Image.open(path).convert("RGB")
    return _src_cache[path]


def overlay_img(o):
    """RGBA full-frame image for a gradient/solid overlay spec."""
    col = hex2rgb(o["color"])
    a = Image.new("L", (W, H), 0)
    if o["type"] == "solid":
        a = Image.new("L", (W, H), int(round(o["alpha"] * 255)))
    elif o["type"] == "linear":
        d = ImageDraw.Draw(a)
        y0, y1 = o["y0"], o["y1"]
        for y in range(max(0, y0), min(H, y1)):
            t = (y - y0) / max(1, (y1 - y0))
            d.line([(0, y), (W, y)], fill=int(round((o["alpha0"] + (o["alpha1"] - o["alpha0"]) * t) * 255)))
        if y1 < H and o["alpha1"] > 0:
            d.rectangle([0, y1, W, H], fill=int(round(o["alpha1"] * 255)))
    else:
        raise ValueError(o)
    im = Image.new("RGBA", (W, H), col + (0,))
    im.putalpha(a)
    return im


def lerp(a, b, t):
    return a + (b - a) * t


def kb_frame(img, rect):
    sw, sh = img.size
    cw, ch = rect["w"] * sw, rect["h"] * sh
    cx, cy = (rect["x"] + rect["w"] / 2) * sw, (rect["y"] + rect["h"] / 2) * sh
    s = min(cw / W, ch / H)  # uniform: never stretch
    x0, y0 = cx - W / 2 * s, cy - H / 2 * s
    x0 = min(max(x0, 0), sw - W * s)
    y0 = min(max(y0, 0), sh - H * s)
    return img.transform((W, H), Image.AFFINE, (s, 0, x0, 0, s, y0), resample=Image.BICUBIC)


class Scene:
    def __init__(self, sc):
        self.sc = sc
        self.ov = [overlay_img(o) for o in sc.get("overlays", [])]
        m = sc.get("motion") or {}
        self.kind = m.get("type") or ("solid" if sc.get("background") else None)
        if self.kind == "contain_blur":
            img = src(sc["src"])
            sw, sh = img.size
            s = max(W / sw, H / sh)
            bg = img.resize((int(sw * s + 1), int(sh * s + 1)), Image.LANCZOS)
            l, t = (bg.width - W) // 2, (bg.height - H) // 2
            bg = bg.crop((l, t, l + W, t + H)).filter(ImageFilter.GaussianBlur(m["background"]["blur_sigma"]))
            dk = m["background"]["darken"]
            bg = Image.blend(bg, Image.new("RGB", (W, H), hex2rgb(dk["color"])), dk["alpha"])
            self.bg = bg

    def frame(self, t):
        sc = self.sc
        p = min(1.0, max(0.0, (t - sc["in"]) / (sc["out"] - sc["in"])))
        e = in_out_sine(p)
        m = sc.get("motion") or {}
        if self.kind == "kenburns":
            fr, to = m["from"], m["to"]
            rect = {k: lerp(fr[k], to[k], e) for k in ("x", "y", "w", "h")}
            im = kb_frame(src(sc["src"]), rect)
        elif self.kind == "contain_blur":
            fg = m["foreground"]
            img = src(sc["src"])
            sw, sh = img.size
            z = lerp(fg.get("zoom_from", 1.0), fg.get("zoom_to", 1.0), e)
            s = (sw / fg["w"]) / z  # source px per output px
            cx, cy = sw / 2, sh / 2
            box = img.transform((fg["w"], fg["h"]), Image.AFFINE,
                                (s, 0, cx - fg["w"] / 2 * s, 0, s, cy - fg["h"] / 2 * s), resample=Image.BICUBIC)
            im = self.bg.copy()
            im.paste(box, (fg["x"], fg["y"]))
            d = ImageDraw.Draw(im, "RGBA")
            ec = (201, 169, 106, int(0.35 * 255))
            d.line([(fg["x"], fg["y"]), (fg["x"] + fg["w"], fg["y"])], fill=ec)
            d.line([(fg["x"], fg["y"] + fg["h"] - 1), (fg["x"] + fg["w"], fg["y"] + fg["h"] - 1)], fill=ec)
        elif self.kind == "solid":
            im = Image.new("RGB", (W, H), hex2rgb(sc["background"]))
        else:
            raise ValueError("scene without picture: %s" % sc)
        if self.ov:
            im = im.convert("RGBA")
            for o in self.ov:
                im.alpha_composite(o)
            im = im.convert("RGB")
        return im


scenes = [Scene(s) for s in tl["scenes"]]


def trans(sc):
    tr = sc.get("transition_in") or "cut"
    m = re.match(r"crossfade (\d+)f", tr)
    if m:
        return ("xfade", int(m.group(1)), None)
    m = re.match(r"dip to (#[0-9a-fA-F]{6}): (\d+) frames out \+ (\d+) frames in", tr)
    if m:
        return ("dip", (int(m.group(2)), int(m.group(3))), hex2rgb(m.group(1)))
    return ("cut", 0, None)


def picture(i):
    t = i / FPS
    k = max(j for j, s in enumerate(tl["scenes"]) if round(s["in"] * FPS) <= i or j == 0)
    cur = scenes[k]
    # incoming transition of the NEXT scene starting before its boundary
    if k + 1 < len(scenes):
        nxt = tl["scenes"][k + 1]
        b = round(nxt["in"] * FPS)
        kind, n, col = trans(nxt)
        if kind == "xfade" and i >= b - n // 2:
            a = (i - (b - n // 2) + 0.5) / n
            return Image.blend(cur.frame(t), scenes[k + 1].frame(t), a)
        if kind == "dip" and i >= b - n[0]:
            a = (i - (b - n[0]) + 1) / n[0]
            return Image.blend(cur.frame(t), Image.new("RGB", (W, H), col), min(1, a))
    s = tl["scenes"][k]
    b = round(s["in"] * FPS)
    kind, n, col = trans(s)
    if k > 0 and kind == "xfade" and i < b + (n - n // 2):
        a = (i - (b - n // 2) + 0.5) / n
        return Image.blend(scenes[k - 1].frame(t), cur.frame(t), a)
    if kind == "dip" and i < b + n[1]:
        a = (i - b + 1) / (n[1] + 1)
        return Image.blend(Image.new("RGB", (W, H), col), cur.frame(t), a)
    return cur.frame(t)


class Layer:
    def __init__(self, L):
        im = Image.open(L["png"]).convert("RGBA")
        bb = im.getbbox()
        if bb is None:
            bb = (0, 0, 1, 1)
        self.im = im.crop(bb)
        self.x, self.y = bb[0], bb[1]
        self.a = self.im.getchannel("A")
        self.i0 = round(L["in"] * FPS)
        self.i1 = round(L["out"] * FPS)
        self.fi = L.get("fade_in", 0) or 0
        self.fo = L.get("fade_out", 0) or 0
        self.rise = L.get("rise", 0) or 0
        self.z = L.get("z", 0)
        self._cache = {}

    def draw(self, frame, i):
        if i < self.i0 or i >= self.i1:
            return
        k = i - self.i0
        alpha = 1.0
        dy = 0
        if self.fi:
            alpha = ease_out_cubic(min(1.0, (k + 1) / self.fi))
        if self.rise:
            n = max(self.fi * 2, 8)
            dy = int(round(self.rise * (1 - ease_out_cubic(min(1.0, (k + 1) / n)))))
        if self.fo:
            left = self.i1 - i
            alpha *= min(1.0, (left - 1) / self.fo) if left <= self.fo else 1.0
        if alpha <= 0:
            return
        q = round(alpha, 3)
        if q >= 0.999:
            im = self.im
        else:
            if q not in self._cache:
                im = self.im.copy()
                im.putalpha(self.a.point(lambda v: int(v * q + 0.5)))
                self._cache[q] = im
            im = self._cache[q]
        frame.alpha_composite(im, (self.x, self.y + dy))


layers = sorted([Layer(L) for L in tl["layers"]], key=lambda l: l.z)

cmd = ["ffmpeg", "-y", "-loglevel", "error",
       "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
       "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
       "-map", "0:v", "-map", "1:a",
       "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
       "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "18",
       "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
       "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
       "-t", f"{tl['duration']:.3f}", "-movflags", "+faststart", OUT]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for i in range(NFR):
    fr = picture(i).convert("RGBA")
    for L in layers:
        L.draw(fr, i)
    proc.stdin.write(fr.convert("RGB").tobytes())
    if i % 60 == 0:
        print(f"  frame {i}/{NFR}", file=sys.stderr)
proc.stdin.close()
if proc.wait() != 0:
    sys.exit("ffmpeg failed")
print(OUT)
