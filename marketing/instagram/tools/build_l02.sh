#!/usr/bin/env bash
# L02 v4 reel (items.L02.method = "html_frame_stepped"): frames -> intro audio -> MP4, cover, caption/alt.
# usage: marketing/instagram/tools/build_l02.sh <batch_dir relative to repo root>
# Called by render_batch.sh for item L02 when the spec's L02 is frame-stepped. Needs node + playwright,
# python3 + numpy + Pillow, ffmpeg. Audio: compose_l02_audio.py --intro-only (sound 0-6 s, silence after;
# the owner adds music in Instagram), muxed as AAC 192k.
#   IG_L02_FRAMES=keep  reuse already rendered frames in .tools/work/L02/frames (skip the ~3 min render)
set -euo pipefail
TOOLS="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$TOOLS/../../.." && pwd)"
BATCH="$1"
B="$ROOT/$BATCH"
WD="$B/.tools/work/L02"
OUT="$B/05-output/L02"
export NODE_PATH="${NODE_PATH:+$NODE_PATH:}$(npm root -g)"

if [ "${IG_L02_FRAMES:-}" != keep ]; then
  rm -rf "$WD"                      # also removes leftovers of older L02 versions (v1 splash capture)
  mkdir -p "$WD/frames"
  node "$TOOLS/render_l02_frames.js" "$ROOT" "$WD/frames" all "$BATCH"
fi
NF=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['items']['L02']['frames'])" "$B/04-render-spec.json")
HAVE=$(ls "$WD/frames" | grep -c '^L02_[0-9]\{3\}\.png$')
[ "$HAVE" = "$NF" ] || { echo "L02: expected $NF frames, found $HAVE (STOP)"; exit 1; }

python3 "$TOOLS/compose_l02_audio.py" "$WD/intro.wav" --intro-only

rm -rf "$OUT"; mkdir -p "$OUT"
ffmpeg -v error -y -framerate 30 -i "$WD/frames/L02_%03d.png" -i "$WD/intro.wav" \
  -map 0:v -map 1:a -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -t 26 -movflags +faststart "$OUT/L02_reel.mp4"

cp "$WD/frames/L02_cover.png" "$OUT/L02_cover.png"
python3 "$TOOLS/png2jpg.py" "$OUT/L02_cover.png" "$OUT/L02_cover.jpg" 92

python3 - "$B/03-copy.json" "$OUT" <<'EOF'
import json, sys, os
c = json.load(open(sys.argv[1], encoding='utf-8'))['L02']
txt = '\n\n'.join(x for x in [c['caption_hy'], c['caption_ru'], c['caption_en'], ' '.join(c.get('hashtags') or [])] if x) + '\n'
open(os.path.join(sys.argv[2], 'caption.txt'), 'w', encoding='utf-8').write(txt)
open(os.path.join(sys.argv[2], 'alt_hy.txt'), 'w', encoding='utf-8').write(c['alt_hy'] + '\n')
EOF

ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,pix_fmt,bit_rate:format=duration,size \
  -of compact "$OUT/L02_reel.mp4"
SZ=$(stat -c %s "$OUT/L02_reel.mp4"); [ "$SZ" -le 31457280 ] || { echo "L02 reel > 30 MB (STOP)"; exit 1; }
echo "L02 done -> $OUT"
