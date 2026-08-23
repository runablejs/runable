import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

export const REPO_ROOT = path.resolve(import.meta.dirname, "..");

export function readJson(relativePath: string): any {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, relativePath), "utf8"));
}

export interface RunResult {
  /** Alias of `exitCode`, kept for existing callers. */
  status: number | null;
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/** Runs a command synchronously and returns its result instead of throwing,
 * so tests can assert on the exit code with a readable failure message. */
export function runCommand(
  command: string,
  args: string[],
  options: { cwd?: string; timeout?: number } = {},
): RunResult {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? REPO_ROOT,
    encoding: "utf8",
    timeout: options.timeout,
  });
  return {
    status: result.status,
    exitCode: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

/** Short alias for `runCommand`, used throughout the existing integration tests. */
export const run = runCommand;

export function pnpm(
  args: string[],
  options?: { cwd?: string; timeout?: number },
): RunResult {
  return run("pnpm", args, options);
}

/** Absolute path to this repo's own `tsc` binary — use this (not `pnpm exec
 * tsc`) when typechecking a fixture directory that lives outside the pnpm
 * workspace, since `pnpm exec` requires a workspace/package.json context
 * the fixture doesn't have. */
export const TSC_BIN = path.join(REPO_ROOT, "node_modules/.bin/tsc");

export function runTsc(
  args: string[],
  options?: { cwd?: string; timeout?: number },
): RunResult {
  return run(TSC_BIN, args, options);
}

/** Flattens a package.json `exports` field (any nesting of condition
 * objects) into the set of relative file paths it references. */
export function collectExportPaths(
  exportsField: unknown,
  acc: Set<string> = new Set(),
): Set<string> {
  if (typeof exportsField === "string") {
    acc.add(exportsField);
  } else if (exportsField && typeof exportsField === "object") {
    for (const value of Object.values(exportsField)) {
      collectExportPaths(value, acc);
    }
  }
  return acc;
}
