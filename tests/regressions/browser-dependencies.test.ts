import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "../helpers.js";

describe("browser runtime dependencies", () => {
  it("uses the ESM lodash build in the shared app entry", () => {
    const entry = readFileSync(
      join(REPO_ROOT, "packages/runable/dist/entry/main.js"),
      "utf8",
    );

    expect(entry).toContain('from "lodash-es/merge.js"');
    expect(entry).not.toMatch(/from ["']lodash\/merge(?:\.js)?["']/);
  });
});
