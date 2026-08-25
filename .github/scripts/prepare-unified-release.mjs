import {
  appendFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const repository = process.env.GITHUB_REPOSITORY;
const publishedPackagesJson = process.env.PUBLISHED_PACKAGES;
const notesFile = process.env.RELEASE_NOTES_FILE;
const outputFile = process.env.GITHUB_OUTPUT;

if (!repository || !publishedPackagesJson || !notesFile || !outputFile) {
  throw new Error(
    "GITHUB_REPOSITORY, PUBLISHED_PACKAGES, RELEASE_NOTES_FILE and GITHUB_OUTPUT are required.",
  );
}

const publishedPackages = JSON.parse(publishedPackagesJson);

if (!Array.isArray(publishedPackages) || publishedPackages.length === 0) {
  throw new Error("PUBLISHED_PACKAGES must contain at least one package.");
}

const versions = new Set(publishedPackages.map(({ version }) => version));

if (versions.size !== 1) {
  throw new Error(
    `A unified release requires one shared version; received: ${[...versions].join(", ")}`,
  );
}

const version = [...versions][0];
const tag = `v${version}`;
const packageDirectories = new Map(
  readdirSync("packages", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = join("packages", entry.name);
      const manifest = JSON.parse(
        readFileSync(join(directory, "package.json"), "utf8"),
      );
      return [manifest.name, directory];
    }),
);

function changelogEntry(packageName) {
  const directory = packageDirectories.get(packageName);

  if (!directory) {
    throw new Error(
      `Could not find the workspace directory for ${packageName}.`,
    );
  }

  const changelogPath = join(directory, "CHANGELOG.md");

  if (!existsSync(changelogPath)) {
    return;
  }

  const changelog = readFileSync(changelogPath, "utf8");
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = changelog.match(
    new RegExp(
      `(?:^|\\n)## ${escapedVersion}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
    ),
  );

  if (!match) {
    return;
  }

  const entry = match[1].trim();
  const topLevelChanges = entry.match(/^- .+$/gm) ?? [];

  if (
    topLevelChanges.length === 0 ||
    topLevelChanges.every((change) =>
      change.startsWith("- Updated dependencies"),
    )
  ) {
    return;
  }

  return entry;
}

let previousTag;

try {
  previousTag = execFileSync(
    "git",
    ["tag", "--list", "v*", "--sort=-version:refname"],
    { encoding: "utf8" },
  )
    .split("\n")
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate && candidate !== tag);
} catch {
  // The first unified release has no repository-wide tag to compare against.
}

const prerelease = version.includes("-");
const releaseKind = prerelease ? "prerelease" : "release";
const changedPackages = publishedPackages.flatMap(({ name }) => {
  const changelog = changelogEntry(name);

  return changelog ? [{ name, changelog }] : [];
});

if (changedPackages.length === 0) {
  throw new Error(
    "No user-facing package changes were found for this release.",
  );
}

const packageSections = changedPackages.flatMap(({ name, changelog }) => [
  `### ${name} ${version}`,
  "",
  changelog,
  "",
]);
const contributors = new Map();

for (const { changelog } of changedPackages) {
  for (const match of changelog.matchAll(
    /Thanks \[@([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)!/g,
  )) {
    contributors.set(match[1], match[2]);
  }
}

const contributorSection = contributors.size
  ? [
      "### Contributors",
      "",
      ...[...contributors]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([username, profile]) => `- [@${username}](${profile})`),
      "",
    ]
  : [];

const notes = [
  `${version} is the next Runable ${releaseKind}.`,
  "",
  "### Changelog",
  "",
  previousTag
    ? `[compare changes](https://github.com/${repository}/compare/${previousTag}...${tag})`
    : `[view changes](https://github.com/${repository}/commits/${tag})`,
  "",
  ...packageSections,
  ...contributorSection,
].join("\n");

writeFileSync(notesFile, `${notes.trim()}\n`);
appendFileSync(
  outputFile,
  `tag=${tag}\ntitle=${version}\nprerelease=${prerelease}\n`,
);
