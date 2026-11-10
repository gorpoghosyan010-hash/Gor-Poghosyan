# 05 — Render manifest, launch mini-batch 2026-11-11-launch

Rendered on 2026-11-10 from `04-render-spec.json` and `03-copy.json`. Nothing was committed, and the website source was not touched. The local production build was made with `npm run build`, served with `next start -p 3123`, and the server was stopped after capture.
I viewed every still and the L02 cover after rendering, plus 10 extracted frames of L02 (t = 0.3, 0.8, 1.5, 2.0, 3.2, 4.5, 4.95, 5.45, 6.2 and 8.9 s). Armenian renders correctly everywhere, with no tofu.

Re-render command: `IG_ALLOW_PARTIAL=1 marketing/instagram/tools/render_batch.sh marketing/instagram/2026-11-11-launch [L01 L02 L03 L04]`
The automatic check log (112 checks, 1 failed: L04 shot 2) is in `.tools/work/launch_report.json`.

## BLOCKED — L04 slide 2 (home trust strip) was not rendered

The spec's check *"no /stock/ or /services/ media in the viewport"* fails for `L04_shot2` (`/`, scrollY 642). Once the header has `.scrolled`, it is **64 px** tall, not 78 px as the spec assumed. So at scrollY 642, viewport y 64..78 shows the stock home hero `/services/residential-hero.webp` directly as a visible band. Above y 64 it also shows through the 88 %-opaque header. The pixel diff against the same page with the hero image removed is up to 236/255.

- At scrollY ≥ 720 there is no leak (diff = 0), but the fixed header then covers the top row of the trust strip («Լողավազաններ / Տներ» are cut).
- No scroll position satisfies both conditions. This needs a decision: a different scrollY, a different site section, or dropping the slide. If the slide is dropped, the carousel has 5 slides and the "n / 6" page numbers need re-rendering.
- Evidence (gitignored work folder): `.tools/work/L04/REVIEW_shot2_scroll642_stock_leak.png` and `REVIEW_shot2_scroll720_strip_cut.png`.

## Files (`05-output/`)

Format notes:
- Feed stills are 1080×1440.
- `.jpg` is the upload file: sRGB, 4:4:4. Quality is 95 for graphic/typographic slides and L01, and 92 for L03 photo slides.
- `.png` is the lossless master.
- Captions are hy, ru, en, then hashtags. Alt text is copied verbatim from `03-copy.json`. That includes the updated L04 alt, which describes the /projects hero for slide 1.

### L01 — triptych (2026-11-12, publish L01a 19:50 → L01b 19:55 → L01c 20:00)
| File | Size |
|---|---|
| L01/L01a.jpg / .png (right tile, «Շուտով») | 73 KB / 46 KB |
| L01/L01b.jpg / .png (centre tile, villa drawing) | 82 KB / 411 KB |
| L01/L01c.jpg / .png (left tile, logo + ՇԻՆԱՐԱՐՈՒԹՅՈՒՆ) | 76 KB / 41 KB |
| L01/L01{a,b,c}_caption.txt, L01{a,b,c}_alt_hy.txt | — |
| L01/L01_canvas.png (3240×1440 master), _seams_0gap.png, _seams_4gap.png (QA only, do not upload) | 581 / 582 / 585 KB |

All three tiles are sliced from one canvas. The horizon and glow run continuously across the 0 px and 4 px gaps, and every text box is ≥ 90 px from the tile seams. The villa SVG is the live `.splashVilla` markup copied from the local build, not redrawn. Its ground line sits exactly on the horizon at y 1080.

### L02 — reel (2026-11-13 20:00)
| File | Size | Duration |
|---|---|---|
| L02/L02_reel.mp4 | 632 KB | 9.0 s (270 frames) |
| L02/L02_cover.jpg / .png | 97 KB / 283 KB | — |
| L02/caption.txt, alt_hy.txt | — | — |

- Video: 1080×1920, H.264 High, yuv420p, BT.709, 30 fps, CRF 18, +faststart.
- Audio: a silent AAC-LC track (48 kHz stereo, 320 kbps). Music is meant to be added in-app from the Meta Sound Collection, so the −14 LUFS target does not apply.
- Capture method: the site's own Splash, frame-stepped in Chromium (360×640 @3x, `reducedMotion: no-preference`, unmount timer frozen). It is not a screen recording and not the fallback.
- Measured layout matches the spec's `measured_layout_px` exactly (villa, logo, tag, corner and counter).
- Timeline: hooks at 0–1.2, 1.2–2.2 and 2.2–4.6 s with 4-frame fades. In-browser zoom of 1→1.03 from 2.2 to 4.6 s. splashLift runs 4.6–5.5 s. End card: «Շուտով» (5.35 s, fade + rise), the label (5.6 s) and the horizon wipe (5.6 s, 0.7 s).
- Cover: t = 2.4 s state, scale 1, no hook text.

### L03 — carousel (2026-11-14 20:00)
| File | Size |
|---|---|
| L03/L03_01.jpg (house-01/12) | 303 KB |
| L03/L03_02.jpg (pool-05/01, 01 · ԼՈՂԱՎԱԶԱՆՆԵՐ) | 279 KB |
| L03/L03_03.jpg (pool-02/07) | 327 KB |
| L03/L03_04.jpg (house-01/06, 02 · ՏՆԵՐ) | 226 KB |
| L03/L03_05.jpg (typographic, empty frame) | 84 KB |
| L03/L03_06.jpg (end, «Շուտով՝ մեր կայքը») | 108 KB |
| matching .png masters (1.32 MB / 1.14 MB / 1.65 MB / 878 KB / 43 KB / 58 KB), caption.txt, alt_hy.txt | — |

Photos are graded with saturation −8 % and contrast +5 %. pool-02 also gets the usual warm match. Scaling is Lanczos. Every text box fits at its spec size (no autofit reductions) and stays inside the safe area.

### L04 — carousel (2026-11-15 20:00) — 5 of 6 slides, see BLOCKED above
| File | Size | Screenshot |
|---|---|---|
| L04/L04_01.jpg / .png | 270 KB / 750 KB | /projects, scrollY 0 (pool-01/06 hero) |
| L04/L04_02 — **not rendered** | — | / scrollY 642: stock hero visible |
| L04/L04_03.jpg / .png | 151 KB / 137 KB | /services, scrollY 652 (list 01–04) |
| L04/L04_04.jpg / .png | 152 KB / 104 KB | /calculator, scrollY 652, crop h 0.6822 |
| L04/L04_05.jpg / .png | 255 KB / 620 KB | /projects, scrollY 1560 |
| L04/L04_06.jpg / .png | 103 KB / 59 KB | end slide |
| L04/caption.txt, alt_hy.txt | — | — |

Screenshots use the Playwright `iPhone 13` profile on Chromium: 390×664 @3x = 1170×1992, `reducedMotion: reduce`, lang hy. Automatic checks passed on shots 1, 3, 4 and 5:
- html lang is `hy`.
- No /stock/ or /services/ image or background is in the viewport. The check includes ::before/::after and decoded next/image URLs.
- No «25+», «50+», «ՀԻՄՆ» or «2000» appears in the visible text.
- No price or currency appears inside the published crop.
- On shot 4: every «֏» element is below the crop (top ≥ 453 CSS px), the area input is empty (placeholder «օր.՝ 150», unit մ² shown separately), and no result block is in the crop.

## Not done / notes
- **L04 slide 2** is blocked (see above). The L04 alt text still mentions slide 2 («Լողավազաններ · Տներ · Վերանորոգում» strip). Update it if the slide changes.
- Publishing condition Լ3 still applies: before 20:00 on 11-15, check garon.am on a phone against these screenshots.
- L03 slide 1: the 80 px title wraps as «Լողավազաններ · Տներ ·» / «Վերանորոգում», with the middle dot at the end of line 1. This is the copy verbatim; I did not add a manual break.
- L04 slide 3 shows four services (incl. 04 «Հասարակական կառույցներ»), as the live /services list does. The copy talks about three directions.
- No music was mixed (see L02).

## Tools (`marketing/instagram/tools/`, reusable; batch-1 behaviour unchanged)
- `render_launch.js` (new): renders specs that have `site_capture`. It handles the triptych canvas, frame-stepped splash capture, chapter/end slides, phone-screenshot slides and the L04 site checks. `IG_ALLOW_PARTIAL=1` blocks only a slide whose site check fails; by default a failure stops the run.
- `render_batch.sh`: dispatches to `render_launch.js` when the spec has `"site_capture"`. In that case it builds the site, starts `next start -p 3123` and always stops it afterwards. `IG_SKIP_BUILD=1` reuses the existing build; `IG_SITE_URL` points at an already running server. The batch-1 path is unchanged.
- `compose_reel.py`: adds a `motion.type: "frames"` scene (pre-rendered frame sequence) and a layer `wipe_in` option. Both are optional keys, so existing timelines behave as before.
- `ig_lib.js`: adds an optional `extra_css` per text element. It is unused by batch-1.
- `fit_photo.py` (new): exact crop and Lanczos resize. `slice_canvas.py` (new): slices tiles and writes the seam previews.

## Round 1 (2026-11-10, fix loop) — supersedes the sections above where they differ

Every item was re-rendered from `04-render-spec.json` (spec_version 2, `revision` round 1) and the updated `03-copy.json`. The renders use the **final owner-approved logo** (commit 0d9562a, "remove the gold rule under CONSTRUCTION"; `public/brand/garon-logo-dark.svg` md5 `ded01abb…`). The md5 was checked before and after the run, and on the logo the local server returned. The home hero is the real photo `/projects/house-01/12.webp` (commit 672d5c8).
- **Site build:** the site was built fresh from a copy of the working tree in a scratch directory and served there on port 3123. I did not rebuild the repo's own `.next`, because another `next-server` (pid 9942) was serving from the repo root. The server was stopped afterwards.
- **Command:** `IG_SITE_URL=http://localhost:3123 IG_ALLOW_PARTIAL=1 marketing/instagram/tools/render_batch.sh marketing/instagram/2026-11-11-launch`. No tool changes were needed.
- **Automatic checks:** 121 of 121 passed (`.tools/work/launch_report.json`). This includes all L04_shot2 checks: no /stock/ or /services/ media at scrollY 642, lang hy, no 25+/50+/ՀԻՄՆ/2000, and no price in the crop.
- **Earlier renders:** the logo changed twice and the hero changed once while I was rendering. Every render made before those changes has been overwritten.

### Round 1 files
| File | Size | Notes |
|---|---|---|
| L01/L01a.jpg / .png | 73 KB / 45 KB | re-sliced from the new canvas |
| L01/L01b.jpg / .png | 82 KB / 411 KB | re-sliced |
| L01/L01c.jpg / .png | 70 KB / 49 KB | final logo + ՇԻՆԱՐԱՐՈՒԹՅՈՒՆ |
| L01/L01_canvas.png, _seams_0gap.png, _seams_4gap.png | 587 / 588 / 592 KB | QA only. The seams were rechecked: the horizon and glow are continuous at 0 and 4 px gaps |
| L02/L02_reel.mp4 | 623 KB, 9.0 s | splash re-captured from the fresh build (final logo); 1080×1920, H.264 yuv420p, 30 fps, silent AAC, faststart |
| L02/L02_cover.jpg / .png | 92 KB / 273 KB | t = 2.4 s splash state, final logo |
| L03/L03_01…06.jpg | 302 / 246 / 327 / 225 / 83 / 104 KB | s1 title now breaks «Լողավազաններ · Տներ» / «Վերանորոգում»; s2 has the top gradient (logo and «2 / 6» readable on the sky), and its body is from copy round 1 |
| L03/L03_01…06.png | 1322 / 1111 / 1650 / 877 / 42 / 57 KB | masters |
| L04/L04_01.jpg / .png | 268 / 749 KB | /projects, scrollY 0 |
| **L04/L04_02.jpg / .png** | 178 / 173 KB | **now rendered**: home trust strip at scrollY 642. The render condition passes after the hero was replaced (variant a), and the carousel stays 6 slides |
| L04/L04_03.jpg / .png | 150 / 135 KB | /services |
| L04/L04_04.jpg / .png | 144 / 98 KB | /calculator; phone moved up (frame_top 490) and the phone group fades out below the crop |
| L04/L04_05.jpg / .png | 254 / 618 KB | /projects scrollY 1560 |
| L04/L04_06.jpg / .png | 99 / 59 KB | end slide, final logo |
| captions / alt_hy.txt (all items) | — | regenerated from 03-copy.json |

**Viewed:** every still, the L02 cover and 8 L02 frames (t = 0.3, 1.5, 2.4, 3.2, 4.95, 5.45, 6.2, 8.9 s). The logo has no gold rule under CONSTRUCTION in any item, including the site header in all L04 screenshots, the L03 corner logo and the L02 splash. Armenian renders correctly, with no tofu.

**Still open:**
- Publishing condition Լ3: before posting L04, check the live garon.am on a phone against these screenshots. The live site must have the new hero and the final logo deployed.
- No music was mixed into L02.
