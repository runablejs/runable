import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parse as parseYaml } from "yaml";
import { afterEach, describe, expect, it } from "vitest";

import { REPO_ROOT } from "../helpers.js";

/**
 * Lightweight validator for skills/*​/SKILL.md against the Agent Skills
 * spec (https://agentskills.io/specification) — reuses the `yaml` package
 * already used for frontmatter parsing elsewhere in this repo instead of a
 * hand-rolled YAML parser. Checked against the official reference
 * implementation (skills-ref, linked from the spec): the rules below cover
 * exactly what it validates for `name`/`description`. skills-ref itself
 * wasn't added as a dependency — it's an unscoped, low-adoption package
 * (0.1.x, single maintainer) and everything it checks for this repo's
 * needs is a few lines against the already-present `yaml` parser.
 */

const SKILLS_ROOT = join(REPO_ROOT, "skills");

// https://agentskills.io/specification — "name" field constraints.
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NAME_MAX_LENGTH = 64;
const DESCRIPTION_MAX_LENGTH = 1024;

function listSkillDirs(): string[] {
  try {
    return readdirSync(SKILLS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** Validates one skill directory's SKILL.md against the Agent Skills spec.
 * Returns a list of human-readable error strings — empty means valid. */
function validateSkillDir(skillDir: string): string[] {
  const dirName = skillDir.split(/[\\/]/).filter(Boolean).pop() ?? skillDir;
  const skillMdPath = join(skillDir, "SKILL.md");

  if (!statSync(skillMdPath, { throwIfNoEntry: false })?.isFile()) {
    return [`${skillMdPath}: SKILL.md not found`];
  }

  const raw = readFileSync(skillMdPath, "utf8");
  const fenceMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!fenceMatch) {
    return [`${skillMdPath}: missing YAML frontmatter (no leading "--- ... ---" block)`];
  }

  let data: Record<string, unknown>;
  try {
    data = (parseYaml(fenceMatch[1]) ?? {}) as Record<string, unknown>;
  } catch (error) {
    return [
      `${skillMdPath}: invalid YAML frontmatter — ${error instanceof Error ? error.message : String(error)}`,
    ];
  }

  const errors: string[] = [];
  const { name, description } = data;

  if (typeof name !== "string" || name.trim() === "") {
    errors.push(`${skillMdPath}: "name" is required and must be a non-empty string`);
  } else {
    if (name.length > NAME_MAX_LENGTH) {
      errors.push(`${skillMdPath}: "name" must be at most ${NAME_MAX_LENGTH} characters`);
    }
    if (!NAME_RE.test(name)) {
      errors.push(
        `${skillMdPath}: "name" ("${name}") must be lowercase letters, numbers, and single hyphens only, with no leading/trailing/consecutive hyphens`,
      );
    }
    if (name !== dirName) {
      errors.push(
        `${skillMdPath}: "name" ("${name}") must match its parent directory name ("${dirName}")`,
      );
    }
  }

  if (typeof description !== "string" || description.trim() === "") {
    errors.push(`${skillMdPath}: "description" is required and must be a non-empty string`);
  } else if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push(
      `${skillMdPath}: "description" must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
    );
  }

  const body = raw.slice(fenceMatch[0].length).trim();
  if (!body) {
    errors.push(
      `${skillMdPath}: SKILL.md must contain Markdown instructions after the frontmatter`,
    );
  }

  return errors;
}

describe("skills/*/SKILL.md are valid Agent Skills", () => {
  const skillDirs = listSkillDirs();

  it("finds at least one skill under skills/", () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  it.each(skillDirs)("skills/%s/SKILL.md is a well-formed Agent Skill", (dirName) => {
    const errors = validateSkillDir(join(SKILLS_ROOT, dirName));
    expect(errors, errors.join("\n")).toEqual([]);
  });
});

describe("skill validator", () => {
  let tmpDir: string | undefined;

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
    tmpDir = undefined;
  });

  function makeSkill(dirName: string, skillMdContent: string): string {
    tmpDir = mkdtempSync(join(tmpdir(), "runable-skill-test-"));
    const skillDir = join(tmpDir, dirName);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), skillMdContent, "utf8");
    return skillDir;
  }

  it("accepts a valid, minimal skill", () => {
    const skillDir = makeSkill(
      "sample-skill",
      ["---", "name: sample-skill", "description: A valid sample skill for testing.", "---", "", "Body."].join(
        "\n",
      ),
    );

    expect(validateSkillDir(skillDir)).toEqual([]);
  });

  it("rejects a skill whose name does not match its directory", () => {
    const skillDir = makeSkill(
      "runable-project",
      ["---", "name: another-name", "description: Mismatched name.", "---", "", "Body."].join("\n"),
    );

    const errors = validateSkillDir(skillDir);
    expect(errors.some((e) => e.includes("must match its parent directory name"))).toBe(true);
  });

  it("rejects a skill with no name", () => {
    const skillDir = makeSkill(
      "no-name",
      ["---", "description: Missing the name field.", "---", "", "Body."].join("\n"),
    );

    const errors = validateSkillDir(skillDir);
    expect(errors.some((e) => e.includes('"name" is required'))).toBe(true);
  });

  it("rejects a skill with no description", () => {
    const skillDir = makeSkill(
      "no-description",
      ["---", "name: no-description", "---", "", "Body."].join("\n"),
    );

    const errors = validateSkillDir(skillDir);
    expect(errors.some((e) => e.includes('"description" is required'))).toBe(true);
  });

  it("rejects a skill with an empty body", () => {
    const skillDir = makeSkill(
      "empty-body",
      ["---", "name: empty-body", "description: A skill with no instructions.", "---"].join("\n"),
    );

    const errors = validateSkillDir(skillDir);
    expect(
      errors.some((e) => e.includes("must contain Markdown instructions after the frontmatter")),
    ).toBe(true);
  });

  it("rejects a skill whose body is only whitespace/blank lines", () => {
    const skillDir = makeSkill(
      "whitespace-body",
      [
        "---",
        "name: whitespace-body",
        "description: A skill with a whitespace-only body.",
        "---",
        "",
        "   ",
        "\t",
        "",
      ].join("\n"),
    );

    const errors = validateSkillDir(skillDir);
    expect(
      errors.some((e) => e.includes("must contain Markdown instructions after the frontmatter")),
    ).toBe(true);
  });

  it("rejects invalid YAML frontmatter with an explicit error", () => {
    const skillDir = makeSkill(
      "bad-yaml",
      ["---", "name: bad-yaml", "description: [unterminated", "---", "", "Body."].join("\n"),
    );

    const errors = validateSkillDir(skillDir);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("invalid YAML frontmatter");
  });

  it("rejects a name with invalid characters, leading/trailing hyphens, or consecutive hyphens", () => {
    for (const badName of ["Runable-Project", "-runable", "runable-", "runable--project"]) {
      const skillDir = makeSkill(
        badName,
        ["---", `name: ${badName}`, "description: Bad name format.", "---", "", "Body."].join("\n"),
      );

      const errors = validateSkillDir(skillDir);
      expect(
        errors.length,
        `expected "${badName}" to be rejected`,
      ).toBeGreaterThan(0);
    }
  });

  it("requires nothing beyond name/description — no Runable-proprietary fields", () => {
    // Confirms the validator stays portable: a skill with only the two
    // fields the Agent Skills spec requires passes with zero errors.
    const skillDir = makeSkill(
      "portable-skill",
      ["---", "name: portable-skill", "description: Only the two required fields.", "---", "", "Body."].join(
        "\n",
      ),
    );

    expect(validateSkillDir(skillDir)).toEqual([]);
  });
});
