---
title: MCP Installation
description: Install the project-local Runable MCP server and verify that it starts against the correct project.
---

Install the MCP package as a development dependency of the Runable project you want to inspect:

::u-code-group

```bash [pnpm]
pnpm add -D @runablejs/mcp
```

```bash [npm]
npm install --save-dev @runablejs/mcp
```

```bash [yarn]
yarn add --dev @runablejs/mcp
```

```bash [bun]
bun add --dev @runablejs/mcp
```

::

`runable` must already be installed in the same project. The MCP package deliberately does not bundle its own copy: it uses the project's `runable/inspector` export as its source of truth.

## Start through the Runable CLI

Use the Runable CLI integration when configuring an MCP client:

```bash
runable mcp
```

The command resolves `@runablejs/mcp` from the current project and starts it over `stdio`. It does not install the package automatically.

Point it at another project with `--cwd`:

```bash
runable mcp --cwd /absolute/path/to/project
```

Use an absolute path in MCP client configuration. Clients do not always launch their child processes from the workspace directory.

## Start the package directly

The package also provides its own executable:

```bash
runable-mcp --cwd /absolute/path/to/project
```

Use this form when the installed `@runablejs/cli` version does not include `runable mcp`.

## Requirements

- Node.js `^22.18.0` or `>=24.12.0`.
- A local `runable` installation that exports `runable/inspector`.
- An MCP client that supports local `stdio` servers.
- A trusted Runable project. Resolving its configuration executes project-owned configuration and module setup code.

Check <a href="/docs/mcp/compatibility.md">Compatibility</a> before combining prerelease versions.

## Verify the installation

The MCP command is a protocol process, not an interactive application. A successful process waits for MCP messages and may appear to do nothing when started directly.

After connecting a client, verify the setup in this order:

1. Confirm that the server exposes eight tools.
2. Call `get_project`.
3. Check that `rootDir` is the intended project directory.
4. Call `get_routes` and confirm that it returns the current pages.
5. Call `search_api` with `useAsyncData`.

Continue with <a href="/docs/mcp/clients.md">Client Setup</a> to connect Codex, Claude Code, Cursor, or GitHub Copilot.
