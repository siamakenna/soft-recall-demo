# QA Checklist

Use this checklist for gameplay, save-state, input, or deployment changes. The desktop route should be completed without editing local storage or using debug tools.

## Automated checks

```bash
npm ci
npm run typecheck
npm run lint
npm run build
test -f dist/index.html
npm run test:e2e
```

Start `npm run preview -- --host 127.0.0.1` separately when doing manual QA.

Optional cross-browser verification:

```bash
npx playwright install firefox webkit
PLAYWRIGHT_CROSS_BROWSER=1 npm run test:e2e -- --project=firefox --project=webkit
```

The suite runs one worker to avoid competing browser engines distorting timed routines. On macOS WebKit, use Option+Tab when ordinary Tab skips buttons. Set `RELEASE_SCREENSHOT_DIR` to an absolute output directory to capture the core route and desktop framing checks. `PLAYWRIGHT_BASE_URL` can target a separately running production preview or deployed build.

Release-specific results belong in [release notes](release/RELEASE_NOTES_0.3.0.md); the unchecked boxes below remain a reusable checklist, not a claim that every future build passed.

## Core playthrough

- [ ] Title screen appears and **Begin** starts a new morning.
- [ ] Tutorial can be completed or skipped with keyboard-focusable controls.
- [ ] Bedroom appears with aligned scene-relative hotspots.
- [ ] Glasses, folded note, and phone all respond.
- [ ] The phone word can be arranged by mouse or keyboard, and a phone choice completes the interaction.
- [ ] Hallway unlocks and appears in the **Doorways** strip.
- [ ] Route works: Bedroom -> Hallway -> Kitchen -> Hallway -> Bathroom -> Hallway.
- [ ] At least two kitchen and two bathroom routines can be completed.
- [ ] Memory Book opens with its button and with `M`, then closes with `Escape`.
- [ ] Learn More is available only through its optional Memory Book tab.
- [ ] After the memory threshold, Front Door opens the Memory Book review instead of starting recall immediately.
- [ ] The Memory Book HUD control shows a visible, keyboard-readable review-needed state after the memory threshold.
- [ ] The review records `What did I notice?`, `What helped?`, and `What stayed uncertain?`.
- [ ] The short `Learn More` context note must be read once; following external sources remains optional.
- [ ] Front Door recall and readiness checks can be completed.
- [ ] Supported Departure, Smaller Morning, and Overloaded but Not Alone are each reachable from the final choice/state.
- [ ] No console errors appear during the route.
- [ ] After two wrong placements, the scene gains subtle silent haze and the unfinished hotspot markers remain aligned and usable.
- [ ] The optional frustration beat offers both `Snap at the room` and `Set one thing down` responses, then returns control without blocking Doorways.
- [ ] The eerie treatment stays readable and reversible with the `B` breathe ritual; no jump scare or audio cue is present.
- [ ] Each frustration response persists across Continue without repeating or changing dissonance again.
- [ ] Reduced motion stops animated haze and markers; Visual distortion at zero clears the haze and scene blur.

## Save and recovery

- [ ] Reload in the Bedroom, Hallway, Kitchen, and Bathroom, then select **Continue the morning**.
- [ ] Current room, visited/unlocked rooms, interactions, memories, room order, confidence, support cues, packed items, and counters are restored.
- [ ] Reload after an ending and confirm **Continue the morning** restores that same ending.
- [ ] A malformed save falls back to a new game without a blank screen.
- [ ] A legacy `soft-recall.save.v4` save migrates without losing available progress.

## Input and motion

- [ ] `Tab`, `Shift+Tab`, `Enter`, and `Space` reach and activate visible buttons.
- [ ] Arrow/WASD navigation can cycle VN choices, hotspots, and Doorways.
- [ ] Typing in the Memory Book search does not trigger global game shortcuts.
- [ ] Reduced motion swaps rooms immediately and does not show transition animation.
- [ ] Camera movement keeps art and markers registered; atmosphere and hover effects never move hit targets independently.
- [ ] `Look closer` / `+` zoom keeps the selected artwork and hotspot aligned; `Room view` / `0` resets the camera.
- [ ] Opening a room detail starts its optional five-beat story, the two choices rejoin, and the final artifact appears in the Memory Book.
- [ ] Leaving a partial room story and returning resumes at its saved beat without blocking Doorways.
- [ ] Silent cutscenes start and finish automatically. Captions follow video time with no Continue buttons.
- [ ] Pause/Play, Tab focus, and Escape/Skip work. Returning from a hidden browser tab does not skip unseen captions.
- [ ] Reduced motion and a failed video load use still art with timed captions and reach the same destination.
- [ ] Drag the note and keys into destinations. Dropping outside a destination cancels safely.
- [ ] Drag toast steps into order and sort recall/readiness cards. Correct arrangements finish on the final drop.
- [ ] Pour/lift/set down the tea with three drags; six alternating brush sweeps finish on mouse release.
- [ ] Keyboard controls can complete the new routines. Closing a routine cannot activate the hotspot beneath it.

## Static deployment

- [ ] `npm run preview` serves `/soft-recall-demo/` successfully.
- [ ] A viewport below 900 x 600 shows the fullscreen/resize safeguard instead of overlapping game controls.
- [ ] `npm run build:itch` creates a build whose asset paths are relative.
- [ ] Network requests contain no server, auth, database, analytics, or audio services.
- [ ] GitHub Pages workflow builds and uploads `dist`.
- [ ] No audio API is initialized.
- [ ] All six MP4s have a video stream and no audio stream; they load under both GitHub Pages and itch.io base paths.
