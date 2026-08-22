import "./types.js";

import type { App } from "vue";
import { plugins } from ":plugins";
import type { VuePluginObject } from "./types.js";
import { useApp } from "../app/composables/context.js";
import { registerHooks } from "@/context/hook.js";

export async function installPlugins(app: App) {
  const sortedPlugins = resolvePluginOrder(plugins);

  for (const plugin of sortedPlugins) {
    await register(app, plugin);
  }
}

/**
 * Resolves the execution order of plugins using a topological sort.
 * It respects both `enforce` priority buckets and explicit `dependsOn` declarations.
 */
function resolvePluginOrder(plugins: VuePluginObject[]): VuePluginObject[] {
  const enforceRank = (plugin: VuePluginObject) =>
    plugin.enforce === "pre" ? 0 : plugin.enforce === "post" ? 2 : 1;

  const pluginsByName = new Map(
    plugins.flatMap((plugin) =>
      plugin.name ? ([[plugin.name, plugin]] as const) : [],
    ),
  );

  for (const plugin of plugins) {
    for (const dependencyName of plugin.dependsOn ?? []) {
      const dependency = pluginsByName.get(dependencyName);
      if (!dependency || enforceRank(dependency) <= enforceRank(plugin)) {
        continue;
      }

      throw new Error(
        `[Runable] Plugin "${plugin.name ?? "anonymous"}" (enforce: "${plugin.enforce ?? "default"}") cannot depend on "${dependencyName}" (enforce: "${dependency.enforce ?? "default"}") because a plugin can only depend on plugins in the same or an earlier enforce group.`,
      );
    }
  }

  // We first group plugins by their enforce category to keep pre/normal/post separation
  const pre = plugins.filter((p) => p.enforce === "pre");
  const normal = plugins.filter((p) => !p.enforce);
  const post = plugins.filter((p) => p.enforce === "post");

  // Helper to topologically sort a specific bucket of plugins
  const topologicalSort = (list: VuePluginObject[]): VuePluginObject[] => {
    const sorted: VuePluginObject[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    // Map for quick access by name
    const pluginMap = new Map<string, VuePluginObject>();
    list.forEach((p) => {
      if (p.name) pluginMap.set(p.name, p);
    });

    const visit = (plugin: VuePluginObject) => {
      const name = plugin.name || "";

      if (name && visited.has(name)) return;
      if (name && visiting.has(name)) {
        throw new Error(
          `[Runable] Circular dependency detected involving plugin: "${name}"`,
        );
      }

      if (name) visiting.add(name);

      // Resolve dependencies first
      if (plugin.dependsOn) {
        for (const depName of plugin.dependsOn) {
          const depPlugin = pluginMap.get(depName);
          if (depPlugin) {
            visit(depPlugin);
          } else {
            // If the dependency exists in another category (e.g. a 'normal' plugin depending on a 'pre' plugin),
            // it's already handled by the bucket order, so we can safely skip if not found in current bucket.
            const existsGlobally = plugins.some((p) => p.name === depName);
            if (!existsGlobally) {
              console.warn(
                `[Runable] Warning: Plugin "${name}" depends on missing plugin "${depName}"`,
              );
            }
          }
        }
      }

      if (name) {
        visiting.delete(name);
        visited.add(name);
      }

      if (!sorted.includes(plugin)) {
        sorted.push(plugin);
      }
    };

    for (const plugin of list) {
      visit(plugin);
    }

    return sorted;
  };

  // Sort each bucket individually to guarantee 'pre' always runs before 'normal', before 'post'
  return [
    ...topologicalSort(pre),
    ...topologicalSort(normal),
    ...topologicalSort(post),
  ];
}

async function register(app: App, plugin: VuePluginObject) {
  if (plugin.hooks) {
    const appCtx = useApp();
    registerHooks(appCtx, plugin.hooks);
  }

  if (!plugin.setup) return;

  const result = await plugin.setup(app);

  if (result && typeof result === "object" && result.provide) {
    const provides = result.provide;

    for (const [key, value] of Object.entries(provides)) {
      app.provide(key, value);
      app.config.globalProperties[`$${key}`] = value;
    }

    const symbols = Object.getOwnPropertySymbols(provides);
    for (const sym of symbols) {
      app.provide(sym, provides[sym as unknown as string]);
    }
  }
}
