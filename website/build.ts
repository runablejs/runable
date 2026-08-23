import { join } from "node:path";

import { useConfig } from "@/config/index.js";
import { build } from "@/vite/index.js";

import { generateLlmsArtifacts } from "./scripts/llms/generate.js";

await build();

const config = useConfig();
const { llmsTxtPath, markdownPaths } = generateLlmsArtifacts(
  join(config.distdir, "client"),
);

console.log(
  `✅ Generated ${llmsTxtPath} and ${markdownPaths.length} Markdown doc pages`,
);
