import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  cleanupFixtureDir,
  createFixtureDir,
  linkWorkspacePackage,
  runInFixture,
  writeFixtureFile,
} from "../fixtures.js";

describe("module CSS imports", () => {
  it("preserves remote @import URLs when building a module", () => {
    const directory = createFixtureDir("module-remote-css-import-");

    try {
      linkWorkspacePackage(directory, "runable", "packages/runable");
      writeFixtureFile(
        directory,
        "runable.config.ts",
        `import { defineModule } from "runable";

export default defineModule({ css: ["./app/css/main.css"] });
`,
      );
      writeFixtureFile(
        directory,
        "app/css/main.css",
        `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");

.example { font-family: Inter, sans-serif; }
`,
      );

      const result = runInFixture(
        directory,
        `import { build } from "runable";
await build();
`,
        { timeout: 30_000 },
      );

      expect(result.status, result.stderr || result.stdout).toBe(0);
      const cssDir = path.join(directory, "dist/app/css");
      expect(existsSync(cssDir)).toBe(true);
      const cssFile = readdirSync(cssDir).find((file) => file.endsWith(".css"));
      expect(cssFile).toBeDefined();
      expect(readFileSync(path.join(cssDir, cssFile!), "utf8")).toContain(
        "https://fonts.googleapis.com/css2?family=Inter",
      );
    } finally {
      cleanupFixtureDir(directory);
    }
  }, 30_000);
});
