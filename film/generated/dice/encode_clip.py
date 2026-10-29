"""Encode the reviewed existing-die render without optical-flow interpolation."""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent)
parser.add_argument('--overwrite', action='store_true')
args = parser.parse_args()
out = args.output.resolve()
report = json.loads((out / 'motion-verification.json').read_text())
fps, total = report['fps'], report['total_frames']
step, end = report['render']['render_step'], report['moving_end_frame']
frame_numbers = list(range(1, end+1, step))
if frame_numbers[-1] != end:
    frame_numbers.append(end)
frames = [out / 'frames' / f'dice_{number:04d}.png' for number in frame_numbers]
if not all(path.is_file() for path in frames):
    raise SystemExit('Incomplete source render; all scheduled frames must exist.')
with frames[0].open('rb') as stream:
    header = stream.read(24)
if header[:8] != b'\x89PNG\r\n\x1a\n':
    raise SystemExit('Expected rendered PNG frames.')
width, height = struct.unpack('>II', header[16:24])
movie = out / 'dice.mp4'
if movie.exists() and not args.overwrite:
    raise SystemExit('Output exists; review it before using --overwrite.')
lines = ['ffconcat version 1.0']
for i, path in enumerate(frames):
    next_frame = frame_numbers[i+1] if i+1 < len(frames) else total+1
    lines.extend([f"file '{path}'", f'option framerate {fps}', f'duration {(next_frame-frame_numbers[i])/fps:.12f}'])
lines.extend([f"file '{frames[-1]}'", f'option framerate {fps}'])
concat = out / 'source.ffconcat'
concat.write_text('\n'.join(lines)+'\n')
subprocess.run([
    'ffmpeg', '-y' if args.overwrite else '-n', '-hide_banner', '-v', 'warning',
    '-filter_threads', '2', '-safe', '0', '-f', 'concat', '-i', str(concat),
    '-vf', f'fps={fps},format=yuv420p', '-frames:v', str(total),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-threads', '4',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', '-an', str(movie)
], check=True)
streams = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,nb_frames,width,height,r_frame_rate,duration', '-of', 'json', str(movie)
], text=True))['streams']
if len(streams) != 1 or streams[0]['nb_frames'] != str(total) or abs(float(streams[0]['duration'])-total/fps) > .001:
    raise SystemExit('Unexpected encoded duration/frame count.')
provenance = {
    'type': 'animation of the existing original procedural die',
    'title': 'Alea — ivory die, airborne throw, impacts and settling',
    'creator': 'LATIN project',
    'source_assets': 'Existing ivory die mesh with inset pips, slate, lights and camera retained. No additional objects or environment.',
    'software': ['Blender 4.3.2 EEVEE Next', 'FFmpeg'],
    'delivered_file': 'dice.mp4', 'delivery_resolution': [width, height],
    'native_render_resolution': [width, height], 'delivery_fps': fps,
    'source_fps': fps/step, 'rendered_frames': len(frames), 'frames': total,
    'duration_seconds': total/fps, 'has_audio': False,
    'processing': 'Genuine per-pose renders; cadence duplication only, without optical flow. The stationary final pose is held after 3.35 seconds. Existing scene only.',
    'animation': 'Ballistic launch with multi-axis tumble; contacts at 1.00, 1.72 and 2.15 seconds; damped edge rocking until 3.35 seconds. Convex mesh support sampled at 60 Hz.',
    'render_samples': report['render']['samples'], 'stationary_pose_samples': max(16, report['render']['samples']),
    'motion_blur': False, 'minimum_floor_clearance': report['minimum_floor_clearance'],
    'reproducible_scene_script': 'create_scene.py', 'reproducible_encode_script': 'encode_clip.py',
    'sha256': hashlib.file_digest(movie.open('rb'), 'sha256').hexdigest()
}
(out / 'provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n')
print(movie)
