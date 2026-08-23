import { describe, it, expect } from "vitest";
import { pnpm } from "../helpers.js";

/**
 * Regression coverage for a CI break caused by editing a package.json
 * without regenerating pnpm-lock.yaml:
 *
 *   ERR_PNPM_OUTDATED_LOCKFILE
 */
describe("pnpm-lock.yaml stays in sync with every package.json", () => {
  it("accepts `pnpm install --frozen-lockfile --lockfile-only` without changes", () => {
    // --lockfile-only skips downloading/linking any package — it only
    // resolves and compares the dependency graph, so this is the lightest
    // way to assert the lockfile matches every package.json in the
    // workspace, both locally and in CI.
    const result = pnpm(["install", "--frozen-lockfile", "--lockfile-only"]);
    expect(
      result.status,
      "pnpm-lock.yaml is out of sync with a package.json in the workspace " +
        `(this is the ERR_PNPM_OUTDATED_LOCKFILE failure mode):\n${result.stdout}\n${result.stderr}`,
    ).toBe(0);
  });
});
