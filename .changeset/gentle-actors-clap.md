---
"@runablejs/cli": minor
---

Add Agent Skills distribution and installation to the CLI: `runable skills install` detects the AI coding agents already in use in a project (Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Cline, or any other Agent Skills-compatible agent), installs Runable's official Agent Skills into the right destination for each (`.claude/skills/`, `.cline/skills/`, or the shared `.agents/skills/`, deduplicated when several agents share one), and never overwrites a locally modified or foreign Skill without `--force`. `runable skills list` (with a `--json` option) lists the Skills bundled with the installed CLI version. Skills are bundled with the package itself — installing them never requires network access and always matches the installed Runable version.

Also, `runable create` now scaffolds an `AGENTS.md` file into every new or existing project it sets up, so AI coding agents understand a project's Runable conventions from the start.
