import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import * as p from "@clack/prompts";
import { consola } from "consola";

import {
  exitOnCancel,
  type BaseProjectAnswers,
  copyAppTemplate,
  handleSharedAnswers,
  afterAnswer,
} from "./shared.js";

/** Answers collected for the "create a Syora module" flow: the shared answers plus the module's own identity (name and `configKey`). */
export interface ModuleProjectAnswers extends BaseProjectAnswers {
  moduleName: string;
  configKey: string;
}

/** Prompts for the module name, enforcing the same format as a valid (optionally scoped) npm package name. */
async function askModuleName(): Promise<string> {
  const name = await p.text({
    message: "Module name?",
    placeholder: "syora-awesome-module",
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
      "Config key? (used in consumer's syora.config to configure this module)",
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

/**
 * Runs the "create a Syora module" flow: asks for the module's identity,
 * scaffolds a new directory named after it, copies the app template into
 * it, then wires it up via `afterAnswer` with the module-specific flags.
 */
export async function handleModuleProject() {
  consola.start("Mode: Create a Syora module");

  const moduleName = await askModuleName();
  const configKey = await askConfigKey(moduleName);

  consola.info(`Selected module: ${moduleName}`);
  consola.info(`Config key: ${configKey}`);

  const answers = await handleSharedAnswers();

  // Unlike the "existing project" flow, a module gets its own fresh
  // directory (named after it) rather than being added to `process.cwd()`.
  const moduleDir = resolve(process.cwd(), moduleName);
  await mkdir(moduleDir, { recursive: true });

  const appDirResolved = resolve(moduleDir, answers.appDir);
  await copyAppTemplate(appDirResolved);

  // Record the config key alongside the other shared config values so it
  // ends up in the module's generated syora.config.
  Object.assign(answers._config, { configKey });

  // `isModule: true` tells `afterAnswer` to scaffold module-specific output
  // (e.g. `defineModule` instead of `defineConfig`) rather than a regular project.
  await afterAnswer(moduleDir, answers, { moduleName, isModule: true });

  // printSummary(answers);

  return answers;
}
