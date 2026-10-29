"""Original procedural die film. Blender 4.3.2 EEVEE Next; deterministic geometry and motion.
Run: blender -b -t 5 --python create_scene.py -- --preview
Run full: blender -b -t 2 --python create_scene.py -- --render
"""
import bpy, math, os, sys, json
from mathutils import Vector, Euler
OUT=os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(OUT,'frames'),exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for d in bpy.data.materials: bpy.data.materials.remove(d)
s=bpy.context.scene
s.render.engine='BLENDER_EEVEE_NEXT';s.eevee.taa_render_samples=4;s.cycles.use_denoising=False
s.cycles.max_bounces=5;s.cycles.diffuse_bounces=2;s.cycles.glossy_bounces=3;s.cycles.transmission_bounces=2
s.render.threads_mode='FIXED';s.render.threads=2
s.render.resolution_x=1280;s.render.resolution_y=720;s.render.resolution_percentage=75
s.render.fps=24;s.frame_start=1;s.frame_end=160;s.frame_step=2
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGB';s.render.image_settings.color_depth='8'
s.render.filepath=OUT+'/frames/dice_'
s.render.film_transparent=False
s.render.use_motion_blur=True;s.render.motion_blur_shutter=.32
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
cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=5.6;cam.data.dof.aperture_blades=7
# Controlled fall -> two diminishing bounces -> damped edge rocking. Contact
# height follows the rotated rounded cube's support, so the die never penetrates.
poses=[(1,(-.60,.24),(-1.25,-.9,-.52),.35),(11,(-.25,.1),(-.50,.42,-.05),.20),(16,(.02,0),(.32,.24,.05),0),(23,(.20,-.04),(.19,-.26,.13),.25),(30,(.32,-.08),(-.13,-.13,.20),0),(37,(.38,-.10),(-.07,.10,.24),.075),(44,(.41,-.11),(.055,.05,.27),0),(52,(.43,-.12),(.028,-.03,.285),.018),(62,(.44,-.12),(-.018,-.008,.296),0),(74,(.445,-.12),(.005,.009,.299),0),(88,(.445,-.12),(0,0,.30),0),(160,(.445,-.12),(0,0,.30),0)]
for fr,xy,ang,hop in poses:
 rot=Euler(ang,'XYZ');R=rot.to_matrix();support=.86*sum(abs(R[2][j]) for j in range(3))+.14
 die.location=(xy[0],xy[1],support+hop+.006);die.rotation_euler=rot
 die.keyframe_insert('location',frame=fr);die.keyframe_insert('rotation_euler',frame=fr)
# Smooth cinematic easing, with deliberate contact points.
for fcu in die.animation_data.action.fcurves:
 for kp in fcu.keyframe_points:kp.interpolation='BEZIER';kp.handle_left_type='AUTO_CLAMPED';kp.handle_right_type='AUTO_CLAMPED'
for fr,loc,target in [(1,(6.9,-10.65,6.4),(.25,0,1.10)),(44,(6.76,-10.42,6.28),(.29,0,.32)),(160,(6.38,-9.78,5.96),(.32,0,.32))]:
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert('location',frame=fr);cam.keyframe_insert('rotation_euler',frame=fr)
for fcu in cam.animation_data.action.fcurves:
 for kp in fcu.keyframe_points:kp.interpolation='LINEAR'
# Gentle focal follow to keep the falling die crisp while slate falls out of focus.
for fr,z in [(1,2.65),(16,1.3),(40,1.1),(160,1.1)]:focus.location=(.3,0,z);focus.keyframe_insert('location',frame=fr)
s.frame_set(96)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/scene.blend')
with open(OUT+'/provenance.json','w') as f:json.dump({'type':'original procedural 3D art','title':'Alea — ivory die on charcoal slate','creator':'Original scene created for Latinquote using Blender 4.3.2','source_assets':'All geometry, materials, lighting and animation are original procedural work; no stock or archive imagery.','software':['Blender 4.3.2 EEVEE Next','FFmpeg'],'resolution':[1280,720],'fps':24,'frames':160,'duration_seconds':160/24,'has_audio':False,'reproducible_script':'create_scene.py'},f,indent=2)
if '--preview' in sys.argv:
 s.render.filepath=OUT+'/preview.png';bpy.ops.render.render(write_still=True)
elif '--motion-test' in sys.argv:
 s.render.resolution_percentage=55;s.eevee.taa_render_samples=4
 for fr in [1,16]:s.frame_set(fr);s.render.filepath=OUT+'/test_%03d.png'%fr;bpy.ops.render.render(write_still=True)
elif '--render' in sys.argv:

 for fr in list(range(1,45,2))+list(range(45,158,4)):
  s.frame_set(fr);s.render.filepath=OUT+'/frames/dice_%04d.png'%fr;bpy.ops.render.render(write_still=True)
