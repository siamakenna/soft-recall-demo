# Known Issues

## Current Risks

- Object interactions may regress if scene logic is rewritten.
- Doorways should remain the reliable navigation fallback.
- GitHub Pages requires the correct Vite base path.
- Build passing does not guarantee gameplay passing.
- Hotspot alignment can break if scene transforms and hotspot layers are separated incorrectly.

## Do Not Change Without QA

- room navigation
- hotspot coordinates
- progression gates
- tutorial/help flow
- ending access

## QA Requirement

Any change to the game flow should be followed by the manual route in [Playthrough QA](Playthrough-QA.md).
