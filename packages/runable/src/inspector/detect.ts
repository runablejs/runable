import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import { RunableInspectorError } from "./errors.js";

/** Same extensions `c12`'s `loadConfig({ configFile: "runable.config" })` accepts. */
const CONFIG_FILE_CANDIDATES = [
  "runable.config.ts",
  "runable.config.mts",
  "runable.config.cts",
  "runable.config.js",
  "runable.config.mjs",
  "runable.config.cjs",
];

/**
 * Looks for a `runable.config.*` file directly inside `rootDir` — never in
 * a parent directory, unlike some config loaders' "search upward"
 * behavior. Returns the absolute path to the first match, or `undefined`.
 */
export function findRunableConfigFile(rootDir: string): string | undefined {
  for (const candidate of CONFIG_FILE_CANDIDATES) {
    const full = join(rootDir, candidate);
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return undefined;
}

/**
 * Throws a `RunableInspectorError` unless `rootDir` looks like a Runable
 * project — i.e. it exists and contains a `runable.config.*` file.
 * Intentionally shallow: it does not walk up parent directories, so
 * pointing the Inspector at the wrong directory fails loudly instead of
 * silently inspecting an unrelated project higher up the tree.
 */
export function assertRunableProject(rootDir: string): void {
  if (!existsSync(rootDir) || !statSync(rootDir).isDirectory()) {
    throw new RunableInspectorError(`Directory "${rootDir}" does not exist.`);
  }

  if (!findRunableConfigFile(rootDir)) {
    throw new RunableInspectorError(
      `No Runable project found in "${rootDir}": no runable.config.{ts,mts,cts,js,mjs,cjs} ` +
        `file was found directly inside it. createRunableInspector() only looks in rootDir ` +
        `itself, not in parent directories — pass the project's own root.`,
    );
  }
}
