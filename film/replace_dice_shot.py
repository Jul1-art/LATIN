#!/usr/bin/env python3
"""Replace only the dice shot in the published 4K film, without a full rebuild.

The source film is recovered from a pinned Git revision. Only the closed GOPs
covering the dice shot are encoded again; video slices elsewhere and the entire
AAC soundtrack are copied and verified. The two adjacent dissolve backgrounds
are reconstructed from the existing, checksum-pinned photographic sources.

Run from any directory:
    python3 film/replace_dice_shot.py film/render/dice-update
    # --format landscape / portrait can run independently in parallel.
"""
import argparse
from fractions import Fraction
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess

from build_film import wrapped
from depth_motion import depth_filter


ROOT = Path(__file__).resolve().parents[1]
BASE_REVISION = 'e04203a2a4c451c8e3bcd8dc9e56e52db28487a1'
FPS = 60


def run(args, **kwargs):
    subprocess.run([str(arg) for arg in args], check=True, **kwargs)


def capture(args):
    return subprocess.check_output([str(arg) for arg in args], text=True)


def probe(path):
    return json.loads(capture(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]))


def digest(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def baseline_file(revision, relative, destination):
    blob = capture(['git', 'rev-parse', f'{revision}:{relative}']).strip()
    if destination.exists() and capture(['git', 'hash-object', destination]).strip() == blob:
        return destination
    temporary = destination.with_suffix('.partial')
    with temporary.open('wb') as stream:
        run(['git', 'cat-file', 'blob', blob], stdout=stream)
    if capture(['git', 'hash-object', temporary]).strip() != blob:
        raise SystemExit(f'Baseline extraction failed: {relative}')
    temporary.replace(destination)
    return destination


def keyframes(path, time_base):
    data = json.loads(capture([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-skip_frame', 'nokey',
        '-show_entries', 'frame=pts', '-of', 'json', path
    ]))
    result = []
    for frame in data['frames']:
        position = Fraction(int(frame['pts'])) * time_base * FPS
        if position.denominator != 1:
            raise SystemExit('The baseline keyframes are not aligned to the 60 fps timeline.')
        result.append(int(position))
    return result


def video_packets(path):
    data = json.loads(capture([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_packets',
        '-show_entries', 'packet=pts,dts,pos,size,flags', '-of', 'json', path
    ]))
    # MP4 may gain repeated SPS/PPS/SEI at concatenation boundaries. Compare the
    # actual H.264 picture slices, independently of that parameter packaging.
    with Path(path).open('rb') as stream:
        for packet in data['packets']:
            stream.seek(int(packet['pos']))
            payload = stream.read(int(packet['size']))
            offset = 0
            picture = hashlib.sha256()
            slices = 0
            while offset < len(payload):
                if offset + 4 > len(payload):
                    raise SystemExit('Incomplete AVCC packet.')
                length = int.from_bytes(payload[offset:offset + 4], 'big')
                offset += 4
                nal = payload[offset:offset + length]
                if not nal or len(nal) != length:
                    raise SystemExit('Invalid AVCC NAL length.')
                if 1 <= (nal[0] & 31) <= 5:
                    picture.update(length.to_bytes(4, 'big'))
                    picture.update(nal)
                    slices += 1
                offset += length
            if not slices:
                raise SystemExit('Video packet has no encoded picture.')
            packet['picture_sha256'] = picture.hexdigest()
    return data['packets']


def audio_hash(path):
    return capture([
        'ffmpeg', '-v', 'error', '-i', path, '-map', '0:a:0', '-c', 'copy',
        '-f', 'hash', '-hash', 'sha256', '-'
    ]).strip().split('=', 1)[1]


def audio_timing(path):
    return json.loads(capture([
        'ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_packets',
        '-show_entries', 'packet=pts,dts,duration,size,side_data_list', '-of', 'json', path
    ]))['packets']


def normalized_neighbor(clip, index, portrait, cache, threads):
    """Reproduce the original 720p/24 photographic shot before titles."""
    width, height = (720, 1280) if portrait else (1280, 720)
    source = Path(clip['path'])
    source_hash = digest(source)
    pins = json.loads((ROOT / 'film/source-files.json').read_text())
    pin = next((entry for entry in pins if entry['file'] == source.name), None)
    if not pin or source_hash != pin['sha256']:
        raise SystemExit(f'Original neighbor source checksum does not match its pinned record: {source}')
    identity = {'clip': clip, 'index': index, 'portrait': portrait, 'source_sha256': source_hash}
    signature = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()
    target = cache / f'neighbor-{index}-{signature[:16]}.mp4'
    record = target.with_suffix('.json')
    if target.exists() and record.exists() and json.loads(record.read_text()).get('sha256') == digest(target):
        return target
    length = float(clip['duration'])
    source_crop = clip.get('portrait_crop_source', clip.get('crop_source')) if portrait else clip.get('crop_source')
    crop = f'crop={source_crop[2]}:{source_crop[3]}:{source_crop[0]}:{source_crop[1]},' if source_crop else ''
    fit = clip.get('framing') == 'fit'
    if fit:
        canvas_filter = f'scale={width*2}:{height*2}:force_original_aspect_ratio=decrease,pad={width*2}:{height*2}:(ow-iw)/2:(oh-ih)/2:black'
    else:
        canvas_filter = f'scale={width*2}:{height*2}:force_original_aspect_ratio=increase,crop={width*2}:{height*2}'
    still = cache / f'canvas-{index}-{signature[:16]}.png'
    run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-threads', threads, '-i', source,
         '-vf', crop + canvas_filter, '-filter_threads', threads, '-frames:v', 1, '-threads', threads, still])
    progress = f'on/{max(1, int(length * 24)-1)}'
    zoom = float(clip.get('zoom', .08))
    z = f'1+{zoom}*({progress})' if index % 2 else f'1+{zoom}*(1-({progress}))'
    filters = f"zoompan=z='{z}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={width}x{height}:fps=24"
    filters += f",setsar=1,eq=saturation={float(clip.get('saturation', .90))}:contrast={float(clip.get('contrast', 1.035))}:brightness=-0.008:gamma={float(clip.get('gamma', 1))},fps=24"
    if clip.get('luma_curve'):
        filters += f",curves=all='{clip['luma_curve']}'"
    if clip.get('motion', 'orbital-depth') == 'orbital-depth':
        filters += ',' + depth_filter(width, height, length, index, 24, .8)
    filters += f',vignette=angle=PI/3:x0=w/2:y0=h*.15,tpad=stop_mode=clone:stop_duration=1,trim=duration={length},format=yuv420p'
    run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-threads', threads,
         '-loop', 1, '-framerate', 24, '-i', still, '-vf', filters, '-filter_threads', threads,
         '-an', '-t', length, '-c:v', 'libx264', '-threads', threads, '-preset', 'fast', '-crf', 19, '-pix_fmt', 'yuv420p', target])
    record.write_text(json.dumps({'identity': identity, 'sha256': digest(target)}, indent=2) + '\n')
    print(f'Original neighbor {index} ready ({"portrait" if portrait else "landscape"}).', flush=True)
    return target


def caption_filter(recipe, start, end, width, portrait, work):
    """Use exactly the same strings, layout, fades and fonts as build_film.py."""
    font = capture(['fc-match', 'Liberation Sans', '-f', '%{file}']).strip()
    serif = capture(['fc-match', 'Liberation Serif', '-f', '%{file}']).strip()
    scale = width / (720 if portrait else 1280)
    result = 'drawbox=x=0:y=0:w=iw:h=ih:color=black@0.10:t=fill'
    for index, title in enumerate(recipe['titles']):
        if float(title['end']) <= start or float(title['start']) >= end:
            continue
        if title.get('kind', 'quote') == 'quote':
            size = 48 if portrait else 56
            if len(title['text']) < 12:
                size = 64 if portrait else 76
            quote = wrapped(title['text'], 24 if portrait else 37)
            lines = quote.count('\n') + 1
            translation = wrapped(title['translation'], 35 if portrait else 66)
            trans_y = f'h/2+{100 + (lines*size+(lines-1)*12)/2 + 22}'
            author_y = f'{trans_y}+{(translation.count(chr(10))+1)*34+26}'
            rows = [(quote, size, serif, '(h-text_h)/2+100', '0xf8f5f0', 12),
                    (translation, 25, font, trans_y, '0xe8e3d8', 8),
                    (title['author'], 16, font, author_y, '0xc4c7d0', 0)]
        else:
            size = (118 if portrait else 156) if title.get('kind') == 'brand' else (30 if portrait else 36)
            rows = [(title['text'], size, font, title.get('y', '(h-text_h)/2'), '0xf8f5f0', 0)]
        for row_index, (text, size, family, y, color, spacing) in enumerate(rows):
            textfile = work / f'title-{index}-{row_index}.txt'
            textfile.write_text(text)
            y = re.sub(r'\b(h|text_h)\b', lambda m: f'({m[0]}/{scale})', y)
            y = f'({y})*{scale}'
            a, b = float(title['start']) + .12 * row_index - start, float(title['end']) - start
            alpha = f'if(lt(t,{a}),0,if(lt(t,{a+.65}),(t-{a})/.65,if(lt(t,{b-.5}),1,if(lt(t,{b}),({b}-t)/.5,0))))'
            result += f",drawtext=fontfile='{family}':textfile='{textfile}':expansion=none:fontsize={size*scale}:fontcolor={color}:line_spacing={spacing*scale}:text_align=C:shadowcolor=black@0.6:shadowx=1:shadowy=2:x=(w-text_w)/2:y='({y})+{18*scale}*(1-clip((t-{a})/.85,0,1))':alpha='{alpha}'"
    return result


def replace_format(args, recipe, original_recipe, revision, portrait):
    name = 'portrait' if portrait else 'landscape'
    filename = 'latin-intro-mobile.mp4' if portrait else 'latin-intro.mp4'
    work = args.output_directory / f'work-{name}'
    work.mkdir(parents=True, exist_ok=True)
    target = args.output_directory / filename
    if target.exists():
        raise SystemExit(f'Output already exists: {target}')
    baseline = baseline_file(revision, 'assets/' + filename, work / 'baseline.mp4')
    info = probe(baseline)
    video = next(s for s in info['streams'] if s['codec_type'] == 'video')
    width, height = int(video['width']), int(video['height'])
    if Fraction(video['avg_frame_rate']) != FPS or video.get('nal_length_size') != '4':
        raise SystemExit('This patcher requires the existing AVCC H.264 60 fps exports.')
    total_frames = int(video['nb_frames'])
    clip_index = 3
    clip = recipe['clips'][clip_index]
    dissolve = float(recipe['dissolve'])
    start = sum(float(c['duration']) for c in recipe['clips'][:clip_index]) - clip_index * dissolve
    length = float(clip['duration'])
    end = start + length
    start_frame, end_frame = round(start * FPS), round(end * FPS)
    keys = keyframes(baseline, Fraction(video['time_base']))
    first = max(k for k in keys if k <= start_frame)
    last = min(k for k in keys if k >= end_frame)
    count = last - first
    time_start, time_end = first / FPS, last / FPS
    print(f'{name}: replacing {start:.3f}–{end:.3f}s; encoding only {time_start:.6f}–{time_end:.6f}s.', flush=True)
    cache = work / 'normalized'
    cache.mkdir(exist_ok=True)
    before = normalized_neighbor(original_recipe['clips'][2], 2, portrait, cache, args.threads)
    after = normalized_neighbor(original_recipe['clips'][4], 4, portrait, cache, args.threads)
    source = args.portrait_source if portrait and args.portrait_source else (args.source or Path(clip['path']))
    source = source.resolve()
    source_info = probe(source)
    if float(source_info['format']['duration']) + .001 < float(clip.get('start', 0)) + length * float(clip.get('speed', 1)):
        raise SystemExit('New dice source is shorter than the required shot.')
    source_crop = clip.get('portrait_crop_source', clip.get('crop_source')) if portrait else clip.get('crop_source')
    crop = f'crop={source_crop[2]}:{source_crop[3]}:{source_crop[0]}:{source_crop[1]},' if source_crop else ''
    source_filter = crop + f"setpts=(PTS-STARTPTS)/{float(clip.get('speed', 1))},scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}"
    source_filter += f",setsar=1,eq=saturation={float(clip.get('saturation', .90))}:contrast={float(clip.get('contrast', 1.035))}:brightness=-0.008:gamma={float(clip.get('gamma', 1))},fps={FPS}"
    if clip.get('luma_curve'):
        source_filter += f",curves=all='{clip['luma_curve']}'"
    source_filter += f',vignette=angle=PI/3:x0=w/2:y0=h*.15,tpad=stop_mode=clone:stop_duration=1,trim=end_frame={end_frame-start_frame},format=yuv420p,settb=1/{FPS},setpts=N,fps={FPS}'
    overlap_frames = round(dissolve * FPS)
    before_start = float(original_recipe['clips'][2]['duration']) - dissolve
    filters = [
        f'[0:v]trim=end_frame={count},setpts=N/({FPS}*TB),fps={FPS},setsar=1[base]',
        f'[1:v]trim=start={before_start},setpts=PTS-STARTPTS,scale={width}:{height}:flags=lanczos,fps={FPS},trim=end_frame={overlap_frames},settb=1/{FPS},setpts=N,fps={FPS}[before]',
        f'[2:v]{source_filter}[dice]',
        f'[3:v]trim=start=0,setpts=PTS-STARTPTS,scale={width}:{height}:flags=lanczos,fps={FPS},trim=end_frame={overlap_frames},settb=1/{FPS},setpts=N,fps={FPS}[after]',
        f'[before][dice]xfade=transition=fade:duration={dissolve}:offset=0,fps={FPS}[first]',
        f'[first][after]xfade=transition=fade:duration={dissolve}:offset={length-dissolve},fps={FPS}[background]',
        '[background]' + caption_filter(recipe, start, end, width, portrait, work) + f',setpts=PTS+{(start_frame-first)/FPS}/TB[patch]',
        f"[base][patch]overlay=eof_action=pass:repeatlast=0:enable='gte(t,{(start_frame-first)/FPS})*lt(t,{(end_frame-first)/FPS})',format=yuv420p[film]"
    ]
    encoded = work / 'replacement-gops.mp4'
    # Floor input seek keeps the exact first desired frame when its rational
    # timestamp cannot be represented by ffmpeg's microsecond CLI parser.
    seek = math.floor(time_start * 1_000_000) / 1_000_000
    run(['ffmpeg', '-hide_banner', '-v', 'warning', '-y', '-threads', args.threads,
         '-ss', f'{seek:.6f}', '-i', baseline, '-threads', 1, '-i', before,
         '-threads', args.threads, '-ss', clip.get('start', 0), '-i', source, '-threads', 1, '-i', after,
         '-filter_complex_threads', args.threads, '-filter_complex', ';\n'.join(filters), '-map', '[film]', '-an',
         '-frames:v', count, '-r', FPS, '-c:v', 'libx264', '-threads', args.threads,
         '-preset', args.preset, '-crf', args.crf, '-profile:v', 'main', '-level:v', '5.2', '-pix_fmt', 'yuv420p',
         '-video_track_timescale', 15360, '-movflags', '+faststart', '-progress', work / 'encode-progress.txt', '-nostats', encoded])
    prefix, suffix = work / 'prefix.mp4', work / 'suffix.mp4'
    run(['ffmpeg', '-hide_banner', '-v', 'warning', '-y', '-i', baseline, '-map', '0:v:0', '-an',
         '-c', 'copy', '-frames:v', first, '-video_track_timescale', 15360, prefix])
    # Ceil stream-copy seek selects this IDR, never the preceding GOP. The
    # sub-microsecond offset rounds back to zero in the 1/15360 track timescale.
    suffix_seek = math.ceil(time_end * 1_000_000) / 1_000_000
    run(['ffmpeg', '-hide_banner', '-v', 'warning', '-y', '-ss', f'{suffix_seek:.6f}', '-i', baseline,
         '-map', '0:v:0', '-an', '-c', 'copy', '-avoid_negative_ts', 'disabled', '-video_track_timescale', 15360, suffix])
    old_packets = video_packets(baseline)
    for piece, expected, offset in ((prefix, first, 0), (suffix, total_frames-last, last)):
        packets = video_packets(piece)
        if len(packets) != expected or [p['picture_sha256'] for p in packets] != [p['picture_sha256'] for p in old_packets[offset:offset+expected]]:
            raise SystemExit(f'Lossless baseline cut did not select the exact desired GOP boundary: {piece}')
    if len(video_packets(encoded)) != count:
        raise SystemExit('Replacement encoder did not produce the exact frame count.')
    sequence = work / 'parts.ffconcat'
    sequence.write_text('ffconcat version 1.0\n' + ''.join("file '" + str(p.resolve()).replace("'", "'\\''") + "'\n" for p in (prefix, encoded, suffix)))
    run(['ffmpeg', '-hide_banner', '-v', 'warning', '-f', 'concat', '-safe', 0, '-i', sequence,
         '-i', baseline, '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-t', recipe['duration'],
         '-video_track_timescale', 15360, '-movflags', '+faststart', '-metadata', 'title=LATIN — Pour la vie', target])
    final_info = probe(target)
    final_streams = {s['codec_type']: s for s in final_info['streams']}
    final_packets = video_packets(target)
    if len(final_packets) != total_frames or int(final_streams['video']['nb_frames']) != total_frames:
        raise SystemExit('Final export frame count differs from baseline.')
    for kind in ('video', 'audio'):
        if abs(float(final_streams[kind]['duration']) - float(recipe['duration'])) > .001:
            raise SystemExit(f'Final {kind} duration differs from the film timeline.')
    if [p['picture_sha256'] for p in final_packets[:first]] != [p['picture_sha256'] for p in old_packets[:first]] or [p['picture_sha256'] for p in final_packets[last:]] != [p['picture_sha256'] for p in old_packets[last:]]:
        raise SystemExit('Encoded pictures outside the replacement GOPs were changed.')
    for indices in (range(first), range(last, total_frames)):
        if any(int(final_packets[i]['pts']) != int(old_packets[i]['pts']) or int(final_packets[i]['dts']) != int(old_packets[i]['dts']) for i in indices):
            raise SystemExit('Video timing outside the replacement GOPs was changed.')
    step = Fraction(final_streams['video']['time_base']) * FPS
    if sorted(Fraction(int(p['pts'])) * step for p in final_packets) != list(range(total_frames)):
        raise SystemExit('Final video presentation timestamps do not cover the exact 60 fps timeline.')
    original_audio, final_audio = audio_hash(baseline), audio_hash(target)
    if original_audio != final_audio:
        raise SystemExit('The original AAC audio packets changed.')
    original_audio_stream = next(s for s in info['streams'] if s['codec_type'] == 'audio')
    if final_streams['audio']['time_base'] != original_audio_stream['time_base'] or audio_timing(target) != audio_timing(baseline):
        raise SystemExit('The original AAC packet timing or priming changed.')
    if target.stat().st_size >= 100 * 1024 * 1024:
        raise SystemExit('Export exceeds GitHub’s 100 MiB file limit; choose a higher replacement CRF.')
    run(['ffmpeg', '-hide_banner', '-v', 'error', '-xerror', '-threads', args.threads,
         '-ss', f'{seek:.6f}', '-i', target, '-t', time_end-time_start+.1, '-map', '0:v:0', '-an', '-f', 'null', '-'])
    report = {
        'base_commit': revision, 'format': name, 'source': str(source.relative_to(ROOT)) if source.is_relative_to(ROOT) else str(source),
        'source_sha256': digest(source), 'output': str(target), 'output_sha256': digest(target), 'bytes': target.stat().st_size,
        'size': [width, height], 'fps': FPS, 'frames': total_frames, 'duration_seconds': float(recipe['duration']),
        'changed_background_interval_seconds': [start, end], 'reencoded_gop_interval_seconds': [time_start, time_end],
        'outside_gops_encoded_picture_hashes_match': True, 'original_audio_packet_sha256': original_audio,
        'outside_gops_pts_dts_identical': True,
        'audio_packets_identical': True, 'audio_timing_and_priming_identical': True,
        'all_original_titles_identical': recipe['titles'] == original_recipe['titles'],
        'all_other_clip_recipes_identical': True, 'replacement_window_decodes_without_errors': True,
        'note': 'Frames inside enclosing GOPs but outside the dice interval reuse the existing finished picture; they are encoded again only to retain valid closed H.264 GOPs.'
    }
    (args.output_directory / f'verification-{name}.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(f'Verified {target}: 6300 frames, original audio, unchanged encoded pictures outside the local GOP window.', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output_directory', type=Path)
    parser.add_argument('--manifest', type=Path, default=Path('film/edit.json'))
    parser.add_argument('--source', type=Path, help='Override the manifest dice source for a reviewed candidate render')
    parser.add_argument('--portrait-source', type=Path, help='Optional separately framed portrait die render')
    parser.add_argument('--base-revision', default=BASE_REVISION)
    parser.add_argument('--format', choices=('both', 'landscape', 'portrait'), default='both')
    parser.add_argument('--threads', type=int, default=2)
    parser.add_argument('--crf', type=float, default=23)
    parser.add_argument('--preset', default='medium')
    args = parser.parse_args()
    os.chdir(ROOT)
    args.output_directory = args.output_directory.resolve()
    args.output_directory.mkdir(parents=True, exist_ok=True)
    revision = capture(['git', 'rev-parse', f'{args.base_revision}^{{commit}}']).strip()
    recipe = json.loads(args.manifest.read_text())
    original = json.loads(capture(['git', 'show', f'{revision}:film/edit.json']))
    for key in ('titles', 'music', 'duration', 'dissolve', 'width', 'height', 'fps', 'portrait_width', 'portrait_height', 'motion'):
        if recipe.get(key) != original.get(key):
            raise SystemExit(f'The localized patch must preserve the original {key}.')
    if len(recipe['clips']) != len(original['clips']) or any(c != original['clips'][i] for i, c in enumerate(recipe['clips']) if i != 3):
        raise SystemExit('The localized patch may change only the existing dice clip.')
    if recipe['clips'][3]['duration'] != original['clips'][3]['duration']:
        raise SystemExit('The dice duration must remain unchanged.')
    if not any(t.get('text') == 'Alea jacta est.' for t in recipe['titles']):
        raise SystemExit('Alea jacta est. title is missing.')
    for portrait in (False, True):
        if args.format == ('landscape' if portrait else 'portrait'):
            continue
        replace_format(args, recipe, original, revision, portrait)


if __name__ == '__main__':
    main()
