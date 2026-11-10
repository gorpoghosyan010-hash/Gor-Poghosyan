#!/usr/bin/env python3
"""fit_photo.py <in> <out.png> <dest_w> <dest_h> [x y w h]

Crop a source image by fractional rect {x,y,w,h} (0..1, default full frame) and resample it to exactly
dest_w x dest_h with Lanczos (no AI, no stretch: the crop must already have the dest aspect ratio;
a mismatch > 0.5 % is an error). Used for photo placement and phone-screenshot downscaling.
"""
import sys

from PIL import Image

src, dst, dw, dh = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
x, y, w, h = (float(v) for v in sys.argv[5:9]) if len(sys.argv) >= 9 else (0.0, 0.0, 1.0, 1.0)
im = Image.open(src).convert("RGB")
sw, sh = im.size
box = (x * sw, y * sh, (x + w) * sw, (y + h) * sh)
cw, ch = box[2] - box[0], box[3] - box[1]
if abs((cw / ch) / (dw / dh) - 1) > 0.005:
    sys.exit(f"aspect mismatch: crop {cw:.1f}x{ch:.1f} vs dest {dw}x{dh}")
im.resize((dw, dh), Image.LANCZOS, box=box).save(dst, compress_level=1)
print(dst)
