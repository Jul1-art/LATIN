#!/usr/bin/env python3
"""Render the LATIN film from verified, downloaded archive clips. No network calls."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile


def run(args):
    subprocess.run(args, check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('manifest', type=Path)
    parser.add_argument('output_directory', type=Path)
    parser.add_argument('--portrait', action='store_true', help='Export the mobile 720x1280 version')
    args = parser.parse_args()
    recipe = json.loads(args.manifest.read_text())
    if args.portrait:
        recipe.update(width=720, height=1280)
    clips = recipe.get('clips', [])
    if len(clips) < 3:
        raise SystemExit('Provide at least three verified moving archive shots in the manifest.')
    music = recipe['music']
    for item in [*clips, music]:
        if not all(item.get(key) for key in ('path', 'source_url', 'license', 'license_url')):
            raise SystemExit('Every source needs its local path, provenance URL and verified license URL.')
        if not Path(item['path']).is_file():
            raise SystemExit(f"Missing source: {item['path']}")
    width = int(recipe.get('width', 1280))
    height = int(recipe.get('height', 720))
    if min(width, height) < 240 or width % 2 or height % 2:
        raise SystemExit('Output dimensions must be even and at least 240 pixels.')
    dissolve = 0.35
    durations = [float(clip.get('duration', 4.4)) for clip in clips]
    if any(duration <= dissolve * 2 for duration in durations):
        raise SystemExit('Each shot must exceed twice the dissolve duration.')
    duration = sum(durations) - dissolve * (len(clips) - 1)
    output = args.output_directory
    output.mkdir(parents=True, exist_ok=True)
    movie = output / 'latin-intro.mp4'
    poster = output / 'latin-intro-poster.webp'
    if movie.exists() or poster.exists():
        raise SystemExit('Output already exists; review it before choosing another output directory.')
    font = subprocess.check_output(['fc-match', 'Liberation Sans', '-f', '%{file}'], text=True).strip()
    serif = subprocess.check_output(['fc-match', 'Liberation Serif', '-f', '%{file}'], text=True).strip()
    with tempfile.TemporaryDirectory(prefix='latin-film-') as workdir:
        work = Path(workdir)
        inputs = []
        filters = []
        for index, (clip, length) in enumerate(zip(clips, durations)):
            speed = float(clip.get('speed', 1))
            if speed <= 0:
                raise SystemExit('Playback speed must be positive.')
            inputs += ['-threads', '2', '-ss', str(float(clip.get('start', 0))), '-t', str(length * speed), '-i', clip['path']]
            normalize = f'setpts=(PTS-STARTPTS)/{speed},setsar=1'
            grade = f"eq=saturation={float(clip.get('saturation', 0.7))}:contrast=1.06:brightness=-0.025,fps=24,format=yuv420p"
            if clip.get('framing') == 'portrait':
                filters.append(f'[{index}:v]{normalize},split=2[bg{index}][fg{index}]')
                filters.append(f'[bg{index}]scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},boxblur=32:2,eq=brightness=-0.25[back{index}]')
                filters.append(f'[fg{index}]scale=-2:{height}[front{index}]')
                filters.append(f'[back{index}][front{index}]overlay=(W-w)/2:0,{grade}[v{index}]')
            else:
                filters.append(f'[{index}:v]{normalize},scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},{grade}[v{index}]')
        inputs += ['-threads', '1', '-ss', str(float(music.get('start', 0))), '-i', music['path']]
        last = 'v0'
        running = durations[0]
        for index in range(1, len(clips)):
            label = f'mix{index}'
            filters.append(f'[{last}][v{index}]xfade=transition=fade:duration={dissolve}:offset={running-dissolve},fps=24[{label}]')
            last = label
            running += durations[index] - dissolve
        default_titles = [
            {'text': 'Carpe diem.', 'start': 2.5, 'end': 6.7, 'size': 64, 'serif': True},
            {'text': 'LATIN.', 'start': duration-4.5, 'end': duration-0.6, 'size': 142, 'y': '(h-text_h)/2-30'},
            {'text': 'Pour la vie.', 'start': duration-4.1, 'end': duration-0.6, 'size': 34, 'y': '(h-text_h)/2+80'}
        ]
        texts = [(t['text'], float(t['start']), float(t['end']), int(t.get('size', 64)), serif if t.get('serif') else font, t.get('y', '(h-text_h)/2')) for t in recipe.get('titles', default_titles)]
        typography = f'[{last}]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.12:t=fill'
        for index, (text, start, end, size, family, y) in enumerate(texts):
            textfile = work / f'title-{index}.txt'
            textfile.write_text(text)
            alpha = f"if(lt(t,{start}),0,if(lt(t,{start+.5}),(t-{start})/.5,if(lt(t,{end-.5}),1,if(lt(t,{end}),({end}-t)/.5,0))))"
            typography += f",drawtext=fontfile='{family}':textfile='{textfile}':fontsize={size}:fontcolor=0xf8f5f0:shadowcolor=black@0.6:shadowx=1:shadowy=2:x=(w-text_w)/2:y={y}:alpha='{alpha}'"
        typography += f',fade=t=in:st=0:d=0.5,fade=t=out:st={duration-.7}:d=0.7[film]'
        filters.append(typography)
        filters.append(f'[{len(clips)}:a]atrim=duration={duration},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:st=0:d=1.2,afade=t=out:st={duration-2}:d=2[sound]')
        filterfile = work / 'filters.txt'
        filterfile.write_text(';\n'.join(filters))
        run(['ffmpeg', '-hide_banner', '-v', 'warning', '-threads', '2', *inputs, '-filter_complex_threads', '2', '-filter_complex', filterfile.read_text(), '-map', '[film]', '-map', '[sound]', '-t', str(duration), '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '23', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-metadata', 'title=LATIN — Pour la vie', str(movie)])
        run(['ffmpeg', '-hide_banner', '-v', 'error', '-ss', '1.8', '-i', str(movie), '-frames:v', '1', '-q:v', '85', str(poster)])
    provenance = dict(recipe)
    provenance['render'] = {'duration': duration, 'size': f'{width}x{height}', 'fps': 24, 'transforms': 'trim, crop, portrait framing or triptych, documented speed changes, grading, dissolves, titles, music normalization and fades'}
    (output / 'latin-intro-sources.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n')
    print(movie)


if __name__ == '__main__':
    main()
