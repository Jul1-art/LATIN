#!/usr/bin/env python3
"""Download the pinned film sources and verify every SHA-256 checksum."""
from pathlib import Path
import hashlib
import json
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
    print('All pinned film sources verified.')


if __name__ == '__main__':
    main()
