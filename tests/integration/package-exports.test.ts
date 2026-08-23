import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT, readJson, collectExportPaths } from "../helpers.js";

describe("runable package.json `exports` match its built output", () => {
  const pkg = readJson("packages/runable/package.json");
  const exportPaths = [...collectExportPaths(pkg.exports)];

  it("declares the root export and every documented adapter", () => {
    // Not a build check — guards against silently losing an entry point
    // from package.json itself (e.g. a bad merge).
    const expectedSubpaths = [
      ".",
      "./adapters/adonis",
      "./adapters/bun",
      "./adapters/deno",
      "./adapters/express",
      "./adapters/fastify",
      "./adapters/hono",
      "./adapters/koa",
      "./adapters/nestjs",
    ];
    for (const subpath of expectedSubpaths) {
      // Not using expect().toHaveProperty(): its dot-path syntax would
      // mis-split subpaths like "./adapters/adonis" on the leading dot.
      expect(
        Object.hasOwn(pkg.exports, subpath),
        `missing "${subpath}" in packages/runable/package.json exports`,
      ).toBe(true);
    }
  });

  it("found at least one exported file to check", () => {
    // A canary: if this ever reads 0, collectExportPaths or package.json
    // itself is broken and every other test in this file is vacuous.
    expect(exportPaths.length).toBeGreaterThan(0);
  });

  it.each(exportPaths)("build output exists for exported file: %s", (relativeExportPath) => {
    const fullPath = path.join(REPO_ROOT, "packages/runable", relativeExportPath);
    expect(
      existsSync(fullPath),
      `${relativeExportPath} is declared in packages/runable/package.json "exports" ` +
        "but was not produced by `pnpm --filter runable build`.",
    ).toBe(true);
  });
});
