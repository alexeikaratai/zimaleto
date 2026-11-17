---
"@zimaleto/zima": minor
"@zimaleto/zima-react": minor
---

Add more snowflakes: `dendrite`, the classic fern-like snowflake; `crystals(count, seed?)`, which returns up to 32 different stellar crystals that are the same on every page load; and `bokeh`, an out-of-focus flake that adds depth. The crystals are drawn like real ones, with arms that narrow towards the tip and side branches thinner than the arm. Unused shapes are tree-shaken, so `import { createSnow }` doesn't grow. The React package re-exports them all.
