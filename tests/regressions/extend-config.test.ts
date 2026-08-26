import { describe, expect, it } from "vitest";
import {
  cleanupFixtureDir,
  createFixtureDir,
  linkWorkspacePackage,
  writeFixtureFile,
} from "../fixtures.js";

describe("RunableConfig.extendConfig", () => {
  it("keeps mutations and uses a replacement returned by the hook", async () => {
    const directory = createFixtureDir("extend-config-");

    try {
      linkWorkspacePackage(directory, "runable", "packages/runable");
      writeFixtureFile(
        directory,
        "runable.config.ts",
        `import { defineConfig } from "runable";

export default defineConfig({
  extendConfig(config, options) {
    if (Object.keys(options).length !== 0) throw new Error("Expected empty app options");
    config.baseUrl = "/app";
    return { ...config, ssr: false };
  },
});
`,
      );

      const { resolveConfigGraph } = await import("runable");
      const { main } = await resolveConfigGraph(directory);

      expect(main.baseUrl).toBe("/app");
      expect(main.ssr).toBe(false);
    } finally {
      cleanupFixtureDir(directory);
    }
  });

  it("extends every config before module setup runs", async () => {
    const directory = createFixtureDir("extend-module-config-");

    try {
      linkWorkspacePackage(directory, "runable", "packages/runable");
      writeFixtureFile(
        directory,
        "runable.config.ts",
        `import { defineConfig } from "runable";

export default defineConfig({
  modules: ["./module"],
  example: { domain: "consumer.example" },
  extendConfig(config, _options) {
    config.baseUrl = "/extended";
  },
});
`,
      );
      writeFixtureFile(
        directory,
        "module/runable.config.ts",
        `import { defineModule } from "runable";

export default defineModule<{ domain: string }>({
  meta: { name: "example" },
  defaults: { domain: "default.example" },
  extendConfig(config, options) {
    config.siteUrl = "https://" + options.domain;
  },
  setup(_options, config) {
    config._runtime.public.baseUrlSeenBySetup = config.baseUrl;
  },
});
`,
      );

      const { resolveConfigGraph } = await import("runable");
      const graph = await resolveConfigGraph(directory);

      const moduleConfig = graph.all.find(
        (config) => config._name === "example",
      );

      expect(moduleConfig?.siteUrl).toBe("https://consumer.example");
      expect(graph.main.siteUrl).toBeUndefined();
      expect(graph.main._runtime.public.baseUrlSeenBySetup).toBe("/extended");
    } finally {
      cleanupFixtureDir(directory);
    }
  });
});
