# @runablejs/cli

## 1.0.0-alpha.5

### Minor Changes

- [#42](https://github.com/runablejs/runable/pull/42) [`8589e2c`](https://github.com/runablejs/runable/commit/8589e2c1ab0ccf785ed3df3b3b886d80ac4a70dc) Thanks [@domutala](https://github.com/domutala)! - Add Agent Skills distribution and installation to the CLI: `runable skills install` detects the AI coding agents already in use in a project (Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Cline, or any other Agent Skills-compatible agent), installs Runable's official Agent Skills into the right destination for each (`.claude/skills/`, `.cline/skills/`, or the shared `.agents/skills/`, deduplicated when several agents share one), and never overwrites a locally modified or foreign Skill without `--force`. `runable skills list` (with a `--json` option) lists the Skills bundled with the installed CLI version. Skills are bundled with the package itself — installing them never requires network access and always matches the installed Runable version.
  
  Also, `runable create` now scaffolds an `AGENTS.md` file into every new or existing project it sets up, so AI coding agents understand a project's Runable conventions from the start.

## 1.0.0-alpha.4

### Patch Changes

- [#1](https://github.com/runablejs/runable/pull/1) [`79877dd`](https://github.com/runablejs/runable/commit/79877ddeb08a7222311e9cb54ae5778fc90b35a0) Thanks [@domutala](https://github.com/domutala)! - clean code
