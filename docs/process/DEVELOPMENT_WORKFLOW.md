# Development Workflow

## Local Setup

```bash
npm install
npm run dev
```

## Production Check

```bash
npm run build
npm run preview
```

Confirm `dist/index.html` exists after the build.

## Change Discipline

- Keep gameplay changes narrow and intentional.
- Do not change progression gates, hotspots, Doorways, tutorial flow, save logic, Memory Book behavior, or endings without full manual QA.
- Keep professional docs in `docs/`, not scattered across the root.
- Keep GitHub Pages compatibility intact.
