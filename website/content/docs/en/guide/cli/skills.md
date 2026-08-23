---
title: AI Skills
description: Install Runable's Agent Skills — procedural instructions that teach compatible AI coding agents how to work with a Runable project.
---

Runable ships a collection of [Agent Skills](https://agentskills.io) — an open, portable format compatible AI coding agents load on demand. Documentation explains Runable; Agent Skills give a coding agent step-by-step instructions for working safely with a Runable project: where conventions live, which APIs actually exist, and what mistakes to avoid.

An agent loads only the Skill relevant to the current task instead of every Runable convention at once — working on routes loads routing/layout knowledge, connecting a backend loads adapter knowledge, and so on.

## Bundled Skills

| Skill | Covers |
| --- | --- |
| `runable-project` | Understanding and safely modifying an existing Runable project |
| `runable-pages` | Pages, routes, layouts, and navigation middleware |
| `runable-data-fetching` | Loading data with `useAsyncData`, SSR/CSR, and application errors |
| `runable-configuration` | Runtime environment variables, styles, assets, and the production build |
| `runable-extend` | Plugins, modules, and auto-imports |
| `runable-head` | Page titles, meta tags, and structured data |
| `runable-integrations` | Connecting Runable to a backend server |

These are the Skills bundled with the current CLI version — run `runable skills list` to see exactly what your installed version ships, since this set can grow over time.

## Install

```bash
runable skills install
```

Without arguments, this is interactive: it detects which AI coding agents are already in use in the project (from markers like `.claude/`, `.cursor/`, or `.github/copilot-instructions.md`), pre-selects them in a multi-select prompt, and lets you adjust the selection before confirming.

```text
Detected AI coding agents:

  Claude Code
  Cursor

? Install Runable Skills for:
  ◉ Claude Code
  ◉ Cursor
  ◯ OpenAI Codex
  ◯ GitHub Copilot
  ◯ Gemini CLI
  ◯ OpenCode
  ◯ Cline
  ◯ Other Agent Skills-compatible agent

Runable Skills will be installed to:

  .claude/skills/
    Claude Code
  .agents/skills/
    Cursor

? Continue?
```

### Supported agents and destinations

| Agent | Installation directory |
| --- | --- |
| OpenAI Codex | `.agents/skills/` |
| Cursor | `.agents/skills/` |
| GitHub Copilot | `.agents/skills/` |
| Gemini CLI | `.agents/skills/` |
| OpenCode | `.agents/skills/` |
| Other Agent Skills-compatible agent | `.agents/skills/` |
| Claude Code | `.claude/skills/` |
| Cline | `.cline/skills/` |

Several agents share `.agents/skills/` — selecting Cursor, Codex, and Gemini CLI, for example, does not create three copies. They install once into that shared directory. Claude Code and Cline each get their own destination: neither reads `.agents/skills/`.

### Non-interactive use

```bash
runable skills install --target agents
runable skills install --target claude
runable skills install --target agents,claude
runable skills install --target all
```

`--target` accepts a comma-separated list of destinations — `agents`, `claude`, `cline` — or `all` for every destination. Passing it skips the interactive prompt entirely, so it's safe to run in a script or CI.

### Existing Skills

| Situation | Result |
| --- | --- |
| Not installed yet | Installed |
| Installed, identical to the bundled version | Left as-is, reported as up to date |
| Installed, but different from the bundled version | Interactive: asks before overwriting. Non-interactive: skipped, with a warning |
| Installed, different, with `--force` | Overwritten without asking |

```bash
runable skills install --force
```

`--force` replaces an existing **Runable** Skill that differs from the bundled version, without asking — it never touches anything else. A hand-written Skill in the same directory (`.agents/skills/company-conventions/`, for example) is never installed, overwritten, or removed by Runable, with or without `--force`.

Installed Skills are regular project files — Runable never adds them to `.gitignore`. Commit them so the whole team's AI coding agents follow the same instructions.

### Works offline, matches your installed version

Skills are distributed with the `@runablejs/cli` package itself, not downloaded from GitHub or the Runable website at install time. `runable skills install` works without network access, installs deterministically, and always installs the Skills that ship with the CLI version you actually have installed — never a version mismatched with your toolchain.

## List

```bash
runable skills list
runable skills list --json
```

Prints every Skill bundled with the installed CLI version, with its name and description read directly from each Skill's own frontmatter. `--json` prints the same data as a JSON array (`[{ "name": ..., "description": ... }]`) for scripting.
