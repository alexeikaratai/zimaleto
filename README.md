# zimaleto

Tiny, zero-dependency canvas snowfall for the web. Work in progress: nothing is published yet.

| Package | What |
|---|---|
| [`@zimaleto/zima`](packages/zima) | Framework-agnostic core: zero dependencies, ≤ 2.5 KB brotli |
| [`@zimaleto/zima-react`](packages/zima-react) | React 19 wrapper, ≤ 500 B on top of the core |

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
