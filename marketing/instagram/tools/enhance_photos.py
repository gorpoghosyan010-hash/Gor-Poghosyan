"""Enhance phone photos for social media without altering what they show.

Per photo: gray-world white balance, CLAHE on luminance (local contrast),
gentle exposure/gamma lift, light denoise, vibrance boost, unsharp mask,
and Lanczos upscale (x1.5) for images under 1500 px on the short side.
Usage: python enhance_photos.py <in_dir> [<in_dir> ...]  -> writes <in_dir>/enhanced/*.jpg
"""
import sys, os, glob
import cv2, numpy as np

def white_balance(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    a, b = lab[..., 1].mean(), lab[..., 2].mean()
    lab[..., 1] -= (a - 128) * 0.3
    lab[..., 2] -= (b - 128) * 0.3
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)

def local_contrast(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.createCLAHE(clipLimit=1.3, tileGridSize=(8, 8)).apply(l)
    return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)

def exposure(img):
    l = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)[..., 0].mean() / 255.0
    gamma = 0.88                   # brighter overall
    if l < 0.42: gamma = 0.75      # lift dark photos more
    elif l > 0.68: gamma = 0.97    # bright photos: only a touch
    lut = np.array([((i / 255.0) ** gamma) * 255 for i in range(256)]).astype(np.uint8)
    return cv2.LUT(img, lut)

def vibrance(img, amount=0.45):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    s = hsv[..., 1] / 255.0
    s = s * 1.28 + amount * (1 - s) * s          # saturation + vibrance
    hsv[..., 1] = np.clip(s * 255, 0, 255)
    hsv[..., 2] = np.clip(hsv[..., 2] * 1.05 + 4, 0, 255)  # a little more light
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

def sharpen(img, amount=0.6, radius=1.2):
    blur = cv2.GaussianBlur(img, (0, 0), radius)
    return cv2.addWeighted(img, 1 + amount, blur, -amount, 0)

def enhance(path, out):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    if min(h, w) < 1500:
        f = 1500 / min(h, w)
        img = cv2.resize(img, (round(w * f), round(h * f)), interpolation=cv2.INTER_LANCZOS4)
    img = cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 7, 21)
    img = white_balance(img)
    img = exposure(img)
    img = local_contrast(img)
    img = vibrance(img)
    img = cv2.convertScaleAbs(img, alpha=1.06, beta=6)   # extra brightness/pop
    img = sharpen(img)
    cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, 94])

for d in sys.argv[1:]:
    od = os.path.join(d, 'enhanced'); os.makedirs(od, exist_ok=True)
    for p in sorted(glob.glob(os.path.join(d, '*.jpg'))):
        enhance(p, os.path.join(od, os.path.basename(p))); print('ok', p)
