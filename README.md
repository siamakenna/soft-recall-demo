# Soft Recall Demo

Soft Recall Demo is a static Vite React single-page game for PC browsers. It is a first-person point-and-click visual novel demo about memory, routine, uncertainty, and care.

![Soft Recall title screen](docs/media/soft-recall-banner.webp)

The active build is desktop-first and deploys to GitHub Pages. It does not use a backend, auth, database, voiceover, music, or sound effects.

## Play

- [Play on itch.io](https://siamakenna.itch.io/soft-recall-demo)
- [Play on GitHub Pages](https://siamakenna.github.io/soft-recall-demo/)

For the current desktop release, use a browser window of at least 900 x 600 or launch fullscreen.

## Play Locally

```bash
npm install
npm run dev
```

Build and preview the production version:

```bash
npm run build
npm run preview
```

The production build should create `dist/index.html`.

## Current Scope

- Static Vite React SPA
- First-person scene art and point-and-click hotspots
- Doorways navigation fallback
- Memory Book
- Three-ending demo route
- PC-only manual QA route
- GitHub Pages deployment with base path `/soft-recall-demo/`

## Professional Documentation

- [Wiki index](docs/WIKI_INDEX.md)
- [Runners](docs/RUNNERS.md)
- [Repository settings checklist](docs/process/REPO_SETTINGS_CHECKLIST.md)
- [Playthrough QA](docs/qa/PLAYTHROUGH_QA.md)
- [Release process](docs/release/RELEASE_PROCESS.md)
- [itch.io release guide](docs/release/ITCH_RELEASE.md)
- [Playtest guide](docs/qa/PLAYTEST_GUIDE.md)
- [Agent guidance](docs/agents/AGENTS_OVERVIEW.md)
- [Contributing](CONTRIBUTING.md)
- [Support](SUPPORT.md)
- [Security](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Credits](CREDITS.md)
- [Changelog](CHANGELOG.md)

## Required QA Route

Title -> Begin -> Tutorial -> Bedroom -> glasses -> note -> phone choice -> Hallway -> Kitchen -> Hallway -> Bathroom -> Hallway -> Memory Book -> Front Door -> Ending

## Disclaimer

Soft Recall Demo is narrative and research-informed. It is not medical advice, diagnosis, screening, treatment, or a clinical assessment tool.
