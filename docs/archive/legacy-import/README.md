# Legacy Import Archive

This folder holds files imported with an earlier app/runtime shape that are not used by the current static Vite React SPA entrypoint.

The active game starts from `src/main.tsx`, imports `src/game/SoftRecall.tsx`, and builds with `vite.config.ts`. The archived server, router, route, and error-boundary helper files are kept for reference only.

Do not restore these files into active source unless a future task explicitly reintroduces a different runtime and completes full build and playthrough QA.
