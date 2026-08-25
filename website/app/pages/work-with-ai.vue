<script setup lang="ts">
const signals = [
  {
    label: "Framework method",
    title: "Agent Skills",
    description:
      "Focused instructions teach the agent Runable's APIs, conventions, and safe editing rules.",
    icon: "tabler:sparkles",
    accent: false,
  },
  {
    label: "Project facts",
    title: "Runable MCP",
    description:
      "Read-only tools expose the routes, configuration, extensions, and diagnostics resolved right now.",
    icon: "thesvg:mcp-model-context-protocol",
    accent: true,
  },
];

const skills = [
  ["project", "Understand the project"],
  ["pages", "Build routes and layouts"],
  ["data-fetching", "Load SSR-aware data"],
  ["configuration", "Configure and ship"],
  ["extend", "Use modules and plugins"],
  ["head", "Manage SEO and metadata"],
  ["integrations", "Connect the backend"],
] as const;

const tools = [
  "get_project",
  "get_config",
  "get_routes",
  "get_extensions",
  "resolve_route",
  "diagnose",
  "search_api",
  "refresh",
] as const;

const agents = [
  ["Codex", "simple-icons:openai"],
  ["Claude Code", "simple-icons:claude"],
  ["Cursor", "simple-icons:cursor"],
  ["GitHub Copilot", "simple-icons:githubcopilot"],
  ["Gemini CLI", "simple-icons:googlegemini"],
  ["Cline", "tabler:terminal-2"],
] as const;

useHead({
  title: "Work with AI",
  meta: [
    {
      name: "description",
      content:
        "Give AI coding agents Runable's framework knowledge and a live, read-only view of your project.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Work with AI · Runable",
  ogDescription:
    "Give AI coding agents Runable's framework knowledge and a live, read-only view of your project.",
});
</script>

<template>
  <main class="overflow-hidden">
    <section class="relative border-b border-border">
      <div
        aria-hidden="true"
        class="absolute inset-0 opacity-[0.045] dark:opacity-[0.08]"
        style="
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: linear-gradient(to bottom, black, transparent 88%);
        "
      />

      <div
        class="relative mx-auto grid min-h-[calc(100svh-var(--header-height))] max-w-7xl lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div
          class="flex flex-col justify-between px-6 py-14 sm:px-10 lg:border-r lg:border-border lg:px-12 lg:py-16"
        >
          <div
            class="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>Runable × AI</span>
            <span>Context / 01</span>
          </div>

          <div class="my-20 lg:my-12">
            <p
              class="mb-6 w-max bg-accent px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground"
            >
              Framework-aware by design
            </p>
            <h1
              class="max-w-4xl font-display text-5xl font-bold leading-[1.01] tracking-[-0.045em] sm:text-6xl xl:text-7xl"
            >
              AI should learn your framework
              <em class="font-display italic text-accent"
                >before it edits your project.</em
              >
            </h1>
            <p
              class="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              Runable gives coding agents two things generic model knowledge
              cannot: precise framework instructions and the resolved state of
              the application in front of them.
            </p>

            <div class="mt-10 flex flex-col gap-3 sm:flex-row">
              <UButton size="lg" as-child>
                <RunableLink to="/docs/guide/cli/skills">
                  Install Agent Skills
                  <UIcon name="tabler:arrow-right" class="size-4" />
                </RunableLink>
              </UButton>
              <UButton variant="outline" size="lg" as-child>
                <RunableLink to="/docs/mcp">Connect the MCP</RunableLink>
              </UButton>
            </div>
          </div>

          <div
            class="grid grid-cols-3 border-l border-t border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <span class="border-b border-r border-border p-3">Open format</span>
            <span class="border-b border-r border-border p-3">Read only</span>
            <span class="border-b border-r border-border p-3">Project local</span>
          </div>
        </div>

        <div
          class="relative flex items-center bg-background/80 px-6 py-16 sm:px-10 lg:px-12"
        >
          <div class="mx-auto w-full max-w-lg">
            <div class="border border-border bg-background shadow-2xl">
              <div
                class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4"
              >
                <div class="flex gap-1.5" aria-hidden="true">
                  <span class="size-2 bg-muted-foreground/25" />
                  <span class="size-2 bg-muted-foreground/25" />
                  <span class="size-2 bg-accent" />
                </div>
                <span
                  class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >agent / runable</span
                >
              </div>

              <div class="p-5 sm:p-7">
                <div class="border-l-2 border-accent pl-4">
                  <p
                    class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    Request
                  </p>
                  <p class="mt-2 text-sm leading-relaxed sm:text-base">
                    Add a protected account page and load the current user
                    during SSR.
                  </p>
                </div>

                <div class="my-7 h-px bg-border" />

                <div class="space-y-5 font-mono text-xs">
                  <div class="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                    <span class="flex size-6 items-center justify-center bg-accent/10 text-accent">
                      <UIcon name="tabler:sparkles" class="size-4" />
                    </span>
                    <span>load runable-pages</span>
                    <span class="text-accent">ready</span>
                  </div>
                  <div class="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                    <span class="flex size-6 items-center justify-center bg-accent/10 text-accent">
                      <UIcon name="thesvg:mcp-model-context-protocol" class="size-4" />
                    </span>
                    <span>get_routes</span>
                    <span class="text-muted-foreground">12 routes</span>
                  </div>
                  <div class="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                    <span class="flex size-6 items-center justify-center bg-accent/10 text-accent">
                      <UIcon name="thesvg:mcp-model-context-protocol" class="size-4" />
                    </span>
                    <span>get_extensions</span>
                    <span class="text-muted-foreground">auth found</span>
                  </div>
                  <div class="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                    <span class="flex size-6 items-center justify-center bg-accent/10 text-accent">
                      <UIcon name="tabler:file-plus" class="size-4" />
                    </span>
                    <span>app/pages/account.vue</span>
                    <span class="text-accent">create</span>
                  </div>
                </div>

                <div
                  class="mt-7 flex items-center gap-3 border border-accent/40 bg-accent/5 p-4 text-sm"
                >
                  <UIcon name="tabler:shield-check" class="size-5 shrink-0 text-accent" />
                  <span>Uses existing auth middleware. Generated files stay untouched.</span>
                </div>
              </div>
            </div>

            <div
              class="ml-6 flex items-center justify-between border-x border-b border-border bg-muted/40 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              <span>Method + facts</span>
              <span class="text-accent">Context complete</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-24 sm:px-10 lg:py-32">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-24">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              The missing context
            </p>
            <p class="mt-4 font-mono text-xs text-muted-foreground">01 / 04</p>
          </div>
          <div>
            <h2
              class="max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
            >
              A model may know Vue. It does not automatically know
              <em class="font-display italic text-accent">your Runable app.</em>
            </h2>
            <p
              class="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground"
            >
              Without explicit context, an agent can invent framework APIs,
              edit generated output, overlook existing middleware, or assume
              Runable owns the backend. More model intelligence does not fix
              missing project information.
            </p>

            <div class="mt-12 grid border-l border-t border-border md:grid-cols-3">
              <div class="border-b border-r border-border p-6">
                <p class="font-mono text-xs text-accent">01</p>
                <p class="mt-6 font-semibold">No framework guessing</p>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Use APIs and conventions that actually exist.
                </p>
              </div>
              <div class="border-b border-r border-border p-6">
                <p class="font-mono text-xs text-accent">02</p>
                <p class="mt-6 font-semibold">No blind file scanning</p>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Read Runable's resolved view of the application.
                </p>
              </div>
              <div class="border-b border-r border-border p-6">
                <p class="font-mono text-xs text-accent">03</p>
                <p class="mt-6 font-semibold">No stale assumptions</p>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Refresh the project state after a change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border bg-muted/20 px-6 py-24 sm:px-10 lg:py-32">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Two sources of context
            </p>
            <p class="mt-4 font-mono text-xs text-muted-foreground">02 / 04</p>
          </div>
          <h2 class="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Instructions tell the agent how.<br />Inspection tells it what is true.
          </h2>
        </div>

        <div class="mt-14 grid border-l border-t border-border lg:grid-cols-2">
          <article
            v-for="signal in signals"
            :key="signal.title"
            class="relative flex min-h-96 flex-col justify-between border-b border-r p-7 sm:p-10"
            :class="
              signal.accent
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border bg-background'
            "
          >
            <div class="flex items-start justify-between gap-6">
              <span
                class="flex size-12 items-center justify-center border"
                :class="
                  signal.accent
                    ? 'border-accent-foreground/30'
                    : 'border-border text-accent'
                "
              >
                <UIcon :name="signal.icon" class="size-6" />
              </span>
              <span
                class="font-mono text-[10px] uppercase tracking-[0.2em]"
                :class="signal.accent ? 'opacity-65' : 'text-muted-foreground'"
              >
                {{ signal.label }}
              </span>
            </div>

            <div class="mt-24 max-w-lg">
              <h3 class="font-display text-3xl font-semibold sm:text-4xl">
                {{ signal.title }}
              </h3>
              <p
                class="mt-5 text-lg leading-relaxed"
                :class="signal.accent ? 'opacity-75' : 'text-muted-foreground'"
              >
                {{ signal.description }}
              </p>
            </div>
          </article>
        </div>

        <div
          class="grid border-x border-b border-border bg-background md:grid-cols-[1fr_auto_1fr]"
        >
          <p class="p-5 text-center font-mono text-xs text-muted-foreground">
            “How should I build this?”
          </p>
          <div class="hidden w-px bg-border md:block" />
          <p class="p-5 text-center font-mono text-xs text-muted-foreground">
            “How is this project built?”
          </p>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-24 sm:px-10 lg:py-32">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-14 lg:grid-cols-[0.62fr_1.38fr] lg:gap-24">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Built-in coverage
            </p>
            <p class="mt-4 font-mono text-xs text-muted-foreground">03 / 04</p>
          </div>

          <div>
            <div class="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <div class="flex items-center justify-between border-b border-border pb-4">
                  <h2 class="font-display text-2xl font-bold">Seven Skills</h2>
                  <span class="font-mono text-xs text-accent">METHOD</span>
                </div>
                <div class="divide-y divide-border">
                  <div
                    v-for="(skill, index) in skills"
                    :key="skill[0]"
                    class="grid grid-cols-[2rem_1fr] gap-3 py-4"
                  >
                    <span class="font-mono text-[10px] text-muted-foreground">0{{ index + 1 }}</span>
                    <div>
                      <code class="font-mono text-xs text-accent">runable-{{ skill[0] }}</code>
                      <p class="mt-1 text-sm text-muted-foreground">{{ skill[1] }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between border-b border-border pb-4">
                  <h2 class="font-display text-2xl font-bold">Eight MCP tools</h2>
                  <span class="font-mono text-xs text-accent">FACTS</span>
                </div>
                <div class="grid grid-cols-2 border-l border-t border-border mt-4">
                  <div
                    v-for="tool in tools"
                    :key="tool"
                    class="flex min-h-20 items-center border-b border-r border-border p-4"
                  >
                    <code class="break-all font-mono text-xs">{{ tool }}</code>
                  </div>
                </div>
                <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>stdio only</span>
                  <span>read only</span>
                  <span>private values withheld</span>
                </div>
              </div>
            </div>

            <div class="mt-12 flex flex-col gap-3 sm:flex-row">
              <UButton variant="outline" as-child>
                <RunableLink to="/docs/guide/cli/skills">Explore Agent Skills</RunableLink>
              </UButton>
              <UButton variant="outline" as-child>
                <RunableLink to="/docs/mcp/tools">Explore MCP tools</RunableLink>
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border bg-foreground text-background">
      <div class="mx-auto grid max-w-7xl lg:grid-cols-[0.82fr_1.18fr]">
        <div class="border-background/15 px-6 py-20 sm:px-10 lg:border-r lg:px-12 lg:py-24">
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Setup / 04
          </p>
          <h2 class="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Add context to the project, not to every prompt.
          </h2>
          <p class="mt-6 max-w-xl text-lg leading-relaxed opacity-65">
            Skills are committed with the codebase. The MCP server runs locally
            and inspects the Runable installation already used by the project.
          </p>
        </div>

        <div class="grid border-background/15 sm:grid-cols-2 lg:border-l-0">
          <div class="border-b border-background/15 p-7 sm:border-r lg:p-10">
            <div class="flex items-center justify-between gap-5">
              <span class="font-mono text-[10px] uppercase tracking-widest opacity-50">01 / Skills</span>
              <UIcon name="tabler:sparkles" class="size-5 text-accent" />
            </div>
            <code class="mt-12 block whitespace-nowrap font-mono text-sm"><span class="text-accent">$</span> runable skills install</code>
            <p class="mt-5 text-sm leading-relaxed opacity-55">
              Select the coding agents used by your team, then commit the generated Skill directories.
            </p>
          </div>
          <div class="border-b border-background/15 p-7 lg:p-10">
            <div class="flex items-center justify-between gap-5">
              <span class="font-mono text-[10px] uppercase tracking-widest opacity-50">02 / MCP</span>
              <UIcon name="thesvg:mcp-model-context-protocol" class="size-5 text-accent" />
            </div>
            <code class="mt-12 block whitespace-nowrap font-mono text-sm"><span class="text-accent">$</span> pnpm add -D @runablejs/mcp</code>
            <p class="mt-5 text-sm leading-relaxed opacity-55">
              Connect your MCP client to the project-local <code class="text-background">runable mcp</code> command.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Your agent, your choice
            </p>
            <h2 class="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Use the coding tools already in your workflow.
            </h2>
          </div>
          <div class="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3">
            <div
              v-for="agent in agents"
              :key="agent[0]"
              class="flex min-h-24 flex-col justify-between border-b border-r border-border p-4"
            >
              <UIcon :name="agent[1]" class="size-5 text-accent" />
              <span class="mt-5 text-sm font-medium">{{ agent[0] }}</span>
            </div>
          </div>
        </div>

        <div class="mt-16 grid border border-border lg:grid-cols-[1fr_auto]">
          <div class="p-8 sm:p-12">
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Start with reliable context
            </p>
            <h2 class="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Let the agent move fast without asking it to guess.
            </h2>
          </div>
          <div class="flex flex-col justify-center gap-3 border-t border-border bg-muted/25 p-8 lg:min-w-72 lg:border-l lg:border-t-0">
            <UButton size="lg" as-child>
              <RunableLink to="/docs/guide/cli/skills">Install the Skills</RunableLink>
            </UButton>
            <UButton variant="outline" size="lg" as-child>
              <RunableLink to="/docs/mcp">Set up the MCP</RunableLink>
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
