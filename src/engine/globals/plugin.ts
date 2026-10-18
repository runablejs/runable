import { createUnplugin } from "unplugin";
import { createUnimport, type Import, type Unimport } from "unimport";

import type { ResolveScanDir } from "@/utils/dir-scan.js";

export const globalsPlugin = createUnplugin<{
  dirs: ResolveScanDir[];
  output: string;
}>((options) => {
  let unimport: Unimport;
  const files = options.dirs.map((dir) => dir.files).flat();

  return [
    {
      name: "runable:globals",
      enforce: "pre",

      async buildStart() {},
    },
  ];
}).vite;
