import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

import type { BundledSkillMeta } from "./bundle.js";

function collectFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(full));
    else if (entry.isFile()) files.push(full);
  }

  return files;
}

/**
 * Deterministic hash of a directory's full contents (relative paths and
 * file bytes) — not just `SKILL.md`, since a Skill can also carry
 * `references/`, `scripts/`, or `assets/`. Used to tell an installed
 * Skill apart from an unmodified copy of the bundled one.
 */
export function hashDirectory(dir: string): string {
  const hash = createHash("sha256");

  for (const file of collectFiles(dir).sort()) {
    hash.update(relative(dir, file).split(sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }

  return hash.digest("hex");
}

export type SkillConflictStatus = "new" | "identical" | "modified";

export interface SkillInstallPlanEntry {
  skill: BundledSkillMeta;
  destinationDir: string;
  status: SkillConflictStatus;
}

/** Compares each bundled skill against `destinationRoot/<skill.id>` — pure
 * and read-only, safe to call before deciding anything about conflicts. */
export function planInstall(
  skills: BundledSkillMeta[],
  destinationRoot: string,
): SkillInstallPlanEntry[] {
  return skills.map((skill) => {
    const destinationDir = join(destinationRoot, skill.id);

    if (!existsSync(destinationDir)) {
      return { skill, destinationDir, status: "new" };
    }

    const status: SkillConflictStatus =
      hashDirectory(skill.dir) === hashDirectory(destinationDir)
        ? "identical"
        : "modified";

    return { skill, destinationDir, status };
  });
}

/**
 * Copies `sourceDir` into `destinationDir` via a same-parent temporary
 * directory, then an atomic rename — a crash mid-copy leaves the temp
 * directory orphaned instead of a half-written Skill in `destinationDir`.
 */
function copyDirectoryAtomically(sourceDir: string, destinationDir: string): void {
  const parent = dirname(destinationDir);
  mkdirSync(parent, { recursive: true });

  const tempDir = join(
    parent,
    `.${basename(destinationDir)}.runable-tmp-${process.pid}-${Date.now()}`,
  );
  rmSync(tempDir, { recursive: true, force: true });
  cpSync(sourceDir, tempDir, { recursive: true });

  rmSync(destinationDir, { recursive: true, force: true });
  renameSync(tempDir, destinationDir);
}

export type SkillInstallOutcome = "installed" | "up-to-date" | "skipped";

export interface SkillInstallResult {
  skill: BundledSkillMeta;
  outcome: SkillInstallOutcome;
}

export interface InstallSkillsOptions {
  force: boolean;
  /** Called only when a skill exists, differs from the bundled version, and
   * `force` is false. Returning `true` overwrites it; `false` skips it.
   * Omit for non-interactive contexts, where a conflict is always skipped
   * (never silently overwritten without `--force`). */
  onConflict?: (skill: BundledSkillMeta) => Promise<boolean>;
}

/** Installs every bundled skill into `destinationRoot`, one directory at a
 * time — never touches any other entry already inside `destinationRoot`. */
export async function installSkills(
  skills: BundledSkillMeta[],
  destinationRoot: string,
  options: InstallSkillsOptions,
): Promise<SkillInstallResult[]> {
  const plan = planInstall(skills, destinationRoot);
  const results: SkillInstallResult[] = [];

  for (const entry of plan) {
    if (entry.status === "identical") {
      results.push({ skill: entry.skill, outcome: "up-to-date" });
      continue;
    }

    if (entry.status === "modified" && !options.force) {
      const shouldOverwrite = options.onConflict
        ? await options.onConflict(entry.skill)
        : false;

      if (!shouldOverwrite) {
        results.push({ skill: entry.skill, outcome: "skipped" });
        continue;
      }
    }

    copyDirectoryAtomically(entry.skill.dir, entry.destinationDir);
    results.push({ skill: entry.skill, outcome: "installed" });
  }

  return results;
}
