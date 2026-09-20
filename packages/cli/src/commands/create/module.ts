import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as p from "@clack/prompts";
import { consola } from "consola";

import {
  askFramework,
  askInstallDeps,
  askPackageManager,
  copyAgentsFile,
  createPackageJson,
  exitOnCancel,
  getCliPackageVersion,
  installDependenciesIfWanted,
} from "./shared.js";
import { copyStarterTemplate } from "./starter.js";

/** Answers collected for the "create a Runable module" flow: the shared answers plus the module's own identity (name and `configKey`). */
export interface ModuleProjectAnswers {
  moduleName: string;
  configKey: string;
  framework: string;
  packageManager: string;
  installDeps: boolean;
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
  consola.info(`  Framework:        ${answers.framework}`);
  consola.info(`  packageManager:   ${answers.packageManager}`);
  consola.info(`  installDeps:      ${answers.installDeps ? "yes" : "no"}`);
}

/** Creates the local Runable application used to develop and test a module. */
export async function createModulePlayground(
  moduleDir: string,
  options: {
    moduleName: string;
    framework: string;
  },
) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sharedStarterDir = resolve(__dirname, "../../../starters/_shared");
  const playgroundDir = resolve(moduleDir, "playground");

  if (options.framework !== "other") {
    await copyStarterTemplate(options.framework, playgroundDir);
  } else {
    await mkdir(playgroundDir, { recursive: true });
    await cp(sharedStarterDir, playgroundDir, {
      recursive: true,
      force: true,
    });

    const version = await getCliPackageVersion();
    await writeFile(
      resolve(playgroundDir, "package.json"),
      `${JSON.stringify(
        {
          name: "playground",
          private: true,
          type: "module",
          scripts: {
            prepare: "runable prepare",
            build: "runable build",
            typecheck: "tsc --noEmit",
          },
          dependencies: {
            runable: version,
            vue: "^3.5.0",
            "vue-router": "^5.2.0",
          },
          devDependencies: {
            "@runablejs/cli": version,
            "@types/node": "^24.13.3",
            typescript: "^6.0.3",
          },
        },
        null,
        2,
      )}\n`,
    );
  }

  const packageJsonPath = resolve(playgroundDir, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  packageJson.name = `${options.moduleName.replace(/^@/, "").replace("/", "-")}-playground`;
  packageJson.private = true;
  packageJson.scripts = packageJson.scripts ?? {};
  packageJson.scripts.prepare ??= "runable prepare";
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  await writeFile(
    resolve(playgroundDir, "runable.config.ts"),
    `import { defineConfig } from "runable";

export default defineConfig({
  output: "../.app",
  distdir: "../.output",
  modules: [".."],
});
`,
  );
}

/** Creates the publishable module package at the project root. */
export async function createModuleRoot(
  moduleDir: string,
  options: {
    moduleName: string;
    configKey: string;
    packageManager: string;
  },
) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sharedStarterDir = resolve(__dirname, "../../../starters/_shared");

  await mkdir(moduleDir, { recursive: true });
  await copyAgentsFile(moduleDir);
  await writeFile(
    resolve(moduleDir, "runable.config.ts"),
    `import { defineModule } from "runable";

export default defineModule({
  configKey: ${JSON.stringify(options.configKey)},
});
`,
  );
  await cp(
    resolve(sharedStarterDir, "tsconfig.json"),
    resolve(moduleDir, "tsconfig.json"),
  );
  await cp(
    resolve(sharedStarterDir, "tsconfig.node.json"),
    resolve(moduleDir, "tsconfig.node.json"),
  );
  await createPackageJson(
    moduleDir,
    options.moduleName,
    options.packageManager,
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

  const framework = await askFramework();
  const packageManager = await askPackageManager();
  const installDeps = await askInstallDeps();

  // Unlike the "existing project" flow, a module gets its own fresh
  // directory (named after it) rather than being added to `process.cwd()`.
  const moduleDir = resolve(process.cwd(), moduleName);
  await createModuleRoot(moduleDir, {
    moduleName,
    configKey,
    packageManager,
  });
  await createModulePlayground(moduleDir, { moduleName, framework });
  await installDependenciesIfWanted(packageManager, installDeps, moduleDir);

  // printSummary(answers);

  return { moduleName, configKey, framework, packageManager, installDeps };
}
