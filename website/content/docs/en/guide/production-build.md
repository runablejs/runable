---
title: Production build
description: Generate client and server bundles, then run Runable without a Vite server.
---

The production build generates the client and, when SSR is enabled, a server bundle. Runable then uses these files without starting the Vite development server.

::u-tip
---
variant: info
title: Simpler equivalent
---

<a href="/docs/guide/cli/build.md">`runable build`</a> runs this same `loadConfig()` + `buildProduction()` sequence for you. Write your own build script, as shown below, only when you need to run other steps around it.

::

## Create the build script

```ts
// scripts/build.ts
import { buildProduction, loadConfig } from "runable";

await loadConfig();
await buildProduction();
```

Add project commands:

```json
{
  "scripts": {
    "build": "tsx scripts/build.ts",
    "start": "NODE_ENV=production tsx server.ts"
  }
}
```

Install `tsx` as a development dependency when your server and script remain in TypeScript.

## Understand the output

With the default `distdir`, Runable writes to `.output/`:

```text
.output/
├── client/
│   ├── index.html
│   └── assets/
├── server/          # present when ssr: true
└── manifest.js
```

`manifest.js` connects the Runable server to the client template and compiled SSR entry point.

## Start the existing server

Your `server.ts` does not change:

```ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

server.use(express());
server.listen(Number(process.env.PORT ?? 3000));
```

With `NODE_ENV=production`, the adapter loads configuration but does not create a Vite server. It renders the application from `.output`.

## Prepare deployment

Copy into the production environment:

- `.output/`;
- the server and its runtime dependencies;
- `runable.config.ts` or its compiled version;
- required environment variables.

Always test the startup command with `NODE_ENV=production` before deployment.

::u-tip
---
variant: warning
title: Build before startup
---

The production server expects `.output/manifest.js`. If it is missing, run the build or check `distdir`.

::
