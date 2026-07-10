## Summary

Describe what changed and why.

## Type of Change

- [ ] Documentation / repo metadata
- [ ] CI / GitHub workflow
- [ ] Gameplay logic
- [ ] UI polish
- [ ] Deployment

## PC Playthrough QA

Required route:

Title -> Begin -> Tutorial -> Bedroom -> glasses -> note -> phone choice -> Hallway -> Kitchen -> Hallway -> Bathroom -> Hallway -> Memory Book -> Front Door -> Ending

- [ ] Title screen loads.
- [ ] Begin starts the game.
- [ ] Tutorial/help or controls are understandable.
- [ ] Bedroom object interactions work.
- [ ] A phone choice unlocks Hallway.
- [ ] Doorways or visible navigation can recover room movement.
- [ ] Kitchen and Bathroom can be reached and exited.
- [ ] Memory Book opens and closes.
- [ ] Front Door ending can be reached.
- [ ] No console errors appear during the route.

## Guardrails

- [ ] No mobile/PWA work was added.
- [ ] No audio, voiceover, music, or sound effects were added.
- [ ] No backend, auth, or database work was added.
- [ ] No builder references were added.
- [ ] If navigation, hotspots, progression gates, tutorial flow, or ending access changed, full playthrough QA was completed.

## Validation

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run preview -- --host 127.0.0.1 --port 4173`
