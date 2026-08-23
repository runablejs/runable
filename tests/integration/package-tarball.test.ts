import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  mkdtempSync,
  rmSync,
  readdirSync,
  copyFileSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT, readJson, pnpm, collectExportPaths } from "../helpers.js";

interface PackedPackage {
  files: string[];
  packageJson: Record<string, any>;
  cleanup: () => void;
}

/** Packs a package with `pnpm pack` (never publishes) and inspects the
 * resulting tarball's file listing and package.json. `pnpm pack` is the
 * mechanism this monorepo relies on: unlike a plain `npm pack`, it rewrites
 * `workspace:*`/`workspace:^` internal dependency ranges to real semver
 * ranges and pulls in the workspace-root LICENSE — both verified manually
 * before writing this helper. */
function packAndInspect(pkgRelativeDir: string): PackedPackage {
  const tmpDir = mkdtempSync(path.join(tmpdir(), "pack-inspect-"));
  const pkgDir = path.join(REPO_ROOT, pkgRelativeDir);

  const result = pnpm(["pack", "--pack-destination", tmpDir], { cwd: pkgDir });
  if (result.status !== 0) {
    rmSync(tmpDir, { recursive: true, force: true });
    throw new Error(
      `pnpm pack failed in ${pkgRelativeDir}:\n${result.stdout}\n${result.stderr}`,
    );
  }

  const tarballName = readdirSync(tmpDir).find((f) => f.endsWith(".tgz"));
  if (!tarballName) {
    rmSync(tmpDir, { recursive: true, force: true });
    throw new Error(`pnpm pack produced no tarball in ${pkgRelativeDir}`);
  }
  const tarballPath = path.join(tmpDir, tarballName);

  const listing = spawnSync("tar", ["-tzf", tarballPath], { encoding: "utf8" });
  const files = listing.stdout
    .split("\n")
    .filter(Boolean)
    .map((f) => f.replace(/^package\//, ""));

  spawnSync("tar", ["-xzf", tarballPath, "-C", tmpDir], { encoding: "utf8" });
  const packageJson = JSON.parse(
    readFileSync(path.join(tmpDir, "package", "package.json"), "utf8"),
  );

  return {
    files,
    packageJson,
    cleanup: () => rmSync(tmpDir, { recursive: true, force: true }),
  };
}

/** A `workspace:*`/`workspace:^` range left untouched in a packed tarball
 * would be uninstallable once published — npm has no idea what
 * "workspace:^" means. */
function expectWorkspaceRangeWasRewritten(range: string | undefined, depName: string) {
  expect(range, `"${depName}" dependency is missing from the packed package.json`).toBeDefined();
  expect(
    range!.startsWith("workspace:"),
    `"${depName}": "${range}" was packed as-is — the workspace protocol was never ` +
      "rewritten to a real semver range.",
  ).toBe(false);
}

describe("runable npm tarball", () => {
  const readmeCopyPath = path.join(REPO_ROOT, "packages/runable/README.md");
  let pack: PackedPackage;

  beforeAll(() => {
    // Mirrors the "Copy README to runable package" step in
    // .github/workflows/release.yml: README.md is not committed inside
    // packages/runable, only copied there right before packing.
    copyFileSync(path.join(REPO_ROOT, "README.md"), readmeCopyPath);
    pack = packAndInspect("packages/runable");
  });

  afterAll(() => {
    rmSync(readmeCopyPath, { force: true });
    pack?.cleanup();
  });

  it("contains the minimum required files", () => {
    for (const expected of [
      "package.json",
      "README.md",
      "LICENSE",
      "dist/index.js",
      "dist/index.d.ts",
    ]) {
      expect(pack.files, `tarball is missing ${expected}`).toContain(expected);
    }
  });

  it("contains every declared export", () => {
    const pkg = readJson("packages/runable/package.json");
    for (const exportPath of collectExportPaths(pkg.exports)) {
      const normalized = exportPath.replace(/^\.\//, "");
      expect(pack.files, `tarball is missing exported file ${exportPath}`).toContain(
        normalized,
      );
    }
  });
});

describe("@runablejs/cli npm tarball", () => {
  let pack: PackedPackage;

  beforeAll(() => {
    pack = packAndInspect("packages/cli");
  });

  afterAll(() => pack?.cleanup());

  it("contains its bin target and package.json", () => {
    expect(pack.files).toContain("package.json");
    expect(pack.files).toContain("dist/index.js");
  });

  it("does not leave the `runable` workspace dependency unresolved", () => {
    expectWorkspaceRangeWasRewritten(pack.packageJson.dependencies?.runable, "runable");
  });

  it("ships the AGENTS.md template used to scaffold new projects", () => {
    // Regression guard: "files" must list "templates", or `runable create`
    // is broken for every real npm install (it resolves this template
    // relative to the installed package, not the monorepo).
    expect(pack.files).toContain("templates/default/AGENTS.md");
  });

  it("ships every skills/runable-*/SKILL.md next to dist/ and templates/", () => {
    // Regression guard: "files" must list "skills", and
    // scripts/copy-skills.ts must actually run before packing — or
    // `runable skills install` is broken for every real npm install (see
    // packages/cli/src/commands/skills/bundle.ts, which resolves this
    // directory relative to the installed package).
    const skillDirs = readdirSync(path.join(REPO_ROOT, "skills"), {
      withFileTypes: true,
    }).filter((entry) => entry.isDirectory());

    expect(skillDirs.length).toBeGreaterThan(0);

    for (const entry of skillDirs) {
      expect(pack.files).toContain(`skills/${entry.name}/SKILL.md`);
    }
  });
});

describe("create-runable npm tarball", () => {
  let pack: PackedPackage;

  beforeAll(() => {
    pack = packAndInspect("packages/create-syora");
  });

  afterAll(() => pack?.cleanup());

  it("contains its bin entry", () => {
    expect(pack.files).toContain("bin/create-runable.mjs");
  });

  it("does not leave the `@runablejs/cli` workspace dependency unresolved", () => {
    expectWorkspaceRangeWasRewritten(
      pack.packageJson.dependencies?.["@runablejs/cli"],
      "@runablejs/cli",
    );
  });
});
