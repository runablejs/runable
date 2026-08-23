---
title: runable build
description: Produce the production client and server bundles Runable serves from .output/.
---

```bash
runable build
```

`runable build` produces the production bundle: always the client (HTML template and hashed assets), and a server bundle too when <a href="/docs/getting-started/configuration.md">`ssr`</a> is enabled. Output goes to `distdir` — `.output/` by default — alongside a `manifest.js` connecting the running server to the built client and, for SSR, the compiled server entry.

For the full output layout, how to start a built application, and a deployment checklist, see <a href="/docs/guide/production-build.md">Production build</a> and <a href="/docs/structure/output.md">`.output/`</a> — this page only covers the command itself.

A generated `package.json` from <a href="/docs/guide/cli/create.md">`runable create`</a> wires this up as the `app:build` script.

::u-tip
---
variant: warning
title: .output/ is generated
---

Never edit files inside `.output/` directly — they're overwritten on the next build. Change the application source or `runable.config.ts`, then rebuild.

::
