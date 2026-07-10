# Release Process

Soft Recall Demo deploys as a static Vite React SPA through GitHub Pages.

## Before Merge

1. Run `npm install`.
2. Run `npm run build`.
3. Run `npm run preview`.
4. Complete the required PC playthrough QA route.
5. Confirm `dist/index.html` exists.

## Deployment

Merging to `main` triggers `.github/workflows/deploy.yml`. The workflow builds the app and uploads `dist/` to GitHub Pages.

## Release Notes

Update [../../CHANGELOG.md](../../CHANGELOG.md) for visible project, documentation, or workflow changes.
