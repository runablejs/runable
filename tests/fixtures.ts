import { mkdtempSync, rmSync, mkdirSync, writeFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { REPO_ROOT, runCommand, type RunResult } from "./helpers.js";

/** Creates an empty temp directory outside the repo/workspace, for tests
 * that need a "real consumer project" (fixture package.json, config files,
 * etc.) without polluting the repo. Always pair with cleanupFixtureDir in
 * a try/finally or afterEach/afterAll. */
export function createFixtureDir(prefix: string): string {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

export function cleanupFixtureDir(dir: string) {
  rmSync(dir, { recursive: true, force: true });
}

/** Symlinks a built workspace package into a fixture's node_modules, the
 * same way pnpm's own workspace linking would — without running a real
 * `pnpm install` (offline, deterministic, fast). Handles scoped packages
 * (e.g. "@runablejs/cli") as well as unscoped ones. */
export function linkWorkspacePackage(
  fixtureDir: string,
  specifier: string,
  pkgRelativeDir: string,
) {
  const parts = specifier.split("/");
  const nodeModulesDir = path.join(fixtureDir, "node_modules", ...parts.slice(0, -1));
  mkdirSync(nodeModulesDir, { recursive: true });
  const target = path.join(nodeModulesDir, parts.at(-1)!);
  symlinkSync(path.join(REPO_ROOT, pkgRelativeDir), target, "dir");
}

/** Symlinks a *third-party* package (not a workspace package — e.g. "vue")
 * from this repo's own node_modules into a fixture, the same way
 * linkWorkspacePackage does for workspace packages. Needed because a
 * Runable app fixture built outside the workspace still needs "vue" (etc.)
 * resolvable for a real Vite build to succeed — that's expected fixture
 * plumbing, not the thing any given regression test is about. */
export function linkNodeModule(fixtureDir: string, specifier: string) {
  linkWorkspacePackage(fixtureDir, specifier, path.join("node_modules", specifier));
}

export function writeFixtureFile(fixtureDir: string, relativePath: string, content: string) {
  const fullPath = path.join(fixtureDir, relativePath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf8");
}

/** Writes `scriptSource` (a full, standalone ESM script) into the fixture
 * and runs it with Node in a real, isolated subprocess (cwd = fixtureDir).
 * Used for CLI/build/module-loading behaviors instead of importing
 * "runable" in-process — Runable's `loadConfig()`/build pipeline hold
 * module-level singleton state, so exercising them from a fresh process
 * per scenario is both simpler and more faithful to how they actually run
 * (a real `runable build`/`runable prepare` invocation) than resetting
 * in-process module state between test cases. */
export function runInFixture(
  fixtureDir: string,
  scriptSource: string,
  options?: { timeout?: number },
): RunResult {
  writeFixtureFile(fixtureDir, "__run.mjs", scriptSource);
  return runCommand("node", [path.join(fixtureDir, "__run.mjs")], {
    cwd: fixtureDir,
    timeout: options?.timeout,
  });
}

/** Minimal tsconfig for typechecking a fixture project against the
 * workspace's own TypeScript, without pulling in any package-specific
 * tsconfig (paths, DOM lib, etc.) that could mask or fake a resolution. */
export function writeFixtureTsconfig(fixtureDir: string, extra: Record<string, unknown> = {}) {
  writeFixtureFile(
    fixtureDir,
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          module: "preserve",
          moduleResolution: "bundler",
          target: "ES2022",
          strict: true,
          noEmit: true,
          types: [],
          ...extra,
        },
      },
      null,
      2,
    ),
  );
}
