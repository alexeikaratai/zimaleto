# zimaleto — Project Plan

> Tiny, zero-dependency canvas snowfall. Framework-agnostic TypeScript core + thin framework wrappers (React first; Vue and Angular later).

Status: **planning** · Last updated: 2026-11-07 · Repo: [alexeikaratai/zimaleto](https://github.com/alexeikaratai/zimaleto) · npm: `@zimaleto/*`

---

## 1. Goals

- **Tiny core.** `@zimaleto/zima`: zero dependencies, SSR-safe, tree-shakeable, **≤ 2 KB min+brotli**.
- **Thin wrappers.** `@zimaleto/zima-react` adds **≤ 500 B** on top of core. Vue/Angular follow the same pattern later.
- **Configurable flakes.** Count/density, size, fall speed, wind and gusts, sway, rotation, opacity, color, shape variants (built-in and custom), parallax.
- **Well-behaved.** Respects `prefers-reduced-motion`, pauses when the tab or canvas is hidden, handles HiDPI, uses `pointer-events: none`, never touches layout.

### Not in v1 (backlog)

Snow piling up on elements, mouse/scroll interaction, a WebGL renderer, rendering in a worker via OffscreenCanvas, a `<zimaleto-snow>` web component.

---

## 2. Tech stack

Versions checked against the npm registry on 2026-11-07. All peer ranges are compatible.

| Area | Tool | Version | Notes |
|---|---|---|---|
| Runtime (dev) | Node via nvm | **26.13.0 LTS** | `.nvmrc` = `26` |
| Package manager | pnpm workspaces | 12.18.x | `packageManager` field pins it; `catalog:` keeps shared versions in one place |
| Monorepo orchestration | Turborepo | 2.11.x | task graph + local cache |
| Language | TypeScript | 7.0.x | native compiler; used for type-checking only |
| Library build | tsdown (Rolldown) | 0.23.x | supports TS 7; declarations generated via `isolatedDeclarations` (oxc) |
| UI | React / React DOM | 19.3.x | wrapper peer: `^19` |
| Playground | Vite + @vitejs/plugin-react | 8.3.x / 6.2.x | |
| Tests | **Vitest** | 5.1.x | single test runner for every package; see §8 |
| Tests: coverage | @vitest/coverage-v8 | 5.1.x | thresholds enforced in CI |
| Tests: real browser | @vitest/browser-playwright + Playwright (Chromium) | 5.1.x / 1.65.x | real canvas, observers, rAF |
| Tests: DOM / React | happy-dom + @testing-library/react | 21.0.x / 16.3.x | React wrapper tests |
| Lint + format | Biome | 2.6.x | one tool, run from the root |
| Size budget | size-limit + preset-small-lib | 14.3.x | fails CI if a budget is exceeded |
| Package checks | publint + @arethetypeswrong | 0.3.x / 0.18.x | run by tsdown (`publint: true, attw: true`) |
| Releases | Changesets | 3.0.x | GitHub Action + npm Trusted Publishing (OIDC, provenance) |

---

## 3. Repository layout

```
zimaleto/
├─ .nvmrc                      # 26
├─ .npmrc                      # registry=https://registry.npmjs.org/ (pinned per project)
├─ package.json                # private root; packageManager, engines.node >=26 (root only)
├─ pnpm-workspace.yaml         # packages/*, apps/*, catalog
├─ turbo.json
├─ biome.json
├─ tsconfig.base.json
├─ vitest.config.ts            # root: test.projects → one watch UI + merged coverage locally
├─ .changeset/
├─ .github/workflows/
│  ├─ ci.yml                   # lint · typecheck · test · build · size
│  └─ release.yml              # changesets/action → npm publish (OIDC)
├─ packages/
│  ├─ zima/                    # @zimaleto/zima (core)
│  │  ├─ src/
│  │  │  ├─ index.ts           # public API
│  │  │  ├─ engine.ts          # createSnow(): loop, lifecycle, observers
│  │  │  ├─ engine.browser.test.ts
│  │  │  ├─ physics.ts         # pure step(): no DOM, unit-testable
│  │  │  ├─ physics.test.ts
│  │  │  ├─ options.ts         # defaults + normalization
│  │  │  ├─ options.test.ts
│  │  │  ├─ sprites.ts         # pre-rendered flake sprites
│  │  │  ├─ random.ts          # mulberry32 seeded RNG
│  │  │  ├─ random.test.ts
│  │  │  ├─ api.test-d.ts      # type tests for the public API
│  │  │  └─ shapes/            # dot, star, crystal, text, image (separate exports)
│  │  ├─ vitest.config.ts      # projects: unit (node) + browser (Chromium)
│  │  └─ tsdown.config.ts
│  └─ zima-react/             # @zimaleto/zima-react
│     ├─ src/
│     │  ├─ index.ts
│     │  ├─ Snowfall.tsx
│     │  ├─ Snowfall.test.tsx
│     │  ├─ useSnowfall.ts
│     │  └─ useSnowfall.test.tsx
│     └─ vitest.config.ts      # environment: happy-dom
└─ apps/
   └─ playground/              # Vite + React app with live option controls
```

Later: `packages/zima-vue`, `packages/zima-angular`, `apps/docs`.

---

## 4. Tooling details

- **Node version lives in the root only.** The root `package.json` sets `engines.node: ">=26"` for contributors. Published packages run in browsers, so they don't declare a Node engine.
- **Develop against source, publish `dist`.** In the repo, each package's `exports` points to `./src/index.ts`, so the playground and tests use live source with HMR and nothing needs a watch build. `publishConfig.exports` (which pnpm swaps in at pack time) points to `dist/`.
- **`pnpm-workspace.yaml` catalog** pins `react`, `react-dom`, `typescript`, `vite`, `vitest`. Packages refer to them as `"catalog:"`. Internal dependencies use `"workspace:^"`.
- **`turbo.json` tasks:**
  - `build`: `dependsOn: ["^build"]`, `outputs: ["dist/**"]`
  - `typecheck`: cached, no outputs
  - `test`: cached, `outputs: ["coverage/**"]`; also `test:browser` (Playwright) as a separate task so it can be skipped locally
  - `size`: `dependsOn: ["build"]`
  - `dev`: `cache: false`, `persistent: true`
  - Lint runs once at the root (`biome check .`) because it's faster than splitting it per package.
- **`tsconfig.base.json`:** `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `strict`, `noUncheckedIndexedAccess`, `isolatedDeclarations`, `verbatimModuleSyntax`, `jsx: react-jsx`, `noEmit` (tsdown does the emitting), `lib: [ES2022, DOM, DOM.Iterable]`.
- **Browser target:** ES2022 output, which covers evergreen browsers from roughly 2022 on. No polyfills.

---

## 5. Core API (`@zimaleto/zima`)

```ts
import { createSnow, dot, crystal } from '@zimaleto/zima'

const snow = createSnow(target, {      // target: HTMLCanvasElement | HTMLElement (creates a canvas inside)
  count: 200,
  size: [2, 6],
  wind: 15,
  gust: 25,
  shapes: [dot, { shape: crystal, weight: 0.3 }],
})

snow.start()
snow.stop()
snow.update({ wind: -20 })             // live change, no re-creation
snow.destroy()                         // stops the loop, disconnects observers, removes the canvas it created
```

### Options

`Range = number | [min, max]`. Each flake picks a random value inside the range.

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
| `color` | `string` | `'#fff'` | |
| `shapes` | `Shape \| Array<Shape \| { shape, weight }>` | `[dot]` | Shape variants, optionally weighted. |
| `parallax` | `boolean` | `true` | Bigger flakes fall faster and are more opaque, which gives a sense of depth. |
| `fps` | `number` | — | Frame-rate cap. Unset means the display refresh rate. |
| `maxDpr` | `number` | `2` | Upper limit on devicePixelRatio, to protect performance. |
| `reducedMotion` | `'static' \| 'reduce' \| 'ignore'` | `'static'` | With `static`, the engine draws one frame and stops. With `reduce`, it shows fewer and slower flakes. |
| `pauseWhenHidden` | `boolean` | `true` | Pauses on tab hidden (`visibilitychange`) and when the canvas is off-screen (`IntersectionObserver`). |
| `seed` | `number` | — | Seeds the RNG so runs are reproducible (tests, screenshots). |

### Shapes

```ts
type Shape = (ctx: CanvasRenderingContext2D, r: number) => void   // draw centered at (0,0), radius r
```

- Built-ins are named exports, so unused ones are tree-shaken: `dot`, `star`, `crystal` (six arms).
- Helpers: `text('❄')` for emoji or glyph flakes, and `image(src)` for a bitmap flake.
- A custom shape is any function with the `Shape` signature.

### Engine internals

- **One `requestAnimationFrame` loop** with physics based on `dt`, so speed doesn't depend on frame rate. `dt` is clamped to 50 ms to avoid jumps after the tab was hidden.
- **Pure physics.** `step(flakes, dt, env)` mutates plain state and has no DOM access, so it can be unit-tested without a canvas.
- **Injectable clock (internal).** The loop gets its time source and scheduler (`now`, `requestFrame`, `cancelFrame`) from an internal parameter. Tests advance frames by hand, so they're deterministic and don't need fake rAF timers.
- **Flake pool.** A fixed array of plain objects. Flakes that leave the screen are respawned at the top instead of allocating new ones, so there's no GC churn. Flakes wrap horizontally when wind pushes them sideways.
- **Sprites.** Each `(shape × color)` pair is rendered once to an offscreen canvas at max size × DPR. Each frame then calls `drawImage` with `setTransform` (translate, rotate, scale), which is much cheaper than drawing paths for every flake.
- **Wind gusts** are a cheap smooth noise: a sum of two sines with incommensurate frequencies.
- **Resize.** A `ResizeObserver` sets the canvas backing store to CSS size × `min(devicePixelRatio, maxDpr)`.
- **SSR safety.** Nothing touches `window` or `document` when the module is imported; all DOM access happens inside `createSnow()`.

---

## 6. React wrapper (`@zimaleto/zima-react`)

```tsx
import { Snowfall, crystal } from '@zimaleto/zima-react'

<Snowfall fullscreen count={200} wind={15} shapes={[crystal]} />

// or bring your own canvas
const ref = useRef<HTMLCanvasElement>(null)
useSnowfall(ref, { density: 0.5 })
return <canvas ref={ref} />
```

- **React 19 only** (`peerDependencies.react: "^19"`), using `ref` as a prop with no `forwardRef`.
- **`'use client'`** is kept at the top of the build output, so it works in the Next.js App Router out of the box.
- **Lifecycle.** The instance is created in `useEffect` and destroyed in cleanup, which is safe under StrictMode's double mount. Prop changes go to `instance.update()`; the instance is never re-created on re-render.
- **Props** are all core options, plus `fullscreen?: boolean`, plus canvas attributes (`className`, `style`, `aria-hidden` defaults to `true`).
  - Default layout fills the parent: `position: absolute; inset: 0`.
  - `fullscreen` gives an overlay: `position: fixed; inset: 0; pointer-events: none; z-index`.
- **`@zimaleto/zima` is a regular dependency** (`workspace:^`), not bundled in, so it's never duplicated. Core's shapes and types are re-exported, so users need only one package.

---

## 7. Package shape and release

- **ESM-only** (`"type": "module"`), `sideEffects: false`, `files: ["dist"]`, types in `exports`.
- **Core also ships `dist/zimaleto.iife.js`** for `<script>` and CDN use (unpkg, jsDelivr), exposing `window.Zimaleto`.
- **Size budgets** (size-limit, enforced in CI):
  - `@zimaleto/zima`: ≤ 2 KB brotli
  - `@zimaleto/zima-react`, excluding core: ≤ 500 B brotli
- **Versioning.** Changesets in **fixed** mode for `@zimaleto/*` while on 0.x. One version for all packages is simpler for users.
- **Publishing.** `changesets/action` opens a "Version Packages" PR. Merging it publishes via **npm Trusted Publishing** (GitHub OIDC), which adds provenance and needs no long-lived `NPM_TOKEN`.

---

## 8. Testing (Vitest)

Vitest is the only test runner. Each package has its own `vitest.config.ts`.

- **CI:** `turbo run test` runs each package's tests with per-package caching.
- **Locally:** the root `vitest.config.ts` lists all packages under `test.projects`. That gives one watch session (and `--ui`) across the repo, plus a merged coverage report.

### File conventions

Test files sit next to the source they test.

| Pattern | Runs in | Used for |
|---|---|---|
| `*.test.ts(x)` | Node (core) or happy-dom (react) | unit tests, the bulk of the suite |
| `*.browser.test.ts` | real Chromium via `@vitest/browser-playwright` | anything that needs a real canvas, observers or rAF |
| `*.ssr.test.tsx` | Node (`// @vitest-environment node`) | server rendering |
| `*.test-d.ts` | Vitest typecheck (`expectTypeOf`) | types of the public API |

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
- **Options**
  - Defaults are applied.
  - Both `number` and `[min, max]` ranges work.
  - Bad input (negative count, min > max) is normalized.
  - `density` converts to a count based on area.
  - `parallax` maps size to speed and opacity monotonically.
- **RNG**
  - The same `seed` gives an identical sequence.
  - Values fall in [0, 1).
- **Shapes:** with a fixed seed, weighted selection follows the weights.

### `@zimaleto/zima`: browser tests (Chromium)

- **Creation**
  - `createSnow` works on a canvas and on a container.
  - With a container, it creates its own canvas and removes it on `destroy()`.
- **Drawing:** after a few frames the canvas has non-transparent pixels. With `count: 0` it stays empty.
- **Resize:** when the container size changes, the backing store becomes CSS size × `min(dpr, maxDpr)`.
- **Lifecycle**
  - No frames are drawn after `stop()` or `destroy()`.
  - Observers are disconnected.
  - Calling `destroy()` twice is safe.
- **`pauseWhenHidden`:** the loop pauses when the canvas scrolls off-screen.
- **`reducedMotion`:** with `matchMedia` stubbed to `reduce`, `'static'` draws exactly one frame.
- **`update()`:** changing `color` or `shapes` rebuilds sprites; changing `wind` doesn't.

### `@zimaleto/zima-react`: happy-dom + Testing Library

Core is mocked with `vi.mock`.

- **Instance lifecycle**
  - `<Snowfall>` creates exactly one instance on mount and destroys it on unmount.
  - Under `<StrictMode>`, exactly one live instance remains after the double effect.
- **Prop changes:** they call `instance.update()` with the new options and never re-create the instance.
- **Layout and attributes**
  - `fullscreen` applies fixed overlay styles; the default fills the parent.
  - `aria-hidden="true"` is set.
  - `className` and `style` pass through.
- **`useSnowfall(ref)`:** works with a canvas the user owns. A `null` ref is a no-op.
- **SSR:** `renderToString(<Snowfall />)` returns a `<canvas>` and never touches `window`. This lives in the `*.ssr.test.tsx` file.

### Type tests

- `Range` accepts `number` and `[number, number]`, and rejects `[number]`.
- Custom functions that match `Shape` are accepted.
- `<Snowfall>` props are core options plus canvas attributes; unknown props are type errors.

### Coverage

- Provider is `@vitest/coverage-v8`, which also works in Chromium browser mode. Reporters: `text` and `lcov`.
- Thresholds; CI fails below them:
  - core: ≥ 90% lines and functions, ≥ 85% branches
  - react: ≥ 90% lines

### Scripts

| Command | Does |
|---|---|
| `pnpm test` | `turbo run test`: unit, react and type tests (cached) |
| `pnpm test:browser` | `turbo run test:browser`: Chromium tests |
| `pnpm test:watch` | root `vitest` in watch mode across all projects |
| `pnpm test:ui` | `vitest --ui` |
| `pnpm coverage` | `vitest run --coverage` at the root, merged report |

### CI

1. Install Chromium once with `pnpm exec playwright install --with-deps chromium`, cached by Playwright version.
2. Run `turbo run lint typecheck test test:browser build size`.
3. Upload the coverage report as a build artifact.

### Rules

- A milestone is done only when its features are covered by tests and CI is green.
- A bug fix starts with a failing test that reproduces the bug.
- Tests never depend on wall-clock time or `Math.random`. They use `seed` and the injectable clock (§5).
- The playground is for manual tuning only. It doesn't replace tests.

### Check during M0

- **Vitest typecheck with TypeScript 7.** `typecheck.checker` accepts a custom binary, so if the default `tsc` lookup fails, point it at TS 7's compiler.
- **Optional, after M2: screenshot regression.** Vitest 5 browser mode has `toMatchScreenshot`, and a fixed `seed` plus the clock make frames deterministic. Canvas anti-aliasing differs between macOS and Linux, so baselines would come from CI only.

---

## 9. Milestones

A milestone is done when its features are implemented, covered by Vitest tests (§8), and CI is green.

- **M0 · Scaffold.** git, workspace, Turborepo, Biome, tsconfig, empty `zima`, `zima-react` and `playground` that build and pass publint/attw. Test setup is included:
  - Vitest configs (unit, browser and happy-dom projects, plus the root `projects` config)
  - one smoke test per package
  - coverage thresholds
  - Playwright Chromium in CI
  - the TS 7 typecheck check
- **M1 · Core MVP.** Engine loop, the `dot` shape, count/density, size, speed, wind/gust, sway, rotation, opacity, color, parallax, resize and DPR handling, visibility pause, reduced motion, `update()`, `destroy()`. Tests: the core unit and browser suites from §8.
- **M2 · Shapes.** `star`, `crystal`, `text()`, `image()`, custom `Shape`, weighted mix, sprite cache. Tests: shape selection, sprite rebuild on `update()`, and type tests for `Shape`.
- **M3 · React.** `<Snowfall>`, `useSnowfall`, `'use client'`, and a playground with live controls. Tests: the React, SSR and type tests from §8.
- **M4 · Polish.** Size budgets enforced, IIFE build, README for each package, examples (Vite, Next.js).
- **M5 · Release 0.1.0.** npm org, Trusted Publishing setup, first changeset release.
- **Later.**
  - `@zimaleto/zima-vue`: Vue 3 component plus a `useSnowfall` composable.
  - `@zimaleto/zima-angular`: standalone component with signals. It needs ng-packagr and the Angular Package Format, so it's built outside tsdown and wired into Turborepo as its own `build`.
  - Docs site, snow piling up on elements, pointer interaction, a worker renderer.

---

## 10. Decisions

All decided on 2026-11-07.

| Topic | Decision |
|---|---|
| Name | **zimaleto** is the umbrella: npm org, repo, folder, README, CDN global `Zimaleto`. The npm org name `zima` was unavailable. Packages keep the **zima** name: `@zimaleto/zima` is the core, and wrappers are `@zimaleto/zima-<framework>`. |
| npm | Org `zimaleto` (owner `alex.karatai`). Packages: `@zimaleto/zima`, `@zimaleto/zima-react`, later `@zimaleto/zima-vue` and `@zimaleto/zima-angular`. |
| Git hosting | Public GitHub repo [alexeikaratai/zimaleto](https://github.com/alexeikaratai/zimaleto). It has to be public for npm provenance. |
| License | MIT |
| `reducedMotion` default | `'static'`: draw one frame, then stop. |
| `<Snowfall>` layout | Fills its parent by default; the `fullscreen` prop turns it into a fixed overlay. |
| Node | 26 LTS via nvm (`.nvmrc`) |
| Tests | Vitest only (§8) |
