import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  createFixtureDir,
  cleanupFixtureDir,
  linkWorkspacePackage,
  writeFixtureFile,
} from "../fixtures.js";
import { REPO_ROOT, readJson, runTsc } from "../helpers.js";

describe("regression #001 - Unhead packages stay on compatible versions", () => {
  it("declares the same major.minor for unhead, @unhead/vue and @unhead/schema-org in the pnpm catalog", () => {
    // Deliberately not a real `pnpm install`/registry check (no network,
    // deterministic) and not a hand-rolled semver-range intersection engine
    // (too fragile) — just a same-major.minor sanity check on the catalog
    // entries these three packages actually resolve from.
    const workspaceYaml = readFileSync(path.join(REPO_ROOT, "pnpm-workspace.yaml"), "utf8");

    function catalogVersion(pkg: string): string {
      const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = workspaceYaml.match(
        new RegExp(`^\\s*"?${escaped}"?:\\s*(\\S+)\\s*$`, "m"),
      );
      expect(match, `"${pkg}" not found in pnpm-workspace.yaml's catalog`).not.toBeNull();
      return match![1]!.replace(/^[\^~]/, "");
    }

    function majorMinor(version: string): string {
      const [major, minor] = version.split(".");
      return `${major}.${minor}`;
    }

    const unhead = catalogVersion("unhead");
    const unheadVue = catalogVersion("@unhead/vue");
    const unheadSchemaOrg = catalogVersion("@unhead/schema-org");

    expect(
      { unhead: majorMinor(unhead), "@unhead/vue": majorMinor(unheadVue) },
      "unhead and @unhead/vue must stay on the same major.minor — a repeat of the historical peer conflict looks exactly like these drifting apart",
    ).toEqual({ unhead: majorMinor(unheadVue), "@unhead/vue": majorMinor(unheadVue) });

    expect(majorMinor(unheadSchemaOrg)).toBe(majorMinor(unheadVue));
  });
});

describe("regression #002 - importing only defineConfig does not require adapter frameworks", () => {
  it("typechecks a minimal consumer project with none of express/fastify/hono/koa/@adonisjs/core/@nestjs/common installed", () => {
    const dir = createFixtureDir("bug002-");
    try {
      linkWorkspacePackage(dir, "runable", "packages/runable");
      // Deliberately not installing any adapter framework — that's the
      // whole point of the regression.
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({});
`,
      );
      writeFixtureFile(
        dir,
        "tsconfig.json",
        JSON.stringify(
          {
            compilerOptions: {
              module: "preserve",
              moduleResolution: "bundler",
              target: "ES2022",
              strict: true,
              noEmit: true,
              types: [],
            },
            include: ["runable.config.ts"],
          },
          null,
          2,
        ),
      );

      const result = runTsc(["--noEmit", "-p", "tsconfig.json"], { cwd: dir });
      expect(
        result.status,
        `tsc failed on a defineConfig-only consumer:\n${result.stdout}\n${result.stderr}`,
      ).toBe(0);
      expect(result.stdout + result.stderr).not.toMatch(
        /express|fastify|\bhono\b|\bkoa\b|@adonisjs|@nestjs/i,
      );
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("regression #012 - already covered", () => {
  it.skip(
    "@runablejs/cli depends on a valid, resolvable runable version — see tests/integration/package-tarball.test.ts and workspace-resolution.test.ts",
    () => {},
  );
});

describe("regression #013 - the CLI reports its own package.json version (KNOWN, NOT YET FIXED)", () => {
  // packages/cli/src/index.ts hardcodes `const version = "0.1.1"`, wired
  // into citty's `meta.version` and printed by `runable --help`. It has
  // never tracked package.json's real version. Still open per
  // bugs/SUIVI-DES-BUGS.md ("013 | ... | ⏳ À traiter"). Do NOT fix the
  // implementation here — `it.fails` keeps this test executing (so CI
  // notices the moment it's fixed) without turning the suite red. Remove
  // `.fails` once packages/cli/src/index.ts reads its version from
  // package.json instead of a hardcoded string.
  it.fails("`runable --help` reports the same version as package.json", () => {
    const pkg = readJson("packages/cli/package.json");
    const binPath = path.join(REPO_ROOT, "packages/cli/dist/index.js");

    const result = spawnSync(binPath, ["--help"], { encoding: "utf8" });

    expect(result.stdout).toContain(`(runable v${pkg.version})`);
  });
});
