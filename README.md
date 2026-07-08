# Soft Recall

**Soft Recall** is a first-person visual novel point-and-click prototype about memory, uncertainty, routine, and care. The player moves through a quiet morning from bedside to doorway while object cues, confidence checks, and support choices shape what becomes readable.

Soft Recall explores how games can represent uncertainty, cue use, memory confidence, and support-seeking through narrative interaction.

## Current Prototype

This GitHub Pages build is a polished web vertical slice, not the final production format. It uses plain HTML, CSS, and JavaScript with no build step.

Current slice:

- Bedroom / bedside
- Mirror or phone close-up
- Hallway / door

## Intended Direction

Soft Recall is being shaped toward a Steam/PC-style first-person narrative game. The web version is a migration-ready prototype for testing tone, interaction rhythm, accessibility, and research framing before a possible move to Unity, Godot, or another game engine.

## Core Gameplay

- Move through first-person scene nodes.
- Inspect embedded object markers.
- Read and respond through a bottom visual novel text box.
- Use confidence prompts to record how sure an object or next step feels.
- Place support cues without shame or failure screens.
- Reach one of three vertical-slice endings: Supported Departure, Smaller Morning, or Overloaded but Not Alone.

## Research Angle

The project is research-informed, not diagnostic. It focuses on metacognitive interaction: noticing certainty, partial certainty, uncertainty, cue use, and support-seeking as playable choices.

## Controls

- Arrow keys / D-pad: turn, move, or shift focus
- Tab / shoulder buttons: cycle interactable focus
- Enter / A: inspect or confirm
- Escape / B: back or close
- S / X: support
- M / Y: Memory Book
- Space: confirm focused choice

Mouse and touch remain supported.

## Accessibility

Options include larger text, high contrast, reduced motion, reduced blur, plain language, disabled text distortion, content note toggle, mute sound, visible focus states, keyboard navigation, and no timers, jump scares, combat, shame language, or failure screens.

This build does not include voiceover, music, or sound effects.

## Disclaimer

Soft Recall is a narrative neuroeducation and interaction design prototype. It is not medical advice, diagnosis, treatment, or a clinical assessment tool.

## Local Play

Open `index.html` directly, or run:

```bash
npm start
```

Then visit `http://localhost:4173`.

## Checks

```bash
npm run check
```

Trailer capture:

```bash
npm run capture:trailer
```
