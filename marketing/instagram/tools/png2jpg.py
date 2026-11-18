#!/usr/bin/env python3
"""png2jpg.py <in.png> <out.jpg> [quality]  — sRGB JPG, 4:4:4 chroma (no subsampling)."""
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
q = int(sys.argv[3]) if len(sys.argv) > 3 else 92
Image.open(src).convert("RGB").save(dst, "JPEG", quality=q, subsampling=0, optimize=True)
