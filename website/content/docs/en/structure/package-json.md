---
title: package.json
description: Declare scripts, dependencies, and runtime constraints for a Syora project.
---

`package.json` describes the project and commands used in development or production.

```json
{
  "name": "my-syora-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "app:prepare": "syora prepare",
    "app:build": "syora build",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@syora/core": "latest",
    "express": "latest",
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "@syora/cli": "latest",
    "@types/express": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vue-tsc": "latest"
  }
}
```

Keep `@syora/core`, Vue, and the backend in `dependencies`: they are needed at runtime. Types, the CLI, and checking tools generally belong in `devDependencies`.

The `"type": "module"` field enables ES modules in `server.ts` and `syora.config.ts`.
