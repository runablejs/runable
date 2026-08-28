import { describe, expect, it } from "vitest";

describe("NestJS adapter", () => {
  it("provides adapter options to the Runable controller", async () => {
    const { RUNABLE_ADAPTER_OPTIONS, RunableController, RunableModule } = await import(
      "runable/adapters/nestjs"
    );
    const options = { runableApp: null };
    const definition = RunableModule.register(options);

    expect(definition.module).toBe(RunableModule);
    expect(definition.controllers).toEqual([RunableController]);
    expect(definition.providers).toContainEqual({
      provide: RUNABLE_ADAPTER_OPTIONS,
      useValue: options,
    });
  });
});
