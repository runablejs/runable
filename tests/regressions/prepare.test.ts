import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createFixtureDir, cleanupFixtureDir, linkWorkspacePackage, writeFixtureFile, runInFixture } from "../fixtures.js";
import { runTsc } from "../helpers.js";

/**
 * A single minimal fixture (just runable.config.ts + app/app.vue, no
 * pages/plugins/composables/middlewares) covers both regressions below —
 * they're both artifacts of the same `prepare()` call.
 */
describe("prepare() on a minimal app", () => {
  let dir: string;
  let result: ReturnType<typeof runInFixture>;

  beforeAll(() => {
    dir = createFixtureDir("prepare-minimal-");
    linkWorkspacePackage(dir, "runable", "packages/runable");

    writeFixtureFile(
      dir,
      "runable.config.ts",
      `import { defineConfig } from "runable";
export default defineConfig({});
`,
    );
    writeFixtureFile(dir, "app/app.vue", `<template><main>Test</main></template>\n`);

    result = runInFixture(
      dir,
      `import { prepare } from "runable";

const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args.map(String).join(" "));
};

await prepare();

console.warn = originalWarn;
console.log("PREPARE_WARNINGS_JSON=" + JSON.stringify(warnings));
`,
      { timeout: 60_000 },
    );
  }, 60_000);

  afterAll(() => {
    cleanupFixtureDir(dir);
  });

  it("regression #009 - does not warn about duplicated .js/.d.ts auto-imports", () => {
    expect(result.status, `prepare() failed:\n${result.stdout}\n${result.stderr}`).toBe(0);

    const marker = result.stdout
      .split("\n")
      .find((line) => line.startsWith("PREPARE_WARNINGS_JSON="));
    expect(marker, "prepare() did not run to completion").toBeDefined();

    const warnings: string[] = JSON.parse(marker!.slice("PREPARE_WARNINGS_JSON=".length));
    // Intentionally not asserting zero warnings overall (that would be
    // fragile) — only that the specific known regression is gone.
    const duplicatedImportWarnings = warnings.filter((w) => /duplicated imports/i.test(w));
    expect(
      duplicatedImportWarnings,
      `got duplicated-imports warnings:\n${duplicatedImportWarnings.join("\n")}`,
    ).toEqual([]);
  });

  it("regression #015 - generates `type MiddlewareNames = never;` when there is no middleware", () => {
    const dtsPath = path.join(dir, ".app/router-middlewares.d.ts");
    const dts = readFileSync(dtsPath, "utf8");

    expect(dts).not.toMatch(/type MiddlewareNames\s*=\s*;/);
    expect(dts).toMatch(/type MiddlewareNames\s*=\s*never;/);

    const tsc = runTsc(["--noEmit", "--skipLibCheck", dtsPath], { cwd: dir });
    expect(
      tsc.status,
      `tsc rejected router-middlewares.d.ts:\n${tsc.stdout}\n${tsc.stderr}`,
    ).toBe(0);
  });
});
