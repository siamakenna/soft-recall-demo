# Soft Recall

**Soft Recall** is a quiet point-and-click game prototype about routine, memory, perception, and care.

The player moves through a small morning routine: finding glasses, making tea, taking medication, looking at a photo, calling someone familiar, and leaving for an appointment. As recall softens, object labels and room cues become less certain. Support tools such as notes, labels, and calm prompts make the apartment easier to read again.

## Prototype Focus

- Working title and interface: **Soft Recall**
- Tone: minimal, intimate, cozy, and gently uncanny
- Format: static browser prototype suitable for GitHub Pages
- Core loop: explore, click, experience a shift, reflect, adapt the environment
- Accessibility options: reduced visual drift, plain language reflection cards, larger text, and higher contrast

## Play Locally

Open `index.html` in a browser, or serve the folder with a tiny local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

This repo also includes a small Node server:

```bash
npm start
```

Then visit `http://localhost:4173`.

If `npm` is unavailable in Codex desktop, use the bundled Node runtime:

```bash
~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/serve.mjs
```

## Trailer Direction

A 30-second profile trailer should show:

1. Title screen: **Soft Recall**
2. The first few clicks of the morning routine
3. Object labels becoming softer or less certain
4. A support cue being placed
5. The final line: “Care is a kind of remembering.”

The trailer should feel quiet and observational rather than flashy.

Generate the trailer with:

```bash
npm run capture:trailer
```

Codex desktop fallback:

```bash
~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/capture-trailer.mjs
```

The capture script writes the trailer assets to:

- `media/soft-recall-trailer.webm`
- `media/soft-recall-trailer.mp4`
