import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "path";
import { resolvePathSync } from "mlly";

export type ExportEntry = string | { types?: string; default?: string };

export interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  types?: string;
  typings?: string;
  module?: string;
  type?: "commonjs" | "module";
  exports?: Record<string, ExportEntry>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface DependencyInfo {
  name: string;
  version: string;
  path: string | null;
}

interface PackageDependenciesResult {
  packageName: string;
  packagePath: string;
  dependencies: DependencyInfo[];
}

import * as path from "path";
import { createRequire } from "module";

/**
 * Robustly resolves a package root directory, avoiding "exports" subpath restriction issues.
 */
export function resolvePackageDir(
  packageName: string,
  callerPath: string = process.cwd(),
): string {
  const { dir } = getPackageJson(packageName, callerPath);

  return dir;
}

export function getPackageJson(
  moduleName: string | undefined,
  callerPath: string = process.cwd(),
) {
  let currentDir: string;

  if (moduleName) {
    try {
      // resolvePathSync accurately locates the entry point respecting ESM exports maps
      const mainEntryPoint = resolvePathSync(moduleName, { url: callerPath });
      currentDir = dirname(mainEntryPoint);
    } catch (err) {
      throw new Error(
        `Could not resolve entry point for module "${moduleName}": ${(err as Error).message}`,
      );
    }
  } else {
    currentDir = callerPath;
  }

  while (true) {
    try {
      const packageJsonPath = join(currentDir, "package.json");
      const pkg = JSON.parse(
        readFileSync(packageJsonPath, "utf-8"),
      ) as PackageJson;

      // If no moduleName was requested, return the closest matching parent package.json
      // If moduleName is provided, we verify it matches or accept the first encountered since mlly isolated the path
      if (
        !moduleName ||
        pkg.name === moduleName ||
        moduleName.startsWith(pkg.name + "/")
      ) {
        return { dir: currentDir, content: pkg };
      }
    } catch {
      // Continue traversing upwards if package.json is missing or corrupt
    }

    const parentDir = dirname(currentDir);
    // Break the loop if we reach the absolute root directory of the file system
    if (parentDir === currentDir) break;

    currentDir = parentDir;
  }

  throw new Error(
    `Could not locate the root directory or valid package.json for target "${moduleName ?? callerPath}"`,
  );
}

/**
 * Resolves a target dependency and retrieves all its listed dependencies along with their installation paths.
 *
 * @param dependencyName - Name of the target dependency (e.g., "c12")
 * @param callerPath - Path of the caller file/directory to resolve from. Defaults to `process.cwd()`.
 */
export function getDependencyTree(
  dependencyName: string,
  callerPath: string = process.cwd(),
): PackageDependenciesResult {
  try {
    // Resolve the root directory of the target dependency without hitting "exports" package.json errors
    const targetPackageDir = resolvePackageDir(dependencyName, callerPath);
    const targetPackageJsonPath = join(targetPackageDir, "package.json");

    // Read the target dependency's package.json
    const packageJsonContent = JSON.parse(
      readFileSync(targetPackageJsonPath, "utf-8"),
    ) as PackageJson;

    const rawDependencies = {
      ...packageJsonContent.dependencies,
      ...packageJsonContent.peerDependencies,
    };

    const dependencyList: DependencyInfo[] = [];

    // Resolve directories for each sub-dependency
    for (const [name, versionSpec] of Object.entries(rawDependencies)) {
      let resolvedPath: string | null = null;

      try {
        resolvedPath = resolvePackageDir(name, targetPackageJsonPath);
      } catch {
        // Fallback to null if a dependency isn't installed (e.g., optional peerDependency)
        resolvedPath = null;
      }

      dependencyList.push({
        name,
        version: versionSpec as string,
        path: resolvedPath,
      });
    }

    return {
      packageName: dependencyName,
      packagePath: targetPackageDir,
      dependencies: dependencyList,
    };
  } catch (error) {
    throw new Error(
      `Failed to load or parse dependency "${dependencyName}": ${(error as Error).message}`,
    );
  }
}
