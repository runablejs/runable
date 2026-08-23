import { resolve } from "node:path";

import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { consola } from "consola";

import {
  AGENT_TARGETS,
  DESTINATIONS,
  detectAgents,
  findAgent,
  findDestination,
  resolveDestinations,
  type SkillDestination,
} from "./agents.js";
import {
  discoverBundledSkills,
  SkillsBundleNotFoundError,
  type BundledSkillMeta,
} from "./bundle.js";
import { installSkills, type SkillInstallResult } from "./install-engine.js";

/** Parses `--target`'s comma-separated destination ids (`agents`, `claude`,
 * `cline`, or `all`) into the unique `SkillDestination`s to install to. */
function parseTargetArg(target: string): SkillDestination[] {
  const tokens = target
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.includes("all")) return DESTINATIONS;

  const resolved: SkillDestination[] = [];
  for (const token of tokens) {
    const destination = findDestination(token);
    if (!destination) {
      throw new Error(
        `Unknown skills target "${token}". Valid targets: ${DESTINATIONS.map((d) => d.id).join(", ")}, all.`,
      );
    }
    if (!resolved.some((d) => d.id === destination.id)) resolved.push(destination);
  }

  return resolved;
}

/** Interactive flow: detect agents, let the user adjust the selection, show
 * the resolved destinations, and confirm before installing. Exits the
 * process on cancellation, matching the rest of the CLI's prompt handling. */
async function selectDestinationsInteractively(cwd: string): Promise<SkillDestination[]> {
  const detected = detectAgents(cwd);

  p.log.step("Detected AI coding agents:");
  if (detected.length > 0) {
    for (const agent of detected) p.log.success(agent.name);
  } else {
    p.log.message("  (none detected)");
  }

  const selected = await p.multiselect({
    message: "Install Runable Skills for:",
    options: AGENT_TARGETS.map((agent) => ({
      value: agent.id,
      label: agent.name,
      hint: agent.note,
    })),
    initialValues: detected.map((agent) => agent.id),
    required: false,
  });

  if (p.isCancel(selected)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  if (selected.length === 0) {
    p.cancel("No agent selected.");
    process.exit(0);
  }

  const agents = selected.map((id) => findAgent(id)!).filter(Boolean);
  const groups = resolveDestinations(agents);

  p.log.step("Runable Skills will be installed to:");
  for (const group of groups) {
    p.log.message(`  ${group.destination.path}`);
    for (const agent of group.agents) p.log.message(`    ${agent.name}`);
  }

  const shouldContinue = await p.confirm({ message: "Continue?", initialValue: true });
  if (p.isCancel(shouldContinue) || !shouldContinue) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return groups.map((group) => group.destination);
}

function reportResults(destination: SkillDestination, results: SkillInstallResult[]) {
  consola.log(`\n${destination.path}`);
  for (const result of results) {
    if (result.outcome === "installed") consola.success(result.skill.id);
    else if (result.outcome === "up-to-date") consola.info(`${result.skill.id} already up to date`);
    else consola.warn(`${result.skill.id} skipped (differs from the bundled version — rerun with --force to overwrite)`);
  }
}

export default defineCommand({
  meta: {
    name: "install",
    description: "Install Runable's official Agent Skills into this project",
  },

  args: {
    target: {
      type: "string",
      description:
        "Comma-separated destinations to install to: agents, claude, cline, or all. Skips the interactive prompt when set.",
    },
    force: {
      type: "boolean",
      description: "Overwrite existing Runable Skills that differ from the bundled version, without asking",
    },
  },

  async run({ args }) {
    const cwd = process.cwd();
    const force = Boolean(args.force);
    const targetArg = args.target as string | undefined;

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

    let destinations: SkillDestination[];
    let interactive = false;

    if (targetArg) {
      destinations = parseTargetArg(targetArg);
    } else if (!process.stdout.isTTY) {
      consola.error(
        "No AI coding agents specified. Pass --target (agents, claude, cline, or all) when running non-interactively.",
      );
      process.exitCode = 1;
      return;
    } else {
      p.intro("Runable Skills");
      interactive = true;
      destinations = await selectDestinationsInteractively(cwd);
    }

    if (interactive) consola.log("\nInstalling Runable Skills...");

    for (const destination of destinations) {
      const destinationRoot = resolve(cwd, destination.path);

      const results = await installSkills(skills, destinationRoot, {
        force,
        onConflict: interactive
          ? async (skill) => {
              p.log.warn(
                `Runable skill "${skill.id}" already exists and differs from the bundled version at ${destination.path}.`,
              );
              const overwrite = await p.confirm({
                message: "Overwrite it?",
                initialValue: false,
              });
              return p.isCancel(overwrite) ? false : overwrite;
            }
          : undefined,
      });

      reportResults(destination, results);
    }

    if (interactive) p.outro("Runable Skills installed.");
    else consola.success("\nRunable Skills installed.");
  },
});
