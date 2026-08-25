---
title: MCP Client Setup
description: Connect the Runable MCP server to Codex, Claude Code, Cursor, or GitHub Copilot.
---

Install `@runablejs/mcp` in the project first. Every example below uses an absolute project path because MCP clients do not all start servers from the workspace directory.

Replace `/absolute/path/to/project` before copying a configuration.

## Codex

Add the server to the project-scoped `.codex/config.toml` file:

```toml
[mcp_servers.runable]
command = "/absolute/path/to/project/node_modules/.bin/runable"
args = ["mcp", "--cwd", "/absolute/path/to/project"]
required = true
default_tools_approval_mode = "approve"
```

Runable's MCP tools are read-only. Use `prompt` instead of `approve` if you want Codex to request confirmation before every call.

You can also register the server from the command line:

```bash
codex mcp add runable -- /absolute/path/to/project/node_modules/.bin/runable mcp --cwd /absolute/path/to/project
codex mcp list
```

## Claude Code

Create `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "runable": {
      "type": "stdio",
      "command": "/absolute/path/to/project/node_modules/.bin/runable",
      "args": ["mcp", "--cwd", "/absolute/path/to/project"]
    }
  }
}
```

Or register it from the project directory:

```bash
claude mcp add --transport stdio --scope project runable -- /absolute/path/to/project/node_modules/.bin/runable mcp --cwd /absolute/path/to/project
claude mcp get runable
```

Use `/mcp` inside Claude Code to inspect the connection.

## Cursor

Create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "runable": {
      "command": "/absolute/path/to/project/node_modules/.bin/runable",
      "args": ["mcp", "--cwd", "/absolute/path/to/project"]
    }
  }
}
```

Reload Cursor, then enable `runable` and its tools in MCP settings. For Cursor Agent CLI, verify the connection with:

```bash
cursor-agent mcp list
cursor-agent mcp list-tools runable
```

## GitHub Copilot in VS Code

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "runable": {
      "type": "stdio",
      "command": "/absolute/path/to/project/node_modules/.bin/runable",
      "args": ["mcp", "--cwd", "/absolute/path/to/project"]
    }
  }
}
```

Open Copilot Chat in Agent mode and enable the Runable tools from the tool picker. Your organization may need to allow MCP servers through its Copilot policy.

## Windows paths

Point `command` to the Windows executable generated in the project:

```text
C:\absolute\path\to\project\node_modules\.bin\runable.cmd
```

Keep the project path passed to `--cwd` absolute as well.

## Share or keep local

Project-scoped configuration makes the server discoverable for contributors, but it also contains an absolute machine-specific path. Before committing it, choose one of these approaches:

- document the path replacement for each contributor;
- use a client-supported variable or workspace-root expansion;
- keep the MCP configuration local and commit only the setup instructions.

After connecting, use the smoke test from <a href="/docs/mcp/installation.md">Installation</a>.
