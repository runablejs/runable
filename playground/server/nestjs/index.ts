import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Module } from "@nestjs/common";
import { nestjs } from "runable/adapters/nestjs";

@Module({})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(nestjs());

  await app.listen(5173);
}

bootstrap();
