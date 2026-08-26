import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as p from "@clack/prompts";
import { consola } from "consola";

import {
  exitOnCancel,
  askFramework,
  frameworks,
  askPackageManager,
  askInstallDeps,
  installDependenciesIfWanted,
  copyAgentsFile,
} from "./shared.js";

export interface StarterProjectAnswers {
  projectName: string;
  framework: string;
  packageManager: string;
  installDeps: boolean;
}

/**
 * Copies the `framework` starter template into `targetDir`, prompting to
 * overwrite if the target directory already exists.
 */
export async function copyStarterTemplate(
  framework: string,
  targetDir: string,
): Promise<void> {
  // Starters are shipped as static folders alongside the built CLI, so this
  // is resolved relative to this compiled file rather than the source layout.
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sharedTemplateDir = resolve(__dirname, "../../../starters/_shared");
  const templateDir = resolve(__dirname, `../../../starters/${framework}`);

  let templateExists = false;
  try {
    await stat(templateDir);
    templateExists = true;
  } catch {
    // Surface a clearer error than the raw ENOENT from `stat`.
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

  // Don't silently clobber an existing directory.
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
  await cp(sharedTemplateDir, targetDir, { recursive: true, force: true });
  await cp(templateDir, targetDir, { recursive: true, force: true });
  consola.success(`Starter template copied to ${targetDir}`);
}

/** Prompts for the project name, restricted to lowercase letters, numbers, and hyphens. */
async function askProjectName(): Promise<string> {
  const name = await p.text({
    message: "Project name?",
    placeholder: "my-runable-app",
    validate(value) {
      if (!value) return "Project name is required.";
      if (!/^[a-z0-9-]+$/.test(value)) {
        return "Invalid name. Use only lowercase letters, numbers, and hyphens.";
      }
    },
  });
  return exitOnCancel(name).trim();
}

/** Prints a human-readable recap of the collected answers before scaffolding runs. */
function printSummary(answers: StarterProjectAnswers): void {
  consola.success("Configuration collected:");
  consola.info(`  Project name:     ${answers.projectName}`);
  consola.info(`  Framework:        ${answers.framework}`);
  consola.info(`  Package manager:  ${answers.packageManager}`);
  consola.info(`  installDeps:      ${answers.installDeps ? "yes" : "no"}`);
}

/**
 * Runs the "start with a starter" flow: collects the project name,
 * framework, and package manager, scaffolds a new directory from the
 * matching starter template, adds AGENTS.md, then installs dependencies if
 * requested.
 */
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
  await copyStarterTemplate(framework, projectDir);
  const packageJsonPath = resolve(projectDir, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  packageJson.name = projectName;
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  await copyAgentsFile(projectDir);

  if (installDeps) {
    await installDependenciesIfWanted(packageManager, installDeps, projectDir);
  }

  // printSummary(answers);

  return {
    framework,
  };
}
