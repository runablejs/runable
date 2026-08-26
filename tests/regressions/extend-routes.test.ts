import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "../helpers.js";

function source(file: string): string {
  return readFileSync(path.join(REPO_ROOT, file), "utf8");
}

describe("RunableConfig.extendRoutes", () => {
  it("exposes a typed route-tree hook and preserves it in resolved config", () => {
    const types = source("packages/runable/src/config/types.ts");
    const resolver = source("packages/runable/src/config/resolve.ts");

    expect(types).toContain("extendRoutes?: (routes: EditableRouteTreeNode)");
    expect(types).toContain('extendRoutes: RunableConfig["extendRoutes"]');
    expect(resolver).toContain("extendRoutes: config.extendRoutes");
  });

  it("passes the composed hook to Vue Router beforeWriteFiles", () => {
    const builder = source("packages/runable/src/router/builder.ts");
    const vite = source("packages/runable/src/vite/config.ts");

    expect(builder).toContain(
      "extendRoutes?.(root as unknown as EditableRouteTreeNode)",
    );
    expect(vite).toContain("config.extendRoutes");
    expect(vite).toContain("await hook(routes)");
    expect(vite).toContain("buildRoutes(_pages, extendRoutes)");
  });
});
