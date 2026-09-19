import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cleanupFixtureDir,
  createFixtureDir,
  linkWorkspacePackage,
  writeFixtureFile,
} from "../fixtures.js";

const originalCwd = process.cwd();

afterEach(() => {
  process.chdir(originalCwd);
});

describe("module aliases", () => {
  it("adds module aliases to the application with consumer precedence", async () => {
    const directory = createFixtureDir("module-aliases-");

    try {
      linkWorkspacePackage(directory, "runable", "packages/runable");
      writeFixtureFile(
        directory,
        "runable.config.ts",
        `import path from "node:path";
import { defineConfig } from "runable";

export default defineConfig({
  modules: ["./module"],
  alias: { "@shared": path.join(import.meta.dirname, "app/shared") },
});
`,
      );
      writeFixtureFile(
        directory,
        "module/runable.config.ts",
        `import path from "node:path";
import { defineModule } from "runable";

export default defineModule({
  alias: {
    "@module": path.join(import.meta.dirname, "app"),
    "@shared": path.join(import.meta.dirname, "app/shared"),
  },
});
`,
      );

      process.chdir(directory);
      vi.resetModules();
      const { loadConfig, useConfig, writeTsConfig } = await import("runable");
      await loadConfig();
      writeTsConfig();

      const config = useConfig();
      expect(config.alias["@module"]).toBe(
        path.join(directory, "module/app"),
      );
      expect(config.alias["@shared"]).toBe(path.join(directory, "app/shared"));
      expect(config.alias["#build"]).toBe(path.join(directory, ".app"));

      const generated = JSON.parse(
        readFileSync(path.join(directory, ".app/tsconfig.app.json"), "utf8"),
      );
      expect(generated.compilerOptions.paths).toMatchObject({
        "@module": ["../module/app"],
        "@shared": ["../app/shared"],
      });
    } finally {
      cleanupFixtureDir(directory);
    }
  });
});
