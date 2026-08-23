import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "../helpers.js";
import { createFixtureDir, cleanupFixtureDir } from "../fixtures.js";

/**
 * Protects the actual feature: new Runable projects (scaffolded via
 * `runable create`, both the "add to an existing project" and "create a
 * module" flows) ship an AGENTS.md at their root. Not a check on every
 * sentence of its content — just that the mechanism that ships it works.
 */
describe("AGENTS.md is shipped to newly scaffolded Runable projects", () => {
  it("the source template exists and is non-empty", () => {
    const templatePath = path.join(
      REPO_ROOT,
      "packages/cli/templates/default/AGENTS.md",
    );
    expect(existsSync(templatePath)).toBe(true);

    const content = readFileSync(templatePath, "utf8");
    expect(content.trim().length).toBeGreaterThan(0);
    expect(content).toMatch(/^# Runable project/);
  });

  it("copyAgentsFile actually writes a non-empty AGENTS.md into a fresh project dir", async () => {
    // Behavioral: exercises the real function `afterAnswer` (used by both
    // the "existing project" and "module" creation flows) calls — not a
    // reimplementation of the copy logic.
    const dir = createFixtureDir("agents-md-copy-");
    try {
      const { copyAgentsFile } = await import(
        "../../packages/cli/dist/commands/create/shared.js"
      );

      await copyAgentsFile(dir);

      const generatedPath = path.join(dir, "AGENTS.md");
      expect(existsSync(generatedPath)).toBe(true);

      const content = readFileSync(generatedPath, "utf8");
      expect(content.trim().length).toBeGreaterThan(0);
      expect(content).toContain("Runable");

      // Nothing unexpected was created alongside it.
      expect(readdirSync(dir)).toEqual(["AGENTS.md"]);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});
