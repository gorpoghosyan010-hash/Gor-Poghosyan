#!/usr/bin/env bash
# One-shot batch render: stills + covers + reel layers (Node/Playwright), then reels (Python/ffmpeg).
# usage: marketing/instagram/tools/render_batch.sh <batch_dir relative to repo root> [ITEM ...]
# needs: node + playwright (chromium), python3 + Pillow, ffmpeg;
#        fonts: npm i --prefix marketing/instagram/tools --no-save @fontsource/noto-sans-armenian \
#               @fontsource/noto-serif-armenian @fontsource/cormorant-garamond @fontsource/montserrat
set -euo pipefail
TOOLS="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$TOOLS/../../.." && pwd)"
BATCH="$1"; shift || true
[ -d "$TOOLS/node_modules/@fontsource/noto-sans-armenian" ] || npm i --prefix "$TOOLS" --no-save --no-package-lock \
  @fontsource/noto-sans-armenian @fontsource/noto-serif-armenian @fontsource/cormorant-garamond @fontsource/montserrat
node "$TOOLS/render_batch.js" "$ROOT" "$BATCH" "$@"
for tl in "$ROOT/$BATCH"/.tools/work/*/timeline.json; do
  id="$(basename "$(dirname "$tl")")"
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $id " ]]; then continue; fi
  python3 "$TOOLS/compose_reel.py" "$tl" "$ROOT/$BATCH/05-output/$id/${id}_reel.mp4"
done
