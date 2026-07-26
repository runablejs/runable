import { defineCommand, runMain } from "citty";

const name = "syora";
const version = "0.1.1";
const description = "Syora CLI";

const commands = {
  // create: () => import('./commands/create').then((m) => m.default),
  // dev: () => import('./commands/dev').then((m) => m.default),
  prepare: () => import("./commands/prepare").then((m) => m.default),
  build: () => import("./commands/build").then((m) => m.default),
  // cleanup: () => import('./commands/cleanup').then((m) => m.default),
  // info: () => import('./commands/info').then((m) => m.default),
};

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },

  subCommands: commands,
});

void runMain(main);
