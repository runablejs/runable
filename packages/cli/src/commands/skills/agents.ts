import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * A physical install location for Skills. Several agents can share one
 * destination (e.g. Codex, Cursor, Copilot, Gemini CLI, and OpenCode all
 * read `.agents/skills/`) — the installer always resolves selected agents
 * down to their unique destinations before copying anything, see
 * `resolveDestinations()`.
 */
export interface SkillDestination {
  id: string;
  /** Project-relative directory Skills are copied into. */
  path: string;
}

/**
 * One AI coding agent Runable Skills can be installed for. `destination`
 * is deliberately separate from the agent's identity — several agents can
 * point at the same destination (see `SkillDestination`).
 */
export interface AgentTarget {
  id: string;
  name: string;
  destination: SkillDestination;
  /**
   * Project-relative marker paths (files or directories) whose presence
   * suggests this agent is already used in the project. Conservative by
   * design: only used to pre-select an option in the interactive prompt,
   * never to silently include/exclude an agent from the offered list.
   */
  detectionPaths?: string[];
  /** Set when support is real but comes with a caveat worth surfacing to the user. */
  note?: string;
}

/**
 * The generic Agent Skills convention — officially read by OpenAI Codex,
 * Cursor, GitHub Copilot, Gemini CLI, and OpenCode (each also documents at
 * least one of its own native paths, but all five recognize this shared
 * one; verified against each tool's own docs, not assumed from the Agent
 * Skills spec itself, which does not mandate a directory).
 */
const AGENTS_DESTINATION: SkillDestination = { id: "agents", path: ".agents/skills" };

/** Claude Code only scans its own native path — `.agents/skills/` is not
 * among the locations it reads. */
const CLAUDE_DESTINATION: SkillDestination = { id: "claude", path: ".claude/skills" };

/** Cline's own docs (docs.cline.bot) describe `.cline/skills/` as its
 * native project-level Skills path and never mention `.agents/skills/` —
 * grouping it under the shared destination would be factually wrong. */
const CLINE_DESTINATION: SkillDestination = { id: "cline", path: ".cline/skills" };

export const DESTINATIONS: SkillDestination[] = [
  AGENTS_DESTINATION,
  CLAUDE_DESTINATION,
  CLINE_DESTINATION,
];

export const AGENT_TARGETS: AgentTarget[] = [
  {
    id: "claude",
    name: "Claude Code",
    destination: CLAUDE_DESTINATION,
    detectionPaths: [".claude"],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    destination: AGENTS_DESTINATION,
    detectionPaths: [".codex"],
  },
  {
    id: "cursor",
    name: "Cursor",
    destination: AGENTS_DESTINATION,
    detectionPaths: [".cursor"],
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    destination: AGENTS_DESTINATION,
    // Bare ".github/" is far too common a directory (CI, issue templates,
    // ...) to imply Copilot usage on its own — the repository custom
    // instructions file is a much more specific, Copilot-only signal.
    detectionPaths: [".github/copilot-instructions.md"],
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    destination: AGENTS_DESTINATION,
    detectionPaths: [".gemini"],
  },
  {
    id: "opencode",
    name: "OpenCode",
    destination: AGENTS_DESTINATION,
    detectionPaths: [".opencode"],
  },
  {
    id: "cline",
    name: "Cline",
    destination: CLINE_DESTINATION,
    detectionPaths: [".cline", ".clinerules"],
    note: "Installs to Cline's own .cline/skills/ — Cline does not read .agents/skills/.",
  },
  {
    id: "other",
    name: "Other Agent Skills-compatible agent",
    destination: AGENTS_DESTINATION,
  },
];

/** Agents whose presence can be reasonably guessed from the project tree.
 * Conservative: a project with none of these markers simply gets no
 * pre-selection, never a wrong one. */
export function detectAgents(rootDir: string): AgentTarget[] {
  return AGENT_TARGETS.filter((agent) =>
    (agent.detectionPaths ?? []).some((marker) => existsSync(join(rootDir, marker))),
  );
}

export function findAgent(id: string): AgentTarget | undefined {
  return AGENT_TARGETS.find((agent) => agent.id === id);
}

export function findDestination(id: string): SkillDestination | undefined {
  return DESTINATIONS.find((destination) => destination.id === id);
}

/** Resolves a set of selected agents down to their unique destinations —
 * several agents sharing `.agents/skills/` still produce exactly one
 * destination, installed once. */
export function resolveDestinations(
  agents: AgentTarget[],
): { destination: SkillDestination; agents: AgentTarget[] }[] {
  const byDestination = new Map<string, { destination: SkillDestination; agents: AgentTarget[] }>();

  for (const agent of agents) {
    const existing = byDestination.get(agent.destination.id);
    if (existing) existing.agents.push(agent);
    else byDestination.set(agent.destination.id, { destination: agent.destination, agents: [agent] });
  }

  return [...byDestination.values()];
}
