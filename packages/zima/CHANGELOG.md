# @zimaleto/zima

## 0.1.1

### Patch Changes

- [#10](https://github.com/alexeikaratai/zimaleto/pull/10) [`d970371`](https://github.com/alexeikaratai/zimaleto/commit/d970371d33c3ec29462c412dbf6d1ec87d3c54cf) Thanks [@alexeikaratai](https://github.com/alexeikaratai)! - Cap the frame rate at 100 fps by default. Displays up to 100 Hz still draw every frame, while faster ones skip frames, such as 60 fps at 120 Hz, which cuts the snow's CPU use there by about a third. Set `fps: Infinity` to draw every frame.

## 0.1.0

### Minor Changes

- [#7](https://github.com/alexeikaratai/zimaleto/pull/7) [`c227c92`](https://github.com/alexeikaratai/zimaleto/commit/c227c921f1d28219bbdc93284ed49698f53e08d6) Thanks [@alexeikaratai](https://github.com/alexeikaratai)! - First release. `@zimaleto/zima` is a zero-dependency canvas snowfall with built-in shapes, live options, reduced-motion support and a `<script>` build. `@zimaleto/zima-react` adds `<Snowfall>` and `useSnowfall()` for React 19.
