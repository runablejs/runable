import { createUnplugin } from "unplugin";

import { ResolvedScanDirFile } from "@/utils/index.js";

const VIRTUAL_ID = ":router-middlewares";
const RESOLVED_VIRTUAL_ID = "\0:router-middlewares";

export interface RouterMetaOptions {
  output: string;
  dirs: ResolvedScanDirFile[];
}

export default createUnplugin<RouterMetaOptions>((options) => {
  return {
    name: "syora:router-meta",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    vite: {
      transform(code, id) {
        const isPage = options.dirs.some((m) => m.file === id);
        if (!isPage) return;

        // Regex simple pour extraire definePageMeta({...})
        const match = code.match(/definePageMeta\s*\(\s*({[\s\S]*?})\s*\)/);

        if (match) {
          try {
            // Évaluation sécurisée du JSON-like (ou utiliser acorn pour du vrai parsing)
            const metaStr = (match[1] ?? "{}")
              ?.replace(/(\w+):/g, '"$1":') // quote keys
              .replace(/'/g, '"') // simple quotes -> double
              .replace(/,\s*}/g, "}"); // trailing comma

            const meta = JSON.parse(metaStr);

            // Injecte les métadonnées dans le composant
            const injection = `\n;${metaStr.includes("export default") ? "" : "export default"}.__pageMeta = ${JSON.stringify(meta)};`;

            return {
              code: code + injection,
              map: null,
            };
          } catch {
            return null;
          }
        }
      },
    },
  };
});
