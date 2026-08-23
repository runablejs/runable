import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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

  it('the "start with a starter" flow also ships AGENTS.md, not just the "existing project"/"module" flows', async () => {
    // handleStarterProject() (starter.ts) is a *separate* code path from
    // afterAnswer() (shared.ts, used by the other two flows) — it does not
    // call afterAnswer at all. This reproduces exactly what it does:
    // copyStarterTemplate() then copyAgentsFile(), in that order, on a real
    // starter template. copyStarterTemplate resolves its template relative
    // to the compiled dist file, so a real (temporary) directory has to
    // exist under packages/cli/starters/.
    const fixtureFramework = "__agents-md-test-fixture__";
    const starterTemplateDir = path.join(
      REPO_ROOT,
      "packages/cli/starters",
      fixtureFramework,
    );
    // copyStarterTemplate() prompts to overwrite whenever its target
    // already exists (even empty) — createFixtureDir() itself creates the
    // dir, so remove it immediately and let copyStarterTemplate create it
    // fresh, exactly like a real "brand new project name" would.
    const projectDir = createFixtureDir("agents-md-starter-");
    rmSync(projectDir, { recursive: true, force: true });

    try {
      mkdirSync(starterTemplateDir, { recursive: true });
      writeFileSync(
        path.join(starterTemplateDir, "package.json"),
        JSON.stringify({ name: "fixture-starter", version: "1.0.0" }),
      );

      const { copyStarterTemplate } = await import(
        "../../packages/cli/dist/commands/create/starter.js"
      );
      const { copyAgentsFile } = await import(
        "../../packages/cli/dist/commands/create/shared.js"
      );

      await copyStarterTemplate(fixtureFramework, projectDir);
      await copyAgentsFile(projectDir);

      const agentsPath = path.join(projectDir, "AGENTS.md");
      expect(existsSync(agentsPath), "AGENTS.md was not created by the starter flow").toBe(
        true,
      );
      expect(readFileSync(agentsPath, "utf8").trim().length).toBeGreaterThan(0);
      // The starter template itself is still there too — copyAgentsFile
      // must not have clobbered anything from copyStarterTemplate.
      expect(existsSync(path.join(projectDir, "package.json"))).toBe(true);
    } finally {
      rmSync(starterTemplateDir, { recursive: true, force: true });
      cleanupFixtureDir(projectDir);
    }
  });
});
