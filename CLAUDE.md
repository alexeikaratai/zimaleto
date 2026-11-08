# CLAUDE.md

Guidance for Claude Code in this repository.

Read [PLAN.md](PLAN.md) before starting any task. It holds the architecture, the public API, the test strategy, the milestones and every decision made so far. If a task conflicts with the plan, ask before deviating, and update the plan when a decision changes.

## Project

`zimaleto` is a pnpm + Turborepo monorepo for **zima**, a tiny canvas snowfall library.

| Path | Package | What |
|---|---|---|
| `packages/zima` | `@zimaleto/zima` | Framework-agnostic core: zero dependencies, ≤ 2.5 KB brotli |
| `packages/zima-react` | `@zimaleto/zima-react` | React 19 wrapper, ≤ 650 B on top of the core |
| `apps/playground` | — | Vite + React app for manual tuning, deployed to GitHub Pages |

Vue and Angular wrappers come later as their own packages: `@zimaleto/zima-vue` and `@zimaleto/zima-angular`.

## Workflow

- One branch and one pull request per milestone (`m0-scaffold`, `m1-core`, …), opened against `main`. Stop after each milestone: the owner reviews and merges.
- `main` is protected: changes land only through pull requests with green CI. Never push to `main` or rewrite its history.
- A milestone is done when its features are covered by tests and CI is green.
- Before finishing any change, run `pnpm lint:fix && pnpm verify`. `verify` runs the same checks as CI: lint, typecheck, tests, build and size. The browser tests need Chromium, installed once with `pnpm exec playwright install chromium`.
- Dependencies: add the latest version from the public npm registry (`npm view <package> version`). Don't copy versions from other projects. The repo's `.npmrc` pins the registry.
- Keep the size budgets (`pnpm size`). Never raise a budget without asking.

## Commits and pull requests

- Format: `type(scope): subject`. Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`. The scope is the package or app (`zima`, `zima-react`, `playground`); leave it out for repo-wide changes.
- Subject: imperative mood, lowercase, no trailing period, no emoji. Example: `feat(zima): add wind gusts`.
- PR titles use the same format, because pull requests are squash-merged and the title becomes the commit subject on `main`. The description says briefly what changed and why.
- **No AI attribution anywhere:** no `Co-Authored-By` trailers, no "Generated with …" lines in PRs, no AI annotations in code.
- After the first release, every user-facing change gets a changeset (`pnpm changeset`).

## Code style

Biome is the only formatter and linter: no Prettier, no ESLint. The settings live in `biome.json`: 4-space indent, 120 columns, double quotes, semicolons, multiline JSX attributes, imports organized by Biome. A husky pre-commit hook runs Biome on staged files.

### TypeScript

- `strict` mode. No `any`: use `unknown` and narrow it.
- `type`, not `interface`. `as const` objects, not `enum`.
- Name types instead of inlining object types in parameters or generic arguments.
- Exported functions and constants have explicit types, because `isolatedDeclarations` requires them.
- No file extensions in import paths (`./engine`, not `./engine.ts`). Type-only imports use `import type`.
- Named exports only. Config files that require a default export are the only exception.
- No single-letter names, including callbacks and loops (`index`, not `i`). The coordinates `x` and `y` are the exception.
- No commented-out code; git keeps the history.

### Naming

- Booleans start with `is`, `has`, `can` or `should` and read positively (`isVisible`, not `isNotHidden`). Public option and prop names are the exception and follow web-platform style: `parallax`, `fullscreen`, `paused`.
- Event handlers are `handleThing`, callback props `onThing`, module-level constants `UPPER_SNAKE_CASE`, functions `camelCase`.
- Files: components `PascalCase.tsx`, hooks `useThing.ts`, everything else `camelCase.ts`.

### React

- Components are function declarations with props destructured in the signature: `export function Snowfall({ fullscreen, paused, ...rest }: SnowfallProps)`.
- The props type is named `<Component>Props` and lives in the component's file.
- Give non-trivial effects a named function: `useEffect(function syncOptions() { … }, [deps])`.
- Use `useMemo` and `useCallback` only where they pay off.
- Move compound conditions and computed values into named variables before `return`. Leave an empty line before `return` unless the body is a single expression.

### Comments

- Default to no comments. Write one only to explain why: a workaround, an ordering constraint, a magic number, a link to a spec.
- If a name needs a comment, rename it instead.
- The public API (exported functions and option fields) gets JSDoc, because users read it in their IDE.

### Tests

- Vitest only. Tests live in a `__tests__/` folder next to the code: `physics.test.ts`, `engine.browser.test.ts`, `Snowfall.ssr.test.tsx`, `api.test-d.ts`, and `iife.dist.test.ts` for checks of the built files.
- `describe` + `test`, Arrange → Act → Assert, one behavior per test.
- Test branching, math, edge cases and invalid input. Skip tests that only restate the implementation.
- No wall-clock time or `Math.random` in tests: use `seed` and the injectable clock.
- `vi.mock` goes at file scope, and mocks are restored after each test.
- A bug fix starts with a failing test.

## Constraints

- The core has zero runtime dependencies and is SSR-safe: nothing touches `window` or `document` at import time.
- Wrappers depend on the core as a regular dependency and re-export its shapes and types. They never bundle it.
