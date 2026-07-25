import _ from "lodash";
import { createUnplugin } from "unplugin";
import { useConfig } from "./index.js";

const VIRTUAL_ID = ":config";
const RESOLVED_VIRTUAL_ID = "\0:config";

export default createUnplugin(() => {
  let code = "";

  return {
    name: "syora:config",
    enforce: "pre",

    async buildStart() {
      const config = useConfig();

      const clientConfig = {
        head: config.head,
        siteUrl: config.siteUrl,
        baseUrl: config.baseUrl,
      };

      code = [
        `const config = ${JSON.stringify(clientConfig, undefined, 2)};\n`,
        "export default config;",
      ].join("\n");
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_ID) return code;
    },
  };
});
