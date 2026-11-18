# @zimaleto/zima

## 0.2.0

### Minor Changes

- [#12](https://github.com/alexeikaratai/zimaleto/pull/12) [`a2fdabb`](https://github.com/alexeikaratai/zimaleto/commit/a2fdabbbf23d8fa2040f411633fb7657aa8f1819) Thanks [@alexeikaratai](https://github.com/alexeikaratai)! - Add more snowflakes: `dendrite`, the classic fern-like snowflake; `crystals(count, seed?)`, which returns up to 32 different stellar crystals that are the same on every page load; and `bokeh`, an out-of-focus flake that adds depth. The crystals are drawn like real ones, with arms that narrow towards the tip and side branches thinner than the arm. Unused shapes are tree-shaken, so `import { createSnow }` doesn't grow. The React package re-exports them all.

- [#14](https://github.com/alexeikaratai/zimaleto/pull/14) [`d973558`](https://github.com/alexeikaratai/zimaleto/commit/d97355887e1d2b5a029dc629b84b28f29604d375) Thanks [@alexeikaratai](https://github.com/alexeikaratai)! - Add snow drifts: the new `ground` option takes `drift({ depth, melt })`, and flakes that reach the bottom of the canvas settle into a layer of snow that builds up in gentle mounds, white in the first color with the flakes on top in their own. `depth` is the deepest it gets, 40 px by default, and `melt` how fast it sinks. Only bundles that import `drift` pay for it. The React package re-exports `drift` and passes `ground` as a prop.

## 0.1.1

### Patch Changes

- [#10](https://github.com/alexeikaratai/zimaleto/pull/10) [`d970371`](https://github.com/alexeikaratai/zimaleto/commit/d970371d33c3ec29462c412dbf6d1ec87d3c54cf) Thanks [@alexeikaratai](https://github.com/alexeikaratai)! - Cap the frame rate at 100 fps by default. Displays up to 100 Hz still draw every frame, while faster ones skip frames, such as 60 fps at 120 Hz, which cuts the snow's CPU use there by about a third. Set `fps: Infinity` to draw every frame.

## 0.1.0

### Minor Changes

- [#7](https://github.com/alexeikaratai/zimaleto/pull/7) [`c227c92`](https://github.com/alexeikaratai/zimaleto/commit/c227c921f1d28219bbdc93284ed49698f53e08d6) Thanks [@alexeikaratai](https://github.com/alexeikaratai)! - First release. `@zimaleto/zima` is a zero-dependency canvas snowfall with built-in shapes, live options, reduced-motion support and a `<script>` build. `@zimaleto/zima-react` adds `<Snowfall>` and `useSnowfall()` for React 19.
