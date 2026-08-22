import { existsSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

import type { Plugin, ViteDevServer } from "vite";

import { resolveConfig } from "../config/resolve.js";
import type { ResolvedConfig, RunableConfig } from "../config/types.js";
import { toArray } from "../utils/to-array.js";

type WatchedField =
  | "components"
  | "layouts"
  | "globals"
  | "composables"
  | "middlewares"
  | "plugins"
  | "css";

type WatchTarget = {
  field: WatchedField;
  path: string;
  exact: boolean;
};

const WATCHED_FIELDS: readonly WatchedField[] = [
  "components",
  "layouts",
  "globals",
  "composables",
  "middlewares",
  "plugins",
  "css",
];

const DEFAULT_DIRS: Partial<Record<WatchedField, string>> = {
  components: "components",
  layouts: "layouts",
  globals: "globals",
  composables: "composables",
  middlewares: "middlewares",
  plugins: "plugins",
};

function isPathInside(file: string, directory: string): boolean {
  const normalizedFile = resolve(file);
  const normalizedDir = resolve(directory);
  return (
    normalizedFile === normalizedDir ||
    normalizedFile.startsWith(`${normalizedDir}/`)
  );
}

function rawEntries(config: ResolvedConfig, field: WatchedField): unknown[] {
  const authored = config.defineConfig[field] as unknown;
  if (authored !== undefined) return toArray(authored);

  const defaultDir = DEFAULT_DIRS[field];
  return defaultDir ? [join(config.appDir, defaultDir)] : [];
}

function collectTargets(config: ResolvedConfig): WatchTarget[] {
  const targets: WatchTarget[] = [];

  for (const field of WATCHED_FIELDS) {
    for (const entry of rawEntries(config, field)) {
      const paths =
        typeof entry === "string"
          ? [entry]
          : entry && typeof entry === "object" && "dirs" in entry
            ? toArray((entry as { dirs: string | string[] }).dirs)
            : [];

      for (const rawPath of paths) {
        const path = resolve(config._cwd, rawPath);
        const existingFile = existsSync(path) && statSync(path).isFile();
        const looksLikeFile = existingFile || Boolean(extname(path));

        targets.push({ field, path, exact: looksLikeFile });
      }
    }
  }

  return targets;
}

function matchesTarget(file: string, target: WatchTarget): boolean {
  return target.exact
    ? resolve(file) === target.path
    : isPathInside(file, target.path);
}

function refreshConfig(config: ResolvedConfig, targets: WatchTarget[]): void {
  const refreshed = resolveConfig({
    ...(config.defineConfig as RunableConfig),
    cwd: config._cwd,
  });

  for (const field of WATCHED_FIELDS) {
    const roots = targets.filter((target) => target.field === field);
    const current = config[field];
    const next = refreshed[field];

    // Keep entries injected programmatically by a module setup hook. They do
    // not appear in the authored config and therefore cannot be rediscovered
    // by resolveConfig().
    const injected = current.filter((entry) =>
      roots.every((root) => !matchesTarget(entry.file, root)),
    );

    current.splice(0, current.length, ...next, ...injected);
  }
}

/**
 * Watches structural changes in convention/config directories. Vue Router
 * already owns page watching, so `pages` is deliberately absent here.
 */
export function watchConfigDirs(
  configs: ResolvedConfig[],
  rebuildAggregates: () => void,
): Plugin {
  const targetsByConfig = new Map(
    configs.map((config) => [config, collectTargets(config)]),
  );
  const watchPaths = [
    ...new Set(
      [...targetsByConfig.values()].flatMap((targets) =>
        targets.map((target) =>
          target.exact ? dirname(target.path) : target.path,
        ),
      ),
    ),
  ];

  return {
    name: "runable:watch-config-dirs",
    apply: "serve",

    configureServer(server: ViteDevServer) {
      server.watcher.add(watchPaths);

      let timer: ReturnType<typeof setTimeout> | undefined;
      let restarting = false;

      const onStructuralChange = (file: string) => {
        if (restarting) return;

        const affected = [...targetsByConfig.entries()].filter(([, targets]) =>
          targets.some((target) => matchesTarget(file, target)),
        );
        if (!affected.length) return;

        clearTimeout(timer);
        timer = setTimeout(async () => {
          restarting = true;
          try {
            for (const [config, targets] of affected) {
              refreshConfig(config, targets);
            }
            rebuildAggregates();
            await server.restart();
          } finally {
            restarting = false;
          }
        }, 50);
      };

      server.watcher.on("add", onStructuralChange);
      server.watcher.on("unlink", onStructuralChange);

      server.watcher.once("close", () => {
        clearTimeout(timer);
        server.watcher.off("add", onStructuralChange);
        server.watcher.off("unlink", onStructuralChange);
      });
    },
  };
}
