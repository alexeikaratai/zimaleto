# zimaleto — Project Plan

> Tiny, zero-dependency canvas snowfall. Framework-agnostic TypeScript core + thin framework wrappers (React first; Vue and Angular later).

Status: **0.1.0 released** on 2026-11-11 · Next: **M6 · Performance baseline** (§11) · Last updated: 2026-11-11 · Repo: [alexeikaratai/zimaleto](https://github.com/alexeikaratai/zimaleto) · npm: `@zimaleto/*`

Working rules and code style: [CLAUDE.md](CLAUDE.md).

---

## 1. Goals

- **Tiny core.** `@zimaleto/zima`: zero dependencies, SSR-safe, tree-shakeable, **≤ 2.5 KB min+brotli**.
- **Thin wrappers.** Each framework gets its own small package on top of the core. `@zimaleto/zima-react` adds **≤ 650 B**; `@zimaleto/zima-vue` and `@zimaleto/zima-angular` follow the same pattern later.
- **Works without a framework.** `createSnow()` with no element puts snow over the whole page, and the same call works from a `<script>` tag through the CDN build.
- **Configurable flakes.** Count/density, size, fall speed, wind and gusts, sway, rotation, opacity, one color or a list, shape variants (built-in and custom), parallax.
- **Well-behaved.** Respects `prefers-reduced-motion`, pauses when the tab or canvas is hidden, handles HiDPI, uses `pointer-events: none`, never shifts the page layout.

### Backlog

Snow piling up on page elements (M8 covers the bottom of the canvas), mouse/scroll interaction, a WebGL renderer, rendering in a worker via OffscreenCanvas, a `<zimaleto-snow>` web component, and effects beyond snow (§12).

---

## 2. Tech stack

Versions are the latest on the public npm registry as of 2026-11-08 and are never copied from other projects. All peer ranges are compatible. A package added later is installed at its latest version.

| Area | Tool | Version | Notes |
|---|---|---|---|
| Runtime (dev) | Node via nvm | **26.13.0 LTS** | `.nvmrc` = `26` |
| Package manager | pnpm workspaces | 12.18.x | `packageManager` field pins it; `catalog:` keeps shared versions in one place |
| Monorepo orchestration | Turborepo | 2.11.x | task graph + local cache |
| Language | TypeScript | 7.0.x | native compiler; used for type-checking only. 7.0 ships no JS API; nothing in this stack needs one, but Vue and Angular tooling will (§9) |
| Library build | tsdown (Rolldown) | 0.23.x | successor of tsup; supports TS 7; declarations generated via `isolatedDeclarations` (oxc) |
| UI | React / React DOM | 19.3.x | wrapper peer: `^19` |
| Types | @types/react / @types/react-dom / @types/node | 19.3.x / 19.3.x / 26.6.x | React ships without types; Node types are for the `dist` tests, which read the built files |
| Playground | Vite + @vitejs/plugin-react | 8.3.x / 6.2.x | also deployed as the demo on GitHub Pages |
| Example app | Next.js | 16.4.x | the App Router example; `next build` type-checks with TypeScript 7 |
| Tests | **Vitest** + @vitest/ui | 5.1.x | single test runner for every package; the UI backs `pnpm test:ui`; see §8 |
| Tests: coverage | @vitest/coverage-v8 | 5.1.x | thresholds enforced in CI |
| Tests: real browser | @vitest/browser-playwright + Playwright (Chromium) | 5.1.x / 1.65.x | real canvas, observers, rAF |
| Tests: DOM / React | happy-dom + @testing-library/react + @testing-library/dom | 21.0.x / 16.3.x / 10.4.x | React wrapper tests; the DOM package is a required peer of Testing Library React |
| Lint + format | Biome | 2.6.x | the only linter and formatter (no Prettier, no ESLint); run from the root |
| Git hooks | husky | 9.1.x | pre-commit runs Biome on staged files |
| Size budget | size-limit + preset-small-lib | 14.3.x | fails CI if a budget is exceeded |
| Package checks | publint + @arethetypeswrong/core | 0.3.x / 0.18.x | run by tsdown; they fail CI through `failOnWarn` (§4) |
| Releases | Changesets + @changesets/changelog-github | 3.0.x / 1.0.x | `changesets/action` v2; npm trusted publishing with staged releases (OIDC, provenance) |

---

## 3. Repository layout

```
zimaleto/
├─ .nvmrc                      # 26
├─ .npmrc                      # registry=https://registry.npmjs.org/ (pinned per project)
├─ .gitattributes              # LF line endings everywhere
├─ .husky/pre-commit           # Biome on staged files
├─ .vscode/extensions.json     # recommends the Biome extension (settings.json stays local)
├─ CLAUDE.md                   # working rules and code style
├─ LICENSE                     # MIT
├─ README.md
├─ package.json                # private root; packageManager, engines.node >=26 (root only)
├─ SECURITY.md                 # how to report a vulnerability, and how releases are protected
├─ scripts/release-plan.sh     # decides whether the release jobs open a Version PR, stage a version, or do nothing
├─ pnpm-workspace.yaml         # packages/*, apps/*, examples/*, catalog
├─ turbo.json
├─ biome.json
├─ tsconfig.base.json
├─ vitest.config.ts            # root: test.projects → one watch UI + merged coverage locally
├─ .changeset/
├─ .github/
│  ├─ actions/setup/           # pnpm, Node from .nvmrc, pnpm install
│  ├─ workflows/ci.yml         # lint → typecheck → build → test; on main: deploy → release (M5)
│  └─ dependabot.yml           # keeps the pinned action SHAs current
├─ packages/
│  ├─ zima/                    # @zimaleto/zima (core)
│  │  ├─ src/
│  │  │  ├─ index.ts           # public API: createSnow() and the re-exports
│  │  │  ├─ engine/
│  │  │  │  ├─ engine.ts       # createEngine(): state, frame loop, sizing, options, lifecycle
│  │  │  │  ├─ canvas.ts       # adds or adopts the canvas, styles it, positions the container
│  │  │  │  ├─ sprites.ts      # pre-rendered flake sprites and shape readiness
│  │  │  │  ├─ clock.ts        # the Clock type and the browser clock
│  │  │  │  └─ __tests__/      # browser tests by topic: canvas, drawing, resize, lifecycle, timing, …
│  │  │  ├─ options/
│  │  │  │  ├─ snowOptions.ts  # the public option types, with JSDoc
│  │  │  │  ├─ settings.ts     # defaults, normalization, reduced motion, flake count
│  │  │  │  └─ __tests__/
│  │  │  ├─ physics/           # pure: no DOM, unit-testable
│  │  │  │  ├─ flake.ts        # spawning flakes and rolling their look
│  │  │  │  ├─ motion.ts       # step(), step limits, gusts, sway
│  │  │  │  ├─ random.ts       # mulberry32 seeded RNG
│  │  │  │  └─ __tests__/
│  │  │  ├─ shapes/            # dot, star, crystal, text, image (separate exports)
│  │  │  │  └─ __tests__/
│  │  │  └─ __tests__/
│  │  │     ├─ index.test.ts           # the entry imports in Node without touching the DOM
│  │  │     ├─ index.browser.test.ts   # createSnow() with real frames
│  │  │     ├─ iife.dist.test.ts       # runs the <script> build in an empty node:vm context
│  │  │     ├─ api.test-d.ts           # type tests for the public API
│  │  │     └─ support/                # manual clock, media stubs, DOM and canvas helpers
│  │  ├─ README.md, LICENSE    # npm packs only what's inside the package folder
│  │  ├─ vitest.config.ts      # projects: unit (Node), browser (Chromium), dist (Node)
│  │  └─ tsdown.config.ts      # two builds: ESM for npm, and the minified IIFE for <script> tags
│  └─ zima-react/             # @zimaleto/zima-react
│     ├─ src/
│     │  ├─ index.ts
│     │  ├─ Snowfall.tsx
│     │  ├─ useSnowfall.ts
│     │  ├─ isEqual.ts         # compares option values by content
│     │  └─ __tests__/
│     │     ├─ Snowfall.test.tsx
│     │     ├─ Snowfall.ssr.test.tsx   # server rendering with the real core
│     │     ├─ useSnowfall.test.tsx
│     │     ├─ isEqual.test.ts
│     │     ├─ index.test.ts           # re-exports of the core shapes
│     │     ├─ directive.dist.test.ts  # the built entry starts with "use client"
│     │     ├─ props.test-d.ts
│     │     └─ snowMock.ts             # the mocked core shared by the tests
│     ├─ README.md, LICENSE
│     ├─ vitest.config.ts      # projects: unit (happy-dom), dist (Node)
│     └─ tsdown.config.ts
├─ apps/
│  └─ playground/              # Vite + React app with live option controls; the demo
│     └─ src/                  # controls/ (one file per panel section), fields/, stage/, options/
└─ examples/
   ├─ vanilla/                 # Vite without a framework: createSnow() on a hero element
   └─ nextjs/                  # Next.js App Router: <Snowfall> from a client component
```

Later: `packages/zima-vue`, `packages/zima-angular`, `apps/docs`.

---

## 4. Tooling details

- **Node version lives in the root only.** The root `package.json` sets `engines.node: ">=26"` for contributors. Published packages run in browsers, so they don't declare a Node engine.
- **Develop against source, publish `dist`.** In the repo, each package's `exports` points to `./src/index.ts`, so the playground and tests use live source with HMR and nothing needs a watch build. `publishConfig.exports` (which pnpm swaps in at pack time) points to `dist/`. tsdown generates this pair with `exports: { devExports: true }`.
- **Public registry only.** The repo's `.npmrc` pins `registry=https://registry.npmjs.org/`, whatever the machine's global npm config says.
- **`pnpm-workspace.yaml` catalog** pins every dependency that more than one package uses: React and its types, TypeScript, Vite, Vitest with its `@vitest/*` packages, Playwright, tsdown, publint, attw, size-limit and `@types/node`. Packages refer to them as `"catalog:"`. Internal dependencies use `"workspace:^"`. A named catalog can hold a second version for some packages, such as TypeScript 6 for Vue and Angular later (§9).
- **`turbo.json`** lists `tsconfig.base.json` in `globalDependencies`: every package config extends it, and Turborepo otherwise hashes only files inside a package. Tasks:
  - `build`: `dependsOn: ["^build"]`, `outputs: ["dist/**", ".next/**", "!.next/cache/**"]`
  - `typecheck`: `dependsOn: ["transit"]`, no outputs. The packages read each other's source through `exports`, so a change in the core has to invalidate the wrapper's and the playground's typecheck. An empty `transit` task with `dependsOn: ["^transit"]` adds the dependencies' files to the hash without making their typecheck run first.
  - `test`: `dependsOn: ["build"]`, `outputs: ["coverage/**"]`. Runs every Vitest project of the package (unit, browser, dist) in one run with coverage thresholds. It builds first because the `dist` tests read the built files. Core's browser project needs Chromium.
  - `test:unit`: `dependsOn: ["transit"]`, no outputs, no build. Runs only the `unit` project (Node or happy-dom, with the SSR and type tests) without thresholds: the fast local loop.
  - `size`: `dependsOn: ["build"]`
  - `dev`: `cache: false`, `persistent: true`
- **Lint isn't a Turborepo task.** `pnpm lint` runs Biome once over the whole repo, which is faster than splitting it per package and needs no cache.
- **tsdown config:** `platform: "browser"`, `publint: true`, `attw: true` (its default `esm-only` profile fits ESM-only packages). Both checks only warn by default, so `failOnWarn: true` turns any build warning into a failure, locally as in CI. The dev loop never runs tsdown, so this costs nothing while working. tsdown packs the package with the detected package manager (`pnpm pack`), so the checks see `publishConfig.exports`. The React build suppresses Rolldown's warning that bundling may drop `"use client"`: a single entry chunk keeps it, and a `dist` test checks that.
- **`biome.json`** (the rules are in CLAUDE.md): formatter with 4-space indent, line width 120, double quotes, semicolons, JSX `attributePosition: "multiline"`; import organizing on; `preset: "recommended"` plus the `react` domain; rules that enforce CLAUDE.md (`type` over `interface`, no `enum`, `import type`/`export type`, no `any`); `style/noDefaultExport` on, with an override for config files and the Next.js example's `page.tsx` and `layout.tsx`, which need a default export. It reads `.gitignore` and skips `.claude/`. Markdown formatting is off, because it pads every table row to the widest cell. `pnpm lint` passes `--error-on-warnings`, because some recommended rules, such as unused imports and focused tests, only warn.
- **Pre-commit hook.** husky runs `biome check --write --staged --error-on-warnings --no-errors-on-unmatched` and re-stages the fixed files. It re-stages whole files, so it refuses to run while a staged file also has unstaged changes. CI runs the same check on every file.
- **`tsconfig.base.json`:** `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (so the public types say where `undefined` is allowed), `isolatedDeclarations`, `verbatimModuleSyntax`, `jsx: react-jsx`, `noEmit` (tsdown does the emitting), `lib: [ES2022, DOM, DOM.Iterable]`.
- **Editor.** `.vscode/extensions.json` is committed and recommends the Biome extension. `.vscode/settings.json` holds personal settings, so it's gitignored; M0 adds Biome as the default formatter and `importModuleSpecifierEnding: "minimal"` to the local copy.
- **`.gitignore`** also covers other personal tool settings, such as `.claude/settings.local.json`. **`.gitattributes`** checks text files out with LF endings, which Biome expects, on Windows too.
- **Browser target:** ES2022 output, which covers evergreen browsers from roughly 2022 on. No polyfills.

### Root scripts

First setup: `nvm install` (reads `.nvmrc`); `npm install -g pnpm` if that Node has no pnpm yet, because Node 26 no longer bundles Corepack (pnpm then switches itself to the `packageManager` version); `pnpm install`; `pnpm exec playwright install chromium`.

| Command | Does |
|---|---|
| `pnpm dev` | `turbo run dev`: the playground's dev server |
| `pnpm build` | `turbo run build` |
| `pnpm typecheck` | `turbo run typecheck` |
| `pnpm lint` | `biome check --error-on-warnings .` |
| `pnpm lint:fix` | `biome check --write .` |
| `pnpm test` | `turbo run test --filter=./packages/*`: every library's full suite with coverage thresholds; builds first and needs Chromium |
| `pnpm test:unit` | `turbo run test:unit`: the `unit` projects only, with no browser and no build |
| `pnpm test:watch` | root `vitest` in watch mode across all projects except `dist` |
| `pnpm test:ui` | the same with `--ui` |
| `pnpm coverage` | root `vitest run --coverage` without the `dist` projects: one merged report, no thresholds |
| `pnpm size` | `turbo run size --filter=./packages/*` |
| `pnpm verify` | `pnpm lint && turbo run typecheck test build size`: the checks CI runs, in one command |
| `pnpm changeset` | records a changeset |

---

## 5. Core API (`@zimaleto/zima`)

```ts
import { createSnow, crystal, dot } from "@zimaleto/zima";

// Full-page overlay: a fixed canvas over the viewport
const snow = createSnow({ count: 200, wind: 15 });

// Inside an element (adds a canvas to it) or on your own <canvas>
const heroSnow = createSnow(heroElement, {
    density: 0.5,
    color: ["#fff", "#cfe8ff"],
    shapes: [dot, { shape: crystal, weight: 0.3 }],
});

snow.stop(); // pause; the animation starts on creation
snow.start(); // resume
snow.update({ wind: -20 }); // live change, no re-creation
snow.destroy(); // stops the loop, disconnects observers, removes the canvas it created
```

### Targets and lifecycle

```ts
function createSnow(options?: SnowOptions): Snow;
function createSnow(target: HTMLElement, options?: SnowOptions): Snow;

type Snow = {
    readonly canvas: HTMLCanvasElement;
    start(): void;
    stop(): void;
    update(options: SnowOptions): void;
    destroy(): void;
};
```

- **No target:** creates a canvas with `position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999`, appended to `<body>`. Its styles can be changed through `snow.canvas`. A canvas is a replaced element, so `inset: 0` alone wouldn't stretch it.
- **A `<canvas>`:** draws on it and leaves its styles alone. It needs a CSS size: a canvas without one takes its size from the bitmap and would grow with the pixel ratio, so the engine pins its current width as an inline style. `destroy()` clears it and leaves its context at full opacity with no transform.
- **Any other element:** adds a canvas inside it with `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none`. If the element is `position: static`, it gets `position: relative`, and `destroy()` restores the original value.
- **Accessibility.** Canvases the engine creates get `aria-hidden="true"`, the same as `<Snowfall>`.
- **Start and stop.** The animation starts on creation. `stop()` pauses it and keeps the last frame on screen, even before the first animated frame; `start()` resumes it. After an explicit `stop()`, the automatic visibility pause never resumes the snow on its own. Reduced motion wins over `start()` (see `reducedMotion`).
- **After `destroy()`**, every method is a no-op.

### Options

`Range = number | [min, max]`. Each flake picks a random value inside the range. `update()` merges the options it gets into the current ones. A key set to `undefined` goes back to its default, so a wrapper can drop a removed prop. The option types say so (`?: T | undefined`) and accept readonly arrays, so they work under `exactOptionalPropertyTypes` and with `as const` configs. Flakes get new sizes, speeds, opacities, colors, sway and spin only when one of those options (or `seed`, or the reduced-motion state) changes, so moving the wind slider doesn't reshuffle the snow.

| Option | Type | Default | Meaning |
|---|---|---|---|
| `count` | `number` | `150` | Number of flakes. Ignored when `density` is set. |
| `density` | `number` | — | Flakes per 100×100 px. Recomputed on resize. |
| `size` | `Range` | `[2, 5]` | Flake radius in CSS px. |
| `speed` | `Range` | `[30, 80]` | Fall speed in px/s. |
| `wind` | `number` | `0` | Constant horizontal drift in px/s. Negative means left. |
| `gust` | `number` | `0` | Amplitude of smooth wind variation over time, in px/s. |
| `sway` | `Range` | `[5, 20]` | Amplitude of each flake's horizontal wobble, in px. |
| `rotation` | `Range` | `[-90, 90]` | Spin in deg/s. `0` turns rotation off. |
| `opacity` | `Range` | `[0.6, 1]` | |
| `color` | `string \| string[]` | `"#fff"` | One color, or a list from which each flake picks one at random. |
| `shapes` | `Shape \| Array<Shape \| WeightedShape>` | `[dot]` | Shape variants, optionally weighted. |
| `parallax` | `boolean` | `true` | Bigger flakes fall faster and are more opaque, which gives a sense of depth. |
| `fps` | `number` | — | Frame-rate cap. Unset means the display refresh rate. The cap allows 10% slack, so 30 fps on a 60 Hz display draws every other frame. |
| `maxDpr` | `number` | `2` | Upper limit on devicePixelRatio, to protect performance. |
| `reducedMotion` | `"static" \| "reduce" \| "ignore"` | `"static"` | With `static`, the engine draws one frame and stops; it redraws that frame after a resize or `update()`, and `start()` doesn't animate it. With `reduce`, it keeps half the flakes at half the speed, with no rotation or gusts. Changes to the OS setting apply live. An unknown value falls back to `static`. |
| `pauseWhenHidden` | `boolean` | `true` | Pauses on tab hidden (`visibilitychange`) and when the canvas is off-screen (`IntersectionObserver`). |
| `seed` | `number` | — | Seeds the RNG so runs are reproducible (tests, screenshots). |

Public option names follow web-platform style (`parallax`, not `hasParallax`). The `is`/`has` prefix rule in CLAUDE.md is for internal code.

### Shapes

```ts
// Draws centered at (0, 0). `ready`, if present, holds back the shape's flakes until it resolves.
type Shape = ((context: CanvasRenderingContext2D, radius: number) => void) & { readonly ready?: Promise<unknown> };
type WeightedShape = { shape: Shape; weight: number };
```

- Built-ins are named exports, so unused ones are tree-shaken: `dot`, `star` (five points), `crystal` (six arms with branches).
- Helpers: `text("❄")` for emoji or glyph flakes, and `image(src)` for a bitmap flake. The same arguments always return the same shape, so calling them inline doesn't rebuild sprites.
- A custom shape is any function with the `Shape` signature.
- **Weights.** A plain shape weighs 1. Entries whose weight isn't a finite positive number are dropped; with none left, the dot is used.
- **Identity.** Shapes compare by identity, so a custom shape created anew on every call re-rolls the flakes each time. `text()` and `image()` return the same shape for the same arguments.
- **Color.** The engine sets `fillStyle` and `strokeStyle` to the flake's color before calling a shape, and shapes draw with them. `image()` ignores color, and color emoji keep their own colors.
- **Images load asynchronously.** `image()` starts loading when a snowfall first needs the picture, so calling it during server rendering is safe. Its `ready` promise holds back that shape's flakes until the picture has loaded; the engine learns about it one microtask later and redraws. A picture that fails to load rejects `ready`: the engine handles the rejection and never draws those flakes, so `drawImage()` never sees a broken image. A promise that settles either way also lets go of every engine that waited on it.
- **Web fonts.** A sprite drawn while a web font is still loading keeps the fallback glyph, so `text()` with a web font needs the font loaded first, for example with `document.fonts.load()`.

### Engine internals

- **One `requestAnimationFrame` loop** with physics based on `dt`, so speed doesn't depend on frame rate. A step covers at most 50 ms, or two frames under an `fps` cap below 40, so a stalled tab doesn't make flakes jump while a low cap keeps full speed.
- **Pure physics.** `step(flakes, dt, env)` mutates plain state and has no DOM access, so it can be unit-tested without a canvas.
- **Injectable clock (internal).** The engine factory in `engine.ts` takes its frame scheduler (`requestFrame`, `cancelFrame`; frame callbacks get the timestamp) as an extra parameter that `index.ts` doesn't expose. Tests import the factory directly and advance frames by hand, so they're deterministic and don't need fake rAF timers.
- **Flake pool.** A fixed array of plain objects. Flakes that leave the screen are respawned at the top instead of allocating new ones, so there's no GC churn. Flakes wrap horizontally when wind pushes them sideways. The pool is resized only when `count` or `density` changes, or when the canvas resizes while `density` is set. When the canvas resizes, flakes keep their place relative to it, and flakes that spawned on an empty canvas (one created while hidden) are spread over the new area.
- **Seed.** With a `seed`, the generator restarts only when the flakes are re-rolled, so the same options give the same snow, and flakes that a later `update()` adds continue the sequence instead of repeating it.
- **First frame.** Flakes start spread over the whole canvas, so the snow looks like it has been falling for a while instead of starting at the top edge.
- **Refresh.** Creation, a resize, a pixel-ratio change, `update()` and a shape getting ready all refresh the canvas, the flakes and the loop, and then draw. Resizing the bitmap clears it before the next frame would come, so drawing right away keeps the snow on screen during a resize and shows it even when it was stopped before the first frame.
- **Sprites.** Each `(shape × color)` pair is rendered once to a detached `<canvas>` element at the largest `size` × DPR, with a quarter of the radius as margin so strokes and glyphs that overshoot aren't clipped. The sprite is rounded up to whole pixels, and the shape is drawn at the radius that fills it, so flakes keep their exact size. Sprites are rebuilt whenever the flakes are re-rolled (a change to size, speed, opacity, color, sway, rotation, parallax, seed or shapes), which costs little, and when the DPR changes. Each frame then calls `drawImage` with `setTransform` (translate, rotate, scale), which is much cheaper than drawing paths for every flake.
- **Wind gusts** are a cheap smooth noise: a sum of two sines with incommensurate frequencies.
- **Resize.** A `ResizeObserver` refreshes on every report, which sets the canvas backing store to CSS size × `min(devicePixelRatio, maxDpr)`. DPR changes (another screen, browser zoom) trigger the same update.
- **SSR safety.** Nothing touches `window` or `document` when the module is imported; all DOM access happens inside `createSnow()`.

---

## 6. React wrapper (`@zimaleto/zima-react`)

```tsx
import { crystal, Snowfall, useSnowfall } from "@zimaleto/zima-react";

<Snowfall fullscreen count={200} wind={15} shapes={[crystal]} paused={isPaused} />;

// or bring your own canvas, which needs a CSS size
const canvasRef = useRef<HTMLCanvasElement>(null);
useSnowfall(canvasRef, { density: 0.5 });

return <canvas ref={canvasRef} style={{ width: "100%", height: 300 }} />;
```

- **React 19 only** (`peerDependencies.react: "^19"`), using `ref` as a prop with no `forwardRef`.
- **`"use client"`** sits at the top of `src/index.ts` and stays at the top of the build output, so it works in the Next.js App Router out of the box, from source in the workspace and from `dist` when published.
- **Lifecycle.** The instance is created in `useEffect` and destroyed in cleanup, which is safe under StrictMode's double mount. Prop changes go to `instance.update()`; the instance is never re-created on re-render. Options are compared by value first (arrays element by element, `{ shape, weight }` entries by their fields), so a new but equal `shapes={[crystal]}` or `color={["#fff", "#cfe8ff"]}` on every render doesn't rebuild sprites. Only the changed keys go to `update()`, so a new but equal `shapes` array next to a changed `wind` leaves the flakes as they are. A removed prop is passed as `undefined`, which restores its default.
- **`paused`.** `true` calls `stop()`, which keeps the last frame on screen, and `false` calls `start()`. It's applied after every render, so a snowfall created for a new target picks it up too; `start()` and `stop()` cost nothing when the state doesn't change. `useSnowfall` accepts `paused` in its options too. Reduced motion still wins (§5).
- **`ref`** points to the `<canvas>`. `useSnowfall` returns nothing in v1: its options and `paused` cover control. Its ref has to hold the element when the component mounts and keep holding the same element; to move the snow, the component that calls it remounts.
- **Props** are all core options, plus `fullscreen?: boolean` and `paused?: boolean`, plus canvas attributes (`className`, `style`, `aria-hidden` defaults to `true`). A canvas attribute that shares a name with a core option is left out: React's non-standard `color` attribute would narrow `color` to a string. `width`, `height` and `children` aren't accepted, because the engine manages the canvas size. `<Snowfall>` tells options from canvas attributes by a list of option names; a type check fails the build if the core gains an option that the list doesn't name.
  - Default layout fills the parent: `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none`. The parent needs a `position` other than `static`.
  - `fullscreen` gives an overlay: `position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999`, the same styles as the core overlay. `style` overrides any of these. Unlike the core overlay, it renders in place, so an ancestor with a `transform` or `filter` makes it cover that ancestor instead of the viewport; it belongs near the app root.
- **Server Components.** The entry is `"use client"`, so `text()` and `image()` have to be called in a client component, while the built-in shapes pass as props. The README and the Next.js example show this.
- **Testing apps.** jsdom has no `matchMedia`, `ResizeObserver`, `IntersectionObserver` or 2D context, so apps that render `<Snowfall>` in jsdom tests mock the package. The README says so.
- **`@zimaleto/zima` is a regular dependency** (`workspace:^`), not bundled in, so it's never duplicated. Core's shapes and types are re-exported, so users need only one package.

---

## 7. Package shape and release

- **ESM-only** (`"type": "module"`), `sideEffects: false`, `files: ["dist"]`, types in `exports`. `@zimaleto/zima-react` declares `@types/react` `^19` as an optional peer, because its `.d.ts` imports React's types.
- **Package metadata.** Each package has its own `README.md` and a copy of `LICENSE`, because npm packs only what's inside the package folder. `repository` (with `directory`), `homepage` and `bugs` point to the GitHub repo; npm rejects provenance when `repository.url` doesn't match the repo that publishes.
- **Core also ships `dist/zimaleto.iife.js`** for `<script>` and CDN use (unpkg, jsDelivr), exposing `window.Zimaleto`. The `unpkg` and `jsdelivr` fields in `package.json` point to it. tsdown builds it from the same entry as a second config, minified and without `Symbol.toStringTag`, and size-limit measures the file as it is (`rolldown: false`).
- **Size budgets** (size-limit, enforced in CI). A budget is never raised without the owner's approval.
  - `@zimaleto/zima`, `import { createSnow }` (includes the default `dot`): ≤ 2.5 KB brotli (raised from 2 KB in M2, see §10). It measures 2.48 KB after the fixes from the post-M3 review.
  - `@zimaleto/zima`, `<script>` build with every shape: ≤ 3 KB brotli. It measures 2.9 KB. M7 and M8 raise it with their new exports (§10).
  - `@zimaleto/zima-react`, `import { Snowfall }` excluding core and React: ≤ 650 B brotli (raised from 500 B in M3, see §10)
- **Versioning.** Changesets in **fixed** mode for the `@zimaleto/zima*` packages while on 0.x (the private playground stays out). One version for all packages is simpler for users.
- **Publishing.** Four jobs at the end of the CI workflow on `main` release the packages. They're split so that no job holds both a token that writes to GitHub and the OIDC token that stages on npm, and only the stage job builds anything:
  1. **Release plan** runs `scripts/release-plan.sh`. With changesets pending, the mode is `version`. Without changesets, a version that has no git tag yet means `stage`. Otherwise the mode is `none`, as it is for the unreleased `0.0.0`. The tag marks a staged version, because npm doesn't list it until it's approved, so the registry can't tell.
  2. **Version PR** (`version`) opens or updates the "Version Packages" PR with `changesets/action/version`, using the release app's token. `@changesets/changelog-github` writes the changelog with PR links.
  3. **Stage on npm** (`stage`) builds the packages and runs `pnpm stage publish --recursive`. pnpm packs each package, which swaps in `publishConfig.exports` and rewrites `workspace:^` (plain `npm publish` would do neither). It authenticates through npm trusted publishing (GitHub OIDC, `id-token: write`), which adds provenance and needs no `NPM_TOKEN`. Staged publishing can't be batched, so the packages go one by one.
  4. **Tag release** runs `changeset tag` through `changesets/action/publish`, which pushes the tags and creates the GitHub releases with the release app's token.
- **Staged releases.** The trusted publisher of each package allows `npm stage publish` only. A staged version goes live when a maintainer approves it with 2FA on npmjs.com (Staged Packages) or with `npm stage approve`, so a compromised CI or GitHub account can't release on its own. The tag and the GitHub release appear at staging time, before the approval.
- **Release setup.**
  - Two GitHub Environments accept `main` only:
    - `npm` is used by the stage job. npm's trusted-publisher entries name it, so a branch that edits `ci.yml` can't stage.
    - `release` holds the release app's credentials, for the Version PR and Tag release jobs.
  - A PR opened with the default `GITHUB_TOKEN` doesn't trigger workflows, so the required checks would never run on the Version Packages PR. A GitHub App with contents and pull-requests write access opens it instead.
    - Its client ID is the `RELEASE_APP_CLIENT_ID` variable of the `release` environment, and its private key is the `RELEASE_APP_PRIVATE_KEY` secret.
    - Each job asks for only the permissions it needs. The actions push commits and tags through the GitHub API as the app, and GitHub signs them.
  - `npm trust` works only for packages that exist, so the first release starts with placeholders: a maintainer runs `pnpm build` and `pnpm stage publish --recursive` once from a local checkout. npm creates the packages with a public `0.0.0-stage` placeholder and keeps the staged build private; the maintainer rejects it.
  - Then, for each package: `npm trust github <package> --file ci.yml --repo alexeikaratai/zimaleto --env npm --allow-stage-publish` (npm 11.15 or later, with 2FA). A trust configuration expires unless it stages within 2 days, so the Version Packages PR is merged right after.
  - A manual publish, if ever needed, uses `pnpm build && pnpm -r publish`, never `npm publish`.
- **Demo.** The `deploy` job builds the playground on every push to `main`, after the tests pass, and deploys it to GitHub Pages at `https://alexeikaratai.github.io/zimaleto/` (Vite `base: "/zimaleto/"`, Pages source: GitHub Actions). The `github-pages` environment accepts deployments from `main` only. The READMEs link to it.

---

### Security

- **Repository.** Rulesets:
  - On `main`: changes only through PRs with green checks on an up-to-date branch, no force push or deletion, and CodeQL results without high or critical security alerts. A rule requiring signed commits was left out: it blocks PRs whose commits aren't signed, while every commit that reaches `main` is a squash merge that GitHub signs anyway.
  - On every tag: no updates or deletions.

  Other repository settings:
  - CodeQL default setup scans the TypeScript and the workflows with the extended query suite.
  - Secret scanning with push protection, Dependabot alerts and security updates, and private vulnerability reporting are on; `SECURITY.md` points reporters to the latter.
- **Actions.**
  - Only GitHub's own actions, `pnpm/action-setup` and `changesets/*` may run, each pinned to a full commit SHA, which GitHub enforces.
  - The default `GITHUB_TOKEN` is read-only and can't approve pull requests.
  - Workflow runs from forks need approval for every outside contributor.
  - Jobs that can publish or write skip the dependency cache.
- **Supply chain.** In `pnpm-workspace.yaml`:
  - Versions younger than a day aren't installed (`minimumReleaseAge`).
  - Transitive dependencies can't come from git or URLs (`blockExoticSubdeps`).
  - Install scripts run only for packages in `allowBuilds`, which is empty (`strictDepBuilds`).
  - Installing fails when a package loses the trusted publisher or provenance that its earlier versions had (`trustPolicy: no-downgrade`).
  - Dependabot updates the action pins monthly.
- **Library.** No `eval`, `new Function` or HTML sinks, so it runs under a strict CSP. `<Snowfall>` doesn't accept `children` or `dangerouslySetInnerHTML`.
- **Residual risk.** The release app can write to the repo. If a dependency of the Version PR or Tag release jobs were compromised, it could open and merge a PR that passes the checks, because a lone owner can't be required to approve their own PRs. npm releases would still need the owner's 2FA approval.

---

## 8. Testing (Vitest)

Vitest is the only test runner. Each package has its own `vitest.config.ts`. Test style (`describe` + `test`, Arrange → Act → Assert, one behavior per test) is in CLAUDE.md.

- **CI:** `turbo run test` runs each library's full suite (every project, coverage and thresholds). Locally, Turborepo caches the result per package.
- **Locally:** `pnpm test:unit` is the fast loop without a browser. The root `vitest.config.ts` lists all packages under `test.projects`, which gives one watch session (and `--ui`) across the repo, plus a merged coverage report. The commands are in §4 (Root scripts).
- **Project names** are short: `unit`, `browser`, `dist`. The root config namespaces them by package (`@zimaleto/zima (unit)`), which keeps them unique, so root filters look like `--project '!*(dist)'`.

### File conventions

Tests live in a `__tests__/` folder in the module they test, one file per topic, each under about 300 lines. Shared helpers live in `src/__tests__/support/`.

| Pattern | Runs in | Used for |
|---|---|---|
| `__tests__/*.test.ts(x)` | Node (core) or happy-dom (react) | unit tests, the bulk of the suite |
| `__tests__/*.browser.test.ts` | real Chromium via `@vitest/browser-playwright` | anything that needs a real canvas, observers or rAF |
| `__tests__/*.ssr.test.tsx` | Node (`// @vitest-environment node`) | server rendering |
| `__tests__/*.test-d.ts` | Vitest typecheck (`expectTypeOf`) | types of the public API |
| `__tests__/*.dist.test.ts` | Node, after `build` (the `dist` project) | checks of the built files |

### `@zimaleto/zima`: unit tests (Node)

- **`step()` physics**
  - Flakes fall by `speed × dt`.
  - `wind` and `gust` shift x.
  - Sway stays within its amplitude.
  - Rotation advances by `spin × dt`.
  - One 32 ms step ≈ two 16 ms steps (frame-rate independence).
  - A frame steps at most 50 ms, or two frames under a low `fps` cap.
- **Recycling**
  - A flake that leaves the bottom respawns at the top.
  - Flakes wrap horizontally under strong wind in both directions.
  - Pool size stays constant.
- **First frame:** initial positions cover the whole canvas height, not just the top edge.
- **Options**
  - Defaults are applied.
  - Both `number` and `[min, max]` ranges work.
  - Bad input (negative count, min > max) is normalized.
  - `density` converts to a count based on area.
  - `parallax` maps size to speed and opacity monotonically.
  - `color` accepts a string or a list; with a fixed seed, every flake's color comes from the list.
  - `reducedMotion: "reduce"` halves count and speed and turns off rotation and gusts; an unknown mode falls back to `"static"`.
  - Shape weights that aren't finite and positive are dropped.
  - Merging an `undefined` value restores the default.
- **RNG**
  - The same `seed` gives an identical sequence.
  - Values fall in [0, 1).
- **Shapes:** with a fixed seed, weighted selection follows the weights.
- **Entry:** importing `src/index.ts` in Node, with no `window` or `document`, doesn't throw.

### `@zimaleto/zima`: browser tests (Chromium)

- **Creation**
  - `createSnow` works on a canvas and on a container.
  - With a container, it creates its own canvas and removes it on `destroy()`.
  - A `position: static` container becomes `relative` and gets its original value back on `destroy()`.
  - With no target, it appends a fixed full-viewport canvas to `<body>` and removes it on `destroy()`.
  - Canvases it creates have `aria-hidden="true"`.
- **Drawing:** after a few frames the canvas has non-transparent pixels. With `count: 0` it stays empty. A snowfall stopped before its first frame still shows, and a flake is drawn at its full size.
- **Resize:** when the container size changes, the backing store becomes CSS size × `min(dpr, maxDpr)`. With `density` set, the flake count follows the new area. The snow stays on screen while the container resizes, and the flakes spread over a container that was hidden or has grown. A canvas target without a CSS size doesn't grow on a dense screen.
- **Lifecycle**
  - The animation runs right after creation.
  - No frames are drawn after `stop()` or `destroy()`.
  - After an explicit `stop()`, hiding and showing the tab doesn't restart the loop.
  - Observers are disconnected.
  - Calling `destroy()` twice is safe, and other methods called after it do nothing.
  - After `destroy()`, a canvas target is cleared and its context is back at full opacity, and changes to reduced motion or the pixel ratio no longer draw on it.
- **Frame timing:** with frames every 16 ms and `fps: 30`, every other frame draws. A low cap keeps the full fall speed, and a stalled frame moves the flakes by at most 50 ms.
- **`pauseWhenHidden`:** the loop pauses when the canvas scrolls off-screen; with `false` it keeps running.
- **`reducedMotion`** (with `matchMedia` stubbed to `reduce`)
  - `"static"` draws exactly one frame, redraws it after a resize, and `start()` doesn't animate it.
  - `"ignore"` keeps animating.
  - A live change of the media query is picked up.
- **`update()`:** changing `color`, `shapes` or the largest `size` rebuilds sprites; changing `wind` doesn't. With a seed, flakes that `update()` adds get places of their own instead of copying the first ones.
- **`image()`:** flakes with an image shape appear only after the image has loaded, and a picture that fails to load rejects `ready`. A shape whose `ready` rejects is never drawn and causes no unhandled rejection.

### `@zimaleto/zima-react`: happy-dom + Testing Library

Core is mocked with `vi.mock` (one shared mock in `__tests__/snowMock.ts`), except in the SSR test, which renders with the real core, and the re-export test. The mock keeps state (`isRunning`, `isDestroyed`), so tests check what a snowfall would do rather than count calls. Calls to `update()` are compared with `toStrictEqual`, because `toEqual` ignores keys set to `undefined`.

- **Instance lifecycle**
  - `<Snowfall>` creates exactly one instance on mount and destroys it on unmount.
  - Under `<StrictMode>`, exactly one live instance remains after the double effect, and prop changes and `paused` reach it.
- **Prop changes**
  - They call `instance.update()` with the new options and never re-create the instance.
  - A new but equal `shapes` array, `{ shape, weight }` entries included, doesn't call `update()`.
  - A removed prop is sent as `undefined`.
- **`paused`:** toggling it pauses and resumes the same instance, and a snowfall moved to a new target stays paused.
- **Layout and attributes**
  - `fullscreen` applies fixed overlay styles; the default fills the parent.
  - `aria-hidden="true"` is set, and `aria-hidden={false}` turns it off.
  - `className` and `style` pass through, and `ref` reaches the `<canvas>`.
- **`useSnowfall(ref)`:** works with a canvas the user owns. A `null` ref is a no-op.
- **SSR:** `renderToString(<Snowfall />)` returns a `<canvas>` and never touches `window`. This lives in the `*.ssr.test.tsx` file.
- **`isEqual`:** arrays and `{ shape, weight }` entries compare by content, functions by identity.

### Build checks (`*.dist.test.ts`)

- **Core:** running `dist/zimaleto.iife.js` in a bare `node:vm` context doesn't touch the DOM, and it puts `createSnow` and every shape on `Zimaleto`.
- **React (M3):** the built entry file starts with `"use client"`.

### Type tests

- `Range` accepts `number` and `[number, number]`, and rejects `[number]`.
- Custom functions that match `Shape` are accepted.
- `color` accepts a string and a string array.
- `<Snowfall>` props are core options plus `fullscreen`, `paused` and canvas attributes. Unknown props, `width`, `height` and `children` are type errors, and `color` accepts a list.

### Coverage

- Provider is `@vitest/coverage-v8`, which also works in Chromium browser mode. Reporters: `text` and `lcov`. Only `src/` counts, so the `dist` tests don't skew it.
- Thresholds are checked by each package's `test` task. It runs all of the package's projects in one Vitest run, so the engine (covered by browser tests) and the physics (covered by unit tests) count together. Both packages are held at 100% statements, branches, functions and lines.

### CI

One workflow, `ci.yml`, runs its jobs in a strict order. Each job is a separate check on the PR and starts only after the previous one passes:

1. **Lint:** `pnpm lint`
2. **Typecheck:** `pnpm typecheck`
3. **Build and size:** `pnpm build`, then `pnpm size`
4. **Test:** installs Chromium (cached by Playwright version), runs `pnpm test` and uploads the coverage reports
5. **Deploy demo** (`main` only): builds the playground and deploys it to GitHub Pages, with `pages: write` and `id-token: write`
6. **Release plan**, then **Version PR**, or **Stage on npm** followed by **Tag release** (`main` only): see §7.

A composite action, `.github/actions/setup`, installs pnpm, Node from `.nvmrc` and the dependencies for every job. Every action is pinned to a commit SHA with a version comment, because the deploy job can mint an OIDC token, and Dependabot updates the pins in one grouped PR a month (directories `/` and `/.github/actions/*`). Every job times out after 10 minutes, and checkouts don't keep the token (`persist-credentials: false`). When tests fail, the job uploads the browser tests' failure screenshots from `packages/*/.vitest/`. A new push to a pull request cancels its older run. A run on `main` that has started always finishes, because its last jobs deploy and release; a newer push only replaces one that is still queued.

### Rules

- A milestone is done only when its features are covered by tests and CI is green.
- A bug fix starts with a failing test that reproduces the bug.
- Tests never depend on wall-clock time or `Math.random`. They use `seed` and the injectable clock (§5).
- The playground is for manual tuning only. It doesn't replace tests.

### Confirmed in M0

- **Vitest typecheck with TypeScript 7.** Vitest runs TS 7's `tsc` binary and reads its output; type tests pass and fail as expected.
- **publint and attw check the packed package.** They report on `publishConfig.exports` (what pnpm publishes), and with `CI=true` a deliberate packaging error fails `pnpm build`. Turborepo passes `CI` through to tasks.
- **Coverage thresholds** fail the run when code is left uncovered, and `tsc` reports missing explicit types under `isolatedDeclarations`.

### Optional, after M2

- **Screenshot regression.** Vitest 5 browser mode has `toMatchScreenshot`, and a fixed `seed` plus the clock make frames deterministic. Canvas anti-aliasing differs between macOS and Linux, so baselines would come from CI only.

---

## 9. Milestones

**Workflow.** Each milestone is one branch (`m0-scaffold`, `m1-core`, `m2-shapes`, `m3-react`, `m4-polish`, `m5-release`; next `m6-performance`, `m7-snowflakes`, `m8-drifts`) and one pull request into `main`, squash-merged so it lands as one commit titled with the PR title. A milestone is done when its features are implemented, covered by Vitest tests (§8), CI is green, and the owner has reviewed and merged the PR. Work stops after each milestone until then.

- **M0 · Scaffold.** Workspace, Turborepo, root scripts (§4), Biome (configured per CLAUDE.md), husky pre-commit, tsconfig, `.gitignore`, `.vscode/extensions.json`, `LICENSE` (MIT, `alexeikaratai`) in the root and in each package, README stubs, and empty `zima`, `zima-react` and `playground` that build and pass publint/attw. Test setup is included:
  - Vitest configs (the per-package projects from §8, plus the root `projects` config)
  - one smoke test per Vitest project
  - coverage thresholds
  - size-limit with the ESM budgets from §7, so `pnpm verify` guards size from the first commit
  - Playwright Chromium in CI
  - the TS 7 typecheck check
- **M1 · Core MVP.** Engine loop, the `dot` shape, all three targets (none for the page overlay, a canvas, a container), start on creation, count/density, size, speed, wind/gust, sway, rotation, opacity, color lists, parallax, `fps` cap, `seed`, resize and DPR handling, visibility pause, reduced motion, `update()`, `destroy()`. The playground gets live controls that drive `createSnow` directly. Tests: the core unit and browser suites from §8.
- **M2 · Shapes.** `star`, `crystal`, `text()`, `image()` with async loading, custom `Shape`, weighted mix, sprite cache. The `shapes` option and the sprite cache took `createSnow` from 1.99 KB to 2.31 KB, so the owner raised its budget to 2.5 KB. Tests: shape selection, sprite rebuild on `update()`, image loading, and type tests for `Shape`.
- **M3 · React.** `<Snowfall>` (with `fullscreen` and `paused`), `useSnowfall`, `"use client"`; the playground switches to `<Snowfall>`. Tests: the React, SSR, type and `dist` tests from §8.
- **M4 · Polish.** IIFE build with its smoke test and 3 KB budget, the `deploy` job for the GitHub Pages demo, README for each package, and examples in `examples/`: Vite without a framework (`createSnow()`) and the Next.js App Router. The examples build in CI with the rest of the workspace. `next build` in Next.js 16.4 type-checks with TypeScript 7, so the example needs no TypeScript 6 catalog.
  - The page overlay appends to `<body>`, so the README tells `<script>` users to load the build at the end of `<body>` or wait for `DOMContentLoaded`.
  - Next.js needs default exports in `page.tsx` and `layout.tsx`, so CLAUDE.md's named-export rule and the Biome override widen to cover them.
  - The READMEs cover the notes from §6: a canvas needs a CSS size, `text()` and `image()` belong in client components, and apps mock the package in jsdom tests.
- **M5 · Release 0.1.0.** The `release` job with staged publishing, the release app and the `npm` environment, placeholder packages and trusted publishing (§7), and the first changeset release, `0.1.0`. The npm org already exists. Released on 2026-11-11.
- **M6 · Performance baseline.** A performance panel, a stress preset and a capacity ramp in the playground; baseline numbers on the owner's devices; and only the engine changes those numbers justify (§11). No new public API.
- **M7 · More snowflakes.** `dendrite`, `plate`, `needle`, `bokeh`, `sparkle` and the `crystals()` generator in the core, a shape gallery in the playground, and a larger budget for the script build (§11).
- **M8 · Snow drifts.** The `ground` option and `drift()`: flakes that reach the bottom settle into a layer of snow that builds up (§11).
- **Later.**
  - `@zimaleto/zima-vue`: Vue 3 component plus a `useSnowfall` composable.
  - `@zimaleto/zima-angular`: standalone component with signals. It needs ng-packagr and the Angular Package Format, so it's built outside tsdown and wired into Turborepo as its own `build`.
  - Vue (`vue-tsc`) and Angular (`ngc`, ng-packagr) call the TypeScript JS API, which TS 7.0 doesn't ship (a new API is planned for 7.1). Until their tools support TS 7, these packages take TypeScript 6 from a named catalog.
  - Docs site, snow piling up on page elements, pointer interaction, a worker renderer, and effects beyond snow (§12).

---

## 10. Decisions

Decided on 2026-11-07 unless a row gives another date.

| Topic | Decision |
|---|---|
| Name | **zimaleto** is the umbrella: npm org, repo, folder, README, CDN global `Zimaleto`. The npm org name `zima` was unavailable. Packages keep the **zima** name: `@zimaleto/zima` is the core, and wrappers are `@zimaleto/zima-<framework>`. |
| npm | Org `zimaleto` (owner `alex.karatai`). Packages: `@zimaleto/zima`, `@zimaleto/zima-react`, later `@zimaleto/zima-vue` and `@zimaleto/zima-angular`. |
| Architecture | Framework-agnostic core with zero dependencies, and one wrapper package per framework (React now, Vue and Angular later), each with its own framework peer range. |
| Git hosting | Public GitHub repo [alexeikaratai/zimaleto](https://github.com/alexeikaratai/zimaleto). It has to be public for npm provenance. |
| Git workflow | One branch and one PR per milestone. The owner reviews and merges, and work stops after each milestone. |
| AI attribution | None: no co-author trailers in commits, no "generated with" lines in PRs, no AI annotations in code. |
| License | MIT, copyright `alexeikaratai` |
| Dependencies | Latest versions from the public npm registry; never copied from other projects. |
| Build | tsdown for packages (the successor of tsup, built on Rolldown like Vite 8); Vite for the playground and examples. |
| Code style | Biome only (no Prettier, no ESLint): 4 spaces, 120 columns, double quotes, semicolons. Full rules in CLAUDE.md. |
| Page overlay without React | `createSnow()` with no element creates a fixed full-viewport canvas. |
| Start | `createSnow()` starts the animation; `stop()` and `start()` pause and resume it. |
| Colors | `color` takes one color or a list. |
| React `paused` | `<Snowfall paused>` and `useSnowfall`'s `paused` option stop and resume the snow. |
| Demo | The playground is deployed to GitHub Pages from `main`. |
| Public option names | Web-platform style without `is`/`has` prefixes: `parallax`, `fullscreen`, `paused`. |
| `reducedMotion` default | `"static"`: draw one frame, then stop. |
| `<Snowfall>` layout | Fills its parent by default; the `fullscreen` prop turns it into a fixed overlay. |
| Node | 26 LTS via nvm (`.nvmrc`) |
| Tests | Vitest only (§8), in `__tests__/` folders |
| CI pipeline (2026-11-08) | One workflow with jobs in a strict order: lint → typecheck → build and size → test, then on `main` deploy → release (M5). |
| React size budget (2026-11-08) | `import { Snowfall }` may take up to 650 B brotli instead of 500 B, measured like the core's `import { createSnow }`. Comparing options by value, telling options from canvas attributes, forwarding `ref` and the layout styles need about 590 B. |
| Core size budget (2026-11-08) | `import { createSnow }` may take up to 2.5 KB brotli instead of 2 KB. The weighted `shapes` option, the sprite cache and image loading add about 300 B, and the M1 engine alone already filled 2 KB. |
| Code structure (2026-11-08) | Source is grouped into module folders: `engine/`, `options/`, `physics/` and `shapes/` in the core, features in the playground. Files stay under about 300 lines, constants live next to the code that uses them, and tests sit in each module's `__tests__/`, one file per topic. |
| Paused snow (2026-11-08) | `stop()` and `paused` freeze the snow and keep the last frame on screen at any point, including before the first frame. |
| Warnings and coverage (2026-11-08) | Lint (`--error-on-warnings`) and the build (`failOnWarn: true`) fail on warnings locally too, so `pnpm verify` matches CI. Coverage thresholds are 100% on all four metrics in both packages. |
| Action pins (2026-11-09) | Every action is pinned to a commit SHA with a version comment before any job gets `id-token: write`; Dependabot updates the pins monthly in one grouped PR. |
| Demo deploy (2026-11-09) | GitHub Pages with GitHub Actions as the source. The `deploy` job runs on `main` after Test, in the `github-pages` environment, which accepts `main` only. |
| Staged releases (2026-11-09) | CI stages each release through npm trusted publishing, and it goes live only after the owner approves it with 2FA on npmjs.com. |
| First publish (2026-11-09) | The packages start as `0.0.0-stage` placeholders staged once from a local checkout, so trusted publishing can be set up before `0.1.0` and `0.1.0` comes from CI with provenance. |
| Security hardening (2026-11-09) | After a security audit, the release runs as four least-privilege jobs, and privileged jobs skip the cache. Actions are restricted to an allowlist with enforced SHA pins, and outside contributors' fork PRs need approval. CodeQL is required on `main`, and tags are protected. pnpm refuses trust downgrades. `SECURITY.md` explains how to report. |
| Repo protection (2026-11-08) | A ruleset on `main`: changes only through PRs, merged only when Lint, Typecheck, Build and size and Test pass on an up-to-date branch; no force push, deletion or bypass, admins included. Squash merge only, with linear history; branches are deleted after merge. Dependabot alerts and security updates, secret scanning with push protection, and private vulnerability reporting are on. |
| Roadmap (2026-11-11) | After 0.1.0: a performance baseline (M6), more snowflakes (M7) and snow drifts (M8). The Vue and Angular wrappers, snow on page elements and effects beyond snow come later. |
| Shapes home (2026-11-11) | New shapes are named exports of `@zimaleto/zima`, not a separate package or a subpath. Tree-shaking keeps `createSnow` unchanged however many there are, and fixed versioning would release a separate package in lockstep anyway. The React wrapper's re-export lets Server Components pass them as props, and `crystals()` reuses the core's RNG. |
| Script build budget (2026-11-11) | The `<script>` build keeps every export in one file. Its budget rises in M7 and M8 to the measured size plus a small margin, about 3.6 KB and 4.2 KB, and each PR states the exact number. |
| Core budget for drifts (2026-11-11) | The drift's hook in the engine may take `import { createSnow }` up to 2.6 KB, after first trying to win the bytes back elsewhere in the engine. The drift itself counts only where it's imported. |

---

## 11. Roadmap after 0.1.0

Three milestones make the snow itself richer: measure first, then add new flakes, then let snow settle. The rules don't change: one branch and PR per milestone, a failing test before every fix, 100% coverage, a green `pnpm verify`, and a changeset for every package change. New exports are a minor bump, so M7 releases 0.2.0.

### M6 · Performance baseline

Numbers come before optimizations, so that M7 and M8 keep the snow cheap.

- **Playground.**
  - A Performance panel shows frames per second, the 95th-percentile frame interval and the flake count.
  - A stress preset fills the viewport with up to 5,000 flakes of every shape.
  - A ramp mode adds flakes until frames start to drop, and reports that count as the device's capacity.
- **Baseline.**
  - Devices: the owner's Mac (Chrome, Safari, Firefox) and an Android phone (Chrome).
  - Measures: the capacity at pixel ratio 1 and 2; the frame interval at 150, 1,000 and 5,000 flakes; and the tab's CPU use at the default settings, from the browser's task manager.
  - The numbers go into a table in this section, together with the steps, so later milestones can repeat them.
- **Candidates.** Each one stays only if the numbers show a gain and it fits the budget.
  - **High-refresh screens.** Without `fps`, a 120 Hz screen draws twice as many frames as a 60 Hz one for the same slow snow. A default cap would halve that work. But the current cap logic turns a 60 fps cap into every third frame at 144 Hz (48 fps) and every other frame at 90 Hz (45 fps), so the cap may need to follow the measured refresh rate. It changes a documented default, so the owner decides.
  - **Large canvases.** A 5K screen at pixel ratio 2 clears and composites about 15 megapixels a frame. Lowering the ratio for canvases that large may save more than any change to the flake loop.
  - **Downscaled sprites.** A sprite is drawn at the largest flake size and scaled down for the rest. Below half size, bilinear filtering shimmers on the detailed shapes that M7 adds. Compare `imageSmoothingQuality` with sprites rendered at a few sizes.
  - **The flake loop.** Skip rotation for flakes that don't spin, change `globalAlpha` less often, and order flakes by sprite when they're rolled, so consecutive draws share a texture. GPU canvases often gain little from these, so each one needs numbers.
- **Not in M6.** A worker renderer and WebGL stay in the backlog. The capacity numbers show whether they would ever pay off.
- **Release.** Changes to the playground alone need no changeset. An engine change gets a `perf(zima)` changeset.

### M7 · More snowflakes

The new shapes are named exports of `@zimaleto/zima`, next to `dot`, `star` and `crystal` (§10).

- Tree-shaking keeps `import { createSnow }` unchanged however many there are.
- The React wrapper re-exports them, so Server Components can pass them as props.

```ts
import { createSnow, crystals, dendrite, dot } from "@zimaleto/zima";

createSnow({ size: [4, 12], shapes: [...crystals(8), { shape: dendrite, weight: 2 }, dot] });
```

| Export | Looks like | Drawn as |
|---|---|---|
| `dendrite` | the classic fern-like snowflake: six arms with rows of side branches that shorten towards the tip | strokes, with side branches at 60° |
| `plate` | a hexagonal ice plate with ridges from the center to the corners | a translucent hexagon with an opaque outline and ridges |
| `needle` | a thin ice column that twirls as it falls | a slim prism with pointed ends |
| `bokeh` | an out-of-focus flake that adds depth when mixed with sharp ones | a radial fade to transparent, baked into the sprite, so there's no blur per frame |
| `sparkle` | a four-pointed glint | four thin rays that taper |
| `crystals(count, seed?)` | `count` different stellar crystals | generated, see below |

- **`crystals()`**
  - Every crystal has six arms with mirror-symmetric branches. The generator varies:
    - the number of branch pairs;
    - where the branches start and how long they are;
    - the arm width;
    - whether there's a hexagonal center or plate tips.

    The symmetry makes every combination look like a real crystal.
  - The same arguments return the same array of the same shapes, as `text()` does. Inline calls don't rebuild sprites, and `<Snowfall>` sees no change.
  - `seed` picks other designs. It's independent of the snow's `seed` option.
  - It uses the core's seeded generator, so the crystals are the same on every page load.
  - `count` is rounded and clamped to 1–32, because each crystal is one more sprite per color. Eight crystals in two colors render 16 small sprites once and cost nothing extra per frame.
- **Rules for every new shape.**
  - Line widths scale with the radius, with a floor of one pixel in the sprite.
  - Everything stays within 1.25 radii (the sprite contract, §5).
  - Detail needs room: at the default `size` of 2–5 px, detailed shapes read as dots, so the README and the playground suggest a size for each.
  - A shared internal helper draws the six rotated copies, wherever that saves bytes.
- **Size.** `import { createSnow }` stays at 2.48 KB. The script build grows by about 0.6 KB, and its budget rises to the measured size plus a small margin, about 3.6 KB (§10).
- **Playground.**
  - The Shapes panel gets the new shapes and a crystal count.
  - A gallery draws each shape large.
  - A preset shows the detailed shapes at a size where they read.
- **Tests.**
  - Browser tests for each shape, with pixel checks rather than screenshots (§8):
    - it draws inside 1.25 radii, so the sprite's border stays transparent;
    - it covers the expected share of its circle;
    - it matches itself turned by 180° and mirrored across the horizontal axis, within an anti-aliasing tolerance.
  - `crystals()`:
    - the same arguments give the same shapes and the same pixels;
    - different crystals differ;
    - counts outside 1–32, or not whole, are normalized.
  - The script build puts every new export on `Zimaleto`, and the React package re-exports them.
  - Type tests cover `crystals()` in `shapes`.
- **Docs and release.** The core README describes each shape and the size it needs. A `minor` changeset.

### M8 · Snow drifts

Flakes that reach the bottom of the canvas settle there, and a layer of snow builds up. For the page overlay that's the bottom of the viewport; for an element, the bottom of the element. It's opt-in: only apps that import it pay for it.

```ts
import { createSnow, drift } from "@zimaleto/zima";

createSnow({ ground: drift({ depth: 40 }) });
```

- **API.**
  - **`ground`** is a new option: what happens to flakes at the bottom. Unset, they fall out of view and respawn at the top, as now. It takes a value rather than a boolean for two reasons: the drift code stays out of bundles that don't use it, and later grounds (snow on page elements, rain splashes, fallen leaves) fit the same option.
  - **`drift({ depth, melt })`**
    - `depth` is the deepest the snow gets, in CSS px (default 40).
    - `melt` is how fast it sinks, in px per second (default 0, never). Melting works against the snowfall: a light snow with a fast melt barely builds up, and the drift disappears after the snow stops.
    - How fast it grows follows the snowfall: more and bigger flakes pile up faster. The growth per flake is tuned so that the default snowfall fills the default drift in about a minute.
  - **Sharing and comparing.** `drift()` returns plain data, so two calls with the same options compare equal in the React wrapper, and an inline prop doesn't reset the drift. Each snowfall keeps its own drift, so one value can be shared.
  - **Server Components.** It's a function, like `text()`, so a Server Component can't call it; it belongs in a client component.
- **How it works.**
  - A height map keeps the depth of the snow for each column, a few CSS px wide.
  - A flake whose drawn position (sway included) reaches the surface settles:
    - it slides to the lowest column within a short reach, which keeps the surface as smooth as settled snow (an angle of repose);
    - that column grows by an amount based on the flake's size;
    - the flake respawns at the top.
  - **The layer.**
    - The drift is drawn on a cached layer as wide as the canvas and `depth` high.
    - A settling flake is stamped onto the layer with its own sprite, color and opacity, and the columns it raised are filled below it in its color. The drift is made of the flakes that fell, without holes.
    - Each frame copies the layer once, behind the falling flakes.
  - At full depth, flakes still settle and refresh the surface, but the drift stops growing.
  - Melting lowers the height map and moves the layer down a pixel at a time.
  - A flake whose shape isn't ready, such as an `image()` that's still loading, settles without a stamp.
- **Cost.**
  - Per frame: one height-map read per flake, and one `drawImage` for the layer.
  - Per settled flake: one stamp, and a short walk over the neighboring columns.
  - No allocations per frame. The height map and the layer are rebuilt only on resize.
- **Edge cases.**
  - **Resize.** The height map is resampled to the new width, and the layer is redrawn scaled, just as flakes keep their place relative to the canvas. A change in height doesn't move the drift, because it's measured from the bottom.
  - **Pixel ratio.** A new ratio redraws the layer at that ratio.
  - **Pausing.** `stop()` and the visibility pause freeze the drift with the snow. `destroy()` drops it.
  - **Reduced motion.** `static` draws the drift as it is without growing it. `reduce` lets it grow at the slower pace of fewer, slower flakes.
  - **`update()`.**
    - New drift options keep the snow that has settled, clamped to the new depth.
    - `ground: undefined` clears it.
    - A new `color` doesn't recolor settled snow.
- **Engine integration.**
  - The engine creates one ground instance per snowfall from the `ground` option and calls it at three points:
    - after each step, to settle flakes;
    - at the start of each draw, to copy the layer;
    - when the canvas is fitted, to resample.
  - The interface is internal. Only the core's own grounds implement it, so it can change in any release. `Ground` is exported as a type only.
- **Size.**
  - The calls cost an estimated 50–100 B in `import { createSnow }`. Savings in the engine come first; if they aren't enough, the budget rises to at most 2.6 KB (§10).
  - The drift itself, about 0.5–0.7 KB, counts only in bundles that import it, under its own size-limit entry, `import { createSnow, drift }`.
  - The script build's budget rises to the measured size plus a small margin, about 4.2 KB (§10).
- **Code.** A new `ground/` module in the core, with CLAUDE.md's module list updated to match:
  - `drift.ts`: the public factory and its options;
  - `heightMap.ts`: settling, the angle of repose, resampling and melting. It's pure and unit-tested in Node;
  - `driftLayer.ts`: the cached canvas layer.
- **Tests.**
  - Unit tests (Node) for the height map:
    - a flake settles where it's drawn;
    - it slides to a lower neighbor;
    - neighboring columns never differ by more than the angle of repose allows;
    - the depth never goes past `depth`;
    - melting lowers every column and stops at zero;
    - resampling keeps the profile;
    - invalid options are normalized.
  - Browser tests (Chromium), with the manual clock and a seed:
    - after enough frames, the bottom rows are opaque and the rest isn't;
    - the drift doesn't grow while stopped;
    - `update({ ground: undefined })` clears it;
    - a resize keeps it at the bottom;
    - `destroy()` leaves a canvas target clear.
  - Type tests cover `ground` and `drift()`.
  - The React option list gains `ground`, which its type check enforces, and `isEqual` treats equal `drift()` calls as equal.
  - The script build puts `drift` on `Zimaleto`.
- **Playground and docs.**
  - The playground gets a Drift section: on or off, depth, melt and a reset.
  - The READMEs explain `ground` and `drift()`.
  - The vanilla example lets snow pile up on its hero.
  - A `minor` changeset.
- **Open questions for M8.**
  - Should a new snowfall start with some snow already on the ground? That would match flakes that start spread over the canvas, and give `static` reduced motion a settled scene.
  - Mobile browsers resize the viewport as the address bar shows and hides. The drift is measured from the bottom, so it should follow, but this needs checking on iOS Safari and on Chrome for Android.
  - Small flakes stamped onto a solid fill may look grainy. The playground decides between stamps and a smooth fill alone.

---

## 12. Beyond snow (vision)

This isn't scheduled. It's written down so that M6–M8 don't close any doors. The name already fits: *zima* is winter and *leto* is summer.

- **Rain** fits the same engine:
  - fast streaks, each one sprite stretched along its velocity;
  - splashes as a `ground`, and maybe puddles;
  - flashes for a thunderstorm.
- **Autumn leaves and spring petals** fall slowly and flutter:
  - a pseudo-3D flip, where the sprite is scaled on one axis by the cosine of a phase tied to the sway;
  - gusts that lift them;
  - fallen leaves as a `ground`.
- **Summer** is mostly not particles: soft sun rays, a glow, a rainbow after rain. These need a second kind of effect, a slow overlay that's redrawn rarely instead of every frame. Fireflies at night are particles again.
- **Weather** picks the effect for the visitor.
  - It starts with the date and the time zone. That needs no permission prompt and no network, and the time zone usually tells the hemisphere, so December brings snow in Oslo and summer in Sydney.
  - Real weather comes only on the site's terms. Either the site passes in the conditions, or an opt-in adapter asks a weather API (Open-Meteo, for example, needs no key).
  - The library never asks for the visitor's location on its own. A geolocation prompt is a poor trade for a decoration, and a location is personal data.
- **Architecture, when it starts.** Rain is the second effect, so that's the time to move the shared parts into an engine package that `zima` and the new effects build on, and not before. The shared parts are the loop, the pool, the sprites, sizing, the pauses and reduced motion. Package names are decided then, and `@zimaleto/zima` stays the snow.
