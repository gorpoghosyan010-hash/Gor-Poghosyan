#!/usr/bin/env bash
# R5 «House rise» — full pipeline.  Usage: render.sh <out_dir> [python] [end_src.mp4] [song.wav]
#   1) prep_day.py   : mild enhancement of house-A/04-final-day.jpg -> house-A/enhanced/04-final-day.jpg
#   2) overlays.js   : corner logo + top-right labels (Playwright, same fonts as R2/R4)
#   3) compose.py    : content.mp4 (14.37 s = 30 beats @125.25 BPM)
#   4) tools/logo_outro.py on (first 6 s of L02 reel + content) -> logo build + end card at the end
#   5) audio replaced by digital silence -> house_rise.mp4
#   6) house_rise_song-preview.mp4 (4-beat bar of the reference song looped from t=0, preview only), cover.jpg, contact.jpg
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
OUT="$(mkdir -p "${1:?out dir}" && cd "$1" && pwd)"
PY="${2:-python3}"
END_SRC="${3:?end-card source reel (R2 v2 preview)}"
SONG="${4:-}"
A="$ROOT/marketing/instagram/assets/owner/house-A"
L02="$ROOT/marketing/instagram/2026-11-11-launch/05-output/L02/L02_reel.mp4"
WK="$OUT/work"; mkdir -p "$WK"

[ -f "$A/enhanced/04-final-day.jpg" ] || "$PY" "$HERE/prep_day.py" "$A/04-final-day.jpg" "$A/enhanced/04-final-day.jpg"
(cd "$ROOT" && NODE_PATH=$(npm root -g) node "$HERE/overlays.js" "$ROOT" "$WK/ov")
"$PY" "$HERE/compose.py" "$A/enhanced" "$WK/ov" "$WK/content.mp4"
CD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WK/content.mp4")

# temp source in the standard layout: 0-6 s L02 intro (with its sound) + content (silent)
ffmpeg -y -v error -t 6 -i "$L02" -i "$WK/content.mp4" -f lavfi -t "$CD" -i anullsrc=r=48000:cl=stereo \
  -filter_complex "[0:v]fps=30,scale=1080:1920,setsar=1,format=yuv420p[v0];[1:v]fps=30,setsar=1,format=yuv420p[v1];[v0][v1]concat=n=2:v=1:a=0[v];[0:a]aresample=48000,atrim=0:6[a0];[a0][2:a]concat=n=2:v=0:a=1[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -c:a aac -b:a 192k "$WK/src.mp4"
C1=$(python3 -c "print(round(6.0 + $CD, 3))")
"$PY" "$ROOT/marketing/instagram/tools/logo_outro.py" "$WK/src.mp4" "$WK/outro.mp4" --content 6.0 "$C1" --end-src "$END_SRC"

# silent audio track for the whole video (owner adds the song in Instagram)
ffmpeg -y -v error -i "$WK/outro.mp4" -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT/house_rise.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/house_rise.mp4")

if [ -n "$SONG" ]; then
  "$PY" "$HERE/beat_preview.py" "$SONG" "$WK/beat.wav" "$DUR"
  ffmpeg -y -v error -i "$OUT/house_rise.mp4" -i "$WK/beat.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
    -shortest -movflags +faststart "$OUT/house_rise_song-preview.mp4"
fi

# cover: finished house at night, lights on (content t = 12.6 s); contact sheet: 16 frames over the whole reel
ffmpeg -y -v error -ss 12.6 -i "$OUT/house_rise.mp4" -frames:v 1 -q:v 2 "$OUT/cover.jpg"
mkdir -p "$WK/_cs"
for i in $(seq 0 15); do
  ffmpeg -y -v error -ss "$(python3 -c "print(round(0.2 + $i * ($DUR - 0.4) / 15, 2))")" -i "$OUT/house_rise.mp4" -frames:v 1 -vf scale=270:480 "$WK/_cs/c_$(printf %02d $i).png"
done
ffmpeg -y -v error -i "$WK/_cs/c_%02d.png" -vf "tile=8x2:padding=6:color=white" -frames:v 1 -q:v 3 "$OUT/contact.jpg"
rm -rf "$WK/_cs"
echo "out: $OUT/house_rise.mp4 ($DUR s)"
