import type { ResolvedConfig } from "@/config/types.js";
import { toProjectRelative } from "./relative.js";
import type { InspectorModule } from "./types.js";

/** A module resolved from `node_modules` (see `getModuleDir` in `config/load.ts`, which
 * always appends `/dist` under the package's own directory) is an installed package —
 * even one that happens to live inside `rootDir`, unlike a `./relative/path` module. */
function isPackageModule(configFile: string): boolean {
  return configFile.split(/[/\\]/).includes("node_modules");
}

/**
 * Every field this needs is already sitting on `ResolvedConfig` once
 * `loadConfig()` has resolved the module graph (`_name`, `_configFile`,
 * `_configKey` — set in `resolveAllConfigs`, `config/load.ts`) — no
 * additional scanning or resolution required.
 */
export function resolveInspectorModules(
  rootDir: string,
  allConfigs: ResolvedConfig[],
): InspectorModule[] {
  return allConfigs
    .filter((config) => config._name !== "__main")
    .map((config) => {
      const configFile = config._configFile;
      const kind: InspectorModule["kind"] =
        configFile && isPackageModule(configFile) ? "package" : "local";

      const module: InspectorModule = {
        name: config._name,
        source: configFile ? toProjectRelative(rootDir, configFile) : config._name,
        kind,
      };
      if (config._configKey) module.configKey = config._configKey;

      return module;
    });
}
