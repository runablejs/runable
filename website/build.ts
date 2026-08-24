import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { useConfig, build } from "runable";

import { generateLlmsArtifacts } from "./scripts/llms/generate.js";

await build();

const config = useConfig();
await writeFile(
  join(config.distdir, "server", "package.json"),
  `${JSON.stringify({ type: "module" }, null, 2)}\n`,
);
const { llmsTxtPath, llmsFullTxtPath, markdownPaths } = generateLlmsArtifacts(
  join(config.distdir, "client"),
);

console.log(
  `✅ Generated ${llmsTxtPath}, ${llmsFullTxtPath}, and ${markdownPaths.length} Markdown doc pages`,
);
