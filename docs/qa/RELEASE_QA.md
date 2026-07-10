# Release QA

Run before merging release-facing changes.

```bash
npm install
npm run build
npm run preview
```

Confirm:

- `dist/index.html` exists.
- GitHub Pages base path remains `/soft-recall-demo/`.
- The required PC playthrough route passes.
- No console errors appear during the route.
- No backend, auth, database, server runtime, audio, voiceover, music, or sound effects were added.
