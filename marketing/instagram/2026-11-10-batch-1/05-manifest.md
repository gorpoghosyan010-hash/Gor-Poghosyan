# 05 — Render manifest, batch 2026-11-10-batch-1

Rendered on 2026-11-10 from `04-render-spec.json` + `03-copy.json`. Nothing committed; the website was not touched.
Every still and reel below was viewed after rendering (contact sheets, plus 3 or more extracted frames per reel).

## DRAFT — do not publish as-is

These files contain the placeholders `[ԱԱՀ՝ ճշտել]` / `[ամսաթիվ՝ ճշտել]`, rendered **red (#ff4d4d)** as the spec requires. They need the resolved VAT and validity-date values and a re-render before they can go out.

| File | Placeholder(s) |
|---|---|
| **DRAFT** `P06/P06.jpg`, `P06/P06.png` | footer: `[ԱԱՀ՝ ճշտել]`, `[ամսաթիվ՝ ճշտել]` |
| **DRAFT** `P06/caption.txt` | hy `[ԱԱՀ՝ ճշտել]`, `[ամսաթիվ՝ ճշտել]`; ru `[НДС: уточнить]`, `[дата: уточнить]`; en `[VAT: to confirm]`, `[date: to confirm]` |
| **DRAFT** `P09/P09.jpg`, `P09/P09.png` | footer: `[ԱԱՀ՝ ճշտել]`, `[ամսաթիվ՝ ճշտել]` |
| **DRAFT** `P09/caption.txt` | same placeholders as P06 caption (hy/ru/en) |

Fallbacks without placeholders: P06B (for P06) and P09B (for P09).

## Privacy decision

- `public/projects/house-01/09.webp` (used in P01 scene 5 and P05 slide 7): **owner approved faces visible, 2026-11-10.** The coordinator relayed this decision during the render; I did not verify it independently. Workers' faces are **not** blurred. The face coordinates are still in `marketing/instagram/tools/privacy_blur.json` with `"enabled": false`, so blurring can be switched back on.
- house-01/04 (P01 s3, P05 s3): the workers on the right are outside every crop. Checked on the renders.
- house-01/10 (P01 s8, P05 s6, P08): the seated worker on the far left is outside the crop. The man in the centre is seen from behind. P08 is still blocked by his consent, as the spec says.
- pool-01/04 (P03 s1): the person at the top-right edge is outside the crop.
- Forbidden assets are not used: no public/services, no public/stock, no house-01/11, no pool-02/04 (deleted). The renderer refuses to run if the spec references any of them.

## Files (`05-output/`)

Format notes:
- Feed stills are 1080×1350.
- `.jpg` is the upload file: sRGB, 4:4:4. Quality is 92 for photos and 95 for typographic slides.
- `.png` is the lossless master.
- Reels are 1080×1920, H.264 High, yuv420p, BT.709, 30 fps, CRF 18. They carry a silent AAC-LC track (48 kHz stereo, 320 kbps) and use +faststart.
- Every item folder has `caption.txt` (hy, ru, en, then hashtags) and `alt_hy.txt`.

### P01 — reel (2026-11-16)
| File | Size | Duration |
|---|---|---|
| P01/P01_reel.mp4 | 10.6 MB | 15.0 s |
| P01/P01_cover.jpg / .png | 334 KB / 1.5 MB | — |
| P01/caption.txt, alt_hy.txt | 2.2 KB / 0.4 KB | — |

### P02 — carousel, typographic (2026-11-18)
P02/P02_01 … P02_09 (.jpg 72–89 KB each, .png 45–59 KB each), caption.txt, alt_hy.txt

### P03 — carousel (2026-11-20)
P03/P03_01 … P03_08 (.jpg 79–611 KB, .png 50 KB–2.4 MB), caption.txt, alt_hy.txt

### P04 — reel (2026-11-23)
| File | Size | Duration |
|---|---|---|
| P04/P04_reel.mp4 | 10.4 MB | 12.0 s |
| P04/P04_cover.jpg / .png | 612 KB / 2.6 MB | — |
| P04/caption.txt, alt_hy.txt | | |

### P05 — carousel (2026-11-25)
- P05/P05_01 … P05_09 (.jpg 76–480 KB, .png 51 KB–2.0 MB), caption.txt, alt_hy.txt
- P05/P05_09_A.jpg / .png (79 / 52 KB): variant A ("Մենք ուղարկում ենք սա ամեն ուրբաթ"). Publish **only if Բ5 is approved**. P05_09 is the default.

### P06 — post (2026-11-27), **DRAFT** (see above); blocked by Բ3, Բ4, validity date, rate confirmation
P06/P06.jpg (186 KB), P06/P06.png (122 KB), caption.txt (**DRAFT**), alt_hy.txt

### P06B — fallback post for P06
P06B/P06B.jpg (112 KB), P06B/P06B.png (65 KB), caption.txt, alt_hy.txt

### P07 — reel (2026-11-30), **NOT RENDERED: needs the founder shoot (deadline 2026-11-25)**
Only overlay templates were made. All are transparent 1080×1920 PNGs in `P07/templates/`:
- `P07_logo.png`: logo, placed **top-right** (x 878). See deviations.
- `P07_seg1_title.png` … `P07_seg5_title.png`: segment titles, with numeral and rule for segments 2–4.
- `P07_seg5_cta.png`: "Գրեք «ՍՏՈՒԳԵԼ» direct-ում".
- `P07_seg5_cta_fallback.png`: "Պահպանեք Reel-ը՝ …". Use this one if nobody is assigned to answer DMs within 24 h.
- `P07_sub_01.png` … `P07_sub_15.png`: burned-in hy subtitle chunks (reel_subtitle style with the box). The text joins back to `vo_hy` verbatim.
- `P07_subtitles_hy_DRAFT_timing.srt`: the same 15 chunks. Timing is **estimated** (proportional to character count within each segment), so re-time it to the real speech.
- `P07_cover_overlay.png`: dark 25% layer, top gradient, hook and logo (x 120). Lay it over the chosen A-roll frame.
- caption.txt, alt_hy.txt

### P07B — fallback reel for P07 (no shoot dependency)
| File | Size | Duration |
|---|---|---|
| P07B/P07B_reel.mp4 | 391 KB | 22.0 s |
| P07B/P07B_cover.jpg / .png | 69 / 58 KB | — |
| P07B/caption.txt, alt_hy.txt | | |

### P08 — post (2026-12-02); blocked by Բ5 and consent of the man in the photo
P08/P08.jpg (369 KB), P08/P08.png (1.6 MB), caption.txt, alt_hy.txt

### P08B — fallback post for P08
P08B/P08B.jpg (266 KB), P08B/P08B.png (1.4 MB), caption.txt, alt_hy.txt

### P09 — post (2026-12-04), **DRAFT** (see above); blocked by Բ3, validity date, 90,000 ֏/m² confirmation
P09/P09.jpg (303 KB), P09/P09.png (1.07 MB), caption.txt (**DRAFT**), alt_hy.txt

### P09B — fallback post for P09
P09B/P09B.jpg (280 KB), P09B/P09B.png (1.05 MB), caption.txt, alt_hy.txt

## Deviations from the render spec

These were needed because the spec conflicts with itself, or to keep text readable:

1. **P06 table:** the rate column at x=600 collided with the 66 px gold totals (for example "180,000 ֏/մ²" overlapped "12.6 մլն ֏"). Each rate now sits right-aligned directly under its total. Name, description and total are unchanged.
2. **P04 scene 7 (final, pool-01/06):** the spec's contain_blur foreground (1080×1016 at y 452) sat under both the word sequence (y 400–600) and the body/CTA (y 1330+), which made all of it unreadable. The foreground was scaled to 744×700 at (168, 610), aspect kept, between the two text zones. The blurred background and gold edge lines are unchanged.
3. **P07 logo:** the spec puts the segment titles at y 270–300, right on the standard reel logo slot (x 70–202, y 262–358). In the P07 templates the logo moves to the top-right (x 878, y 262). Titles were given a narrower box so they wrap before the logo; copy is unchanged.
4. **P07 subtitles:** chunks are at most 27 characters per line (spec maximum is 30) and 2 lines. That keeps the centred Armenian lines left of x=900 (the IG button zone). Font autofits 44→42/40 px where needed. The box padding of `P07_sub_08` reaches x 905 at the 40 px minimum; the text itself ends around x 883.
5. **Numerals:** Cormorant Garamond's default old-style "1" reads as a Roman "I" ("12.6" looked like "I2.6"). The display font uses lining figures (`font-variant-numeric: lining-nums`).
6. **Legibility halos:** soft dark text shadows were added in three places:
   - reel labels, body and CTA, plus the P04 word sequence;
   - P08 title/body over the light grey sky (body contrast was about 3:1 before);
   - small corner/page labels on full-bleed photo slides.
7. **Typography (no copy changes):**
   - a number is kept with the next word ("4 մոտավոր", "7 բանը", "15 վայրկյան");
   - "direct-ում" never breaks at the hyphen;
   - the P01 hook (`break_after`) is forced to exactly 2 lines, with autofit 84→82 px (cover: 78 px).
8. **Covers:**
   - Every cover places the logo at x=120 (P01's rule, also applied to P04 and P07B for consistency).
   - P07B cover = scene 1 shifted to x=120. Its hook box is capped at w=840 so it stays inside the grid-crop zone.
9. **P02 slide 1:** the spec anchors both the page counter and the swipe arrow at (1008, 1262). They are rendered as one right-aligned group: "1 / 9  →".
10. **Photo grade** is applied to all sources: saturation −8%, contrast +5%. pool-02 also gets a slight warm shift to match pool-01. There is no AI upscaling; reel stills are upscaled about 1.7× with bicubic sampling, as the spec's crops require.

## Not done / follow-ups

- **P07 video:** not rendered, because there is no A-roll (`shoot/P07/` does not exist). Only the templates above exist. If the shoot misses 2026-11-27, publish P07B.
- **Music/SFX:** not added. Each reel has a silent stereo AAC track; add licensed music in the Instagram app as described in each item's `audio` block. The −14 LUFS / −1 dBTP targets only apply once music is added.
- **Scene boundaries are not beat-synced** (P01 audio.sync). They are exactly as in the spec, because no track was chosen.
- **en/ru subtitle exports for P07:** out of scope for this batch (translator to provide).
- **P04 scenes 2–6:** the inactive words (38% paper, per spec) are faint over light concrete even with the top gradient and halo. The active gold word stays legible. Raise the inactive opacity if this is a concern.
- **Copywriter confirmation** is still pending on the P01 label remap (spec `order_decision`).

## Tools (reusable, `marketing/instagram/tools/`)

- `render_batch.sh <batch_dir> [ITEM…]`: does everything in one run.
- `render_batch.js`: renders stills, covers, reel layers and timelines, the P07 templates, and the captions.
- `ig_lib.js`: shared HTML/CSS/Playwright helpers (fonts, styles, autofit, safe-area checks, red placeholders).
- `compose_reel.py`: frame-accurate Ken Burns, contain-blur, crossfade/dip and animated layers, piped into ffmpeg.
- `prep_sources.py` + `privacy_blur.json`: source grading and face blur.
- `png2jpg.py`, `contact_sheet.py`: export and QA helpers.

Fonts (@fontsource Montserrat, Noto Sans/Serif Armenian, Cormorant Garamond) are installed under `marketing/instagram/tools/node_modules` (gitignored). Intermediate files are in `2026-11-10-batch-1/.tools/` (gitignored): graded sources, reel layer PNGs, `timeline.json` per reel, and `render_report.json`.

## Round 1 (2026-11-10): fix loop after `06-review.md`

Re-rendered from `04-render-spec.json` **spec_version 2** (`round1_changes`) and the updated `03-copy.json`, with
`IG_SLIDES="P05:4,5" marketing/instagram/tools/render_batch.sh marketing/instagram/2026-11-10-batch-1 P01 P03 P04 P05 P06B P08B P08`.
Old files in `05-output/` were overwritten. Nothing else was touched: P02, P06, P07, P07B, P09, P09B and the other P05 slides are byte-identical to round 0, and `2026-11-11-launch/` was not touched. Renderer warnings: 0.

### What changed
| Item | Files rewritten | Change |
|---|---|---|
| P01 | `P01_reel.mp4` (10.8 MB, 15.0 s), `P01_cover.jpg/.png` (334 KB / 1.5 MB, unchanged pixels: cover spec unchanged), `caption.txt`, `alt_hy.txt` | Scene labels from copy Round 1: Հողամաս, Հողամաս, Հիմք, Սյուներ, Պատեր՝ 1-ին հարկ, Ծածկ, Կարկաս, Բետոնի լցում, Պատեր՝ 2-րդ հարկ, Ավարտ. End card: `p01_end_grad` overlay, label 32 px, body and CTA 42 px, block at y 1150–1460. CTA is now «Տուն եք ծրագրում՝ գրեք «ՏՈՒՆ» direct-ում» (2 lines). Gold CTA vs. darkened paving measured on the 14.9 s frame: about 5.4:1 worst case, about 7:1 median. Calculator CTA removed from the caption (hy/ru/en). Scene 5 faces not blurred (owner decision). |
| P03 | `P03_01…08.jpg/.png` (P03_06 has no corner label, so its pixels are identical) | «Լողավազան 1 / 2» corner labels now use `feed_corner_label`: 26 px on a dark pill (α 0.6, padding 10/16, radius 3), anchored top-right at (1008, 60). Caption and alt unchanged. |
| P04 | `P04_reel.mp4` (10.3 MB, **13.5 s**), `P04_cover.jpg/.png` (508 KB / 2.3 MB) | Scene 7 runs 10.2–13.5 s. Credit is on screen 10.5–13.5 s (3.0 s), CTA 11.0–13.5 s (2.5 s). Inactive words and arrows at 70% paper with a text shadow. EN label 28 px. `p04_top_plate` on scenes 2–6. Scene 7 foreground 744×700 at (168, 610), now in the spec. Cover uses `p04_cover_grad`. Caption and alt unchanged. |
| P05 | `P05_04.jpg/.png`, `P05_05.jpg/.png`, `alt_hy.txt` (P05_01–03, 06–09, 09_A and caption.txt untouched) | Slide 4: columns already poured, only starter bars visible. Slide 5: slab after the pour, formwork removed, props holding it. |
| P06B | `P06B.jpg/.png` (111 KB / 66 KB), `caption.txt`, `alt_hy.txt` | Headline «Ինչո՞ւ» (was «Ինչու՞»), checked at full resolution. Caption CTA «Ուզո՞ւմ եք իմանալ…». |
| P08B | `P08B.jpg/.png` (269 KB / 1.4 MB), `caption.txt`, `alt_hy.txt` | Body reframed: «Արդեն լցված է, և արմատուրան այլևս չի երևում։ Ահա թե ինչու լուսանկարը պետք է արվի լցումից առաջ։». Caption (hy/ru/en) and alt follow the "already poured" story. |
| P08 | `P08.jpg/.png` (370 KB / 1.6 MB), `caption.txt` | **Archive only; still BLOCKED (Բ5 + consent).** Logo is back at the top-left (brand.logo.feed), rule y 196, title y 226. RU caption now reads «какие есть проблемы». |

All reels: H.264 High, yuv420p, 1080×1920, 30 fps, silent AAC, +faststart, ≤ 11 MB. Captions are 1,276–1,565 chars with 5 hashtags.

### QA done
- Viewed every changed still: P03 01–08 plus the corner crops at 1:1, P05 04–05, P06B (plus a 1:1 headline crop), P08B, P08, P01 cover, P04 cover.
- P01: viewed 11 frames (0.1, 2.0, 4.5, 6.0, 7.2, 8.6, 10.0, 11.2, 12.2, 13.3, 14.9 s; end card at full size).
- P04: viewed 10 frames (0.5, 2.5, 4.0, 5.8, 7.5, 9.5, 10.6, 11.3, 12.5, 13.4 s; word band at 1:1 on concrete and mosaic).
- No tofu. ՞ ՝ « » ։ render correctly.

### Tool changes (`marketing/instagram/tools/`, backward compatible)
- `ig_lib.js`:
  - overlay type `linear_stops`;
  - style `box` (text on a padded pill), and autofit ignores the padding;
  - element overrides `shadow_override` / `text_shadow` / `min_size_override`.
- `render_batch.js`:
  - word sequence honours `inactive_color`, `text_shadow`, `en_label.size_override` / `text_shadow`;
  - box-styled corner labels skip the halo;
  - env `IG_SLIDES="P05:4,5"` re-exports only the listed carousel slides.
- `compose_reel.py`: overlay type `linear_stops`.

### Still open / not done
- Publication gates are unchanged: P01, P03, P04, P05, P08B need Բ2 per `06-review.md`. `owner-decisions.md` now records Բ2 as confirmed; the reviewer must clear it. P08 stays blocked (Բ5, consent).
- All round-1 items need to go back to editorial review.
- Music is still to be added in the IG app. P04's track must run 13.5 s.
