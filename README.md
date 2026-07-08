# Soft Recall: A Morning in Five Rooms

**Soft Recall** is an immersive modern point-and-click neuroeducation game about memory, language, perception, executive function, spatial orientation, dread, care, autonomy, and metacognitive self-monitoring. The apartment is both home and evidence: familiar objects, unread texts, a playlist, a laptop, plants, notes, and appointment cues become part of a morning that feels tender, mysterious, and quietly wrong.

The project is built with plain HTML, CSS, and JavaScript so it can run locally, open directly in a browser, and deploy to GitHub Pages with no build step.

## Current Vision

Soft Recall is a compassionate atmospheric mystery about memory and selfhood. The player is not diagnosing someone from the outside. They are trusted to stand inside a difficult morning and notice how care can help without taking agency away.

The game balances:

- **Warmth:** a lived-in contemporary apartment, relationships, humor, taste, and unfinished plans.
- **Dread:** uncertainty, time pressure, bodily unreliability, and missing context.
- **Mystery:** a circled appointment, unread texts, a voice memo labeled "for hard mornings," and objects that matter before the player knows why.
- **Care:** support that preserves autonomy through cues, calls, music, pauses, and environmental design.
- **Metacognition:** confidence checks, uncertainty awareness, cue-use reflection, and self-monitoring notes.

References to clinical or psychological indie games are broad tonal inspirations only. Soft Recall is original in content, story, interface, art direction, and mechanics.

## Research / Publishing Direction

This prototype is being shaped as a research-informed narrative game for exploring how gameplay can represent subjective memory uncertainty and metacognitive awareness. The design emphasizes:

- Confidence judgments: sure, partly sure, unsure.
- Distinguishing remembering, guessing, sensing, and using a cue.
- How external supports change perceived certainty and autonomy.
- How players reflect on symptom shifts without turning the protagonist into a case study.
- Dignity-centered care: helping without correcting, cueing without taking over.

The **Self-Monitoring** layer records object-level confidence checks and stores them in the Memory Book. The goal is not clinical measurement; the goal is a playable design artifact that could support future questions about metacognition, cue use, neuroeducation, and reflective gameplay.

## Visual And UI Direction

The interface now aims for a modern watercolor-inspired point-and-click feel without relying on heavy image assets. The atmosphere comes from CSS-generated layers:

- Soft translucent gradient washes
- Paper grain and tactile card surfaces
- Ink-like shadows and organic vignettes
- Memory blooms, dread stains, grounding light, and threshold haze
- Hover/focus blooms around interactable objects
- A dominant framed scene with integrated notebook-style panels
- Tactile carried-item tray, floor plan, morning notes, and Memory Book cards
- Gentle feedback notes when memories, supports, metacognitive checks, or symptom states change

The UI avoids a generic website feel by treating navigation, notes, inventory, close inspections, and endings as objects inside the morning. It remains static, lightweight, dependency-free, and GitHub Pages deployable.


## Whole-Game Art Direction Pass

The latest optimization applies the watercolor/mystical interface language across the entire game, not only the opening screen. The title screen, core room scene, side panels, inventory tray, support modal, phone UI, close-inspection cards, Memory Book, Symptom Log, accessibility/settings surface, content-note/case-file sequence, and ending/reflection screens now share one visual system.

The goal is full-surface consistency: every player-facing surface should feel like part of the same playable watercolor artifact rather than a normal webpage or a modal placed over a game. This is especially important for the research-facing direction because the interface itself carries the metacognitive premise: the player is reading the morning through notes, cues, uncertainty checks, and reflective traces.

Design checks for future Codex passes:

- Preserve the central framed scene as the visual anchor.
- Preserve integrated left/right notebook panels.
- Preserve small circular point-and-click markers instead of large web buttons.
- Preserve Memory Book, Symptom Log, Self-Monitoring, and reflection as in-world artifacts.
- Do not revert modals into generic white browser dialogs.
- Do not remove accessibility controls or reduced-motion/readability protections.

## Gameplay

Move through five rooms:

- Bedroom
- Bathroom
- Kitchen
- Living Room
- Hallway/Doorway

Use the apartment map to navigate, click objects in first-person room panels, inspect them closely, collect useful items, place support cues, and complete or reshape the morning without timers, combat, jump scares, or failure screens.

Core interactions include:

- Find glasses to make the room easier to read.
- Look in the mirror and use grounding when recognition feels delayed.
- Make tea by collecting the mug and tea bag before using the kettle.
- Confirm medication with the pill organizer, date cue, or support instead of memory alone.
- Reconstruct a photo memory through sensory anchors.
- Respond to unread texts or leave a small honest draft.
- Use a playlist or earbuds as a grounding cue.
- Narrow a laptop/work note to one sentence or reminder.
- Water the basil plant as a small act of care.
- Gather keys, wallet, phone, transit card, sneakers, tote bag, and appointment card before the doorway.

## Systems

- **Inventory:** tactile item slots for everyday objects, care tools, modern life details, and departure items.
- **Morning checklist:** tracks major routine beats and can narrow attention to one next step.
- **Perception states:** clear, softened, fragmented, supported, overloaded, uncanny, and dread.
- **Symptom domains:** memory, language, visuospatial, executive function, motor, recognition, grounding, overload, and dread.
- **Close inspection:** important objects open examination cards with Look, Use, Ask, Remember, Ground, and Leave it for now actions.
- **Metacognitive check:** close inspections ask whether the object feels sure, partly sure, or unsure.
- **Self-Monitoring:** confidence checks are summarized in the side panel and saved into the Memory Book.
- **Support Style:** choose direct reminders, gentle cues, environmental supports, relational support, or self-support.
- **Support placement:** place cues near medication, door, phone, kettle, calendar, laptop, playlist, plant shelf, and transit items.
- **Symptom Log:** pairs clinical observations with lived-experience language.
- **Care Perspective:** stores reflections such as "Helping is not the same as correcting."
- **Memory Book:** sections for Fragments, Songs, Messages, Care Perspective, Symptom Log, Morning Records, Self-Monitoring, and Reflections.
- **Sound hooks:** lightweight Web Audio tones for kettle, page turns, phone hum, keys, memory fragments, overload pulse, grounding chime, hallway drone, mirror hush, unread text buzz, and song fragments.
- **Local save:** uses `localStorage` so Continue works in the same browser.
- **Watercolor atmosphere:** state classes such as `state-dread`, `state-memory`, `state-grounded`, `state-overloaded`, `state-uncanny`, and `state-supported` tune the scene wash and interface mood.

## Branching And Endings

Choices affect mid-game scenes and endings. Accepting a call can lower dread. Rejecting help can preserve privacy while raising pressure. Environmental supports reduce executive load. Music can help recognition. Relying only on memory can increase fragmentation. Pausing or rescheduling creates a valid smaller-morning path.

Current endings:

- **Supported Departure:** the protagonist leaves with cues, autonomy, and dignity.
- **Smaller Morning:** the day is rescheduled or reduced without shame.
- **Shared Morning:** relational support stays present through the routine.
- **Quiet Proof:** fewer tasks are completed, but selfhood is reconnected.
- **Overloaded but Not Alone:** the morning is difficult, but support remains available.
- **The Circled Appointment:** optional mystery route when enough fragments explain why the appointment mattered.

No ending is a simple success or failure. Each ending includes what helped, what remained difficult, symptom/care notes, and a post-game reflection prompt saved to the Memory Book.

## Controls

- Click or tap objects to open close inspections.
- Use the room map buttons to move between rooms.
- Use inventory slots to review collected items.
- Use Support Tools to choose a support style and place cues.
- Use confidence checks in close inspection to record metacognitive awareness.
- Open the Memory Book and Symptom Log from the menu or in-game side panel.
- Keyboard users can tab through buttons, choices, modals, reflection prompts, and close controls.

## Accessibility

Soft Recall is designed to stay readable and gentle. Current options include:

- Larger text
- High contrast
- Reduced visual drift
- Reduced blur
- Disable symptom text distortion
- Plain-language mode
- Content note toggle
- Mute sound
- Visible focus indicators
- Keyboard-accessible modals and choices
- No timers, jump scares, flashing, combat, shame language, or failure screens

Content note: Soft Recall explores memory changes, disorientation, medical uncertainty, fear, care, and autonomy.

## Medical Disclaimer

Soft Recall is a narrative neuroeducation game and design prototype. It is not medical advice, diagnosis, treatment, or a clinical assessment tool. Neurodegenerative conditions can affect younger adults as well as older adults, and no single universal experience is represented here. The symptom language is used respectfully to support reflection and gameplay, not to label the player or represent every person's life.

## Play Locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

This repo also includes a small Node server:

```bash
npm start
```

Then visit `http://localhost:4173`.

## Trailer

Generate the short GitHub-profile gameplay trailer with:

```bash
npm run capture:trailer
```

The capture script writes:

- `media/soft-recall-trailer.webm`
- `media/soft-recall-trailer.mp4`

## Project Checks

Run the smoke check with:

```bash
npm run check
```

The check verifies that core files are present, expected menu controls exist, localStorage save support remains, symptom/perception systems are present, close inspection exists, support styles and care perspective are included, metacognitive/self-monitoring systems are present, at least five endings are defined, and accessibility tokens remain available.

## Roadmap

- Split `game.js` into data, state, render, interactions, audio, and save modules if the prototype grows further.
- Add generated or hand-drawn room art while keeping UI text and controls code-native.
- Add lightweight event export for future IRB-approved playtesting, keeping the current prototype privacy-preserving by default.
- Add more close inspection variants for uncanny and dread perception states.
- Expand group chat and playlist branches into longer mid-game paths.
- Add captions or visual sound cues for generated audio hooks.
- Test on more physical devices, especially mobile Safari and older laptops.
