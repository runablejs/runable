import { join, relative, resolve } from "node:path";
import { getPackageJson, resolvePackageDir } from "./pkg";
import { normalizeDir } from "./dir";
import { useConfig } from "../config/load";
import uniq from "lodash/uniq.js";
import assign from "lodash/assign.js";
import { atomicWriteFile } from "./atomic-write-file";
import { resolvePackageEntry } from "./pkg-resolve-entry";

export function generateTsconfigs() {
  let dependencies: string[] = [];
  const { output, appDir, alias } = useConfig();

  const _dirs = [import.meta.dirname, process.cwd()];

  for (const dir of _dirs) {
    const pkg = getPackageJson(undefined, dir);

    if (process.cwd() !== dir) {
      const entry = resolvePackageEntry(pkg.content, ".", "import");

      if (entry.types) {
        dependencies.push(resolve(pkg.dir, entry.types));
      }
    }

    if (!pkg.content.dependencies) continue;

    for (const dependency of Object.keys(pkg.content.dependencies)) {
      try {
        const pkg = getPackageJson(dependency, dir);
        const entry = resolvePackageEntry(pkg.content, ".", "import");

        if (!entry.types) continue;

        dependencies.push(resolve(pkg.dir, entry.types));
      } catch {}
    }
  }

  dependencies = uniq(dependencies.filter((dep) => dep !== null)).map((dep) => {
    return normalizeDir(relative(output, dep));
  });

  const tsconfig = {
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
      lib: ["ESNext", "dom", "dom.iterable", "webworker"],
      jsx: "preserve",
      jsxImportSource: "vue",
      types: [],
      moduleResolution: "Bundler",
      useDefineForClassFields: true,
      noImplicitThis: true,
      allowSyntheticDefaultImports: true,

      noEmit: true,
      composite: true,
      declaration: true,

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
      normalizeDir(join(relative(output, appDir), "**/*")),
      "./**/*.d.ts",
      ...dependencies,
    ],
  };

  atomicWriteFile(
    join(output, "tsconfig.app.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
