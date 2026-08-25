---
title: Runable MCP
description: Give AI coding agents a live, structured, and read-only view of a Runable project.
---

The official Runable Model Context Protocol server connects an MCP-compatible coding agent to the project it is working on. Instead of inferring routes or configuration from filenames alone, the agent can ask Runable how it currently resolves the application.

```text
AI coding agent
      │
      │ MCP over stdio
      ▼
@runablejs/mcp
      │
      │ public inspection API
      ▼
runable/inspector
      │
      ▼
Your Runable project
```

`@runablejs/mcp` is a thin protocol adapter. It resolves `runable/inspector` from the target project's own `node_modules`, so the information it returns comes from the Runable version installed in that project.

## What the server provides

The server exposes eight read-only tools:

| Need | Tool |
| --- | --- |
| Identify the project and its resolved paths | `get_project` |
| Read the resolved public configuration | `get_config` |
| Inspect the route tree | `get_routes` |
| List layouts, middleware, plugins, modules, and auto-imports | `get_extensions` |
| Match a URL using the project's router rules | `resolve_route` |
| Find structural problems | `diagnose` |
| Search the Runable documentation locally | `search_api` |
| Reload inspection state after a change | `refresh` |

Read <a href="/docs/mcp/tools.md">MCP Tools</a> for inputs, outputs, and usage examples.

## MCP and Agent Skills

These features solve different problems and work well together:

| Feature | Answers |
| --- | --- |
| Agent Skills | “How should I implement this with Runable?” |
| Runable MCP | “How is this project configured right now?” |

Agent Skills provide procedural instructions and framework conventions. MCP provides current project facts. Install the Skills from <a href="/docs/guide/cli/skills.md">AI Skills</a>, then connect the MCP server for project-aware inspection.

## Start here

1. <a href="/docs/mcp/installation.md">Install the MCP package</a> in the Runable project.
2. <a href="/docs/mcp/clients.md">Connect your coding agent</a> using its project configuration.
3. Ask the agent to call `get_project` and confirm that `rootDir` points to the intended project.

::u-tip
---
variant: info
title: Local by design
---

The server uses `stdio`. It does not open an HTTP port, send project data to a Runable service, or require a Runable account. Your MCP client decides which model receives tool results.

::
