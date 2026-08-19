import { join, relative, resolve } from "node:path";

import cloneDeep from "lodash/cloneDeep.js";
import merge from "lodash/merge.js";
import { Manifest, build as viteBuilder } from "vite";

import { useConfig } from "@/config/index.js";
import { atomicWriteFile, normalizeDir } from "@/utils/index.js";
import { buildViteConfig, getIndexHtml } from "../index.js";

function toPublicAssetPath(fileName: string): string {
  return `/${normalizeDir(fileName).replace(/^\.\//, "")}`;
}

/**
 * Runs a production build: bundles the client (and the server, when SSR is
 * enabled) with Vite, generates `client/index.html`, and writes a
 * `manifest.js` — consumed at runtime to serve the generated HTML and, for
 * SSR, to locate the server switcher entry.
 */
export async function buildProduction() {
  const config = useConfig();
  const viteConfig = buildViteConfig();
  const distdir = config.distdir;
  // `html` is the generated client index.html; `switcher` (SSR-only) is the
  // built path to the server entry, filled in further down.
  const manifest = { switcher: "", html: "" };

  // Clone the shared Vite config so the client/server-specific overrides
  // below don't leak into one another.
  const clientConfig = merge(cloneDeep(viteConfig), {
    build: {
      outDir: join(distdir, "client"),
      emptyOutDir: true,
      minify: true,
      // manifest: true,

      rolldownOptions: {
        input: resolve(import.meta.dirname, "../../entry/client.js"),
        manifest: true,
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
  });

  const servrConfig = merge(cloneDeep(viteConfig), {
    build: {
      outDir: join(distdir, "server"),
      minify: true,
      manifest: true,
      // Building for SSR (rather than a plain library/app build) uses the
      // switcher as its entry, instead of `rolldownOptions.input` above.
      ssr: resolve(import.meta.dirname, "../../entry/switcher.js"),

      rolldownOptions: {
        output: {
          entryFileNames: "[name]-[hash].js",
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "[name]-[hash].[ext]",
        },
      },
    },
  });

  console.log("🔨 Building client...");
  const result = await viteBuilder(clientConfig);

  // `build()` can return an array of `RollupOutput` for multi-build setups;
  // narrow to the single-output case, which is what a single `input` produces.
  if ("output" in result) {
    const css: string[] = [];

    // Locate the compiled client entry so its hashed filename can be
    // referenced from the generated HTML below.
    const generatedMainFile = result.output.find((f) => {
      return f.name === "client" && f.fileName.endsWith(".js");
    });

    if (!generatedMainFile) {
      throw new Error(
        "Impossible de trouver le fichier entry.js compilé dans les assets.",
      );
    }

    let htmlContent = getIndexHtml(
      toPublicAssetPath(generatedMainFile.fileName),
    );

    // Inline a <link> for every emitted CSS asset — Vite doesn't inject
    // these automatically since we're not going through an HTML entry.
    for (const file of result.output) {
      if (!file.fileName.endsWith(".css")) continue;

      const cssLink = `<link rel="stylesheet" href="${toPublicAssetPath(file.fileName)}">`;
      css.push(cssLink);
    }

    htmlContent = htmlContent.replace(
      "</head>",
      `  ${css.join("\n    ")}\n  </head>`,
    );

    atomicWriteFile(join(distdir, "client/index.html"), htmlContent);
    manifest.html = htmlContent;
  }

  console.log("✅ Client built");

  // Server bundle is only built when SSR is enabled — a CSR-only app skips
  // this entirely and `manifest.switcher` stays empty.
  if (viteConfig.syoraConfig.ssr) {
    console.log("\n\n🔨 Building server...");
    await viteBuilder(servrConfig);

    // Vite's own build manifest (entry -> emitted file map), produced
    // because `manifest: true` was set on `servrConfig` above.
    const vManifest = (await import(
      join(distdir, "server", ".vite/manifest.json")
    )) as Manifest;

    // Find the emitted file for the switcher entry so it can be
    // imported at runtime to dispatch requests to the SSR server.
    const switchEntry = Object.values(vManifest).find((o) => {
      return o.isEntry === true && o.name === "switcher";
    });

    if (switchEntry) {
      manifest.switcher = switchEntry.file;
    }

    console.log("✅ Server built");
  }

  // Write the runtime manifest (server switcher path + client HTML) that the
  // production server reads to serve requests without rebuilding.
  atomicWriteFile(
    join(distdir, "manifest.js"),
    `export default ${JSON.stringify(manifest, null, 4)}`,
  );
}
