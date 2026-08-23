---
name: runable-project
description: Understand, inspect, and safely modify a Runable application. Use when working in a project that uses Runable, runable.config.ts, the app directory, generated .app files, or Runable's backend integration.
---

# Runable Project

Use this skill when working in an existing Runable application or when you need to understand its project structure before making changes.

Runable adds a structured Vue application to an existing backend. The backend remains responsible for HTTP, API routes, authentication, application logic, and server startup. Runable prepares and renders the Vue application.

## Mental model

Keep these responsibilities separate:

- The backend owns HTTP and application server lifecycle.
- Runable owns Vue application assembly and framework conventions.
- Vue owns the user interface.

Do not restructure the backend as if Runable provided its own HTTP runtime.

Do not assume that a Runable API behaves like a similarly named Nuxt API. Verify Runable APIs before reusing Nuxt patterns.

## Inspect before modifying

Before making changes:

1. Read `runable.config.ts` if it exists.
2. Read `package.json` and identify the available project scripts.
3. Inspect the existing application directories instead of assuming the default structure.
4. Identify the backend or HTTP runtime used by the project.
5. Check existing conventions in nearby files before creating new ones.
6. Read `AGENTS.md` when present and follow repository-specific instructions.

Configuration can relocate Runable conventions, so do not assume that every project uses the default `app/` paths.

## Default project structure

Unless overridden by `runable.config.ts`, common locations are:

```text
app/
├── pages/
├── layouts/
├── components/
├── composables/
├── globals/
├── plugins/
├── middlewares/
├── css/
├── app.vue
└── error.vue

public/
modules/
runable.config.ts
```

The backend entry point is application-specific. It may be `server.ts`, `main.ts`, an AdonisJS route file, a Bun or Deno entry point, or another server-specific location.

## Generated files

Treat these directories as generated output by default:

```text
.app/
.output/
```

Never edit generated files to implement an application change.

`.app/` contains generated types, registries, and framework files used during development and type checking.

`.output/` contains the production build.

When generated output is incorrect, modify the source file, configuration, module, or framework input that produces it, then regenerate the output.

## Configuration

`runable.config.ts` is the main Runable configuration file.

Inspect it before assuming directory locations or framework behavior.

Common defaults include:

```ts
export default defineConfig({
  appDir: "app",
  output: ".app",
  distdir: ".output",
  publicDir: "public",
  ssr: true,
});
```

Directory options such as `pages`, `layouts`, `components`, `composables`, `globals`, `middlewares`, and `plugins` can replace their conventional locations.

Do not duplicate configuration that Runable already derives automatically.

## Backend ownership

Runable does not start or replace the application's backend server.

Typical architecture:

```text
HTTP request
    |
    v
Backend
    |----> API routes and application logic
    |
    `----> Runable adapter/fallback
                |
                `----> Vue application
```

Preserve existing backend routes, middleware, authentication, dependency injection, observability, and server lifecycle.

When modifying server integration, determine which Runable adapter is actually used before changing the integration.

## Source versus generated code

Prefer modifying:

```text
app/
modules/
runable.config.ts
backend source files
package.json
```

Do not directly modify:

```text
.app/
.output/
node_modules/
```

unless the user explicitly asks to inspect generated output for debugging.

Inspection of generated files is allowed when diagnosing framework behavior. Treat them as evidence, not as the source to patch.

## Package and command handling

Do not assume project scripts.

Read `package.json` first and use the commands provided by the project. There is no `runable dev` command — Runable only ships `create`, `prepare`, and `build`; a project's own dev command runs its backend directly (often via a tool like `tsx`).

When `.app/` needs to be regenerated, use the project's Runable preparation command or the equivalent `runable prepare` command.

When validating a production build, use the project's build script rather than inventing one.

Respect the package manager already used by the project and its lockfile.

## TypeScript

Runable generates application TypeScript declarations under `.app/`.

Do not copy generated aliases, declarations, or include patterns into project configuration unless the project genuinely needs an override.

Run the preparation step before type checking when generated declarations are missing or stale.

Keep frontend and backend TypeScript environments separated when the project already does so.

## Safe modification workflow

For any non-trivial Runable change:

1. Inspect the relevant configuration and existing files.
2. Determine whether the change belongs to the Vue application, backend, or Runable configuration.
3. Modify source files only.
4. Regenerate framework output when required.
5. Run the most relevant existing checks from `package.json`.
6. Inspect errors before changing unrelated configuration.
7. Keep the change scoped to the user's request.

Do not perform broad framework migrations or restructure the backend unless explicitly requested.

## When more specialized knowledge is needed

Use a more specific Runable skill when available for:

- pages, routing, layouts, and navigation middleware;
- SSR-aware data loading and HTTP requests;
- plugins, modules, and auto-imports;
- Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno, or custom server integration.

When exact Runable API behavior matters, consult the Runable documentation rather than inferring behavior from Nuxt or another Vue framework.
