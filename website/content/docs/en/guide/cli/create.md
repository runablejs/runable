---
title: runable create
description: Scaffold a new Runable project, add Runable to an existing backend, or create a Runable module.
---

Use `runable create` to configure a Runable application interactively. The
command presents the application workflows and then asks only the questions
needed for the selected workflow.

::u-code-group

```bash [pnpm]
pnpm create runable@latest
```

```bash [npm]
npm create runable@latest
```

```bash [yarn]
yarn create runable
```

```bash [bun]
bun create runable@latest
```

```bash [deno]
deno -A npm:create-runable@latest
```

::

If `@runablejs/cli` is already installed in the project, the equivalent command
is:

```bash
runable create
```

## Create an application

Running the command without an option presents two choices:

- **Add to an existing project** — wires Runable into a backend project you already have.
- **Start with a starter** — scaffolds a new project from a full starter template.

The module workflow is intentionally not included in this prompt. Use the
dedicated `--module` option when authoring a reusable module.

::u-tip
---
variant: warning
title: Starter templates
---

The starter option is present in the menu, but no starter templates are currently bundled with the CLI. Use "Add to an existing project" if you're starting fresh with one of the supported backends.

::

## Create a Runable module

Pass `--module` to skip the application selector and start the module
scaffolder directly:

::u-code-group

```bash [pnpm]
pnpm create runable@latest --module
```

```bash [npm]
npm create runable@latest -- --module
```

```bash [yarn]
yarn create runable --module
```

```bash [bun]
bun create runable@latest --module
```

```bash [deno]
deno -A npm:create-runable@latest --module
```

::

With a locally installed CLI, run `runable create --module`.

The module workflow asks for:

1. **Module name** — a valid lowercase npm package name, optionally scoped.
2. **Config key** — the property consumers use in `runable.config.ts`; it defaults to the module name.
3. **Directories** — `appDir`, `outputDir`, `distDir`, and `publicDir`.
4. **Package manager** — detected from the current project when possible.
5. **Install dependencies now?**

It creates a **new directory** named after the module. The generated package
contains the application template, `AGENTS.md`, a publishable `package.json`,
and a `runable.config.ts` defined with `defineModule()` instead of
`defineConfig()`.

See <a href="/docs/guide/modules.md">Modules</a> for the module API and
authoring conventions.

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
