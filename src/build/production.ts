import {
  build as viteBuilder,
  mergeConfig,
  type InlineConfig,
  type Manifest,
} from "vite";

import { loadConfig, useConfig } from "@/config/load.js";
import { join, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { createViteConfig } from "@/vite/config.js";
import { atomicWriteFile } from "@/utils/atomic-write-file.js";
import { getClientEntry, renderClientHtml } from "./html.js";

/**
 * Runs a production build: bundles the client (and the server, when SSR is
 * enabled) with Vite, generates `client/index.html`, and writes a
 * manifests consumed at runtime to serve the generated HTML and locate the
 * SSR renderer entry.
 */
export async function buildProduction() {
  await loadConfig();

  const config = useConfig();
  const viteConfig = createViteConfig();
  const distDir = config.distDir;
  const clientOutDir = join(distDir, "client");
  const clientEntry = resolve(import.meta.dirname, "../vue/client.js");

  // Clone the shared Vite config so the client/server-specific overrides
  // below don't leak into one another.
  const clientConfig: InlineConfig = mergeConfig(viteConfig, {
    mode: "production",
    build: {
      outDir: clientOutDir,
      emptyOutDir: true,
      minify: true,
      // Keep the manifest at a stable, Runable-owned path.
      manifest: "manifest.json",

      rolldownOptions: {
        input: clientEntry,
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
  });

  const serverConfig: InlineConfig = mergeConfig(viteConfig, {
    mode: "production",
    build: {
      outDir: join(distDir, "server"),
      minify: true,
      // Keep this path stable so runtime code does not depend on Vite's
      // internal `.vite/` directory layout.
      manifest: "manifest.json",
      emptyOutDir: true,
      // Building for SSR (rather than a plain library/app build) uses the
      // switcher as its entry, instead of `rolldownOptions.input` above.
      ssr: resolve(import.meta.dirname, "../vue/render.js"),

      rolldownOptions: {
        output: {
          //   entryFileNames: "render.js",
          entryFileNames: "[name]-[hash].js",
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "[name]-[hash].[ext]",
        },
      },
    },
  });

  console.log("🔨 Building client...");
  await viteBuilder(clientConfig);

  const manifestPath = join(clientOutDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  const entry = getClientEntry(
    manifest,
    clientEntry,
    clientConfig.root ?? process.cwd(),
  );

  atomicWriteFile(
    join(clientOutDir, "index.html"),
    renderClientHtml(entry, config.baseUrl, config.ssr),
  );
  console.log("✅ Client built");

  // Server bundle is only built when SSR is enabled — a CSR-only app skips
  // this entirely and `manifest.switcher` stays empty.
  if (config.ssr) {
    console.log("\n\n🔨 Building server...");
    await viteBuilder(serverConfig);

    console.log("✅ Server built");
  }
}
