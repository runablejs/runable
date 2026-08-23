import { describe, it, expect, afterEach, vi } from "vitest";
import path from "node:path";
import { existsSync } from "node:fs";
import {
  createFixtureDir,
  cleanupFixtureDir,
  linkWorkspacePackage,
  writeFixtureFile,
} from "../fixtures.js";

// `createRunableInspector()` resolves through `resolveConfigGraph()`
// (packages/runable/src/config/load.ts), which has no module-level cache
// of its own — it doesn't touch loadConfig()'s cache, generate Runable
// files, or depend on process.cwd(). It does still execute the project's
// runable.config.* files and module setup() hooks, ordinary project code
// that can have its own side effects — see resolveConfigGraph()'s and the
// Inspector's own doc for the precise contract. Most tests below don't
// strictly need module isolation anymore, but still get a fresh instance
// via `vi.resetModules()` + a fresh dynamic `import("runable/inspector")`,
// matching the pattern already used in config.test.ts. A few tests
// specifically need to *share* a module instance with `loadConfig()`'s own
// cache (the "global cache" tests below) — those import directly instead.
const originalCwd = process.cwd();

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

afterEach(() => {
  process.chdir(originalCwd);
});

describe("createRunableInspector() - project detection", () => {
  it("resolves a valid Runable project", async () => {
    const dir = fixtureWithRunable("inspector-valid-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const project = await inspector.getProject();

      expect(project.rootDir).toBe(dir);
      expect(project.paths.appDir).toBe("app");
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("rejects a directory with no runable.config.* with an explicit, exploitable error", async () => {
    const dir = createFixtureDir("inspector-no-project-");
    try {
      const { createRunableInspector, RunableInspectorError } = await freshInspector();

      await expect(createRunableInspector({ rootDir: dir })).rejects.toThrow(
        RunableInspectorError,
      );
      await expect(createRunableInspector({ rootDir: dir })).rejects.toThrow(
        /No Runable project found/i,
      );
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("does not search parent directories for a config file", async () => {
    const parent = fixtureWithRunable("inspector-parent-");
    try {
      writeFixtureFile(parent, "runable.config.ts", baseConfig());
      const child = path.join(parent, "nested/child");
      writeFixtureFile(child, ".keep", "");

      const { createRunableInspector, RunableInspectorError } = await freshInspector();
      await expect(createRunableInspector({ rootDir: child })).rejects.toThrow(
        RunableInspectorError,
      );
    } finally {
      cleanupFixtureDir(parent);
    }
  });
});

describe("createRunableInspector() - getProject()/getConfig() custom directories", () => {
  it("reflects a custom pages/layouts directory", async () => {
    const dir = fixtureWithRunable("inspector-custom-dirs-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        baseConfig(`pages: ["src/views"], layouts: ["src/layouts"]`),
      );
      writeFixtureFile(dir, "src/views/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(dir, "src/layouts/default.vue", "<template><slot /></template>");

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const routes = await inspector.getRoutes();
      expect(routes).toEqual([{ name: "index", path: "/", file: "src/views/index.vue" }]);

      const layouts = await inspector.getLayouts();
      expect(layouts).toEqual([{ name: "default", file: "src/layouts/default.vue" }]);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - getRoutes()", () => {
  it("matches the real vue-router/vite pipeline for index/dynamic/optional/catch-all/nested routes", async () => {
    // Ground truth for this fixture's expected paths/names was captured by
    // actually running the real pipeline (packages/runable's `prepare()`)
    // against the same file layout and reading its generated
    // `.app/router-routes.d.ts` — not guessed at. See routes.ts's module
    // doc for why this can't just delegate to the real pipeline directly.
    const dir = fixtureWithRunable("inspector-routes-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(dir, "app/pages/users.vue", "<template><router-view /></template>");
      writeFixtureFile(dir, "app/pages/users/index.vue", "<template><div>users</div></template>");
      writeFixtureFile(dir, "app/pages/users/[id].vue", "<template><div>user</div></template>");
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

      const byName = Object.fromEntries(routes.map((r) => [r.name, r]));

      expect(byName["index"]).toMatchObject({ path: "/", file: "app/pages/index.vue" });
      expect(byName["users"]).toMatchObject({ path: "/users", file: "app/pages/users.vue" });
      expect(byName["users-index"]).toMatchObject({
        path: "/users",
        file: "app/pages/users/index.vue",
        parent: "app/pages/users.vue",
      });
      expect(byName["users-id"]).toMatchObject({
        path: "/users/:id",
        file: "app/pages/users/[id].vue",
        parent: "app/pages/users.vue",
      });
      expect(byName["blog-slug"]).toMatchObject({
        path: "/blog/:slug?",
        file: "app/pages/blog/[[slug]].vue",
      });
      expect(byName["docs-path"]).toMatchObject({
        path: "/docs/:path(.*)",
        file: "app/pages/docs/[...path].vue",
      });
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("reflects definePageMeta() name/path/middleware overrides", async () => {
    const dir = fixtureWithRunable("inspector-route-meta-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(
        dir,
        "app/pages/account.vue",
        `<script setup>
definePageMeta({ name: "my-account", path: "/account/settings", middleware: ["auth"] });
</script>
<template><div>account</div></template>
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const routes = await inspector.getRoutes();

      expect(routes).toEqual([
        {
          name: "my-account",
          path: "/account/settings",
          file: "app/pages/account.vue",
          meta: { middleware: ["auth"] },
        },
      ]);
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("aggregates pages contributed by a module, not just the main app", async () => {
    // Matches the real pipeline's own aggregation (vite/config.ts pushes
    // every config's `pages` — main app and every module — into one
    // combined routesFolder list for a single VueRouter() instance).
    const dir = fixtureWithRunable("inspector-routes-module-");
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
export default defineModule({
  meta: { name: "blog" },
  pages: ["./pages"],
});
`,
      );
      writeFixtureFile(
        dir,
        "modules/blog/pages/posts.vue",
        "<template><div>posts</div></template>",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const routes = await inspector.getRoutes();

      expect(routes.map((r) => r.name).sort()).toEqual(["index", "posts"]);
      expect(routes.find((r) => r.name === "posts")).toMatchObject({
        path: "/posts",
        file: "modules/blog/pages/posts.vue",
      });
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - getMiddlewares()", () => {
  it("distinguishes named and .global middlewares", async () => {
    const dir = fixtureWithRunable("inspector-middlewares-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "app/middlewares/auth.ts",
        "export default defineVueMiddleware((to, from) => {});",
      );
      writeFixtureFile(
        dir,
        "app/middlewares/logger.global.ts",
        "export default defineVueMiddleware((to, from) => {});",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const middlewares = await inspector.getMiddlewares();

      const byName = Object.fromEntries(middlewares.map((m) => [m.name, m]));
      expect(byName["auth"]).toEqual({
        name: "auth",
        file: "app/middlewares/auth.ts",
        global: false,
      });
      expect(byName["logger"]).toEqual({
        name: "logger",
        file: "app/middlewares/logger.global.ts",
        global: true,
      });
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - getPlugins()", () => {
  it("statically extracts name/enforce/dependsOn without executing the plugin", async () => {
    const dir = fixtureWithRunable("inspector-plugins-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "app/plugins/analytics.ts",
        `import { defineVuePlugin } from "runable";
export default defineVuePlugin({
  name: "analytics",
  enforce: "post",
  dependsOn: ["auth"],
  setup(app) {
    throw new Error("must never run: the Inspector must not execute plugin files");
  },
});
`,
      );
      writeFixtureFile(
        dir,
        "app/plugins/anonymous.ts",
        `import { defineVuePlugin } from "runable";
export default defineVuePlugin({
  setup(app) {},
});
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const plugins = await inspector.getPlugins();

      expect(plugins).toEqual(
        expect.arrayContaining([
          {
            name: "analytics",
            enforce: "post",
            dependsOn: ["auth"],
            file: "app/plugins/analytics.ts",
          },
          { file: "app/plugins/anonymous.ts" },
        ]),
      );
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - getModules()", () => {
  it("lists a local module with its configKey", async () => {
    const dir = fixtureWithRunable("inspector-modules-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/analytics"] });
`,
      );
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "modules/analytics/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule<{ token: string }>({
  meta: { name: "analytics" },
  configKey: "analytics",
  defaults: { token: "dev" },
});
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const modules = await inspector.getModules();

      expect(modules).toEqual([
        {
          name: "analytics",
          configKey: "analytics",
          source: "modules/analytics/runable.config.ts",
          kind: "local",
        },
      ]);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - getAutoImports()", () => {
  it("lists a local component and composable", async () => {
    const dir = fixtureWithRunable("inspector-auto-imports-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "app/components/BaseButton.vue",
        "<template><button><slot /></button></template>",
      );
      writeFixtureFile(
        dir,
        "app/composables/useCurrency.ts",
        "export function useCurrency() { return { format: (n: number) => `$${n}` }; }",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const autoImports = await inspector.getAutoImports();

      expect(autoImports.components).toContainEqual({
        name: "BaseButton",
        file: "app/components/BaseButton.vue",
      });
      expect(autoImports.composables).toContainEqual({
        name: "useCurrency",
        file: "app/composables/useCurrency.ts",
      });
      // Runable's own built-in composables are part of what's really
      // available in the project without an import, so they show up too.
      expect(autoImports.composables.some((c) => c.name === "useRuntime")).toBe(true);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - runtime privacy", () => {
  it("never returns a private runtime value, only its key name", async () => {
    const dir = fixtureWithRunable("inspector-runtime-privacy-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        ".env",
        "RUN_PUBLIC_API_BASE=/api\nRUN_SECRET_KEY=super-secret-value\n",
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const config = await inspector.getConfig();

      expect(config.runtime.public).toEqual({ apiBase: "/api" });
      expect(config.runtime.privateKeys).toContain("secretKey");
      expect(JSON.stringify(config)).not.toContain("super-secret-value");
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - works without a pre-existing .app/", () => {
  it("resolves a project that has never been prepared/built", async () => {
    const dir = fixtureWithRunable("inspector-no-app-dir-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      expect(existsSync(path.join(dir, ".app"))).toBe(false);

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const routes = await inspector.getRoutes();

      expect(routes).toEqual([{ name: "index", path: "/", file: "app/pages/index.vue" }]);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - does not generate Runable files", () => {
  it("never creates .app/modules-options.d.ts or any other generated file", async () => {
    // Regression guard: loadConfig() (the runtime pipeline) unconditionally
    // writes .app/modules-options.d.ts via generateModulesOptionsDts() —
    // that's a real, load-bearing side effect of loadConfig(), just not
    // one the Inspector's read-only contract can afford to inherit. The
    // Inspector resolves config through resolveConfigGraph() instead,
    // which never calls generateModulesOptionsDts() at all — this test is
    // what actually locks that in, rather than trusting the module doc.
    //
    // Scope: this only covers files *Runable itself* would generate. It
    // doesn't and can't prove "nothing on disk changes" in general — the
    // fixture's own runable.config.*/module setup() run as part of
    // resolution and could in principle write files of their own; see
    // resolveConfigGraph()'s doc for why the Inspector isn't a sandbox.
    const dir = fixtureWithRunable("inspector-no-writes-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/analytics"] });
`,
      );
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(dir, "app/layouts/default.vue", "<template><slot /></template>");
      writeFixtureFile(
        dir,
        "app/middlewares/auth.ts",
        "export default defineVueMiddleware((to, from) => {});",
      );
      writeFixtureFile(
        dir,
        "app/plugins/analytics.ts",
        `import { defineVuePlugin } from "runable";
export default defineVuePlugin({ name: "analytics", setup() {} });
`,
      );
      writeFixtureFile(dir, "app/components/BaseButton.vue", "<template><button /></template>");
      writeFixtureFile(
        dir,
        "modules/analytics/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule({ meta: { name: "analytics" }, configKey: "analytics" });
`,
      );
      expect(existsSync(path.join(dir, ".app"))).toBe(false);

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      await inspector.getProject();
      await inspector.getConfig();
      await inspector.getRoutes();
      await inspector.getLayouts();
      await inspector.getMiddlewares();
      await inspector.getPlugins();
      await inspector.getModules();
      await inspector.getAutoImports();
      await inspector.refresh();
      await inspector.getRoutes();

      expect(
        existsSync(path.join(dir, ".app")),
        ".app/ was created by createRunableInspector()/refresh() — the Inspector must not write generated output",
      ).toBe(false);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - no process.chdir()", () => {
  it("inspects rootDir without ever changing process.cwd(), even from a different cwd", async () => {
    const dir = fixtureWithRunable("inspector-no-chdir-");
    const elsewhere = createFixtureDir("inspector-elsewhere-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");

      process.chdir(elsewhere);
      const cwdBeforeCreate = process.cwd();

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      expect(process.cwd()).toBe(cwdBeforeCreate);

      const routes = await inspector.getRoutes();
      expect(routes).toEqual([{ name: "index", path: "/", file: "app/pages/index.vue" }]);
      expect(process.cwd()).toBe(cwdBeforeCreate);

      writeFixtureFile(dir, "app/pages/about.vue", "<template><div>about</div></template>");
      await inspector.refresh();
      expect(process.cwd()).toBe(cwdBeforeCreate);

      const after = await inspector.getRoutes();
      expect(after.map((r) => r.name).sort()).toEqual(["about", "index"]);
    } finally {
      cleanupFixtureDir(dir);
      cleanupFixtureDir(elsewhere);
    }
  });
});

describe("createRunableInspector() - does not disturb loadConfig()'s global cache", () => {
  it("leaves another loadConfig() consumer's cached config untouched across create()/refresh()", async () => {
    // Before the refactor, the Inspector called unloadConfig() on every
    // create()/refresh(), which would silently blow away a *different*,
    // unrelated loadConfig() consumer's cache (e.g. a live dev server) in
    // the same process. resolveConfigGraph() never touches that cache at
    // all, so this must no longer happen.
    const projectA = fixtureWithRunable("inspector-global-cache-a-");
    const projectB = fixtureWithRunable("inspector-global-cache-b-");
    try {
      writeFixtureFile(projectA, "runable.config.ts", baseConfig());
      writeFixtureFile(projectA, "app/pages/index.vue", "<template><div>a</div></template>");
      writeFixtureFile(projectB, "runable.config.ts", baseConfig());
      writeFixtureFile(projectB, "app/pages/index.vue", "<template><div>b</div></template>");

      vi.resetModules();
      const runable = await import("runable");
      const { createRunableInspector } = await import("runable/inspector");

      // An unrelated loadConfig() consumer for project A — same mechanism
      // a live dev server would use, resolved from process.cwd().
      process.chdir(projectA);
      await runable.loadConfig();
      const configABefore = runable.useConfig();
      expect(configABefore.appDir).toBe(path.join(projectA, "app"));

      // An Inspector for a *different* project, created and refreshed from
      // a *different* cwd.
      process.chdir(originalCwd);
      const inspector = await createRunableInspector({ rootDir: projectB });
      await inspector.refresh();
      const project = await inspector.getProject();
      expect(project.rootDir).toBe(projectB);

      // Project A's cache must be the exact same object — proof the
      // Inspector never cleared it.
      expect(runable.useConfig()).toBe(configABefore);
    } finally {
      cleanupFixtureDir(projectA);
      cleanupFixtureDir(projectB);
    }
  });
});

describe("createRunableInspector() - isolation between concurrent inspectors", () => {
  it("resolves two different projects concurrently without cross-contamination", async () => {
    // Scope: this proves isolation of Runable's own resolved state (each
    // Inspector's routes/project result matches its own project, not the
    // other's). It's not a claim that arbitrary code the two projects'
    // runable.config.*/setup() run can't interact through the shared
    // Node.js process (process.env, globalThis, ...) — see
    // resolveConfigGraph()'s doc.
    const projectA = fixtureWithRunable("inspector-isolation-a-");
    const projectB = fixtureWithRunable("inspector-isolation-b-");
    try {
      writeFixtureFile(projectA, "runable.config.ts", baseConfig());
      writeFixtureFile(projectA, "app/pages/index.vue", "<template><div>a</div></template>");
      writeFixtureFile(projectA, "app/pages/alpha.vue", "<template><div>alpha</div></template>");

      writeFixtureFile(projectB, "runable.config.ts", baseConfig());
      writeFixtureFile(projectB, "app/pages/index.vue", "<template><div>b</div></template>");
      writeFixtureFile(projectB, "app/pages/beta.vue", "<template><div>beta</div></template>");

      const { createRunableInspector } = await freshInspector();

      const [inspectorA, inspectorB] = await Promise.all([
        createRunableInspector({ rootDir: projectA }),
        createRunableInspector({ rootDir: projectB }),
      ]);

      const [routesA, routesB] = await Promise.all([
        inspectorA.getRoutes(),
        inspectorB.getRoutes(),
      ]);

      expect(routesA.map((r) => r.name).sort()).toEqual(["alpha", "index"]);
      expect(routesB.map((r) => r.name).sort()).toEqual(["beta", "index"]);

      const [projectResultA, projectResultB] = await Promise.all([
        inspectorA.getProject(),
        inspectorB.getProject(),
      ]);
      expect(projectResultA.rootDir).toBe(projectA);
      expect(projectResultB.rootDir).toBe(projectB);
    } finally {
      cleanupFixtureDir(projectA);
      cleanupFixtureDir(projectB);
    }
  });
});

describe("createRunableInspector() - module setup() behavior", () => {
  it("runs module setup() hooks — a static plugin/component/etc. a module declares is visible without setup() running at all", async () => {
    // A module's *own* `plugins`/`components`/`layouts`/etc. fields (set
    // directly in its runable.config.*, not from inside setup()) go
    // through the normal config-resolution step and are visible via
    // useAllConfigs() regardless of setup() — this is the common,
    // well-tested way a module contributes one. This test is the control:
    // it isolates what setup() itself is responsible for from what static
    // module config already provides, so the next test's assertion is
    // actually about setup(), not about module contributions in general.
    const dir = fixtureWithRunable("inspector-module-static-plugin-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/analytics"] });
`,
      );
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "modules/analytics/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule({
  meta: { name: "analytics" },
  plugins: ["./runtime/plugin.ts"],
});
`,
      );
      writeFixtureFile(
        dir,
        "modules/analytics/runtime/plugin.ts",
        `import { defineVuePlugin } from "runable";
export default defineVuePlugin({ name: "analytics-plugin", setup() {} });
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const plugins = await inspector.getPlugins();

      expect(plugins.some((p) => p.name === "analytics-plugin")).toBe(true);
    } finally {
      cleanupFixtureDir(dir);
    }
  });

  it("runs module setup() hooks — their effects are visible in the Inspector's result", async () => {
    // Locks in the architectural decision documented on resolveConfigGraph()
    // (config/load.ts): setup() hooks DO run while resolving the graph.
    // Demonstrated here via the one verifiably-working setup()-driven
    // side channel that reaches the Inspector's output today: a module
    // can set a RUN_PUBLIC_* env var from setup() (the pattern documented
    // in the Guide's Modules page), which loadRuntimeEnv() then picks up.
    //
    // Note: `defineModule`'s own JSDoc also documents
    // `config.plugins.push(...)` as a way for setup() to register a
    // plugin directly on the main config — auditing this while writing
    // this test surfaced that this specific pattern is currently broken
    // against the *real* pipeline too (config.plugins expects
    // already-resolved ResolvedScanDirFile objects, not raw path strings;
    // pushing a string crashes `prepare()` identically to how it would
    // have crashed the Inspector) — a pre-existing bug unrelated to this
    // refactor, left unfixed here since it's out of scope, but real.
    const dir = fixtureWithRunable("inspector-module-setup-env-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({ modules: ["./modules/analytics"] });
`,
      );
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(
        dir,
        "modules/analytics/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule<{ endpoint: string }>({
  meta: { name: "analytics" },
  configKey: "analytics",
  defaults: { endpoint: "https://default.example.com" },
  setup(options) {
    process.env.RUN_PUBLIC_ANALYTICS_ENDPOINT ??= options.endpoint;
  },
});
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });
      const config = await inspector.getConfig();

      expect(config.runtime.public.analyticsEndpoint).toBe("https://default.example.com");
    } finally {
      delete process.env.RUN_PUBLIC_ANALYTICS_ENDPOINT;
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - refresh()", () => {
  it("reflects a page added after the Inspector was created", async () => {
    const dir = fixtureWithRunable("inspector-refresh-");
    try {
      writeFixtureFile(dir, "runable.config.ts", baseConfig());
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const before = await inspector.getRoutes();
      expect(before.map((r) => r.name)).toEqual(["index"]);

      writeFixtureFile(dir, "app/pages/about.vue", "<template><div>about</div></template>");
      await inspector.refresh();

      const after = await inspector.getRoutes();
      expect(after.map((r) => r.name).sort()).toEqual(["about", "index"]);
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});

describe("createRunableInspector() - serialization", () => {
  it("every getter's result survives JSON.stringify() unchanged", async () => {
    const dir = fixtureWithRunable("inspector-serialization-");
    try {
      writeFixtureFile(
        dir,
        "runable.config.ts",
        `import { defineConfig } from "runable";
export default defineConfig({
  modules: ["./modules/analytics"],
  head: { title: "Fixture" },
});
`,
      );
      writeFixtureFile(dir, "app/pages/index.vue", "<template><div>home</div></template>");
      writeFixtureFile(dir, "app/pages/users/[id].vue", "<template><div>user</div></template>");
      writeFixtureFile(dir, "app/layouts/default.vue", "<template><slot /></template>");
      writeFixtureFile(
        dir,
        "app/middlewares/auth.global.ts",
        "export default defineVueMiddleware((to, from) => {});",
      );
      writeFixtureFile(
        dir,
        "app/plugins/analytics.ts",
        `import { defineVuePlugin } from "runable";
export default defineVuePlugin({ name: "analytics", setup() {} });
`,
      );
      writeFixtureFile(
        dir,
        "app/components/BaseButton.vue",
        "<template><button /></template>",
      );
      writeFixtureFile(
        dir,
        "app/composables/useCurrency.ts",
        "export function useCurrency() { return 1; }",
      );
      writeFixtureFile(
        dir,
        "modules/analytics/runable.config.ts",
        `import { defineModule } from "runable";
export default defineModule({ meta: { name: "analytics" } });
`,
      );

      const { createRunableInspector } = await freshInspector();
      const inspector = await createRunableInspector({ rootDir: dir });

      const results = {
        project: await inspector.getProject(),
        config: await inspector.getConfig(),
        routes: await inspector.getRoutes(),
        layouts: await inspector.getLayouts(),
        middlewares: await inspector.getMiddlewares(),
        plugins: await inspector.getPlugins(),
        modules: await inspector.getModules(),
        autoImports: await inspector.getAutoImports(),
      };

      for (const [key, value] of Object.entries(results)) {
        expect(() => JSON.stringify(value), `${key} failed to serialize`).not.toThrow();
        expect(
          JSON.parse(JSON.stringify(value)),
          `${key} round-trip changed shape`,
        ).toEqual(value);
      }
    } finally {
      cleanupFixtureDir(dir);
    }
  });
});
