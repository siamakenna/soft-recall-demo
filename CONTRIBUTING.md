# Contributing

Thanks for helping improve Soft Recall Demo.

This project is PC-only / desktop-first for now. The current priority is a stable playable vertical slice in a desktop browser.

## Local Setup

```bash
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Preview URL:

```text
http://127.0.0.1:4173/soft-recall-demo/
```

## Required Manual QA Route

Before opening or merging changes that affect playability, test:

Title -> Begin -> Tutorial -> Bedroom -> glasses -> note -> phone choice -> Hallway -> Kitchen -> Hallway -> Bathroom -> Hallway -> Memory Book -> Front Door -> Ending

## Guardrails

Do not change these areas without full playthrough QA:

- room navigation
- hotspot coordinates
- progression gates
- tutorial/help flow
- ending access

Do not add mobile/PWA work, audio, voiceover, music, sound effects, backend, auth, or database behavior unless the project scope explicitly changes.

## Pull Requests

Keep PRs focused. Explain what changed, why it changed, and how it was tested. Documentation-only changes should not modify gameplay files.
