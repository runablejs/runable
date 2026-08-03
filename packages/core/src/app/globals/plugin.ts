import type { VuePluginSetup, VuePluginObject } from "../../plugin/types.js";

/**
 * Declares a Vue plugin. Accepts either a configuration object or a setup function directly.
 */
export function defineVuePlugin<
  Injections extends Record<string, unknown> = Record<string, unknown>,
>(
  plugin: VuePluginObject<Injections> | VuePluginSetup<Injections>,
): VuePluginObject<Injections> {
  // If a function is passed directly, map it to the setup property of a VuePluginObject
  if (typeof plugin === "function") {
    return { setup: plugin };
  }

  return plugin;
}
