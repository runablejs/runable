import path from "node:path";
import { normalizeDir } from "@/utils/dir.js";
import { createUnplugin } from "unplugin";

const VIRTUAL_ID = ":css";
const RESOLVED_VIRTUAL_ID = "\0:css";

type CssConfig = {
  cssDirs: string[];
  cwd?: string;
};

/**
 * Shared across every instance of this plugin (one per Syora config: main +
 * each module) so the `:css` virtual module ends up importing every
 * config's CSS, not just whichever instance's `load()` wins the resolution.
 * A Set dedupes a file listed by more than one config.
 */
const sharedCssFiles = new Set<string>();

export default createUnplugin((config: CssConfig) => {
  const { cssDirs = [], cwd = process.cwd() } = config;

  return {
    name: "syora:css",
    enforce: "pre",

    buildStart() {
      if (!Array.isArray(cssDirs)) return;

      for (const file of cssDirs) {
        sharedCssFiles.add(
          file.startsWith(".") ? path.resolve(cwd, file) : file,
        );
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      return Array.from(sharedCssFiles)
        .map((file) => {
          const rPath = normalizeDir(path.relative(process.cwd(), file));
          return `import "${rPath}";`;
        })
        .join("\n");
    },
  };
});
