import "./types.js";

import type { App, Plugin } from "vue";
import type { VuePluginObject } from "./types.js";
import { plugins } from ":plugins";
import { useApp } from "../vue/composable/useApp.js";
import type { AppHooks, HookCallback } from "../vue/context.js";

export function registerPlugins(app: App) {
  // 1. Sort the plugins properly respecting 'enforce' and 'dependsOn'
  const sortedPlugins = resolvePluginOrder(plugins);

  for (const plugin of sortedPlugins) {
    app.use(register(plugin));
  }
}

/**
 * Resolves the execution order of plugins using a topological sort.
 * It respects both `enforce` priority buckets and explicit `dependsOn` declarations.
 */
function resolvePluginOrder(plugins: VuePluginObject[]): VuePluginObject[] {
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
          `[Syora] Circular dependency detected involving plugin: "${name}"`,
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
                `[Syora] Warning: Plugin "${name}" depends on missing plugin "${depName}"`,
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

function register(plugin: VuePluginObject) {
  const usePlugin: Plugin = {
    async install(app: App) {
      if (plugin.hooks) {
        const appCtx = useApp();
        for (const [key, fn] of Object.entries(plugin.hooks) as [
          AppHooks,
          HookCallback,
        ][]) {
          appCtx.hook(key, fn);
        }
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
    },
  };

  return usePlugin;
}
