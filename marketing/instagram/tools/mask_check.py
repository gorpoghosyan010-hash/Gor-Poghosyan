#!/usr/bin/env python3
"""mask_check.py <slide.png> <bg_ref.png> <y0> <y1>  — verify a linear fade mask on a phone group.

Prints JSON: below_max / below_mean = abs diff vs the background-only render for rows y >= y1 (should be ~0),
max_row_step = largest row-to-row change of the mean |slide - bg| over the phone columns (x 230..850) in
y0-20 .. y1+5 (a hard edge shows up as one big step), profile = that mean every 8 rows.
"""
import json
import sys

from PIL import Image, ImageChops

a = Image.open(sys.argv[1]).convert("RGB")
b = Image.open(sys.argv[2]).convert("RGB")
y0, y1 = int(sys.argv[3]), int(sys.argv[4])
W, H = a.size
d = ImageChops.difference(a, b).convert("L")
px = d.load()
below = [px[x, y] for y in range(y1, H) for x in range(W)]
rows = {}
for y in range(max(0, y0 - 20), min(H, y1 + 6)):
    rows[y] = sum(px[x, y] for x in range(230, 851)) / 621.0
ys = sorted(rows)
steps = [abs(rows[ys[i + 1]] - rows[ys[i]]) for i in range(len(ys) - 1)]
print(json.dumps({
    "below_max": max(below), "below_mean": round(sum(below) / len(below), 4),
    "max_row_step": round(max(steps), 2),
    "profile": {y: round(rows[y], 1) for y in ys[::8]},
}))
