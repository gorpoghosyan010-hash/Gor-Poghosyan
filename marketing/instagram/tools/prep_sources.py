#!/usr/bin/env python3
"""Grade + anonymise source photos once, for both feed and reel renders.

usage: prep_sources.py <repo_root> <out_dir> <src1.webp> [src2 ...]

- saturation -8 %, contrast +5 % (brand.photo_grade in the render spec)
- pool-02/* gets a slight warm shift to match pool-01 (P03 grade_note)
- faces listed in tools/privacy_blur.json are blurred (elliptical, feathered gaussian)
Writes <out_dir>/<project>_<name>.png (lossless) and prints a JSON map src -> png.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))


def warm(im, r=1.03, b=0.965):
    R, G, B = im.split()
    R = R.point(lambda v: min(255, int(v * r + 0.5)))
    B = B.point(lambda v: int(v * b + 0.5))
    return Image.merge("RGB", (R, G, B))


def blur_faces(im, cfg):
    rad = cfg.get("blur_radius", 9)
    blurred = im.filter(ImageFilter.GaussianBlur(rad))
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    for r in cfg["regions"]:
        d.ellipse([r["cx"] - r["rx"], r["cy"] - r["ry"], r["cx"] + r["rx"], r["cy"] + r["ry"]], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    return Image.composite(blurred, im, mask)


def main():
    root, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    privacy = json.load(open(os.path.join(HERE, "privacy_blur.json")))
    result = {}
    for rel in sys.argv[3:]:
        name = rel.replace("public/projects/", "").replace("/", "_").rsplit(".", 1)[0] + ".png"
        dst = os.path.join(out_dir, name)
        result[rel] = dst
        if os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(os.path.join(HERE, "privacy_blur.json")):
            continue
        im = Image.open(os.path.join(root, rel)).convert("RGB")
        if rel in privacy and privacy[rel].get("enabled", True):
            im = blur_faces(im, privacy[rel])
        if "/pool-02/" in rel:
            im = warm(im)
        im = ImageEnhance.Color(im).enhance(0.92)
        im = ImageEnhance.Contrast(im).enhance(1.05)
        im.save(dst, optimize=False, compress_level=1)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
