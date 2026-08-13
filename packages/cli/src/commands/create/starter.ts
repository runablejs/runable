import { consola } from "consola";
import { dirname, resolve } from "node:path";
import { cp, mkdir, stat } from "node:fs/promises";

import * as p from "@clack/prompts";

import {
  exitOnCancel,
  askFramework,
  frameworks,
  askPackageManager,
  askInstallDeps,
  installDependenciesIfWanted,
} from "./shared.js";
import { fileURLToPath } from "node:url";

export interface StarterProjectAnswers {
  projectName: string;
  framework: string;
  packageManager: string;
  installDeps: boolean;
}

export async function copyStarterTemplate(
  framework: string,
  targetDir: string,
): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templateDir = resolve(__dirname, `../../../starters/${framework}`);

  let templateExists = false;
  try {
    await stat(templateDir);
    templateExists = true;
  } catch {
    throw new Error(
      `Starter template not found: ${templateDir}\n` +
        `Make sure "starters/${framework}" is shipped alongside the CLI build.`,
    );
  }

  if (!templateExists) return;

  let targetExists = false;
  try {
    await stat(targetDir);
    targetExists = true;
  } catch {
    targetExists = false;
  }

  if (targetExists) {
    const shouldOverwrite = await p.confirm({
      message: `Directory "${targetDir}" already exists. Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }
  }

  await mkdir(targetDir, { recursive: true });
  await cp(templateDir, targetDir, { recursive: true, force: true });
  consola.success(`Starter template copied to ${targetDir}`);
}

async function askProjectName(): Promise<string> {
  const name = await p.text({
    message: "Project name?",
    placeholder: "my-syora-app",
    validate(value) {
      if (!value) return "Project name is required.";
      if (!/^[a-z0-9-]+$/.test(value)) {
        return "Invalid name. Use only lowercase letters, numbers, and hyphens.";
      }
    },
  });
  return exitOnCancel(name).trim();
}

function printSummary(answers: StarterProjectAnswers): void {
  consola.success("Configuration collected:");
  consola.info(`  Project name:     ${answers.projectName}`);
  consola.info(`  Framework:        ${answers.framework}`);
  consola.info(`  Package manager:  ${answers.packageManager}`);
  consola.info(`  installDeps:      ${answers.installDeps ? "yes" : "no"}`);
}

export async function handleStarterProject() {
  consola.start("Mode: Start with a starter");

  const projectName = await askProjectName();
  const framework = await askFramework();

  consola.info(
    `Selected framework: ${frameworks.find((f) => f.value === framework)?.label}`,
  );

  const packageManager = await askPackageManager();
  const installDeps = await askInstallDeps();

  const projectDir = resolve(process.cwd(), projectName);
  await mkdir(projectDir, { recursive: true });
  await copyStarterTemplate(framework, projectDir);

  if (installDeps) {
    await installDependenciesIfWanted(packageManager, installDeps, projectDir);
  }

  // printSummary(answers);

  return {
    framework,
  };
}
