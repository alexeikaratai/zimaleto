---
"@zimaleto/zima": minor
"@zimaleto/zima-react": minor
---

Add snow drifts: the new `ground` option takes `drift({ depth, melt })`, and flakes that reach the bottom of the canvas settle into a layer of snow that builds up in gentle mounds, white in the first color with the flakes on top in their own. `depth` is the deepest it gets, 40 px by default, and `melt` how fast it sinks. Only bundles that import `drift` pay for it. The React package re-exports `drift` and passes `ground` as a prop.
