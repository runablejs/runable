import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cleanupFixtureDir, createFixtureDir } from "../fixtures.js";
import { REPO_ROOT } from "../helpers.js";

describe("runable create --module", () => {
  const source = readFileSync(
    path.join(REPO_ROOT, "packages/cli/src/commands/create/index.ts"),
    "utf8",
  );

  it("routes --module directly to the module scaffolder", () => {
    expect(source).toMatch(/module:\s*\{\s*type:\s*"boolean"/);
    expect(source).toMatch(/const projectType = args\.module\s*\?\s*"module"/);
    expect(source).toMatch(/case "module":\s*\{\s*answer = await handleModuleProject\(\)/);
  });

  it("only offers application creation flows in the interactive selector", () => {
    const selector = source.slice(
      source.indexOf(": await p.select"),
      source.indexOf("if (p.isCancel"),
    );

    expect(selector).toContain('value: "existing"');
    expect(selector).toContain('value: "starter"');
    expect(selector).not.toContain('value: "module"');
  });

  it("creates a Runable playground that loads the module root", async () => {
    const directory = createFixtureDir("cli-module-playground-");

    try {
      const { createModulePlayground } = await import(
        "../../packages/cli/dist/commands/create/module.js"
      );
      const { configurePnpmBuilds, createPackageJson } = await import(
        "../../packages/cli/dist/commands/create/shared.js"
      );
      await createModulePlayground(directory, {
        moduleName: "test-module",
        framework: "other",
        createServerEntry: false,
      });
      await createPackageJson(directory, "test-module");
      await configurePnpmBuilds("pnpm", directory);

      expect(existsSync(path.join(directory, "playground/app/app.vue"))).toBe(
        true,
      );
      expect(
        existsSync(path.join(directory, "playground/app/pages/index.vue")),
      ).toBe(true);
      expect(
        existsSync(path.join(directory, "playground/tsconfig.json")),
      ).toBe(true);
      expect(
        existsSync(path.join(directory, "playground/tsconfig.node.json")),
      ).toBe(true);
      expect(
        readFileSync(
          path.join(directory, "playground/runable.config.ts"),
          "utf8",
        ),
      ).toContain('modules: [".."]');

      const packageJson = JSON.parse(
        readFileSync(path.join(directory, "package.json"), "utf8"),
      );
      expect(packageJson.workspaces).toEqual(["playground"]);
      expect(packageJson.scripts).toMatchObject({
        "playground:prepare": "cd playground && runable prepare",
        "playground:build": "cd playground && runable build",
      });

      const playgroundPackageJson = JSON.parse(
        readFileSync(path.join(directory, "playground/package.json"), "utf8"),
      );
      expect(playgroundPackageJson).toMatchObject({
        name: "test-module-playground",
        private: true,
        dependencies: {
          "test-module": "*",
          runable: expect.any(String),
          vue: expect.any(String),
          "vue-router": expect.any(String),
        },
        devDependencies: {
          "@runablejs/cli": expect.any(String),
          typescript: expect.any(String),
        },
      });
      expect(
        readFileSync(path.join(directory, "pnpm-workspace.yaml"), "utf8"),
      ).toContain("- playground");
    } finally {
      cleanupFixtureDir(directory);
    }
  });
});
