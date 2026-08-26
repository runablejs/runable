import { existsSync } from "node:fs";
import { cp, stat, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import * as p from "@clack/prompts";
import { consola } from "consola";
import { parseModule, generateCode, builders } from "magicast";
import { installDependencies, detectPackageManager } from "nypm";

/** Backend frameworks offered in the "existing project" and "starter" flows, with a docs link shown after creation. */
export const frameworks = [
  { value: "express", label: "Express", docs: "https://expressjs.com/" },
  { value: "fastify", label: "Fastify", docs: "https://fastify.dev/" },
  { value: "nestjs", label: "NestJS", docs: "https://docs.nestjs.com/" },
  { value: "adonisjs", label: "AdonisJS", docs: "https://adonisjs.com/" },
  { value: "hono", label: "Hono", docs: "https://hono.dev/" },
  { value: "koa", label: "Koa", docs: "https://koajs.com/" },
  { value: "other", label: "Other (I will configure it myself)" },
];

/** Package managers offered when asking how to install dependencies. */
export const packageManagers = [
  { value: "npm", label: "npm" },
  { value: "pnpm", label: "pnpm" },
  { value: "yarn", label: "yarn" },
  { value: "bun", label: "bun" },
];

/** Answers shared by all three creation flows (existing project, starter, module). */
export interface BaseProjectAnswers {
  appDir: string;
  outputDir: string;
  distDir: string;
  publicDir: string;
  packageManager: string;
  installDeps: boolean;
}

/** Unwraps a clack prompt result, exiting the process if the user cancelled (Ctrl+C) instead of returning the cancellation symbol. */
export function exitOnCancel<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }
  return value as T;
}

/** Prompts the user to pick their backend framework from `frameworks`. */
export async function askFramework(): Promise<string> {
  const framework = await p.select({
    message: "Which backend framework are you using?",
    options: frameworks,
  });
  return exitOnCancel(framework);
}

/**
 * Whether to generate a `server.ts` entry file for `framework`. Returns
 * `false` without prompting when no server-entry template ships for that
 * framework (e.g. "other").
 */
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

/**
 * Copies the `framework` server-entry template to `targetDir/server.ts`,
 * prompting to overwrite if it already exists. No-op when
 * `createServerEntry` is false (see `askCreateServerEntry`).
 */
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

// Below: one text prompt per project directory, each falling back to
// Runable's own default (shown as the placeholder) when left blank.

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

/** Prompts for a package manager, pre-selecting and flagging whichever one `detectPackageManager` finds in the current directory (e.g. from a lockfile). */
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

/**
 * Copies the default Vue app template into `targetDir`, prompting to
 * overwrite if it already exists.
 */
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

/**
 * Copies the AI-agent instructions file (`AGENTS.md`) to the project root,
 * prompting to overwrite if one already exists. Every project scaffolded by
 * `create` should ship one so coding agents (Claude Code, Codex, Cursor,
 * Gemini CLI, ...) understand Runable's conventions without guessing.
 */
export async function copyAgentsFile(targetDir: string): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templatePath = resolve(
    __dirname,
    "../../../templates/default/AGENTS.md",
  );

  if (!existsSync(templatePath)) return;

  const targetPath = resolve(targetDir, "AGENTS.md");

  if (existsSync(targetPath)) {
    const shouldOverwrite = await p.confirm({
      message: "AGENTS.md already exists. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      consola.info("Skipping AGENTS.md generation.");
      return;
    }
  }

  await mkdir(targetDir, { recursive: true });
  await cp(templatePath, targetPath, { force: true });
  consola.success("Created AGENTS.md");
}

/**
 * Adds Runable's runtime/dev dependencies and build scripts to the
 * `package.json` in the current directory, without touching anything
 * already declared there. No-op (with a warning) if no `package.json` is
 * found — used for the "existing project" flow, see `createPackageJson`
 * for the module-scaffolding equivalent.
 */
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

  if (!pkg.dependencies["runable"]) {
    pkg.dependencies["runable"] = "latest";
  }
  if (!pkg.dependencies["vue"]) {
    pkg.dependencies["vue"] = "^3.5.0";
  }
  if (!pkg.dependencies["vue-router"]) {
    pkg.dependencies["vue-router"] = "^4.5.0";
  }

  if (!pkg.devDependencies["@runablejs/cli"]) {
    pkg.devDependencies["@runablejs/cli"] = "latest";
  }

  if (!pkg.scripts["app:build"]) {
    pkg.scripts["app:build"] = "runable build";
  }
  if (!pkg.scripts["app:prepare"]) {
    pkg.scripts["app:prepare"] = "runable prepare";
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  consola.success("Updated package.json with Runable dependencies and scripts");
}

/**
 * Builds an in-memory `runable.config.ts` module (via magicast) whose default
 * export is `identifier({ ...config })`. Going through an AST instead of
 * `JSON.stringify` lets `config` values be more than plain JSON — in
 * particular, a function is emitted as real source code (see `valueToNode`)
 * instead of being dropped or stringified.
 */
function buildRunableConfig(
  identifier: string,
  config: Record<string, unknown>,
) {
  // Recursively turns a config value into something magicast can splice
  // into the AST: primitives, arrays and plain objects pass through as-is;
  // a function is turned into raw source via `.toString()` so it's emitted
  // as actual code in the generated file rather than lost to JSON.
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
    `import { ${identifier} } from "runable";\n\nexport default ${identifier}({});`,
  );

  // Replace the placeholder `{}` argument with the real, resolved config.
  mod.exports.default.$args[0] = configObject;

  return mod;
}

/**
 * Generates and writes `runable.config.ts` at `cwd`, calling `identifier(config)`
 * as its default export — `"defineConfig"` for a regular project,
 * `"defineModule"` for a Runable module (see `afterAnswer`). Prompts to
 * overwrite if the file already exists.
 */
export async function writeRunableConfig(
  config: Record<string, unknown>,
  {
    identifier = "defineConfig",
    cwd = process.cwd(),
  }: { identifier?: string; cwd?: string } = {},
): Promise<void> {
  const configPath = resolve(cwd, "runable.config.ts");

  let exists = false;

  try {
    await stat(configPath);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    const shouldOverwrite = await p.confirm({
      message: "runable.config.ts already exists. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      consola.info("Skipping runable.config.ts generation.");
      return;
    }
  }

  const mod = buildRunableConfig(identifier, config);
  const content = generateCode(mod).code + "\n";

  await writeFile(configPath, content, "utf-8");

  consola.success("Created runable.config.ts");
}

/**
 * Scaffolds a minimal `package.json` for a new Runable module at `targetDir`,
 * prompting to overwrite if one already exists. Used by the module flow
 * instead of `updatePackageJson`, since there's no existing file to merge into.
 */
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
      build: "runable build",
      "app:prepare": "runable prepare",
    },
    devDependencies: {
      "@runablejs/cli": "latest",
      runable: "latest",
      vue: "^3.5.0",
      "vue-router": "^5.2.0",
      typescript: "^6.0.3",
    },
    engines: {
      node: ">=20.0.0",
    },
  };

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  consola.success(`Created package.json for module "${moduleName}"`);
}

/** Installs dependencies with `packageManager` in `cwd`, unless `installDeps` is false. */
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

/**
 * Runs the prompts shared by the "existing project" and "module" flows and
 * returns the collected answers. `_config` is the subset later handed
 * as-is to `writeRunableConfig` — keep its shape in sync with `RunableConfig`.
 */
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

/**
 * Finishes scaffolding a project/module from `handleSharedAnswers`'s
 * result: copies the app template, adds AGENTS.md, generates
 * `runable.config.ts`, writes or updates `package.json`
 * (`createPackageJson` for a module — `moduleName` is then required — or
 * `updatePackageJson` for a regular project), copies the server entry if
 * requested, then installs dependencies.
 */
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
  await copyAgentsFile(cwd);

  await writeRunableConfig(answers._config, {
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
