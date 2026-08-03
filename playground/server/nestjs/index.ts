import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Module } from "@nestjs/common";
import { join } from "node:path";
import { createServer, useConfig, serve } from "@syora/core";
import type { Request, Response } from "express";

@Module({})
class AppModule {}

async function bootstrap() {
  const vite = await createServer();
  const config = useConfig();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (vite) app.use(vite.middlewares);
  else {
    app.useStaticAssets(join(config.distDir, "client"), { extensions: [] });
  }

  app.use("*all", async (req: Request, res: Response) => {
    const html = await serve({ vite, url: req.originalUrl });
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });

  await app.listen(5173);
}

bootstrap();
