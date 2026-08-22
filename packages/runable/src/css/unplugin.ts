import path from "node:path";
import { normalizeDir, resolveScanFiles } from "@/utils/dir/index.js";
import { createUnplugin } from "unplugin";
import type { Arrayable, ResolvedScanDir, ResolvedScanDirFile } from "@/utils";

const VIRTUAL_ID = ":css";
const RESOLVED_VIRTUAL_ID = "\0:css";

export type CssOptions = {
  dirs: ResolvedScanDirFile[];
  cwd?: string;
};

/**
 * Shared across every instance of this plugin (one per Runable config: main +
 * each module) so the `:css` virtual module ends up importing every
 * config's CSS, not just whichever instance's `load()` wins the resolution.
 * A Set dedupes a file listed by more than one config.
 */
const sharedCssFiles = new Set<string>();

export default createUnplugin((config: CssOptions) => {
  let { dirs = [], cwd = process.cwd() } = config;

  return {
    name: "runable:css",
    enforce: "pre",

    buildStart() {
      sharedCssFiles.clear();
      const files = resolveScanFiles(dirs);
      for (const file of files) sharedCssFiles.add(file);
      // file.startsWith(".") ? path.resolve(cwd, file) : file,
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      return Array.from(sharedCssFiles)
        .map((file) => {
          const rPath = normalizeDir(path.relative(cwd, file));
          return `import "${rPath}";`;
        })
        .join("\n");
    },
  };
});
