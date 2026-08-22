import { basename, join, relative } from "node:path";

import { createUnplugin } from "unplugin";
import camelCase from "lodash/camelCase.js";

import {
  atomicWriteFile,
  normalizeDir,
  removeFileExtension,
  ResolvedScanDirFile,
} from "@/utils/index.js";

const VIRTUAL_ID = ":router-middlewares";
const RESOLVED_VIRTUAL_ID = "\0:router-middlewares";

export interface RouterMiddlewaresOptions {
  output: string;
  dirs: ResolvedScanDirFile[];
}

function resolveMiddleware(filePath: string, parentDir: string) {
  filePath = removeFileExtension(filePath);

  if (filePath !== parentDir) filePath = relative(parentDir, filePath);

  const baseName = basename(filePath);
  const isGlobal = baseName.endsWith(".global");

  return { name: camelCase(baseName.replace(/.global$/, "")), isGlobal };
}

export default createUnplugin<RouterMiddlewaresOptions>((options) => {
  const middlewares: {
    name: string;
    isGlobal: boolean;
    file: string;
  }[] = [];

  function generateCode() {
    const code = middlewares.map((middleware) => {
      const rPath = normalizeDir(relative(process.cwd(), middleware.file));

      return `  {
    name: ${JSON.stringify(middleware.name)},
    isGlobal: ${JSON.stringify(middleware.isGlobal)},
    middleware: () => import(${JSON.stringify(rPath)}),
  }`;
    });

    return (
      `export const middlewares = [\n${code.join(",\n")}\n];` +
      "\n\nexport default middlewares;"
    );
  }

  function generateDts() {
    const names =
      middlewares.map((middleware) => `"${middleware.name}"`).join("\n    |") ||
      "never";

    const code = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck

import "vue-router"

type MiddlewareNames = ${names};

declare module "vue-router" {
  export interface RouteMeta {
    middleware?: MiddlewareNames | MiddlewareNames[]
  }
}

export {};
`;

    atomicWriteFile(join(options.output, "router-middlewares.d.ts"), code);
  }

  return {
    name: "runable:router-middlewares",

    buildStart() {
      middlewares.splice(0, middlewares.length);

      for (const dir of options.dirs) {
        const { name, isGlobal } = resolveMiddleware(dir.file, dir.parent);
        middlewares.push({ name, isGlobal, file: dir.file });
        this.addWatchFile(dir.file);
      }

      generateDts();
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    vite: {
      async load(id) {
        if (id === RESOLVED_VIRTUAL_ID) {
          return generateCode();
        }
      },

      async handleHotUpdate({ file, server }) {
        const isMiddlewareFile = middlewares.some((m) => m.file === file);

        if (isMiddlewareFile) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      },
    },
  };
});
