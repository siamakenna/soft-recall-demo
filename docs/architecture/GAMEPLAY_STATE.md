# Gameplay State

The local save model is defined in `src/game/state.ts`. It is typed, versioned, and stored only in the browser; no server or account is involved.

The game tracks:

- Current room, visited rooms, unlocked rooms, and room visit order.
- Completed interactions and interaction order.
- Memory Book entries, confidence choices, and support-cue use.
- Packed items, wrong-count, clarity, and dissonance values.
- Front Door availability and the resolved ending.

The current key is `soft-recall.save.v5` with schema version `1`. The loader accepts the previous `soft-recall.save.v4` shape, fills missing fields conservatively, and rejects malformed values. Reloading an ending restores that ending instead of recalculating eligibility from partial state.

Gameplay-facing changes should preserve recoverable navigation. Players should be able to continue through visible Doorways even if a scene hotspot is missed or hard to target.
