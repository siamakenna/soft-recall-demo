# Repo Structure

This repo contains a static Vite React app for Soft Recall Demo.

## Major Folders

- `src/`: application source code.
- `src/game/`: the main Soft Recall game component and scene logic.
- `src/components/`: reusable React components.
- `src/data/`: structured data used by the app, when present.
- `public/`: static public assets served directly by Vite.
- `docs/`: project documentation.
- `docs/wiki/`: GitHub Wiki-ready Markdown pages.
- `.github/`: GitHub Actions workflows and repository automation.

## Important Root Files

- `package.json`: npm scripts and project dependencies.
- `package-lock.json`: locked dependency versions for npm installs.
- `vite.config.ts`: Vite configuration.

## GitHub Pages Base Path

`vite.config.ts` must keep:

```ts
base: "/soft-recall-demo/"
```

This base path is required for GitHub Pages deployment under the repository URL.

## Local Commands

```bash
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```
