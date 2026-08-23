import type { ResolvedScanDirFile } from "@/utils/dir/scan.js";
import { extractPluginMeta } from "@/plugin/extract-plugin-meta.js";
import { toProjectRelative } from "./relative.js";
import type { InspectorPlugin } from "./types.js";

/**
 * `name`/`enforce`/`dependsOn` only exist once a plugin file's default
 * export (`defineVuePlugin({...})`) actually runs — reading them would
 * mean importing (and therefore executing) every plugin file just to
 * inspect it, which the Inspector must never do (it's read-only and must
 * stay deterministic — see the module doc on `./index.js`). Instead this
 * reuses the same *static* extraction strategy Runable already applies to
 * `definePageMeta()` (see `router/extract-page-meta.ts`): a best-effort,
 * execution-free read of the plugin's own literal object
 * (`extractPluginMeta`). A field written as anything other than a plain
 * literal (computed, imported, spread) is simply omitted rather than
 * guessed at.
 */
export function resolveInspectorPlugins(
  rootDir: string,
  pluginFiles: ResolvedScanDirFile[],
): InspectorPlugin[] {
  return pluginFiles.map((entry) => {
    const meta = extractPluginMeta(entry.file);

    const plugin: InspectorPlugin = { file: toProjectRelative(rootDir, entry.file) };
    // No fallback to a filename-derived name: `VuePluginObject.name` is a
    // distinct, declared identifier used for `dependsOn` matching — unlike
    // layouts/middlewares/components, there's no Runable naming convention
    // to reuse here that means the same thing. A plugin with no explicit
    // `name` in source genuinely has none (see extractPluginMeta's doc).
    if (meta.name) plugin.name = meta.name;
    if (meta.enforce) plugin.enforce = meta.enforce;
    if (meta.dependsOn) plugin.dependsOn = meta.dependsOn;

    return plugin;
  });
}
