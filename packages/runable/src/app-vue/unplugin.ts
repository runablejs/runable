import { existsSync } from "node:fs";
import { relative } from "node:path";
import { createUnplugin } from "unplugin";
import { normalizeDir, resolveDir } from "@/utils";

const VIRTUAL_ID = ":app-vue";
const RESOLVED_VIRTUAL_ID = "\0:app-vue";

type RouterConfig = {
  dir?: string;
  errorDir?: string;
};

function generateComponentExport(
  name: "app" | "error",
  dir: string | undefined,
): string[] {
  if (dir) dir = resolveDir(dir);
  if (!dir || !existsSync(dir)) return [`export const ${name} = false;`];

  return [
    `import ${name}Component from '${normalizeDir(relative(process.cwd(), dir))}';`,
    `export const ${name} = ${name}Component;`,
  ];
}

async function generateCode({ dir, errorDir }: RouterConfig = {}) {
  return [
    ...generateComponentExport("app", dir),
    ...generateComponentExport("error", errorDir),
  ].join("\n");
}

export default createUnplugin((config?: RouterConfig) => {
  let code = "";

  return {
    name: "runable:vue-app.vue",
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
