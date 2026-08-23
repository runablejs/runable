import { describe, it, expect } from "vitest";
import { existsSync, mkdtempSync, rmSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT, readJson, pnpm } from "../helpers.js";

/**
 * Regression coverage for create-runable's bin failing with
 * "Cannot find @runablejs/cli": it resolved the deep, non-exported
 * subpath "@runablejs/cli/dist/index.js", which Node's module resolution
 * refuses once a package declares an "exports" map that doesn't list that
 * subpath — even though the file physically exists on disk.
 */
describe("create-runable bin", () => {
  const pkg = readJson("packages/create-syora/package.json");
  const binRelative: string = pkg.bin["create-runable"];
  const binPath = path.join(REPO_ROOT, "packages/create-syora", binRelative);

  it("declares its bin target and that file exists on disk", () => {
    expect(binRelative).toBe("./bin/create-runable.mjs");
    expect(existsSync(binPath)).toBe(true);
  });

  it("resolves @runablejs/cli through its public export map, not a deep subpath", () => {
    const source = readFileSync(binPath, "utf8");
    expect(
      source.includes('require.resolve("@runablejs/cli/dist/index.js")'),
      "resolving the deep subpath bypasses @runablejs/cli's \"exports\" map " +
        '(which only declares ".") and throws ERR_PACKAGE_PATH_NOT_EXPORTED ' +
        'once installed as a real dependency. Resolve "@runablejs/cli" itself instead.',
    ).toBe(false);
  });

  it("is included in the packed tarball", () => {
    const tmpDir = mkdtempSync(path.join(tmpdir(), "create-runable-pack-"));
    try {
      const result = pnpm(["pack", "--pack-destination", tmpDir], {
        cwd: path.join(REPO_ROOT, "packages/create-syora"),
      });
      expect(result.status, result.stderr).toBe(0);

      const tarballName = readdirSync(tmpDir).find((f) => f.endsWith(".tgz"));
      expect(tarballName, "pnpm pack did not produce a tarball").toBeDefined();

      const listing = spawnSync("tar", ["-tzf", path.join(tmpDir, tarballName!)], {
        encoding: "utf8",
      });
      expect(listing.status).toBe(0);
      expect(listing.stdout).toContain("package/bin/create-runable.mjs");
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("starts and prints usage with --help, without creating any files (non-destructive)", () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "create-runable-run-"));
    try {
      const result = spawnSync(process.execPath, [binPath, "--help"], {
        cwd,
        encoding: "utf8",
      });
      expect(
        result.status,
        `create-runable.mjs --help failed:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
      ).toBe(0);
      expect(readdirSync(cwd)).toHaveLength(0);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
