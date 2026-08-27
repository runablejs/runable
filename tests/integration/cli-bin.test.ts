import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT, readJson } from "../helpers.js";
import { cleanupFixtureDir, createFixtureDir } from "../fixtures.js";

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

  it("creates module framework packages as development dependencies", async () => {
    const targetDir = createFixtureDir("cli-module-package-");

    try {
      const { createPackageJson } = await import(
        "../../packages/cli/dist/commands/create/shared.js"
      );
      await createPackageJson(targetDir, "runable-example");

      const pkg = JSON.parse(
        readFileSync(path.join(targetDir, "package.json"), "utf8"),
      );
      const cliVersion = JSON.parse(
        readFileSync(
          path.join(REPO_ROOT, "packages/cli/package.json"),
          "utf8",
        ),
      ).version;
      expect(pkg.dependencies).toBeUndefined();
      expect(pkg.devDependencies).toMatchObject({
        "@runablejs/cli": cliVersion,
        runable: cliVersion,
        vue: "^3.5.0",
        "vue-router": "^5.2.0",
      });
    } finally {
      cleanupFixtureDir(targetDir);
    }
  });

  it("uses the CLI version when adding dependencies to an existing project", async () => {
    const targetDir = createFixtureDir("cli-existing-package-");
    const previousCwd = process.cwd();

    try {
      writeFileSync(
        path.join(targetDir, "package.json"),
        JSON.stringify({ name: "existing-project" }),
      );
      process.chdir(targetDir);

      const { updatePackageJson } = await import(
        "../../packages/cli/dist/commands/create/shared.js"
      );
      await updatePackageJson();

      const generated = JSON.parse(
        readFileSync(path.join(targetDir, "package.json"), "utf8"),
      );
      expect(generated.dependencies.runable).toBe(pkg.version);
      expect(generated.devDependencies["@runablejs/cli"]).toBe(pkg.version);
    } finally {
      process.chdir(previousCwd);
      cleanupFixtureDir(targetDir);
    }
  });

  it("allows esbuild when pnpm is selected", async () => {
    const targetDir = createFixtureDir("cli-pnpm-builds-");

    try {
      const { configurePnpmBuilds } = await import(
        "../../packages/cli/dist/commands/create/shared.js"
      );
      await configurePnpmBuilds("pnpm", targetDir);

      expect(
        readFileSync(path.join(targetDir, "pnpm-workspace.yaml"), "utf8"),
      ).toContain("esbuild: true");
    } finally {
      cleanupFixtureDir(targetDir);
    }
  });
});
