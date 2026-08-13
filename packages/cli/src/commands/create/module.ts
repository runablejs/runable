import { consola } from "consola";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";

import * as p from "@clack/prompts";

import {
  exitOnCancel,
  type BaseProjectAnswers,
  copyAppTemplate,
  handleSharedAnswers,
  afterAnswer,
} from "./shared.js";

export interface ModuleProjectAnswers extends BaseProjectAnswers {
  moduleName: string;
  configKey: string;
}

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

async function askConfigKey(moduleName: string): Promise<string> {
  const key = await p.text({
    message:
      "Config key? (used in consumer's syora.config to configure this module)",
    placeholder: moduleName,
  });
  return exitOnCancel(key).trim() || moduleName;
}

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

export async function handleModuleProject() {
  consola.start("Mode: Create a Syora module");

  const moduleName = await askModuleName();
  const configKey = await askConfigKey(moduleName);

  consola.info(`Selected module: ${moduleName}`);
  consola.info(`Config key: ${configKey}`);

  const answers = await handleSharedAnswers();

  const moduleDir = resolve(process.cwd(), moduleName);
  await mkdir(moduleDir, { recursive: true });

  const appDirResolved = resolve(moduleDir, answers.appDir);
  await copyAppTemplate(appDirResolved);

  Object.assign(answers._config, { configKey });

  await afterAnswer(moduleDir, answers, { moduleName, isModule: true });

  // printSummary(answers);

  return answers;
}
