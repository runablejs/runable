import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT, readJson } from "../helpers.js";

/**
 * Regression coverage for a broken published CLI: dist/index.js had no
 * shebang, so after a real `npm install`, the `runable` bin that npm/pnpm
 * symlinks into node_modules/.bin was not runnable directly — the shell
 * fell back to interpreting the JS file as a shell script and failed with
 * garbled "command not found" errors.
 */
describe("@runablejs/cli bin", () => {
  const pkg = readJson("packages/cli/package.json");
  const binRelative: string = pkg.bin.runable;
  const binPath = path.join(REPO_ROOT, "packages/cli", binRelative);

  it("declares its bin target and that file exists after build", () => {
    expect(binRelative).toBe("./dist/index.js");
    expect(existsSync(binPath)).toBe(true);
  });

  it("has a shebang so it can run as a real executable after install", () => {
    const firstLine = readFileSync(binPath, "utf8").split("\n")[0];
    expect(firstLine).toBe("#!/usr/bin/env node");
  });

  it("is marked executable on disk", () => {
    const mode = statSync(binPath).mode;
    expect(mode & 0o111, "dist/index.js is not chmod +x").not.toBe(0);
  });

  it("runs as a direct executable (not via `node <file>`) and prints --help", () => {
    // Exec the file directly, exactly like the shell does after resolving
    // `runable` from node_modules/.bin. `node dist/index.js --help` would
    // NOT have caught the missing-shebang regression — it bypasses the
    // shebang entirely by construction.
    const result = spawnSync(binPath, ["--help"], { encoding: "utf8" });
    expect(
      result.status,
      `direct exec of the bin failed:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
    ).toBe(0);
    expect(result.stdout).toContain("runable create|prepare|build|mcp|skills");
  });

  it("documents the direct module creation flag", () => {
    const result = spawnSync(binPath, ["create", "--help"], {
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--module");
    expect(result.stdout).toContain("Create a reusable Runable module");
  });
});
