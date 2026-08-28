import { Controller, Get, Module } from "@nestjs/common";
import { RunableModule } from "runable/adapters/nestjs";

@Controller("api")
class AppController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}

@Module({
  imports: [RunableModule.register()],
  controllers: [AppController],
})
export class AppModule {}
