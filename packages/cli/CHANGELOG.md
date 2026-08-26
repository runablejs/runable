# @runablejs/cli

## 1.0.0-alpha.10

### Patch Changes

- Updated dependencies [[`b129483`](https://github.com/runablejs/runable/commit/b129483a831db0812aa08213b2c0f910a2d4bebb)]:
  - runable@1.0.0-alpha.10

## 1.0.0-alpha.9

### Patch Changes

- Updated dependencies [[`5bed854`](https://github.com/runablejs/runable/commit/5bed854ef5541d52e008ec6b35ffbb5addd02bda)]:
  - runable@1.0.0-alpha.9

## 1.0.0-alpha.8

### Patch Changes

- Updated dependencies [[`f6c9a82`](https://github.com/runablejs/runable/commit/f6c9a8232b3c6b29ec076808072d4d6d8c1ac44c)]:
  - runable@1.0.0-alpha.8

## 1.0.0-alpha.7

### Minor Changes

- [#51](https://github.com/runablejs/runable/pull/51) [`1e2cf51`](https://github.com/runablejs/runable/commit/1e2cf51ccf01f2f8053428bed50659e6af2682f3) Thanks [@domutala](https://github.com/domutala)! - Ship ready-to-run starter projects for Express, Fastify, NestJS, AdonisJS, Hono, and Koa.

- [#51](https://github.com/runablejs/runable/pull/51) [`d289327`](https://github.com/runablejs/runable/commit/d2893277bfbe653243564ede6f810c89e6e158b1) Thanks [@domutala](https://github.com/domutala)! - Add `runable create --module` for directly scaffolding a Runable module, keep the default interactive prompt focused on application creation, and install the framework packages as module development dependencies.

### Patch Changes

- Updated dependencies [[`78f1a56`](https://github.com/runablejs/runable/commit/78f1a56275dc5b9fe32e09141b0ac222e3cacaf1), [`3404609`](https://github.com/runablejs/runable/commit/34046096250242914ea90bc4b85952b840341ae2)]:
  - runable@1.0.0-alpha.7

## 1.0.0-alpha.6

### Minor Changes

- [#49](https://github.com/runablejs/runable/pull/49) [`8ea56a0`](https://github.com/runablejs/runable/commit/8ea56a0eabf34859434651acf7840f1de9af7baf) Thanks [@domutala](https://github.com/domutala)! - Add a runable mcp command that starts the @runablejs/mcp installation from the current Runable project.

### Patch Changes

- Updated dependencies [[`10421c7`](https://github.com/runablejs/runable/commit/10421c750b224c72503dc4edde1909b93f8a1a5e), [`377d8e1`](https://github.com/runablejs/runable/commit/377d8e18c4f31580da5bbcc69c3241524d588454), [`6910aaf`](https://github.com/runablejs/runable/commit/6910aaf1d0757ac4e7e03b562a847a871c4cfdde), [`9a99a77`](https://github.com/runablejs/runable/commit/9a99a77b87d51fc7d48c3adb7621c0d6f73104c4)]:
  - runable@1.0.0-alpha.6

## 1.0.0-alpha.5

### Minor Changes

- [#42](https://github.com/runablejs/runable/pull/42) [`8589e2c`](https://github.com/runablejs/runable/commit/8589e2c1ab0ccf785ed3df3b3b886d80ac4a70dc) Thanks [@domutala](https://github.com/domutala)! - Add Agent Skills distribution and installation to the CLI: `runable skills install` detects the AI coding agents already in use in a project (Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Cline, or any other Agent Skills-compatible agent), installs Runable's official Agent Skills into the right destination for each (`.claude/skills/`, `.cline/skills/`, or the shared `.agents/skills/`, deduplicated when several agents share one), and never overwrites a locally modified or foreign Skill without `--force`. `runable skills list` (with a `--json` option) lists the Skills bundled with the installed CLI version. Skills are bundled with the package itself — installing them never requires network access and always matches the installed Runable version.
  
  Also, `runable create` now scaffolds an `AGENTS.md` file into every new or existing project it sets up, so AI coding agents understand a project's Runable conventions from the start.

## 1.0.0-alpha.4

### Patch Changes

- [#1](https://github.com/runablejs/runable/pull/1) [`79877dd`](https://github.com/runablejs/runable/commit/79877ddeb08a7222311e9cb54ae5778fc90b35a0) Thanks [@domutala](https://github.com/domutala)! - clean code
