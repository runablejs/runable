import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FILE_DIR = dirname(fileURLToPath(import.meta.url));
// This file lives two directories under the package root in both dev
// (src/commands/skills/) and the published build (dist/commands/skills/),
// matching how `templates/` is already resolved from `commands/create/`.
const PACKAGE_ROOT = resolve(FILE_DIR, "../../..");

export class SkillsBundleNotFoundError extends Error {
  constructor() {
    super(
      "Runable Skills bundle could not be found. Reinstall @runablejs/cli, " +
        "or run `pnpm build` in the monorepo if you're developing Runable itself.",
    );
    this.name = "SkillsBundleNotFoundError";
  }
}

/**
 * Locates the directory containing the bundled `runable-*` Skills.
 *
 * - Published package: `<package root>/skills/`, copied there at build time
 *   by `scripts/copy-skills.ts` (declared in package.json's `files`).
 * - Monorepo development: falls back to the repository's own canonical
 *   `skills/` directory two levels above the package root, so `runable
 *   skills install` works locally without requiring the copy step to have
 *   run first.
 *
 * Throws `SkillsBundleNotFoundError` if neither exists — a corrupted or
 * incomplete install rather than something callers should silently ignore.
 */
export function getBundledSkillsDir(): string {
  const published = join(PACKAGE_ROOT, "skills");
  if (existsSync(published)) return published;

  const monorepoSource = resolve(PACKAGE_ROOT, "../../skills");
  if (existsSync(monorepoSource)) return monorepoSource;

  throw new SkillsBundleNotFoundError();
}

export interface BundledSkillMeta {
  /** Directory name, e.g. "runable-pages" — also the frontmatter `name`. */
  id: string;
  /** Absolute path to the skill's own directory. */
  dir: string;
  name: string;
  description: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Minimal frontmatter reader for `name`/`description` — deliberately not a
 * full YAML parser. Runable's own bundled Skills are simple, single-line,
 * unquoted `key: value` frontmatter; this only needs to read what Runable
 * itself authored, not arbitrary third-party YAML.
 */
function readNameAndDescription(
  skillMdPath: string,
): { name?: string; description?: string } {
  const raw = readFileSync(skillMdPath, "utf8");
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return {};

  const result: { name?: string; description?: string } = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(name|description):\s*(.*)$/);
    if (field) result[field[1] as "name" | "description"] = field[2].trim();
  }
  return result;
}

/**
 * Discovers every bundled Skill by reading `<bundle>/*​/SKILL.md` — no
 * hardcoded skill list, so a new `skills/runable-foo/` is picked up
 * automatically without touching the CLI. Throws with a specific,
 * actionable message when a skill directory is missing `SKILL.md` or a
 * required frontmatter field, since that means the published artifact is
 * corrupt (the bundle is expected to already be spec-valid — see
 * tests/integration/skills.test.ts, which validates it before publish).
 */
export function discoverBundledSkills(
  bundleDir: string = getBundledSkillsDir(),
): BundledSkillMeta[] {
  const entries = readdirSync(bundleDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return entries.map((entry) => {
    const dir = join(bundleDir, entry.name);
    const skillMdPath = join(dir, "SKILL.md");

    if (!existsSync(skillMdPath) || !statSync(skillMdPath).isFile()) {
      throw new Error(`Invalid Runable Skill: ${entry.name}/SKILL.md is missing.`);
    }

    const { name, description } = readNameAndDescription(skillMdPath);

    if (!name) {
      throw new Error(
        `Invalid Runable Skill: ${entry.name}/SKILL.md has no "name" in its frontmatter.`,
      );
    }
    if (!description) {
      throw new Error(
        `Invalid Runable Skill: ${entry.name}/SKILL.md has no "description" in its frontmatter.`,
      );
    }

    return { id: entry.name, dir, name, description };
  });
}
