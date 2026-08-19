---
title: tsconfig.node.json
description: Type the server, Syora configuration, and scripts executed by Node.js.
---

This configuration covers `server.ts`, `syora.config.ts`, and other server-side tools.

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"]
  },
  "include": [
    "server.ts",
    "syora.config.ts",
    "scripts/**/*.ts"
  ]
}
```

Install `@types/node` to type `process`, paths, the file system, and other Node.js APIs.

If your server uses Bun or Deno, replace types and resolution options with those recommended by that runtime. The Vue application configuration remains separate in `.app/tsconfig.app.json` or the optional root file that extends it.
