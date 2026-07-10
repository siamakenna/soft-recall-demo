# Copilot Instructions

Soft Recall Demo is a PC-only, desktop-first static Vite React game deployed through GitHub Pages.

## Non-Negotiable Scope

- Do not add backend, auth, database, server runtime, API services, or dashboards.
- Do not add audio, voiceover, music, or sound effects.
- Do not add mobile/PWA/native wrapper work unless a future task explicitly asks for it.
- Do not restore old prototype systems or alternate app frameworks.
- Do not frame gameplay as diagnosis, treatment, screening, or medical advice.

## Gameplay Guardrails

Preserve the first-person point-and-click visual novel structure. Do not change navigation, hotspots, progression gates, tutorial flow, Memory Book behavior, save logic, or ending access without completing the full manual PC route.

Required route:

Title -> Begin -> Tutorial -> Bedroom -> glasses -> note -> phone choice -> Hallway -> Kitchen -> Hallway -> Bathroom -> Hallway -> Memory Book -> Front Door -> Ending

Build success is not enough for gameplay-facing changes. Manual playthrough QA must confirm the route still works.

## Technical Guardrails

- Keep Vite base path set for `/soft-recall-demo/`.
- Keep GitHub Pages deployment compatible.
- Prefer focused changes over broad rewrites.
- Keep repo-root files concise and place detailed documentation under `docs/`.
