import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as p from "@clack/prompts";
import { consola } from "consola";

import {
  exitOnCancel,
  type BaseProjectAnswers,
  handleSharedAnswers,
  afterAnswer,
  copyServerEntry,
  getCliPackageVersion,
  writeRunableConfig,
} from "./shared.js";

/** Answers collected for the "create a Runable module" flow: the shared answers plus the module's own identity (name and `configKey`). */
export interface ModuleProjectAnswers extends BaseProjectAnswers {
  moduleName: string;
  configKey: string;
}

/** Prompts for the module name, enforcing the same format as a valid (optionally scoped) npm package name. */
async function askModuleName(): Promise<string> {
  const name = await p.text({
    message: "Module name?",
    placeholder: "runable-awesome-module",
    validate(value) {
      if (!value) return "Module name is required.";
      if (!/^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(value)) {
        return "Invalid name. Use only lowercase letters, numbers, and hyphens.";
      }
    },
  });
  return exitOnCancel(name).trim();
}

/** Prompts for the module's `configKey`, defaulting to the module name when left blank. */
async function askConfigKey(moduleName: string): Promise<string> {
  const key = await p.text({
    message:
      "Config key? (used in consumer's runable.config to configure this module)",
    placeholder: moduleName,
  });
  return exitOnCancel(key).trim() || moduleName;
}

/** Prints a human-readable recap of the collected answers before scaffolding runs. */
function printSummary(answers: ModuleProjectAnswers): void {
  consola.success("Configuration collected:");
  consola.info(`  Module name:      ${answers.moduleName}`);
  consola.info(`  Config key:       ${answers.configKey}`);
  consola.info(`  appDir:           ${answers.appDir}`);
  consola.info(`  outputDir:        ${answers.outputDir}`);
  consola.info(`  distDir:          ${answers.distDir}`);
  consola.info(`  publicDir:        ${answers.publicDir}`);
  consola.info(`  packageManager:   ${answers.packageManager}`);
  consola.info(`  installDeps:      ${answers.installDeps ? "yes" : "no"}`);
}

/** Creates the local Runable application used to develop and test a module. */
export async function createModulePlayground(
  moduleDir: string,
  options: {
    moduleName: string;
    framework: string;
    createServerEntry: boolean;
  },
) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sharedStarterDir = resolve(__dirname, "../../../starters/_shared");
  const playgroundDir = resolve(moduleDir, "playground");

  await mkdir(playgroundDir, { recursive: true });
  await cp(resolve(sharedStarterDir, "app"), resolve(playgroundDir, "app"), {
    recursive: true,
    force: true,
  });
  await cp(
    resolve(sharedStarterDir, "tsconfig.json"),
    resolve(playgroundDir, "tsconfig.json"),
  );
  await cp(
    resolve(sharedStarterDir, "tsconfig.node.json"),
    resolve(playgroundDir, "tsconfig.node.json"),
  );
  await writeRunableConfig({ modules: [".."] }, { cwd: playgroundDir });
  await copyServerEntry(
    options.createServerEntry,
    options.framework,
    playgroundDir,
  );

  const version = await getCliPackageVersion();
  const packageJson = {
    name: `${options.moduleName.replace(/^@/, "").replace("/", "-")}-playground`,
    private: true,
    type: "module",
    scripts: {
      ...(options.createServerEntry
        ? { dev: "runable prepare && tsx watch server.ts" }
        : {}),
      prepare: "runable prepare",
      build: "runable build",
      typecheck: "tsc --noEmit",
    },
    dependencies: {
      [options.moduleName]: "*",
      ...(options.framework === "express" && options.createServerEntry
        ? { express: "^5.2.1" }
        : {}),
      runable: version,
      vue: "^3.5.0",
      "vue-router": "^5.2.0",
    },
    devDependencies: {
      "@runablejs/cli": version,
      ...(options.framework === "express" && options.createServerEntry
        ? { "@types/express": "^5.0.6" }
        : {}),
      "@types/node": "^24.13.3",
      tsx: "^4.23.12",
      typescript: "^6.0.3",
    },
  };

  await writeFile(
    resolve(playgroundDir, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

/**
 * Runs the "create a Runable module" flow: asks for the module's identity,
 * scaffolds a new directory named after it, copies the app template into
 * it, then wires it up via `afterAnswer` with the module-specific flags.
 */
export async function handleModuleProject() {
  consola.start("Mode: Create a Runable module");

  const moduleName = await askModuleName();
  const configKey = await askConfigKey(moduleName);

  consola.info(`Selected module: ${moduleName}`);
  consola.info(`Config key: ${configKey}`);

  const answers = await handleSharedAnswers();

  // Unlike the "existing project" flow, a module gets its own fresh
  // directory (named after it) rather than being added to `process.cwd()`.
  const moduleDir = resolve(process.cwd(), moduleName);
  await mkdir(moduleDir, { recursive: true });

  // Record the config key alongside the other shared config values so it
  // ends up in the module's generated runable.config.
  Object.assign(answers._config, { configKey });

  await createModulePlayground(moduleDir, { moduleName, ...answers });

  // `isModule: true` tells `afterAnswer` to scaffold module-specific output
  // (e.g. `defineModule` instead of `defineConfig`) rather than a regular project.
  await afterAnswer(
    moduleDir,
    { ...answers, createServerEntry: false },
    { moduleName, isModule: true },
  );

  // printSummary(answers);

  return answers;
}
