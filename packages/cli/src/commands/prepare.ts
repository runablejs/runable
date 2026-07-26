import { defineCommand } from "citty";
import { prepare } from "@syora/core";

export default defineCommand({
  meta: {
    name: "prepare",
    description: "Prepare Syora for development/build",
  },
  args: {},

  async run() {
    await prepare();
  },
});
