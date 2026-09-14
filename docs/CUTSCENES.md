# Silent Cutscenes

Soft Recall has six silent, automatically played MP4 moments made from the existing
first-person paintings. Slow camera pushes preserve the painted atmosphere.
Captions follow the video timeline; no Continue clicks are required.

## Browser Cutscenes

- `waking`: plays after Begin on a new run, then returns to the Bedroom tutorial.
- `note`: plays once after the folded note is placed, then returns to Bedroom exploration.
- `corridor`: plays once on the first Bedroom-to-Hallway move, then returns to Hallway exploration.
- `tea`: plays once after the kettle interaction, then returns to Kitchen exploration.
- `threshold`: plays once after the final ending action, then resolves the selected ending.
- `clear-morning`: plays only after a no-misstep run completes every core room task, then returns to the ending choices.

Pause/Play and `Skip moment` are keyboard accessible. `Esc` skips; Space on the
playback surface pauses or resumes. Captions stop while paused, buffering, or in
a background tab. Each clip returns to gameplay automatically. Skipping and
completion share the same handler and never change rewards or ending eligibility.
Reduced motion uses a still painting with the same timed captions. A video load
failure falls back to that presentation, so it cannot block a run.

The six clips total approximately five minutes. Each lasts 44-53 seconds, with
caption timing based on 156 words per minute plus a short settling interval.
Clips contain H.264 video at 1280 x 720, 24 fps, and no audio stream. Only the
active clip loads. The combined media budget is about 14.2 MiB.

## Rebuild Video

`tools/render-cinematics.mjs` renders local camera motion using FFmpeg. It reads
`src/game/data/cutscenes.ts` and `morningBeats.ts`; rerender after changing captions
or camera framing. Run with Node 24 and an installed FFmpeg binary:

```sh
FFMPEG_PATH=/absolute/path/to/ffmpeg node tools/render-cinematics.mjs
```

Clips and a source/output hash manifest live in `public/media/cutscenes/` and are
copied into `dist` by Vite. URL construction uses Vite's configured base, including
the relative itch.io build. Rendering tools are only needed when rebuilding media.
Source artwork retains its existing project provenance; rendering does not create
a new license for it. These are camera films of paintings, not character animation.

## Room Stories

The four five-beat room stories are optional longer-form moments. They are
opened by the small glowing detail marker in Bedroom, Hallway, Kitchen, and
Bathroom. A story resumes at its saved beat, awards one Memory Book artifact on
completion, and never replaces a routine task or navigation exit.

## Blender Authoring

`tools/blender/build_cutscenes.py` creates editable image-plane scenes from the
canonical room artwork. It includes full-room compositions and closer camera
framing for the note, tea, corridor, threshold, and clear-morning beats. The image plane keeps
the work painterly and avoids pretending that a flat scene painting is a fully
modeled apartment. Blender is an authoring convenience only; the Vite app
remains the authoritative playable build.

From the repository root, with Blender installed locally:

```sh
blender --background --python tools/blender/build_cutscenes.py
blender --background --python tools/blender/build_cutscenes.py -- --render
blender --background --python tools/blender/build_cutscenes.py -- --save-blend
```

The script writes local authoring output under `tools/blender/output/`. The
`--save-blend` option also writes an editable
`soft_recall_cutscenes.blend` bundle there. Review any rendered plate for crop,
readable text-safe space, and continuity before introducing exported media into
`public/`.

## Deferred

Full character animation, modeled room cinematography, and new rooms are deferred.
Audio remains outside the project's scope.
