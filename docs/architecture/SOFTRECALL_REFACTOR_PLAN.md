# Soft Recall Refactor Plan

This is a future-facing plan. Do not execute it during documentation-only or repo-settings tasks.

## Goals

- Keep `src/game/SoftRecall.tsx` readable.
- Preserve the current playable route.
- Separate static content from runtime state when it reduces risk.
- Keep visual scene art, hotspots, Doorways, and Memory Book data conceptually distinct.

## Safe Sequence

1. Add characterization tests or scripted smoke checks around the required PC route.
2. Extract static scene data without changing behavior.
3. Extract Memory Book display data without changing behavior.
4. Extract ending copy only after route QA is stable.
5. Re-run build and manual PC playthrough after every step.

## Not In Scope Yet

- Mobile/PWA/native wrapper work.
- Server features.
- Audio.
- New rooms.
- Clinical education modules.
