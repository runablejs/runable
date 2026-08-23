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
}
