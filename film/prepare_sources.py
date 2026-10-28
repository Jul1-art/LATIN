#!/usr/bin/env python3
"""Download pinned, hash-checked source files and prepare the archive triptych."""
from pathlib import Path
import hashlib
import json
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parent
DEST = ROOT / 'sources'


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    DEST.mkdir(exist_ok=True)
    for source in json.loads((ROOT / 'source-files.json').read_text()):
        target = DEST / source['file']
        if target.exists():
            if digest(target) != source['sha256']:
                raise SystemExit(f'Existing source has a different checksum: {target}')
            continue
        temporary = target.with_suffix('.download')
        request = urllib.request.Request(source['url'], headers={'User-Agent': 'LATIN-film-source-preparation'})
        try:
            with urllib.request.urlopen(request, timeout=60) as response, temporary.open('wb') as stream:
                while block := response.read(1024 * 1024):
                    stream.write(block)
            if digest(temporary) != source['sha256']:
                raise SystemExit(f'Checksum mismatch: {source["file"]}')
            temporary.rename(target)
        finally:
            temporary.unlink(missing_ok=True)
    triptych = DEST / 'urban-triptych.mp4'
    if not triptych.exists():
        city = str(DEST / 'city-film.mp4')
        filters = (
            '[0:v]setpts=PTS-STARTPTS,scale=426:720:force_original_aspect_ratio=increase,crop=426:720,fps=24[a];'
            '[1:v]setpts=(PTS-STARTPTS)*2.087,scale=428:720:force_original_aspect_ratio=increase,crop=428:720,fps=24[b];'
            '[2:v]setpts=(PTS-STARTPTS)*2.182,scale=426:720:force_original_aspect_ratio=increase,crop=426:720,fps=24[c];'
            '[a][b][c]hstack=inputs=3,trim=duration=4.8[out]'
        )
        subprocess.run([
            'ffmpeg', '-hide_banner', '-v', 'error',
            '-threads', '2', '-ss', '41.55', '-t', '4.8', '-i', city,
            '-threads', '2', '-ss', '15.02', '-t', '2.30', '-i', city,
            '-threads', '2', '-ss', '28.30', '-t', '2.20', '-i', city,
            '-filter_complex_threads', '2', '-filter_complex', filters,
            '-map', '[out]', '-an', '-c:v', 'libx264', '-threads', '2',
            '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart', str(triptych)
        ], check=True)
    print('Sources verified and archive triptych prepared.')


if __name__ == '__main__':
    main()
