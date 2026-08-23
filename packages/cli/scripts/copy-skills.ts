import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Copies the repository's canonical `skills/` directory into
 * `packages/cli/skills/` so it can be published alongside `dist/` and
 * `templates/` (see package.json's `files`). This is a build step, not an
 * editorial source: `skills/` at the repo root stays the only place a
 * Skill is actually authored — see `packages/cli/src/commands/skills/bundle.ts`
 * for how the CLI locates this copy (or falls back to the repo root
 * directly) at runtime.
 */
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");

const source = resolve(REPO_ROOT, "skills");
const target = resolve(PACKAGE_ROOT, "skills");

if (!existsSync(source)) {
  throw new Error(`Cannot find the repository's skills/ directory at ${source}`);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

console.log(`Copied ${source} -> ${target}`);
