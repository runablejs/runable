---
title: MCP Security
description: Understand the Runable MCP trust boundary, secret handling, transport, and project code execution.
---

Runable MCP is local and read-only, but it is not a sandbox. Connect it only to projects whose configuration code you trust.

## Transport

The server communicates through `stdio` only:

- it does not start an HTTP server;
- it does not open a network port;
- it does not expose network authentication endpoints;
- stdout is reserved for MCP protocol messages.

Logs produced while resolving project configuration are redirected to stderr so they cannot corrupt the protocol stream.

## Read-only tools

No MCP tool creates, edits, or deletes project files. The server does not run `prepare`, build the application, or start Vite.

`refresh` only replaces the Inspector's in-memory state. `diagnose` analyzes data already exposed by the Inspector. `search_api` reads a documentation index bundled with `@runablejs/mcp`.

## Private runtime values

`get_config` can report public runtime configuration. For private configuration, it returns key names only—not their values.

```json
{
  "public": { "apiBase": "/api" },
  "privateKeys": ["databaseUrl"]
}
```

The MCP server does not read `.env` or `process.env` directly to enrich responses. It forwards the filtered representation provided by `runable/inspector`.

## Trusted project code still runs

To report the same resolved configuration as Runable, the Inspector executes:

- the project's `runable.config.*` files;
- the `setup()` hook of every configured Runable module.

Those files are normal project-owned Node.js code. Their side effects—filesystem writes, environment changes, or global mutations—remain possible. The Inspector does not execute page or plugin files to read their metadata; it extracts that information statically.

::u-tip
---
variant: warning
title: Read-only does not mean sandboxed
---

The MCP tools do not mutate your project, but resolving a Runable configuration executes trusted configuration and module setup code. Do not point the server at an untrusted repository.

::

## MCP client boundary

Runable controls the local server and its tool outputs. Your MCP client controls:

- which model can call the tools;
- whether calls require approval;
- what tool results are sent to that model;
- how project-scoped MCP configuration is shared.

Review your client's privacy and approval settings separately. For clients that support it, approval can be enabled even though all Runable tools are read-only.
