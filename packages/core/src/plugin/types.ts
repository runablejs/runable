import type { App } from "vue";
import type { RuntimeHooks } from "../context/context";

export interface VuePluginObject<
  Injections extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Name of the plugin. Highly recommended, and required if other plugins depend on this one.
   */
  name?: string;

  /**
   * Execution order of the plugin:
   * - 'pre': executed with high priority (before normal plugins)
   * - 'post': executed with low priority (after normal plugins)
   */
  enforce?: "pre" | "post";

  /**
   * List of plugin names that must be loaded and initialized BEFORE this plugin.
   */
  dependsOn?: string[];

  setup?: VuePluginSetup<Injections>;

  /** Lifecycle and additional hooks */
  hooks?: RuntimeHooks;
}

export type VuePluginSetup<
  Injections extends Record<string, unknown> = Record<string, unknown>,
> = (ctx: App) => VuePluginReturn<Injections>;

export type VuePluginReturn<
  Injections extends Record<string, unknown> = Record<string, unknown>,
> =
  | Promise<void>
  | Promise<{ provide?: Injections }>
  | void
  | { provide?: Injections };

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
