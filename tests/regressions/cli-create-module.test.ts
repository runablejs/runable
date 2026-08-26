import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "../helpers.js";

describe("runable create --module", () => {
  const source = readFileSync(
    path.join(REPO_ROOT, "packages/cli/src/commands/create/index.ts"),
    "utf8",
  );

  it("routes --module directly to the module scaffolder", () => {
    expect(source).toMatch(/module:\s*\{\s*type:\s*"boolean"/);
    expect(source).toMatch(/const projectType = args\.module\s*\?\s*"module"/);
    expect(source).toMatch(/case "module":\s*\{\s*answer = await handleModuleProject\(\)/);
  });

  it("only offers application creation flows in the interactive selector", () => {
    const selector = source.slice(
      source.indexOf(": await p.select"),
      source.indexOf("if (p.isCancel"),
    );

    expect(selector).toContain('value: "existing"');
    expect(selector).toContain('value: "starter"');
    expect(selector).not.toContain('value: "module"');
  });
});
