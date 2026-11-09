"""Build an original, stylized teaching loom as a self-contained Y-up GLB.

Run: blender --background --factory-startup --python tools/blender/build_loom.py
Blender Z is up and negative Blender Y is the machine's front. The glTF exporter
maps these to Three.js +Y and +Z respectively. All dimensions are scene units.

This is a didactic heddle loom silhouette, not a reconstruction of a Prato mill.
The named movable parts are meshes (not just empties), with usable local pivots.
No external textures, random inputs, animation timings, or production data.
"""

from math import cos, pi, sin
from pathlib import Path
import importlib.util
import site
import sys

# Blender's embedded Python disables the user site on this host. Its glTF
# exporter needs NumPy, already present in the existing user site; do not
# install anything or silently fall back to a non-glTF output.
if importlib.util.find_spec("numpy") is None:
    user_site = site.getusersitepackages()
    if Path(user_site).is_dir():
        sys.path.append(user_site)

import bpy
from mathutils import Vector


OUTPUT = Path(__file__).resolve().parents[2] / "public" / "models" / "loom.glb"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for data in bpy.data.materials:
    bpy.data.materials.remove(data)


def material(name, color, metallic=0.0, roughness=0.6):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (*color, 1.0)
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    return mat


WOOD = material("01 / Smoked chestnut", (0.185, 0.105, 0.071), roughness=0.52)
WOOD_EDGE = material("02 / Warm walnut end grain", (0.31, 0.165, 0.091), roughness=0.59)
STEEL = material("03 / Graphite steel", (0.082, 0.119, 0.137), 0.64, 0.34)
LIGHT_STEEL = material("04 / Brushed steel", (0.41, 0.49, 0.49), 0.67, 0.3)
BRASS = material("05 / Champagne brass", (0.72, 0.48, 0.19), 0.68, 0.31)
YARN = material("06 / Ivory warp", (0.91, 0.82, 0.64), roughness=0.78)
YARN_ALT = material("07 / Sage warp", (0.53, 0.72, 0.65), roughness=0.8)
CLOTH_BLUE = material("08 / Deep teal cloth", (0.048, 0.28, 0.31), roughness=0.87)
CLOTH_LITE = material("09 / Woven teal highlight", (0.11, 0.44, 0.43), roughness=0.91)
WEFT = material("10 / Saffron weft", (0.94, 0.49, 0.14), roughness=0.72)
CREAM = material("11 / Ceramic eyelets", (0.86, 0.78, 0.63), 0.12, 0.38)

root = bpy.data.objects.new("Loom", None)
bpy.context.collection.objects.link(root)


def box(name, center, size, mat, parent=root, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("Faceted edge", "BEVEL")
        mod.width = min(bevel, min(size) * 0.23)
        mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.location = center
    return obj


def cylinder(name, center, radius, length, mat, parent=root, vertices=12, axis="X"):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.location = center
    if axis == "X":
        obj.rotation_euler[1] = pi / 2
    elif axis == "Y":
        obj.rotation_euler[0] = pi / 2
    # Bake axle orientation into vertices: Three.js rotation.x spins about
    # the actual axle of the named rolls, and children inherit that pivot.
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    return obj


def ring(name, center, radius, tube, mat, parent=root, axis="X"):
    bpy.ops.mesh.primitive_torus_add(
        major_segments=12, minor_segments=4,
        major_radius=radius, minor_radius=tube,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.location = center
    if axis == "X":
        obj.rotation_euler[1] = pi / 2
    elif axis == "Y":
        obj.rotation_euler[0] = pi / 2
    return obj


def mesh(name, points, faces, mat, center=(0, 0, 0), parent=root):
    data = bpy.data.meshes.new(name)
    data.from_pydata(points, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    obj.location = center
    return obj


def batched_tubes(name, segments, radius, mat, sides=6, parent=root):
    """A whole thread group is one draw-call mesh, including flat end caps."""
    points, faces = [], []
    for a, b in segments:
        start, end = Vector(a), Vector(b)
        direction = (end - start).normalized()
        normal = direction.cross(Vector((1, 0, 0)))
        if normal.length < 0.1:
            normal = direction.cross(Vector((0, 0, 1)))
        normal.normalize()
        tangent = direction.cross(normal).normalized()
        first = len(points)
        for origin in (start, end):
            for k in range(sides):
                angle = 2 * pi * k / sides
                point = origin + radius * (cos(angle) * normal + sin(angle) * tangent)
                points.append(tuple(point))
        faces.append(tuple(first + k for k in reversed(range(sides))))
        faces.append(tuple(first + sides + k for k in range(sides)))
        for k in range(sides):
            next_k = (k + 1) % sides
            faces.append((first+k, first+next_k,
                          first+sides+next_k, first+sides+k))
    return mesh(name, points, faces, mat, parent=parent)


def prism(name, outline, bottom, top, mat, center, parent=root):
    n = len(outline)
    points = [(x, y, bottom) for x, y in outline]
    points += [(x, y, top) for x, y in outline]
    faces = [tuple(reversed(range(n))), tuple(range(n, n*2))]
    faces += [(i, (i+1) % n, (i+1) % n+n, i+n) for i in range(n)]
    return mesh(name, points, faces, mat, center=center, parent=parent)


def ribbon(name, y0, y1, z0, z1, mat, parent=root, cx=0, width=2.52):
    """Thin solid ribbon in Blender's X/Y plane with a sloping upper face."""
    x0, x1 = cx - width/2, cx + width/2
    thickness = 0.012
    points = [(x0,y0,z0), (x1,y0,z0), (x1,y1,z1), (x0,y1,z1),
              (x0,y0,z0-thickness), (x1,y0,z0-thickness),
              (x1,y1,z1-thickness), (x0,y1,z1-thickness)]
    faces = [(0,1,2,3), (7,6,5,4), (0,4,5,1),
             (1,5,6,2), (2,6,7,3), (3,7,4,0)]
    return mesh(name, points, faces, mat, parent=parent)


# The portal silhouette: chestnut feet, four uprights, cross-lintels and brass
# cuffs. The tallest point is 2.77, the lowest sits on z=0 (Three.js y=0).
for x, label in ((-1.65, "L"), (1.65, "R")):
    box(f"Foot_{label}", (x,0,0.085), (0.31,2.51,0.17), WOOD, bevel=0.028)
    box(f"Foot_inlay_{label}", (x,0,0.177), (0.16,2.25,0.013), BRASS)
    for y, side in ((-1.06, "F"), (1.06, "B")):
        box(f"Post_{label}{side}", (x,y,1.385),
            (0.21,0.22,2.57), WOOD, bevel=0.034)
        box(f"Post_band_{label}{side}", (x,y,2.50),
            (0.23,0.245,0.045), BRASS, bevel=0.008)
        box(f"Post_cap_{label}{side}", (x,y,2.68),
            (0.24,0.26,0.11), STEEL, bevel=0.018)
    box(f"Side_lintel_{label}", (x,0,2.64),
        (0.20,2.35,0.22), WOOD, bevel=0.027)
    box(f"Side_rib_{label}", (x,-0.05,1.70),
        (0.11,2.09,0.11), STEEL, bevel=0.012)
    box(f"Side_low_rail_{label}", (x,0,0.55),
        (0.13,2.04,0.13), WOOD_EDGE, bevel=0.014)
    # Diagonal braces in the depth/height plane, kept outside the warp bay.
    for ymid, angle, tag in ((-0.555,-0.723,"F"),(0.555,0.723,"B")):
        beam = box(f"Knee_brace_{label}{tag}", (x,ymid,2.145),
                   (0.085,1.34,0.085), BRASS, bevel=0.008)
        beam.rotation_euler[0] = angle
    # A small sculpted shoulder reaches the intended ~3.8-unit silhouette.
    shoulder_x = x + (-0.13 if x < 0 else 0.13)
    box(f"Shoulder_cap_{label}",(shoulder_x,-1.06,2.69),
        (0.24,0.27,0.07),BRASS,bevel=0.008)

for y, side in ((-1.06, "Front"), (1.06, "Rear")):
    box(f"Crown_{side}", (0,y,2.68), (3.45,0.20,0.17),
        WOOD, bevel=0.027)
    box(f"Crown_pinstripe_{side}", (0,y-0.105,2.68),
        (3.17,0.011,0.022), BRASS)
    box(f"Foot_crossbrace_{side}", (0,y,0.32),
        (3.39,0.11,0.11), STEEL, bevel=0.011)

# The raised back guide makes the warp feed legible from a three-quarter view.
cylinder("RearWarpGuide", (0,0.65,1.45), 0.048, 2.80,
         LIGHT_STEEL, vertices=10)
for x in (-1.42,1.42):
    cylinder(f"RearGuideBearing_{x}", (x,0.65,1.45),
             0.081,0.085,BRASS)

# Both rolls are real mesh pivots. A Three.js x-axis rotation rolls their cloth.
warp = cylinder("WarpBeam", (0,0.94,1.11),0.175,2.81,WOOD_EDGE,vertices=14)
for x in (-1.32,1.32):
    cylinder(f"WarpBeam_collar_{x}", (x,0,0),0.189,0.071,BRASS,parent=warp)
    cylinder(f"WarpBeam_axle_{x}", (x*1.075,0,0),
             0.051,0.145,STEEL,parent=warp)
for x in (-1.13,1.13):
    ring(f"WarpBeam_ring_{x}", (x,0,0),0.179,0.011,BRASS,parent=warp)

roll = cylinder("FabricRoll", (0,-1.01,0.78),0.182,2.81,
                CLOTH_BLUE,vertices=16)
for x in (-1.34,1.34):
    cylinder(f"FabricRoll_collar_{x}", (x,0,0),0.197,0.065,BRASS,parent=roll)
    cylinder(f"FabricRoll_axle_{x}", (x*1.065,0,0),
             0.048,0.12,STEEL,parent=roll)
for x in (-1.11,1.11):
    ring(f"FabricRoll_band_{x}", (x,0,0),0.183,0.012,CLOTH_LITE,parent=roll)

# Faceted handwheel/counterweight on the right side of the rear roll, a shape
# cue rather than a claim about a particular mill's gearing or drive.
cylinder("Handwheel_hub", (1.77,0.94,1.11),0.069,0.085,BRASS)
ring("Handwheel_rim", (1.78,0.94,1.11),0.29,0.022,BRASS)
for i in range(6):
    a = 2*pi*i/6
    start = (1.78,0.94+0.075*cos(a),1.11+0.075*sin(a))
    end = (1.78,0.94+0.265*cos(a),1.11+0.265*sin(a))
    batched_tubes(f"Handwheel_spoke_{i}",[(start,end)],0.015,STEEL)

# Two independently addressable heddle frames. Their pivots are top-rail
# centers; translate along Three.js Y (Blender Z) for the shed change.
THREAD_COUNT = 20
warp_x = [-1.24 + i*2.48/(THREAD_COUNT-1) for i in range(THREAD_COUNT)]
for label, y, z, parity in (("HeddleRear",0.25,1.89,1),
                            ("HeddleFront",-0.065,1.90,0)):
    heddle = box(label, (0,y,z), (2.89,0.058,0.073),
                 STEEL, bevel=0.012)
    # Root is the top rail; the pivot is its center. All details are local.
    box(f"{label}_lower", (0,0,-0.86),(2.89,0.055,0.062),
        STEEL,parent=heddle,bevel=0.009)
    for side, x in (("L",-1.42),("R",1.42)):
        box(f"{label}_upright_{side}",(x,0,-0.43),
            (0.061,0.071,0.86),BRASS,parent=heddle,bevel=0.006)
    wires = []
    for i,x in enumerate(warp_x):
        if i % 2 != parity:
            continue
        wires.append(((x,0,-0.05),(x,0,-0.81)))
        # Even ends pass through the higher front frame; odd through the lower rear.
        eye_z = -0.38 if parity == 0 else -0.69
        ring(f"{label}_eye_{i:02}",(x,0,eye_z),
             0.023,0.0055,CREAM,parent=heddle,axis="Y")
    batched_tubes(f"{label}_harness_wires",wires,0.006,
                  LIGHT_STEEL,parent=heddle)

# Four sections of each warp: beam -> guide -> assigned heddle -> reed -> fell.
# The two thread groups make the raised/lowered shed visually explicit.
for parity,label,mat in ((0,"WarpUpper",YARN),(1,"WarpLower",YARN_ALT)):
    spans=[]
    for i,x in enumerate(warp_x):
        if i % 2 != parity:
            continue
        guide=(x,0.64,1.40)
        behind=(x,0.25,1.39 if parity == 0 else 1.20)
        ahead=(x,-0.065,1.52 if parity == 0 else 1.16)
        dent=(x,-0.32,1.47 if parity == 0 else 1.11)
        fell=(x,-0.55,1.26)
        sequence=[(x,0.94,1.27),guide,behind,ahead,dent,fell]
        spans += list(zip(sequence[:-1],sequence[1:]))
    batched_tubes(label,spans,0.009,mat)

# Reed (beater): separate moving mesh with fine steel dents and a brass top.
# At rest its +Z in Three.js is ~0.32; translate +Z to beat toward the fell.
reed = box("Reed", (0,-0.32,1.60), (3.04,0.082,0.078),
           WOOD_EDGE,bevel=0.013)
box("Reed_bottom",(0,0,-0.57),(3.04,0.07,0.072),
    STEEL,parent=reed,bevel=0.009)
box("Reed_top_inlay",(0,-0.044,0.005),(2.88,0.013,0.017),
    BRASS,parent=reed)
for x in (-1.49,1.49):
    box(f"Reed_end_{x}",(x,0,-0.28),(0.062,0.092,0.60),
        BRASS,parent=reed,bevel=0.006)
reed_dents=[(((-1.29+i*2.58/20),0,-0.08),
             ((-1.29+i*2.58/20),0,-0.51)) for i in range(21)]
batched_tubes("Reed_dents",reed_dents,0.008,
              LIGHT_STEEL,parent=reed,sides=4)

# The shuttle crosses the clear opening on a visible amber dotted weft route.
# Its pivot is at the center of its boat-shaped hull; parent translates x.
boat_outline=[(-0.29,0),(-0.16,-0.105),(0.16,-0.105),
              (0.29,0),(0.16,0.105),(-0.16,0.105)]
shuttle = prism("Shuttle",boat_outline,-0.067,0.061,
                WEFT,(-1.09,-0.43,1.285))
prism("Shuttle_deck",[(-0.15,-0.066),(0.15,-0.066),
                       (0.15,0.066),(-0.15,0.066)],
      0.062,0.074,WOOD,parent=shuttle,center=(0,0,0))
cylinder("Shuttle_yarn_spool",(0,0,0.092),0.039,0.21,
         CLOTH_LITE,parent=shuttle,vertices=10)
for x in (-0.105,0.105):
    cylinder(f"Shuttle_spool_tip_{x}",(x,0,0.092),
             0.044,0.018,BRASS,parent=shuttle,vertices=10)
for i in range(28):
    x=-1.27+i*2.54/27
    box(f"Weft_route_tick_{i:02}",(x,-0.41,1.275),
        (0.048,0.032,0.014),WEFT,bevel=0.002)
for x in (-1.40,1.40):
    box(f"Shuttle_stop_{x}",(x,-0.44,1.13),
        (0.08,0.16,0.12),BRASS,bevel=0.011)
box("Shuttle_track_wood",(0,-0.45,1.045),
    (2.85,0.20,0.11),WOOD_EDGE,bevel=0.015)

# Cloth leaves the fell and slopes over the front roll. Its vertex origin is
# at the front roller: scaling local depth can grow the web toward the reed.
cloth = ribbon("Cloth",0,0.46,0,0.29,CLOTH_BLUE,
               parent=root,cx=0,width=2.53)
cloth.location=(0,-1.01,0.968)
for i in range(11):
    y=0.015+i*0.039
    z=0.29*y/0.46+0.005
    ribbon(f"Cloth_weft_{i:02}",y,y+0.012,z,z+0.29*0.012/0.46,
           CLOTH_LITE if i%3 else WEFT,parent=cloth,width=2.49)
for x in (-1.232,1.232):
    ribbon(f"Cloth_selvedge_{x}",0.003,0.455,0.008,0.298,
           YARN,parent=cloth,cx=x,width=0.016)

# Keep the export to the model only. Blender's Z-up to glTF Y-up conversion is
# performed on export, not by baking rotated coordinates into the meshes.
bpy.ops.object.select_all(action="DESELECT")
for obj in bpy.context.scene.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT), export_format="GLB", export_yup=True,
    use_selection=True, export_materials="EXPORT", export_cameras=False,
    export_lights=False, check_existing=False,
)
print(f"WROTE {OUTPUT} ({OUTPUT.stat().st_size} bytes)")
