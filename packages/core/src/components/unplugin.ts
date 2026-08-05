import { createUnplugin } from "unplugin";

import { AutoImportContext } from "./context";
import { resolveOptions } from "./options";
import { shouldTransform, transformCode } from "./transform";
import { AutoComponentOptions } from "./types";

export * from "./types";

export default createUnplugin<AutoComponentOptions>((rawOptions) => {
  let ctx: AutoImportContext | undefined;

  return {
    name: "syora:components",
    enforce: "pre",

    vite: {
      configResolved(config) {
        const options = resolveOptions(rawOptions ?? {}, config.root);
        ctx = new AutoImportContext(options);
      },
    },

    async buildStart() {
      // Fallback for non-Vite consumers of this unplugin, where
      // `vite.configResolved` never runs.
      if (!ctx) {
        ctx = new AutoImportContext(
          resolveOptions(rawOptions ?? {}, process.cwd()),
        );
      }

      await ctx.init();
    },

    transformInclude(id) {
      return !!ctx && shouldTransform(id, ctx);
    },

    async transform(code, id) {
      if (!ctx) return null;

      const result = transformCode(code, id, ctx);
      if (!result) return null;

      return { code: result.code, map: result.map };
    },

    watchChange(id, change) {
      void ctx?.handleWatchChange(id, change.event);
    },
  };
});
