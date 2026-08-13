import { cp, stat, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import * as p from "@clack/prompts";
import { consola } from "consola";
import { installDependencies, detectPackageManager } from "nypm";
import { parseModule, generateCode, builders } from "magicast";
import { existsSync } from "node:fs";

export const frameworks = [
  { value: "express", label: "Express", docs: "https://expressjs.com/" },
  { value: "fastify", label: "Fastify", docs: "https://fastify.dev/" },
  { value: "nestjs", label: "NestJS", docs: "https://docs.nestjs.com/" },
  { value: "adonisjs", label: "AdonisJS", docs: "https://adonisjs.com/" },
  { value: "hono", label: "Hono", docs: "https://hono.dev/" },
  { value: "koa", label: "Koa", docs: "https://koajs.com/" },
  { value: "other", label: "Other (I will configure it myself)" },
];

export const packageManagers = [
  { value: "npm", label: "npm" },
  { value: "pnpm", label: "pnpm" },
  { value: "yarn", label: "yarn" },
  { value: "bun", label: "bun" },
];

export interface BaseProjectAnswers {
  appDir: string;
  outputDir: string;
  distDir: string;
  publicDir: string;
  packageManager: string;
  installDeps: boolean;
}

export function exitOnCancel<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }
  return value as T;
}

export async function askFramework(): Promise<string> {
  const framework = await p.select({
    message: "Which backend framework are you using?",
    options: frameworks,
  });
  return exitOnCancel(framework);
}

export async function askCreateServerEntry(
  framework: string,
): Promise<boolean> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templatePath = resolve(
    __dirname,
    `../../../templates/default/server/entry/${framework}.ts`,
  );

  if (!existsSync(templatePath)) return false;

  const shouldCreate = await p.confirm({
    message: "Do you want to create a server entry file (server.ts)?",
    initialValue: true,
  });
  return exitOnCancel(shouldCreate);
}

export async function copyServerEntry(
  createServerEntry: boolean,
  framework: string,
  targetDir: string,
): Promise<void> {
  if (!createServerEntry) return;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templatePath = resolve(
    __dirname,
    `../../../templates/default/server/entry/${framework}.ts`,
  );

  const targetPath = resolve(targetDir, "server.ts");

  let targetExists = false;
  try {
    await stat(targetPath);
    targetExists = true;
  } catch {
    targetExists = false;
  }

  if (targetExists) {
    const shouldOverwrite = await p.confirm({
      message: "server.ts already exists. Overwrite?",
      initialValue: false,
    });
    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      consola.info("Skipping server.ts generation.");
      return;
    }
  }

  await cp(templatePath, targetPath);
  consola.success(`Created server.ts at ${targetPath}`);
}

export async function askAppDir(): Promise<string> {
  const appDir = await p.text({
    message: "Where will your Vue application source code be located? (appDir)",
    placeholder: "app",
  });
  return exitOnCancel(appDir).trim() || "app";
}

export async function askOutputDir(): Promise<string> {
  const outputDir = await p.text({
    message: "Where should the build output be written? (outputDir)",
    placeholder: ".app",
  });
  return exitOnCancel(outputDir).trim() || ".app";
}

export async function askDistDir(): Promise<string> {
  const distDir = await p.text({
    message: "Where should the distribution build be written? (distDir)",
    placeholder: ".output",
  });
  return exitOnCancel(distDir).trim() || ".output";
}

export async function askPublicDir(): Promise<string> {
  const publicDir = await p.text({
    message: "Where will your static assets be served from? (publicDir)",
    placeholder: "public",
  });
  return exitOnCancel(publicDir).trim() || "public";
}

export async function askPackageManager(): Promise<string> {
  const detected = await detectPackageManager(process.cwd()).catch(() => null);
  const pm = await p.select({
    message: "Which package manager do you use?",
    options: packageManagers.map((pm) => ({
      ...pm,
      hint: detected?.name === pm.value ? "detected" : undefined,
    })),
    initialValue: detected?.name,
  });
  return exitOnCancel(pm);
}

export async function askInstallDeps(): Promise<boolean> {
  const shouldInstall = await p.confirm({
    message: "Install dependencies now?",
    initialValue: true,
  });
  return exitOnCancel(shouldInstall);
}

export async function copyAppTemplate(targetDir: string): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templateDir = resolve(__dirname, "../../../templates/default/app");

  let templateExists = false;
  try {
    await stat(templateDir);
    templateExists = true;
  } catch {
    throw new Error(
      `Template directory not found: ${templateDir}\n` +
        `Make sure "templates/default/app" is shipped alongside the CLI build.`,
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
  consola.success(`App template copied to ${targetDir}`);
}

export async function updatePackageJson(): Promise<void> {
  const pkgPath = resolve(process.cwd(), "package.json");
  let pkg: Record<string, any>;
  try {
    const content = await readFile(pkgPath, "utf-8");
    pkg = JSON.parse(content);
  } catch {
    consola.warn(
      "No package.json found in the current directory. Skipping dependency injection.",
    );
    return;
  }

  pkg.dependencies = pkg.dependencies || {};
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.scripts = pkg.scripts || {};

  if (!pkg.dependencies["@syora/core"]) {
    pkg.dependencies["@syora/core"] = "latest";
  }
  if (!pkg.dependencies["vue"]) {
    pkg.dependencies["vue"] = "^3.5.0";
  }
  if (!pkg.dependencies["vue-router"]) {
    pkg.dependencies["vue-router"] = "^4.5.0";
  }

  if (!pkg.devDependencies["@syora/cli"]) {
    pkg.devDependencies["@syora/cli"] = "latest";
  }

  if (!pkg.scripts["app:build"]) {
    pkg.scripts["app:build"] = "syora build";
  }
  if (!pkg.scripts["app:prepare"]) {
    pkg.scripts["app:prepare"] = "syora prepare";
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  consola.success("Updated package.json with Syora dependencies and scripts");
}

function buildSyoraConfig(identifier: string, config: Record<string, unknown>) {
  const valueToNode = (value: unknown): unknown => {
    if (value === null) {
      return null;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }

    if (typeof value === "function") {
      return builders.raw(value.toString());
    }

    if (Array.isArray(value)) {
      return value.map(valueToNode);
    }

    if (typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, value]) => [key, valueToNode(value)]),
      );
    }

    throw new TypeError(`Unsupported config value: ${typeof value}`);
  };

  const configObject = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, valueToNode(value)]),
  );

  const mod = parseModule(
    `import { ${identifier} } from "@syora/core";\n\nexport default ${identifier}({});`,
  );

  mod.exports.default.$args[0] = configObject;

  return mod;
}

export async function writeSyoraConfig(
  config: Record<string, unknown>,
  {
    identifier = "defineConfig",
    cwd = process.cwd(),
  }: { identifier?: string; cwd?: string } = {},
): Promise<void> {
  const configPath = resolve(cwd, "syora.config.ts");

  let exists = false;

  try {
    await stat(configPath);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    const shouldOverwrite = await p.confirm({
      message: "syora.config.ts already exists. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      consola.info("Skipping syora.config.ts generation.");
      return;
    }
  }

  const mod = buildSyoraConfig(identifier, config);
  const content = generateCode(mod).code + "\n";

  await writeFile(configPath, content, "utf-8");

  consola.success("Created syora.config.ts");
}

export async function createPackageJson(
  targetDir: string,
  moduleName: string,
): Promise<void> {
  const pkgPath = resolve(targetDir, "package.json");

  let exists = false;
  try {
    await stat(pkgPath);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    const shouldOverwrite = await p.confirm({
      message: `package.json already exists in "${targetDir}". Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      consola.info("Skipping package.json generation.");
      return;
    }
  }

  const pkg = {
    name: moduleName,
    version: "1.0.0",
    type: "module",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
        require: "./dist/index.js",
      },
    },
    main: "./dist/index.js",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    files: ["dist"],
    scripts: {
      build: "syora build",
      "app:prepare": "syora prepare",
    },
    dependencies: {
      //   "@syora/core": "latest",
    },
    devDependencies: {
      //   "@syora/cli": "latest",
      typescript: "^6.0.3",
    },
    engines: {
      node: ">=20.0.0",
    },
  };

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  consola.success(`Created package.json for module "${moduleName}"`);
}

export async function installDependenciesIfWanted(
  packageManager: string,
  installDeps: boolean,
  cwd: string = process.cwd(),
): Promise<void> {
  if (!installDeps) {
    consola.info("Skipping dependency installation.");
    return;
  }

  const s = p.spinner();
  s.start("Installing dependencies...");

  try {
    await installDependencies({
      cwd,
      packageManager: packageManager as "npm" | "pnpm" | "yarn" | "bun",
    });
    s.stop("Dependencies installed successfully.");
  } catch (err) {
    s.stop("Failed to install dependencies.");
    consola.error(err);
    throw err;
  }
}

export async function handleSharedAnswers() {
  const framework = await askFramework();
  consola.info(
    `Selected framework: ${frameworks.find((f) => f.value === framework)?.label}`,
  );

  const appDir = await askAppDir();
  const outputDir = await askOutputDir();
  const distDir = await askDistDir();
  const publicDir = await askPublicDir();
  const createServerEntry = await askCreateServerEntry(framework);
  const packageManager = await askPackageManager();
  const installDeps = await askInstallDeps();

  const answers = {
    framework,
    appDir,
    outputDir,
    createServerEntry,
    distDir,
    publicDir,
    packageManager,
    installDeps,

    _config: {
      appDir: appDir,
      output: outputDir,
      distDir: distDir,
      public: publicDir,
    },
  };

  return answers;
}

export async function afterAnswer(
  cwd: string,
  answers: Awaited<ReturnType<typeof handleSharedAnswers>>,
  {
    isModule = false,
    moduleName,
  }: { isModule?: boolean; moduleName?: string } = {},
) {
  const appDirResolved = resolve(cwd, answers.appDir);
  await copyAppTemplate(appDirResolved);

  await writeSyoraConfig(answers._config, {
    identifier: isModule ? "defineModule" : "defineConfig",
    cwd,
  });

  if (isModule) await createPackageJson(cwd, moduleName!);
  else await updatePackageJson();

  await copyServerEntry(answers.createServerEntry, answers.framework, cwd);

  await installDependenciesIfWanted(
    answers.packageManager,
    answers.installDeps,
    cwd,
  );
}
