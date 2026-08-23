import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

import { REPO_ROOT } from "../helpers.js";

import {
  AGENT_TARGETS,
  DESTINATIONS,
  detectAgents,
  resolveDestinations,
  type AgentTarget,
} from "../../packages/cli/src/commands/skills/agents.js";
import {
  discoverBundledSkills,
  getBundledSkillsDir,
} from "../../packages/cli/src/commands/skills/bundle.js";
import {
  hashDirectory,
  installSkills,
  planInstall,
} from "../../packages/cli/src/commands/skills/install-engine.js";

const CLI_BIN = path.join(REPO_ROOT, "packages/cli/dist/index.js");
const REPO_SKILLS_DIR = path.join(REPO_ROOT, "skills");

let tmpDirs: string[] = [];

function makeTmpDir(prefix = "runable-cli-skills-"): string {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
}

/**
 * Vitest sets NODE_ENV=test, TEST=true, and VITEST=true on its own process,
 * which `spawnSync` would otherwise pass down to the CLI child process.
 * consola treats those as a signal to switch to a quieter output mode
 * (empty stdout for regular log/info/warn calls), which doesn't reflect how
 * `runable skills` actually behaves for a real user in a real shell — strip
 * them so these tests observe the same stdout a real shell would see.
 */
const CLI_ENV = {
  ...process.env,
  NODE_ENV: undefined,
  TEST: undefined,
  VITEST: undefined,
  CI: undefined,
};

function runCli(args: string[], cwd: string) {
  return spawnSync(CLI_BIN, args, { cwd, encoding: "utf8", env: CLI_ENV });
}

afterEach(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
  tmpDirs = [];
});

describe("bundled skill discovery", () => {
  it("finds the bundled skills directory", () => {
    expect(existsSync(getBundledSkillsDir())).toBe(true);
  });

  it("discovers every skill under skills/ without a hardcoded list", () => {
    const bundled = discoverBundledSkills();

    const expectedIds = readdirSync(REPO_SKILLS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(bundled.map((s) => s.id).sort()).toEqual(expectedIds);
  });

  it("reads name/description from each skill's real frontmatter, not a duplicated list", () => {
    const bundled = discoverBundledSkills();
    const pages = bundled.find((s) => s.id === "runable-pages")!;
    const raw = readFileSync(path.join(REPO_SKILLS_DIR, "runable-pages/SKILL.md"), "utf8");

    expect(raw).toContain(`name: ${pages.name}`);
    expect(pages.name).toBe("runable-pages");
    expect(pages.description.length).toBeGreaterThan(0);
  });
});

describe("agent registry", () => {
  it("groups agents that share a destination into one entry", () => {
    const agents = AGENT_TARGETS.filter((a) =>
      ["codex", "cursor", "gemini"].includes(a.id),
    );
    const groups = resolveDestinations(agents);

    expect(groups.length).toBe(1);
    expect(groups[0].destination.path).toBe(".agents/skills");
    expect(groups[0].agents.map((a) => a.id).sort()).toEqual(
      ["codex", "cursor", "gemini"].sort(),
    );
  });

  it("keeps Claude Code on its own native destination, distinct from .agents/skills", () => {
    const claude = AGENT_TARGETS.find((a) => a.id === "claude")!;
    expect(claude.destination.path).toBe(".claude/skills");
    expect(claude.destination.path).not.toBe(".agents/skills");
  });

  it("does not group Cline under .agents/skills", () => {
    const cline = AGENT_TARGETS.find((a) => a.id === "cline")!;
    expect(cline.destination.path).toBe(".cline/skills");
  });

  it("detects an agent only from a real marker, not a bare .github/ directory", () => {
    const dir = makeTmpDir();
    mkdirSync(path.join(dir, ".github"), { recursive: true });
    // No copilot-instructions.md — bare .github/ alone must not imply Copilot.
    const detected = detectAgents(dir);
    expect(detected.some((a: AgentTarget) => a.id === "copilot")).toBe(false);

    writeFileSync(path.join(dir, ".github/copilot-instructions.md"), "# instructions");
    const detectedAfter = detectAgents(dir);
    expect(detectedAfter.some((a: AgentTarget) => a.id === "copilot")).toBe(true);
  });

  it("resolves 'all' to every distinct destination, not one copy per agent", () => {
    expect(DESTINATIONS.length).toBe(3);
    expect(DESTINATIONS.map((d) => d.id).sort()).toEqual(["agents", "claude", "cline"]);
  });
});

describe("install engine", () => {
  it("copies a skill's entire directory recursively, not just SKILL.md", async () => {
    const bundleDir = makeTmpDir();
    const skillDir = path.join(bundleDir, "runable-fixture");
    mkdirSync(path.join(skillDir, "references"), { recursive: true });
    writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: runable-fixture\ndescription: Fixture skill for testing.\n---\n\nBody.",
    );
    writeFileSync(path.join(skillDir, "references/example.md"), "# Reference");

    const destinationRoot = makeTmpDir();
    const skill = {
      id: "runable-fixture",
      dir: skillDir,
      name: "runable-fixture",
      description: "Fixture skill for testing.",
    };

    const results = await installSkills([skill], destinationRoot, { force: false });

    expect(results[0].outcome).toBe("installed");
    expect(existsSync(path.join(destinationRoot, "runable-fixture/SKILL.md"))).toBe(true);
    expect(existsSync(path.join(destinationRoot, "runable-fixture/references/example.md"))).toBe(
      true,
    );
    expect(
      readFileSync(path.join(destinationRoot, "runable-fixture/references/example.md"), "utf8"),
    ).toBe("# Reference");
  });

  it("hashDirectory is stable and detects a real content change", () => {
    const dir = makeTmpDir();
    writeFileSync(path.join(dir, "SKILL.md"), "content");
    const first = hashDirectory(dir);
    const second = hashDirectory(dir);
    expect(first).toBe(second);

    writeFileSync(path.join(dir, "SKILL.md"), "different content");
    expect(hashDirectory(dir)).not.toBe(first);
  });

  it("planInstall reports new/identical/modified correctly", () => {
    const sourceDir = makeTmpDir();
    writeFileSync(path.join(sourceDir, "SKILL.md"), "---\nname: x\ndescription: y\n---\n\nBody");
    const skill = { id: "x", dir: sourceDir, name: "x", description: "y" };

    const destinationRoot = makeTmpDir();
    expect(planInstall([skill], destinationRoot)[0].status).toBe("new");

    mkdirSync(path.join(destinationRoot, "x"), { recursive: true });
    writeFileSync(path.join(destinationRoot, "x/SKILL.md"), readFileSync(path.join(sourceDir, "SKILL.md")));
    expect(planInstall([skill], destinationRoot)[0].status).toBe("identical");

    writeFileSync(path.join(destinationRoot, "x/SKILL.md"), "edited by user");
    expect(planInstall([skill], destinationRoot)[0].status).toBe("modified");
  });
});

describe("runable skills install (real CLI binary)", () => {
  it("--target agents installs under .agents/skills/", () => {
    const cwd = makeTmpDir();
    const result = runCli(["skills", "install", "--target", "agents"], cwd);
    expect(result.status, result.stderr).toBe(0);

    for (const id of discoverBundledSkills().map((s) => s.id)) {
      expect(existsSync(path.join(cwd, ".agents/skills", id, "SKILL.md"))).toBe(true);
    }
    expect(existsSync(path.join(cwd, ".claude/skills"))).toBe(false);
  });

  it("--target claude installs under .claude/skills/", () => {
    const cwd = makeTmpDir();
    const result = runCli(["skills", "install", "--target", "claude"], cwd);
    expect(result.status, result.stderr).toBe(0);

    for (const id of discoverBundledSkills().map((s) => s.id)) {
      expect(existsSync(path.join(cwd, ".claude/skills", id, "SKILL.md"))).toBe(true);
    }
    expect(existsSync(path.join(cwd, ".agents/skills"))).toBe(false);
  });

  it("--target agents,claude creates both destinations", () => {
    const cwd = makeTmpDir();
    const result = runCli(["skills", "install", "--target", "agents,claude"], cwd);
    expect(result.status, result.stderr).toBe(0);

    expect(existsSync(path.join(cwd, ".agents/skills/runable-pages/SKILL.md"))).toBe(true);
    expect(existsSync(path.join(cwd, ".claude/skills/runable-pages/SKILL.md"))).toBe(true);
  });

  it("rejects an unknown target with a clear error", () => {
    const cwd = makeTmpDir();
    const result = runCli(["skills", "install", "--target", "not-a-real-target"], cwd);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Unknown skills target "not-a-real-target"');
  });

  it("does not overwrite an existing identical skill (no-op)", () => {
    const cwd = makeTmpDir();
    runCli(["skills", "install", "--target", "agents"], cwd);
    const before = readFileSync(path.join(cwd, ".agents/skills/runable-pages/SKILL.md"), "utf8");

    const result = runCli(["skills", "install", "--target", "agents"], cwd);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("already up to date");

    const after = readFileSync(path.join(cwd, ".agents/skills/runable-pages/SKILL.md"), "utf8");
    expect(after).toBe(before);
  });

  it("does not silently overwrite a locally modified skill without --force", () => {
    const cwd = makeTmpDir();
    runCli(["skills", "install", "--target", "agents"], cwd);

    const skillPath = path.join(cwd, ".agents/skills/runable-pages/SKILL.md");
    writeFileSync(skillPath, readFileSync(skillPath, "utf8") + "\n\ncustom user edit");

    const result = runCli(["skills", "install", "--target", "agents"], cwd);
    expect(result.status, result.stderr).toBe(0);
    // consola.warn() writes to stderr, not stdout.
    expect(result.stderr).toContain("runable-pages skipped");
    expect(readFileSync(skillPath, "utf8")).toContain("custom user edit");
  });

  it("--force overwrites a locally modified Runable skill", () => {
    const cwd = makeTmpDir();
    runCli(["skills", "install", "--target", "agents"], cwd);

    const skillPath = path.join(cwd, ".agents/skills/runable-pages/SKILL.md");
    writeFileSync(skillPath, readFileSync(skillPath, "utf8") + "\n\ncustom user edit");

    const result = runCli(["skills", "install", "--target", "agents", "--force"], cwd);
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(skillPath, "utf8")).not.toContain("custom user edit");
  });

  it("never touches a foreign (non-Runable) skill in the same destination", () => {
    const cwd = makeTmpDir();
    const foreignDir = path.join(cwd, ".agents/skills/my-company-skill");
    mkdirSync(foreignDir, { recursive: true });
    writeFileSync(path.join(foreignDir, "SKILL.md"), "---\nname: my-company-skill\ndescription: private.\n---\n\nDo not touch.");

    runCli(["skills", "install", "--target", "agents", "--force"], cwd);

    expect(readFileSync(path.join(foreignDir, "SKILL.md"), "utf8")).toContain("Do not touch.");
  });
});

describe("runable skills list (real CLI binary)", () => {
  it("lists every bundled skill with its real name and description", () => {
    const cwd = makeTmpDir();
    const result = runCli(["skills", "list"], cwd);
    expect(result.status, result.stderr).toBe(0);

    for (const skill of discoverBundledSkills()) {
      expect(result.stdout).toContain(skill.name);
    }
  });

  it("--json prints machine-readable output matching the frontmatter", () => {
    const cwd = makeTmpDir();
    const result = runCli(["skills", "list", "--json"], cwd);
    expect(result.status, result.stderr).toBe(0);

    const parsed = JSON.parse(result.stdout);
    const bundled = discoverBundledSkills();
    expect(parsed.length).toBe(bundled.length);
    expect(parsed.map((s: { name: string }) => s.name).sort()).toEqual(
      bundled.map((s) => s.name).sort(),
    );
  });
});
