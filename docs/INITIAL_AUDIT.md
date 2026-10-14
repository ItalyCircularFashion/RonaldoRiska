# FRACTAL CITY — Initial Audit

## Repository state
- Existing site is a static GitHub Pages portfolio with single-file HTML projects and many untracked historical backups.
- No Three.js, Vite, or TypeScript tooling is installed.
- Existing static stack is reliable and directly deployable.

## Reusable assets
- GitHub Pages workflow (`path: '.'`) and static hosting setup.
- Camera/rendering and procedural-generation concepts from `flip-flop-rpg.html` and `neon-zero.html`.
- Existing navigation/title pattern for adding a standalone project.

## Decision
Retain the static single-file stack and load Three.js from a pinned CDN script for the MVP. This avoids a build pipeline, keeps deployability, and remains compatible with GitHub Pages. The renderer code is modularized into functions and retains a migration path to Vite/TypeScript later.
