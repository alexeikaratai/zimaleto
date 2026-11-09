# Security policy

## Supported versions

While zima is on 0.x, security fixes go into the latest release only.

## Reporting a vulnerability

Please report it privately through [GitHub's private vulnerability reporting](https://github.com/alexeikaratai/zimaleto/security/advisories/new), not in a public issue. Expect a first reply within a week. Once the issue is confirmed, a fix ships in a new release, and the advisory is published after that.

## How releases are protected

- **Built by CI.** This repository's CI builds every version and stages it on npm through trusted publishing, so no npm token exists to leak.
- **Provenance.** Each package carries provenance that links it to the workflow run that built it; `npm audit signatures` verifies it.
- **2FA approval.** A staged version goes live only after the maintainer approves it with 2FA on npmjs.com.
- **No runtime dependencies.** `@zimaleto/zima` has none, and `@zimaleto/zima-react` depends only on the core and its React peer.
- **Strict CSP.** The library doesn't use `eval`, `new Function` or `innerHTML`, so it runs under a strict Content Security Policy.
