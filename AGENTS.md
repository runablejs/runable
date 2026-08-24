# Runable framework repository

This is the **Runable framework monorepo** — the source of Runable itself, not
an application built with it. Runable is a Vue framework designed to work
across different server runtimes (Express, Fastify, NestJS, AdonisJS, Hono,
Koa, or a custom server) instead of shipping its own.

If you are working inside an application that merely *uses* Runable, see that
project's own `AGENTS.md` instead — it documents different conventions.

## Monorepo structure

- `packages/runable` — the framework core (published to npm as `runable`).
- `packages/cli` — the CLI (published as `@runablejs/cli`, binary `runable`).
- `packages/create-syora` — the project scaffolder (published as
  `create-runable`; the folder keeps its historical name, the package does
  not).
- `playground/` — a private, unpublished app for manually exercising the
  framework. Not part of the public API.
- `website/` — the private, unpublished marketing/docs site
  ([runablejs.com](https://runablejs.com)).
- `tests/` — root-level integration and regression tests (see below).
- `bugs/` — local-only notes on past bugs, excluded from git. Never rely on
  it existing; never commit to it.

Package manager: **pnpm**, version pinned via `packageManager` in the root
`package.json`. Shared dependency versions live in `pnpm-workspace.yaml`'s
`catalog` — packages reference them as `"catalog:"` rather than pinning their
own version.

## Commands

- Install: `pnpm install`
- Build the publishable packages (`runable`, `@runablejs/cli`):
  `pnpm build`
- Typecheck every package plus the test suite: `pnpm typecheck`
- Run the full test suite: `pnpm test`
- Run only `tests/integration/`: `pnpm test:integration`
- Run only `tests/regressions/` (protects against previously-fixed bugs):
  `pnpm test:regression`
- Lint (currently a no-op until a package defines its own `lint` script —
  it activates automatically once one does): `pnpm lint`
- Reproduce CI locally end to end (lint → build → typecheck → test):
  `pnpm ci:local`

Do not invent other scripts — check `package.json` before assuming one
exists.

## Generated files

Each package's `dist/` is build output from `tsdown` — never edit it by
hand; edit `src/` and rebuild. The same applies to `.app/`/`.output/` inside
`playground/`, produced by running the framework itself.

## Tests

- `tests/integration/` exercises real build/pack/typecheck behavior of the
  publishable packages (no mocking of the actual toolchain).
- `tests/regressions/` maps to specific historical bugs; each `describe`
  block is labeled with the bug it protects against. When fixing a new bug,
  add a test here that would have caught it.
- Prefer real subprocess/tsc/build invocations over mocking internals,
  matching the existing tests' style.

## Important rules

- The CLI only implements `create`, `prepare`, and `build` — there is no
  `runable dev` command. Don't assume Nuxt-like commands exist; verify
  against `packages/cli/src/commands/` first.
- Don't reintroduce a `tsconfig.json` `paths` alias that points a workspace
  package (e.g. `runable`) at another package's `src/` instead of its built
  `dist/` — this is a real regression class covered by
  `tests/regressions/config.test.ts` and `tests/integration/workspace-resolution.test.ts`.
- Keep the internal dependency chain `create-runable → @runablejs/cli →
  runable` on `workspace:^` in source; it gets rewritten to a real semver
  range at pack/publish time.
- This repo is currently in Changesets prerelease mode (alpha) — see
  `CONTRIBUTING.md` before touching anything release-related.

## Before finishing a change

1. `pnpm typecheck`
2. `pnpm test` (or at least `pnpm test:regression` if you touched a
   previously-fixed bug's area)
3. `pnpm build`
4. If the change affects a published package (`runable`, `@runablejs/cli`,
   or `create-runable`), add a Changeset (`pnpm changeset`) **in the same
   change** — not as a follow-up. Docs-only, test-only, CI/tooling-only, or
   `playground`/`website`-only changes don't need one. See CONTRIBUTING.md's
   "When do I need a changeset?" for the patch/minor/major split. A change
   that needed one isn't done until it exists.

`pnpm ci:local` runs 1–3 above (plus lint) in one command.
