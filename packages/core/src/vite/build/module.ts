import {
  basename,
  dirname,
  extname,
  join,
  posix,
  relative,
  resolve,
  sep,
} from "node:path";

import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import MagicString from "magic-string";
import { build, type InlineConfig } from "tsdown";
import Vue from "unplugin-vue/rolldown";

import { useConfig } from "@/config";
import {
  AliasMap,
  resolveAliasDirs,
  ResolvedScanDirFile,
  TsconfigPaths,
} from "@/utils";
import TsConfigBuilder from "syt";

const GENERATED_TSCONFIG = ".tsconfig.json";
const EXTERNAL_ID_PATTERN = /^[^./]/;

export function generateServerTsconfig(alias: TsconfigPaths) {
  const tsconfig = new TsConfigBuilder()
    .addLib(["ESNext", "dom", "dom.iterable", "webworker"])
    .sourceMap()
    .setModule("NodeNext")
    .setTarget("ESNext")
    .strict()
    .esModuleInterop()
    .skipLibCheck()
    .setModuleResolution("Bundler")
    .setCompilerOption("noUncheckedIndexedAccess", true)
    .setCompilerOption("pretty", true)
    .sourceMap(false)
    .declaration();

  tsconfig.setAliases(alias);

  tsconfig.write(join(import.meta.dirname, GENERATED_TSCONFIG));
}

export async function buildModule() {
  let {
    alias: _alias,
    cwd,
    _configFile,
    appDir,

    components,
    layouts,
    globals,
    composables,
    pages,
    plugins,
    css,
    middlewares,
  } = useConfig();

  const entry: string[] = [];

  const resolvedFiles = {
    components,
    layouts,
    globals,
    composables,
    pages,
    plugins,
    css,
    middlewares,
  };

  const resolvedFileOutputs: Record<ResolvedKey, ResolvedScanDirFile[]> = {
    components: [],
    layouts: [],
    globals: [],
    composables: [],
    pages: [],
    plugins: [],
    css: [],
    middlewares: [],
  };

  entry.push(
    ...components.map((e) => e.file),
    ...layouts.map((e) => e.file),
    ...globals.map((e) => e.file),
    ...composables.map((e) => e.file),
    ...pages.map((e) => e.file),
    ...plugins.map((e) => e.file),
    ...css.map((e) => e.file),
    ...middlewares.map((e) => e.file),
  );

  const alias = resolveAliasDirs(cwd, _alias, {
    for: "tsconfig",
  }) as TsconfigPaths;

  generateServerTsconfig(alias);

  const aliasPrefixes = Object.keys(alias).map((key) =>
    key.endsWith("/*") ? key.slice(0, -1) : key,
  );

  const remapOutsideRoot = (chunk: { facadeModuleId?: string | null }) => {
    const id = chunk.facadeModuleId;

    if (id) {
      if (id.startsWith(appDir)) {
        return getOutputFile(id);
      }
    }

    return "[name].js";
  };

  function getOutputFile(id: string) {
    const ext = extname(id);
    const rExt = [".vue", ".js", ".ts", ".mjs", ".mts", ".cjs"].includes(ext)
      ? ".js"
      : ext;

    const rel = relative(appDir, id)
      .replace(new RegExp(`${ext}$`), "")
      .replace(/.vue.d$/, ".d");

    return posix.join(basename(appDir), `${rel}${rExt}`);
  }

  const buildConfig: InlineConfig = {
    entry,

    tsconfig: join(import.meta.dirname, GENERATED_TSCONFIG),
    outDir: resolve(cwd, "dist"),
    config: false,

    format: ["esm"],
    dts: { vue: true },
    sourcemap: false,
    clean: true,
    unbundle: true,
    minify: false,

    css: {},

    plugins: [
      Vue(),

      {
        name: "syora:log-resolved-outputs",
        generateBundle(_, bundle) {
          const allResolvedFiles = new Map<string, ResolvedKey>();

          for (const key of RESOLVED_KEYS) {
            for (const file of resolvedFiles[key]) {
              allResolvedFiles.set(file.file, key);
            }
          }

          for (const chunk of Object.values(bundle)) {
            // Only JS/asset chunks emitted from a source module have a
            // `facadeModuleId` — that's the original source path to match
            // against componentFiles/layoutFiles/etc.
            const sourceId =
              "facadeModuleId" in chunk ? chunk.facadeModuleId : undefined;

            if (!sourceId) continue;

            const key = allResolvedFiles.get(sourceId);
            if (!key) continue;

            const source = resolvedFiles[key].find((e) => e.file === sourceId);
            if (!source) continue;

            const relToParent = relative(source.parent, source.file);
            const depth = relToParent.split(sep).length;

            let distParent = chunk.fileName;
            for (let i = 0; i < depth; i++) {
              distParent = dirname(distParent);
            }

            resolvedFileOutputs[key].push({
              ...source,
              file: chunk.fileName,
              parent: distParent,
              dirs: [],
            });
          }
        },
      },

      {
        name: "syora:resolve-config-dirs",
        transform(code, id) {
          if (id !== _configFile) return null;

          return replaceResolvedFields(code, id, resolvedFileOutputs);
        },

        generateBundle() {},
      },
    ],

    alias: resolveAliasDirs(cwd, _alias, { for: "map" }) as AliasMap,

    deps: {
      neverBundle: (id) => {
        if (id.startsWith("#app")) return true;
        if (id.startsWith(":")) return true;

        if (id.startsWith(resolve(import.meta.dirname, "../.."))) return true;
        if (aliasPrefixes.some((prefix) => id.startsWith(prefix))) return false;
        return EXTERNAL_ID_PATTERN.test(id);
      },
    },

    outputOptions: {
      entryFileNames: remapOutsideRoot,
      chunkFileNames: remapOutsideRoot,
    },

    outExtensions: (ctx) => {
      return {
        js: ctx.format === "cjs" ? ".cjs" : ".js",
      };
    },
  };

  if (entry.length > 0) {
    await build(buildConfig);
  }

  if (_configFile) {
    await build({
      ...buildConfig,
      entry: _configFile,
      clean: entry.length === 0,
    });
  }
}

const RESOLVED_KEYS = [
  "components",
  "layouts",
  "globals",
  "composables",
  "pages",
  "plugins",
  "css",
  "middlewares",
] as const;

type ResolvedKey = (typeof RESOLVED_KEYS)[number];

const traverse = (
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as unknown as { default: typeof _traverse }).default
) as typeof _traverse;

/**
 * Replaces each of `components`/`layouts`/`globals`/`composables`/`pages`/
 * `plugins`/`css` inside the `defineConfig`/`defineModule` call with a
 * literal array of its already-resolved file paths.
 *
 * Uses `magic-string` to overwrite only the exact source range of each
 * property's value, rather than re-printing the whole file through
 * `@babel/generator` — sidesteps generator/parser version-mismatch bugs
 * (e.g. "unknown node of type Literal") entirely, and produces an accurate
 * sourcemap for free since untouched code is left byte-for-byte identical.
 */
function replaceResolvedFields(
  code: string,
  id: string,
  resolvedFiles: Record<ResolvedKey, ResolvedScanDirFile[]>,
) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript"],
  });

  const s = new MagicString(code);

  traverse(ast, {
    ObjectProperty(path) {
      const key = path.node.key;
      const keyName = t.isIdentifier(key)
        ? key.name
        : t.isStringLiteral(key)
          ? key.value
          : null;

      if (!keyName || !RESOLVED_KEYS.includes(keyName as ResolvedKey)) return;

      const objExpr = path.parentPath;
      if (!objExpr.isObjectExpression()) return;

      const call = objExpr.parentPath;
      const isConfigCall =
        call.isCallExpression() &&
        t.isIdentifier(call.node.callee) &&
        ["defineConfig", "defineModule"].includes(call.node.callee.name);

      if (!isConfigCall) return;

      const value = path.node.value;
      if (!value.start || !value.end) return;

      const files = resolvedFiles[keyName as ResolvedKey];
      const literal = JSON.stringify(files);

      s.overwrite(value.start, value.end, literal);
    },
  });

  return {
    code: s.toString(),
    map: s.generateMap({ source: id, hires: true }),
  };
}
