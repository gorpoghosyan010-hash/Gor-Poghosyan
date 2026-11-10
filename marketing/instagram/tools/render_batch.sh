#!/usr/bin/env bash
# One-shot batch render: stills + covers + reel layers (Node/Playwright), then reels (Python/ffmpeg).
# usage: marketing/instagram/tools/render_batch.sh <batch_dir relative to repo root> [ITEM ...]
# needs: node + playwright (chromium), python3 + Pillow, ffmpeg;
#        fonts: npm i --prefix marketing/instagram/tools --no-save @fontsource/noto-sans-armenian \
#               @fontsource/noto-serif-armenian @fontsource/cormorant-garamond @fontsource/montserrat
# Launch-type specs (04-render-spec.json has "site_capture"): render_launch.js is used instead of
# render_batch.js. It captures the LOCAL production build: this script runs `npm run build` and
# `next start -p 3123` from the repo root, and stops the server afterwards.
#   IG_SKIP_BUILD=1  reuse the existing .next build      IG_SITE_URL=...  use an already running server
set -euo pipefail
TOOLS="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$TOOLS/../../.." && pwd)"
BATCH="$1"; shift || true
[ -d "$TOOLS/node_modules/@fontsource/noto-sans-armenian" ] || npm i --prefix "$TOOLS" --no-save --no-package-lock \
  @fontsource/noto-sans-armenian @fontsource/noto-serif-armenian @fontsource/cormorant-garamond @fontsource/montserrat

if grep -q '"site_capture"' "$ROOT/$BATCH/04-render-spec.json"; then
  SERVER_PID=""
  stop_server() { if [ -n "$SERVER_PID" ]; then kill -- "-$SERVER_PID" 2>/dev/null || kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; echo "next server stopped"; fi; }
  trap stop_server EXIT
  if [ -z "${IG_SITE_URL:-}" ]; then
    [ "${IG_SKIP_BUILD:-0}" = 1 ] || (cd "$ROOT" && npm run build)
    (cd "$ROOT" && exec setsid npx next start -p 3123) > "$ROOT/$BATCH/.tools/next-start.log" 2>&1 &
    SERVER_PID=$!
    for _ in $(seq 1 60); do curl -sf -o /dev/null http://localhost:3123/ && break; sleep 1; done
    export IG_SITE_URL=http://localhost:3123
  fi
  node "$TOOLS/render_launch.js" "$ROOT" "$BATCH" "$@"
  tl="$ROOT/$BATCH/.tools/work/L02/timeline.json"
  if [ -f "$tl" ] && { [ $# -eq 0 ] || [[ " $* " =~ " L02 " ]]; }; then
    python3 "$TOOLS/compose_reel.py" "$tl" "$ROOT/$BATCH/05-output/L02/L02_reel.mp4"
  fi
  exit 0
fi

node "$TOOLS/render_batch.js" "$ROOT" "$BATCH" "$@"
for tl in "$ROOT/$BATCH"/.tools/work/*/timeline.json; do
  id="$(basename "$(dirname "$tl")")"
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $id " ]]; then continue; fi
  python3 "$TOOLS/compose_reel.py" "$tl" "$ROOT/$BATCH/05-output/$id/${id}_reel.mp4"
done
