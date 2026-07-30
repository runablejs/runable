import path from "node:path";
import _ from "lodash";
import { normalizeDir } from "@/utils/dir.js";
import { createUnplugin } from "unplugin";

const VIRTUAL_ID = ":css";
const RESOLVED_VIRTUAL_ID = "\:css";

type CssConfig = {
  cssDirs: string[];
  cwd?: string;
};

export default createUnplugin((config: CssConfig) => {
  const { cssDirs = [], cwd = process.cwd() } = config;
  const cssFiles: string[] = [];

  return {
    name: "syora:css",
    enforce: "pre",

    buildStart() {
      if (!cssDirs || !Array.isArray(cssDirs)) return;

      cssFiles.push(
        ...cssDirs.map((file) => {
          if (file.startsWith(".")) return path.resolve(cwd, file);
          return file;
        }),
      );
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
    },

    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      // Generate imports using actual resolved and normalized paths relative to working directory
      return cssFiles
        .map((file) => {
          const rPath = normalizeDir(path.relative(process.cwd(), file));
          return `import "${rPath}";`;
        })
        .join("\n");
    },
  };
});
