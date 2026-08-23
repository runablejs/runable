---
title: runable create
description: Scaffold a new Runable project, add Runable to an existing backend, or create a Runable module.
---

`runable create` is interactive. It asks what you want to create, then a series of questions specific to that choice.

```bash
runable create
```

## What to create

The first prompt offers three modes:

- **Add to an existing project** — wires Runable into a backend project you already have.
- **Start with a starter** — scaffolds a new project from a full starter template.
- **Create a Runable module** — scaffolds a reusable, publishable Runable module (see <a href="/docs/guide/modules.md">Modules</a>).

::u-tip
---
variant: warning
title: Starter templates
---

The starter option is present in the menu, but no starter templates are currently bundled with the CLI. Use "Add to an existing project" if you're starting fresh with one of the supported backends.

::

## Add to an existing project

Prompts, in order:

1. **Backend framework** — Express, Fastify, NestJS, AdonisJS, Hono, Koa, or "Other" (you configure the adapter yourself).
2. **Directories** — `appDir` (default `app`), `outputDir` (default `.app`), `distDir` (default `.output`), `publicDir` (default `public`). Press enter to accept the default.
3. **Server entry file** — offered only when a template exists for the selected framework (currently Express only). Declining, or picking another framework, skips this step; wire the adapter into your existing entry point manually — see <a href="/docs/integrations/index.md">Integrations</a> for your backend.
4. **Package manager** — auto-detected from a lockfile in the current directory when possible.
5. **Install dependencies now?**

This mode then:

- copies the default Vue application into `appDir` (see <a href="/docs/structure/app.md">app/</a>);
- creates `AGENTS.md` at the project root;
- generates `runable.config.ts` with the chosen directories (see <a href="/docs/structure/runable-config.md">runable.config.ts</a>);
- adds `runable`, `vue`, and `vue-router` to `dependencies`, and `@runablejs/cli` plus `app:build`/`app:prepare` scripts, into an existing `package.json` — without touching anything already declared there (see <a href="/docs/structure/package-json.md">package.json</a>);
- copies the server entry file, if requested;
- installs dependencies, if requested.

Any file that already exists (an app directory, `server.ts`, `AGENTS.md`, `runable.config.ts`) triggers an overwrite confirmation instead of being silently replaced.

## Create a Runable module

Prompts for a module name and a `configKey` (the key consumers use to configure the module in their own `runable.config.ts`), then the same directory/package-manager/install prompts as above.

This mode creates a **new** directory named after the module — it doesn't touch the current directory — containing the app template, a fresh `package.json` (with `exports`, `files: ["dist"]`, and `build`/`app:prepare` scripts), and a `runable.config.ts` built with `defineModule()` instead of `defineConfig()`.
