import { createUnplugin } from "unplugin";
import type { ComponentInfo, Options, ResolvedOptions } from "./types";
import { scanComponents } from "./scan";
import { transformVueFile } from "./transform";
import { collectResolvers, createResolverEngine } from "./resolvers";
import { generateDts } from "./dts";

const DEFAULT_OPTIONS: ResolvedOptions = {
  dirs: "src/components",
  extensions: ["vue", "ts", "js", "mjs", "mts"],
  exclude: ["**/node_modules/**", "**/.git/**", "**/*.d.*"],
  dts: "components.d.ts",
  verbose: false,
};

/**
 * Shared across every instance of this plugin (one per Syora config: main +
 * each module) so `components.d.ts` lists every config's local components,
 * not just whichever instance's `rescan()` wrote last. Keyed by instance id
 * (not just merged blindly) because on hot-reload only the instance whose
 * `.vue` file changed needs to re-scan — the others' slices stay as-is.
 */
let total = 0;
let resolvedCount = 0;
const instanceMaps = new Map<number, Map<string, ComponentInfo>>();
let sharedDts: ResolvedOptions["dts"] | undefined;

function mergedComponents(): Map<string, ComponentInfo> {
  const merged = new Map<string, ComponentInfo>();
  for (const map of instanceMaps.values()) {
    for (const [name, info] of map) merged.set(name, info);
  }
  return merged;
}

function writeSharedDts(root: string) {
  if (sharedDts === false) return;
  generateDts(root, mergedComponents(), sharedDts ?? true);
}

export default createUnplugin((rawOptions: Options = {}) => {
  const options: ResolvedOptions = { ...DEFAULT_OPTIONS, ...rawOptions };
  const resolve = createResolverEngine(collectResolvers(options));
  const instanceId = total++;

  let root = process.cwd();

  const rescan = (): void => {
    instanceMaps.set(instanceId, scanComponents(root, options));
    sharedDts ??= options.dts;

    // Gate the startup write so it happens once, after every instance's
    // configResolved has contributed its slice, instead of writing an
    // incomplete .d.ts per instance while the others haven't run yet.
    resolvedCount++;
    if (resolvedCount >= total) writeSharedDts(root);
  };

  return {
    name: "syora:vue-components",
    enforce: "post",

    vite: {
      configResolved(config) {
        root = config.root;
        rescan();
      },
      // Re-scans this instance's own dirs and rewrites the merged .d.ts.
      // Fires once per instance per changed .vue file (Vite calls
      // handleHotUpdate on every plugin, regardless of that plugin's own
      // dirs), so on a single edit this can write components.d.ts more
      // than once in a row — redundant I/O, not a correctness issue, since
      // each write already reflects the full merged state.
      handleHotUpdate({ file }) {
        if (file.endsWith(".vue")) rescan();
      },
    },

    transformInclude(id) {
      return id.endsWith(".vue") && !id.includes("node_modules");
    },

    async transform(code, id) {
      try {
        return await transformVueFile(
          code,
          id,
          instanceMaps.get(instanceId)!,
          resolve,
        );
      } catch (err) {
        this.error(err as Error);
      }
    },
  };
});
