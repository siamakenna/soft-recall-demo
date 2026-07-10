# Playthrough QA

Use this page to verify core playability before pushing or deploying.

## Local Checks

```bash
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Preview URL:

```text
http://127.0.0.1:4173/soft-recall-demo/
```

## Required Manual Route

- [ ] Title screen loads.
- [ ] Begin starts the game.
- [ ] Tutorial/help or control hints are visible where supported.
- [ ] Bedroom loads.
- [ ] Glasses interaction works.
- [ ] Folded note interaction works.
- [ ] Phone interaction works.
- [ ] A phone choice unlocks Hallway.
- [ ] Bedroom -> Hallway works.
- [ ] Hallway -> Kitchen works.
- [ ] Kitchen -> Hallway works.
- [ ] Hallway -> Bathroom works.
- [ ] Bathroom -> Hallway works.
- [ ] Memory Book opens and closes.
- [ ] Front Door offers an ending after enough routine interactions.
- [ ] At least one ending can be reached.

## Interaction Checklist

- [ ] Object hotspots are visible and aligned with scene objects.
- [ ] Doorways appear whenever room movement is available.
- [ ] Doorways can recover the route if image hotspots are difficult to click.
- [ ] Memory Book records noticed objects or cues.
- [ ] Ending access is not blocked after the required route.
- [ ] No console errors appear during play.

## Reminder

A passing build does not guarantee gameplay is passing. Always run at least one manual route or scripted playthrough before deployment.
