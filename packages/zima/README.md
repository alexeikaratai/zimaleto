# @zimaleto/zima

Tiny canvas snowfall for the web: zero dependencies, safe to import during server rendering, ≤ 2.5 KB brotli.

[Live demo](https://alexeikaratai.github.io/zimaleto/) · [React wrapper](https://github.com/alexeikaratai/zimaleto/tree/main/packages/zima-react) · [Examples](https://github.com/alexeikaratai/zimaleto/tree/main/examples)

## Install

```sh
npm install @zimaleto/zima
```

## Usage

```ts
import { createSnow } from "@zimaleto/zima";

// Over the whole page: a fixed canvas that lets clicks through.
const snow = createSnow({ count: 200, wind: 15 });

// Inside an element: a canvas that fills it and follows its size.
const heroSnow = createSnow(heroElement, { density: 0.5 });

snow.update({ wind: -20 }); // change options live
snow.stop(); // pause and keep the last frame on screen
snow.start(); // resume
snow.destroy(); // remove the canvas, observers and listeners
```

`createSnow()` also takes a `<canvas>` of your own. Give it a CSS size: the engine sizes the bitmap to match, times the pixel ratio. A statically positioned element gets `position: relative` until `destroy()`, so the canvas can fill it.

## Without a bundler

The `<script>` build puts every export on `window.Zimaleto`:

```html
<script src="https://unpkg.com/@zimaleto/zima@0.2"></script>
<script>
    Zimaleto.createSnow({ count: 120 });
</script>
```

Put both scripts at the end of `<body>`, or wait for `DOMContentLoaded`: the page overlay attaches to `<body>`, which a script in `<head>` runs before.

## Options

Every option is optional, and `snow.update()` takes the same ones. A key set to `undefined` goes back to its default. A range is a number or `[min, max]`, and each flake picks its own value from it.

| Option | Default | Meaning |
|---|---|---|
| `count` | `150` | Number of flakes. Ignored when `density` is set. |
| `density` | — | Flakes per 100×100 CSS px, recomputed when the canvas resizes. |
| `size` | `[2, 5]` | Flake radius in CSS px. |
| `speed` | `[30, 80]` | Fall speed in px/s. |
| `wind` | `0` | Horizontal drift in px/s; negative blows left. |
| `gust` | `0` | Amplitude of smooth wind changes, in px/s. |
| `sway` | `[5, 20]` | Amplitude of each flake's wobble, in px. |
| `rotation` | `[-90, 90]` | Spin in degrees per second. |
| `opacity` | `[0.6, 1]` | Flake opacity. |
| `color` | `"#fff"` | One CSS color, or a list to pick from. |
| `shapes` | `[dot]` | Shapes to pick from, optionally weighted. |
| `parallax` | `true` | Bigger flakes fall faster and look closer. |
| `fps` | `100` | Frame-rate cap. The default draws every frame on displays up to 100 Hz and skips frames on faster ones (60 fps at 120 Hz), which roughly halves the work there. `Infinity` draws every frame. |
| `maxDpr` | `2` | Upper limit on the pixel ratio, to spare dense screens. |
| `reducedMotion` | `"static"` | When the OS asks for reduced motion: `"static"` draws one still frame, `"reduce"` keeps half the flakes at half the speed, `"ignore"` animates as usual. |
| `pauseWhenHidden` | `true` | Pause in a background tab or while the canvas is off-screen. |
| `seed` | — | Makes the snow reproducible, for tests and screenshots. |

## Shapes

```ts
import { bokeh, createSnow, crystals, dendrite, dot } from "@zimaleto/zima";

createSnow({
    size: [4, 12],
    shapes: [...crystals(8), { shape: dendrite, weight: 2 }, bokeh, dot],
    color: ["#fff", "#cfe8ff"],
});
```

| Shape | Looks like | Reads from a radius of |
|---|---|---|
| `dot` | a filled circle, the default | any size |
| `star` | a five-pointed star | 3 px |
| `crystal` | six arms with two branches each | 4 px |
| `dendrite` | the classic fern-like snowflake: six arms with rows of side branches that shorten towards the tip | 6 px |
| `plate` | a hexagonal ice plate with ridges from the center to the corners | 5 px |
| `needle` | a thin ice column that twirls as it falls | 4 px |
| `bokeh` | an out-of-focus flake, which adds depth when mixed with sharp ones | any size |
| `sparkle` | a four-pointed glint | 3 px |
| `crystals(count, seed?)` | `count` different stellar crystals, from 1 to 32 | 6 px |
| `text(glyph, font?)` | a character or an emoji | depends on the glyph |
| `image(src)` | a picture in its own colors | depends on the picture |

Smaller flakes still fall, but their detail blurs into a dot, so give detailed shapes a larger `size`.

- A weight makes a shape more or less common; a plain shape weighs 1.
- `crystals()` returns the same array for the same arguments, so it's safe to call inline, and the designs are the same on every page load. `seed` picks other designs; it's independent of the snow's `seed` option. Each crystal is one more sprite per color, which is why the count stops at 32.
- A custom shape is any `(context, radius) => void` that draws around (0, 0) with the context's `fillStyle` or `strokeStyle`. It's drawn once per color and cached, so keep the same function rather than creating one per call.
- `image()` ignores the flake color and shows its flakes once the picture has loaded. `text()` draws a glyph or an emoji; load a web font before the snow starts, or the flakes keep the fallback glyph.
- Unused shapes are tree-shaken.

## Good to know

- The canvas is `aria-hidden` and lets clicks through.
- The snow pauses in background tabs and off-screen, and it respects `prefers-reduced-motion`.
- Importing the package touches nothing in the DOM, so it's safe during server rendering; call `createSnow()` in the browser.

## License

[MIT](LICENSE)
