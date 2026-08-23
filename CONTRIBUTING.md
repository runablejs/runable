# Contributing

This repository is a pnpm monorepo containing several public npm packages
(`runable`, `@runablejs/cli`, `create-runable`) plus two private apps
(`playground`, `website`) that are never published. Versioning and
publishing are handled entirely by [Changesets](https://github.com/changesets/changesets) —
there is no manual `npm version` / `npm publish` step to remember.

## Branches

- `dev` is the active development branch. Feature branches are created from
  `dev` and merged back into it through a pull request.
- `main` is the release branch. It only moves forward when `dev` (or a
  hotfix) is merged into it, and every push to `main` is what triggers the
  release pipeline described below.

## Everyday workflow

```bash
# 1. make your change
pnpm changeset
```

`pnpm changeset` asks two questions:

1. **Which packages did you change?** Select every package whose published
   behavior changed. You don't need to select `playground` or `website` —
   they are private and excluded from versioning entirely.
2. **What kind of change is it?**
   - **patch** — bug fix, internal improvement, docs, anything that doesn't
     change the public API.
   - **minor** — a new, backwards-compatible feature or API addition.
   - **major** — a breaking change. While the project is in `alpha`
     (see below), reserve this for changes you'd call a breaking change once
     the package is stable — it still bumps the alpha counter, not `1.0.0`.

Then write a short, user-facing description. It is copied straight into the
package's `CHANGELOG.md`, so write it for someone installing the package,
not for a teammate reading the diff.

This creates a Markdown file under `.changeset/`. Commit it together with
your code:

```bash
git add .
git commit
git push
```

### When do I need a changeset?

Add one whenever a change affects what a consumer of `runable`,
`@runablejs/cli`, or `create-runable` experiences: bug fixes, new options,
behavior changes, dependency bumps that affect the public surface, etc.

### When can I skip it?

- Changes scoped to `playground` or `website` only.
- Repo tooling that doesn't touch a published package (CI config, this file,
  root-level docs).
- Pure refactors with zero observable behavior change — use judgment; when
  in doubt, add a patch changeset, it costs nothing.

A PR without a changeset isn't blocked automatically today (no `changeset
status` gate is wired into CI), so this is a matter of discipline rather
than an enforced check.

## What happens after you push

```text
PR → CI (install, lint/typecheck/test/build) → merge into dev → …
  … eventually dev is merged into main → Release PR (Changesets) → merge → publish
```

1. **CI** (`.github/workflows/ci.yml`) runs on every pull request targeting
   `main` or `dev`, and on every push to `dev`. It installs with a frozen
   lockfile, then runs lint, typecheck, and test **for whichever packages
   define those scripts** (lint and test are no-ops today, since no package
   has a `lint` or `test` script yet — they'll start running automatically
   the day one is added), then builds every publishable package.
2. **Merging into `main`** (directly, or via a `dev → main` PR) pushes to
   `main`, which triggers `.github/workflows/release.yml`. Its first job,
   `select-mode`, looks at the `.changeset/*.md` files currently on `main`
   and decides what happens next:
   - **Changesets are pending** → the `version` job opens/updates a
     **Release PR** titled `chore(release): version packages`. That PR
     contains the version bumps, the regenerated `CHANGELOG.md` files, the
     internal `workspace:*`/`workspace:^` dependency bumps, and it deletes
     the changesets it consumed. Review it like any other PR — it's just a
     diff.
   - **No changesets left** (the Release PR was just merged) → the `pack`
     job builds every package (`pnpm build`) and packs the publishable ones
     into tarballs, then the `publish` job pushes those tarballs to npm
     (private packages are never published), tags each published package as
     `<name>@<version>`, and creates a matching GitHub Release from its
     changelog entry.
3. **Publishing uses npm Trusted Publishing (OIDC)** — no `NPM_TOKEN` is
   stored anywhere. Only the `publish` job gets an OIDC token (`id-token:
   write`); it authenticates to npm using its GitHub Actions identity, and
   provenance is attached automatically. See the engineering notes in the
   release-system PR for the one-time npm-side configuration this requires.

## Prereleases

The project is currently in `alpha` (Changesets is in **pre mode**, tag
`alpha` — see `.changeset/pre.json`). While this is active, `changeset
version` bumps versions as `1.0.0-alpha.N` instead of jumping to a stable
`1.0.0`, and `changeset publish` publishes those versions under the `alpha`
npm dist-tag instead of `latest`. You don't need to do anything differently
day-to-day — `pnpm changeset` works exactly as described above.

When the project is ready to move to a `beta`, run once, in its own PR:

```bash
pnpm changeset pre exit
pnpm changeset pre enter beta
```

And later, to go fully stable:

```bash
pnpm changeset pre exit
```

After exiting pre mode, the next `changeset version` run produces the real
`1.0.0` (or whatever the accumulated changesets call for), and `changeset
publish` publishes it under the default `latest` dist-tag.

## Commands reference

| Command                    | What it does                                                                 |
| --------------------------- | ----------------------------------------------------------------------------- |
| `pnpm changeset`            | Interactively record what you changed and how (patch/minor/major).           |
| `pnpm changeset status`     | Show which packages currently have pending changesets, without changing anything. |
| `pnpm version-packages`     | Apply pending changesets: bump versions, update changelogs, refresh the lockfile. Only ever run by the `version` job in `release.yml` — you don't need this locally. |
| `pnpm release:local`        | Build every publishable package, then `changeset publish`. A manual/local fallback for an emergency publish (requires `npm login` first); the automated pipeline publishes through `changesets/action/pack` + `changesets/action/publish` (OIDC) instead. |
| `pnpm ci:local`             | Run the same lint/typecheck/test/build sequence as CI, locally. (Named `ci:local`, not `ci` — `pnpm ci` is pnpm's own built-in alias for `clean-install` and would silently shadow a script named `ci`.) |
| `pnpm build`                | Build `runable` and `@runablejs/cli` (the packages with a build step).       |
