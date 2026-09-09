# QA Checklist

Use this checklist for gameplay, save-state, input, or deployment changes. The desktop route should be completed without editing local storage or using debug tools.

## Automated checks

```bash
npm ci
npm run typecheck
npm run build
test -f dist/index.html
npm run test:e2e
```

Start `npm run preview -- --host 127.0.0.1` separately when doing manual QA.

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
- [ ] Front Door recall and readiness checks can be completed.
- [ ] Supported Departure, Smaller Morning, and Overloaded but Not Alone are each reachable from the final choice/state.
- [ ] No console errors appear during the route.

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
- [ ] Parallax changes background art only; hotspot target positions remain fixed.

## Static deployment

- [ ] `npm run preview` serves `/soft-recall-demo/` successfully.
- [ ] Network requests contain no server, auth, database, analytics, or audio services.
- [ ] GitHub Pages workflow builds and uploads `dist`.
- [ ] No audio API is initialized.
