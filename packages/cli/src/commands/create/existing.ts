import { consola } from "consola";

import {
  type BaseProjectAnswers,
  handleSharedAnswers,
  afterAnswer,
} from "./shared.js";

/** Answers collected for the "add to an existing project" flow: the shared answers plus the selected backend framework. */
export interface ExistingProjectAnswers extends BaseProjectAnswers {
  framework: string;
}

/** Prints a human-readable recap of the collected answers before scaffolding runs. */
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

/** Runs the "add to an existing project" flow: collects the shared answers, then wires up the project via `afterAnswer`. */
export async function handleExistingProject() {
  consola.start("Mode: Add to an existing project");

  const answers = await handleSharedAnswers();

  await afterAnswer(process.cwd(), answers, {});

  // printSummary(answers);

  return answers;
}
