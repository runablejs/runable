import { build as viteBuilder } from "vite";
import { loadConfig, useConfig } from "../config";
import { buildViteConfig, getIndexHtml } from ".";
import { join, resolve } from "node:path";
import { atomicWriteFile, normalizeDir } from "../utils";
import merge from "lodash/merge.js";

async function build() {
  await loadConfig();

  const config = useConfig();
  const outDir = config.distDir;

  const entryClient = resolve(import.meta.dirname, "../entry-client.ts");
  const entryServer = resolve(import.meta.dirname, "../entry-server.ts");

  const clientConfig = merge(buildViteConfig(config), {
    build: {
      outDir,
      emptyOutDir: true,
      minify: true,

      rolldownOptions: {
        input: entryClient,
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
  });

  const servrConfig = merge(buildViteConfig(config), {
    build: {
      outDir,
      emptyOutDir: false,
      minify: true,
      ssr: true,

      rolldownOptions: {
        input: entryServer,
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
      return f.name === "entry-client" && f.fileName.endsWith(".js");
    });

    if (!generatedMainFile) {
      throw new Error(
        "Impossible de trouver le fichier entry-fyle.js compilé dans les assets.",
      );
    }

    let htmlContent = getIndexHtml(
      join(outDir, generatedMainFile.fileName),
      outDir,
    );

    for (const file of result.output) {
      if (!file.fileName.endsWith(".css")) continue;

      const cssLink = `<link rel="stylesheet" href="${normalizeDir(file.fileName)}">`;
      css.push(cssLink);
    }

    htmlContent = htmlContent.replace("</head>", `  ${css}\n  </head>`);
    atomicWriteFile(join(outDir, "index.html"), htmlContent);
  }

  console.log("✅ Client built");

  if (config.ssr) {
    console.log();

    console.log("🔨 Building server...");
    await viteBuilder(servrConfig);
    console.log("✅ Server built");
  }
}

build();
