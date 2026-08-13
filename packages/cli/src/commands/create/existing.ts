import { consola } from "consola";

import {
  type BaseProjectAnswers,
  handleSharedAnswers,
  afterAnswer,
} from "./shared.js";

export interface ExistingProjectAnswers extends BaseProjectAnswers {
  framework: string;
}

function printSummary(answers: ExistingProjectAnswers): void {
  consola.success("Configuration collected:");
  consola.info(`  Framework:        ${answers.framework}`);
  consola.info(`  appDir:           ${answers.appDir}`);
  consola.info(`  outputDir:        ${answers.outputDir}`);
  consola.info(`  distDir:          ${answers.distDir}`);
  consola.info(`  publicDir:        ${answers.publicDir}`);
  consola.info(`  packageManager:   ${answers.packageManager}`);
  consola.info(`  installDeps:      ${answers.installDeps ? "yes" : "no"}`);
}

export async function handleExistingProject() {
  consola.start("Mode: Add to an existing project");

  const answers = await handleSharedAnswers();

  await afterAnswer(process.cwd(), answers, {});

  // printSummary(answers);

  return answers;
}
