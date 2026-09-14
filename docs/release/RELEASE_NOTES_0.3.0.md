# Soft Recall Demo 0.3.0

## Release candidate

Soft Recall Demo 0.3.0 is a desktop-first static browser demo focused on a quiet, uncertain morning. It keeps the first-person painted rooms and adds a longer optional route through the apartment, silent camera films, room stories, tactile drag interactions, saved progress, and three endings.

The game remains a fictional narrative experience. It is not medical advice, diagnosis, screening, treatment, or a clinical assessment tool.

## Included

- Bedroom, Hallway, Kitchen, Bathroom, Doorways, Memory Book, and the three existing endings.
- Six silent, skippable, pausable camera films using the existing scene artwork.
- Optional room stories and Memory Book artifacts for exploratory play.
- Mouse and keyboard alternatives for phone, drag, sorting, tea, toast, water, and brushing interactions.
- Versioned local save state with safe legacy-save migration and malformed-save recovery.
- Reduced-motion support, reversible visual distortion, camera pan/zoom, and aligned scene-relative hotspots.
- GitHub Pages deployment at `/soft-recall-demo/` and a separate relative-path itch.io build.

## Verification record

Run these commands from the repository root:

```bash
node --version
npm ci
npm run typecheck
npm run lint
npm run build
test -f dist/index.html
npm run test:e2e
```

The required route is:

`Title -> Begin -> Tutorial -> Bedroom -> glasses -> note -> phone choice -> Hallway -> Kitchen -> Hallway -> Bathroom -> Hallway -> Memory Book -> Front Door -> Ending`

The release screenshots are generated outside the repository under:

`~/Downloads/soft-recall-v0.3.0-20260914/screenshots/`

The itch package is generated outside the repository under:

`~/Downloads/soft-recall-v0.3.0-20260914/`

Final local verification on 2026-09-14 used Node `v26.4.0` with the Node 24 recommendation pinned in `.nvmrc`. `npm ci`, TypeScript, lint, production build, `dist/index.html`, and the full Chromium suite passed. The Chromium suite completed 20/20 tests; a focused production-preview run completed 6/6 tests across Firefox and WebKit. The run covered the required route, all three endings, keyboard alternatives, save migration/recovery, reduced motion, no-audio initialization, silent cutscene fallback, and scene-relative hotspot alignment at 1920 x 1080, 1440 x 900, and 1280 x 720.

The six bundled MP4 files were inspected with FFmpeg and each contains a video stream with no audio stream. The scene artwork is already compact WebP and was not recompressed.

## Publishing

Merging to `main` runs the GitHub Pages workflow and uploads `dist/`. For itch.io, run `npm run build:itch`, zip the contents of `dist/` with `index.html` at the archive root, verify the archive, and upload it as an HTML game. See [ITCH_RELEASE.md](ITCH_RELEASE.md).

## Known limitations

- This is a PC/desktop-first demo. The supported release window is at least 900 x 600; smaller windows receive the existing safeguard.
- Saves are local to the browser and are not synchronized between browsers or devices.
- The camera films are silent by design and fall back to timed captions if video playback fails.
- A full human playtest and storefront upload still require the publisher's own browser/account decision.
