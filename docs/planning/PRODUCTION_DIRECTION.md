# Production Direction

## Target Experience

Soft Recall should feel like a first-person visual novel mystery about care, uncertainty, memory confidence, and support-seeking. The player should feel positioned inside the room, not above it.

## Steam / PC Direction

The long-term target is a fullscreen-friendly PC experience with:

- 16:9 presentation
- Mouse, keyboard, and controller support
- Clear input prompts
- Scene-based first-person navigation
- Bottom visual novel text box as the primary interface
- Embedded point-and-click object inspection
- Gentle psychological mystery tone without jump scares or failure screens

## Engine Recommendation

The current web build is useful for testing narrative, interaction rhythm, accessibility, and research framing. A later production build would likely benefit from Unity or Godot for richer scene art, input handling, save systems, animation, localization, controller QA, and platform packaging.

## Why The Web Version Is A Prototype

GitHub Pages is excellent for sharing the concept, but the final game should not feel like a browser dashboard. This repo should therefore prioritize vertical-slice clarity over feature volume.

## Vertical Slice Scope

Current production slice:

- Bedroom / bedside
- Mirror or phone close-up
- Hallway / door

Optional later slice expansion should happen only after these scenes feel polished.

## Controller Input Plan

- D-pad / left stick: node movement or focus movement
- A: inspect / confirm
- B: back / close
- X: support cue
- Y: Memory Book
- Shoulder buttons: cycle focus

All required gameplay should be reachable without a mouse.

## Art Direction

Use CSS scene plates for now: warm interior light, uneasy shadow, watercolor grain, small object glints, and tactile close-up cards. Future engine work should replace CSS props with authored first-person scene art while preserving the same composition rules.

The browser vertical slice now uses original SVG scene plates in `assets/scenes/` and paper/noise SVGs in `assets/ui/`. Treat these as migration references for composition, not final shipped art.

## Migration Notes

Keep game data structured around scene nodes, exits, hotspots, VN lines, choices, support prompts, and endings. These map cleanly to ScriptableObjects, JSON resources, Godot Resources, Ink/Yarn nodes, or a custom narrative graph later.

No audio should be added until the visual, pacing, and interaction language are stable.
