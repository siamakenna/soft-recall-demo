# File Structure

## Root

- `README.md`: concise project overview.
- `package.json` and `package-lock.json`: npm dependencies and scripts.
- `vite.config.ts`: static Vite configuration and GitHub Pages base path.
- `components.json`: UI component configuration.
- `.github/`: workflows, templates, Dependabot, and Copilot guidance.

## Source

- `src/main.tsx`: active React entrypoint.
- `src/game/`: active game implementation and support files.
- `src/assets/`: scene art used by the game.
- `src/components/`: shared UI components.
- `src/lib/`: shared utilities.

## Documentation

- `docs/wiki/`: GitHub Wiki-ready pages.
- `docs/process/`: workflow and settings guidance.
- `docs/qa/`: manual QA routes.
- `docs/release/`: deployment and release guidance.
- `docs/architecture/`: app structure notes.
- `docs/agents/`: AI coding tool guidance.
- `docs/archive/`: inactive legacy or imported files retained for reference.
