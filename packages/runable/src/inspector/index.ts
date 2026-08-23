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
 * ### What "read-only" actually means here
 *
 * "Read-only" describes the Inspector's *own* behavior, not a sandbox
 * around the project it inspects:
 *
 * - The Inspector itself never generates or modifies a Runable project/
 *   build file (not even `.app/`), never changes `process.cwd()`, and
 *   never touches `loadConfig()`'s process-wide cache (`useConfig()` /
 *   `useAllConfigs()` / `getModuleOptions()`, and a live dev server's own
 *   `loadConfig()` call, are unaffected by creating, using, or refreshing
 *   an Inspector — and vice versa). This is possible because config
 *   resolution is built on `resolveConfigGraph()` (`config/load.ts`), a
 *   separate primitive from `loadConfig()` with none of its extra
 *   behavior (permanent cache, `modules-options.d.ts` generation).
 * - Two Inspectors — even for two different projects — don't share
 *   Runable's resolved config state or caches and don't interfere through
 *   `process.cwd()`.
 *
 * Neither of those means "never executes project code", and the
 * Inspector is not a sandbox: resolving the config graph executes every
 * `runable.config.*` file in the module graph, including each module's
 * `setup()` hook — this is unavoidable (`c12Load` imports config files;
 * config resolution is code, not static data) and, for `setup()`
 * specifically, deliberate: skipping it would make the Inspector resolve
 * a *different* graph than `loadConfig()` actually resolves for the same
 * project (see `resolveConfigGraph()`'s doc for exactly which channels —
 * `_runtime`, `process.env` — actually reach the resolved graph today,
 * and for one that doesn't despite once being documented as if it did).
 * That executed code is ordinary
 * project/module configuration — no more "arbitrary" than
 * `runable.config.*` itself already is — and it runs in this same Node.js
 * process, so whatever side effects it performs (`process.env` writes,
 * filesystem writes, `globalThis`/third-party-singleton mutation) are
 * real and are outside the Inspector's isolation guarantee: two
 * Inspectors running concurrently can still observe or race on each
 * other's project code's side effects, even though neither can observe
 * or disturb the other's Runable-owned state. What the Inspector *never*
 * does itself is execute a *page* or *plugin* file: those need a live Vue
 * app/router to run meaningfully, and their metadata (`definePageMeta`, a
 * plugin's `name`/`enforce`/`dependsOn`) is read statically instead (see
 * `routes.js`/`plugins.js`).
 */

import { resolve as resolvePath } from "node:path";

import { resolveConfigGraph } from "@/config/load.js";
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

/** Resolves (or re-resolves, on `refresh()`) this Inspector's own state
 * from `resolveConfigGraph(rootDir)` — a fresh call every time, isolated
 * from `loadConfig()`'s cache and from any other Inspector instance. */
async function resolveState(rootDir: string): Promise<InspectorState> {
  let graph;
  try {
    graph = await resolveConfigGraph(rootDir);
  } catch (error) {
    throw new RunableInspectorError(
      `Failed to resolve the Runable config for "${rootDir}": ${(error as Error).message}`,
      { cause: error },
    );
  }

  return { main: graph.main, allConfigs: graph.all };
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
