import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { readJson } from "../helpers.js";

/**
 * Deliberately shallow — only asserts the two fields the rest of the repo
 * relies on (docs, expected npm dist-tag), not Changesets' internal schema.
 * A stable release has no pre.json; its release-preparation commit briefly
 * uses mode "exit" before Changesets removes the file while versioning.
 */
describe("Changesets prerelease state", () => {
  it("uses a valid prerelease or stable-release transition", () => {
    if (!existsSync(".changeset/pre.json")) return;

    const pre = readJson(".changeset/pre.json");
    expect(["pre", "exit"]).toContain(pre.mode);
    expect(pre.tag).toBe("alpha");
  });
});
