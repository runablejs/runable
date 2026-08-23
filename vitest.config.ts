import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/setup/global-setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // These are integration tests that shell out to pnpm/tsc/tar and share
    // a single build produced by globalSetup — running test files in
    // parallel workers buys nothing here and risks CPU contention on
    // smaller CI runners, so keep it deterministic and sequential.
    fileParallelism: false,
  },
});
