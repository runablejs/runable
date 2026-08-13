import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { consola } from "consola";

import { handleExistingProject } from "./existing.js";
import { handleModuleProject } from "./module.js";
import { handleStarterProject } from "./starter.js";
import { frameworks } from "./shared.js";

export default defineCommand({
  meta: {
    name: "create",
    description: "Create Syora project",
  },
  args: {},

  async run() {
    p.intro("Syora");

    const projectType = await p.select({
      message: "What do you want to create?",
      options: [
        {
          value: "existing",
          label: "Add to an existing project",
          hint: "You already have a backend (Express, Fastify, NestJS, AdonisJS, Hono, Koa...) and you want to add the Vue layer",
        },
        {
          value: "starter",
          label: "Start with a starter",
          hint: "Express, Fastify, NestJS, AdonisJS, Hono, Koa...",
        },
        {
          value: "module",
          label: "Create a Syora module",
          hint: "A reusable module for the Syora ecosystem",
        },
      ],
    });

    if (p.isCancel(projectType)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    let answer;

    switch (projectType) {
      case "existing": {
        answer = await handleExistingProject();
        break;
      }
      case "starter": {
        answer = await handleStarterProject();
        break;
      }
      case "module": {
        answer = await handleModuleProject();
        break;
      }
    }

    const framework = frameworks.find((f) => f.value === answer.framework);

    if (framework) {
      consola.info(
        `\n Documentation: https://syora.com/docs/integrations/${framework.value}`,
      );
      consola.info(`\n ${framework.label} Documentation: ${framework.docs}`);
    }

    p.outro("You're all set!");
  },
});
