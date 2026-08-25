---
title: MCP Compatibility
description: Match @runablejs/mcp with a Runable version that provides the required Inspector capabilities.
---

`@runablejs/mcp` loads `runable/inspector` from the inspected project's own `node_modules`. Compatibility therefore depends on the `runable` version installed in that project, not on a globally installed CLI.

## Compatibility levels

| Level | Available tools |
| --- | --- |
| Base | Every tool except `resolve_route` |
| Full | All eight tools, including `resolve_route` |

For the `0.1.x` MCP line:

| Installed `runable` | Support |
| --- | --- |
| `1.0.0-alpha.3` and earlier | Unsupported: `runable/inspector` is not exported |
| `1.0.0-alpha.4` | Base compatibility |
| A release containing `Inspector.resolveRoute()` | Full compatibility |

Runable is currently in prerelease. Treat the published compatibility table as authoritative instead of assuming that every numerically newer prerelease works.

## Runtime capability checks

At startup, the server verifies the Inspector factory and the methods required by its base tool set. If a required capability is absent, startup fails and names the missing method.

`resolveRoute()` is checked when `resolve_route` is called. This targeted check lets an older base-compatible project keep the other seven tools.

## Keep project dependencies aligned

Install both packages in the project rather than relying on global resolution:

```bash
pnpm add runable
pnpm add -D @runablejs/mcp
```

After upgrading either package:

1. restart the MCP client connection;
2. call `get_project` and verify `runableVersion`;
3. list the eight tools;
4. call `resolve_route` if full compatibility is expected.

Both packages require Node.js `^22.18.0` or `>=24.12.0`.

See <a href="/docs/mcp/troubleshooting.md">Troubleshooting</a> for startup and capability errors.
