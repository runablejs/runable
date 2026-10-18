import { join, relative } from "node:path";
import { TsConfigBuilder } from "syt";

import { normalizeDir } from "./dir.js";
import { useAllConfigs, useConfig } from "../config/load.js";
import { atomicWriteFile } from "./atomic-write-file.js";
import { toTsconfigAlias } from "./alias.js";

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
  const { output, appDir, alias, _configFile } = useConfig();

  Object.entries(toTsconfigAlias(alias)).forEach(([key, value]) => {
    tsconfig.app.addAlias(
      key,
      value.map((v) => normalizeDir(relative(output, v))),
    );
  });

  tsconfig.app.addInclude("./**/*.d.ts");
  tsconfig.app.addInclude(join(normalizeDir(relative(output, appDir)), "**/*"));

  if (_configFile) {
    tsconfig.app.addInclude(normalizeDir(relative(output, _configFile)));
  }

  for (const config of useAllConfigs()) {
    if (!config._isRunableModule) continue;
    if (!config._isLocalModule) continue;

    tsconfig.app.addInclude(
      normalizeDir(join(relative(output, config.appDir), "**/*")),
    );

    if (config._configFile) {
      tsconfig.app.addInclude(
        normalizeDir(relative(output, config._configFile)),
      );
    }
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
