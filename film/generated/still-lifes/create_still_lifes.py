"""Four original LATIN studio animations. Blender 4.3+, no external assets.

OMP_NUM_THREADS=2 blender -b -t 2 --python create_still_lifes.py -- preview
OMP_NUM_THREADS=2 blender -b -t 2 --python create_still_lifes.py -- render
python3 create_still_lifes.py encode

Render samples are at 1 fps; FFmpeg minterpolate produces silent 24 fps MP4s.
All geometry, materials and movements are authored here, not historical footage.
"""
import os, sys, math, json, subprocess
from pathlib import Path

OUT=Path(__file__).resolve().parent
SHOTS=[('tu-quoque',7.65),('dura-lex',7.65),('si-vis-pacem',8.65),('memento-mori',7.65)]
MODE=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else (sys.argv[1] if len(sys.argv)>1 else 'preview')

if MODE=='encode':
    for name,duration in SHOTS:
        if len(sys.argv)>2 and name not in sys.argv[2:]:continue
        cmd=['ffmpeg','-hide_banner','-loglevel','warning','-y','-threads','1','-filter_threads','1','-framerate','1','-i',str(OUT/name/'frames'/'%04d.png'),'-vf','tpad=stop_mode=clone:stop_duration=3,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:search_param=8:scd=none:vsbmc=0,format=yuv420p','-t',str(duration),'-an','-c:v','libx264','-threads','1','-preset','fast','-crf','18','-movflags','+faststart',str(OUT/(name+'.mp4'))]
        subprocess.run(cmd,check=True)
    sys.exit(0)

import bpy
from mathutils import Vector
from math import pi, sin, cos

def aim(obj,pt): obj.rotation_euler=(Vector(pt)-obj.location).to_track_quat('-Z','Y').to_euler()
def material(name,color,metal=0,rough=.4,noise=False):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if noise:
        tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=42;tex.inputs['Detail'].default_value=2
        b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.13;b.inputs['Distance'].default_value=.022
        m.node_tree.links.new(tex.outputs['Fac'],b.inputs['Height']);m.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
    return m
def bevel(o,w=.035):
    m=o.modifiers.new('Softened manufactured edges','BEVEL');m.width=w;m.segments=3
    o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    return o
def cube(name,loc,scale,mat,w=.035):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);bevel(o,w);return o
def cylinder(name,loc,radius,depth,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=radius,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(mat);bevel(o,.015)
    for p in o.data.polygons:p.use_smooth=True
    return o
def sphere(name,loc,scale,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    return o
def torus(name,loc,major,minor,mat,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=96,minor_segments=12,location=loc,major_radius=major,minor_radius=minor,rotation=rot);o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    return o
def area(name,loc,power,size,color,target=(0,1,0)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;d.use_shadow_jitter=False
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;aim(o,target);return o
def camera(loc,target,lens=52):
    bpy.ops.object.camera_add(location=loc);o=bpy.context.object;o.name='Slow studio camera';o.data.lens=lens;aim(o,target);bpy.context.scene.camera=o;return o
def setup(name):
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for d in list(bpy.data.materials):bpy.data.materials.remove(d)
    sc=bpy.context.scene;sc.render.engine='BLENDER_EEVEE_NEXT';sc.eevee.taa_render_samples=4
    sc.render.resolution_x=960;sc.render.resolution_y=540;sc.render.resolution_percentage=100
    sc.render.threads_mode='FIXED';sc.render.threads=2;sc.render.fps=1
    sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGB';sc.render.use_motion_blur=False
    sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast';sc.view_settings.exposure=.25
    sc.world.use_nodes=True;sc.world.node_tree.nodes.get('Background').inputs[0].default_value=(.012,.017,.025,1);sc.world.node_tree.nodes.get('Background').inputs[1].default_value=.28
    sc.use_nodes=False
    black=material('Original charcoal slate',(.018,.021,.026),.08,.62,True)
    ground=cube('Infinite dark studio floor',(0,0,-.14),(200,200,.25),black)
    return sc,black

def dagger():
    sc,black=setup('tu-quoque')
    stone=material('Original honed grey marble',(.29,.30,.31),.02,.62,True)
    steel=material('Original satin steel',(.46,.50,.55),.88,.28)
    brass=material('Original antique brass',(.36,.20,.065),.82,.3)
    leather=material('Original oxblood leather',(.044,.009,.008),.1,.62,True)
    slab=cube('Pale cut marble slab',(0,1,-.015),(4.5,3.65,.18),stone,.025)
    root=bpy.data.objects.new('Ceremonial dagger composition',None);bpy.context.collection.objects.link(root);root.location=(-.15,.85,.13);root.rotation_euler[2]=math.radians(-39)
    # Faceted solid blade: two cutting edges, central ridge and pointed tip.
    verts=[(-.19,-.30,0),(.19,-.30,0),(-.15,1.05,0),(.15,1.05,0),(0,1.55,0),(0,-.3,.065),(0,1.04,.065),(0,-.3,-.025),(0,1.04,-.025)]
    faces=[(0,2,6,5),(5,6,3,1),(2,4,6),(6,4,3),(0,7,8,2),(7,1,3,8),(2,8,4),(8,3,4),(0,5,1,7)]
    me=bpy.data.meshes.new('Original dagger blade mesh');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Solid ridged steel dagger',me);bpy.context.collection.objects.link(o);o.data.materials.append(steel);o.parent=root;bevel(o,.009)
    o=cube('Solid brass cross guard',(0,-.36,.02),(.83,.115,.12),brass,.035);o.parent=root
    o=cylinder('Bound leather grip',(0,-.85,.035),.11,.78,leather);o.rotation_euler[0]=pi/2;o.parent=root
    for yy in [-.53,-.64,-.75,-.86,-.97,-1.08,-1.19]:
        o=torus('Fine handle binding',(0,yy,.035),.109,.012,brass,(pi/2,0,0));o.parent=root
    o=sphere('Heavy brass pommel',(0,-1.3,.03),(.155,.14,.13),brass);o.parent=root
    key=area('Raking amber light',(-3.5,-1.0,2.5),720,.65,(1,.77,.48),(0,.7,0))
    area('Cool long softbox',(2.8,1.8,4.4),480,3.5,(.58,.72,1),(0,1,0))
    cam=camera((3.5,-4.9,6.2),(0,.15,0),56)
    def pose(t):
        key.location=(-3.5+t*.8,-1+t*.6,2.5);aim(key,(0,.7,0));cam.location=(3.5-t*.24,-4.9+t*.12,6.2-t*.10);aim(cam,(0,.15,0))
    return sc,pose

def monoliths():
    sc,black=setup('dura-lex')
    obsidian=material('Original dark veined stone',(.047,.058,.075),.16,.30,True)
    base=material('Original dark polished basalt',(.024,.029,.039),.2,.39,True)
    cube('Severe raised foundation',(0,1.6,.10),(4.5,2.5,.22),base,.018)
    for i,(x,h,w) in enumerate([(-1.14,2.5,.64),(0,3.0,.85),(1.2,2.45,.64)]):
        cube('Unbroken monolithic stone '+str(i),(x,1.7,h/2+.2),(w,.68,h),obsidian,.025)
        # Restrained recessed-face suggestion: no invented inscriptions or legal text.
        cube('Lower stepped stone plinth '+str(i),(x,1.7,.28),(w+.19,.88,.18),base,.015)
    key=area('Cold grazing architectural light',(-3,-.8,5),1450,2.3,(.62,.77,1),(0,1.7,1.3))
    area('Very narrow warm rim',(3.2,3.4,4),1300,1.5,(1,.69,.37),(0,1.7,1.8))
    area('Soft frontal stone fill',(0,-4,3),160,4,(.75,.84,1),(0,1.7,1.3))
    cam=camera((5.0,-10.0,6.3),(0,.8,1.05),44)
    def pose(t):
        cam.location=(5.0-t*.55,-10.0+t*.16,6.3);aim(cam,(0,.8,1.05));key.location.x=-3+t*.9;aim(key,(0,1.7,1.3))
    return sc,pose

def shield():
    sc,black=setup('si-vis-pacem')
    bronze=material('Original patinated bronze',(.28,.125,.037),.86,.34,True)
    gold=material('Original rubbed bronze rim',(.46,.255,.079),.88,.26)
    dark=material('Original bronze etched rings',(.075,.045,.018),.7,.5)
    center=(0,1.45,1.38)
    sphere('Solid round bronze shield',center,(1.28,.20,1.28),bronze)
    for r,mn,mat in [(1.235,.055,gold),(1.12,.015,dark),(.48,.018,dark),(.365,.025,gold)]:
        torus('Concentric forged bronze border',(0,1.25,1.38),r,mn,mat,(pi/2,0,0))
    sphere('Central protective bronze boss',(0,1.19,1.38),(.34,.23,.34),gold)
    for i in range(20):
        a=2*pi*i/20;sphere('Bronze rim rivet',(1.18*sin(a),1.19,1.38+1.18*cos(a)),(.032,.022,.032),gold)
    # A quiet pedestal avoids the shield apparently floating above the stage.
    cube('Shield support shadow',(0,1.58,.13),(.65,.48,.26),dark,.025)
    key=area('Large warm shield reflection',(-3.8,-2.0,4.3),1300,3.0,(1,.73,.40),(0,1.3,1.4))
    area('Cold bronze edge strip',(3.4,2.0,3.8),1500,2,(.43,.64,1),(0,1.4,1.5))
    area('Subtle central reflection',(0,-3.5,2),180,3,(1,.9,.65),(0,1.2,1.3))
    cam=camera((3.2,-9.0,4.5),(0,.4,.9),48)
    def pose(t):
        cam.location=(3.2-t*.35,-9+t*.15,4.5);aim(cam,(0,.4,.9));key.location.x=-3.8+t*1.3;aim(key,(0,1.3,1.4))
    return sc,pose

def candle():
    sc,black=setup('memento-mori')
    wax=material('Original aged ivory wax',(.68,.51,.28),0,.48,True)
    bronze=material('Original dark bronze candle dish',(.22,.105,.035),.82,.32)
    soot=material('Original charred wick',(.008,.005,.003),0,.97)
    cylinder('Shallow bronze candle dish',(0,1.15,.065),.70,.10,bronze)
    torus('Burnished raised dish lip',(0,1.15,.13),.66,.037,bronze)
    cylinder('Short ivory beeswax candle',(0,1.15,.77),.285,1.32,wax)
    torus('Soft irregular melted wax crown',(0,1.15,1.43),.19,.085,wax)
    for a,h in [(.2,.17),(1.2,.29),(2.4,.12),(4.6,.21),(5.3,.32)]:
        sphere('Hardened wax drip',(.264*cos(a),1.15+.264*sin(a),1.38-h/2),(.046,.044,h/2+.035),wax)
    wick=cylinder('Exposed charred wick',(0,1.15,1.48),.018,.17,soot);wick.rotation_euler[1]=.12
    emission=bpy.data.materials.new('Original flame emission');emission.use_nodes=True;n=emission.node_tree.nodes;n.clear();em=n.new('ShaderNodeEmission');em.inputs[0].default_value=(1,.28,.018,1);em.inputs[1].default_value=6;output=n.new('ShaderNodeOutputMaterial');emission.node_tree.links.new(em.outputs[0],output.inputs[0])
    verts=[];faces=[]
    for z,r,dx in [(0,.025,0),(.07,.073,0),(.18,.072,.009),(.31,.037,.026),(.43,.001,.048)]:
        for j in range(20):
            a=j*2*pi/20;verts.append((dx+r*cos(a),r*.65*sin(a),z))
    for i in range(4):
        for j in range(20):faces.append((i*20+j,i*20+(j+1)%20,(i+1)*20+(j+1)%20,(i+1)*20+j))
    mesh=bpy.data.meshes.new('Original teardrop flame mesh');mesh.from_pydata(verts,[],faces);mesh.update();flame=bpy.data.objects.new('Small living candle flame',mesh);bpy.context.collection.objects.link(flame);flame.location=(0,1.15,1.52);flame.data.materials.append(emission)
    for p in mesh.polygons:p.use_smooth=True
    d=bpy.data.lights.new('Local candle warmth','POINT');d.energy=60;d.color=(1,.35,.055);d.shadow_soft_size=.18;light=bpy.data.objects.new('Local candle warmth',d);bpy.context.collection.objects.link(light);light.location=(0,1.15,1.75)
    area('Soft warm candle body fill',(-2.5,-2,4),170,3,(1,.64,.32),(0,1.15,.8))
    area('Narrow cold wax rim',(2,2.7,3.5),220,2,(.45,.58,1),(0,1.15,1))
    cam=camera((2.3,-7.8,3.3),(0,.4,.75),55)
    sc.use_nodes=True;nodes=sc.node_tree.nodes;nodes.clear();rl=nodes.new('CompositorNodeRLayers');glow=nodes.new('CompositorNodeGlare');glow.glare_type='FOG_GLOW';glow.quality='LOW';glow.threshold=1.8;glow.size=7;out=nodes.new('CompositorNodeComposite');sc.node_tree.links.new(rl.outputs['Image'],glow.inputs['Image']);sc.node_tree.links.new(glow.outputs['Image'],out.inputs['Image'])
    def pose(t):
        life=1-.60*(t*t)
        flame.scale=(.92+.05*sin(t*6),1,life*(1+.03*sin(t*7)));flame.rotation_euler[1]=.045*sin(t*6)
        em.inputs[1].default_value=6*life;d.energy=60*life
        cam.location=(2.3-t*.18,-7.8+t*.15,3.3);aim(cam,(0,.4,.75))
    return sc,pose

BUILDERS=[dagger,monoliths,shield,candle]
for (name,duration),builder in zip(SHOTS,BUILDERS):
    folder=OUT/name;folder.mkdir(parents=True,exist_ok=True)
    sc,pose=builder();pose(.5)
    if MODE!='render':
        sc.render.filepath=str(folder/'preview.png');bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(folder/'scene.blend'))
    print('PREVIEW_READY '+name,flush=True)
    if MODE=='render':
        (folder/'frames').mkdir(exist_ok=True)
        count=math.ceil(duration)+1
        for i in range(count):
            sc.frame_set(i+1);pose(i/(count-1));sc.render.filepath=str(folder/'frames'/('%04d.png'%(i+1)));bpy.ops.render.render(write_still=True)
        print('FRAMES_READY '+name,flush=True)

provenance={'creator':'Original CGI authored for LATIN with Blender 4.3.2','nature':'Procedural studio still-lifes, not photographs, archive footage or reconstructed historical objects','external_assets':[],'license':'Original project artwork; no third-party source material','render':{'resolution':[960,540],'engine':'Blender EEVEE','samples':4,'pose_fps':1,'delivery_fps':24,'motion':'Original slow camera and lighting changes; FFmpeg motion interpolation'},'shots':[{'file':n+'.mp4','duration_requested_seconds':d,'subject':s} for (n,d),s in zip(SHOTS,['Ceremonial dagger and its shadow on stone','Three unbroken dark stone monoliths','Round bronze defensive shield','Dimming beeswax candle'])]}
(OUT/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
