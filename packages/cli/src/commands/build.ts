import { defineCommand } from "citty";
import { build } from "@syora/core";

export default defineCommand({
  meta: {
    name: "build",
    description: "Build Syora for production deployment",
  },
  args: {},

  async run() {
    await build();
  },
});
