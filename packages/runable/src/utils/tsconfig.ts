import { join, relative, resolve } from "node:path";
import { getPackageJson } from "./pkg";
import { normalizeDir } from "./dir";
import { useAllConfigs, useConfig } from "../config/load";
import uniq from "lodash/uniq.js";
import assign from "lodash/assign.js";
import { atomicWriteFile } from "./atomic-write-file";
import { resolvePackageEntry } from "./pkg-resolve-entry";
import { TsConfigBuilder } from "syt";

function createAppTsConfig() {
  return new TsConfigBuilder()
    .noEmit()
    .setModule("ESNext")
    .setModuleResolution("Bundler")
    .resolveJsonModule()
    .setCompilerOption("allowImportingTsExtensions", true)
    .setModuleDetection("force")
    .setJsx("preserve")
    .setCompilerOption("jsxImportSource", "vue")
    .setCompilerOption("noImplicitThis", true)
    .strict()
    .verbatimModuleSyntax()
    .useDefineForClassFields()
    .esModuleInterop()
    .forceConsistentCasingInFileNames()
    .setCompilerOption("libReplacement", false)
    .skipLibCheck()
    .setLib(["ESNext", "DOM", "DOM.Iterable"])
    .setTypes([]);
}

export const tsconfig = {
  app: createAppTsConfig(),
};

export function writeTsConfig() {
  const { output, appDir, alias, _configFile, _cwd } = useConfig();

  Object.entries(alias ?? {}).forEach(([key, value]) => {
    if (key === "#build") return;

    tsconfig.app.addAlias(key, normalizeDir(relative(process.cwd(), value)));
  });

  tsconfig.app.addAlias("#build", "./");
  tsconfig.app.addAlias("#build/*", `./*`);

  tsconfig.app.addInclude("./**/*.d.ts");
  tsconfig.app.addInclude(join(normalizeDir(relative(output, appDir)), "**/*"));

  if (_configFile) {
    tsconfig.app.addInclude(normalizeDir(relative(output, _configFile)));
  }

  for (const config of useAllConfigs()) {
    if (!config._isRunableModule) continue;
    if (!config._cwd.startsWith(_cwd)) continue;

    tsconfig.app.addInclude(
      normalizeDir(join(relative(output, config.appDir), "**/*")),
    );
  }

  const obj = tsconfig.app.toObject();
  Object.assign(obj, {
    vueCompilerOptions: {
      plugins: [
        "vue-router/volar/sfc-route-blocks",
        "vue-router/volar/sfc-typed-router",
      ],
    },
  });

  atomicWriteFile(
    join(output, "tsconfig.app.json"),
    JSON.stringify(obj, null, 2),
  );
}

/** @deprecated use writeTsConfig */
export function generateTsconfigs() {
  const { output, appDir, alias } = useConfig();
  let dependencies: string[] = [];

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

  const otsconfig = {
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
    JSON.stringify(otsconfig, undefined, 2),
  );
}
