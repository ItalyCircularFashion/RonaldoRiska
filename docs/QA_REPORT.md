# FRACTAL CITY — QA Report

Manual validation performed against local and live Pages URL.

Passed:
- Renderer initializes and displays ground/ground grid, lighting, fog, world.
- Deterministic generation with seed neon-1984, same parameters regenerate same stats.
- Parameter editing updates sliders and visible UI.
- Camera orbit drag works; mouse wheel zoom.
- Mode toggle M switches orbit/explore.
- Headless browser did not emulate meaningful FPS, so FPS was not claimed from this run.

Known limits:
- No unit test or Vite build chain; implementation is intentionally single-file.
- High complexity reaches ~1093 draw calls; use medium/low quality on weaker hardware.
- No true first-person pointer locking; exploration uses WASD plus arrow keys and drag to look.
- Ground collision constraints are simplified.
