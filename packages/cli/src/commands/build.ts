import { defineCommand } from "citty";
import { build } from "runable";

export default defineCommand({
  meta: {
    name: "build",
    description: "Build Runable for production deployment",
  },
  args: {},

  async run() {
    await build();
  },
});
