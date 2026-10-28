#!/usr/bin/env python3
"""Download pinned, hash-checked source files and prepare the archive triptych."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
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
    variants = [
        ('urban-triptych-clean.mp4', 4.8, [(41.55, 4.8, 1), (15.02, 2.30, 2.087), (28.30, 2.20, 2.182)]),
        ('urban-triptych-2-clean.mp4', 4.0, [(34.25, 4.60, 1/1.15), (9.10, 3.45, 1/0.8625), (24.65, 3.55, 1/0.8875)])
    ]
    for name, duration, shots in variants:
        target = DEST / name
        if target.exists():
            continue
        inputs, filters = [], []
        for index, ((start, length, stretch), width) in enumerate(zip(shots, (426, 428, 426))):
            inputs += ['-threads', '2', '-ss', str(start), '-t', str(length), '-i', str(DEST / 'city-film.mp4')]
            filters.append(f'[{index}:v]crop=1080:1344:0:288,setpts=(PTS-STARTPTS)*{stretch},scale={width}:720:force_original_aspect_ratio=increase,crop={width}:720,fps=24[p{index}]')
        filters.append(f'[p0][p1][p2]hstack=inputs=3,trim=duration={duration}[out]')
        with tempfile.TemporaryDirectory(prefix='triptych-', dir=DEST) as directory:
            temporary = Path(directory) / name
            subprocess.run([
                'ffmpeg', '-hide_banner', '-v', 'error', *inputs,
                '-filter_complex_threads', '2', '-filter_complex', ';'.join(filters),
                '-map', '[out]', '-an', '-c:v', 'libx264', '-threads', '2',
                '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart', str(temporary)
            ], check=True)
            temporary.rename(target)
    print('Sources verified and archive triptychs prepared.')


if __name__ == '__main__':
    main()
