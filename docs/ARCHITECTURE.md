# NEON//ZERO — Architecture

## Foundation
- Single self-contained HTML file for direct deployment to GitHub Pages.
- Canvas 2D rendering with crisp `image-rendering: pixelated` and nearest-neighbor scaling.
- Vanilla JavaScript state machine, data-driven content definitions, localStorage persistence.

## Core systems
1. `STATE`: authoritative player/world/mission state.
2. `INPUT`: keyboard plus touch controls with semantic action flags.
3. `PHYSICS`: 2D circle/AABB collision and movement integration.
4. `COMBAT`: cooldowns, invulnerability, damage, enemy attack telegraphs.
5. `WORLD`: maps, entities, collision layers, interactions, transitions.
6. `HACKING`: terminal interactions with explicit cost and world consequences.
7. `PROGRESSION`: cyberware upgrades with actual stat effects.
8. `MISSION`: explicit objective state transitions and rewards.
9. `PERSISTENCE`: versioned save serialization, migration and validation.
10. `UI`: HUD and menus reflecting authoritative state.
11. `PRESENTATION`: atmospheric effects, particles, lighting, camera.

## Data-driven content
- Enemy, weapon, upgrade, terminal, mission, and NPC definitions live in constant arrays.
- Entity behavior uses explicit finite state strings, not implicit UI flags.

## Acceptance approach
- `node --check` on extracted script.
- Browser smoke tests through the local static server.
- Manual full mission playthrough.
- Save/load and malformed-save tests.
