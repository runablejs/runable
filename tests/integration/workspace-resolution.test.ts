import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { REPO_ROOT, readJson, pnpm } from "../helpers.js";

/**
 * Regression coverage for:
 *   packages/cli:
 *   Cannot find module 'runable' or its corresponding type declarations
 *
 * ...followed by a bad fix attempt (a tsconfig `paths` override pointing
 * straight at packages/runable/src) that caused TS6059, unresolved `@/*`
 * aliases, and "window is not defined" by dragging runable's Vue/DOM
 * sources into the CLI's TypeScript program.
 *
 * The correct behavior: `runable` is built first, and the CLI is
 * typechecked against its published dist/index.d.ts like any real
 * consumer would be — never against its sources.
 */
describe("@runablejs/cli <-> runable workspace resolution", () => {
  it("declares `runable` as a runtime dependency, not a devDependency", () => {
    const pkg = readJson("packages/cli/package.json");
    // Runtime code does `import { build } from "runable"` — if this were a
    // devDependency, a real `npm install @runablejs/cli` would not pull in
    // `runable` at all and the CLI would be broken for every user.
    expect(pkg.dependencies?.runable).toBe("workspace:^");
    expect(pkg.devDependencies?.runable).toBeUndefined();
  });

  it("never maps the `runable` module to its internal src via tsconfig paths", () => {
    const tsconfigFiles = [
      "tsconfig.json",
      "tsconfig.base.json",
      ...fs.globSync("packages/*/tsconfig*.json", { cwd: REPO_ROOT }),
    ];

    for (const relativePath of tsconfigFiles) {
      const fullPath = path.join(REPO_ROOT, relativePath);
      // ts.readConfigFile tolerates the comments/trailing commas that show
      // up in this repo's tsconfig files, unlike JSON.parse.
      const { config } = ts.readConfigFile(fullPath, ts.sys.readFile);
      const paths = config?.compilerOptions?.paths as
        | Record<string, string[]>
        | undefined;
      if (!paths) continue;

      for (const [alias, targets] of Object.entries(paths)) {
        const pointsAtRunableSrc =
          alias === "runable" ||
          targets.some((target) => target.includes("packages/runable/src"));

        expect(
          pointsAtRunableSrc,
          `${relativePath} maps "${alias}" -> ${JSON.stringify(targets)}. That resolves ` +
            `the "runable" module straight to its sources instead of its published dist — ` +
            `this is exactly the change that caused TS6059 and unresolved DOM/@ aliases ` +
            `in the CLI's typecheck. Remove it; runable must be resolved via its own ` +
            `package.json (dist/index.d.ts), never via a paths override.`,
        ).toBe(false);
      }
    }
  });

  it("typechecks @runablejs/cli cleanly against a freshly built `runable` (no stale dist)", () => {
    const result = pnpm(["--filter", "@runablejs/cli", "typecheck"]);
    expect(
      result.status,
      `pnpm --filter @runablejs/cli typecheck failed:\n${result.stdout}\n${result.stderr}`,
    ).toBe(0);
  });

  it('resolves `import ... from "runable"` to the built declarations, not the source', () => {
    const result = pnpm(
      ["exec", "tsc", "--noEmit", "-p", "tsconfig.json", "--traceResolution"],
      { cwd: path.join(REPO_ROOT, "packages/cli") },
    );

    const resolutionLine = result.stdout
      .split("\n")
      .find((line) =>
        line.includes("Module name 'runable' was successfully resolved to"),
      );

    expect(
      resolutionLine,
      "Could not find a trace line resolving the `runable` module at all — " +
        "was the traceResolution output empty or the module unresolved?",
    ).toBeDefined();
    expect(resolutionLine).toContain(
      path.join("packages", "runable", "dist", "index.d.ts"),
    );
    expect(resolutionLine).not.toContain(
      path.join("packages", "runable", "src"),
    );
  });

  it("keeps `pnpm build` before `pnpm typecheck` in ci:local (runable must be built first)", () => {
    const rootPkg = readJson("package.json");
    const script: string = rootPkg.scripts["ci:local"];
    const buildIndex = script.indexOf("pnpm build");
    const typecheckIndex = script.indexOf("pnpm typecheck");

    expect(buildIndex, '"pnpm build" not found in ci:local').toBeGreaterThanOrEqual(0);
    expect(
      typecheckIndex,
      '"pnpm typecheck" not found in ci:local',
    ).toBeGreaterThanOrEqual(0);
    expect(
      typecheckIndex,
      "ci:local typechecks before building — runable/dist/index.d.ts would " +
        "not exist yet and the CLI's typecheck would fail on a clean checkout.",
    ).toBeGreaterThan(buildIndex);
  });

  it("keeps ci.yml building `runable` before typechecking the CLI", () => {
    const ciYaml = readFileSync(
      path.join(REPO_ROOT, ".github/workflows/ci.yml"),
      "utf8",
    );
    const buildIndex = ciYaml.indexOf("run: pnpm build");
    const typecheckIndex = ciYaml.indexOf("run: pnpm typecheck");

    expect(buildIndex).toBeGreaterThanOrEqual(0);
    expect(typecheckIndex).toBeGreaterThanOrEqual(0);
    expect(typecheckIndex).toBeGreaterThan(buildIndex);
  });
});
