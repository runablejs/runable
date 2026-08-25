---
title: CLI
description: The runable command line — scaffold, prepare, and build projects, then connect Runable to AI coding tools.
---

`@runablejs/cli` provides the `runable` command. It scaffolds a project, regenerates Runable's internal types and registries, produces a production build, installs Agent Skills, and starts the project-local MCP server.

## Commands

| Command | Purpose |
| --- | --- |
| <a href="/docs/guide/cli/create.md">`runable create`</a> | Scaffold a new Runable project, or add Runable to an existing backend |
| <a href="/docs/guide/cli/prepare.md">`runable prepare`</a> | Regenerate `.app/` — types, routes, and auto-import registries |
| <a href="/docs/guide/cli/build.md">`runable build`</a> | Produce the production client (and server, when SSR is enabled) bundle |
| <a href="/docs/guide/cli/mcp.md">`runable mcp`</a> | Start the project-local MCP server for AI coding agents |
| <a href="/docs/guide/cli/skills.md">`runable skills install`</a> | Install Runable's Agent Skills for your AI coding agent |
| <a href="/docs/guide/cli/skills.md">`runable skills list`</a> | List the Agent Skills bundled with the installed CLI version |

## What the CLI does not do

There is no `runable dev` command. Runable does not provide its own HTTP runtime — your backend (Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno, or a custom server) owns the development server, so the way you start development depends on your backend, not on Runable's CLI. A scaffolded project typically runs its own dev script (for example `tsx watch server.ts`) directly.

::u-tip
---
variant: warning
title: Don't assume a Nuxt-like workflow
---

Runable's CLI intentionally has a small surface. It doesn't manage a dev server, a plugin ecosystem, or deployment targets the way some other frameworks' CLIs do — those responsibilities stay with your backend and your own tooling.

::
