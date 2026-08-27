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
      const fixture = createFixtureDir(`cli-${framework}-starter-`);
      const target = join(fixture, "application");
      fixtureDirs.push(fixture);

      const { copyStarterTemplate } = await import(
        "../../packages/cli/dist/commands/create/starter.js"
      );
      await copyStarterTemplate(framework, target);

      expect(existsSync(join(target, "package.json"))).toBe(true);
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
    });
  }
});
