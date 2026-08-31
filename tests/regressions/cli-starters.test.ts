import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanupFixtureDir, createFixtureDir } from "../fixtures.js";

describe("CLI starter templates", () => {
  const fixtureDirs: string[] = [];
  const cliVersion = JSON.parse(
    readFileSync(join(process.cwd(), "packages/cli/package.json"), "utf8"),
  ).version;

  afterEach(() => {
    for (const directory of fixtureDirs.splice(0)) cleanupFixtureDir(directory);
  });

  for (const framework of ["express", "fastify", "nestjs", "adonisjs", "hono", "koa"]) {
    it(`copies a complete ${framework} starter`, async () => {
      expect(
        existsSync(
          join(process.cwd(), "packages/cli/starters", framework, ".gitignore"),
        ),
      ).toBe(true);

      const fixture = createFixtureDir(`cli-${framework}-starter-`);
      const target = join(fixture, "application");
      fixtureDirs.push(fixture);

      const { copyStarterTemplate } = await import(
        "../../packages/cli/dist/commands/create/starter.js"
      );
      await copyStarterTemplate(framework, target);

      expect(existsSync(join(target, "package.json"))).toBe(true);
      expect(existsSync(join(target, ".gitignore"))).toBe(true);
      expect(existsSync(join(target, "runable.config.ts"))).toBe(true);
      expect(existsSync(join(target, "app/app.vue"))).toBe(true);
      expect(existsSync(join(target, "app/pages/index.vue"))).toBe(true);

      const indexPage = readFileSync(
        join(target, "app/pages/index.vue"),
        "utf8",
      );
      expect(indexPage).toContain("<RunableWelcome />");

      const pkg = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
      expect(pkg.dependencies).toMatchObject({
        runable: cliVersion,
        vue: expect.any(String),
        "vue-router": expect.any(String),
      });
      expect(pkg.devDependencies["@runablejs/cli"]).toBe(cliVersion);
      expect(pkg.scripts).toMatchObject({
        "app:prepare": "runable prepare",
        "app:build": "runable build",
        preprepare: "runable prepare",
        prebuild: "runable build",
      });

      if (framework === "nestjs") {
        const appModule = readFileSync(
          join(target, "src/app.module.ts"),
          "utf8",
        );
        const main = readFileSync(join(target, "src/main.ts"), "utf8");

        expect(appModule).toContain("RunableModule.register()");
        expect(main).not.toContain("nestjs()");
      }

      if (framework === "adonisjs") {
        expect(pkg.scripts.dev).toBe("node ace serve --watch");
        expect(pkg.scripts.start).toBe(
          "RUNABLE_MODE=production node build/bin/server.js",
        );
        expect(pkg.scripts.lint).toBe("eslint .");
        expect(pkg.scripts.format).toBe("prettier --write .");
        expect(pkg.devDependencies).toHaveProperty("eslint");
        expect(pkg.devDependencies).toHaveProperty("prettier");
        expect(pkg.dependencies).not.toHaveProperty("@adonisjs/shield");
        expect(pkg.dependencies).not.toHaveProperty("@adonisjs/static");
        expect(pkg.dependencies).not.toHaveProperty("@vinejs/vine");
      }
    });
  }
});
