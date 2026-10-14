# NEON//ZERO — Initial Audit

## Repository state
- Stack found: static site, single-file HTML/JS/CSS mini-apps, GitHub Pages (`pages.yml`, `path: '.'`).
- Existing game precedent: `flip-flop-rpg.html` uses canvas, localStorage and static hosting.
- No TypeScript/Vite/Phaser installation, no test framework in root, no CSS build pipeline.
- Build script only transpiles `temp_app.jsx` via Babel (unrelated to game RPG).
- `lca_data.db` currently has an uncommitted binary modification; several legacy untracked backup artifacts exist.

## Functional assessment
- Static hosting is reliable for the required deployment model.
- The existing single-file approach matches GitHub Pages without additional build infrastructure.
- State, storage, collision, combat, and rendering code from `flip-flop-rpg.html` can be reused and refactored for an action game.

## Risks
- Adding a full Vite/Phaser toolchain would increase bundle size, complexity, and deployment steps.
- The repository already contains many untracked backups and a modified `lca_data.db`; commits must isolate intended files.
- Real-time combat and mobile controls are the main implementation risks.
- No automated test runner is installed, so critical rules will be tested via extracted Node syntax checks plus manual/browser smoke tests initially.

## Decision
Retain the static single-file stack as the MVP foundation. This satisfies the browser-only and GitHub Pages constraints and avoids introducing an unnecessary backend or build system. Document Phaser/TypeScript as optional future migration, not a WP0 blocker.
