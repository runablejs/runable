---
title: .app
description: Understand the types, registries, and virtual files prepared by Runable.
---

Runable turns conventions into code and TypeScript declarations in `.app/`. The `runable prepare` command creates this directory; the development server then keeps it up to date.

Depending on the features used, it may contain:

```text
.app/
├── components.d.ts
├── globals.d.ts
├── layouts.d.ts
├── modules-options.d.ts
├── plugins.d.ts
├── router.d.ts
├── runtime.d.ts
└── tsconfig.app.json
```

These files tell TypeScript and your editor which components, functions, routes, layouts, and injections are available without manual imports.

## Prepare types

```bash
pnpm app:prepare
```

Run this command after installing the project and in CI before type checking when `.app/` does not exist yet.

The internal `#build` alias points to this directory. It lets the runtime and extensions reference generated files without depending on the configured `output` name.

::u-tip
---
variant: warning
title: Ephemeral directory
---

Do not place application code in `.app/` or edit its declarations manually. The next generation would overwrite your changes.

::
