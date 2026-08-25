import { describe, it, expect, vi } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import {
  createFixtureDir,
  cleanupFixtureDir,
  linkWorkspacePackage,
  writeFixtureFile,
} from "../fixtures.js";

// Matches the pattern in inspector.test.ts (module isolation via
// vi.resetModules() + a fresh dynamic import per test).
async function freshInspector() {
  vi.resetModules();
  return import("runable/inspector");
}

function fixtureWithRunable(prefix: string) {
  const dir = createFixtureDir(prefix);
  linkWorkspacePackage(dir, "runable", "packages/runable");
  return dir;
}

function baseConfig(extra = "") {
  return `import { defineConfig } from "runable";\nexport default defineConfig({${extra}});\n`;
}

describe("createRunableInspector() - resolveRoute()", () => {
  it("matches a static route", async () => {
    const dir = fixtureWithRunable("resolve-route-static-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/about.vue", "<template><div>about</div></template>");

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const match = await inspector.resolveRoute("/about");
      expect(match).toEqual({
        route: { name: "about", path: "/about", file: "app/pages/about.vue" },
        params: {},
        query: {},
        hash: "",
      });
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("matches a dynamic route and extracts its param", async () => {
    const dir = fixtureWithRunable("resolve-route-dynamic-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/users/[id].vue",
        "<template><div>user</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const match = await inspector.resolveRoute("/users/42");
      expect(match?.route.file).toBe("app/pages/users/[id].vue");
      expect(match?.params).toEqual({ id: "42" });
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("matches an optional param present or absent", async () => {
    const dir = fixtureWithRunable("resolve-route-optional-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/blog/[[slug]].vue",
        "<template><div>blog</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const withoutSlug = await inspector.resolveRoute("/blog");
      expect(withoutSlug?.params).toEqual({});

      const withSlug = await inspector.resolveRoute("/blog/hello");
      expect(withSlug?.params).toEqual({ slug: "hello" });

      expect(withoutSlug?.route.file).toBe(withSlug?.route.file);
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("matches a catch-all across multiple segments", async () => {
    const dir = fixtureWithRunable("resolve-route-catchall-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/docs/[...path].vue",
        "<template><div>docs</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const match = await inspector.resolveRoute("/docs/a/b/c");
      expect(match?.route.file).toBe("app/pages/docs/[...path].vue");
      // Faithful to Vue Router's own semantics for a `(.*)` capture group
      // (the same pattern Inspector's own getRoutes() already produces for
      // `[...slug]`): one string, not an array — see resolve-route.ts's doc.
      expect(match?.params).toEqual({ path: "a/b/c" });
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("matches the correct route in a nested hierarchy, distinct from its parent", async () => {
    const dir = fixtureWithRunable("resolve-route-nested-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/users.vue", "<template><router-view /></template>");
      writeFixtureFile(
        dir,
        "app/pages/users/index.vue",
        "<template><div>users</div></template>",
      );
      writeFixtureFile(
        dir,
        "app/pages/users/[id].vue",
        "<template><div>user</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const listMatch = await inspector.resolveRoute("/users");
      expect(listMatch?.route.file).toBe("app/pages/users/index.vue");

      const detailMatch = await inspector.resolveRoute("/users/42");
      expect(detailMatch?.route.file).toBe("app/pages/users/[id].vue");
      expect(detailMatch?.params).toEqual({ id: "42" });
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("returns null for a path with no matching route, without throwing", async () => {
    const dir = fixtureWithRunable("resolve-route-not-found-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      await expect(inspector.resolveRoute("/does-not-exist")).resolves.toBeNull();
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("respects a definePageMeta() custom path/name override", async () => {
    const dir = fixtureWithRunable("resolve-route-custom-path-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/account.vue",
        `<script setup>
definePageMeta({ name: "my-account", path: "/account/settings" });
</script>
<template><div>account</div></template>
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      // The file-name-derived path must NOT match anymore.
      await expect(inspector.resolveRoute("/account")).resolves.toBeNull();

      const match = await inspector.resolveRoute("/account/settings");
      expect(match?.route).toEqual({
        name: "my-account",
        path: "/account/settings",
        file: "app/pages/account.vue",
      });
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("parses query and hash without affecting path matching", async () => {
    const dir = fixtureWithRunable("resolve-route-query-hash-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/users/[id].vue",
        "<template><div>user</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const match = await inspector.resolveRoute("/users/42?tab=profile#bio");
      expect(match?.params).toEqual({ id: "42" });
      expect(match?.query).toEqual({ tab: "profile" });
      expect(match?.hash).toBe("#bio");
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("does not currently resolve a definePageMeta() alias — a documented v1 scope boundary", async () => {
    // getRoutes() DOES preserve `alias` (inside `meta`, as an opaque
    // pass-through value — Inspector never interprets definePageMeta()
    // fields beyond name/path/middleware). resolveRoute() deliberately
    // doesn't read `meta.alias` either: doing so would mean this "matching"
    // API starts *interpreting* an undiscovered routing concept, which
    // belongs to route discovery (getRoutes()), not matching against
    // already-discovered routes — see resolve-route.ts's module doc and
    // the project report's "Existing routing limitation" section.
    const dir = fixtureWithRunable("resolve-route-alias-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/account.vue",
        `<script setup>
definePageMeta({ path: "/account/settings", alias: ["/settings"] });
</script>
<template><div>account</div></template>
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const routes = await inspector.getRoutes();
      expect(routes[0]?.meta?.alias).toEqual(["/settings"]);

      await expect(inspector.resolveRoute("/account/settings")).resolves.toMatchObject({
        route: { file: "app/pages/account.vue" },
      });
      await expect(inspector.resolveRoute("/settings")).resolves.toBeNull();
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("rejects a path that doesn't start with '/' with a clear error, not a Vue Router internal one", async () => {
    const dir = fixtureWithRunable("resolve-route-invalid-input-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");

      const { createRunableInspector, RunableInspectorError } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      await expect(inspector.resolveRoute("about")).rejects.toThrow(RunableInspectorError);
      await expect(inspector.resolveRoute("")).rejects.toThrow(RunableInspectorError);
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("aggregates routes contributed by a module, matching them too", async () => {
    const dir = fixtureWithRunable("resolve-route-module-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/blog"] });
`,
      );
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "modules/blog/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule({ meta: { name: "blog" }, pages: ["./pages"] });
`,
      );
      writeFixtureFile(
        dir,
        "modules/blog/pages/posts.vue",
        "<template><div>posts</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const match = await inspector.resolveRoute("/posts");
      expect(match?.route.file).toBe("modules/blog/pages/posts.vue");
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("survives JSON.stringify() unchanged, matching the rest of the Inspector's serialization contract", async () => {
    const dir = fixtureWithRunable("resolve-route-serialization-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/users/[id].vue",
        "<template><div>user</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const match = await inspector.resolveRoute("/users/42?tab=profile#bio");
      expect(() => JSON.stringify(match)).not.toThrow();
      expect(JSON.parse(JSON.stringify(match))).toEqual(match);
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  describe("refresh()", () => {
    it("keeps returning the stale (null) result until refresh() is called, then reflects the new page", async () => {
      const dir = fixtureWithRunable("resolve-route-refresh-");
      try {
        writeFixtureFile(dir, "runable.config.ts", baseConfig());
        writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");

        const { createRunableInspector } = await freshInspector();
        const inspector = await createRunableInspector({ rootDir: dir });

        await expect(inspector.resolveRoute("/about")).resolves.toBeNull();

        writeFixtureFile(dir, "app/pages/about.vue", "<template><div>about</div></template>");

        // Same contract as every other getter: no implicit refresh.
        await expect(inspector.resolveRoute("/about")).resolves.toBeNull();

        await inspector.refresh();

        const match = await inspector.resolveRoute("/about");
        expect(match?.route.file).toBe("app/pages/about.vue");
      } finally {
        cleanupFixtureDir(dir);
      }
    });
  });

  describe("parity with a real, independently-constructed Vue Router matcher", () => {
    it("matches exactly what Vue Router itself would, for the same route records", async () => {
      const dir = fixtureWithRunable("resolve-route-parity-");
      try {
        writeFixtureFile(dir, "runable.config.ts", baseConfig());
        writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
        writeFixtureFile(
          dir,
          "app/pages/users/[id].vue",
          "<template><div>user</div></template>",
        );
        writeFixtureFile(
          dir,
          "app/pages/blog/[[slug]].vue",
          "<template><div>blog</div></template>",
        );
        writeFixtureFile(
          dir,
          "app/pages/docs/[...path].vue",
          "<template><div>docs</div></template>",
        );

        const { createRunableInspector } = await freshInspector();
        const inspector = await createRunableInspector({ rootDir: dir });
        const routes = await inspector.getRoutes();

        // Independent reference matcher, built directly from getRoutes()'s
        // own output via the exact same public Vue Router API — not
        // resolve-route.ts's implementation, so this can't just be
        // circularly correct with itself.
        const referenceRouter = createRouter({
          history: createMemoryHistory(),
          routes: routes.map((route) => ({ path: route.path, name: route.name, component: {} })),
        });

        for (const input of [
          "/",
          "/users/42",
          "/blog",
          "/blog/hello",
          "/docs/a/b/c",
          "/does-not-exist",
        ]) {
          const fromInspector = await inspector.resolveRoute(input);
          const fromReference = referenceRouter.resolve(input);
          const referenceMatched = fromReference.matched.at(-1);

          if (!referenceMatched) {
            expect(fromInspector, `mismatch for ${input}`).toBeNull();
          } else {
            expect(fromInspector, `mismatch for ${input}`).not.toBeNull();
            expect(fromInspector?.params, `params mismatch for ${input}`).toEqual(
              fromReference.params,
            );
            expect(fromInspector?.route.path, `path mismatch for ${input}`).toBe(
              referenceMatched.path,
            );
          }
        }
      } finally {
        cleanupFixtureDir(dir);
      }
    });
  });

  describe("read-only", () => {
    it("resolveRoute() never writes .app/ or any other generated file", async () => {
      const { existsSync } = await import("node:fs");
      const path = await import("node:path");
      const dir = fixtureWithRunable("resolve-route-read-only-");
      try {
        writeFixtureFile(dir, "runable.config.ts", baseConfig());
        writeFixtureFile(
          dir,
          "app/pages/users/[id].vue",
          "<template><div>user</div></template>",
        );

        const { createRunableInspector } = await freshInspector();
        const inspector = await createRunableInspector({ rootDir: dir });

        await inspector.resolveRoute("/users/1");
        await inspector.resolveRoute("/users/2");
        await inspector.resolveRoute("/does-not-exist");
        await inspector.refresh();
        await inspector.resolveRoute("/users/3");

        expect(existsSync(path.join(dir, ".app"))).toBe(false);
      } finally {
        cleanupFixtureDir(dir);
      }
    });
  });
});
