import { isAbsolute, relative } from "node:path";

/**
 * Converts an absolute path to one relative to `rootDir`, forward-slashed
 * for cross-platform consistency — used for every file path in an
 * Inspector result (see the module doc on `./types.js`). Paths outside
 * `rootDir` (a built-in Runable file shipped inside `node_modules/runable`,
 * a dependency package) are left absolute rather than turned into a
 * confusing `../../..` chain.
 */
export function toProjectRelative(rootDir: string, absolutePath: string): string {
  if (!isAbsolute(absolutePath)) return absolutePath.replace(/\\/g, "/");

  const rel = relative(rootDir, absolutePath).replace(/\\/g, "/");
  if (rel.startsWith("..")) return absolutePath.replace(/\\/g, "/");

  return rel;
}
