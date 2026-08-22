---
title: node_modules
description: Manage dependencies installed by the package manager.
---

The package manager creates `node_modules/` from `package.json` and the lockfile. Runable, Vue, Vite, and the selected backend are installed there.

Never edit a file in this directory. Add or update the relevant dependency, then reinstall:

```bash
pnpm install
```

Frameworks supported by Runable adapters are dependencies of the consuming project. For example, an application that calls `express()` installs `express`, while a Hono application installs `hono`.

Always add `node_modules/` to `.gitignore`. Commit `package.json` and the lockfile instead to get reproducible installations.
