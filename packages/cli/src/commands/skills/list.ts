import { defineCommand } from "citty";
import { consola } from "consola";
import { colors } from "consola/utils";

import {
  discoverBundledSkills,
  SkillsBundleNotFoundError,
  type BundledSkillMeta,
} from "./bundle.js";
import { wrapText } from "../../utils/wrap-text.js";

const indent = "     ";
const terminalWidth = process.stdout.columns || 80;
const descriptionWidth = terminalWidth - indent.length;

export default defineCommand({
  meta: {
    name: "list",
    description:
      "List Runable's official Agent Skills bundled with this CLI version",
  },

  args: {
    json: {
      type: "boolean",
      description: "Print machine-readable JSON instead of formatted text",
    },
  },

  async run({ args }) {
    let skills: BundledSkillMeta[];
    try {
      skills = discoverBundledSkills();
    } catch (error) {
      if (error instanceof SkillsBundleNotFoundError) {
        consola.error(error.message);
        process.exitCode = 1;
        return;
      }
      throw error;
    }

    if (args.json) {
      console.log(
        JSON.stringify(
          skills.map((skill) => ({
            name: skill.name,
            description: skill.description,
          })),
          null,
          2,
        ),
      );
      return;
    }

    consola.log("Runable Skills\n");
    for (const skill of skills) {
      const description = wrapText(skill.description, descriptionWidth)
        .map((line) => `${indent}${line}`)
        .join("\n");

      consola.log(`${colors.green(`● ${skill.name}`)}\n\n${description}\n`);
    }
  },
});
