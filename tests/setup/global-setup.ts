import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

/**
 * Runs once before the whole test suite. Deliberately removes both dist/
 * folders first: the regression this protects against (TS6059, unresolved
 * `runable` module, stale-dist typechecks) only reproduces on a clean
 * checkout, not when an old build happens to already be lying around.
 */
export default function setup() {
  rmSync(path.join(REPO_ROOT, "packages/runable/dist"), {
    recursive: true,
    force: true,
  });
  rmSync(path.join(REPO_ROOT, "packages/cli/dist"), {
    recursive: true,
    force: true,
  });

  const result = spawnSync("pnpm", ["build"], {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(
      "`pnpm build` failed during the test suite's global setup — see the build output above.",
    );
  }

  // Vite transforms the website scripts imported by integration tests with
  // the website's project references. Generate the ignored app tsconfig first
  // so a clean CI checkout does not fail while collecting those test files.
  const prepareWebsiteConfig = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'import { loadConfig, writeTsConfig } from "runable"; await loadConfig(); writeTsConfig();',
    ],
    {
      cwd: path.join(REPO_ROOT, "website"),
      stdio: "inherit",
    },
  );

  if (prepareWebsiteConfig.status !== 0) {
    throw new Error(
      "Generating the website tsconfig failed during the test suite's global setup — see the output above.",
    );
  }
}
