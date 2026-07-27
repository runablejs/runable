import { existsSync } from "node:fs";
import { relative } from "node:path";
import { createUnplugin } from "unplugin";
import { normalizeDir, resolveDir } from "@/utils/dir.js";

const VIRTUAL_ID = ":app-vue";
const RESOLVED_VIRTUAL_ID = "\0:app-vue";

type RouterConfig = {
  dir?: string;
};

async function generateCode({ dir }: RouterConfig = {}) {
  if (dir) dir = resolveDir(dir);
  if (!dir || !existsSync(dir)) return "export const app = false";

  return [
    `import app from '${normalizeDir(relative(process.cwd(), dir))}';`,
    "export  { app };",
  ].join("\n");
}

export default createUnplugin((config?: RouterConfig) => {
  let code = "";

  return {
    name: "syora:vue-app.vue",
    enforce: "pre",

    async buildStart() {
      code = await generateCode(config);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      return code;
    },
  };
});
