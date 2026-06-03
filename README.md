# Soft Recall

**Soft Recall: A Morning in Five Rooms** is a quiet point-and-click narrative game about memory, routine, environmental support, and dignity-centered care.

Players move through a small apartment, gather essentials, reconstruct a photo memory from sensory clues, place environmental supports, and choose how much help they want during the morning.

## Play

This project is built with plain HTML, CSS, and JavaScript, so it can run directly on GitHub Pages.

Open `index.html` locally, or publish the repository through GitHub Pages.

## Features

- Five-room point-and-click apartment
- Object examine mode with separate “look closer” and “interact” choices
- Memory reconstruction puzzle using sensory fragments
- Reactive room visuals that change after tea, phone support, memory reconstruction, and readiness to leave
- Environmental support placement system
- Branching phone conversation with mid-game consequences
- Multiple endings
- Local save and continue
- Persistent “morning records” after completed runs
- Optional post-game reflection saved to the Memory Book
- Unlockable care notes after an ending
- Accessibility settings for larger text, higher contrast, reduced motion, plain language reflections, and muted sound
- Lightweight procedural sound cues with no external audio files

## Why this exists

The game is designed as a gentle neuroeducation prototype. It frames memory support as something built into environments, relationships, routines, and choices rather than as a test of individual willpower.

## Development

Install dependencies only if you want to use the optional local server, smoke check, or trailer capture tools.

```bash
npm install
npm start
npm run check
npm run capture:trailer
```

The core game does not require a build step.

## File structure

```txt
index.html          Main game interface
styles.css          Visual design, accessibility modes, and responsive layout
game.js             Game data, state, rendering, interactions, endings, and trailer automation
serve.mjs           Optional local static server
smoke-check.mjs     Lightweight project sanity check
capture-trailer.mjs Optional trailer capture script
```

## Roadmap

- Add illustrated character portraits for phone dialogue
- Add optional developer commentary mode
- Add more memory puzzles with different clue combinations
- Add title-screen route gallery once multiple mornings are completed
- Add GitHub Actions for smoke checks
