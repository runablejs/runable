---
title: runable prepare
description: Regenerate .app/ — the types, routes, and auto-import registries Runable derives from your project.
---

```bash
runable prepare
```

`runable prepare` reads `runable.config.ts` and your application's conventional directories, then regenerates <a href="/docs/structure/dot-app.md">`.app/`</a>: route declarations, layout and component registries, auto-import types, and runtime configuration types.

## When to run it

- After cloning a project, or right after `runable create`, before the editor or a typecheck needs `.app/` to exist.
- After adding, removing, or renaming a page, layout, component, composable, global, middleware, or plugin — the dev server keeps `.app/` up to date automatically while it's running, but a one-off `prepare` is needed otherwise (for example in CI, before `tsc`).
- After changing `runable.config.ts`.

A generated `package.json` from <a href="/docs/guide/cli/create.md">`runable create`</a> wires this up as the `app:prepare` script.

::u-tip
---
variant: warning
title: .app/ is generated
---

Never edit files inside `.app/` directly — the next `prepare` (or the dev server) overwrites them. Fix the source file or `runable.config.ts` instead, then regenerate.

::
