import {
  createServer,
  useConfig,
  requestNode,
  atomicWriteFile,
} from "@syora/core";
import express from "express";
import { join } from "node:path";
import generateTokens from "../app/generaors";

const app = express();

const vite = await createServer();
const config = useConfig();

if (vite) app.use(vite.middlewares);
else {
  //   app.use(express.static(join(config.distDir, "client"), { extensions: [] }));
}

generateTokens({ output: join(config.output, "ui/tokens") });

const options = (config._options as any)?.ui ?? {
  ui: {
    button: {
      variants: {
        variant: {
          gradient: {},
        },
      },
    },
  },
};

atomicWriteFile(
  join(config.output, "ui/config.ts"),
  `export default ${JSON.stringify(options, undefined, 2)}`,
);

app.use("/", async (req, res) => {
  await requestNode({ vite, req, res });
});

app.listen(5173);
