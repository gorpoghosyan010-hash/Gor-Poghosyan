"""R4 «Raw → Renovated» — fully procedural Blender scene (one room, two looks, one camera).

Usage (bpy 4.2 from pip — has OpenImageDenoise; Ubuntu's blender 4.0 has no OIDN):
  python3.11 scene.py -- --pass raw|fin --out DIR [--frames 0-407] [--res 720] [--samples 24] [--step 1]
  blender -b -P scene.py -- --pass raw ...            (fallback: no OIDN -> use --samples 64, compose median-denoises)
Writes DIR/<pass>_####.png (AgX, Medium High Contrast) and, for --pass fin, DIR/fin_data_####.exr
(IndexOB = reveal region, Position = world xyz) + layout.json / camera.json next to this script's outputs.
Regions (pass_index): 1 bath zone, 2 wardrobe zone, 3 floor, 4 living zone, 5 ceiling, 6 window/side walls.
"""
import bpy, bmesh, math, json, os, sys, random
from mathutils import Vector, Matrix, Euler

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
PASS = arg('--pass', 'raw')
OUT = os.path.abspath(arg('--out', 'r4_render'))
FR = [int(v) for v in arg('--frames', '0-407').split('-')]
RES = int(arg('--res', '720'))
SAMPLES = int(arg('--samples', '24'))
STEP = int(arg('--step', '1'))
SINGLE = arg('--single', '')  # comma list of frames for look tests
FPS = 30
DETAIL_CAP = float(arg('--detail', '4'))
FIN = PASS == 'fin'
os.makedirs(OUT, exist_ok=True)
random.seed(4)

# ---------------------------------------------------------------- room / layout (metres)
RX, RY, RZ = 3.0, 2.25, 2.9          # room x∈[-3,3], y∈[-2.25,2.25], z∈[0,2.9]
DOOR = (-0.35, 0.55, 2.1)            # doorway in far wall (y=+RY): x0, x1, height
WIN = (-1.5, 0.5, 0.55, 2.5)         # window in left wall (x=-RX): y0, y1, z0, z1
WARD = (0.6, 2.98, 1.64)             # wardrobe x0, x1, front y
SOFA = (2.0, 2.97, -1.05, 1.15)      # x0, x1, y0, y1
MIRROR = (-1.9, 1.58, 0.42)          # x, z, radius
VAN = (-2.55, -1.25, 1.77)           # vanity x0, x1, front y
WC_X = -0.88
PLANT = (2.55, -1.55)
TABLE = (1.45, 0.05, 0.42)

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.render.engine = 'CYCLES'
S.cycles.device = 'CPU'
S.cycles.samples = SAMPLES
S.cycles.use_adaptive_sampling = True
S.cycles.adaptive_threshold = 0.03
S.cycles.use_denoising = True
try:
    import _cycles
    if not _cycles.with_openimagedenoise:
        S.cycles.use_denoising = False
except Exception:
    pass
if S.cycles.use_denoising:
    S.cycles.denoiser = 'OPENIMAGEDENOISE'
    S.cycles.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
    try: S.cycles.denoising_prefilter = 'ACCURATE'
    except Exception: pass
S.cycles.max_bounces = 4; S.cycles.diffuse_bounces = 2; S.cycles.glossy_bounces = 2
S.cycles.transmission_bounces = 4; S.cycles.transparent_max_bounces = 4
S.cycles.sample_clamp_indirect = 4.0
S.cycles.caustics_reflective = False; S.cycles.caustics_refractive = False
S.cycles.blur_glossy = 1.0
S.cycles.seed = 7
S.render.use_persistent_data = True
S.render.resolution_x = RES * 9 // 16 if RES >= 720 else RES
S.render.resolution_x = int(round(RES * 9 / 16 / 2)) * 2
S.render.resolution_y = RES
S.render.resolution_percentage = 100
S.render.fps = FPS
S.render.film_transparent = False
S.view_settings.view_transform = 'AgX'
try: S.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
S.view_settings.exposure = float(arg('--exposure', '-0.3'))
S.render.image_settings.file_format = 'PNG'
S.render.image_settings.color_depth = '8'
S.render.image_settings.compression = 15

def mesh_obj(name, bm, mat=None, pidx=0, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); S.collection.objects.link(ob)
    if mat: me.materials.append(mat)
    ob.pass_index = pidx
    return ob

# ---------------------------------------------------------------- node helpers
def mat_new(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    return m, nt
def nd(nt, t, loc=None, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items():
        if k.startswith('i_'):
            key = k[2:].replace('__', ' ')
            n.inputs[key].default_value = v
        else:
            setattr(n, k, v)
    return n
def ln(nt, a, b):
    nt.links.new(a, b)
def ramp(nt, src, stops):
    r = nt.nodes.new('ShaderNodeValToRGB'); el = r.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], (*stops[0][1], 1) if len(stops[0][1]) == 3 else stops[0][1]
    el[1].position, el[1].color = stops[-1][0], (*stops[-1][1], 1) if len(stops[-1][1]) == 3 else stops[-1][1]
    for p, c in stops[1:-1]:
        e = el.new(p); e.color = (*c, 1) if len(c) == 3 else c
    ln(nt, src, r.inputs[0]); return r
def mix(nt, mode, a, b, fac):
    m = nt.nodes.new('ShaderNodeMix'); m.data_type = 'RGBA'; m.blend_type = mode
    if isinstance(fac, (int, float)): m.inputs[0].default_value = fac
    else: ln(nt, fac, m.inputs[0])
    for sock, v in ((m.inputs[6], a), (m.inputs[7], b)):
        if isinstance(v, tuple): sock.default_value = (*v, 1) if len(v) == 3 else v
        else: ln(nt, v, sock)
    return m.outputs[2]
def math_(nt, op, a, b=0.0, clamp=False):
    m = nt.nodes.new('ShaderNodeMath'); m.operation = op; m.use_clamp = clamp
    for s, v in ((m.inputs[0], a), (m.inputs[1], b)):
        if isinstance(v, (int, float)): s.default_value = v
        else: ln(nt, v, s)
    return m.outputs[0]
def noise(nt, vec, scale, detail=4.0, rough=0.55, dist=0.0, dim='3D', w=0.0):
    n = nd(nt, 'ShaderNodeTexNoise'); n.noise_dimensions = dim
    n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = min(detail, DETAIL_CAP)
    n.inputs['Roughness'].default_value = rough; n.inputs['Distortion'].default_value = dist
    if dim == '4D': n.inputs['W'].default_value = w
    if vec is not None: ln(nt, vec, n.inputs['Vector'])
    return n
def voronoi(nt, vec, scale, feature='F1', rand=1.0):
    v = nd(nt, 'ShaderNodeTexVoronoi'); v.feature = feature
    v.inputs['Scale'].default_value = scale; v.inputs['Randomness'].default_value = rand
    if vec is not None: ln(nt, vec, v.inputs['Vector'])
    return v
def bump(nt, height, strength, dist=0.02, normal=None):
    b = nd(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = strength; b.inputs['Distance'].default_value = dist
    ln(nt, height, b.inputs['Height'])
    if normal is not None: ln(nt, normal, b.inputs['Normal'])
    return b.outputs[0]
def principled(nt, color, rough=0.5, normal=None, spec=0.5, metal=0.0, **extra):
    p = nd(nt, 'ShaderNodeBsdfPrincipled')
    if isinstance(color, tuple): p.inputs['Base Color'].default_value = (*color, 1)
    else: ln(nt, color, p.inputs['Base Color'])
    if isinstance(rough, (int, float)): p.inputs['Roughness'].default_value = rough
    else: ln(nt, rough, p.inputs['Roughness'])
    p.inputs['Specular IOR Level'].default_value = spec
    p.inputs['Metallic'].default_value = metal
    if normal is not None: ln(nt, normal, p.inputs['Normal'])
    for k, v in extra.items():
        key = k.replace('__', ' ')
        if isinstance(v, (int, float, tuple)):
            p.inputs[key].default_value = (*v, 1) if isinstance(v, tuple) and len(v) == 3 else v
        else: ln(nt, v, p.inputs[key])
    return p
def out(nt, shader):
    o = nd(nt, 'ShaderNodeOutputMaterial'); ln(nt, shader.outputs[0] if hasattr(shader, 'outputs') else shader, o.inputs['Surface']); return o
def uvvec(nt):
    n = nd(nt, 'ShaderNodeUVMap'); n.uv_map = 'UVMap'
    return n.outputs['UV']
def objvec(nt):
    return nd(nt, 'ShaderNodeTexCoord').outputs['Object']

# ---------------------------------------------------------------- RAW materials
def m_raw_concrete(name='raw_concrete', base=(0.43, 0.405, 0.365), stains=True, cracks=True, joints=True):
    m, nt = mat_new(name); uv = uvvec(nt)
    n1 = noise(nt, uv, 1.6, 10, 0.62)
    col = ramp(nt, n1.outputs['Fac'], [(0.3, tuple(c * 0.82 for c in base)), (0.5, base), (0.72, tuple(min(1, c * 1.14) for c in base))]).outputs[0]
    # big soft water stains / dirt clouds
    if stains:
        ns = noise(nt, uv, 0.32, 6, 0.6, dist=0.35)
        st = ramp(nt, ns.outputs['Fac'], [(0.52, (0, 0, 0)), (0.66, (1, 1, 1))]).outputs[0]
        col = mix(nt, 'MULTIPLY', col, (0.62, 0.56, 0.46), math_(nt, 'MULTIPLY', st, 0.75))
        ring = ramp(nt, ns.outputs['Fac'], [(0.5, (0, 0, 0)), (0.52, (1, 1, 1)), (0.545, (0, 0, 0)), (1, (0, 0, 0))]).outputs[0]
        col = mix(nt, 'MULTIPLY', col, (0.55, 0.48, 0.38), math_(nt, 'MULTIPLY', ring, 0.6))
    # pores / dark speckle clusters (formwork air voids)
    vp = voronoi(nt, uv, 38.0)
    pores = ramp(nt, vp.outputs['Distance'], [(0.0, (1, 1, 1)), (0.13, (0, 0, 0))]).outputs[0]
    clus = ramp(nt, noise(nt, uv, 1.1, 3).outputs['Fac'], [(0.38, (0, 0, 0)), (0.6, (1, 1, 1))]).outputs[0]
    porem = math_(nt, 'MULTIPLY', pores, clus)
    col = mix(nt, 'MIX', col, (0.16, 0.15, 0.13), math_(nt, 'MULTIPLY', porem, 0.85))
    h = math_(nt, 'MULTIPLY', porem, -1.0)
    # formwork / slab joints
    if joints:
        br = nd(nt, 'ShaderNodeTexBrick'); br.offset = 0.0
        br.inputs['Scale'].default_value = 1.0; br.inputs['Mortar Size'].default_value = 0.006; br.inputs['Mortar Smooth'].default_value = 0.6
        br.inputs['Brick Width'].default_value = 2.4; br.inputs['Row Height'].default_value = 1.2
        ln(nt, uv, br.inputs['Vector'])
        jbreak = ramp(nt, noise(nt, uv, 3.0, 2).outputs['Fac'], [(0.35, (0.2, 0.2, 0.2)), (0.6, (1, 1, 1))]).outputs[0]
        jm = math_(nt, 'MULTIPLY', br.outputs['Fac'], jbreak)
        col = mix(nt, 'MIX', col, (0.27, 0.25, 0.22), math_(nt, 'MULTIPLY', jm, 0.8))
        h = math_(nt, 'ADD', h, math_(nt, 'MULTIPLY', jm, -0.6))
    # cracks: distorted voronoi edges, partially masked
    if cracks:
        dn = noise(nt, uv, 7.0, 6, 0.7)
        vec = nd(nt, 'ShaderNodeVectorMath'); vec.operation = 'ADD'
        ln(nt, uv, vec.inputs[0]); sc = nd(nt, 'ShaderNodeVectorMath'); sc.operation = 'SCALE'; sc.inputs['Scale'].default_value = 0.08
        ln(nt, dn.outputs['Color'], sc.inputs[0]); ln(nt, sc.outputs[0], vec.inputs[1])
        vc = voronoi(nt, vec.outputs[0], 0.9, 'DISTANCE_TO_EDGE')
        cr = ramp(nt, vc.outputs['Distance'], [(0.0, (1, 1, 1)), (0.007, (0, 0, 0))]).outputs[0]
        cmask = ramp(nt, noise(nt, uv, 0.9, 3).outputs['Fac'], [(0.56, (0, 0, 0)), (0.64, (1, 1, 1))]).outputs[0]
        crm = math_(nt, 'MULTIPLY', cr, cmask)
        col = mix(nt, 'MIX', col, (0.12, 0.11, 0.1), math_(nt, 'MULTIPLY', crm, 0.9))
        h = math_(nt, 'ADD', h, math_(nt, 'MULTIPLY', crm, -1.0))
    fine = noise(nt, uv, 140, 3)
    h = math_(nt, 'ADD', h, math_(nt, 'MULTIPLY', fine.outputs['Fac'], 0.35))
    rough = ramp(nt, n1.outputs['Fac'], [(0.3, (0.78, 0.78, 0.78)), (0.7, (0.95, 0.95, 0.95))]).outputs[0]
    p = principled(nt, col, rough, bump(nt, h, 0.35, 0.01), spec=0.35)
    out(nt, p); return m

def m_gasblock(name='raw_gasblock'):
    m, nt = mat_new(name); uv = uvvec(nt)
    br = nd(nt, 'ShaderNodeTexBrick'); br.offset = 0.5; br.offset_frequency = 1
    br.inputs['Scale'].default_value = 1.0; br.inputs['Mortar Size'].default_value = 0.004; br.inputs['Mortar Smooth'].default_value = 0.3
    br.inputs['Brick Width'].default_value = 0.6; br.inputs['Row Height'].default_value = 0.25; br.inputs['Bias'].default_value = 0.0
    br.inputs['Color1'].default_value = (0.70, 0.69, 0.655, 1); br.inputs['Color2'].default_value = (0.60, 0.595, 0.57, 1)
    br.inputs['Mortar'].default_value = (0.74, 0.73, 0.70, 1)
    ln(nt, uv, br.inputs['Vector'])
    n1 = noise(nt, uv, 3.0, 8, 0.6)
    col = mix(nt, 'MULTIPLY', br.outputs['Color'], ramp(nt, n1.outputs['Fac'], [(0.3, (0.82, 0.81, 0.79)), (0.7, (1, 1, 1))]).outputs[0], 1.0)
    # glue smears and dirt near floor
    sm = ramp(nt, noise(nt, uv, 1.2, 5, 0.65, dist=0.4).outputs['Fac'], [(0.56, (0, 0, 0)), (0.66, (1, 1, 1))]).outputs[0]
    col = mix(nt, 'MIX', col, (0.78, 0.77, 0.74), math_(nt, 'MULTIPLY', sm, 0.7))
    sep = nd(nt, 'ShaderNodeSeparateXYZ'); ln(nt, uv, sep.inputs[0])
    low = ramp(nt, sep.outputs['Y'], [(0.0, (1, 1, 1)), (0.35, (0, 0, 0))]).outputs[0]
    col = mix(nt, 'MULTIPLY', col, (0.68, 0.64, 0.58), math_(nt, 'MULTIPLY', low, 0.6))
    # aerated-concrete pores
    vp = voronoi(nt, uv, 260.0)
    pores = ramp(nt, vp.outputs['Distance'], [(0.0, (1, 1, 1)), (0.18, (0, 0, 0))]).outputs[0]
    col = mix(nt, 'MIX', col, (0.38, 0.37, 0.35), math_(nt, 'MULTIPLY', pores, 0.5))
    chips = ramp(nt, noise(nt, uv, 9, 4).outputs['Fac'], [(0.66, (0, 0, 0)), (0.72, (1, 1, 1))]).outputs[0]
    h = math_(nt, 'ADD', math_(nt, 'MULTIPLY', br.outputs['Fac'], -1.0), math_(nt, 'MULTIPLY', pores, -0.5))
    h = math_(nt, 'ADD', h, math_(nt, 'MULTIPLY', chips, -0.6))
    h = math_(nt, 'ADD', h, math_(nt, 'MULTIPLY', sm, 0.25))
    p = principled(nt, col, 0.93, bump(nt, h, 0.55, 0.008), spec=0.3)
    out(nt, p); return m

def m_screed(name='raw_screed'):
    m, nt = mat_new(name); uv = uvvec(nt)
    n1 = noise(nt, uv, 0.9, 8, 0.6)
    col = ramp(nt, n1.outputs['Fac'], [(0.3, (0.44, 0.425, 0.395)), (0.55, (0.53, 0.515, 0.48)), (0.75, (0.60, 0.585, 0.55))]).outputs[0]
    dust = ramp(nt, noise(nt, uv, 0.45, 5, 0.65, dist=0.3).outputs['Fac'], [(0.5, (0, 0, 0)), (0.7, (1, 1, 1))]).outputs[0]
    col = mix(nt, 'MIX', col, (0.68, 0.66, 0.62), math_(nt, 'MULTIPLY', dust, 0.55))
    wet = ramp(nt, noise(nt, uv, 0.6, 3, 0.5, dist=0.8).outputs['Fac'], [(0.6, (0, 0, 0)), (0.68, (1, 1, 1))]).outputs[0]
    col = mix(nt, 'MULTIPLY', col, (0.75, 0.72, 0.68), math_(nt, 'MULTIPLY', wet, 0.7))
    # trowel swirls + tiny grit
    swirl = noise(nt, uv, 6.0, 2, 0.5, dist=2.0)
    grit = voronoi(nt, uv, 180.0)
    gr = ramp(nt, grit.outputs['Distance'], [(0.0, (1, 1, 1)), (0.12, (0, 0, 0))]).outputs[0]
    col = mix(nt, 'MIX', col, (0.30, 0.29, 0.27), math_(nt, 'MULTIPLY', gr, 0.45))
    vc = voronoi(nt, uv, 0.6, 'DISTANCE_TO_EDGE')
    crack = ramp(nt, vc.outputs['Distance'], [(0.0, (1, 1, 1)), (0.006, (0, 0, 0))]).outputs[0]
    crack = math_(nt, 'MULTIPLY', crack, ramp(nt, noise(nt, uv, 0.8, 2).outputs['Fac'], [(0.52, (0, 0, 0)), (0.6, (1, 1, 1))]).outputs[0])
    col = mix(nt, 'MIX', col, (0.22, 0.21, 0.2), math_(nt, 'MULTIPLY', crack, 0.8))
    h = math_(nt, 'ADD', math_(nt, 'MULTIPLY', swirl.outputs['Fac'], 0.4), math_(nt, 'MULTIPLY', gr, 0.6))
    h = math_(nt, 'SUBTRACT', h, crack)
    rough = ramp(nt, wet, [(0.0, (0.86, 0.86, 0.86)), (1.0, (0.62, 0.62, 0.62))]).outputs[0]
    p = principled(nt, col, rough, bump(nt, h, 0.25, 0.006), spec=0.4)
    out(nt, p); return m

# ---------------------------------------------------------------- FINISHED materials
def m_plaster(name='fin_plaster', base=(0.80, 0.785, 0.75)):
    m, nt = mat_new(name); uv = uvvec(nt)
    n1 = noise(nt, uv, 2.0, 6, 0.55)
    col = ramp(nt, n1.outputs['Fac'], [(0.35, tuple(c * 0.965 for c in base)), (0.65, base)]).outputs[0]
    p = principled(nt, col, 0.88, bump(nt, noise(nt, uv, 60, 4).outputs['Fac'], 0.05, 0.004), spec=0.4)
    out(nt, p); return m

def m_dark_panel(name='fin_dark_panel', base=(0.062, 0.063, 0.066), pw=1.2, ph=2.9, vein=True):
    m, nt = mat_new(name); uv = uvvec(nt)
    br = nd(nt, 'ShaderNodeTexBrick'); br.offset = 0.0
    br.inputs['Scale'].default_value = 1.0; br.inputs['Mortar Size'].default_value = 0.0025; br.inputs['Mortar Smooth'].default_value = 0.0
    br.inputs['Brick Width'].default_value = pw; br.inputs['Row Height'].default_value = ph
    br.inputs['Color1'].default_value = (1, 1, 1, 1); br.inputs['Color2'].default_value = (0.9, 0.9, 0.9, 1); br.inputs['Bias'].default_value = 0
    ln(nt, uv, br.inputs['Vector'])
    col = mix(nt, 'MULTIPLY', base, br.outputs['Color'], 1.0)
    if vein:
        nv = noise(nt, uv, 0.9, 12, 0.7, dist=1.6)
        wv = nd(nt, 'ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 1.4; wv.inputs['Distortion'].default_value = 9.0
        wv.inputs['Detail'].default_value = 6; ln(nt, uv, wv.inputs['Vector'])
        vv = ramp(nt, wv.outputs['Fac'], [(0.0, (1, 1, 1)), (0.06, (0, 0, 0))]).outputs[0]
        cl = ramp(nt, nv.outputs['Fac'], [(0.3, (0.92, 0.92, 0.92)), (0.7, (1.06, 1.06, 1.08))]).outputs[0]
        col = mix(nt, 'MULTIPLY', col, cl, 1.0)
        col = mix(nt, 'MIX', col, (0.11, 0.11, 0.115), math_(nt, 'MULTIPLY', vv, 0.10))
    col = mix(nt, 'MIX', col, (0.01, 0.01, 0.01), br.outputs['Fac'])
    rough = ramp(nt, noise(nt, uv, 3, 3).outputs['Fac'], [(0.3, (0.32, 0.32, 0.32)), (0.7, (0.42, 0.42, 0.42))]).outputs[0]
    p = principled(nt, col, rough, bump(nt, math_(nt, 'MULTIPLY', br.outputs['Fac'], -1), 0.3, 0.003), spec=0.5)
    out(nt, p); return m

def m_oak(name='fin_oak'):
    m, nt = mat_new(name); uv = uvvec(nt)
    br = nd(nt, 'ShaderNodeTexBrick'); br.offset = 0.37; br.offset_frequency = 1; br.squash = 1.0
    br.inputs['Scale'].default_value = 1.0; br.inputs['Mortar Size'].default_value = 0.0012; br.inputs['Mortar Smooth'].default_value = 0.2
    br.inputs['Brick Width'].default_value = 1.9; br.inputs['Row Height'].default_value = 0.19; br.inputs['Bias'].default_value = 0.0
    br.inputs['Color1'].default_value = (0.68, 0.52, 0.36, 1); br.inputs['Color2'].default_value = (0.50, 0.37, 0.24, 1)
    br.inputs['Mortar'].default_value = (0.12, 0.08, 0.05, 1)
    ln(nt, uv, br.inputs['Vector'])
    # per-plank random offset for grain: use brick colour as seed
    sep = nd(nt, 'ShaderNodeSeparateXYZ'); ln(nt, uv, sep.inputs[0])
    comb = nd(nt, 'ShaderNodeCombineXYZ')
    ln(nt, math_(nt, 'MULTIPLY', sep.outputs['X'], 0.12), comb.inputs['X'])
    bw = nd(nt, 'ShaderNodeRGBToBW'); ln(nt, br.outputs['Color'], bw.inputs[0])
    ln(nt, math_(nt, 'ADD', sep.outputs['Y'], math_(nt, 'MULTIPLY', bw.outputs[0], 37.0)), comb.inputs['Y'])
    wv = nd(nt, 'ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Y'
    wv.inputs['Scale'].default_value = 9.0; wv.inputs['Distortion'].default_value = 5.0; wv.inputs['Detail'].default_value = 4; wv.inputs['Detail Scale'].default_value = 1.2
    ln(nt, comb.outputs[0], wv.inputs['Vector'])
    grain = ramp(nt, wv.outputs['Fac'], [(0.0, (0.88, 0.85, 0.82)), (0.5, (1, 1, 1)), (1.0, (0.93, 0.91, 0.88))]).outputs[0]
    fine = noise(nt, comb.outputs[0], 60, 3)
    col = mix(nt, 'MULTIPLY', br.outputs['Color'], grain, 1.0)
    col = mix(nt, 'MULTIPLY', col, ramp(nt, fine.outputs['Fac'], [(0.3, (0.9, 0.9, 0.9)), (0.7, (1, 1, 1))]).outputs[0], 1.0)
    rough = ramp(nt, noise(nt, uv, 2, 3).outputs['Fac'], [(0.3, (0.34, 0.34, 0.34)), (0.7, (0.48, 0.48, 0.48))]).outputs[0]
    h = math_(nt, 'ADD', math_(nt, 'MULTIPLY', br.outputs['Fac'], -1.0), math_(nt, 'MULTIPLY', wv.outputs['Fac'], 0.08))
    p = principled(nt, col, rough, bump(nt, h, 0.25, 0.003), spec=0.5)
    out(nt, p); return m

def m_simple(name, color, rough=0.5, spec=0.5, metal=0.0, bumpscale=0.0, bumpstr=0.0, coord='obj', **extra):
    m, nt = mat_new(name)
    nrm = None
    if bumpscale:
        v = objvec(nt) if coord == 'obj' else uvvec(nt)
        nrm = bump(nt, noise(nt, v, bumpscale, 4).outputs['Fac'], bumpstr, 0.002)
    out(nt, principled(nt, color, rough, nrm, spec, metal, **extra)); return m

def m_fabric(name, color, scale=180.0, strength=0.35, sheen=0.6):
    m, nt = mat_new(name); v = objvec(nt)
    vo = voronoi(nt, v, scale)
    n = noise(nt, v, 3, 3)
    col = mix(nt, 'MULTIPLY', color, ramp(nt, n.outputs['Fac'], [(0.3, (0.9, 0.9, 0.9)), (0.7, (1, 1, 1))]).outputs[0], 1.0)
    col = mix(nt, 'MULTIPLY', col, ramp(nt, vo.outputs['Distance'], [(0.0, (0.82, 0.82, 0.82)), (0.6, (1, 1, 1))]).outputs[0], 1.0)
    p = principled(nt, col, 0.9, bump(nt, vo.outputs['Distance'], strength, 0.004), 0.3,
                   Sheen__Weight=sheen, Sheen__Roughness=0.4)
    out(nt, p); return m

def m_emit(name, color, strength):
    m, nt = mat_new(name)
    e = nd(nt, 'ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    out(nt, e); return m

def m_wood(name, base=(0.17, 0.10, 0.06), scale=7.0, rough=0.45):
    m, nt = mat_new(name); v = objvec(nt)
    wv = nd(nt, 'ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'
    wv.inputs['Scale'].default_value = scale; wv.inputs['Distortion'].default_value = 6; wv.inputs['Detail'].default_value = 3
    ln(nt, v, wv.inputs['Vector'])
    g = ramp(nt, wv.outputs['Fac'], [(0.0, (0.7, 0.7, 0.7)), (0.5, (1.1, 1.1, 1.1)), (1.0, (0.85, 0.85, 0.85))]).outputs[0]
    col = mix(nt, 'MULTIPLY', base, g, 1.0)
    out(nt, principled(nt, col, rough, bump(nt, wv.outputs['Fac'], 0.05, 0.002), 0.5)); return m

def m_leaf():
    m, nt = mat_new('leaf'); v = objvec(nt)
    n = noise(nt, v, 9, 2)
    col = ramp(nt, n.outputs['Fac'], [(0.3, (0.10, 0.16, 0.06)), (0.7, (0.20, 0.27, 0.12))]).outputs[0]
    p = principled(nt, col, 0.55, None, 0.5)
    tr = nd(nt, 'ShaderNodeBsdfTranslucent'); tr.inputs['Color'].default_value = (0.25, 0.40, 0.08, 1)
    mx = nd(nt, 'ShaderNodeMixShader'); mx.inputs[0].default_value = 0.25
    ln(nt, p.outputs[0], mx.inputs[1]); ln(nt, tr.outputs[0], mx.inputs[2])
    out(nt, mx); return m

# ---------------------------------------------------------------- geometry helpers
BAKE = []
def quad(name, pts, uvs, mat, pidx, inward, bake=True):
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in pts]; f = bm.faces.new(vs)
    bm.normal_update()
    if f.normal.dot(Vector(inward)) < 0:
        f.normal_flip()
    lay = bm.loops.layers.uv.new('UVMap'); lay2 = bm.loops.layers.uv.new('bake')
    us = [u for u, v in uvs]; vv = [v for u, v in uvs]
    for loop in f.loops:
        i = vs.index(loop.vert); loop[lay].uv = uvs[i]
        loop[lay2].uv = ((uvs[i][0] - min(us)) / (max(us) - min(us)), (uvs[i][1] - min(vv)) / (max(vv) - min(vv)))
    ob = mesh_obj(name, bm, mat, pidx)
    if bake:
        ob['bake_size'] = (max(us) - min(us), max(vv) - min(vv)); BAKE.append(ob)
    return ob

def wall_rect(name, axis, c, a0, a1, z0, z1, mat, pidx, inward, uoff=0.0):
    """axis 'y' => plane y=c spanning x∈[a0,a1]; axis 'x' => plane x=c spanning y∈[a0,a1]."""
    if axis == 'y':
        pts = [(a0, c, z0), (a1, c, z0), (a1, c, z1), (a0, c, z1)]
    else:
        pts = [(c, a0, z0), (c, a1, z0), (c, a1, z1), (c, a0, z1)]
    uvs = [(a0 + uoff, z0), (a1 + uoff, z0), (a1 + uoff, z1), (a0 + uoff, z1)]
    return quad(name, pts, uvs, mat, pidx, inward)

def box(name, x0, x1, y0, y1, z0, z1, mat, pidx=0, bevel=0.0, seg=3, smooth=True, rot=None, pivot=None):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = x0 + (v.co.x + 0.5) * (x1 - x0); v.co.y = y0 + (v.co.y + 0.5) * (y1 - y0); v.co.z = z0 + (v.co.z + 0.5) * (z1 - z0)
    # box uv: world-metre coords from dominant axis
    lay = bm.loops.layers.uv.new()
    for f in bm.faces:
        n = f.normal
        for lp in f.loops:
            co = lp.vert.co
            if abs(n.z) > 0.5: lp[lay].uv = (co.x, co.y)
            elif abs(n.y) > 0.5: lp[lay].uv = (co.x, co.z)
            else: lp[lay].uv = (co.y, co.z)
    ob = mesh_obj(name, bm, mat, pidx, smooth=smooth and bevel > 0)
    if bevel > 0:
        md = ob.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'ANGLE'
        md.harden_normals = True
        if hasattr(ob.data, 'use_auto_smooth'): ob.data.use_auto_smooth = True
    if rot is not None:
        pv = Vector(pivot)
        ob.data.transform(Matrix.Translation(-pv)); ob.matrix_world = Matrix.Translation(pv) @ Euler(rot).to_matrix().to_4x4()
    return ob

def cyl(name, x, y, z0, z1, r, mat, pidx=0, verts=48, axis='z', bevel=0.0, seg=3):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r, depth=(z1 - z0))
    ob = mesh_obj(name, bm, mat, pidx, smooth=True)
    if hasattr(ob.data, 'use_auto_smooth'): ob.data.use_auto_smooth = True
    if bevel > 0:
        md = ob.modifiers.new('bev', 'BEVEL'); md.width = bevel; md.segments = seg; md.limit_method = 'ANGLE'; md.harden_normals = True
    else:
        for p in ob.data.polygons: p.use_smooth = abs(p.normal.z) < 0.5
    c = (z0 + z1) / 2
    if axis == 'z': ob.location = (x, y, c)
    elif axis == 'y': ob.rotation_euler = (math.pi / 2, 0, 0); ob.location = (x, c, y)  # here y-param = z centre
    elif axis == 'x': ob.rotation_euler = (0, math.pi / 2, 0); ob.location = (c, x, y)
    return ob

def curve(name, pts, radius, mat, pidx=0):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 3
    sp = cu.splines.new('NURBS' if len(pts) > 2 else 'POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    if len(pts) > 2: sp.order_u = 3; sp.use_endpoint_u = True; sp.resolution_u = 12
    ob = bpy.data.objects.new(name, cu); S.collection.objects.link(ob); cu.materials.append(mat); ob.pass_index = pidx
    return ob

# ---------------------------------------------------------------- shared shell (same geometry in both passes)
if FIN:
    M_CEIL = m_plaster('fin_ceiling', (0.84, 0.835, 0.82))
    M_FLOOR = m_oak()
    M_FAR = m_dark_panel()
    M_SIDE = m_plaster()
    M_BATHW = m_dark_panel('fin_bath_stone', (0.085, 0.083, 0.08), 0.6, 1.2, True)
else:
    M_CEIL = m_raw_concrete()
    M_FLOOR = m_screed()
    M_FAR = M_SIDE = M_BATHW = m_gasblock()

e = 0.02
quad('ceiling', [(-RX - e, -RY - e, RZ), (RX + e, -RY - e, RZ), (RX + e, RY + e, RZ), (-RX - e, RY + e, RZ)],
     [(-RX, -RY), (RX, -RY), (RX, RY), (-RX, RY)], M_CEIL, 5, (0, 0, -1))
quad('floor', [(-RX - e, -RY - e, 0), (RX + e, -RY - e, 0), (RX + e, RY + e, 0), (-RX - e, RY + e, 0)],
     [(-RX, -RY), (RX, -RY), (RX, RY), (-RX, RY)], M_FLOOR, 3, (0, 0, 1))
# far wall (y=+RY): bath zone | doorway | wardrobe zone
wall_rect('far_bath', 'y', RY, -RX - e, DOOR[0], 0, RZ, M_BATHW, 1, (0, -1, 0))
wall_rect('far_ward', 'y', RY, DOOR[1], RX + e, 0, RZ, M_FAR, 2, (0, -1, 0))
wall_rect('far_door_top', 'y', RY, DOOR[0], DOOR[1], DOOR[2], RZ, M_FAR, 2, (0, -1, 0))
# right wall (x=+RX): living zone
wall_rect('right_wall', 'x', RX, -RY - e, RY + e, 0, RZ, M_FAR if FIN else M_SIDE, 4, (-1, 0, 0))
# near wall (behind camera)
wall_rect('near_wall', 'y', -RY, -RX - e, RX + e, 0, RZ, M_SIDE, 6, (0, 1, 0))
# left wall (x=-RX) with window opening
y0, y1, z0, z1 = WIN
wall_rect('left_a', 'x', -RX, -RY - e, y0, 0, RZ, M_SIDE, 6, (1, 0, 0))
wall_rect('left_b', 'x', -RX, y1, RY + e, 0, RZ, M_SIDE, 6, (1, 0, 0))
wall_rect('left_low', 'x', -RX, y0, y1, 0, z0, M_SIDE, 6, (1, 0, 0))
wall_rect('left_high', 'x', -RX, y0, y1, z1, RZ, M_SIDE, 6, (1, 0, 0))
# window reveals (wall thickness 0.3) + black aluminium frame
WT = 0.3
M_REV = M_SIDE
quad('win_sill', [(-RX - WT, y0, z0), (-RX, y0, z0), (-RX, y1, z0), (-RX - WT, y1, z0)], [(0, y0), (WT, y0), (WT, y1), (0, y1)], M_REV, 6, (0, 0, 1))
quad('win_head', [(-RX - WT, y0, z1), (-RX, y0, z1), (-RX, y1, z1), (-RX - WT, y1, z1)], [(0, y0), (WT, y0), (WT, y1), (0, y1)], M_REV, 6, (0, 0, -1))
quad('win_jl', [(-RX - WT, y0, z0), (-RX, y0, z0), (-RX, y0, z1), (-RX - WT, y0, z1)], [(0, z0), (WT, z0), (WT, z1), (0, z1)], M_REV, 6, (0, 1, 0))
quad('win_jr', [(-RX - WT, y1, z0), (-RX, y1, z0), (-RX, y1, z1), (-RX - WT, y1, z1)], [(0, z0), (WT, z0), (WT, z1), (0, z1)], M_REV, 6, (0, -1, 0))
M_ALU = m_simple('alu_black', (0.03, 0.03, 0.032), 0.35, 0.5, 0.6)
fx = -RX - 0.2
box('wf_bot', fx - 0.04, fx + 0.04, y0, y1, z0, z0 + 0.06, M_ALU, 6, 0.004)
box('wf_top', fx - 0.04, fx + 0.04, y0, y1, z1 - 0.06, z1, M_ALU, 6, 0.004)
box('wf_l', fx - 0.04, fx + 0.04, y0, y0 + 0.06, z0, z1, M_ALU, 6, 0.004)
box('wf_r', fx - 0.04, fx + 0.04, y1 - 0.06, y1, z0, z1, M_ALU, 6, 0.004)
box('wf_mid', fx - 0.04, fx + 0.04, (y0 + y1) / 2 - 0.03, (y0 + y1) / 2 + 0.03, z0, z1, M_ALU, 6, 0.004)
# outside: ground + a facade across the street (seen only as bright blur)
M_GROUND = m_simple('outside_ground', (0.35, 0.33, 0.3), 0.9)
quad('ground', [(-60, -40, -9), (-3.4, -40, -9), (-3.4, 40, -9), (-60, 40, -9)], [(0, 0), (1, 0), (1, 1), (0, 1)], M_GROUND, 0, (0, 0, 1), bake=False)
M_FACADE = m_simple('facade', (0.62, 0.58, 0.52), 0.85)
box('facade', -32, -30, -25, 25, -9, 18, M_FACADE)

# doorway: raw = opening into a dark corridor; fin = flush hidden door
if FIN:
    quad('door', [(DOOR[0], RY - 0.002, 0), (DOOR[1], RY - 0.002, 0), (DOOR[1], RY - 0.002, DOOR[2]), (DOOR[0], RY - 0.002, DOOR[2])],
         [(DOOR[0] + 0.15, 0), (DOOR[1] + 0.15, 0), (DOOR[1] + 0.15, DOOR[2]), (DOOR[0] + 0.15, DOOR[2])], M_FAR, 2, (0, -1, 0))
    box('door_handle', DOOR[1] - 0.12, DOOR[1] - 0.1, RY - 0.03, RY - 0.003, 0.7, 1.2, M_ALU, 2, 0.003)
else:
    cd = 1.6
    wall_rect('cor_l', 'x', DOOR[0], RY, RY + cd, 0, DOOR[2], M_FAR, 2, (1, 0, 0))
    wall_rect('cor_r', 'x', DOOR[1], RY, RY + cd, 0, DOOR[2], M_FAR, 2, (-1, 0, 0))
    wall_rect('cor_back', 'y', RY + cd, DOOR[0], DOOR[1], 0, DOOR[2], M_FAR, 2, (0, -1, 0))
    quad('cor_floor', [(DOOR[0], RY, 0), (DOOR[1], RY, 0), (DOOR[1], RY + cd, 0), (DOOR[0], RY + cd, 0)], [(0, 0), (1, 0), (1, cd), (0, cd)], M_FLOOR, 2, (0, 0, 1))
    quad('cor_ceil', [(DOOR[0], RY, DOOR[2]), (DOOR[1], RY, DOOR[2]), (DOOR[1], RY + cd, DOOR[2]), (DOOR[0], RY + cd, DOOR[2])], [(0, 0), (1, 0), (1, cd), (0, cd)], M_CEIL, 2, (0, 0, -1))
    quad('door_jamb_l', [(DOOR[0], RY, 0), (DOOR[0], RY + 0.2, 0), (DOOR[0], RY + 0.2, DOOR[2]), (DOOR[0], RY, DOOR[2])], [(0, 0), (0.2, 0), (0.2, 2.1), (0, 2.1)], M_FAR, 2, (1, 0, 0))

# ---------------------------------------------------------------- lighting (shared)
world = bpy.data.worlds.new('w'); S.world = world; world.use_nodes = True
wn = world.node_tree; wn.nodes.clear()
sky = wn.nodes.new('ShaderNodeTexSky'); sky.sky_type = 'NISHITA'
SUN_EL, SUN_ROT = math.radians(30), math.radians(200)
sky.sun_elevation = SUN_EL; sky.sun_rotation = SUN_ROT; sky.altitude = 400; sky.air_density = 1.2; sky.dust_density = 2.5
sky.sun_disc = False
bg = wn.nodes.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = 0.35
wo = wn.nodes.new('ShaderNodeOutputWorld')
wn.links.new(sky.outputs[0], bg.inputs[0]); wn.links.new(bg.outputs[0], wo.inputs[0])
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 4.2; sun.angle = math.radians(1.5); sun.color = (1.0, 0.93, 0.84)
so = bpy.data.objects.new('sun', sun); S.collection.objects.link(so)
# sun direction: from outside (−x) into room, slightly toward +y
d = Vector((math.cos(SUN_EL) * math.cos(SUN_ROT), math.cos(SUN_EL) * math.sin(SUN_ROT), math.sin(SUN_EL)))
so.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
# window portal
pl = bpy.data.lights.new('portal', 'AREA'); pl.shape = 'RECTANGLE'; pl.size = WIN[1] - WIN[0]; pl.size_y = WIN[3] - WIN[2]
pl.cycles.is_portal = True
po = bpy.data.objects.new('portal', pl); S.collection.objects.link(po)
po.location = (-RX - 0.25, (WIN[0] + WIN[1]) / 2, (WIN[2] + WIN[3]) / 2)
po.rotation_euler = (0, math.radians(90), math.radians(90))
po.rotation_euler = Vector((1, 0, 0)).to_track_quat('-Z', 'Z').to_euler()
# soft sky-bounce fill from the window side (stands in for multi-bounce daylight; invisible)
fl = bpy.data.lights.new('fill', 'AREA'); fl.shape = 'RECTANGLE'; fl.size = 2.2; fl.size_y = 2.0; fl.energy = 70; fl.color = (0.92, 0.95, 1.0)
fo = bpy.data.objects.new('fill', fl); S.collection.objects.link(fo); fo.location = (-RX + 0.05, -0.5, 1.5)
fo.rotation_euler = Vector((1, 0.1, -0.05)).to_track_quat('-Z', 'Z').to_euler(); fo.visible_camera = False; fo.visible_glossy = False
fl2 = bpy.data.lights.new('fill2', 'AREA'); fl2.size = 3.0; fl2.size_y = 2.0; fl2.energy = 45 if not FIN else 12; fl2.color = (1.0, 0.97, 0.92)
fo2 = bpy.data.objects.new('fill2', fl2); S.collection.objects.link(fo2); fo2.location = (0.5, -2.0, 2.0)
fo2.rotation_euler = Vector((0, 1, -0.4)).to_track_quat('-Z', 'Z').to_euler(); fo2.visible_camera = False; fo2.visible_glossy = False

WARM = (1.0, 0.72, 0.45)   # ≈3000K
SPOTS = [(-2.2, 1.55), (-1.2, 1.55), (-0.2, 1.3), (0.95, 1.25), (1.8, 1.25), (2.65, 1.25),
         (-1.7, 0.0), (0.0, -0.1), (1.6, -0.5), (2.5, -1.2), (2.5, 0.6), (-1.7, -1.5), (0.2, -1.7)]

if not FIN:
    # ------------------------------------------------------------ RAW props
    M_CONDUIT = m_simple('conduit', (0.45, 0.44, 0.42), 0.6, 0.5, bumpscale=80, bumpstr=0.4)
    M_CONDUIT2 = m_simple('conduit_orange', (0.55, 0.22, 0.06), 0.55, 0.5, bumpscale=80, bumpstr=0.4)
    M_WIRE = m_simple('wire', (0.02, 0.02, 0.02), 0.4)
    M_WIRE_R = m_simple('wire_r', (0.35, 0.03, 0.02), 0.4)
    M_WIRE_B = m_simple('wire_b', (0.02, 0.08, 0.35), 0.4)
    zc = RZ - 0.015
    curve('cond1', [(-2.9, 0.4, zc), (-1.5, 0.45, zc), (-0.2, 0.2, zc), (0.0, 0.0, zc)], 0.012, M_CONDUIT)
    curve('cond2', [(0.0, 0.0, zc), (0.9, 0.8, zc), (1.8, 1.7, zc), (2.9, 1.9, zc)], 0.012, M_CONDUIT)
    curve('cond3', [(0.0, 0.0, zc), (0.4, -0.9, zc), (0.6, -2.2, zc)], 0.012, M_CONDUIT2)
    curve('cond4', [(-1.2, 2.2, zc), (-1.3, 1.2, zc), (-1.7, 0.0, zc), (-1.75, -1.0, zc)], 0.011, M_CONDUIT2)
    curve('cond5', [(1.6, -0.2, zc), (2.2, -0.6, zc), (2.95, -0.7, zc)], 0.011, M_CONDUIT)
    M_BOX = m_simple('jbox', (0.5, 0.5, 0.48), 0.6)
    cyl('jbox_c', 0.0, 0.0, RZ - 0.04, RZ, 0.06, M_BOX)
    cyl('jbox_b', -1.7, 0.0, RZ - 0.04, RZ, 0.05, M_BOX)
    # dangling wires
    for i, (mat, dx) in enumerate([(M_WIRE, 0.0), (M_WIRE_R, 0.02), (M_WIRE_B, -0.02)]):
        curve(f'wire{i}', [(0.0 + dx, 0.0, RZ - 0.03), (0.05 + dx, 0.03, RZ - 0.25), (0.02 + dx * 3, 0.1, RZ - 0.42 - i * 0.05)], 0.003, mat)
    curve('wire_b2', [(-1.7, 0.0, RZ - 0.03), (-1.68, 0.05, RZ - 0.2), (-1.6, 0.08, RZ - 0.3)], 0.003, M_WIRE_R)
    # bare work bulb hanging over the middle
    curve('bulb_cord', [(0.6, -0.5, RZ), (0.6, -0.5, 2.25)], 0.004, M_WIRE)
    cyl('bulb_sock', 0.6, -0.5, 2.18, 2.26, 0.018, M_WIRE)
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=0.035)
    bo = mesh_obj('bulb', bm, m_emit('bulb', (1.0, 0.8, 0.55), 40.0), 0, smooth=True); bo.location = (0.6, -0.5, 2.14)
    bl = bpy.data.lights.new('bulb_l', 'POINT'); bl.energy = 25; bl.color = (1.0, 0.8, 0.6); bl.shadow_soft_size = 0.03
    blo = bpy.data.objects.new('bulb_l', bl); S.collection.objects.link(blo); blo.location = (0.6, -0.5, 2.08)
    # socket back-boxes in walls
    for (x, z) in [(-2.3, 0.3), (-1.0, 1.1), (1.2, 0.3), (2.2, 1.1)]:
        cyl(f'sock{x}', x, RY - 0.01, z - 0.0, z, 0.034, M_WIRE, axis='y').location = (x, RY - 0.004, z)
    for (y, z) in [(-0.6, 0.3), (0.9, 0.3), (0.2, 1.1)]:
        o = cyl(f'sockr{y}', y, z, RX - 0.008, RX, 0.034, M_WIRE, axis='x'); o.location = (RX - 0.004, y, z)
    # pallet of gas blocks + loose blocks + bucket + debris
    M_PAL = m_wood('pallet', (0.42, 0.30, 0.18), 18, 0.85)
    M_GB = m_gasblock('raw_gasblock_obj')
    px, py = -1.75, -0.45
    for i in range(3):
        box(f'pal_s{i}', px - 0.6, px + 0.6, py - 0.4 + i * 0.36, py - 0.32 + i * 0.36, 0.0, 0.1, M_PAL, 0, 0.004)
    for i in range(7):
        box(f'pal_t{i}', px - 0.6 + i * 0.185, px - 0.6 + i * 0.185 + 0.12, py - 0.4, py + 0.4, 0.1, 0.122, M_PAL, 0, 0.003)
    for layer in range(4):
        for j in range(2):
            for k in range(3):
                if layer == 3 and (j, k) in ((1, 2), (0, 0)): continue
                bx0 = px - 0.6 + j * 0.6 + random.uniform(-0.01, 0.01); by0 = py - 0.4 + k * 0.27
                if layer % 2: by0 += 0.0
                box(f'gb{layer}{j}{k}', bx0 + 0.003, bx0 + 0.597, by0 + 0.003, by0 + 0.262, 0.122 + layer * 0.25 + 0.002, 0.122 + layer * 0.25 + 0.248, M_GB, 0, 0.006)
    for (x, y, rz) in [(-0.5, 0.9, 0.3), (2.3, -1.6, -0.5), (1.4, 1.2, 1.1)]:
        box(f'gbl{x}', x - 0.3, x + 0.3, y - 0.125, y + 0.125, 0.0, 0.25, M_GB, 0, 0.008, rot=(0, 0, rz), pivot=(x, y, 0))
    M_BUCKET = m_simple('bucket', (0.75, 0.74, 0.7), 0.5)
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=40, radius1=0.13, radius2=0.16, depth=0.33)
    bk = mesh_obj('bucket', bm, M_BUCKET, 0, smooth=True); bk.location = (-2.35, 0.9, 0.165)
    M_DEB = m_simple('debris', (0.55, 0.54, 0.5), 0.9)
    for i in range(70):
        x = random.uniform(-2.8, 2.8); y = random.uniform(-2.0, 2.1)
        if abs(x - px) < 0.8 and abs(y - py) < 0.55: continue
        s = random.uniform(0.008, 0.035)
        box(f'deb{i}', x - s, x + s, y - s * 0.8, y + s * 0.8, 0, s * 0.9, M_DEB, 0, s * 0.3, 2, rot=(random.random(), random.random(), random.random() * 6), pivot=(x, y, s * 0.4))
    # rough window: no glass in the raw shell either (keeps sun clean)
else:
    # ------------------------------------------------------------ FINISHED interior
    M_GRAPH = m_simple('graphite', (0.03, 0.031, 0.033), 0.45, 0.5)
    M_INNER = m_wood('ward_inner', (0.30, 0.25, 0.20), 10, 0.55)
    M_LED = m_emit('led', WARM, 18.0)
    M_LEDS = m_emit('led_soft', WARM, 2.5)
    # recessed ceiling spots: black ring + emissive lens + real spot lamps
    M_RING = m_simple('spot_ring', (0.02, 0.02, 0.02), 0.3, 0.5, 0.5)
    M_LENS = m_emit('lens', (1.0, 0.85, 0.65), 30.0)
    for i, (x, y) in enumerate(SPOTS):
        cyl(f'spot_ring{i}', x, y, RZ - 0.004, RZ - 0.001, 0.045, M_RING, 5, 32)
        cyl(f'spot_lens{i}', x, y, RZ - 0.006, RZ - 0.003, 0.026, M_LENS, 5, 24)
        sl = bpy.data.lights.new(f'spot{i}', 'SPOT'); sl.energy = 55; sl.color = WARM; sl.spot_size = math.radians(75); sl.spot_blend = 0.6; sl.shadow_soft_size = 0.03
        so_ = bpy.data.objects.new(f'spot{i}', sl); S.collection.objects.link(so_); so_.location = (x, y, RZ - 0.02)
    # linear light slot in ceiling in front of the wardrobe
    box('ceil_slot', WARD[0] + 0.05, WARD[1] - 0.05, WARD[2] - 0.17, WARD[2] - 0.14, RZ - 0.004, RZ - 0.001, M_LED, 5)
    # ---- wardrobe (region 2)
    x0, x1, fy = WARD; by = RY
    top = 2.62
    box('ward_bulk', x0 - 0.02, x1, fy - 0.02, by, top, RZ, M_GRAPH, 2, 0.003)          # bulkhead above
    box('ward_plinth', x0, x1, fy + 0.04, by, 0, 0.08, M_GRAPH, 2)
    box('ward_back', x0, x1, by - 0.02, by - 0.001, 0.08, top, M_INNER, 2)
    bays = [x0, x0 + 0.8, x0 + 1.6, x1]
    for i, bx in enumerate(bays):
        box(f'ward_div{i}', bx - 0.012, bx + 0.012, fy, by, 0.0, top, M_GRAPH, 2, 0.003)
    box('ward_top', x0, x1, fy, by, top - 0.025, top, M_GRAPH, 2, 0.003)
    def shelf(name, xa, xb, z):
        box(name, xa + 0.012, xb - 0.012, fy + 0.02, by - 0.02, z - 0.022, z, M_GRAPH, 2, 0.002)
        box(name + '_led', xa + 0.03, xb - 0.03, fy + 0.035, fy + 0.045, z - 0.026, z - 0.022, M_LED, 2)
    # bay A: drawers + rail with shirts/jackets + top shelf
    xa, xb = bays[0], bays[1]
    for k in range(3):
        box(f'drw{k}', xa + 0.016, xb - 0.016, fy - 0.005, fy + 0.02, 0.1 + k * 0.22, 0.3 + k * 0.22, M_GRAPH, 2, 0.003)
        box(f'drw_h{k}', (xa + xb) / 2 - 0.12, (xa + xb) / 2 + 0.12, fy - 0.012, fy - 0.004, 0.27 + k * 0.22, 0.282 + k * 0.22, m_simple('brass', (0.6, 0.45, 0.25), 0.3, 0.5, 1.0) if k == 0 else bpy.data.materials['brass'], 2)
    shelf('shA0', xa, xb, 0.78)
    shelf('shA1', xa, xb, 2.15)
    M_RAIL = bpy.data.materials['brass']
    rail = cyl('railA', (fy + by) / 2, 2.05, xa + 0.02, xb - 0.02, 0.009, M_RAIL, 2, 16, axis='x')
    rail.location = ((xa + xb) / 2, (fy + by) / 2, 2.05)
    rail.data.transform(Matrix.Scale(1.0, 4))
    CLOTH = [(0.06, 0.06, 0.065), (0.72, 0.69, 0.62), (0.86, 0.85, 0.82), (0.16, 0.19, 0.25), (0.45, 0.34, 0.23), (0.30, 0.30, 0.29)]
    cm = [m_fabric(f'cloth{i}', c, 260, 0.2, 0.5) for i, c in enumerate(CLOTH)]
    def hang(prefix, xa, xb, rz, lens):
        n = int((xb - xa - 0.06) / 0.07)
        for k in range(n):
            x = xa + 0.06 + k * 0.07 + random.uniform(-0.01, 0.01)
            L = random.choice(lens); t = random.uniform(0.035, 0.06); w = random.uniform(0.40, 0.46)
            yc = (fy + by) / 2
            o = box(f'{prefix}{k}', x - t / 2, x + t / 2, yc - w / 2, yc + w / 2, rz - 0.03 - L, rz - 0.03, random.choice(cm), 2, 0.014, 3,
                    rot=(0, random.uniform(-0.04, 0.04), random.uniform(-0.12, 0.12)), pivot=(x, yc, rz))
            # shoulders: taper top by scaling verts near the top
            for v in o.data.vertices:
                if v.co.z > rz - 0.03 - 0.08 + 0.0 and False: pass
            curve(f'{prefix}{k}_hk', [(x, yc, rz - 0.03), (x, yc, rz + 0.005)], 0.0025, M_RAIL, 2)
    hang('clA', xa, xb, 2.05, [0.75, 0.8, 0.95, 1.0])
    # bay B: open shelves with folded stacks, boxes, shoes
    xa, xb = bays[1], bays[2]
    for k, z in enumerate([0.42, 0.78, 1.14, 1.5, 1.86, 2.22]):
        shelf(f'shB{k}', xa, xb, z)
        if k in (1, 2, 3):
            for s in range(2):
                sx = xa + 0.08 + s * 0.34; h0 = z
                for q in range(random.randint(3, 5)):
                    hh = random.uniform(0.035, 0.05); c = random.choice(cm)
                    box(f'fold{k}{s}{q}', sx + random.uniform(-0.01, 0.01), sx + 0.28, fy + 0.12, by - 0.08, h0, h0 + hh, c, 2, 0.012, 3)
                    h0 += hh
        if k == 0:
            for s in range(3):
                sx = xa + 0.06 + s * 0.23
                for side in range(2):
                    box(f'shoe{s}{side}', sx + side * 0.1, sx + side * 0.1 + 0.085, fy + 0.15, by - 0.12, z, z + 0.09, random.choice(cm[:2] + cm[4:5]), 2, 0.03, 4)
        if k in (4, 5):
            M_BOXB = m_simple('storebox', (0.62, 0.56, 0.47), 0.7) if 'storebox' not in bpy.data.materials else bpy.data.materials['storebox']
            box(f'sbox{k}', xa + 0.1, xb - 0.1, fy + 0.1, by - 0.06, z, z + 0.26, M_BOXB, 2, 0.006)
    # bay C: long coats
    xa, xb = bays[2], bays[3]
    shelf('shC0', xa, xb, 2.2)
    box('shC_base', xa + 0.012, xb - 0.012, fy + 0.02, by - 0.02, 0.08, 0.3, M_GRAPH, 2, 0.003)
    rail = cyl('railC', 0, 0, xa + 0.02, xb - 0.02, 0.009, M_RAIL, 2, 16, axis='x'); rail.location = ((xa + xb) / 2, (fy + by) / 2, 2.1)
    hang('clC', xa, xb, 2.1, [1.1, 1.2, 1.3])
    # vertical LED in the dividers' front edges (warm accent)
    for i, bx in enumerate(bays[1:3]):
        box(f'ward_vled{i}', bx - 0.004, bx + 0.004, fy - 0.004, fy + 0.002, 0.1, top - 0.05, M_LEDS, 2)
    # ---- bath zone (region 1): mirror, vanity, WC
    mx, mz, mr = MIRROR
    M_MIR = m_simple('mirror', (0.92, 0.92, 0.92), 0.015, 0.5, 1.0)
    M_HALO = m_emit('halo', WARM, 12.0)
    cyl('mirror_halo', mx, mz, RY - 0.02, RY - 0.012, mr + 0.012, M_HALO, 1, 64, axis='y').location = (mx, RY - 0.016, mz)
    cyl('mirror', mx, mz, RY - 0.035, RY - 0.025, mr, M_MIR, 1, 96, axis='y').location = (mx, RY - 0.03, mz)
    cyl('mirror_back', mx, mz, RY - 0.025, RY - 0.02, mr - 0.01, M_GRAPH, 1, 64, axis='y').location = (mx, RY - 0.0225, mz)
    vx0, vx1, vfy = VAN
    M_WAL = m_wood('walnut', (0.16, 0.095, 0.055), 9, 0.5)
    box('vanity', vx0, vx1, vfy, RY, 0.42, 0.8, M_WAL, 1, 0.004)
    box('vanity_line', vx0 + 0.01, vx1 - 0.01, vfy - 0.001, vfy + 0.002, 0.605, 0.612, M_GRAPH, 1)
    M_STONE = m_simple('top_stone', (0.70, 0.68, 0.64), 0.35, 0.5, bumpscale=40, bumpstr=0.05)
    box('vanity_top', vx0, vx1, vfy - 0.01, RY, 0.8, 0.83, M_STONE, 1, 0.003)
    box('vanity_led', vx0 + 0.04, vx1 - 0.04, vfy + 0.03, vfy + 0.04, 0.415, 0.42, M_LED, 1)
    M_CER = m_simple('ceramic', (0.86, 0.86, 0.85), 0.08, 0.6, Coat__Weight=0.6, Coat__Roughness=0.05)
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=0.2)
    for v in bm.verts:
        if v.co.z > 0: v.co.z = 0.0
        v.co.z *= 0.55
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.11))
    bas = mesh_obj('basin', bm, M_CER, 1, smooth=True); bas.location = (mx, (vfy + RY) / 2 - 0.02, 0.83)
    cyl('basin_in', mx, (vfy + RY) / 2 - 0.02, 0.938, 0.942, 0.17, m_simple('basin_in', (0.78, 0.78, 0.77), 0.1, 0.6), 1, 48)
    sp = cyl('spout', mx, 1.05, RY - 0.16, RY - 0.005, 0.011, M_ALU, 1, 16, axis='y'); sp.location = (mx, RY - 0.08, 1.05)
    # wall-hung WC
    wx = WC_X
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= 0.36; v.co.y = (v.co.y + 0.5) * 0.54; v.co.z = (v.co.z + 0.5) * 0.3
        if v.co.y > 0.3: v.co.x *= 0.82
    wc = mesh_obj('wc', bm, M_CER, 1, smooth=True)
    md = wc.modifiers.new('bev', 'BEVEL'); md.width = 0.07; md.segments = 6
    md2 = wc.modifiers.new('sub', 'SUBSURF'); md2.levels = 1; md2.render_levels = 2
    wc.rotation_euler = (0, 0, math.pi); wc.location = (wx, RY, 0.33)
    box('wc_seat', wx - 0.17, wx + 0.17, RY - 0.54, RY - 0.06, 0.632, 0.655, M_CER, 1, 0.02, 4)
    box('flush', wx - 0.11, wx + 0.11, RY - 0.012, RY - 0.001, 1.0, 1.15, M_ALU, 1, 0.003)
    # tall niche with LED between vanity and wall corner
    box('niche_led', -2.86, -2.84, RY - 0.01, RY - 0.002, 0.1, 2.4, M_LEDS, 1)
    # ---- living zone (region 4): slat wall, sofa, table, rug, plant
    M_SLAT = m_wood('slat_oak', (0.20, 0.13, 0.08), 12, 0.55)
    M_FELT = m_simple('felt', (0.018, 0.018, 0.02), 0.9)
    sy0, sy1 = -1.95, 1.62
    box('slat_back', RX - 0.012, RX - 0.002, sy0, sy1, 0.0, RZ, M_FELT, 4)
    bm = bmesh.new(); y = sy0 + 0.01
    while y < sy1 - 0.04:
        r = bmesh.ops.create_cube(bm, size=1.0)['verts']
        for v in r:
            v.co.x = RX - 0.012 - (v.co.x + 0.5) * 0.024; v.co.y = y + (v.co.y + 0.5) * 0.04; v.co.z = 0.02 + (v.co.z + 0.5) * (RZ - 0.04)
        y += 0.062
    slats = mesh_obj('slats', bm, M_SLAT, 4)
    md = slats.modifiers.new('bev', 'BEVEL'); md.width = 0.002; md.segments = 2
    # sofa: plinth + rounded seat blocks + backs + arms (cream boucle), dark pillows
    sx0, sx1, sy0_, sy1_ = SOFA
    M_BOUCLE = m_fabric('boucle', (0.80, 0.77, 0.71), 140, 0.55, 0.5)
    M_PIL = m_fabric('pillow_dark', (0.05, 0.05, 0.055), 180, 0.3, 0.6)
    M_PIL2 = m_fabric('pillow_sand', (0.55, 0.47, 0.37), 180, 0.3, 0.6)
    box('sofa_plinth', sx0 + 0.06, sx1 - 0.04, sy0_ + 0.06, sy1_ - 0.06, 0.0, 0.07, M_GRAPH, 4, 0.004)
    mid = (sy0_ + sy1_) / 2
    for i, (a, b) in enumerate([(sy0_ + 0.22, mid), (mid, sy1_ - 0.22)]):
        box(f'sofa_seat{i}', sx0, sx1 - 0.22, a + 0.005, b - 0.005, 0.07, 0.42, M_BOUCLE, 4, 0.07, 6)
        box(f'sofa_back{i}', sx1 - 0.24, sx1, a + 0.005, b - 0.005, 0.07, 0.74, M_BOUCLE, 4, 0.08, 6)
    box('sofa_armL', sx0 + 0.05, sx1, sy0_, sy0_ + 0.22, 0.07, 0.6, M_BOUCLE, 4, 0.08, 6)
    box('sofa_armR', sx0 + 0.05, sx1, sy1_ - 0.22, sy1_, 0.07, 0.6, M_BOUCLE, 4, 0.08, 6)
    for i, (yc, mat, rz) in enumerate([(sy0_ + 0.45, M_PIL, 0.15), (sy0_ + 0.82, M_PIL2, -0.1), (sy1_ - 0.5, M_PIL, -0.2)]):
        box(f'pillow{i}', sx1 - 0.36, sx1 - 0.22, yc - 0.22, yc + 0.22, 0.42, 0.84, mat, 4, 0.06, 6, rot=(0, -0.28, rz), pivot=(sx1 - 0.29, yc, 0.45))
    # coffee table: travertine drum
    tx, ty, tr = TABLE
    bm_trav, nt_ = mat_new('travertine')
    v_ = objvec(nt_); n_ = noise(nt_, v_, 2.2, 8, 0.6, dist=0.4)
    wv_ = nd(nt_, 'ShaderNodeTexWave'); wv_.bands_direction = 'Z'; wv_.inputs['Scale'].default_value = 6; wv_.inputs['Distortion'].default_value = 4; ln(nt_, v_, wv_.inputs['Vector'])
    c_ = ramp(nt_, wv_.outputs['Fac'], [(0.0, (0.68, 0.62, 0.52)), (0.5, (0.73, 0.67, 0.57)), (1.0, (0.70, 0.64, 0.54))]).outputs[0]
    pores_ = ramp(nt_, voronoi(nt_, v_, 70).outputs['Distance'], [(0.0, (1, 1, 1)), (0.1, (0, 0, 0))]).outputs[0]
    c_ = mix(nt_, 'MIX', c_, (0.4, 0.35, 0.28), math_(nt_, 'MULTIPLY', pores_, 0.6))
    out(nt_, principled(nt_, c_, 0.45, bump(nt_, math_(nt_, 'MULTIPLY', pores_, -1), 0.3, 0.003), 0.5))
    cyl('table', tx, ty, 0.0, 0.34, tr, bm_trav, 4, 96, bevel=0.012)
    # rug
    M_RUG = m_fabric('rug', (0.47, 0.45, 0.42), 320, 0.6, 0.3)
    box('rug', 0.55, 2.35, -1.25, 1.35, 0.0, 0.012, M_RUG, 4, 0.006)
    # plant: concrete pot + olive tree
    pxp, pyp = PLANT
    M_POT = m_raw_concrete('pot', (0.32, 0.31, 0.3), stains=False, cracks=False, joints=False)
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=64, radius1=0.17, radius2=0.22, depth=0.55)
    pot = mesh_obj('pot', bm, M_POT, 4, smooth=True); pot.location = (pxp, pyp, 0.275)
    if hasattr(pot.data, 'use_auto_smooth'): pot.data.use_auto_smooth = True
    for p in pot.data.polygons: p.use_smooth = abs(p.normal.z) < 0.5
    cyl('soil', pxp, pyp, 0.5, 0.52, 0.205, m_simple('soil', (0.06, 0.045, 0.035), 0.95), 4, 48)
    M_BARK = m_wood('bark', (0.22, 0.19, 0.15), 30, 0.9)
    curve('trunk', [(pxp, pyp, 0.5), (pxp + 0.05, pyp - 0.02, 0.95), (pxp - 0.04, pyp + 0.03, 1.35), (pxp + 0.02, pyp, 1.75)], 0.025, M_BARK, 4)
    centres = [(pxp + 0.02, pyp, 1.85, 0.32), (pxp - 0.22, pyp + 0.12, 1.6, 0.24), (pxp + 0.2, pyp - 0.15, 1.55, 0.22), (pxp - 0.05, pyp - 0.2, 2.1, 0.22)]
    for i, (cx, cy, cz, _) in enumerate(centres[1:]):
        curve(f'branch{i}', [(pxp + 0.02, pyp, 1.3 + i * 0.15), ((pxp + cx) / 2, (pyp + cy) / 2, (1.35 + cz) / 2 + 0.05), (cx, cy, cz)], 0.01, M_BARK, 4)
    bm = bmesh.new()
    for (cx, cy, cz, rr) in centres:
        for k in range(420):
            while True:
                p = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
                if p.length <= 1: break
            p = Vector((cx, cy, cz)) + p * rr * Vector((1, 1, 0.8))
            L = random.uniform(0.045, 0.075); W = L * 0.24
            ax = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-0.6, 0.2))).normalized()
            side = ax.cross(Vector((0, 0, 1))).normalized() if abs(ax.z) < 0.95 else Vector((1, 0, 0))
            up = side.cross(ax).normalized()
            side = (side * math.cos(random.uniform(0, 3)) + up * math.sin(random.uniform(0, 3))).normalized()
            vs = [bm.verts.new(p), bm.verts.new(p + ax * L * 0.5 + side * W), bm.verts.new(p + ax * L), bm.verts.new(p + ax * L * 0.5 - side * W)]
            bm.faces.new(vs)
    mesh_obj('leaves', bm, m_leaf(), 4, smooth=False)
    # a few books + vase on the table
    box('book1', tx - 0.18, tx + 0.08, ty - 0.12, ty + 0.08, 0.34, 0.365, m_simple('book1', (0.75, 0.72, 0.66), 0.7), 4, 0.003, rot=(0, 0, 0.3), pivot=(tx, ty, 0.34))
    box('book2', tx - 0.15, tx + 0.06, ty - 0.1, ty + 0.06, 0.365, 0.385, m_simple('book2', (0.12, 0.12, 0.13), 0.7), 4, 0.003, rot=(0, 0, 0.18), pivot=(tx, ty, 0.34))
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=0.08)
    for v in bm.verts: v.co.z *= 1.3
    va = mesh_obj('vase', bm, m_simple('vase', (0.1, 0.09, 0.08), 0.35, 0.5, Coat__Weight=0.5), 4, smooth=True); va.location = (tx + 0.18, ty + 0.12, 0.44)
    # skirting shadow gap along walls (finished detail, region of each wall)
    box('skirt_far', -RX, RX, RY - 0.012, RY - 0.002, 0.0, 0.012, M_GRAPH, 3)
    box('skirt_near', -RX, RX, -RY + 0.002, -RY + 0.012, 0.0, 0.06, M_GRAPH, 3)
    box('skirt_left', -RX + 0.002, -RX + 0.012, -RY, RY, 0.0, 0.06, M_GRAPH, 3)
    # sheer curtain on the window (softens the hot window, adds realism)
    M_SHEER, ntc = mat_new('sheer')
    tr_ = nd(ntc, 'ShaderNodeBsdfTranslucent'); tr_.inputs['Color'].default_value = (0.95, 0.94, 0.9, 1)
    tp_ = nd(ntc, 'ShaderNodeBsdfTransparent')
    mxs = nd(ntc, 'ShaderNodeMixShader'); mxs.inputs[0].default_value = 0.35
    ln(ntc, tp_.outputs[0], mxs.inputs[1]); ln(ntc, tr_.outputs[0], mxs.inputs[2]); out(ntc, mxs)
    bm = bmesh.new(); n = 60
    for i in range(n + 1):
        yy = WIN[0] - 0.3 + i * (WIN[1] - WIN[0] + 0.1) / n * 0.55
        xx = -RX + 0.08 + 0.025 * math.sin(i * 1.3)
        bm.verts.new((xx, yy, 0.02)); bm.verts.new((xx, yy, RZ - 0.02))
    bm.verts.ensure_lookup_table()
    for i in range(n):
        bm.faces.new([bm.verts[2 * i], bm.verts[2 * i + 2], bm.verts[2 * i + 3], bm.verts[2 * i + 1]])
    mesh_obj('sheer', bm, M_SHEER, 6, smooth=True)

# ---------------------------------------------------------------- bake heavy procedural shells to images (render ~6x faster)
PX_PER_M = int(arg('--bake_ppm', '420'))
BAKE_DIR = os.path.join(OUT, 'bake'); os.makedirs(BAKE_DIR, exist_ok=True)
def bake_shells():
    S.cycles.samples = 4; dn_backup = S.cycles.use_denoising; S.cycles.use_denoising = False
    S.render.bake.margin = 6; S.render.bake.use_clear = True
    vlay = bpy.context.view_layer
    for ob in BAKE:
        w, h = ob['bake_size']; W = max(64, min(3072, int(w * PX_PER_M))); H = max(64, min(3072, int(h * PX_PER_M)))
        src = ob.data.materials[0]; nt = src.node_tree
        ob.data.uv_layers['bake'].active = True; ob.data.uv_layers['UVMap'].active_render = True
        files = {k: os.path.join(BAKE_DIR, f'{PASS}_{ob.name}_{k}.png') for k in ('col', 'rgh', 'nrm')}
        imgs = {}
        for k, path in files.items():
            if os.path.exists(path):
                imgs[k] = bpy.data.images.load(path); continue
            img = bpy.data.images.new(f'{ob.name}_{k}', W, H, float_buffer=False)
            if k != 'col': img.colorspace_settings.name = 'Non-Color'
            tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = img; nt.nodes.active = tn
            for o in vlay.objects: o.select_set(False)
            ob.select_set(True); vlay.objects.active = ob
            if k == 'col': bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, margin=6)
            elif k == 'rgh': bpy.ops.object.bake(type='ROUGHNESS', margin=6)
            else: bpy.ops.object.bake(type='NORMAL', normal_space='TANGENT', margin=6)
            img.filepath_raw = path; img.file_format = 'PNG'
            img.save()
            imgs[k] = img
            nt.nodes.remove(tn)
            print(f'[r4] baked {ob.name} {k} {W}x{H}', flush=True)
        imgs['rgh'].colorspace_settings.name = 'Non-Color'; imgs['nrm'].colorspace_settings.name = 'Non-Color'
        m, mt = mat_new(f'baked_{ob.name}')
        uvn = nd(mt, 'ShaderNodeUVMap'); uvn.uv_map = 'bake'
        tc = nd(mt, 'ShaderNodeTexImage'); tc.image = imgs['col']; ln(mt, uvn.outputs[0], tc.inputs[0])
        tr = nd(mt, 'ShaderNodeTexImage'); tr.image = imgs['rgh']; ln(mt, uvn.outputs[0], tr.inputs[0])
        tnn = nd(mt, 'ShaderNodeTexImage'); tnn.image = imgs['nrm']; ln(mt, uvn.outputs[0], tnn.inputs[0])
        nm = nd(mt, 'ShaderNodeNormalMap'); nm.uv_map = 'bake'; ln(mt, tnn.outputs[0], nm.inputs['Color'])
        sp = src.get('spec', 0.4)
        p = principled(mt, tc.outputs[0], tr.outputs[0], nm.outputs[0], sp)
        out(mt, p)
        ob.data.materials[0] = m
    S.cycles.samples = SAMPLES; S.cycles.use_denoising = dn_backup
if '--nobake' not in argv:
    bake_shells()

# ---------------------------------------------------------------- camera
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 15.5; cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 36.0
cam_d.clip_start = 0.05; cam_d.clip_end = 200
cam = bpy.data.objects.new('cam', cam_d); S.collection.objects.link(cam); S.camera = cam

# keys: t, x, y, z, yaw(deg, 0 = +y, positive = turn right toward +x), pitch(deg up)
KEYS = [(0.0, -0.05, -1.80, 1.60, -14, 7.0), (3.2, -0.12, -1.50, 1.60, -6, 6.5), (5.6, -0.22, -1.20, 1.60, 12, 5.5),
        (7.6, -0.34, -0.92, 1.59, 30, 4.0), (9.8, -0.48, -0.55, 1.59, 66, 4.5), (12.0, -0.56, -0.36, 1.60, 80, 5.0),
        (14.5, -0.62, -0.25, 1.60, 86, 5.0)]
def catmull(keys, t, idx):
    ts = [k[0] for k in keys]
    if t <= ts[0]: return keys[0][idx]
    if t >= ts[-1]: return keys[-1][idx]
    i = max(j for j in range(len(ts)) if ts[j] <= t)
    p0 = keys[max(i - 1, 0)][idx]; p1 = keys[i][idx]; p2 = keys[min(i + 1, len(keys) - 1)][idx]; p3 = keys[min(i + 2, len(keys) - 1)][idx]
    t0, t1 = ts[i], ts[i + 1]; u = (t - t0) / (t1 - t0)
    # tangents scaled for non-uniform spacing
    tl = ts[max(i - 1, 0)]; tr = ts[min(i + 2, len(ts) - 1)]
    m1 = (p2 - p0) / max(t1 - tl, 1e-6) * (t1 - t0); m2 = (p3 - p1) / max(tr - t0, 1e-6) * (t1 - t0)
    u2, u3 = u * u, u * u * u
    return (2 * u3 - 3 * u2 + 1) * p1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2 + (u3 - u2) * m2
def cam_at(t):
    x, y, z, yaw, pitch = (catmull(KEYS, t, i) for i in range(1, 6))
    # handheld micro motion (sum of slow sines)
    yaw += 0.35 * math.sin(t * 0.9 + 1.0) + 0.15 * math.sin(t * 2.3)
    pitch += 0.25 * math.sin(t * 1.1 + 2.0) + 0.1 * math.sin(t * 2.9)
    roll = 0.35 * math.sin(t * 0.7) + 0.12 * math.sin(t * 2.1 + 0.5)
    z += 0.008 * math.sin(t * 3.4)   # gentle walking bob
    return (x, y, z), yaw, pitch, roll
def cam_matrix(t):
    (x, y, z), yaw, pitch, roll = cam_at(t)
    # base: camera looking along +y (rot x 90°), then yaw about world z (negative = right turn), pitch, roll
    rot = Euler((math.radians(90 + pitch), math.radians(roll), math.radians(-yaw)), 'XYZ')
    return Matrix.Translation((x, y, z)) @ rot.to_matrix().to_4x4()

frames = list(range(FR[0], FR[1] + 1, STEP)) if not SINGLE else [int(v) for v in SINGLE.split(',')]
caminfo = {'lens_mm': cam_d.lens, 'sensor_height_mm': cam_d.sensor_height, 'fps': FPS, 'frames': {}}
for f in range(0, 430):
    caminfo['frames'][f] = [list(r) for r in cam_matrix(f / FPS)]
layout = {k: v for k, v in dict(RX=RX, RY=RY, RZ=RZ, DOOR=DOOR, WIN=WIN, WARD=WARD, SOFA=SOFA, MIRROR=MIRROR, VAN=VAN, WC_X=WC_X, PLANT=PLANT, TABLE=TABLE, SPOTS=SPOTS).items()}
with open(os.path.join(OUT, 'camera.json'), 'w') as fh: json.dump(caminfo, fh)
with open(os.path.join(OUT, 'layout.json'), 'w') as fh: json.dump(layout, fh)

# ---------------------------------------------------------------- data passes: world position (+ region index for fin)
vl = S.view_layers[0]; vl.use_pass_object_index = FIN; vl.use_pass_position = True
S.use_nodes = True; tree = S.node_tree; tree.nodes.clear()
rl = tree.nodes.new('CompositorNodeRLayers'); comp = tree.nodes.new('CompositorNodeComposite')
tree.links.new(rl.outputs['Image'], comp.inputs['Image'])
fo_ = tree.nodes.new('CompositorNodeOutputFile'); fo_.base_path = os.path.join(OUT, f'{PASS}_data_')
fo_.format.file_format = 'OPEN_EXR_MULTILAYER'; fo_.format.color_depth = '16'; fo_.format.exr_codec = 'ZIP'
fo_.file_slots.clear(); fo_.file_slots.new('Position')
tree.links.new(rl.outputs['Position'], fo_.inputs['Position'])
if FIN:
    fo_.file_slots.new('IndexOB'); tree.links.new(rl.outputs['IndexOB'], fo_.inputs['IndexOB'])

import time
for f in frames:
    S.frame_set(f)
    cam.matrix_world = cam_matrix(f / FPS)
    S.render.filepath = os.path.join(OUT, f'{PASS}_{f:04d}.png')
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'[r4] {PASS} frame {f} {time.time() - t0:.1f}s', flush=True)
