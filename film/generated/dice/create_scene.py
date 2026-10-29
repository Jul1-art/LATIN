"""Animate the existing LATIN die, with full-rate pose sampling and no new objects.
Render: blender -b -t 4 --python create_scene.py -- --output WORKDIR --render
Encode: python3 encode_clip.py --output WORKDIR
"""
import argparse
import bpy, math, os, sys, json
from pathlib import Path
from mathutils import Vector, Euler
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parent)
parser.add_argument('--width', type=int, default=1920)
parser.add_argument('--height', type=int, default=1080)
parser.add_argument('--samples', type=int, default=4)
parser.add_argument('--render-step', type=int, default=2)
parser.add_argument('--threads', type=int, default=4)
parser.add_argument('--frames', type=int, nargs='+')
parser.add_argument('--render', action='store_true')
parser.add_argument('--preview', action='store_true')
args = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
OUT = str(args.output.resolve())
os.makedirs(os.path.join(OUT, 'frames'), exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for d in bpy.data.materials: bpy.data.materials.remove(d)
s=bpy.context.scene
s.render.engine='BLENDER_EEVEE_NEXT';s.eevee.taa_render_samples=args.samples;s.cycles.use_denoising=False
s.cycles.max_bounces=5;s.cycles.diffuse_bounces=2;s.cycles.glossy_bounces=3;s.cycles.transmission_bounces=2
s.render.threads_mode='FIXED';s.render.threads=args.threads
s.render.resolution_x=args.width;s.render.resolution_y=args.height;s.render.resolution_percentage=100
s.render.fps=60;s.frame_start=1;s.frame_end=399;s.frame_step=1
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGB';s.render.image_settings.color_depth='8'
s.render.filepath=OUT+'/frames/dice_'
s.render.film_transparent=False
s.render.use_motion_blur=False;s.render.motion_blur_shutter=.25
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=.15
# Very dim cool studio environment, photographed with local softboxes.
w=bpy.data.worlds.new('Charcoal studio') if not bpy.data.worlds else bpy.data.worlds[0];s.world=w;w.use_nodes=True
w.node_tree.nodes['Background'].inputs[0].default_value=(.16,.19,.24,1);w.node_tree.nodes['Background'].inputs[1].default_value=.12

def mat(name,color,roughness=.35,metallic=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=roughness;p.inputs['Metallic'].default_value=metallic;return m
ivory=mat('Warm aged ivory',(.72,.65,.49),.27)
p=ivory.node_tree.nodes.get('Principled BSDF');p.inputs['Subsurface Weight'].default_value=.035;p.inputs['Subsurface Radius'].default_value=(1,.55,.25);p.inputs['Coat Weight'].default_value=.18;p.inputs['Coat Roughness'].default_value=.24
n=ivory.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=165;n.inputs['Detail'].default_value=2;n.inputs['Roughness'].default_value=.65
b=ivory.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.08;b.inputs['Distance'].default_value=.008;ivory.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']);ivory.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
dark=mat('Recessed black enamel',(.011,.014,.017),.24);dark.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.25
# Rounded ivory volume, then concave spherical pip cavities. Real cut geometry.
bpy.ops.mesh.primitive_cube_add(size=2);die=bpy.context.object;die.name='Ivory die with recessed enamel pips';die.data.materials.append(ivory);die.data.materials.append(dark)
bev=die.modifiers.new('Broad softened edges','BEVEL');bev.width=.14;bev.segments=6;bpy.ops.object.modifier_apply(modifier=bev.name)
# Standard opposite faces total seven: top 1, bottom 6, front 5, back 2, right 3, left 4.
patterns={1:[(0,0)],2:[(-.43,-.43),(.43,.43)],3:[(-.43,-.43),(0,0),(.43,.43)],4:[(-.43,-.43),(-.43,.43),(.43,-.43),(.43,.43)],5:[(-.43,-.43),(-.43,.43),(0,0),(.43,-.43),(.43,.43)],6:[(a,b) for a in [-.43,.43] for b in [-.48,0,.48]]}
faces=[(1,Vector((0,0,1)),Vector((1,0,0)),Vector((0,1,0))),(6,Vector((0,0,-1)),Vector((1,0,0)),Vector((0,1,0))),(5,Vector((0,-1,0)),Vector((1,0,0)),Vector((0,0,1))),(2,Vector((0,1,0)),Vector((1,0,0)),Vector((0,0,1))),(3,Vector((1,0,0)),Vector((0,1,0)),Vector((0,0,1))),(4,Vector((-1,0,0)),Vector((0,1,0)),Vector((0,0,1)))]
cutters=[]
for num,normal,u,v in faces:
 for a,b in patterns[num]:
  loc=normal*1.075+u*a+v*b
  bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=.165,location=loc)
  c=bpy.context.object;c.data.materials.append(ivory);c.data.materials.append(dark)
  for poly in c.data.polygons:poly.material_index=1
  cutters.append(c)
bpy.ops.object.select_all(action='DESELECT')
for c in cutters:c.select_set(True)
bpy.context.view_layer.objects.active=cutters[0];bpy.ops.object.join();c=bpy.context.object;c.name='Pip cavity cutters'
bpy.context.view_layer.objects.active=die
bo=die.modifiers.new('Twenty one inset pips','BOOLEAN');bo.operation='DIFFERENCE';bo.solver='EXACT';bo.object=c;bpy.ops.object.modifier_apply(modifier=bo.name)
bpy.data.objects.remove(c,do_unlink=True)
for poly in die.data.polygons:poly.use_smooth=True
wn=die.modifiers.new('Weighted photographic normals','WEIGHTED_NORMAL');wn.keep_sharp=True;wn.weight=40
# Charcoal slate: broad mineral variations and close microtexture.
stone=mat('Charcoal slate stone',(.028,.033,.039),.51)
nd=stone.node_tree.nodes;lk=stone.node_tree.links;p=nd.get('Principled BSDF');p.inputs['Roughness'].default_value=.64;p.inputs['Specular IOR Level'].default_value=.22
noise=nd.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=3.5;noise.inputs['Detail'].default_value=5;noise.inputs['Roughness'].default_value=.72
ramp=nd.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[0].color=(.009,.012,.016,1);ramp.color_ramp.elements[1].position=.82;ramp.color_ramp.elements[1].color=(.048,.052,.055,1)
lk.new(noise.outputs['Fac'],ramp.inputs[0]);lk.new(ramp.outputs[0],p.inputs['Base Color'])
fine=nd.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=115;fine.inputs['Detail'].default_value=2.8;fine.inputs['Roughness'].default_value=.8
b=nd.new('ShaderNodeBump');b.inputs['Strength'].default_value=.28;b.inputs['Distance'].default_value=.026;lk.new(fine.outputs['Fac'],b.inputs['Height']);lk.new(b.outputs['Normal'],p.inputs['Normal'])
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='Dark slate stage';floor.data.materials.append(stone)
# Cinematic complementary softboxes and a narrow amber edge.
def area(name,loc,power,color,size,target=(0,0,1),shape='DISK',size_y=None):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shape=shape;o.data.size=size
 if size_y is not None:o.data.size_y=size_y
 o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Large warm key softbox',(-3.7,-4.4,7),700,(1,.86,.65),4)
area('Amber rim strip',(3,3.8,4.8),950,(1,.55,.21),3,shape='RECTANGLE',size_y=.65)
area('Cool fill card',(3.6,-2.6,4),240,(.60,.73,1),4)
area('Back slate grazing light',(-3,4,2.4),230,(.75,.8,1),3,target=(0,0,0))
# Slightly elevated product camera. Focus and framing reserve the lower third.
bpy.ops.object.empty_add(type='PLAIN_AXES',location=(0,0,1.05));focus=bpy.context.object;focus.name='Die focus target'
bpy.ops.object.camera_add(location=(6.6,-10.2,6.3));cam=bpy.context.object;cam.name='Slow push product camera';s.camera=cam;cam.data.lens=58;cam.data.sensor_width=36
cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=8;cam.data.dof.aperture_blades=7
# Improve the existing die, floor and lights only: no additional scene objects.
# Full-rate authored rigid motion: ballistic arcs, sharp contacts and decaying
# edge rocking. Support is evaluated from the actual bevelled mesh every frame.
FPS = 60
MOVING_END = 202
VERTICES = [tuple(vertex.co) for vertex in die.data.vertices]
REST = (-math.pi, 0.0, 0.55)
IMPACTS = [(1.0, (0.25, -0.35, 0.20)),
           (1.72, (-math.pi + 0.10, 0.12, 0.47)),
           (2.15, (-math.pi - 0.12, -0.07, 0.55))]

def lerp(a, b, u):
    return tuple(x + (y-x)*u for x, y in zip(a, b))

def smooth(u):
    u = max(0.0, min(1.0, u))
    return u*u*(3-2*u)

def support(rotation):
    row = Euler(rotation, 'XYZ').to_matrix()[2]
    return max(-(row[0]*x + row[1]*y + row[2]*z) for x,y,z in VERTICES)

def pose(t):
    if t <= 1.0:
        rotation = lerp((2*math.pi + 0.7, math.pi + 0.5, -1.0), IMPACTS[0][1], t)
        xy = lerp((-0.65, 0.18), (0.05, 0.0), t)
        end_z = support(IMPACTS[0][1]) + 0.008
        # One second flight, with an upward release and a decisive downward hit.
        z = 2.6 + (end_z-2.6+6)*t - 6*t*t
    elif t <= 1.72:
        u = (t-1.0)/0.72
        rotation = lerp(IMPACTS[0][1], IMPACTS[1][1], u)
        xy = lerp((0.05, 0.0), (0.50, -0.10), u)
        z = (1-u)*support(IMPACTS[0][1]) + u*support(IMPACTS[1][1]) + 0.008 + 4*0.80*u*(1-u)
    elif t <= 2.15:
        u = (t-1.72)/0.43
        rotation = lerp(IMPACTS[1][1], IMPACTS[2][1], u)
        xy = lerp((0.50, -0.10), (0.61, -0.13), u)
        z = (1-u)*support(IMPACTS[1][1]) + u*support(IMPACTS[2][1]) + 0.008 + 4*0.20*u*(1-u)
    elif t < 3.35:
        u = t-2.15
        decay = math.exp(-3.5*u)*(1-smooth(u/1.2))
        rock = decay*math.cos(11*u)
        rotation = (REST[0]-0.12*rock, -0.07*rock, REST[2])
        xy = lerp((0.61, -0.13), (0.65, -0.14), smooth(u/1.2))
        z = support(rotation) + 0.008
    else:
        rotation, xy = REST, (0.65, -0.14)
        z = support(rotation) + 0.008
    # A rotating convex volume cannot cross the slate between authored impacts.
    return (xy[0], xy[1], max(z, support(rotation)+0.008)), rotation

report = []
for frame in list(range(1, MOVING_END+1)) + [399]:
    t = (frame-1)/FPS
    location, rotation = pose(t)
    die.location = location
    die.rotation_euler = rotation
    die.keyframe_insert('location', frame=frame)
    die.keyframe_insert('rotation_euler', frame=frame)
    # Track lateral travel while preserving the visible height of each bounce.
    progress = smooth(min(t/3.35, 1))
    cam.location = lerp((6.9, -10.65, 7.0), (6.5, -10.05, 6.5), progress)
    target = Vector((location[0], location[1], -0.24 + 0.75*(location[2]-1.008)))
    cam.rotation_euler = (target-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.lens = 36 + 14*progress
    cam.keyframe_insert('location', frame=frame)
    cam.keyframe_insert('rotation_euler', frame=frame)
    cam.data.keyframe_insert('lens', frame=frame)
    focus.location = location
    focus.keyframe_insert('location', frame=frame)
    report.append({'frame':frame, 'center':list(location), 'rotation':list(rotation),
                   'floor_clearance':location[2]-support(rotation)})
for obj in (die, cam, cam.data, focus):
    for curve in obj.animation_data.action.fcurves:
        for key in curve.keyframe_points:
            key.interpolation='LINEAR'
s.frame_set(MOVING_END)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/scene.blend')
with open(OUT+'/motion-verification.json','w') as handle:
    json.dump({'fps':FPS, 'moving_end_frame':MOVING_END, 'total_frames':399,
               'render':{'resolution':[args.width,args.height], 'samples':args.samples, 'render_step':args.render_step, 'motion_blur':False},
               'contact_seconds':[1.0,1.72,2.15], 'minimum_floor_clearance':min(r['floor_clearance'] for r in report),
               'notes':'Existing mesh, floor and lights. Authored cinematic motion, not a Bullet simulation. No optical-flow interpolation.',
               'samples':report}, handle, indent=2)
if args.frames:
    frames = args.frames
elif args.preview:
    frames = [83]
elif args.render:
    # After frame202 the die, camera and lighting are completely stationary.
    frames = list(range(1, MOVING_END+1, args.render_step))
    if frames[-1] != MOVING_END: frames.append(MOVING_END)
else:
    frames = []
for frame in frames:
    s.eevee.taa_render_samples = max(16, args.samples) if frame == MOVING_END else args.samples
    s.frame_set(frame)
    s.render.filepath=OUT+'/frames/dice_%04d.png'%frame
    bpy.ops.render.render(write_still=True)
