import { describe, it, expect } from "vitest";
import path from "node:path";
import { createFixtureDir, cleanupFixtureDir, writeFixtureFile, runInFixture } from "../fixtures.js";
import { REPO_ROOT } from "../helpers.js";

// packages/runable/dist/... (not src/...): matches runtime-env.test.ts's
// own reasoning — this internal util's `@/*` imports only resolve once
// built.
const LOAD_ENV = path.join(REPO_ROOT, "packages/runable/dist/utils/load-env.js");

describe("regression #020 - loadRuntimeEnv() never writes to stdout", () => {
  it("stays silent on stdout while loading a normal .env file", () => {
    const dir = createFixtureDir("bug020-runtime-env-quiet-");
    try {
      const envPath = path.join(dir, ".env");
      writeFixtureFile(dir, ".env", "RUN_PUBLIC_GREETING=hello\nRUN_PRIVATE_SECRET=shh\n");

      const result = runInFixture(
        dir,
        `import { loadRuntimeEnv } from ${JSON.stringify(LOAD_ENV)};
const result = loadRuntimeEnv({ path: ${JSON.stringify(envPath)} });
process.stdout.write("MARKER:" + JSON.stringify(result.runtime.public) + "\\n");
`,
      );

      expect(result.exitCode, `script failed:\n${result.stderr}`).toBe(0);

      // The regression: `dotenv` used to unconditionally write an
      // "injected env (...) from .env" notice to stdout on every call
      // (its `quiet` option reads from the isolated `processEnv` argument
      // Runable passes it, not the real `process.env`, so nothing a caller
      // sets can suppress it) — a real problem for any host process that
      // reserves stdout for something else (e.g. an MCP server's JSON-RPC
      // wire protocol). `loadRuntimeEnv()` now passes `quiet: true`
      // directly, which dotenv does honor.
      expect(result.stdout).not.toContain("injected env");
      expect(result.stderr).not.toContain("injected env");

      // Silence isn't the whole story — the values must still load.
      expect(result.stdout.trim()).toBe(
        `MARKER:${JSON.stringify({ greeting: "hello" })}`,
      );
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});
