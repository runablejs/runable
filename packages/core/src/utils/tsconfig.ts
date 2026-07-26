import { join, relative, resolve } from "node:path";
import { getPackageJson, resolvePackageDir } from "./pkg";
import { normalizeDir } from "./dir";
import { useConfig } from "../config";
import uniq from "lodash/uniq.js";
import assign from "lodash/assign.js";
import { atomicWriteFile } from "./atomic-write-file";

export function generateTsconfigs() {
  let dependencies: string[] = [];
  const { output, appDir, alias } = useConfig();

  const _dirs = [import.meta.dirname, process.cwd()];

  for (const dir of _dirs) {
    const pkg = getPackageJson(undefined, dir);

    if (pkg.content.types) {
      dependencies.push(resolve(pkg.dir, pkg.content.types));
    }

    if (!pkg.content.dependencies) continue;

    for (const dependency of Object.keys(pkg.content.dependencies)) {
      const pkg = getPackageJson(dependency, dir);

      if (!pkg.content.types) continue;
      dependencies.push(resolve(pkg.dir, pkg.content.types));
    }
  }

  dependencies = uniq(dependencies.filter((dep) => dep !== null)).map((dep) => {
    return normalizeDir(relative(output, dep));
  });

  console.log();

  const tsconfig = {
    extends: relative(
      output,
      resolve(
        resolvePackageDir("@vue/tsconfig", import.meta.dirname),
        "tsconfig.dom.json",
      ),
    ),

    compilerOptions: {
      esModuleInterop: true,
      skipLibCheck: true,
      target: "ESNext",
      allowJs: true,
      resolveJsonModule: true,
      moduleDetection: "force",
      isolatedModules: true,
      verbatimModuleSyntax: true,
      allowArbitraryExtensions: true,
      strict: true,
      noUncheckedIndexedAccess: true,
      forceConsistentCasingInFileNames: true,
      noImplicitOverride: true,
      module: "preserve",
      noEmit: true,
      lib: ["ESNext", "dom", "dom.iterable", "webworker"],
      jsx: "preserve",
      jsxImportSource: "vue",
      types: [],
      moduleResolution: "Bundler",
      useDefineForClassFields: true,
      noImplicitThis: true,
      allowSyntheticDefaultImports: true,

      // Path mapping for cleaner imports.
      paths: assign(
        {},
        ...Object.keys(alias ?? {}).map((key) => {
          return {
            [key]: [normalizeDir(relative(process.cwd(), alias[key]!))],
          };
        }),
      ),

      // `vue-tsc --build` produces a .tsbuildinfo file for incremental type-checking.
      // Specified here to keep it out of the root directory.
      tsBuildInfoFile: relative(
        output,
        resolve(process.cwd(), "node_modules/.tmp/tsconfig.app.tsbuildinfo"),
      ),
    },

    vueCompilerOptions: {
      plugins: ["vue-router/volar/sfc-route-blocks"],
    },

    include: [
      ...dependencies,
      "./**/.d.ts",
      normalizeDir(relative(output, appDir)),
    ],
  };

  atomicWriteFile(
    join(output, "app.tsconfig.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
