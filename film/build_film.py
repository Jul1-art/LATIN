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
    args = parser.parse_args()
    recipe = json.loads(args.manifest.read_text())
    clips = recipe.get('clips', [])
    if len(clips) < 3:
        raise SystemExit('Provide at least three verified moving archive shots in the manifest.')
    music = recipe['music']
    for item in [*clips, music]:
        if not all(item.get(key) for key in ('path', 'source_url', 'license', 'license_url')):
            raise SystemExit('Every source needs its local path, provenance URL and verified license URL.')
        if not Path(item['path']).is_file():
            raise SystemExit(f"Missing source: {item['path']}")
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
            inputs += ['-ss', str(float(clip.get('start', 0))), '-t', str(length), '-i', clip['path']]
            filters.append(f'[{index}:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,format=yuv420p,setpts=PTS-STARTPTS,eq=saturation=0.18:contrast=1.06:brightness=-0.025,fps=24[v{index}]')
        inputs += ['-ss', str(float(music.get('start', 0))), '-i', music['path']]
        last = 'v0'
        running = durations[0]
        for index in range(1, len(clips)):
            label = f'mix{index}'
            filters.append(f'[{last}][v{index}]xfade=transition=fade:duration={dissolve}:offset={running-dissolve},fps=24[{label}]')
            last = label
            running += durations[index] - dissolve
        texts = [('Carpe diem.', 2.5, 6.7, 64, serif, '(h-text_h)/2'), ('LATIN.', duration-4.5, duration-0.6, 142, font, '(h-text_h)/2-30'), ('Pour la vie.', duration-4.1, duration-0.6, 34, font, '(h-text_h)/2+80')]
        typography = f'[{last}]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.12:t=fill'
        for index, (text, start, end, size, family, y) in enumerate(texts):
            textfile = work / f'title-{index}.txt'
            textfile.write_text(text)
            alpha = f"if(lt(t,{start}),0,if(lt(t,{start+.5}),(t-{start})/.5,if(lt(t,{end-.5}),1,if(lt(t,{end}),({end}-t)/.5,0))))"
            typography += f",drawtext=fontfile='{family}':textfile='{textfile}':fontsize={size}:fontcolor=0xf8f5f0:x=(w-text_w)/2:y={y}:alpha='{alpha}'"
        typography += f',fade=t=in:st=0:d=0.5,fade=t=out:st={duration-.7}:d=0.7[film]'
        filters.append(typography)
        filters.append(f'[{len(clips)}:a]atrim=duration={duration},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:st=0:d=1.2,afade=t=out:st={duration-2}:d=2[sound]')
        filterfile = work / 'filters.txt'
        filterfile.write_text(';\n'.join(filters))
        run(['ffmpeg', '-hide_banner', '-v', 'warning', '-threads', '2', *inputs, '-filter_complex_threads', '2', '-filter_complex', filterfile.read_text(), '-map', '[film]', '-map', '[sound]', '-t', str(duration), '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-metadata', 'title=LATIN — Pour la vie', str(movie)])
        run(['ffmpeg', '-hide_banner', '-v', 'error', '-ss', '1.8', '-i', str(movie), '-frames:v', '1', '-q:v', '85', str(poster)])
    provenance = dict(recipe)
    provenance['render'] = {'duration': duration, 'size': '1280x720', 'fps': 24, 'transforms': 'trim, crop, restrained desaturation, dissolves, titles, music loudness normalization and fades'}
    (output / 'latin-intro-sources.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n')
    print(movie)


if __name__ == '__main__':
    main()
