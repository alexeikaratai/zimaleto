# zimaleto — Project Plan

> Tiny, zero-dependency canvas snowfall. Framework-agnostic TypeScript core + thin framework wrappers (React first; Vue and Angular later).

Status: **planning** · Last updated: 2026-11-08 · Repo: [alexeikaratai/zimaleto](https://github.com/alexeikaratai/zimaleto) · npm: `@zimaleto/*`

Working rules and code style: [CLAUDE.md](CLAUDE.md).

---

## 1. Goals

- **Tiny core.** `@zimaleto/zima`: zero dependencies, SSR-safe, tree-shakeable, **≤ 2 KB min+brotli**.
- **Thin wrappers.** Each framework gets its own small package on top of the core. `@zimaleto/zima-react` adds **≤ 500 B**; `@zimaleto/zima-vue` and `@zimaleto/zima-angular` follow the same pattern later.
- **Works without a framework.** `createSnow()` with no element puts snow over the whole page, and the same call works from a `<script>` tag through the CDN build.
- **Configurable flakes.** Count/density, size, fall speed, wind and gusts, sway, rotation, opacity, one color or a list, shape variants (built-in and custom), parallax.
- **Well-behaved.** Respects `prefers-reduced-motion`, pauses when the tab or canvas is hidden, handles HiDPI, uses `pointer-events: none`, never shifts the page layout.

### Not in v1 (backlog)

Snow piling up on elements, mouse/scroll interaction, a WebGL renderer, rendering in a worker via OffscreenCanvas, a `<zimaleto-snow>` web component.

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
| Types | @types/react / @types/react-dom / @types/node | 19.3.x / 19.3.x / 26.6.x | React ships without types; Node types are for config files and `dist` tests |
| Playground | Vite + @vitejs/plugin-react | 8.3.x / 6.2.x | also deployed as the demo on GitHub Pages |
| Tests | **Vitest** + @vitest/ui | 5.1.x | single test runner for every package; the UI backs `pnpm test:ui`; see §8 |
| Tests: coverage | @vitest/coverage-v8 | 5.1.x | thresholds enforced in CI |
| Tests: real browser | @vitest/browser-playwright + Playwright (Chromium) | 5.1.x / 1.65.x | real canvas, observers, rAF |
| Tests: DOM / React | happy-dom + @testing-library/react + @testing-library/dom | 21.0.x / 16.3.x / 10.4.x | React wrapper tests; the DOM package is a required peer of Testing Library React |
| Lint + format | Biome | 2.6.x | the only linter and formatter (no Prettier, no ESLint); run from the root |
| Git hooks | husky | 9.1.x | pre-commit runs Biome on staged files |
| Size budget | size-limit + preset-small-lib | 14.3.x | fails CI if a budget is exceeded |
| Package checks | publint + @arethetypeswrong/core | 0.3.x / 0.18.x | run by tsdown; they fail CI through `failOnWarn` (§4) |
| Releases | Changesets | 3.0.x | GitHub Action + npm Trusted Publishing (OIDC, provenance) |

---

## 3. Repository layout

```
zimaleto/
├─ .nvmrc                      # 26
├─ .npmrc                      # registry=https://registry.npmjs.org/ (pinned per project)
├─ .husky/pre-commit           # Biome on staged files
├─ .vscode/extensions.json     # recommends the Biome extension (settings.json stays local)
├─ CLAUDE.md                   # working rules and code style
├─ LICENSE                     # MIT
├─ README.md
├─ package.json                # private root; packageManager, engines.node >=26 (root only)
├─ pnpm-workspace.yaml         # packages/*, apps/*, examples/*, catalog
├─ turbo.json
├─ biome.json
├─ tsconfig.base.json
├─ vitest.config.ts            # root: test.projects → one watch UI + merged coverage locally
├─ .changeset/
├─ .github/workflows/
│  ├─ ci.yml                   # lint · typecheck · test · build · size
│  ├─ pages.yml                # playground → GitHub Pages on push to main
│  └─ release.yml              # changesets/action → pnpm publish (OIDC)
├─ packages/
│  ├─ zima/                    # @zimaleto/zima (core)
│  │  ├─ src/
│  │  │  ├─ index.ts           # public API
│  │  │  ├─ engine.ts          # createSnow(): targets, loop, lifecycle, observers
│  │  │  ├─ physics.ts         # pure step(): no DOM, unit-testable
│  │  │  ├─ options.ts         # defaults + normalization
│  │  │  ├─ sprites.ts         # pre-rendered flake sprites
│  │  │  ├─ random.ts          # mulberry32 seeded RNG
│  │  │  ├─ shapes/            # dot, star, crystal, text, image (separate exports)
│  │  │  └─ __tests__/
│  │  │     ├─ physics.test.ts
│  │  │     ├─ options.test.ts
│  │  │     ├─ random.test.ts
│  │  │     ├─ shapes.test.ts
│  │  │     ├─ index.test.ts           # the entry imports in Node without touching the DOM
│  │  │     ├─ engine.browser.test.ts
│  │  │     ├─ iife.dist.test.ts       # runs the built IIFE (M4)
│  │  │     └─ api.test-d.ts           # type tests for the public API
│  │  ├─ README.md, LICENSE    # npm packs only what's inside the package folder
│  │  ├─ vitest.config.ts      # projects: unit (Node), browser (Chromium), dist (Node)
│  │  └─ tsdown.config.ts
│  └─ zima-react/             # @zimaleto/zima-react
│     ├─ src/
│     │  ├─ index.ts
│     │  ├─ Snowfall.tsx
│     │  ├─ useSnowfall.ts
│     │  └─ __tests__/
│     │     ├─ Snowfall.test.tsx
│     │     ├─ Snowfall.ssr.test.tsx
│     │     ├─ useSnowfall.test.tsx
│     │     ├─ directive.dist.test.ts  # the built entry starts with "use client"
│     │     └─ props.test-d.ts
│     ├─ README.md, LICENSE
│     ├─ vitest.config.ts      # projects: unit (happy-dom), dist (Node)
│     └─ tsdown.config.ts
├─ apps/
│  └─ playground/              # Vite + React app with live option controls; the demo
└─ examples/                   # M4: Vite without a framework, Next.js App Router
```

Later: `packages/zima-vue`, `packages/zima-angular`, `apps/docs`.

---

## 4. Tooling details

- **Node version lives in the root only.** The root `package.json` sets `engines.node: ">=26"` for contributors. Published packages run in browsers, so they don't declare a Node engine.
- **Develop against source, publish `dist`.** In the repo, each package's `exports` points to `./src/index.ts`, so the playground and tests use live source with HMR and nothing needs a watch build. `publishConfig.exports` (which pnpm swaps in at pack time) points to `dist/`. tsdown generates this pair with `exports: { devExports: true }`.
- **Public registry only.** The repo's `.npmrc` pins `registry=https://registry.npmjs.org/`, whatever the machine's global npm config says.
- **`pnpm-workspace.yaml` catalog** pins `react`, `react-dom`, `@types/react`, `@types/react-dom`, `typescript`, `vite`, `vitest`. Packages refer to them as `"catalog:"`. Internal dependencies use `"workspace:^"`. A named catalog can hold a second version for some packages, such as TypeScript 6 for Vue and Angular later (§9).
- **`turbo.json` tasks:**
  - `build`: `dependsOn: ["^build"]`, `outputs: ["dist/**"]`
  - `typecheck`: cached, no outputs
  - `test`: `dependsOn: ["build"]`, `outputs: ["coverage/**"]`. Runs every Vitest project of the package (unit, browser, dist) in one run with coverage thresholds. It builds first because the `dist` tests read the built files. Core's browser project needs Chromium.
  - `test:unit`: cached, no outputs, no build. Runs only the `unit` project (Node or happy-dom, with the SSR and type tests) without thresholds: the fast local loop.
  - `size`: `dependsOn: ["build"]`
  - `dev`: `cache: false`, `persistent: true`
- **Lint isn't a Turborepo task.** `pnpm lint` runs Biome once over the whole repo, which is faster than splitting it per package and needs no cache.
- **tsdown config:** `platform: "browser"`, `publint: true`, `attw: true` (its default `esm-only` profile fits ESM-only packages). Both checks only warn by default, so `failOnWarn: "ci-only"` turns any build warning into a CI failure while local builds just warn. tsdown packs the package with the detected package manager (`pnpm pack`), so the checks see `publishConfig.exports`.
- **`biome.json`** (the rules are in CLAUDE.md): formatter with 4-space indent, line width 120, double quotes, semicolons, JSX `attributePosition: "multiline"`; import organizing on; the recommended linter rules plus the `react` domain; `style/noDefaultExport` on, with an override for config files that need a default export. It reads `.gitignore`.
- **Pre-commit hook.** husky runs `biome check --write --staged --no-errors-on-unmatched` and re-stages the fixed files. CI runs the same check on every file.
- **`tsconfig.base.json`:** `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `strict`, `noUncheckedIndexedAccess`, `isolatedDeclarations`, `verbatimModuleSyntax`, `jsx: react-jsx`, `noEmit` (tsdown does the emitting), `lib: [ES2022, DOM, DOM.Iterable]`.
- **Editor.** `.vscode/extensions.json` is committed and recommends the Biome extension. `.vscode/settings.json` holds personal settings, so it's gitignored; M0 adds Biome as the default formatter and `importModuleSpecifierEnding: "minimal"` to the local copy.
- **`.gitignore`** also covers other personal tool settings, such as `.claude/settings.local.json`.
- **Browser target:** ES2022 output, which covers evergreen browsers from roughly 2022 on. No polyfills.

### Root scripts

First setup: `nvm install` (reads `.nvmrc`); `npm install -g pnpm` if that Node has no pnpm yet (pnpm then switches itself to the `packageManager` version); `pnpm install`; `pnpm exec playwright install chromium`.

| Command | Does |
|---|---|
| `pnpm dev` | `turbo run dev`: the playground's dev server |
| `pnpm build` | `turbo run build` |
| `pnpm typecheck` | `turbo run typecheck` |
| `pnpm lint` | `biome check .` |
| `pnpm lint:fix` | `biome check --write .` |
| `pnpm test` | `turbo run test`: every package's full suite with coverage thresholds; builds first and needs Chromium |
| `pnpm test:unit` | `turbo run test:unit`: the `unit` projects only, with no browser and no build |
| `pnpm test:watch` | root `vitest` in watch mode across all projects except `dist` |
| `pnpm test:ui` | the same with `--ui` |
| `pnpm coverage` | root `vitest run --coverage` without the `dist` projects: one merged report, no thresholds |
| `pnpm size` | `turbo run size` |
| `pnpm verify` | `pnpm lint && turbo run typecheck test build size`: exactly what CI runs |
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

- **No target:** creates a canvas with `position: fixed; inset: 0; pointer-events: none; z-index: 9999`, appended to `<body>`. Its styles can be changed through `snow.canvas`.
- **A `<canvas>`:** draws on it and leaves its styles alone.
- **Any other element:** adds a canvas inside it with `position: absolute; inset: 0; pointer-events: none`. If the element is `position: static`, it gets `position: relative`, and `destroy()` restores the original value.
- **Accessibility.** Canvases the engine creates get `aria-hidden="true"`, the same as `<Snowfall>`.
- **Start and stop.** The animation starts on creation. `stop()` and `start()` pause and resume it. After an explicit `stop()`, the automatic visibility pause never resumes the snow on its own. Reduced motion wins over `start()` (see `reducedMotion`).
- **After `destroy()`**, every method is a no-op.

### Options

`Range = number | [min, max]`. Each flake picks a random value inside the range. `update()` merges the options it gets into the current ones. A key set to `undefined` goes back to its default, so a wrapper can drop a removed prop.

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
| `fps` | `number` | — | Frame-rate cap. Unset means the display refresh rate. |
| `maxDpr` | `number` | `2` | Upper limit on devicePixelRatio, to protect performance. |
| `reducedMotion` | `"static" \| "reduce" \| "ignore"` | `"static"` | With `static`, the engine draws one frame and stops; it redraws that frame after a resize or `update()`, and `start()` doesn't animate it. With `reduce`, it keeps half the flakes at half the speed, with no rotation or gusts. Changes to the OS setting apply live. |
| `pauseWhenHidden` | `boolean` | `true` | Pauses on tab hidden (`visibilitychange`) and when the canvas is off-screen (`IntersectionObserver`). |
| `seed` | `number` | — | Seeds the RNG so runs are reproducible (tests, screenshots). |

Public option names follow web-platform style (`parallax`, not `hasParallax`). The `is`/`has` prefix rule in CLAUDE.md is for internal code.

### Shapes

```ts
type Shape = (context: CanvasRenderingContext2D, radius: number) => void; // draw centered at (0, 0)
type WeightedShape = { shape: Shape; weight: number };
```

- Built-ins are named exports, so unused ones are tree-shaken: `dot`, `star`, `crystal` (six arms).
- Helpers: `text("❄")` for emoji or glyph flakes, and `image(src)` for a bitmap flake.
- A custom shape is any function with the `Shape` signature.
- **Color.** The engine sets `fillStyle` and `strokeStyle` to the flake's color before calling a shape, and shapes draw with them. `image()` ignores color, and color emoji keep their own colors.
- **Images load asynchronously.** An `image()` sprite is built once the image has loaded. Until then, flakes with that shape are skipped.

### Engine internals

- **One `requestAnimationFrame` loop** with physics based on `dt`, so speed doesn't depend on frame rate. `dt` is clamped to 50 ms to avoid jumps after the tab was hidden.
- **Pure physics.** `step(flakes, dt, env)` mutates plain state and has no DOM access, so it can be unit-tested without a canvas.
- **Injectable clock (internal).** The engine factory in `engine.ts` takes its time source and scheduler (`now`, `requestFrame`, `cancelFrame`) as an extra parameter that `index.ts` doesn't expose. Tests import the factory directly and advance frames by hand, so they're deterministic and don't need fake rAF timers.
- **Flake pool.** A fixed array of plain objects. Flakes that leave the screen are respawned at the top instead of allocating new ones, so there's no GC churn. Flakes wrap horizontally when wind pushes them sideways. The pool is resized only when `count` or `density` changes, or when the canvas resizes while `density` is set.
- **First frame.** Flakes start spread over the whole canvas, so the snow looks like it has been falling for a while instead of starting at the top edge.
- **Sprites.** Each `(shape × color)` pair is rendered once to a detached `<canvas>` element at the largest `size` × DPR. Sprites are rebuilt when `shapes`, `color` or the largest `size` changes, and when the DPR changes. Each frame then calls `drawImage` with `setTransform` (translate, rotate, scale), which is much cheaper than drawing paths for every flake.
- **Wind gusts** are a cheap smooth noise: a sum of two sines with incommensurate frequencies.
- **Resize.** A `ResizeObserver` sets the canvas backing store to CSS size × `min(devicePixelRatio, maxDpr)`. DPR changes (another screen, browser zoom) trigger the same update.
- **SSR safety.** Nothing touches `window` or `document` when the module is imported; all DOM access happens inside `createSnow()`.

---

## 6. React wrapper (`@zimaleto/zima-react`)

```tsx
import { crystal, Snowfall, useSnowfall } from "@zimaleto/zima-react";

<Snowfall fullscreen count={200} wind={15} shapes={[crystal]} paused={!isWinter} />;

// or bring your own canvas
const canvasRef = useRef<HTMLCanvasElement>(null);
useSnowfall(canvasRef, { density: 0.5 });

return <canvas ref={canvasRef} />;
```

- **React 19 only** (`peerDependencies.react: "^19"`), using `ref` as a prop with no `forwardRef`.
- **`"use client"`** sits at the top of `src/index.ts` and stays at the top of the build output, so it works in the Next.js App Router out of the box, from source in the workspace and from `dist` when published.
- **Lifecycle.** The instance is created in `useEffect` and destroyed in cleanup, which is safe under StrictMode's double mount. Prop changes go to `instance.update()`; the instance is never re-created on re-render. Options are compared by value first (arrays element by element, `{ shape, weight }` entries by their fields), so a new but equal `shapes={[crystal]}` or `color={["#fff", "#cfe8ff"]}` on every render doesn't rebuild sprites. A removed prop is passed as `undefined`, which restores its default.
- **`paused`.** `true` calls `stop()`, `false` calls `start()`. `useSnowfall` accepts `paused` in its options too. Reduced motion still wins (§5).
- **`ref`** points to the `<canvas>`. `useSnowfall` returns nothing in v1: its options and `paused` cover control.
- **Props** are all core options, plus `fullscreen?: boolean` and `paused?: boolean`, plus canvas attributes (`className`, `style`, `aria-hidden` defaults to `true`). A canvas attribute that shares a name with a core option is left out: React's non-standard `color` attribute would narrow `color` to a string. `width`, `height` and `children` aren't accepted, because the engine manages the canvas size.
  - Default layout fills the parent: `position: absolute; inset: 0; pointer-events: none`. The parent needs a `position` other than `static`.
  - `fullscreen` gives an overlay: `position: fixed; inset: 0; pointer-events: none; z-index: 9999`, the same as the core overlay. `style` overrides any of these.
- **`@zimaleto/zima` is a regular dependency** (`workspace:^`), not bundled in, so it's never duplicated. Core's shapes and types are re-exported, so users need only one package.

---

## 7. Package shape and release

- **ESM-only** (`"type": "module"`), `sideEffects: false`, `files: ["dist"]`, types in `exports`.
- **Package metadata.** Each package has its own `README.md` and a copy of `LICENSE`, because npm packs only what's inside the package folder. `repository` (with `directory`), `homepage` and `bugs` point to the GitHub repo; npm rejects provenance when `repository.url` doesn't match the repo that publishes.
- **Core also ships `dist/zimaleto.iife.js`** for `<script>` and CDN use (unpkg, jsDelivr), exposing `window.Zimaleto`. The `unpkg` and `jsdelivr` fields in `package.json` point to it.
- **Size budgets** (size-limit, enforced in CI). A budget is never raised without the owner's approval.
  - `@zimaleto/zima`, `import { createSnow }` (includes the default `dot`): ≤ 2 KB brotli
  - `@zimaleto/zima`, IIFE build with every shape: ≤ 3 KB brotli
  - `@zimaleto/zima-react`, excluding core and React: ≤ 500 B brotli
- **Versioning.** Changesets in **fixed** mode for `@zimaleto/*` while on 0.x. One version for all packages is simpler for users.
- **Publishing.** `changesets/action` opens a "Version Packages" PR. Merging it runs `changeset publish`, which in a pnpm repo uses `pnpm pack` and `pnpm publish`: they swap in `publishConfig.exports` and rewrite `workspace:^` (plain `npm publish` would do neither). pnpm 12 publishes via **npm Trusted Publishing** (GitHub OIDC; the workflow needs `id-token: write`), which adds provenance and needs no long-lived `NPM_TOKEN`.
- **Release setup (M5).**
  - Trusted Publishing is configured per package on npmjs.com. If npm still requires a package to exist before a trusted publisher can be added, the first publish of each package is done by hand with 2FA.
  - The repo must allow GitHub Actions to create pull requests (Settings → Actions → General), so `changesets/action` can open the Version Packages PR.
- **Demo.** `pages.yml` builds the playground on every push to `main` and deploys it to GitHub Pages at `https://alexeikaratai.github.io/zimaleto/` (Vite `base: "/zimaleto/"`, Pages source: GitHub Actions). The READMEs link to it.

---

## 8. Testing (Vitest)

Vitest is the only test runner. Each package has its own `vitest.config.ts`. Test style (`describe` + `test`, Arrange → Act → Assert, one behavior per test) is in CLAUDE.md.

- **CI:** `turbo run test` runs each package's full suite (every project, coverage and thresholds) with per-package caching.
- **Locally:** `pnpm test:unit` is the fast loop without a browser. The root `vitest.config.ts` lists all packages under `test.projects`, which gives one watch session (and `--ui`) across the repo, plus a merged coverage report. The commands are in §4 (Root scripts).
- **Project names** carry the package name (`zima:unit`, `zima:browser`, `zima:dist`, `zima-react:unit`, `zima-react:dist`), because the root config combines them and Vitest requires unique names.

### File conventions

Tests live in a `__tests__/` folder next to the code they test.

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
  - `dt` is clamped to 50 ms.
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
  - `reducedMotion: "reduce"` halves count and speed and turns off rotation and gusts.
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
- **Drawing:** after a few frames the canvas has non-transparent pixels. With `count: 0` it stays empty.
- **Resize:** when the container size changes, the backing store becomes CSS size × `min(dpr, maxDpr)`. With `density` set, the flake count follows the new area.
- **Lifecycle**
  - The animation runs right after creation.
  - No frames are drawn after `stop()` or `destroy()`.
  - After an explicit `stop()`, hiding and showing the tab doesn't restart the loop.
  - Observers are disconnected.
  - Calling `destroy()` twice is safe, and other methods called after it do nothing.
- **`fps`:** with frames every 16 ms and `fps: 30`, every other frame draws.
- **`pauseWhenHidden`:** the loop pauses when the canvas scrolls off-screen; with `false` it keeps running.
- **`reducedMotion`** (with `matchMedia` stubbed to `reduce`)
  - `"static"` draws exactly one frame, redraws it after a resize, and `start()` doesn't animate it.
  - `"ignore"` keeps animating.
  - A live change of the media query is picked up.
- **`update()`:** changing `color`, `shapes` or the largest `size` rebuilds sprites; changing `wind` doesn't.
- **`image()`:** flakes with an image shape appear only after the image has loaded.

### `@zimaleto/zima-react`: happy-dom + Testing Library

Core is mocked with `vi.mock`, except in the SSR test, which renders with the real core.

- **Instance lifecycle**
  - `<Snowfall>` creates exactly one instance on mount and destroys it on unmount.
  - Under `<StrictMode>`, exactly one live instance remains after the double effect.
- **Prop changes**
  - They call `instance.update()` with the new options and never re-create the instance.
  - A new but equal `shapes` array, `{ shape, weight }` entries included, doesn't call `update()`.
  - A removed prop is sent as `undefined`.
- **`paused`:** toggling it calls `stop()` and `start()` on the same instance.
- **Layout and attributes**
  - `fullscreen` applies fixed overlay styles; the default fills the parent.
  - `aria-hidden="true"` is set.
  - `className` and `style` pass through, and `ref` reaches the `<canvas>`.
- **`useSnowfall(ref)`:** works with a canvas the user owns. A `null` ref is a no-op.
- **SSR:** `renderToString(<Snowfall />)` returns a `<canvas>` and never touches `window`. This lives in the `*.ssr.test.tsx` file.

### Build checks (`*.dist.test.ts`)

- **Core (M4):** running `dist/zimaleto.iife.js` in a bare `node:vm` context defines `Zimaleto.createSnow` without touching the DOM.
- **React (M3):** the built entry file starts with `"use client"`.

### Type tests

- `Range` accepts `number` and `[number, number]`, and rejects `[number]`.
- Custom functions that match `Shape` are accepted.
- `color` accepts a string and a string array.
- `<Snowfall>` props are core options plus `fullscreen`, `paused` and canvas attributes. Unknown props, `width`, `height` and `children` are type errors, and `color` accepts a list.

### Coverage

- Provider is `@vitest/coverage-v8`, which also works in Chromium browser mode. Reporters: `text` and `lcov`. Only `src/` counts, so the `dist` tests don't skew it.
- Thresholds are checked by each package's `test` task. It runs all of the package's projects in one Vitest run, so the engine (covered by browser tests) and the physics (covered by unit tests) count together. CI fails below:
  - core: ≥ 90% lines and functions, ≥ 85% branches
  - react: ≥ 90% lines

### CI

1. Install Chromium once with `pnpm exec playwright install --with-deps chromium`, cached by Playwright version.
2. Run `pnpm verify`: `pnpm lint`, then `turbo run typecheck test build size`.
3. Upload the coverage report as a build artifact.

### Rules

- A milestone is done only when its features are covered by tests and CI is green.
- A bug fix starts with a failing test that reproduces the bug.
- Tests never depend on wall-clock time or `Math.random`. They use `seed` and the injectable clock (§5).
- The playground is for manual tuning only. It doesn't replace tests.

### Check during M0

- **Vitest typecheck with TypeScript 7.** TS 7 still ships a `tsc` binary; confirm that Vitest runs it and parses its output. `typecheck.checker` accepts a custom binary if the default lookup fails.
- **publint and attw check the packed package.** They must see `publishConfig.exports` (what pnpm publishes), not the dev `exports` that point to `src`. Also confirm that a deliberate packaging error fails `pnpm build` with `CI=true`.

### Optional, after M2

- **Screenshot regression.** Vitest 5 browser mode has `toMatchScreenshot`, and a fixed `seed` plus the clock make frames deterministic. Canvas anti-aliasing differs between macOS and Linux, so baselines would come from CI only.

---

## 9. Milestones

**Workflow.** Each milestone is one branch (`m0-scaffold`, `m1-core`, `m2-shapes`, `m3-react`, `m4-polish`, `m5-release`) and one pull request into `main`. A milestone is done when its features are implemented, covered by Vitest tests (§8), CI is green, and the owner has reviewed and merged the PR. Work stops after each milestone until then.

- **M0 · Scaffold.** Workspace, Turborepo, root scripts (§4), Biome (configured per CLAUDE.md), husky pre-commit, tsconfig, `.gitignore`, `.vscode/extensions.json`, `LICENSE` (MIT, `alexeikaratai`) in the root and in each package, README stubs, and empty `zima`, `zima-react` and `playground` that build and pass publint/attw. Test setup is included:
  - Vitest configs (the per-package projects from §8, plus the root `projects` config)
  - one smoke test per Vitest project
  - coverage thresholds
  - size-limit with the ESM budgets from §7, so `pnpm verify` guards size from the first commit
  - Playwright Chromium in CI
  - the TS 7 typecheck check
- **M1 · Core MVP.** Engine loop, the `dot` shape, all three targets (none for the page overlay, a canvas, a container), start on creation, count/density, size, speed, wind/gust, sway, rotation, opacity, color lists, parallax, `fps` cap, `seed`, resize and DPR handling, visibility pause, reduced motion, `update()`, `destroy()`. The playground gets live controls that drive `createSnow` directly. Tests: the core unit and browser suites from §8.
- **M2 · Shapes.** `star`, `crystal`, `text()`, `image()` with async loading, custom `Shape`, weighted mix, sprite cache. Tests: shape selection, sprite rebuild on `update()`, image loading, and type tests for `Shape`.
- **M3 · React.** `<Snowfall>` (with `fullscreen` and `paused`), `useSnowfall`, `"use client"`; the playground switches to `<Snowfall>`. Tests: the React, SSR, type and `dist` tests from §8.
- **M4 · Polish.** IIFE build with its smoke test and 3 KB budget, GitHub Pages demo, README for each package, and examples in `examples/`: Vite without a framework (`createSnow()`) and the Next.js App Router. The examples build in CI with the rest of the workspace. If `next build` still type-checks through the TypeScript JS API, the Next.js example takes TypeScript 6 from a named catalog.
- **M5 · Release 0.1.0.** Trusted Publishing setup (with a manual first publish if npm needs it), the repo permission for the Version Packages PR, and the first changeset release. The npm org already exists.
- **Later.**
  - `@zimaleto/zima-vue`: Vue 3 component plus a `useSnowfall` composable.
  - `@zimaleto/zima-angular`: standalone component with signals. It needs ng-packagr and the Angular Package Format, so it's built outside tsdown and wired into Turborepo as its own `build`.
  - Vue (`vue-tsc`) and Angular (`ngc`, ng-packagr) call the TypeScript JS API, which TS 7.0 doesn't ship (a new API is planned for 7.1). Until their tools support TS 7, these packages take TypeScript 6 from a named catalog.
  - Docs site, snow piling up on elements, pointer interaction, a worker renderer.

---

## 10. Decisions

All decided on 2026-11-07.

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
