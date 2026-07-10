# Gameplay State

This document describes the current state categories at a high level. It is not a replacement for reading the implementation.

The game tracks:

- Current room or scene.
- Visited rooms.
- Completed interactions.
- Available navigation paths.
- Memory Book entries.
- Ending availability.

Gameplay-facing changes should preserve recoverable navigation. Players should be able to continue through visible Doorways even if a scene hotspot is missed or hard to target.
