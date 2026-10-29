#!/usr/bin/env python3
"""Render the LATIN film locally from licensed, pinned images and moving footage."""
import argparse
import json
import re
from pathlib import Path
import subprocess
import tempfile
import textwrap
from depth_motion import depth_filter

FPS = 24


def run(command):
    subprocess.run(command, check=True)


def media_duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(path)], text=True))


def wrapped(text, columns):
    # Balance two-line titles instead of leaving a single orphan word.
    lines = textwrap.wrap(text, width=columns, break_long_words=False, break_on_hyphens=False)
    if len(lines) == 2:
        words = text.split()
        candidates = []
        for split in range(1, len(words)):
            left, right = ' '.join(words[:split]), ' '.join(words[split:])
            if max(len(left), len(right)) <= columns:
                punctuation = -3 if left.endswith((',', ';', ':')) else 0
                candidates.append((abs(len(left)-len(right)) + punctuation, left, right))
        if candidates:
            _, left, right = min(candidates)
            return left + '\n' + right
    return '\n'.join(lines)


def music_mix(music, index, duration):
    start = float(music.get('start', 0))
    available = media_duration(music['path']) - start
    inputs = ['-threads', '1', '-ss', str(start), '-i', music['path']]
    filters = []
    audio = f'[{index}:a]'
    if duration > available:
        crossfade = float(music.get('loop_crossfade_seconds', 4))
        # Extend an energetic interior phrase, rather than playing the track's
        # closing cadence and restarting its quiet opening halfway through.
        loop_in = float(music.get('loop_in_seconds', 44))
        loop_out = float(music.get('loop_out_seconds', 68))
        if not 0 < crossfade < loop_in < loop_out < available:
            raise SystemExit('Music needs valid interior loop points and crossfade.')
        extended = available + loop_out - loop_in - crossfade
        tempo = extended / duration
        if not .95 <= tempo <= 1.05:
            raise SystemExit('Music needs another documented interior repeat for this duration.')
        # Separate decoders allow the overlapping phrases to advance freely.
        inputs += ['-threads', '1', '-ss', str(start + loop_in), '-i', music['path']]
        filters.append(f'[{index}:a]atrim=duration={loop_out},asetpts=PTS-STARTPTS[loopa]')
        filters.append(f'[{index+1}:a]atrim=duration={available-loop_in},asetpts=PTS-STARTPTS[loopb]')
        filters.append(f'[loopa][loopb]acrossfade=d={crossfade}:c1=qsin:c2=qsin,atempo={tempo:.12f}[music]')
        audio = '[music]'
    filters.append(f'{audio}apad=whole_dur={duration},atrim=duration={duration},asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:st=0:d=1.5,afade=t=out:st={duration-3}:d=3[sound]')
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
    parser.add_argument('--portrait', action='store_true', help='Export the vertical version')
    args = parser.parse_args()
    global FPS
    recipe = json.loads(args.manifest.read_text())
    FPS = int(recipe.get("fps", 24))
    if FPS not in (24, 25, 30, 60):
        raise SystemExit("Unsupported frame rate")
    width, height = (int(recipe.get('portrait_width', 720)), int(recipe.get('portrait_height', 1280))) if args.portrait else (int(recipe.get('width', 1280)), int(recipe.get('height', 720)))
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
        output_width, output_height, output_fps = width, height, FPS
        normalized = []
        for index, (clip, length) in enumerate(zip(clips, lengths)):
            # Retain the established rendering of all unchanged scenes.
            width, height, FPS = (output_width, output_height, output_fps) if clip.get('render_at_output_size') else ((720, 1280, 24) if args.portrait else (1280, 720, 24))
            path = work / f'shot-{index:02}.mp4'
            image = clip.get('type') == 'image'
            speed = float(clip.get('speed', 1))
            if speed <= 0:
                raise SystemExit('Playback speed must be positive.')
            inputs = ['-loop', '1', '-framerate', str(FPS), '-i', clip['path']] if image else ['-ss', str(clip.get('start', 0)), '-t', str(length * speed), '-i', clip['path']]
            source_crop = clip.get('portrait_crop_source', clip.get('crop_source')) if args.portrait else clip.get('crop_source')
            crop = f'crop={int(source_crop[2])}:{int(source_crop[3])}:{int(source_crop[0])}:{int(source_crop[1])},' if source_crop else ''
            framing = f'scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}'
            if not image and clip.get('framing') == 'fit':
                pad_y = float(clip.get('portrait_align_y' if args.portrait else 'align_y', .5))
                if not 0 <= pad_y <= 1:
                    raise SystemExit('Frame alignment must be between zero and one.')
                framing = f'scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)*{pad_y}:black'
            if image:
                # Oversampling keeps slow camera movement smooth at subpixel distances.
                zoom = float(clip.get('zoom', .08))
                progress = f'on/{max(1, int(length * FPS)-1)}'
                z = f'1+{zoom}*({progress})' if index % 2 else f'1+{zoom}*(1-({progress}))'
                fit = clip.get('framing') == 'fit'
                if fit:
                    canvas = f'scale={width*2}:{height*2}:force_original_aspect_ratio=decrease,pad={width*2}:{height*2}:(ow-iw)/2:(oh-ih)/2:black'
                else:
                    canvas = f'scale={width*2}:{height*2}:force_original_aspect_ratio=increase,crop={width*2}:{height*2}'
                # Decode and frame very large telescope photographs once. The
                # lossless canvas avoids decoding a 120MP JPEG for every frame.
                still = work / f'canvas-{index:02}.png'
                run(['ffmpeg', '-hide_banner', '-v', 'error', '-threads', '2', '-i', clip['path'], '-vf', f'{crop}{canvas}', '-filter_threads', '2', '-frames:v', '1', '-threads', '2', str(still)])
                inputs = ['-loop', '1', '-framerate', str(FPS), '-i', str(still)]
                video_filter = f'zoompan=z=\'{z}\':x=\'iw/2-iw/zoom/2\':y=\'ih/2-ih/zoom/2\':d=1:s={width}x{height}:fps={FPS}'
            else:
                video_filter = f'{crop}setpts=(PTS-STARTPTS)/{speed}'
                if clip.get('interpolate'):
                    video_filter += f',minterpolate=fps=24:mi_mode=mci:mc_mode=obmc:me_mode=bidir:vsbmc=1'
                video_filter += ',' + framing
            video_filter += f",setsar=1,eq=saturation={float(clip.get('saturation', .90))}:contrast={float(clip.get('contrast', 1.035))}:brightness=-0.008:gamma={float(clip.get('gamma', 1))},fps={FPS}"
            if clip.get('luma_curve'):
                video_filter += f",curves=all='{clip['luma_curve']}'"
            if clip.get('motion', recipe.get('motion')) == 'orbital-depth':
                video_filter += ',' + depth_filter(width, height, length, index, FPS, .8)
            # Bias the optical shade upward to protect lower-third captions.
            video_filter += f',vignette=angle=PI/3:x0=w/2:y0=h*.15,tpad=stop_mode=clone:stop_duration=1,trim=duration={length},format=yuv420p'
            run(['ffmpeg', '-hide_banner', '-v', 'error', '-threads', '2', *inputs, '-vf', video_filter, '-filter_threads', '2', '-an', '-t', str(length), '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', str(path)])
            normalized.append(path)
            print(f'Shot {index+1}/{len(clips)} ready', flush=True)
        width, height, FPS = output_width, output_height, output_fps
        inputs = []
        filters = []
        for index, path in enumerate(normalized):
            inputs += ['-threads', '1', '-i', str(path)]
            filters.append(f'[{index}:v]settb=AVTB,setpts=PTS-STARTPTS,scale={width}:{height}:flags=lanczos,fps={FPS}[v{index}]')
        last, running = 'v0', lengths[0]
        for index in range(1, len(clips)):
            label = f'mix{index}'
            filters.append(f'[{last}][v{index}]xfade=transition=fade:duration={dissolve}:offset={running-dissolve},fps={FPS}[{label}]')
            last, running = label, running + lengths[index] - dissolve
        # The quote, French translation and author share a single readable composition.
        text_scale = width / (720 if args.portrait else 1280)
        typography = f'[{last}]drawbox=x=0:y=0:w=iw:h=ih:color=black@0.10:t=fill'
        for index, title in enumerate(recipe.get('titles', [])):
            start, end = float(title['start']), float(title['end'])
            kind = title.get('kind', 'quote')
            if kind == 'quote':
                size = 48 if args.portrait else 56
                if len(title['text']) < 12:
                    size = 64 if args.portrait else 76
                quote = wrapped(title['text'], 24 if args.portrait else 37)
                lines = quote.count('\n') + 1
                y = '(h-text_h)/2+100'
                rows = [(quote, size, serif, y, '0xf8f5f0', 12)]
                translation = wrapped(title['translation'], 35 if args.portrait else 66)
                trans_y = f'h/2+{100 + (lines*size+(lines-1)*12)/2 + 22}'
                rows.append((translation, 25, font, trans_y, '0xe8e3d8', 8))
                author_y = f'{trans_y}+{(translation.count(chr(10))+1)*34+26}'
                rows.append((title['author'], 16, font, author_y, '0xc4c7d0', 0))
            else:
                size = (118 if args.portrait else 156) if kind == 'brand' else (30 if args.portrait else 36)
                rows = [(title['text'], size, font, title.get('y', '(h-text_h)/2'), '0xf8f5f0', 0)]
            for row_index, (text, size, family, y, color, spacing) in enumerate(rows):
                textfile = work / f'title-{index}-{row_index}.txt'
                textfile.write_text(text)
                size *= text_scale
                spacing *= text_scale
                y = re.sub(r'\b(h|text_h)\b', lambda m: f'({m[0]}/{text_scale})', y)
                y = f'({y})*{text_scale}'
                delay = .12 * row_index
                a, b = start + delay, end
                alpha = f"if(lt(t,{a}),0,if(lt(t,{a+.65}),(t-{a})/.65,if(lt(t,{b-.5}),1,if(lt(t,{b}),({b}-t)/.5,0))))"
                typography += f",drawtext=fontfile='{family}':textfile='{textfile}':expansion=none:fontsize={size}:fontcolor={color}:line_spacing={spacing}:text_align=C:shadowcolor=black@0.6:shadowx=1:shadowy=2:x=(w-text_w)/2:y='({y})+{18*text_scale}*(1-clip((t-{a})/.85,0,1))':alpha='{alpha}'"
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
