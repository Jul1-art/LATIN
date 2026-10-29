#!/usr/bin/env python3
"""An interpretive 3D camera flight based on NASA's Tycho star-map pixels.

Sky directions/colors come from the map; depths and the camera path are artistic,
not measured stellar distances. Requires numpy, Pillow and FFmpeg.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--duration', type=float, default=10.25)
    args = parser.parse_args()
    if args.output.exists():
        raise SystemExit('Choose a new output; existing renders are preserved.')
    image = np.asarray(Image.open(args.source).convert('RGB'), dtype=np.float32) / 255
    light = image.max(axis=2)
    maxima = np.maximum.reduce([np.roll(np.roll(light, y, 0), x, 1) for y in [-1, 0, 1] for x in [-1, 0, 1]])
    sy, sx = np.nonzero((light >= maxima) & (light > .18))
    h, w = light.shape
    colors = image[sy, sx] ** .65
    longitude = (sx / w * 2 - 1) * np.pi
    latitude = (.5 - sy / h) * np.pi
    vectors = np.column_stack([np.cos(latitude)*np.sin(longitude), np.sin(latitude), np.cos(latitude)*np.cos(longitude)])
    rng = np.random.default_rng(27)
    distances = 24 + rng.random(len(sx)) ** .65 * 190
    points = vectors * distances[:, None]
    width, height, fps = 1280, 720, 24
    focal = width / (2 * np.tan(np.deg2rad(64)/2))
    frames = int(round(args.duration*fps))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    command = ['ffmpeg','-hide_banner','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{width}x{height}','-r',str(fps),'-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(args.output)]
    pipe = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for index in range(frames):
            p = index / max(1,frames-1)
            camera = np.array([1.7*np.sin(p*.7), .8*np.sin(p*1.1), 32*p])
            view = points - camera
            z = view[:, 2]
            visible = z > 5
            position = view[visible]
            depths = z[visible]
            px = np.rint(position[:,0] / depths * focal + width/2).astype(int)
            py = np.rint(-position[:,1] / depths * focal + height*.47).astype(int)
            inside = (px>6)&(px<width-6)&(py>6)&(py<height-6)
            px,py,depths = px[inside],py[inside],depths[inside]
            rgb = colors[visible][inside]
            strength = (.65+np.clip(80/depths,0,4.0))[:,None]
            luminosity = rgb*strength
            canvas = np.zeros((height,width,3), dtype=np.float32)
            # Small bloom, bright stellar core and directional diffraction are
            # rendered as pixel kernels; no synthetic new stars are introduced.
            for oy,ox,weight in [(0,0,1.7),(-1,0,.32),(1,0,.32),(0,-1,.32),(0,1,.32),(-1,-1,.09),(1,1,.09),(-1,1,.09),(1,-1,.09),(-2,0,.055),(2,0,.055),(0,-2,.055),(0,2,.055)]:
                np.add.at(canvas,(py+oy,px+ox),luminosity*weight)
            pixels = np.uint8(np.clip(canvas*220,0,255))
            pipe.stdin.write(pixels.tobytes())
    finally:
        pipe.stdin.close()
    if pipe.wait():
        raise SystemExit('Star-field encoding failed.')
    provenance = {'title':'Vers les étoiles — trajet de caméra en profondeur','kind':'Original interpretive data visualization','source_file':args.source.name,'source_sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'source':'NASA-3D-Resources, Tycho Star Map','source_url':'https://github.com/nasa/NASA-3D-Resources/blob/11ebb4ee043715aefbba6aeec8a61746fad67fa7/Images%20and%20Textures/Tycho%20Star%20Map/Tycho%20Star%20Map.jpg','license_url':'https://github.com/nasa/NASA-3D-Resources/blob/11ebb4ee043715aefbba6aeec8a61746fad67fa7/README.md','transforms':'Local bright stellar pixels supply directions and colors; artistic depths, optical bloom and camera travel. Not a spacecraft recording or a measurement of stellar distances.','stars':len(sx),'duration':frames/fps,'output_sha256':hashlib.sha256(args.output.read_bytes()).hexdigest()}
    args.output.with_suffix('.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    print('Rendered',frames,'frames from',len(sx),'mapped stellar directions.')


if __name__=='__main__':
    main()
