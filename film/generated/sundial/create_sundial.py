import bpy, math, os, sys, json
from mathutils import Vector
from math import sin, cos, pi
OUT=os.path.dirname(os.path.abspath(__file__))
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
MODE=args[0] if args else 'preview'
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for dat in bpy.data.materials: bpy.data.materials.remove(dat)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE_NEXT'
scene.cycles.device='CPU'; scene.cycles.samples=8
scene.eevee.taa_render_samples=4
scene.cycles.use_denoising=False; scene.cycles.max_bounces=3
scene.cycles.diffuse_bounces=2; scene.cycles.glossy_bounces=2
scene.cycles.transmission_bounces=0
scene.render.threads_mode='FIXED'; scene.render.threads=2
scene.render.resolution_x=1280; scene.render.resolution_y=720; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGB'
scene.render.fps=24; scene.frame_start=1; scene.frame_end=208
scene.world.color=(.018,.018,.018)
scene.view_settings.view_transform='AgX'; scene.view_settings.look='AgX - Medium High Contrast'; scene.view_settings.exposure=.15

def mat(name, color, metal=0., rough=.4):
 m=bpy.data.materials.new(name); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
stone=mat('Warm honed limestone — procedural original',(.68,.62,.49),.0,.48)
n=stone.node_tree.nodes; l=stone.node_tree.links
noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=120;noise.inputs['Detail'].default_value=2
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.018
l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])
brass=mat('Satin antique brass',(.48,.31,.105),.82,.26)
edge=mat('Brushed warm brass edge',(.55,.39,.16),.85,.29)
ink=mat('Darkened recesses',(.11,.079,.042),.25,.62)
black=mat('Charcoal velvet stage',(.012,.014,.016),.0,.8)

def bevel(obj,width=.04,segments=3):
 mod=obj.modifiers.new('Small machined edge radius','BEVEL');mod.width=width;mod.segments=segments
 mod=obj.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')

def cylinder(name, radius, depth, z, material):
 bpy.ops.mesh.primitive_cylinder_add(vertices=192, radius=radius, depth=depth, location=(0,0,z))
 o=bpy.context.object;o.name=name;o.data.materials.append(material);bevel(o,.045,3);return o
base=cylinder('Solid limestone body',3.18,.33,.275,stone)
# A real machined brass rim and inset ivory face.
rim=cylinder('Continuous brass outer bezel',3.19,.11,.478,edge)
face=cylinder('Ivory sundial face',3.03,.085,.546,stone)
TOP=.5885
# Narrow concentric engraved tracks as recessed charcoal grooves.
def circle_curve(name,r,z,material,width):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=1;cu.bevel_depth=width;cu.bevel_resolution=2
 sp=cu.splines.new('POLY');sp.points.add(255)
 for i,p in enumerate(sp.points):
  a=2*pi*i/256;p.co=(r*cos(a),r*sin(a),z,1)
 sp.use_cyclic_u=True;o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.data.materials.append(material)
 return o
circle_curve('Outer fine engraved border',2.89,TOP-.003,ink,.009)
circle_curve('Inner fine engraved border',2.45,TOP-.004,ink,.007)
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
font=bpy.data.fonts.load(font_path)
romans=['VI','VII','VIII','IX','X','XI','XII','I','II','III','IV','V','VI']
cutters=[]
bpy.ops.object.select_all(action='DESELECT')
for i,label in enumerate(romans):
 a=math.radians(-105+i*17.5);r=2.67
 cu=bpy.data.curves.new('Engraving '+label,'FONT');cu.body=label;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=.245;cu.extrude=.021;cu.resolution_u=4;cu.font=font
 o=bpy.data.objects.new('Roman hour '+label,cu);bpy.context.collection.objects.link(o);o.location=(r*sin(a),r*cos(a),TOP-.017);o.rotation_euler[2]=-a
 # Dark inset glyphs provide actual sunken faces, with a shallow boolean cut above.
 o.data.materials.append(ink)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
 cutters.append(o)
 # Radiating hour incisions.
 rr1=.72;rr2=2.36
 cu=bpy.data.curves.new('Hour line','CURVE');cu.dimensions='3D';cu.bevel_depth=.008;cu.bevel_resolution=1
 sp=cu.splines.new('POLY');sp.points.add(1);sp.points[0].co=(rr1*sin(a),rr1*cos(a),TOP-.004,1);sp.points[1].co=(rr2*sin(a),rr2*cos(a),TOP-.004,1)
 line=bpy.data.objects.new('Fine radial hour marking',cu);bpy.context.collection.objects.link(line);line.data.materials.append(ink)
# Boolean all characters in one operation, with darker inset lower faces.
for o in cutters:o.select_set(True)
bpy.context.view_layer.objects.active=cutters[0];bpy.ops.object.join();engraving=bpy.context.object;engraving.name='Engraved Roman hour numerals'
# Cut from face with duplicate; retain original geometry lowered below the face.
cut=engraving.copy();cut.data=engraving.data.copy();bpy.context.collection.objects.link(cut);cut.name='Roman numeral carving tool'
bpy.context.view_layer.objects.active=face
mod=face.modifiers.new('Recessed Roman numerals','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cut
bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.data.objects.remove(cut,do_unlink=True)
engraving.location.z-=.018
# Classical triangular gnomon: bevelled solid brass, rather than a clock hand.
verts=[(-.055,-.66,TOP+.015),(-.055,.78,TOP+.015),(-.055,.78,2.12),(.055,-.66,TOP+.015),(.055,.78,TOP+.015),(.055,.78,2.12)]
faces=[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)]
me=bpy.data.meshes.new('Solid triangular gnomon mesh');me.from_pydata(verts,[],faces);me.update()
o=bpy.data.objects.new('Triangular solid brass gnomon',me);bpy.context.collection.objects.link(o);o.data.materials.append(brass);bevel(o,.025,3)
# Small mounting escutcheon and restrained hardware.
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,.02,TOP+.022));o=bpy.context.object;o.name='Gnomon mount';o.scale=(.23,1.05,.035);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(brass);bevel(o,.045,3)
for y in [-.40,.45]:
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=.046,location=(0,y,TOP+.055));o=bpy.context.object;o.name='Flush brass mounting pin';o.scale.z=.35;o.data.materials.append(edge)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,.06));o=bpy.context.object;o.name='Charcoal studio cyclorama';o.data.materials.append(black)

def aim(o,point):o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,pos,energy,size,color,target=(0,0,.3)):
 data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.use_shadow_jitter=False;data.shape='DISK';data.size=size;data.color=color;o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=pos;aim(o,target);return o
area('Large soft studio reflection',(-4,-3,8),90,6,(.83,.9,1))
area('Warm edge reflection',(4,3,5),160,4,(1,.83,.58))
# This directional sun creates the physically moving shadow; there is no animated decal.
data=bpy.data.lights.new('Animated sunlight — physical cast shadow','SUN');data.energy=3.5;data.use_shadow_jitter=False;data.angle=math.radians(1.1);data.color=(1,.88,.68)
sun=bpy.data.objects.new('Animated sunlight — physical cast shadow',data);bpy.context.collection.objects.link(sun)
for frame,x,y in [(1,-4.5,5.5),(208,0.8,5.5)]:
 sun.location=(x,y,6.2);aim(sun,(0,0,0));sun.keyframe_insert(data_path='rotation_euler',frame=frame)
# Slow product camera arc, framed above center for the later quote caption.
data=bpy.data.cameras.new('Cinematic product camera');cam=bpy.data.objects.new('Cinematic product camera',data);bpy.context.collection.objects.link(cam);scene.camera=cam
data.type='PERSP';data.lens=62;data.sensor_width=36
data.dof.use_dof=False
for frame,angle in [(1,.38),(208,.49)]:
 cam.location=(18.2*sin(angle),-18.2*cos(angle),16.1);aim(cam,(0,0,-1));cam.keyframe_insert(data_path='location',frame=frame);cam.keyframe_insert(data_path='rotation_euler',frame=frame)
for ob in [sun,cam]:
 if ob.animation_data:
  for fc in ob.animation_data.action.fcurves:
   for kp in fc.keyframe_points:kp.interpolation='LINEAR'
scene.render.film_transparent=False
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'sundial.blend'))
if MODE=='preview':
 scene.render.resolution_percentage=75;scene.cycles.samples=12;scene.render.filepath=os.path.join(OUT,'preview.png');bpy.ops.render.render(write_still=True)
elif MODE=='test':
 scene.render.resolution_percentage=75;scene.cycles.samples=8
 for f in [1,104,208]:
  scene.frame_set(f);scene.render.filepath=os.path.join(OUT,'test-%03d.png'%f);bpy.ops.render.render(write_still=True)
elif MODE=='render':
 scene.render.resolution_percentage=75;scene.cycles.samples=8
 # Four rendered poses per second; optical interpolation produces the delivery at 24 fps.
 for f in range(1,209,6):
  dest=os.path.join(OUT,'frames','%04d.png'%((f+5)//6))
  if os.path.exists(dest):continue
  scene.frame_set(f);scene.render.filepath=dest;bpy.ops.render.render(write_still=True)
