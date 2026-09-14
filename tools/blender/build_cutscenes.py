"""Build silent, image-plane cutscene scenes for Soft Recall.

This is an optional authoring tool. The browser game does not require Blender
to run: it plays silent MP4 camera films built by tools/render-cinematics.mjs.
When Blender is available, this script creates
six editable scenes with gentle camera pushes that can be rendered as future
cutscene plates.

Run from the repository root:
    blender --background --python tools/blender/build_cutscenes.py
    blender --background --python tools/blender/build_cutscenes.py -- --render
    blender --background --python tools/blender/build_cutscenes.py -- --save-blend
"""

from pathlib import Path
import sys

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ASSET_ROOT = PROJECT_ROOT / "src" / "assets"
OUTPUT_ROOT = PROJECT_ROOT / "tools" / "blender" / "output"
BLEND_OUTPUT = OUTPUT_ROOT / "soft_recall_cutscenes.blend"
ASPECT = 1376 / 768

SHOTS = {
    "soft_recall_waking": {
        "image": "scene-bedroom.webp",
        "focus": (0.0, 0.0),
        "scales": (1.0, 0.91, 0.95),
    },
    "soft_recall_note": {
        "image": "scene-bedroom.webp",
        "focus": (0.20, -0.20),
        "scales": (0.82, 0.70, 0.76),
    },
    "soft_recall_corridor": {
        "image": "scene-hallway.webp",
        "focus": (0.0, 0.0),
        "scales": (1.0, 0.92, 0.96),
    },
    "soft_recall_tea": {
        "image": "scene-kitchen.webp",
        "focus": (0.38, -0.25),
        "scales": (0.84, 0.72, 0.78),
    },
    "soft_recall_threshold": {
        "image": "scene-hallway.webp",
        "focus": (0.27, 0.05),
        "scales": (0.90, 0.76, 0.82),
    },
    "soft_recall_clear_morning": {
        "image": "scene-hallway.webp",
        "focus": (0.27, 0.05),
        "scales": (0.94, 0.84, 0.88),
    },
}


def move_to_scene(obj: bpy.types.Object, scene: bpy.types.Scene) -> None:
    """Link an operator-created object to the scene it is authored for."""
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    scene.collection.objects.link(obj)


def make_material(image_path: Path) -> bpy.types.Material:
    material = bpy.data.materials.new(f"Soft Recall | {image_path.stem}")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    image = bpy.data.images.load(str(image_path), check_existing=True)
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = image
    shader = nodes.new("ShaderNodeEmission")
    shader.inputs["Strength"].default_value = 0.8
    output = nodes.new("ShaderNodeOutputMaterial")
    links.new(texture.outputs["Color"], shader.inputs["Color"])
    links.new(shader.outputs["Emission"], output.inputs["Surface"])
    return material


def make_scene(name: str, shot: dict[str, object]) -> bpy.types.Scene:
    image_name = shot["image"]
    focus_x, focus_y = shot["focus"]
    start_scale, mid_scale, end_scale = shot["scales"]
    image_path = ASSET_ROOT / image_name
    if not image_path.exists():
        raise FileNotFoundError(image_path)

    scene = bpy.data.scenes.new(name)
    scene.render.resolution_x = 1376
    scene.render.resolution_y = 768
    scene.render.resolution_percentage = 50
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.filepath = str(OUTPUT_ROOT / f"{name}.png")
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE"

    world = bpy.data.worlds.new(f"{name} World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.015, 0.012, 0.02, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
    scene.world = world

    bpy.ops.object.camera_add(location=(0, 0, 5))
    camera = bpy.context.object
    move_to_scene(camera, scene)
    camera.name = f"{name} Camera"
    camera.data.type = "ORTHO"
    # Camera lens settings belong to the Camera data-block in Blender 4.x.
    # The middle frame eases toward a visual detail without moving any web
    # hotspot; this scene exists only as a future cinematic plate.
    camera.location = (0, 0, 5)
    camera.data.ortho_scale = start_scale
    camera.keyframe_insert(data_path="location", frame=1)
    camera.data.keyframe_insert(data_path="ortho_scale", frame=1)
    camera.location = (focus_x, focus_y, 5)
    camera.data.ortho_scale = mid_scale
    camera.keyframe_insert(data_path="location", frame=72)
    camera.data.keyframe_insert(data_path="ortho_scale", frame=72)
    camera.location = (focus_x * 0.7, focus_y * 0.7, 5)
    camera.data.ortho_scale = end_scale
    camera.keyframe_insert(data_path="location", frame=144)
    camera.data.keyframe_insert(data_path="ortho_scale", frame=144)
    scene.camera = camera

    bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
    plate = bpy.context.object
    move_to_scene(plate, scene)
    plate.name = f"{name} Painted Plate"
    plate.dimensions = (ASPECT, 1, 0)
    plate.location = (0, 0, 0)
    plate.data.materials.append(make_material(image_path))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Keep the motion deliberately modest: the painting is the subject, not a
    # simulated 3D environment. The web build remains the playable source.
    plate.keyframe_insert(data_path="location", frame=1)
    plate.location.x += 0.012
    plate.location.y += 0.006
    plate.keyframe_insert(data_path="location", frame=144)

    scene.frame_start = 1
    scene.frame_end = 144
    scene.render.fps = 24
    scene.timeline_markers.new("hold", frame=1)
    scene.timeline_markers.new("turn", frame=72)
    scene.timeline_markers.new("return", frame=144)
    return scene


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    scenes = [make_scene(name, shot) for name, shot in SHOTS.items()]
    if "--render" in sys.argv:
        for scene in scenes:
            scene.frame_set(72)
            bpy.ops.render.render(write_still=True, scene=scene.name)
    if "--save-blend" in sys.argv:
        bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_OUTPUT))
        print(f"Saved editable Blender bundle: {BLEND_OUTPUT}")
    print(f"Prepared {len(scenes)} silent Soft Recall cutscene scenes.")


if __name__ == "__main__":
    main()
