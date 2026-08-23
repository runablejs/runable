import { describe, it, expect, afterEach, vi } from "vitest";
import path from "node:path";
import { existsSync, readFileSync, mkdirSync, symlinkSync } from "node:fs";
import {
  createFixtureDir,
  cleanupFixtureDir,
  linkWorkspacePackage,
  writeFixtureFile,
} from "../fixtures.js";
import { runTsc } from "../helpers.js";

// `loadConfig()` caches into a module-level singleton (`cachedConfigs` in
// packages/runable/src/config/load.ts), and resolves config files relative
// to `process.cwd()`. Every test below gets an isolated module instance via
// `vi.resetModules()` + a fresh dynamic `import("runable")`, and restores
// `process.cwd()` afterwards, so tests can't leak state into each other.
const originalCwd = process.cwd();

async function freshRunable() {
  vi.resetModules();
  return import("runable");
}

function fixtureWithRunable(prefix: string) {
  const dir = createFixtureDir(prefix);
  linkWorkspacePackage(dir, "runable", "packages/runable");
  return dir;
}

afterEach(() => {
  process.chdir(originalCwd);
});

describe("regression #003 - getModuleOptions accepts both a relative path and the canonical module name", () => {
  it("resolves the module declared as './modules/my-module' by either form", async () => {
    const dir = fixtureWithRunable("bug003-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/my-module"] });
`,
      );
      writeFixtureFile(
        dir,
        "modules/my-module/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule<{ active: boolean }>({
  meta: { name: "myModule" },
  configKey: "myModule",
  defaults: { active: true },
});
`,
      );

      process.chdir(dir);
      const { loadConfig, getModuleOptions } = await freshRunable();
      await loadConfig();

      const byPath = getModuleOptions("./modules/my-module");
      const byName = getModuleOptions("myModule");

      expect(byPath).toEqual({ active: true });
      expect(byName).toEqual({ active: true });
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("regression #004 - a cycle between modules is rejected, not a hang", () => {
  it(
    "rejects loadConfig() with an identifiable cycle error instead of hanging",
    // Short, explicit timeout: if this regresses back to a hang, fail fast
    // instead of stalling the whole suite/CI.
    { timeout: 5_000 },
    async () => {
      const dir = fixtureWithRunable("bug004-");
      try {
        writeFixtureFile(
          dir,
          "runable.config.ts",
          `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./a"] });
`,
        );
        writeFixtureFile(
          dir,
          "a/runable.config.ts",
          `import { defineModule } from "runable";
export default defineModule({ meta: { name: "a" }, modules: ["../b"] });
`,
        );
        writeFixtureFile(
          dir,
          "b/runable.config.ts",
          `import { defineModule } from "runable";
export default defineModule({ meta: { name: "b" }, modules: ["../a"] });
`,
        );

        process.chdir(dir);
        const { loadConfig } = await freshRunable();

        await expect(loadConfig()).rejects.toThrow(/circular/i);
      } finally {
        cleanupFixtureDir(dir);
      }
    },
  );
});

describe("regression #005 - a dashed configKey produces a syntactically valid .d.ts", () => {
  it("generates a quoted property that tsc accepts", async () => {
    const dir = fixtureWithRunable("bug005-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/flag"] });
`,
      );
      writeFixtureFile(
        dir,
        "modules/flag/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule<{ active: boolean }>({
  configKey: "feature-flag",
  defaults: { active: true },
});
`,
      );

      process.chdir(dir);
      const { loadConfig } = await freshRunable();
      await loadConfig();

      const dtsPath = path.join(dir, ".app/modules-options.d.ts");
      expect(existsSync(dtsPath), `${dtsPath} was not generated`).toBe(true);

      const dts = readFileSync(dtsPath, "utf8");
      // Behavioral check first (the actual regression): the generated file
      // must be syntactically valid TypeScript, not just contain the right
      // substring.
      expect(dts).toContain('"feature-flag"?:');

      const result = runTsc(
        [
          "--noEmit",
          "--skipLibCheck",
          "--strict",
          "--module",
          "preserve",
          "--moduleResolution",
          "bundler",
          "--target",
          "ES2022",
          dtsPath,
        ],
        { cwd: dir },
      );
      expect(result.status, `tsc rejected the generated .d.ts:\n${result.stdout}\n${result.stderr}`).toBe(0);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("regression #006 - a compiled (JS) module keeps its typed options", () => {
  it("does not fall back to Record<string, unknown> when a sibling .d.ts is published", async () => {
    const dir = fixtureWithRunable("bug006-");
    try {
      // A "published npm module": compiled JS + a hand-written sibling
      // .d.ts declaring its typed `defineModule<Options>` shape — exactly
      // what's left once TypeScript compiles the generic away. Bare-name
      // modules are resolved via the package's own package.json, then
      // "dist/" is appended (see getModuleDir in config/load.ts) — so the
      // config files must live under dist/, not the package root.
      writeFixtureFile(
        dir,
        "vendor/compiled-module/package.json",
        JSON.stringify({
          name: "compiled-module",
          version: "1.0.0",
          type: "module",
          main: "./index.js",
        }),
      );
      // getModuleDir resolves the package via its real entry point (mlly's
      // resolvePathSync, respecting "main"/"exports"), so one has to exist,
      // even though Runable only ever reads dist/runable.config.js from it.
      writeFixtureFile(dir, "vendor/compiled-module/index.js", "export {};\n");
      writeFixtureFile(
        dir,
        "vendor/compiled-module/dist/runable.config.js",
        `export default {
  configKey: "example",
  defaults: { enabled: true },
};
`,
      );
      writeFixtureFile(
        dir,
        "vendor/compiled-module/dist/runable.config.d.ts",
        `import type { ModuleDefinition } from "runable";
export interface CompiledModuleOptions {
  enabled: boolean;
}
declare const _default: ModuleDefinition<CompiledModuleOptions>;
export default _default;
`,
      );
      // This fixture-only package lives inside the fixture itself (not the
      // workspace), so link it in directly rather than via
      // linkWorkspacePackage (which always points at REPO_ROOT/...).
      mkdirSync(path.join(dir, "node_modules"), { recursive: true });
      symlinkSync(
        path.join(dir, "vendor/compiled-module"),
        path.join(dir, "node_modules/compiled-module"),
        "dir",
      );

      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["compiled-module"] });
`,
      );

      process.chdir(dir);
      const { loadConfig } = await freshRunable();
      await loadConfig();

      const dtsPath = path.join(dir, ".app/modules-options.d.ts");
      const dts = readFileSync(dtsPath, "utf8");

      expect(
        dts,
        `expected a real type reference for "example", got:\n${dts}`,
      ).not.toMatch(/"example"\?:\s*Record<string, unknown>/);

      // Behavioral proof, not a string match: a consumer that narrows on
      // the module's *real* option shape must typecheck, and an invalid
      // property value for that shape must be rejected — showing the type
      // was genuinely preserved end to end, not just renamed to something
      // else that happens not to say "Record<string, unknown>".
      writeFixtureFile(
        dir,
        "consume-options.ts",
        `import type { RunableConfig } from "runable";
import "./.app/modules-options.d.ts";

type ExampleOptions = NonNullable<RunableConfig["example"]>;
const good: ExampleOptions = { enabled: true };
// @ts-expect-error enabled is a boolean, not a string
const bad: ExampleOptions = { enabled: "nope" };
void good;
void bad;
`,
      );

      const result = runTsc(
        [
          "--noEmit",
          "--skipLibCheck",
          "--strict",
          "--module",
          "preserve",
          "--moduleResolution",
          "bundler",
          "--target",
          "ES2022",
          path.join(dir, "consume-options.ts"),
        ],
        { cwd: dir },
      );
      expect(
        result.status,
        `tsc rejected the real-shape consumer:\n${result.stdout}\n${result.stderr}\n\ngenerated .d.ts:\n${dts}`,
      ).toBe(0);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("regression #008 - a failed setup() does not leave a stale cache", () => {
  it("rejects on every call and never exposes a partially-initialized config as valid", async () => {
    const dir = fixtureWithRunable("bug008-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/broken"] });
`,
      );
      writeFixtureFile(
        dir,
        "modules/broken/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule({
  meta: { name: "broken" },
  setup() {
    throw new Error("SETUP_FAILURE");
  },
});
`,
      );

      process.chdir(dir);
      const { loadConfig, useConfig } = await freshRunable();

      await expect(loadConfig()).rejects.toThrow(/SETUP_FAILURE/);
      // A second call must actually retry setup (and fail again) instead of
      // silently resolving from a cache populated before the first failure.
      await expect(loadConfig()).rejects.toThrow(/SETUP_FAILURE/);

      // No partially-initialized state should be exposed as "loaded" between
      // attempts.
      expect(() => useConfig()).toThrow(/not loaded/i);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("regression #018 - a root config that calls defineModule() directly still loads", () => {
  it("does not throw 'Runable config is not loaded' while generating module option types", async () => {
    const dir = fixtureWithRunable("bug018-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule({ meta: { name: "empty-module" } });
`,
      );

      process.chdir(dir);
      const { loadConfig } = await freshRunable();

      await expect(loadConfig()).resolves.not.toThrow();
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});
