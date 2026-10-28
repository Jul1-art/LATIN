#!/usr/bin/env python3
"""Render the LATIN film locally from licensed, pinned images and moving footage."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile
import textwrap

FPS = 24


def run(command):
    subprocess.run(command, check=True)


def media_duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(path)], text=True))


def wrapped(text, columns):
    return '\n'.join(textwrap.wrap(text, width=columns, break_long_words=False, break_on_hyphens=False))


def music_mix(music, index, duration):
    start = float(music.get('start', 0))
    available = media_duration(music['path']) - start
    inputs = ['-threads', '1', '-ss', str(start), '-i', music['path']]
    filters = []
    audio = f'[{index}:a]'
    if duration > available:
        crossfade = float(music.get('loop_crossfade_seconds', 4))
        if crossfade <= 0 or duration > available * 2 - crossfade:
            raise SystemExit('Music needs another documented repeat for this duration.')
        # Independent inputs let acrossfade consume the second recording after
        # the first. Splitting one live input can truncate it at the overlap.
        inputs += ['-threads', '1', '-ss', str(start), '-i', music['path']]
        filters.append(f'[{index}:a]asetpts=PTS-STARTPTS[loopa]')
        filters.append(f'[{index+1}:a]asetpts=PTS-STARTPTS[loopb]')
        filters.append(f'[loopa][loopb]acrossfade=d={crossfade}:c1=tri:c2=tri[music]')
        audio = '[music]'
    filters.append(f'{audio}atrim=duration={duration},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:st=0:d=1.5,afade=t=out:st={duration-3}:d=3[sound]')
    return inputs, filters


def check_export(path, duration):
    metadata = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,duration',
        '-of', 'json', str(path)
    ], text=True))
    streams = {stream['codec_type']: float(stream.get('duration', 0)) for stream in metadata['streams']}
    if any(abs(streams.get(kind, 0) - duration) > .1 for kind in ('video', 'audio')):
        raise SystemExit(f'Incomplete export: expected {duration}s of video and audio, got {streams}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('manifest', type=Path)
    parser.add_argument('output_directory', type=Path)
    parser.add_argument('--portrait', action='store_true', help='Export the mobile 720x1280 version')
    args = parser.parse_args()
    recipe = json.loads(args.manifest.read_text())
    width, height = (720, 1280) if args.portrait else (int(recipe.get('width', 1280)), int(recipe.get('height', 720)))
    if min(width, height) < 240 or width % 2 or height % 2:
        raise SystemExit('Output dimensions must be even and at least 240 pixels.')
    clips = recipe.get('clips', [])
    music = recipe['music']
    if len(clips) < 3:
        raise SystemExit('Provide at least three documented shots.')
    for item in [*clips, music]:
        if not all(item.get(key) for key in ('path', 'source_url', 'license', 'license_url')):
            raise SystemExit('Every source needs its local path, provenance URL and license URL.')
        if not Path(item['path']).is_file():
            raise SystemExit(f"Missing source: {item['path']}")
    dissolve = float(recipe.get('dissolve', .5))
    lengths = [float(clip['duration']) for clip in clips]
    if any(length <= dissolve * 2 for length in lengths):
        raise SystemExit('Each shot must exceed twice the dissolve duration.')
    duration = sum(lengths) - dissolve * (len(clips) - 1)
    output = args.output_directory
    output.mkdir(parents=True, exist_ok=True)
    movie, poster = output / 'latin-intro.mp4', output / 'latin-intro-poster.webp'
    if movie.exists() or poster.exists():
        raise SystemExit('Output already exists; choose another output directory.')
    font = subprocess.check_output(['fc-match', 'Liberation Sans', '-f', '%{file}'], text=True).strip()
    serif = subprocess.check_output(['fc-match', 'Liberation Serif', '-f', '%{file}'], text=True).strip()
    with tempfile.TemporaryDirectory(prefix='latin-film-') as directory:
        work = Path(directory)
        # Normalize one shot at a time so a longer film does not decode all sources at once.
        normalized = []
        for index, (clip, length) in enumerate(zip(clips, lengths)):
            path = work / f'shot-{index:02}.mp4'
            image = clip.get('type') == 'image'
            speed = float(clip.get('speed', 1))
            if speed <= 0:
                raise SystemExit('Playback speed must be positive.')
            inputs = ['-loop', '1', '-framerate', str(FPS), '-i', clip['path']] if image else ['-ss', str(clip.get('start', 0)), '-t', str(length * speed), '-i', clip['path']]
            source_crop = clip.get('crop_source')
            crop = f'crop={int(source_crop[2])}:{int(source_crop[3])}:{int(source_crop[0])}:{int(source_crop[1])},' if source_crop else ''
            framing = f'scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}'
            if image:
                # Oversampling keeps slow camera movement smooth at subpixel distances.
                zoom = float(clip.get('zoom', .08))
                progress = f'on/{max(1, int(length * FPS)-1)}'
                z = f'1+{zoom}*({progress})' if index % 2 else f'1+{zoom}*(1-({progress}))'
                video_filter = f'{crop}scale={width*2}:{height*2}:force_original_aspect_ratio=increase,crop={width*2}:{height*2},zoompan=z=\'{z}\':x=\'iw/2-iw/zoom/2\':y=\'ih/2-ih/zoom/2\':d=1:s={width}x{height}:fps={FPS}'
            else:
                video_filter = f'{crop}setpts=(PTS-STARTPTS)/{speed},{framing}'
            video_filter += f",setsar=1,eq=saturation={float(clip.get('saturation', .65))}:contrast=1.04:brightness=-0.02,fps={FPS},format=yuv420p"
            run(['ffmpeg', '-hide_banner', '-v', 'error', '-threads', '2', *inputs, '-vf', video_filter, '-filter_threads', '2', '-an', '-t', str(length), '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', str(path)])
            normalized.append(path)
            print(f'Shot {index+1}/{len(clips)} ready', flush=True)
        inputs = []
        filters = []
        for index, path in enumerate(normalized):
            inputs += ['-threads', '1', '-i', str(path)]
            filters.append(f'[{index}:v]settb=AVTB,setpts=PTS-STARTPTS,fps={FPS}[v{index}]')
        last, running = 'v0', lengths[0]
        for index in range(1, len(clips)):
            label = f'mix{index}'
            filters.append(f'[{last}][v{index}]xfade=transition=fade:duration={dissolve}:offset={running-dissolve},fps={FPS}[{label}]')
            last, running = label, running + lengths[index] - dissolve
        # The quote, French translation and author share a single readable composition.
        typography = f'[{last}]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.36:t=fill'
        for index, title in enumerate(recipe.get('titles', [])):
            start, end = float(title['start']), float(title['end'])
            kind = title.get('kind', 'quote')
            if kind == 'quote':
                size = 52 if args.portrait else 68
                if len(title['text']) < 12:
                    size = 86 if args.portrait else 112
                quote = wrapped(title['text'], 23 if args.portrait else 36)
                lines = quote.count('\n') + 1
                y = f'(h-text_h)/2-{42 if args.portrait else 38}'
                rows = [(quote, size, serif, y, '0xf8f5f0', 12)]
                translation = wrapped(title['translation'], 35 if args.portrait else 66)
                trans_y = f'h/2+{(lines*size+(lines-1)*12)/2 + (12 if args.portrait else 10)}'
                rows.append((translation, 25 if args.portrait else 28, font, trans_y, '0xe8e3d8', 8))
                author_y = f'{trans_y}+{(translation.count(chr(10))+1)*34+26}'
                rows.append((title['author'], 16 if args.portrait else 17, font, author_y, '0xbca979', 0))
            else:
                size = (118 if args.portrait else 156) if kind == 'brand' else (30 if args.portrait else 36)
                rows = [(title['text'], size, font, title.get('y', '(h-text_h)/2'), '0xf8f5f0', 0)]
            for row_index, (text, size, family, y, color, spacing) in enumerate(rows):
                textfile = work / f'title-{index}-{row_index}.txt'
                textfile.write_text(text)
                delay = .12 * row_index
                a, b = start + delay, end
                alpha = f"if(lt(t,{a}),0,if(lt(t,{a+.65}),(t-{a})/.65,if(lt(t,{b-.5}),1,if(lt(t,{b}),({b}-t)/.5,0))))"
                typography += f",drawtext=fontfile='{family}':textfile='{textfile}':expansion=none:fontsize={size}:fontcolor={color}:line_spacing={spacing}:text_align=C:shadowcolor=black@0.6:shadowx=1:shadowy=2:x=(w-text_w)/2:y='({y})+18*(1-clip((t-{a})/.85,0,1))':alpha='{alpha}'"
        typography += f',fade=t=in:st=0:d=0.8,fade=t=out:st={duration-1.2}:d=1.2[film]'
        filters.append(typography)
        music_inputs, music_filters = music_mix(music, len(clips), duration)
        inputs += music_inputs
        filters += music_filters
        run(['ffmpeg', '-hide_banner', '-v', 'warning', *inputs, '-filter_complex_threads', '2', '-filter_complex', ';\n'.join(filters), '-map', '[film]', '-map', '[sound]', '-t', str(duration), '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '23', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-metadata', 'title=LATIN — Pour la vie', str(movie)])
        check_export(movie, duration)
        run(['ffmpeg', '-hide_banner', '-v', 'error', '-ss', '1.8', '-i', str(movie), '-frames:v', '1', '-q:v', '85', str(poster)])
    provenance = dict(recipe)
    provenance['render'] = {'duration': round(duration, 3), 'size': f'{width}x{height}', 'fps': FPS, 'transforms': 'documented excerpts, animated still images, cropping, slow motion, color grading, crossfades, all thirteen quotes and translations, music crossfade and normalization'}
    (output / 'latin-intro-sources.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n')
    print(movie)


if __name__ == '__main__':
    main()
