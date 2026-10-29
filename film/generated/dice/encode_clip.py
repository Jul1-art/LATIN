"""Create delivery MP4 from the procedural Blender frame render."""
import os, subprocess, json, pathlib
out=pathlib.Path(__file__).resolve().parent
frame_numbers=list(range(1,45,2))+list(range(45,158,4))
frames=[out/'frames'/f'dice_{n:04d}.png' for n in frame_numbers]
assert all(p.exists() for p in frames), 'Incomplete source render'
concat=out/'source.ffconcat'
lines=['ffconcat version 1.0']
for i,p in enumerate(frames):
 next_frame=frame_numbers[i+1] if i+1<len(frames) else 161
 lines.extend([f"file '{p}'",'option framerate 24',f'duration {(next_frame-frame_numbers[i])/24:.9f}'])
lines.extend([f"file '{frames[-1]}'",'option framerate 24'])
concat.write_text('\n'.join(lines)+'\n')
cmd=['ffmpeg','-y','-hide_banner','-loglevel','warning','-filter_threads','2','-safe','0','-f','concat','-i',str(concat),'-vf','tpad=stop_mode=clone:stop_duration=0.25,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1280:720:flags=lanczos:out_color_matrix=bt709,format=yuv420p','-frames:v','160','-c:v','libx264','-preset','medium','-crf','16','-threads','2','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart','-an',str(out/'dice.mp4')]
subprocess.run(cmd,check=True)
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','warning','-ss','4','-i',str(out/'dice.mp4'),'-frames:v','1',str(out/'preview_final.png')],check=True)
provenance={'type':'original procedural 3D art','title':'Alea — ivory die on charcoal slate','creator':'Original scene created for Latinquote','source_assets':'All geometry, materials, lighting and animation are original procedural work created in Blender. No stock, archive, NASA, external imagery, words or logos.','software':['Blender 4.3.2 EEVEE Next','FFmpeg'],'delivered_file':'dice.mp4','delivery_resolution':[1280,720],'native_render_resolution':[960,540],'delivery_fps':24,'source_fps':'12 fps during fall, 6 fps during settled camera push','frames':160,'duration_seconds':160/24,'processing':'51 original rendered frames with adaptive timing; motion interpolation to 24 fps and Lanczos upscaling.','has_audio':False,'reproducible_scene_script':'create_scene.py','reproducible_encode_script':'encode_clip.py','scene_file':'scene.blend'}
(out/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
print(out/'dice.mp4')
