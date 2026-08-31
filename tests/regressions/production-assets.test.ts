import { describe, expect, it } from "vitest";

import { readProductionAsset } from "../../packages/runable/dist/vite/request.js";
import {
  cleanupFixtureDir,
  createFixtureDir,
  writeFixtureFile,
} from "../fixtures.js";

describe("production adapter assets", () => {
  it("serves generated assets for every adapter primitive", async () => {
    const distdir = createFixtureDir("production-assets-");

    try {
      writeFixtureFile(distdir, "client/assets/app.js", "export default 1");

      const result = await readProductionAsset({
        distdir,
        url: "/assets/app.js?v=1",
      });

      expect(result).toMatchObject({
        status: 200,
        type: "text/javascript; charset=utf-8",
        headers: { "Content-Length": 16 },
      });
      expect("content" in result!).toBe(true);
      expect((result as { content: Buffer }).content.toString()).toBe(
        "export default 1",
      );
    } finally {
      cleanupFixtureDir(distdir);
    }
  });

  it("serves text assets inline with a text MIME type", async () => {
    const distdir = createFixtureDir("production-text-assets-");

    try {
      writeFixtureFile(distdir, "client/llms.txt", "Runable documentation");

      const result = await readProductionAsset({
        distdir,
        url: "/llms.txt",
      });

      expect(result).toMatchObject({
        status: 200,
        type: "text/plain; charset=utf-8",
      });
    } finally {
      cleanupFixtureDir(distdir);
    }
  });

  it("supports HEAD and leaves routes and unsafe paths to the renderer", async () => {
    const distdir = createFixtureDir("production-assets-head-");

    try {
      writeFixtureFile(distdir, "client/assets/app.css", "body{}");

      const head = await readProductionAsset({
        distdir,
        url: "/assets/app.css",
        method: "HEAD",
      });

      expect(head).toMatchObject({ content: null, status: 200 });
      await expect(
        readProductionAsset({ distdir, url: "/dashboard" }),
      ).resolves.toBeUndefined();
      await expect(
        readProductionAsset({ distdir, url: "/..%2Fsecret.txt" }),
      ).resolves.toBeUndefined();
      await expect(
        readProductionAsset({
          distdir,
          url: "/assets/app.css",
          method: "POST",
        }),
      ).resolves.toBeUndefined();
    } finally {
      cleanupFixtureDir(distdir);
    }
  });
});
