import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { defineCommand } from "citty";

type RunRunableMcpServer = (rootDir: string) => Promise<void>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function resolveMcpRootDir(rootDir: string = process.cwd()): string {
  return resolve(rootDir);
}

/**
 * Resolves the MCP package from the target project, not from the CLI's own
 * dependency tree. @runablejs/mcp deliberately remains an opt-in project
 * dependency until its release lifecycle is independent from this monorepo.
 */
export async function resolveMcpStarter(
  rootDir: string,
): Promise<RunRunableMcpServer> {
  const requireFromProject = createRequire(join(rootDir, "package.json"));

  let entry: string;
  try {
    entry = requireFromProject.resolve("@runablejs/mcp");
  } catch (error) {
    throw new Error(
      'No @runablejs/mcp installation found for project "' +
        rootDir +
        '". Install it with: npm install --save-dev @runablejs/mcp',
      { cause: error },
    );
  }

  const module: unknown = await import(pathToFileURL(entry).href);
  const starter = isRecord(module) ? module.runRunableMcpServer : undefined;
  if (typeof starter !== "function") {
    throw new Error(
      'The @runablejs/mcp installation resolved for "' +
        rootDir +
        '" is incompatible: it does not export runRunableMcpServer(). ' +
        "Upgrade @runablejs/mcp.",
    );
  }

  return starter as RunRunableMcpServer;
}

export default defineCommand({
  meta: {
    name: "mcp",
    description: "Start the project-local Runable MCP server over stdio",
  },

  args: {
    cwd: {
      type: "string",
      description: "Runable project directory (default: current directory)",
    },
  },

  async run({ args }) {
    const rootDir = resolveMcpRootDir(args.cwd);
    const start = await resolveMcpStarter(rootDir);

    // From this point stdout belongs exclusively to MCP. This command must not
    // print status messages before or after delegating to the server.
    await start(rootDir);
  },
});
