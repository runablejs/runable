import { describe, it, expect } from "vitest";
import { readJson } from "../helpers.js";

/**
 * Deliberately shallow — only asserts the two fields the rest of the repo
 * relies on (docs, expected npm dist-tag), not Changesets' internal
 * pre.json schema. Update this alongside .changeset/pre.json when moving
 * from alpha to beta (see CONTRIBUTING.md).
 */
describe("Changesets prerelease state", () => {
  it("is in pre mode, tagged alpha", () => {
    const pre = readJson(".changeset/pre.json");
    expect(pre.mode).toBe("pre");
    expect(pre.tag).toBe("alpha");
  });
});
