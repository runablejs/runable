import { build as viteBuilder } from "vite";
import { loadConfig } from "../config/load";
import { buildViteConfig, getIndexHtml } from ".";
import { join, relative, resolve } from "node:path";
import { atomicWriteFile, normalizeDir } from "../utils";
import merge from "lodash/merge.js";
import cloneDeep from "lodash/cloneDeep.js";

export async function build() {
  await loadConfig();

  const viteConfig = buildViteConfig();
  const outDir = viteConfig.syoraConfig.distDir;

  const clientConfig = merge(cloneDeep(viteConfig), {
    build: {
      outDir: join(outDir, "client"),
      emptyOutDir: true,
      minify: true,

      rolldownOptions: {
        input: resolve(import.meta.dirname, "../entry/client.js"),
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
      outDir: join(outDir, "server"),
      minify: true,
      ssr: true,

      rolldownOptions: {
        input: resolve(import.meta.dirname, "../entry/switcher.js"),
        minify: true,
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

  if ("output" in result) {
    const css: string[] = [];

    const generatedMainFile = result.output.find((f) => {
      return f.name === "client" && f.fileName.endsWith(".js");
    });

    if (!generatedMainFile) {
      throw new Error(
        "Impossible de trouver le fichier entry.js compilé dans les assets.",
      );
    }

    let htmlContent = getIndexHtml(
      normalizeDir(relative(outDir, join(outDir, generatedMainFile.fileName))),
    );

    for (const file of result.output) {
      if (!file.fileName.endsWith(".css")) continue;

      const cssLink = `<link rel="stylesheet" href="${normalizeDir(join(process.cwd(), file.fileName))}">`;
      css.push(cssLink);
    }

    htmlContent = htmlContent.replace(
      "</head>",
      `  ${css.join("\n    ")}\n  </head>`,
    );
    atomicWriteFile(join(outDir, "client/index.html"), htmlContent);
  }

  console.log("✅ Client built");

  if (viteConfig.syoraConfig.ssr) {
    console.log("\n\n🔨 Building server...");
    await viteBuilder(servrConfig);
    console.log("✅ Server built");
  }
}
