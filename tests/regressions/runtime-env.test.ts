import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createFixtureDir, cleanupFixtureDir, writeFixtureFile } from "../fixtures.js";
import { runTsc } from "../helpers.js";

// packages/runable/dist/... (not src/...): the plugin's own internal `@/*`
// imports only resolve correctly once built — see plugins.test.ts for the
// same reasoning.
const RUNTIME_UNPLUGIN = "../../packages/runable/dist/runtime/unplugin.js";
const INFER_ENV_TYPE = "../../packages/runable/dist/utils/infer-env.js";

const setEnvVars: string[] = [];
function setEnv(key: string, value: string) {
  process.env[key] = value;
  setEnvVars.push(key);
}
afterEach(() => {
  for (const key of setEnvVars.splice(0)) delete process.env[key];
});

async function transformWithRuntimeEnv(
  code: string,
  fixtureDir: string,
): Promise<string | undefined> {
  const { default: runtimeUnplugin } = await import(RUNTIME_UNPLUGIN);
  const plugin = runtimeUnplugin.vite({ output: fixtureDir });

  await plugin.configResolved({ mode: "production", root: fixtureDir });

  const result = plugin.transform(code, "virtual-fixture.ts", { ssr: false });
  return typeof result === "string" ? result : result?.code;
}

describe("regression #007 - runtime env values are injected as valid JS literals", () => {
  it("wraps a plain string value in real quotes instead of splicing a bare identifier", async () => {
    const dir = createFixtureDir("bug007-string-");
    try {
      setEnv("RUN_PUBLIC_LABEL", "bonjour");

      const output = await transformWithRuntimeEnv(
        "export const valeur = import.meta.env.RUN_PUBLIC_LABEL;",
        dir,
      );

      expect(output, "transform did not touch the code at all").toBeDefined();
      // The regression: output used to be the bare, unquoted identifier
      // `bonjour`, which is invalid/wrong JS (an undefined reference).
      expect(output).not.toMatch(/=\s*bonjour\s*;/);
      expect(output).toContain('"bonjour"');

      // The real, ultimate check: the generated code must actually be
      // valid, executable JavaScript that evaluates to the right value.
      const mod = await import(
        `data:text/javascript,${encodeURIComponent(output!)}`
      );
      expect(mod.valeur).toBe("bonjour");
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("safely serializes a string with spaces / URL-like characters", async () => {
    const dir = createFixtureDir("bug007-url-");
    try {
      setEnv("RUN_PUBLIC_GREETING", "hello world");
      setEnv("RUN_PUBLIC_API_URL", "https://example.com/api?x=1&y=2");

      const output = await transformWithRuntimeEnv(
        `export const greeting = import.meta.env.RUN_PUBLIC_GREETING;
export const apiUrl = import.meta.env.RUN_PUBLIC_API_URL;`,
        dir,
      );

      const mod = await import(
        `data:text/javascript,${encodeURIComponent(output!)}`
      );
      expect(mod.greeting).toBe("hello world");
      expect(mod.apiUrl).toBe("https://example.com/api?x=1&y=2");
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("does not stringify numbers/booleans that already have a native JS representation", async () => {
    const dir = createFixtureDir("bug007-primitives-");
    try {
      setEnv("RUN_PUBLIC_PORT", "3000");
      setEnv("RUN_PUBLIC_ENABLED", "true");

      const output = await transformWithRuntimeEnv(
        `export const port = import.meta.env.RUN_PUBLIC_PORT;
export const enabled = import.meta.env.RUN_PUBLIC_ENABLED;`,
        dir,
      );

      const mod = await import(
        `data:text/javascript,${encodeURIComponent(output!)}`
      );
      expect(mod.port).toBe(3000);
      expect(typeof mod.port).toBe("number");
      expect(mod.enabled).toBe(true);
      expect(typeof mod.enabled).toBe("boolean");
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("regression #016 - array-shaped runtime env values get a valid TS array type", () => {
  it("inferEnvType returns a valid standalone array type for a JSON array value", async () => {
    const { inferEnvType } = await import(INFER_ENV_TYPE);
    const dir = createFixtureDir("bug016-unit-");
    try {
      const typeText = inferEnvType([1, "deux"]);
      expect(typeText).not.toContain(",deux");

      // Must parse as a real, standalone TS type — not just "look" valid.
      writeFixtureFile(dir, "check.ts", `type T = ${typeText};\nexport {};\n`);
      const result = runTsc(
        ["--noEmit", "--strict", "--target", "ES2022", path.join(dir, "check.ts")],
        { cwd: dir },
      );
      expect(
        result.status,
        `"${typeText}" is not a syntactically valid TS type:\n${result.stdout}\n${result.stderr}`,
      ).toBe(0);
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("generates a runtime.d.ts whose array property is valid TypeScript, not `array: 1,deux;`", async () => {
    const dir = createFixtureDir("bug016-");
    try {
      setEnv("RUN_PUBLIC_ARRAY", '[1,"deux"]');

      const { default: runtimeUnplugin } = await import(RUNTIME_UNPLUGIN);
      const plugin = runtimeUnplugin.vite({ output: dir });
      await plugin.configResolved({ mode: "production", root: dir });

      const dtsPath = path.join(dir, "runtime.d.ts");
      const dts = readFileSync(dtsPath, "utf8");

      expect(dts).not.toMatch(/array:\s*1,\s*deux\s*;/);
      expect(dts).toMatch(/array:\s*Array<number \| string>;/);

      const result = runTsc(
        ["--noEmit", "--skipLibCheck", "--strict", "--target", "ES2022", dtsPath],
        { cwd: dir },
      );
      expect(
        result.status,
        `tsc rejected the generated runtime.d.ts:\n${result.stdout}\n${result.stderr}`,
      ).toBe(0);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});
