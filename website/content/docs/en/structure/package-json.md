---
title: package.json
description: Declare scripts, dependencies, and runtime constraints for a Runable project.
---

`package.json` describes the project and commands used in development or production.

```json
{
  "name": "my-runable-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "app:prepare": "runable prepare",
    "app:build": "runable build",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "runable": "latest",
    "express": "latest",
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "@runablejs/cli": "latest",
    "@types/express": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vue-tsc": "latest"
  }
}
```

Keep `runable`, Vue, and the backend in `dependencies`: they are needed at runtime. Types, the CLI, and checking tools generally belong in `devDependencies`.

The `"type": "module"` field enables ES modules in `server.ts` and `runable.config.ts`.
