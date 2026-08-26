import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { consola } from "consola";

import { handleExistingProject } from "./existing.js";
import { handleModuleProject } from "./module.js";
import { frameworks } from "./shared.js";
import { handleStarterProject } from "./starter.js";

export default defineCommand({
  meta: {
    name: "create",
    description: "Create Runable project",
  },
  args: {
    module: {
      type: "boolean",
      description: "Create a reusable Runable module",
    },
  },

  async run({ args }) {
    p.intro("Runable");

    const projectType = args.module
      ? "module"
      : await p.select({
          message: "How do you want to create your project?",
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
          ],
        });

    if (p.isCancel(projectType)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    // Each handler prompts through its own flow and resolves with at least
    // a `framework` key, used below to link the relevant docs.
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

    // Not every flow ends up with a framework (e.g. a Runable module has none)
    // — only print the framework-specific docs link when one was chosen.
    if (framework) {
      consola.info(
        `\n Documentation: https://runable.com/docs/integrations/${framework.value}`,
      );
      consola.info(`\n ${framework.label} Documentation: ${framework.docs}`);
    }

    p.outro("You're all set!");
  },
});
