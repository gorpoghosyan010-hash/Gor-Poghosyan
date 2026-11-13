"""Mild, natural enhancement of the owner's finished-day photo (house-A/04-final-day.jpg).
Gray-world WB (0.3 like tools/enhance_photos.py), gentle gamma lift, saturation x1.2, light denoise + unsharp.
Writes house-A/enhanced/04-final-day.jpg (same size, 1512x2016). Content is not altered."""
import sys, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src)
img = cv2.fastNlMeansDenoisingColored(img, None, 2, 2, 7, 21)
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
lab[..., 1] -= (lab[..., 1].mean() - 128) * 0.3
lab[..., 2] -= (lab[..., 2].mean() - 128) * 0.3
img = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
lut = np.array([((i / 255.0) ** 0.92) * 255 for i in range(256)]).astype(np.uint8)
img = cv2.LUT(img, lut)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
hsv[..., 1] = np.clip(hsv[..., 1] * 1.2, 0, 255)
img = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
blur = cv2.GaussianBlur(img, (0, 0), 1.2)
img = cv2.addWeighted(img, 1.4, blur, -0.4, 0)
cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, 94])
print('ok', out)
