import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { nestjs } from "runable/adapters/nestjs";
import { AppModule } from "./app.module.js";

const app = await NestFactory.create(AppModule);
await app.init();
app.use("/api/health", (_request, response) => response.json({ status: "ok" }));
app.use(nestjs());
await app.listen(3000);

