---
"@zimaleto/zima": minor
"@zimaleto/zima-react": minor
---

Add five shapes and a crystal generator: `dendrite`, the classic fern-like snowflake; `plate`, a hexagonal ice plate; `needle`, a thin ice column; `bokeh`, an out-of-focus flake for depth; `sparkle`, a four-pointed glint; and `crystals(count, seed?)`, which returns up to 32 different stellar crystals that are the same on every page load. Unused shapes are tree-shaken, so `import { createSnow }` doesn't grow. The React package re-exports them all.
