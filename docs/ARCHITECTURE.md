# FRACTAL CITY — Architecture

- Renderer: Three.js via pinned browser global.
- Camera: two modes, orbit and free-flight explore.
- Generation: seed string to numeric seed, seeded PRNG, layout -> districts -> blocks -> buildings -> landmarks.
- Rendering: shared geometry/material palette, simple batching, fog/depth, quality controls.
- Persistence: configurable JSON export/import, seed reproducibility.
- UI: top bar, collapsible panel, stats, contextual landmark info, error/loading states.
- Safety: hard recursion depth, bounded loops, cleanup on regeneration.
