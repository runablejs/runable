import { describe, it, expect } from "vitest";
import { createFixtureDir, cleanupFixtureDir, linkWorkspacePackage, linkNodeModule, writeFixtureFile, runInFixture } from "../fixtures.js";

const BUILD_SCRIPT = `import { build } from "runable";
await build();
console.log("BUILD_OK");
`;

// ssr: false in both fixtures below: with SSR on (the default), `build()`
// currently crashes in a *later*, unrelated step — production.ts's
// `await import(".../manifest.json")` has no `{ with: { type: "json" } }"`
// attribute, which Node now requires. That's a real, separate bug (not
// #014 or #017, not one of the 19 tracked here) — flagged in the report,
// deliberately not fixed. Disabling SSR sidesteps it so these two tests can
// still exercise the actual regressions they're about: the entry array
// (#014) and the vue-tsc dependency (#017) are both resolved well before
// that later crash would occur.

describe("regression #014 - building a minimal app (no pages/plugins/composables) does not fail", () => {
  it('does not throw "No input files"', () => {
    const dir = createFixtureDir("bug014-");
    try {
      linkWorkspacePackage(dir, "runable", "packages/runable");
      linkNodeModule(dir, "vue");
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ ssr: false });
`,
      );
      writeFixtureFile(dir, "app/app.vue", `<template><main>Test Runable</main></template>\n`);

      const result = runInFixture(dir, BUILD_SCRIPT, { timeout: 120_000 });

      expect(result.stdout + result.stderr).not.toMatch(/No input files/i);
      expect(
        result.status,
        `build() failed:\n${result.stdout}\n${result.stderr}`,
      ).toBe(0);
      expect(result.stdout).toContain("BUILD_OK");
    } finally {
      cleanupFixtureDir(dir);
    }
  }, 120_000);
});

describe("regression #017 - building an app with a .vue page does not require the consumer to install vue-tsc", () => {
  it('does not fail with "Cannot find module \'vue-tsc\'"', () => {
    const dir = createFixtureDir("bug017-");
    try {
      // Deliberately NOT linking/installing vue-tsc into this fixture:
      // the whole point of the regression is that a consumer should never
      // have to discover and add it manually. It must come transitively
      // through runable's own `dependencies` (verified separately in
      // tests/integration/package-tarball.test.ts's export/content checks).
      linkWorkspacePackage(dir, "runable", "packages/runable");
      linkNodeModule(dir, "vue");
      linkNodeModule(dir, "vue-router");
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ ssr: false });
`,
      );
      writeFixtureFile(dir, "app/app.vue", `<template><main>Test Runable</main></template>\n`);
      writeFixtureFile(dir, "app/pages/index.vue", `<template><div>Home page</div></template>\n`);

      const result = runInFixture(dir, BUILD_SCRIPT, { timeout: 120_000 });

      expect(result.stdout + result.stderr).not.toMatch(/cannot find module ['"]vue-tsc['"]/i);
      expect(
        result.status,
        `build() failed:\n${result.stdout}\n${result.stderr}`,
      ).toBe(0);
      expect(result.stdout).toContain("BUILD_OK");
    } finally {
      cleanupFixtureDir(dir);
    }
  }, 120_000);
});
