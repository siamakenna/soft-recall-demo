# Morning Game Flow

## Status

`src/game/data/morningBeats.ts` supplies typed narrative content for four optional room stories and six silent cutscenes. `SoftRecall.tsx` presents those beats, records choices, awards Memory Book artifacts, and persists progress in the versioned local save.

## Existing Short Route

The gameplay baseline is `src/game/SoftRecall.tsx`, `src/game/data/interactions.ts`, and `src/game/state.ts`.

1. Title -> Begin -> tutorial/help -> Bedroom. The tutorial directs the player to glasses, the folded note, and the phone. Glasses and note are tutorial guidance, not prerequisites enforced by the phone handler.
2. Finish the phone word interaction and choose a response. All three phone responses complete `phone` and unlock Hallway, Kitchen, and Bathroom. Their existing consequences differ.
3. Travel through Hallway. Bedroom, Kitchen, and Bathroom connect through Hallway; there is no direct Kitchen-to-Bathroom exit.
4. Complete any two kitchen tasks: `k-kettle`, `k-fridge`, `k-toast`. Complete any two bathroom tasks: `b-mirror`, `b-meds`, `b-tap`, `b-teeth`. These existing counts unlock the front door; the kitchen and bathroom order is flexible.
5. Collect at least eight unique Memory Book entries through existing interactions. Opening the book alone does not satisfy this check. Keys, coat, alarm, curtains, and other existing objects can supply additional entries without any new room story.
6. Before the Front Door recall check, open the Memory Book review page. Hold three observations (`What did I notice?`, `What helped?`, and `What stayed uncertain?`) and read the short context note in `Learn More`. The external source links remain optional; the context note is the only required reading.
7. At Front Door, complete the existing memory-recall checklist and readiness checklist. The recall list uses the last six entries plus a decoy; readiness reflects actual tracked items and routines.
8. Choose an existing ending action. Opening the door uses the deadbolt and knob interactions; the smaller-morning and support actions resolve through their existing handlers. Waiting returns to exploration.

For a concrete story-free QA route, collect glasses, note, phone lock word, phone response, coat, and keys memories, then complete kettle and toast, and tap and toothbrush. This provides more than eight entries without optional story completion. Open the Memory Book, complete the three review prompts, open `Learn More`, read the context note, then close the book and use the front door checks. This is a proposed regression route, not a measured playthrough result.

## Route Variety And Difficulty

The apartment stays small, but the route is not fixed. The phone has three responses, the kitchen can be completed with any two of three tasks, the bathroom with any two of four tasks, and Kitchen/Bathroom can be visited in either order with Hallway as the return point. Optional object stories add four five-beat threads, and the final choice leads to one of three endings. A player who revisits every room can therefore build a different morning without creating a separate quest tree.

### Eerie Escalation

Missteps now change the atmosphere without changing the map or moving any input target. After repeated wrong placements, a broad haze gathers over the scene, the edges cool and soften, unfinished hotspots lose a little certainty, and the room's header shifts from `the morning feels blurred` to `the room won't hold still`. The haze is silent, reversible through the existing breathe ritual, and never obscures the Doorways strip.

Once per run, when the player has accumulated at least two missteps and is between interactions, a short optional frustration beat appears in the VN box. The player can snap at the room or set one thing down and start smaller. Both choices return control immediately; the first deepens dissonance and the second eases it. This is a fictional subjective response, not a symptom checklist or a universal claim about neurodegeneration.

The Front Door recall check adapts to attention already spent: a shorter run presents one plausible decoy, while a run with 12 or more memories presents two. The normal route remains recoverable after a mistake. A bonus `clear-morning` beat appears only when every core room task is complete with zero missteps; it adds a longer reflection and never gates an ending.

Room light also changes with progress. Bedroom, Hallway, Kitchen, and Bathroom retain different warm/cool washes, while the apartment gradually lifts as rooms are visited and tasks are completed. These changes are visual state only; they do not move hotspot coordinates or alter the route rules.

Preserve the existing thresholds, task IDs, navigation, packing, checks, and ending resolution. The required manual QA route remains in `docs/qa/PLAYTHROUGH_QA.md`.

## Optional Exploratory Route

Suggested reading order: Bedroom story -> phone -> Hallway -> Kitchen story and routines -> Hallway -> Bathroom story and routines -> Hallway story -> Memory Book -> Front Door. This is an editorial sequence, not a room-order requirement. Every story is self-contained and can be encountered on a revisit; the hallway story does not require an unlocked front door.

| Room | Story ID | Object label | Completion artifact |
| --- | --- | --- | --- |
| Bedroom | `morning-bedroom` | Quilt at the foot of the bed | Fragments: Quilt: the green square |
| Kitchen | `morning-kitchen` | Cup beside the window | Reflections: Cup: a place for company |
| Bathroom | `morning-bathroom` | Striped hand towel | Fragments: Towel: a stripe of red |
| Hallway | `morning-hallway` | Mended coat cuff | Reflections: Coat: five darker stitches |

Each story has five ordered beats. The player chooses between two supplied responses; both choices rejoin at the next beat. They differ in action, attention, or imagined conversation, not correctness. The immediate response is shown before the next beat. No choice requires a previous branch. The kitchen cup is empty and does not assume the kettle task is complete; imagined conversation sends no message. The towel story does not complete washing, and the coat story does not pack anything.

The `Leave this moment` control exits a story at any beat. A partial story grants no completion artifact and never blocks navigation or routines. The next time the player returns to that object, the story resumes from its saved beat index. Story choices and progress are stored separately from routine task IDs.

After the final response is acknowledged, record completion once and add that room's `memory` once. Preserve its unique title and explicit `room`; assign `at` at runtime, not in static data. Each artifact is true for every choice combination. Reopening a completed story must not duplicate the artifact.

The existing `remember()` helper deduplicates by title, stamps entries, shows a toast, and increments clarity. Adding an artifact also affects the existing eight-entry check and potentially the last-six recall pool. Integration must account for these effects explicitly: optional artifacts may contribute like other memories, but no story ID becomes a requirement. Do not route these choices through `applySeedChoice()`, which changes confidence, support counts, clarity, or missteps. No new story-specific score, penalty, gate, or ending rule belongs in this data layer.

## Silent Cutscenes

`CUTSCENE_COPY` contains six scripts with five timed captions each. Silent MP4s play automatically with pause and skip controls. Skip and natural completion reach the same gameplay destination without changing rewards, counters, or choices. Reduced motion and failed video loads use still art with timed captions. See `CUTSCENES.md` for playback, timing, and rendering details.

| Key | Intended placement | Return destination |
| --- | --- | --- |
| `waking` | New-run opening, coordinated with onboarding | Bedroom and normal tutorial flow |
| `note` | After the folded note is placed | Bedroom exploration |
| `corridor` | First Bedroom-to-Hallway move | Hallway exploration |
| `tea` | After successful `k-kettle` completion; the cup is already empty | Kitchen exploration |
| `threshold` | After the selected final ending action | The selected ending |
| `clear-morning` | After a no-misstep run completes every core room task | Existing front-door choices, including wait |

Do not require the kettle merely to show `tea`: a player choosing fridge and toast may never see it. Do not show threshold prose that assumes departure after the player chooses to wait or seek support. Replays must not repeatedly interrupt routine interactions. `clear-morning` is a bonus for completing every core task without a misstep; it never gates an ending. Trigger and replay tracking are integration work, not encoded in `CUTSCENE_COPY`.

## Verification Handoff

Pointer dragging now carries notes and keys to their destinations, sorts recall and
readiness cards, and arranges toast steps. Correct completed arrangements resolve
immediately; incomplete or incorrect ones remain editable with the existing retry
controls. Tea uses three gestures (kettle to cup, cup to hands, empty cup to saucer).
Brushing uses six alternating sweeps and finishes on release. Keyboard selection
and placement remain available. Room swaps happen immediately under a 280 ms fade.

The full exploratory route still targets 20-30 minutes. Cinematic playback supplies
about five minutes; room stories, meaningful choices, puzzles, revisits, and the
Memory Book supply the remainder. Faster readers can skip films and stories.
This is a pacing budget, not a measured duration or a forced minimum.

- Complete the old route with all four stories ignored and all offered cutscenes skipped.
- Complete every story, exercising both responses at every beat across runs; verify response visibility before advance and branch continuity.
- Leave stories early, re-enter rooms, reopen completed stories, reload, and restart; verify consistent progress behavior and no duplicate artifacts.
- Confirm stories do not complete old task IDs, alter packing, or introduce a story completion requirement. Check artifact counting, clarity behavior, and recall options deliberately.
- Test cutscene autoplay, pause/resume, and skip using mouse and keyboard, reduced motion, and interaction cancellation. Confirm no lost ending choices or blocked overlays.
- Run typecheck/build and manual desktop browser QA. Content checks alone do not establish runtime playability or duration.
