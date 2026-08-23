---
name: runable-configuration
description: Configure runtime environment variables, global styles, static assets, and produce a production build. Use when working with useRuntime, .env files, RUN_/VITE_ prefixed variables, runable.config.ts's css option, public/, or .output/manifest.js.
---

# Runable Configuration and Build

Use this skill when adding or reading environment variables, loading global styles or static assets, or building/deploying a Runable application.

Scope: runtime configuration, styles/assets conventions, and the production build. It does not cover the general `runable.config.ts` directory options (`pages`, `layouts`, …) — see `runable-project` for those — or backend server wiring — see `runable-integrations`.

## Runtime environment variables

Runable reads `.env` files for the active Vite mode plus `process.env`, but only keeps names prefixed with `RUN_` or `VITE_`.

```dotenv
RUN_PUBLIC_API_BASE=/api
RUN_PUBLIC_FEATURE_ENABLED=true
RUN_DATABASE_URL=postgres://localhost/acme
RUN_RETRY_COUNT=3
```

The `PUBLIC_` segment controls client exposure — **anything under `*_PUBLIC_*` ships in the client bundle and is never secret**:

| Variable | Generated access | Client | Server |
| --- | --- | --- | --- |
| `RUN_PUBLIC_API_BASE` | `runtime.public.apiBase` | Yes | Yes |
| `RUN_DATABASE_URL` | `runtime.databaseUrl` | No | Yes |

Read them with `useRuntime()`:

```ts
const runtime = useRuntime();
const apiBase = runtime.public.apiBase;

if (import.meta.server) {
  console.log(runtime.databaseUrl); // server-only, never sent to the client
}
```

Runable strips the prefix, converts the name to `camelCase`, and infers booleans/numbers/arrays/JSON/`null`/`undefined` from the raw string. Static `import.meta.env.RUN_PUBLIC_API_BASE` access is also replaced at compile time, but dynamic notation (`import.meta.env[key]`) is not — prefer `useRuntime()` when the name isn't a literal, since it also gives the `public`/private split and generated types.

Declarations are typed in `.app/runtime.d.ts`, regenerated at startup — restart the dev server after adding or renaming a variable.

## Global styles and assets

Declare globally-loaded stylesheets explicitly in `runable.config.ts` — a `css/` folder is not scanned automatically:

```ts
export default defineConfig({
  css: ["app/css/reset.css", "app/css/main.css"],
  // or scan a directory:
  // css: [{ dirs: "app/css" }],
});
```

Runable merges project and module styles, deduplicates them, and imports them into the client entry; Vite processes preprocessors/URLs. Keep component-specific styles in the component's own `<style scoped>` instead of adding them to `css`.

Static files that must keep a stable, predictable name (e.g. `robots.txt`, `favicon.svg`) go in `public/` (configurable via `publicDir`, or `publicDir: false` to disable) and are referenced from the root (`/images/logo.png`). To let Vite fingerprint/version an asset, `import` it from source instead:

```vue
<script setup lang="ts">
import logoUrl from "../assets/logo.svg";
</script>
```

## Production build

```ts
// scripts/build.ts
import { buildProduction, loadConfig } from "runable";

await loadConfig();
await buildProduction();
```

With the default `distdir`, this writes to `.output/`:

```text
.output/
├── client/
│   ├── index.html
│   └── assets/
├── server/          # present when ssr: true
└── manifest.js
```

`manifest.js` connects the running server to the built client template and (when SSR is enabled) the compiled server entry. The production server needs it — if startup fails looking for it, run the build or check the configured `distdir`.

The project's own `server.ts` (or equivalent entry point) doesn't change for production; with `NODE_ENV=production`, the Runable adapter loads configuration without starting a Vite dev server and renders from `.output` instead. Always test the production startup command locally with `NODE_ENV=production` before deploying.

Deployment needs: `.output/`, the server and its runtime dependencies, `runable.config.ts` (or its compiled form), and the required environment variables.

## Common mistakes

- Assuming a value is secret because it isn't referenced directly in a template — any `*_PUBLIC_*` variable is in the client bundle regardless of where it's used.
- Reading a freshly added/renamed env var without restarting the dev server (the `.app/runtime.d.ts` declarations are stale until then).
- Adding a `css/` directory and assuming Runable scans it like `app/pages/` or `app/components/` — it must be listed explicitly in `css`.
- Deploying without `.output/manifest.js`, or without having tested the `NODE_ENV=production` startup command first.
- Hardcoding a project's build/dev command instead of checking `package.json`'s `scripts`.

## When another skill is needed

- General `runable.config.ts` directory conventions (`pages`, `layouts`, …) and the project's overall structure: `runable-project`.
- Wiring the built application into a specific backend: `runable-integrations`.

Consult the current Runable API reference when exact behavior matters.
