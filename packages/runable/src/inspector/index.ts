/**
 * `runable/inspector` — a public, read-only API for programmatically
 * inspecting how Runable resolves a project: its configuration, routes,
 * layouts, middlewares, plugins, modules, and auto-imports.
 *
 * Built for external tooling (MCP servers, DevTools, CLI diagnostics, IDE
 * integrations, tests) that needs to answer "how does Runable see this
 * project?" without reimplementing Runable's own conventions. See the
 * per-domain modules in this directory for what each one reuses from
 * Runable's real pipeline vs. computes statically, and why.
 *
 * Two constraints inherited from Runable's own config loader, not
 * introduced by the Inspector:
 *
 * 1. `loadConfig()` (`config/load.ts`) resolves relative to
 *    `process.cwd()`, not an arbitrary directory — there is no lower-level
 *    entry point that accepts one. To inspect a `rootDir` other than the
 *    current working directory, this module briefly `process.chdir()`s
 *    into it for the duration of a single `loadConfig()` call and restores
 *    the previous cwd immediately after (the same pattern Runable's own
 *    regression tests already use — see `tests/regressions/config.test.ts`).
 *    Since `process.chdir()` is process-global, two Inspector instances
 *    resolving concurrently in the same process (or the Inspector racing
 *    a live dev server's own `loadConfig()` call) can interleave — fine
 *    for the CLI/test/single-project-per-process use this targets today,
 *    a real constraint for a future multi-project host.
 * 2. `loadConfig()`'s resolved config graph is a permanent, process-wide
 *    singleton (`unloadConfig()` in `config/load.ts`, added alongside this
 *    module, is the only way to clear it). `refresh()` clears and reloads
 *    it — which means a second, concurrently-live consumer of Runable's
 *    config in the same process (again, a live dev server) would lose its
 *    own cached config when this Inspector refreshes. Not a concern for
 *    the CLI/MCP/test-runner scenarios this is built for (their own
 *    process' only Runable consumer), worth knowing before embedding an
 *    Inspector inside a long-running multi-tenant host process.
 */

import { resolve as resolvePath } from "node:path";

import { loadConfig, unloadConfig, useAllConfigs } from "@/config/load.js";
import type { ResolvedConfig } from "@/config/types.js";

import { assertRunableProject } from "./detect.js";
import { RunableInspectorError } from "./errors.js";
import { resolveInspectorProject } from "./project.js";
import { resolveInspectorConfig } from "./config.js";
import { resolveInspectorRoutes } from "./routes.js";
import { resolveInspectorLayouts } from "./layouts.js";
import { resolveInspectorMiddlewares } from "./middlewares.js";
import { resolveInspectorPlugins } from "./plugins.js";
import { resolveInspectorModules } from "./modules.js";
import { resolveInspectorAutoImports } from "./auto-imports.js";
import {
  builtinComponentDirs,
  builtinComposableImports,
  builtinGlobalImports,
} from "./builtins.js";
import type {
  CreateRunableInspectorOptions,
  InspectorAutoImports,
  InspectorConfig,
  InspectorLayout,
  InspectorMiddleware,
  InspectorModule,
  InspectorPlugin,
  InspectorProject,
  InspectorRoute,
  RunableInspector,
} from "./types.js";

export * from "./types.js";
export { RunableInspectorError } from "./errors.js";

interface InspectorState {
  main: ResolvedConfig;
  allConfigs: ResolvedConfig[];
}

/** Loads (or reloads) the config graph for `rootDir`, working around
 * `loadConfig()` only ever resolving relative to `process.cwd()` — see the
 * module doc above. */
async function resolveState(rootDir: string): Promise<InspectorState> {
  const previousCwd = process.cwd();
  const needsChdir = previousCwd !== rootDir;

  try {
    if (needsChdir) process.chdir(rootDir);
    unloadConfig();
    await loadConfig();
  } catch (error) {
    throw new RunableInspectorError(
      `Failed to load the Runable config for "${rootDir}": ${(error as Error).message}`,
      { cause: error },
    );
  } finally {
    if (needsChdir) process.chdir(previousCwd);
  }

  const allConfigs = useAllConfigs();
  const main = allConfigs.find((c) => c._name === "__main") ?? allConfigs[0];
  if (!main) {
    throw new RunableInspectorError(`No resolved config was found for "${rootDir}".`);
  }

  return { main, allConfigs };
}

function aggregate<T>(configs: ResolvedConfig[], pick: (config: ResolvedConfig) => T[]): T[] {
  return configs.flatMap(pick);
}

export async function createRunableInspector(
  options: CreateRunableInspectorOptions = {},
): Promise<RunableInspector> {
  const rootDir = resolvePath(options.rootDir ?? process.cwd());
  assertRunableProject(rootDir);

  let state = await resolveState(rootDir);

  // Lazily computed and cached per instance, on top of `state` — cleared
  // (along with `state` itself) on `refresh()`. See "Lazy computation" in
  // the module's design notes: a `getXxx()` a caller never calls should
  // never do any work.
  let cache: {
    project?: InspectorProject;
    config?: InspectorConfig;
    routes?: InspectorRoute[];
    layouts?: InspectorLayout[];
    middlewares?: InspectorMiddleware[];
    plugins?: InspectorPlugin[];
    modules?: InspectorModule[];
    autoImports?: InspectorAutoImports;
  } = {};

  return {
    async getProject() {
      return (cache.project ??= resolveInspectorProject(rootDir, state.main));
    },

    async getConfig() {
      return (cache.config ??= resolveInspectorConfig(rootDir, state.main));
    },

    async getRoutes() {
      return (cache.routes ??= resolveInspectorRoutes(
        rootDir,
        aggregate(state.allConfigs, (c) => c.pages),
      ));
    },

    async getLayouts() {
      return (cache.layouts ??= resolveInspectorLayouts(
        rootDir,
        aggregate(state.allConfigs, (c) => c.layouts),
      ));
    },

    async getMiddlewares() {
      return (cache.middlewares ??= resolveInspectorMiddlewares(
        rootDir,
        aggregate(state.allConfigs, (c) => c.middlewares),
      ));
    },

    async getPlugins() {
      return (cache.plugins ??= resolveInspectorPlugins(
        rootDir,
        aggregate(state.allConfigs, (c) => c.plugins),
      ));
    },

    async getModules() {
      return (cache.modules ??= resolveInspectorModules(rootDir, state.allConfigs));
    },

    async getAutoImports() {
      if (!cache.autoImports) {
        cache.autoImports = await resolveInspectorAutoImports(rootDir, {
          components: [
            ...aggregate(state.allConfigs, (c) => c.components),
            ...builtinComponentDirs(),
          ],
          composables: [
            aggregate(state.allConfigs, (c) => c.composables),
            ...builtinComposableImports(),
          ],
          globals: [
            aggregate(state.allConfigs, (c) => c.globals),
            ...builtinGlobalImports(),
          ],
        });
      }
      return cache.autoImports;
    },

    async refresh() {
      cache = {};
      state = await resolveState(rootDir);
    },
  };
}
