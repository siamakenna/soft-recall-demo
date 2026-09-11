# Gameplay State

The local save model is defined in `src/game/state.ts`. It is typed, versioned, and stored only in the browser; no server or account is involved.

The game tracks:

- Current room, visited rooms, unlocked rooms, and room visit order.
- Completed interactions and interaction order.
- Memory Book entries, confidence choices, and support-cue use.
- Packed items, wrong-count, clarity, and dissonance values.
- Front Door availability and the resolved ending.
- Optional room-story beat indexes, choice history, six viewed cutscene keys, and the final Memory Book review.

The current key is `soft-recall.save.v5` with schema version `3`. The loader accepts the previous `soft-recall.save.v4` shape, fills missing fields conservatively, and rejects malformed values. Reloading an ending restores that ending instead of recalculating eligibility from partial state. Older saves begin with empty optional-story progress and an incomplete book review.

Cinematic playback time and active pointer gestures are transient. A viewed flag is
stored only on completion or skip. Routine IDs, packing, and ending resolution use
the same existing handlers after a gesture completes. No video player or input
library is needed at runtime beyond native browser media and pointer APIs.

Gameplay-facing changes should preserve recoverable navigation. Players should be able to continue through visible Doorways even if a scene hotspot is missed or hard to target.
