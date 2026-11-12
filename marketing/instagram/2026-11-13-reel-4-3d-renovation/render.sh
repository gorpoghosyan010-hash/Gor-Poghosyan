#!/usr/bin/env bash
# R4 «Raw → Renovated» — full pipeline. Usage: render.sh <work_dir> [step=2] [samples=16]
#   1) Cycles RAW + FINISHED passes (scene.py; bakes the procedural shells to images first, cached in <work>/render/bake)
#   2) L02 logo intro frames 0–179 (tools/render_l02_frames.js) + intro audio (compose_l02_audio.py --intro-only)
#   3) overlays (overlays.js) → compose.py → room.mp4 (+ motion interpolation to 30 fps) + endcard.mp4
#   4) concat → preview.mp4 (1080×1920 H.264 yuv420p + AAC), cover.png, contact.jpg; frame folders deleted.
# Needs: python3.11 venv with `pip install bpy==4.2.0 numpy OpenEXR scipy pillow` (bpy 4.2 ships OpenImageDenoise;
#        Ubuntu's blender 4.0.2 has no OIDN — fallback: BLENDER=1 render.sh … uses `blender -b -P scene.py` with 64 samples).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
WORK="$(mkdir -p "${1:?work dir}" && cd "$1" && pwd)"
STEP="${2:-2}"; SAMPLES="${3:-16}"
PY="${PY:-$WORK/../venv311/bin/python}"
R="$WORK/render"; mkdir -p "$R"
run_pass() {
  if [ "${BLENDER:-0}" = 1 ]; then blender -b -P "$HERE/scene.py" -- --pass "$1" --out "$R" --frames 0-419 --step "$STEP" --samples 64 --res 960
  else "$PY" "$HERE/scene.py" -- --pass "$1" --out "$R" --frames 0-419 --step "$STEP" --samples "$SAMPLES" --res 960; fi
}
[ "${SKIP_RENDER:-0}" = 1 ] || { run_pass raw 2>&1 | grep --line-buffered "\[r4\]" ; run_pass fin 2>&1 | grep --line-buffered "\[r4\]"; }

# intro frames + audio
if [ ! -f "$WORK/intro/L02_179.png" ]; then
  (cd "$ROOT" && NODE_PATH=$(npm root -g) node marketing/instagram/tools/render_l02_frames.js "$ROOT" "$WORK/intro" "$(seq -s, 0 179)" marketing/instagram/2026-11-11-launch)
fi
"$PY" "$ROOT/marketing/instagram/tools/compose_l02_audio.py" "$WORK/intro_audio.wav" --intro-only
(cd "$ROOT" && NODE_PATH=$(npm root -g) node "$HERE/overlays.js" "$ROOT" "$WORK/ov")

# compositing
"$PY" "$HERE/compose.py" "$R" "$WORK/intro" "$WORK/ov" "$WORK/comp" --step "$STEP"
if [ "$STEP" != 1 ]; then
  ffmpeg -y -loglevel error -i "$WORK/comp/room.mp4" -vf "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
    -c:v libx264 -crf 12 -preset medium -pix_fmt yuv420p "$WORK/comp/room30.mp4"
else cp "$WORK/comp/room.mp4" "$WORK/comp/room30.mp4"; fi

# final: intro (0–6 s) + room (6–19 s) + end card (19–22 s), audio = intro sound then silence
ffmpeg -y -loglevel error -framerate 30 -i "$WORK/intro/L02_%03d.png" -i "$WORK/comp/room30.mp4" -i "$WORK/comp/endcard.mp4" -i "$WORK/intro_audio.wav" \
  -filter_complex "[0:v]format=yuv420p,setsar=1[a];[1:v]fps=30,format=yuv420p,setsar=1[b];[2:v]fps=30,format=yuv420p,setsar=1[c];[a][b][c]concat=n=3:v=1:a=0[v];[3:a]atrim=0:22,apad=whole_dur=22[au]" \
  -map "[v]" -map "[au]" -t 22 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a aac -b:a 192k -ar 48000 "$WORK/preview.mp4"

# cover (fully renovated room, before the end card) + contact sheet (16 frames)
ffmpeg -y -loglevel error -ss 18.2 -i "$WORK/preview.mp4" -frames:v 1 "$WORK/cover.png"
mkdir -p "$WORK/_cs"
for i in $(seq 0 15); do ffmpeg -y -loglevel error -ss "$(python3 -c "print(round(0.5 + $i * 21.0 / 15, 2))")" -i "$WORK/preview.mp4" -frames:v 1 -vf scale=270:480 "$WORK/_cs/c_$(printf %02d $i).png"; done
ffmpeg -y -loglevel error -i "$WORK/_cs/c_%02d.png" -vf "tile=8x2:padding=6:color=white" -frames:v 1 -q:v 3 "$WORK/contact.jpg"
rm -rf "$WORK/_cs"
# keep disk modest: drop rendered frame folders (bakes are kept for re-runs)
if [ "${KEEP_FRAMES:-0}" != 1 ]; then rm -f "$R"/raw_*.png "$R"/fin_*.png "$R"/*_data_*.exr; rm -rf "$WORK/intro"; fi
echo "preview: $WORK/preview.mp4"
