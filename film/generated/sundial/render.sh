#!/usr/bin/env bash
set -euo pipefail
SHOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$SHOT_DIR/frames" /tmp/blender-sundial-cache
XDG_CACHE_HOME=/tmp/blender-sundial-cache LP_NUM_THREADS=2 blender -b -t 2 --python "$SHOT_DIR/create_sundial.py" -- render
ffmpeg -hide_banner -y -threads 2 -framerate 4 -i "$SHOT_DIR/frames/%04d.png" -vf 'tpad=stop_mode=clone:stop_duration=0.75,minterpolate=fps=24:mi_mode=mci:mc_mode=obmc:me_mode=bidir:vsbmc=1,trim=duration=8.666667,format=yuv420p' -filter_threads 2 -an -c:v libx264 -preset fast -crf 17 -threads 2 -movflags +faststart -r 24 -t 8.666667 "$SHOT_DIR/sundial.mp4"
cp "$SHOT_DIR/frames/0001.png" "$SHOT_DIR/preview.png"
