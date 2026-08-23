import { defineCommand } from "citty";

export default defineCommand({
  meta: {
    name: "skills",
    description: "Manage Runable's official Agent Skills",
  },

  subCommands: {
    install: () => import("./install.js").then((m) => m.default),
    list: () => import("./list.js").then((m) => m.default),
  },
});
