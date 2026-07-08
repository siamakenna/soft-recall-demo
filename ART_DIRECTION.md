# Art Direction

## Visual Target

Soft Recall should look like a first-person visual novel point-and-click mystery: intimate, warm, slightly uncanny, and readable. The player is standing in the room.

The current web build uses original SVG scene plates and painted-paper UI textures. Future passes should improve or replace those assets with authored art, not revert to simple CSS rectangles.

## Palette

- Warm interior light: muted amber, paper cream, faded lamp glow
- Uneasy shadows: black-brown, deep plum, green-gray
- Support cues: soft yellow, pale blue, gentle ink
- Avoid bright clinical white, generic purple gradients, and dashboard neutrals

## Composition Rules

- Foreground objects should feel closer and larger.
- Floors should recede toward the door or wall.
- Doors, mirrors, windows, and posters are vertical planes.
- Objects sit on surfaces, not in floating UI space.
- Lighting direction should remain consistent within a scene.
- Use vignette and grain to bind CSS-generated objects into one scene plate.

## What Not To Do

- Do not make the main view overhead.
- Do not let the floor plan become the primary interface.
- Do not use large rectangular object buttons floating in space.
- Do not center the experience around side panels.
- Do not style close inspections like generic browser modals.

## Hotspot Rules

Hotspots should be small embedded markers over visible objects. Labels appear on focus or hover. Controller focus must be obvious.

## VN Box Rules

The VN box is the main interface. It should contain speaker/source, narration, choices, confidence prompts, support prompts, and object responses. It should be readable, controller-friendly, and visually tied to ink, paper, and dark glass.

## Scene Examples

Bedroom / bedside:

- Foreground quilt at bottom edge
- Bedside table with glasses, phone, note
- Wall, poster, window light, soft shadow

Mirror / phone close-up:

- Mirror reflection is soft and uncertain, not horror
- Phone shows unread message, draft, and voice memo
- Choices support smaller communication

Hallway / door:

- Foreground runner or shoe mat
- Keys, tote, sneakers, transit card, appointment note
- Door with light around frame
- Repeated notes and shadow distortion on walls

## Show-Don't-Tell Rules

- Show dread with longer shadows, repeated notes, and distorted distance.
- Show support through physical notes, marked objects, and smaller choices.
- Show uncertainty through softened labels and delayed recognition.
- Avoid clinical explanation during ordinary play.
