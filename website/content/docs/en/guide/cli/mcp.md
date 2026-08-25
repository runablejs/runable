---
title: runable mcp
description: Start the project-local Runable MCP server for AI coding agents.
---

`runable mcp` starts the `@runablejs/mcp` package installed in the current
Runable project and connects over stdio:

```bash
npm install --save-dev @runablejs/mcp
runable mcp
```

The command deliberately resolves the MCP package from the project rather than
bundling a second copy into the CLI. This keeps the Runable CLI and MCP release
cycles independent and gives each project control over its MCP version.

Use `--cwd` when the project isn't the current directory:

```bash
runable mcp --cwd /path/to/project
```

The command is intended to be launched by an MCP client, not used as an
interactive terminal program. Once it starts, stdout is reserved for MCP
messages; project and configuration logs are redirected to stderr.

If `@runablejs/mcp` is missing or too old to expose the reusable stdio entry
point, the command exits with an installation or upgrade instruction.

For complete setup, client configuration, tools, and security guidance, read <a href="/docs/mcp/index.md">Runable MCP</a>.
