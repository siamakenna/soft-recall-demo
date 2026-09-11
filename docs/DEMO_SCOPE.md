# Demo Scope

## Delivery Boundary

This expansion adds room stories, silent video playback, smoother object handling, and the final Memory Book review to the existing game. Story and review progress persist in the local save.

The project remains a static, desktop-first React/Vite point-and-click visual novel with local browser saves and the existing GitHub Pages base path `/soft-recall-demo/`. No backend, authentication, database, audio, voiceover, music, sound effects, or mobile/PWA expansion is included.

## Content Inventory

- Four optional object-led conversations, one per existing `RoomId`, exported as `ROOM_STORIES: Record<RoomId, RoomStory>`.
- Five beats per conversation: 20 narrative beats total, each targeting 40-70 words.
- Two meaningful responses per beat: 40 choices total, each with a short immediate response. Choices rejoin at the next beat rather than creating a branching quest tree.
- Four matching `MemoryEntry` artifacts, awarded only on story completion, with unique titles and explicit room attribution.
- `CUTSCENE_COPY` for `waking`, `note`, `corridor`, `tea`, `threshold`, and `clear-morning`: five timed captions each, with silent MP4 camera films of the existing paintings, automatic playback, pause, skip, and a still-art fallback.
- Pointer-carried note and key placement, sequence and recall sorting, three tea gestures, and six brushing sweeps. Correct arrangements resolve without another confirmation. Keyboard alternatives remain available.
- Adaptive Front Door recall: longer exploratory runs face a second plausible decoy, while a no-misstep run completing every core room task earns the optional `clear-morning` beat.
- State-driven room light: room-specific dawn washes and a gradual brightness lift respond to visited rooms and completed tasks without changing hotspot geometry.
- A required final Memory Book review after the existing memory threshold: three player-held observations plus one short context note in `Learn More`. External research links remain optional and never interrupt the room scenes.

The writing stays in first-person, close to early-morning light, fabric, glaze, and familiar objects. It makes no clinical claims and includes no research citations, diagnosis, treatment guidance, or medication instructions. The new choices are not tests of whether the player feels correctly.

## Duration Target

The desired full exploratory experience is **20-30 minutes**, including existing puzzles, navigation, optional conversations, pauses, and Memory Book reading. This is a design target, not a measured duration, minimum runtime, or guarantee. The supplied prose alone does not establish a 20-30 minute session.

No measured playtime is claimed by this delivery. A fast reader can finish sooner. The shorter route remains available by ignoring room stories and skipping cutscenes. The target budget includes approximately five minutes of films, 7-10 minutes of story exploration, and 8-15 minutes of routines, navigation, choices, and book review. Validate these estimates with fresh players; avoid padding through repeated clicks or forced waits.

After integration, time both a story-free route and a full exploratory route with fresh desktop players. Record participant count, route, reading pace, puzzle retries, time spent in the book, and whether pauses are included. Report observed ranges separately from the target. If sessions run short, assess content and exploration from those observations without making optional material mandatory.

## Required Versus Optional

The existing phone progression, kitchen/bathroom task thresholds, minimum memory count, final Memory Book review, front-door checks, and selected ending interactions remain gameplay requirements. Glasses and note are part of tutorial/QA guidance; the phone handler does not enforce them as prerequisites. The required reading is a brief, non-diagnostic context page; following any linked source is optional. See `GAME_FLOW.md` for the baseline and a story-free regression route.

All four added stories are optional. None replaces a routine, grants a packed item, sends a message, or unlocks a room. Their completion memories may participate in existing memory behavior, but the old route must satisfy existing checks without them. Parent integration must review the current memory helper's clarity increment as well as deduplication and the recall pool; these are existing side effects, not neutral storage.

All six cutscenes are silent, automatically played, and skippable. Watching them is never required for a memory, routine, or ending. The opening plays on a new run, note follows folded-note placement, corridor follows the first Bedroom-to-Hallway move, tea follows the kettle routine, threshold precedes resolution of the selected ending, and clear-morning rewards completion of all core tasks without missteps. The cutscene keys persist locally so routine play is not repeatedly interrupted.

## Acceptance Boundary

Type safety, content shape, IDs, word counts, build compatibility, story entry/exit, save/restart behavior, and cutscene controls are covered by the integrated implementation and browser smoke route. The target duration still needs playtest observation with fresh desktop players.

The desired full exploratory experience remains **20-30 minutes**; a fast story-free route remains available. Follow `docs/qa/PLAYTHROUGH_QA.md` and the additional checks in `GAME_FLOW.md` before release. Browser cinematics use the current scene artwork, so a future Blender pass can supply authored camera renders without changing the story state contract.
