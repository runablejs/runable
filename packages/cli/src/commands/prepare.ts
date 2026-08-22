import { defineCommand } from "citty";
import { prepare } from "runable";

export default defineCommand({
  meta: {
    name: "prepare",
    description: "Prepare Runable for development/build",
  },
  args: {},

  async run() {
    await prepare();
  },
});
