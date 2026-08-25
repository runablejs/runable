---
title: MCP Troubleshooting
description: Diagnose installation, project resolution, compatibility, protocol, and stale-data problems with Runable MCP.
---

Start with the exact command configured in your MCP client. Run it from a normal terminal so startup errors written to stderr are visible:

```bash
/absolute/path/to/project/node_modules/.bin/runable mcp --cwd /absolute/path/to/project
```

The process waiting silently is normal: after startup, it expects MCP messages on stdin.

## `@runablejs/mcp` is not installed

Error:

```text
No @runablejs/mcp installation found for project "...".
```

Install it in the project passed to `--cwd`:

```bash
pnpm add -D @runablejs/mcp
```

Do not rely on a copy installed in another workspace package or globally. `runable mcp` resolves it from the target project.

## No Runable installation found

The MCP package was found, but `runable` could not be resolved from the inspected project.

Check that:

- `--cwd` points to the project root containing `package.json`;
- `runable` is a dependency of that project;
- dependencies have been installed;
- the MCP client uses the expected absolute path.

## Inspector is incompatible

If the error says that `runable/inspector` is unavailable or names a missing Inspector method, upgrade the project's Runable version:

```bash
pnpm update runable
```

Check the supported combinations in <a href="/docs/mcp/compatibility.md">Compatibility</a>. If only `resolve_route` fails, the project may have base compatibility while the remaining tools continue to work.

## Failed to create the Inspector

This means Runable found the project but could not resolve its configuration. Run the project's normal preparation or build command to expose the underlying configuration error:

```bash
runable prepare
```

Fix errors in `runable.config.*` or module `setup()` hooks, then restart the MCP connection.

## The client shows no tools

Check these items:

1. The client configuration uses a local `stdio` server, not an HTTP URL.
2. `command` points to an existing executable.
3. Both `command` and `--cwd` use correct absolute paths.
4. The client has been restarted or its MCP configuration reloaded.
5. Organization policy allows local MCP servers.

Run the client's MCP listing command when available. A connected Runable server exposes eight tools.

## Project data is stale

The server keeps one Inspector instance for the connection. After changing pages, layouts, middleware, plugins, modules, or configuration, ask the agent to call:

```text
refresh
```

Then call `get_routes`, `get_config`, or `get_extensions` again. Other tools do not refresh automatically.

## The wrong project is inspected

Call `get_project` and inspect `rootDir`. If it is wrong, update both the executable path and the value passed to `--cwd` in the client configuration.

## Protocol errors or invalid JSON

stdout belongs exclusively to MCP after the server starts. If a wrapper script, shell profile, or custom integration prints status text to stdout, it can corrupt the protocol.

Use the direct project executable and send diagnostics to stderr. Runable already redirects output produced by project configuration while the Inspector is resolving it.

## `search_api` returns an unexpected version

The result includes both `documentationVersion` and `projectRunableVersion`. They can differ because the documentation index ships with the MCP package while inspection uses the project's Runable package.

Upgrade `@runablejs/mcp` for a newer documentation index, or use the returned versions to account for the difference before applying an API example.
