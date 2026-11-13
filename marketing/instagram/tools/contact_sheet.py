#!/usr/bin/env python3
"""contact_sheet.py <out.jpg> <cols> <tile_w> <img...>  — QA sheet of rendered images/frames."""
import sys
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
ims = [Image.open(p).convert("RGB") for p in sys.argv[4:]]
th = max(int(im.height * tw / im.width) for im in ims)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 8) + 8), (90, 90, 90))
for i, im in enumerate(ims):
    t = im.resize((tw, int(im.height * tw / im.width)), Image.LANCZOS)
    sheet.paste(t, (8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 8)))
sheet.save(out, quality=90)
