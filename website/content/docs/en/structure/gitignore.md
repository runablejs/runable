---
title: .gitignore
description: Ignore dependencies, builds, generated files, and local secrets.
---

A Syora project should at least ignore its dependencies, generated output, and local variables.

```gitignore
node_modules/
.app/
.output/

.env
.env.*
!.env.example

*.log
.DS_Store
```

Adjust `.output/` and `.app/` if you changed `distdir` or `output` in `syora.config.ts`.

Commit sources, configuration, `package.json`, the lockfile, and `.env.example`. Generated directories must be reproducible with `pnpm install`, `syora prepare`, and `syora build`.
