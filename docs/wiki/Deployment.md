# Deployment

Soft Recall Demo is a static Vite React app deployed through GitHub Pages.

## Local Build

```bash
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Local preview URL:

```text
http://127.0.0.1:4173/soft-recall-demo/
```

After build, confirm:

```text
dist/index.html
```

exists.

## Production URL

```text
https://siamakenna.github.io/soft-recall-demo/
```

## GitHub Pages

GitHub Pages deploys from `main` through GitHub Actions. After pushing or merging to `main`, check the Actions tab for the Pages workflow status.

## Deployment Notes

- Keep the app static.
- Keep `base: "/soft-recall-demo/"` in `vite.config.ts`.
- Do not add server-only features for deployment.
- Build success is necessary but not enough; run playthrough QA before treating a deploy as ready.
