#!/usr/bin/env python3
"""slice_canvas.py <canvas.png> <out_dir> <ID:x> [ID:x ...] [--w 1080]

Slice one wide canvas (e.g. a 3240x1440 profile-grid triptych) into tiles <out_dir>/<ID>.png
(full canvas height, tile width 1080 unless --w). Also writes <out_dir>/_seams_0gap.png and
_seams_4gap.png (tiles re-assembled in canvas order with 0 / 4 px grey gaps) for the seam check.
"""
import os
import sys

from PIL import Image

args = sys.argv[1:]
tw = 1080
if "--w" in args:
    i = args.index("--w"); tw = int(args[i + 1]); del args[i:i + 2]
canvas, out = Image.open(args[0]).convert("RGB"), args[1]
tiles = sorted(((int(a.split(":")[1]), a.split(":")[0]) for a in args[2:]))
ims = []
for x, tid in tiles:
    t = canvas.crop((x, 0, x + tw, canvas.height))
    t.save(os.path.join(out, tid + ".png"), compress_level=6)
    ims.append(t)
for gap in (0, 4):
    sheet = Image.new("RGB", (len(ims) * tw + (len(ims) - 1) * gap, canvas.height), (255, 255, 255))
    for k, t in enumerate(ims):
        sheet.paste(t, (k * (tw + gap), 0))
    sheet.save(os.path.join(out, "_seams_%dgap.png" % gap))
print(" ".join(t for _, t in tiles))
