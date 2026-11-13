---
name: instagram-content
description: Run GARON's 6-agent Instagram content pipeline (trends → plan & briefs → copy → visual direction → production of PNG/MP4 → quality review with fix loop) to produce ready-to-post reels, carousels and posts about renovation, house construction and pools. Use when the user asks for Instagram/social content, reels or posts.
---

# Instagram content pipeline

Batch folder: `marketing/instagram/<YYYY-MM-DD>-batch-<n>/` (create it). Each agent reads the
previous step's files and writes its own — the files are the hand-off.

1. `ig-1-trend-scout` → `01-trends.md` (reuse the latest batch's trends if < 30 days old and the user didn't ask for new research)
2. `ig-2-content-strategist` → `02-plan.md`, `02-briefs.json`
3. `ig-3-copywriter` → `03-copy.md`, `03-copy.json`
4. `ig-4-visual-director` → `04-visual.md`, `04-render-spec.json`
5. `ig-5-producer` → `05-output/` (PNG, MP4, captions, manifest)
6. `ig-6-quality-editor` → `06-review.md`, `06-review.json`
7. Fix loop: for every item marked `fix`, send the fixes to the owning step, rerun the steps after it
   for those items only, then review again. Max 2 loops; anything still failing is reported as not ready.
8. Commit the batch (not `.tools/` or `node_modules/`), and report to the user in Armenian: what's ready,
   the posting schedule, and the shoot list for missing footage.

Optional args: number of items, segment focus, date range.
