# Deployment

Soft Recall is now a static Vite React single-page app. It does not require
TanStack Start, Nitro, Wrangler, Cloudflare, SSR, a backend, auth, a database,
or audio services.

## Local Development

Use Node 22 or newer:

```sh
node -v
npm install
npm run dev
```

Vite will print the local URL. In development, the app renders the current
Lovable React game directly from `src/main.tsx` and `src/game/SoftRecall.tsx`.

## Build

```sh
npm run build
```

The production build is written to `dist/`. A successful build includes
`dist/index.html` and static assets under `dist/assets/`.

## Preview

```sh
npm run preview
```

This serves the static `dist/` output with Vite Preview. No server runtime is
started.

## GitHub Pages

The Vite base path is configured in `vite.config.ts` as:

```ts
base: "/soft-recall-lovable-sandbox/",
```

The workflow at `.github/workflows/deploy.yml` uses Node 22, runs `npm ci`,
builds the static site, uploads `dist/`, and deploys it to GitHub Pages.

In GitHub, set Pages to use GitHub Actions as the source. Pushing to
`lovable-import-pass` or manually running the workflow will publish the game.

## Notes

The build intentionally preserves the silent/no-audio behavior. Mentions of
voice memos or familiar voices are narrative text only; no audio files or audio
playback are added.
