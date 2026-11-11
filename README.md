# zimaleto

Tiny, zero-dependency canvas snowfall for the web. [Live demo](https://alexeikaratai.github.io/zimaleto/)

| Package | What |
|---|---|
| [`@zimaleto/zima`](packages/zima) | Framework-agnostic core: zero dependencies, ≤ 2.5 KB brotli, plus a `<script>` build |
| [`@zimaleto/zima-react`](packages/zima-react) | React 19 wrapper, ≤ 650 B on top of the core |

Examples: [Vite without a framework](examples/vanilla) and [the Next.js App Router](examples/nextjs). The demo is the [playground](apps/playground), deployed from `main`.

## Development

You need Node 26 (`nvm install` reads `.nvmrc`) and pnpm 12.

```sh
pnpm install
pnpm exec playwright install chromium
pnpm verify
```

`pnpm verify` runs the same checks as CI: lint, typecheck, tests, build and size. The roadmap is in [PLAN.md](PLAN.md), and the working rules and code style are in [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)
