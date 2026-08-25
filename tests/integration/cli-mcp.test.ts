import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  resolveMcpRootDir,
  resolveMcpStarter,
} from "../../packages/cli/src/commands/mcp.js";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

async function projectWithMcp(source: string): Promise<string> {
  const rootDir = await mkdtemp(join(tmpdir(), "runable-cli-mcp-"));
  cleanups.push(() => rm(rootDir, { recursive: true, force: true }));
  const packageDir = join(rootDir, "node_modules", "@runablejs", "mcp");
  await mkdir(packageDir, { recursive: true });
  await writeFile(join(rootDir, "package.json"), '{"type":"module"}');
  await writeFile(
    join(packageDir, "package.json"),
    JSON.stringify({
      name: "@runablejs/mcp",
      type: "module",
      exports: "./index.js",
    }),
  );
  await writeFile(join(packageDir, "index.js"), source);
  return rootDir;
}

describe("runable mcp", () => {
  it("resolves the MCP starter from the target project's node_modules", async () => {
    const rootDir = await projectWithMcp(
      "export async function runRunableMcpServer() {}",
    );

    await expect(resolveMcpStarter(rootDir)).resolves.toBeTypeOf("function");
  });

  it("can resolve a project supplied through a relative path", async () => {
    const rootDir = await projectWithMcp(
      "export async function runRunableMcpServer() {}",
    );
    const relativeRootDir = relative(process.cwd(), rootDir);

    const resolvedRootDir = resolveMcpRootDir(relativeRootDir);

    expect(resolvedRootDir).toBe(rootDir);
    await expect(resolveMcpStarter(resolvedRootDir)).resolves.toBeTypeOf(
      "function",
    );
  });

  it("explains how to install a missing project-local MCP package", async () => {
    const rootDir = await mkdtemp(join(tmpdir(), "runable-cli-no-mcp-"));
    cleanups.push(() => rm(rootDir, { recursive: true, force: true }));

    await expect(resolveMcpStarter(rootDir)).rejects.toThrow(
      "npm install --save-dev @runablejs/mcp",
    );
  });

  it("rejects an older MCP package without the reusable stdio entry point", async () => {
    const rootDir = await projectWithMcp("export const oldApi = true;");

    await expect(resolveMcpStarter(rootDir)).rejects.toThrow(
      "runRunableMcpServer",
    );
  });
});
