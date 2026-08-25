<script setup lang="ts">
const skills = [
  [
    "runable-project",
    "Project",
    "Project structure and safe modification rules.",
    "tabler:folders",
  ],
  [
    "runable-pages",
    "Pages",
    "Routes, layouts, middleware, and navigation.",
    "tabler:route",
  ],
  [
    "runable-data-fetching",
    "Data fetching",
    "SSR-aware data loading, cache, and errors.",
    "tabler:database",
  ],
  [
    "runable-configuration",
    "Configuration",
    "Environment, assets, styles, and builds.",
    "tabler:settings",
  ],
  [
    "runable-extend",
    "Extend",
    "Modules, plugins, and auto-imports.",
    "tabler:blocks",
  ],
  [
    "runable-head",
    "Head",
    "Metadata, SEO, and structured data.",
    "tabler:world-www",
  ],
  [
    "runable-integrations",
    "Integrations",
    "Backend adapters and server integration.",
    "tabler:plug-connected",
  ],
] as const;

const workflow = [
  [
    "01",
    "Install once",
    "Run the CLI in your project and select the coding agents your team uses.",
  ],
  [
    "02",
    "Ask naturally",
    "Describe the change. Your agent loads only the Runable Skill relevant to the task.",
  ],
  [
    "03",
    "Review real code",
    "The agent follows version-matched instructions, your project structure, and Runable's actual APIs.",
  ],
] as const;

const mcpTools = [
  [
    "get_project",
    "Project identity, Runable version, SSR mode, and resolved paths.",
    "tabler:folder-code",
  ],
  [
    "get_config",
    "Resolved configuration without exposing private runtime values.",
    "tabler:settings-code",
  ],
  [
    "get_routes",
    "The complete route tree exactly as Runable resolves it.",
    "tabler:route",
  ],
  [
    "get_extensions",
    "Layouts, middleware, plugins, modules, and auto-imports.",
    "tabler:blocks",
  ],
  [
    "resolve_route",
    "The route, params, query, and metadata matched by any URL.",
    "tabler:route-alt-left",
  ],
  [
    "diagnose",
    "Concrete issues such as broken references and duplicates.",
    "tabler:stethoscope",
  ],
  [
    "search_api",
    "Local, offline search across the official Runable documentation.",
    "tabler:book-2",
  ],
  [
    "refresh",
    "Fresh inspection data after project files change.",
    "tabler:refresh",
  ],
] as const;

const agents = [
  ["OpenAI Codex", "simple-icons:openai"],
  ["Claude Code", "simple-icons:claude"],
  ["Cursor", "simple-icons:cursor"],
  ["GitHub Copilot", "simple-icons:githubcopilot"],
  ["Gemini CLI", "simple-icons:googlegemini"],
  ["Cline", "tabler:terminal-2"],
  ["OpenCode", "tabler:code"],
  ["Agent Skills compatible", "tabler:sparkles"],
] as const;

useHead({
  title: "Work with AI",
  meta: [
    {
      name: "description",
      content:
        "Give your AI coding agent version-matched instructions for building safely with Runable.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Work with AI · Runable",
  ogDescription:
    "Give your AI coding agent version-matched instructions for building safely with Runable.",
});
</script>

<template>
  <div class="overflow-hidden">
    <section class="border-b border-border">
      <div
        class="mx-auto grid max-w-7xl lg:min-h-180 lg:grid-cols-[1.08fr_0.92fr]"
      >
        <div
          class="flex flex-col justify-between px-6 py-16 sm:px-10 lg:border-r lg:border-border lg:px-14 lg:py-20"
        >
          <div
            class="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>Runable × AI</span><span>Agent Skills / 01</span>
          </div>

          <div class="my-20 lg:my-12">
            <p
              class="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent"
            >
              Less guessing. Better code.
            </p>
            <h1
              class="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl"
            >
              Give your coding agent the
              <span class="text-accent">right context.</span>
            </h1>
            <p
              class="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Agent Skills teach your tools how Runable works. The Runable MCP
              gives them a live, read-only view of the project they are
              changing.
            </p>
            <div class="mt-10 flex flex-wrap gap-3">
              <UButton size="lg" as-child>
                <RunableLink to="/docs/guide/cli/skills"
                  >Install Agent Skills
                  <UIcon name="tabler:arrow-right" class="size-4"
                /></RunableLink>
              </UButton>
              <UButton variant="outline" size="lg" as-child>
                <RunableLink to="/docs/getting-started/quickstart"
                  >Start with Runable</RunableLink
                >
              </UButton>
            </div>
          </div>

          <div
            class="flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6 font-mono text-xs text-muted-foreground"
          >
            <span>Agent Skills</span><span>Project-aware MCP</span
            ><span>Read-only inspection</span>
          </div>
        </div>

        <div class="relative flex items-center bg-muted/30 px-6 py-16 sm:px-12">
          <div
            aria-hidden="true"
            class="absolute inset-y-0 left-1/2 border-l border-dashed border-border"
          />
          <div
            aria-hidden="true"
            class="absolute inset-x-0 top-1/2 border-t border-dashed border-border"
          />
          <div
            class="relative mx-auto w-full max-w-lg border border-border bg-background shadow-xl"
          >
            <div
              class="flex items-center gap-2 border-b border-border px-4 py-3"
            >
              <span class="size-2 bg-muted-foreground/35" /><span
                class="size-2 bg-muted-foreground/35"
              /><span class="size-2 bg-accent" />
              <span
                class="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >Agent session</span
              >
            </div>
            <div class="space-y-6 p-5 sm:p-7">
              <div
                class="ml-auto max-w-[88%] border border-border bg-muted/60 p-4"
              >
                <p
                  class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  You
                </p>
                <p class="mt-2 text-sm leading-relaxed">
                  Add a protected dashboard page and load the current user on
                  the server.
                </p>
              </div>
              <div class="max-w-[92%] border border-accent/60 bg-accent/5 p-4">
                <div class="flex items-center gap-2 text-accent">
                  <UIcon name="tabler:sparkles" class="size-4" />
                  <p class="font-mono text-[10px] uppercase tracking-widest">
                    Loading Runable context
                  </p>
                </div>
                <div class="mt-4 space-y-2 font-mono text-xs">
                  <p class="flex items-center gap-2">
                    <UIcon
                      name="tabler:check"
                      class="size-4 text-accent"
                    />runable-pages
                  </p>
                  <p class="flex items-center gap-2">
                    <UIcon
                      name="tabler:check"
                      class="size-4 text-accent"
                    />runable-data-fetching
                  </p>
                </div>
              </div>
              <div
                class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-t border-border pt-5 text-xs"
              >
                <span class="font-mono text-muted-foreground">CREATE</span
                ><span>app/pages/dashboard.vue</span>
                <span class="font-mono text-muted-foreground">USE</span
                ><span>definePageMeta · useAsyncData</span>
                <span class="font-mono text-muted-foreground">KEEP</span
                ><span>.app generated output untouched</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      class="border-b border-border bg-muted/20 px-6 py-20 sm:px-10 lg:py-28"
    >
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Live project context
            </p>
            <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Your project can speak for itself.
            </h2>
          </div>
          <div class="flex items-end">
            <p class="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              The official Runable MCP gives your coding agent a structured,
              read-only view of the application. It reads through
              <code class="font-mono text-sm text-foreground"
                >runable/inspector</code
              >, resolved from the project itself, so every answer reflects the
              Runable version you actually use.
            </p>
          </div>
        </div>

        <div
          class="relative mt-16 border border-border bg-background p-5 sm:p-8 lg:p-10"
        >
          <div
            aria-hidden="true"
            class="absolute -right-px -top-px size-3 border border-accent bg-background"
          />
          <div
            class="grid items-stretch lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]"
          >
            <div
              class="flex min-h-36 flex-col justify-between border border-border p-5"
            >
              <UIcon name="tabler:sparkles" class="size-6 text-accent" />
              <div>
                <p
                  class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  Client
                </p>
                <p class="mt-2 font-semibold">AI coding agent</p>
              </div>
            </div>
            <div
              class="flex h-12 items-center justify-center lg:h-auto lg:w-12"
            >
              <UIcon
                name="tabler:arrow-right"
                class="hidden size-5 text-muted-foreground lg:block"
              />
              <UIcon
                name="tabler:arrow-down"
                class="size-5 text-muted-foreground lg:hidden"
              />
            </div>
            <div
              class="flex min-h-36 flex-col justify-between border border-accent bg-accent p-5 text-accent-foreground"
            >
              <UIcon name="thesvg:mcp-model-context-protocol" class="size-6" />
              <div>
                <p
                  class="font-mono text-[10px] uppercase tracking-widest opacity-65"
                >
                  Protocol layer
                </p>
                <p class="mt-2 font-semibold">Runable MCP</p>
              </div>
            </div>
            <div
              class="flex h-12 items-center justify-center lg:h-auto lg:w-12"
            >
              <UIcon
                name="tabler:arrow-right"
                class="hidden size-5 text-muted-foreground lg:block"
              />
              <UIcon
                name="tabler:arrow-down"
                class="size-5 text-muted-foreground lg:hidden"
              />
            </div>
            <div
              class="flex min-h-36 flex-col justify-between border border-border p-5"
            >
              <UIcon name="tabler:scan" class="size-6 text-accent" />
              <div>
                <p
                  class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  Source of truth
                </p>
                <p class="mt-2 font-semibold">Runable Inspector</p>
              </div>
            </div>
            <div
              class="flex h-12 items-center justify-center lg:h-auto lg:w-12"
            >
              <UIcon
                name="tabler:arrow-right"
                class="hidden size-5 text-muted-foreground lg:block"
              />
              <UIcon
                name="tabler:arrow-down"
                class="size-5 text-muted-foreground lg:hidden"
              />
            </div>
            <div
              class="flex min-h-36 flex-col justify-between border border-border p-5"
            >
              <UIcon name="tabler:folder-code" class="size-6 text-accent" />
              <div>
                <p
                  class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  Reality
                </p>
                <p class="mt-2 font-semibold">Your project</p>
              </div>
            </div>
          </div>

          <div class="mt-8 grid border-l border-t border-border sm:grid-cols-3">
            <div
              class="flex items-center gap-3 border-b border-r border-border p-4"
            >
              <UIcon name="tabler:lock" class="size-5 text-accent" /><span
                class="font-mono text-xs"
                >Read-only tools</span
              >
            </div>
            <div
              class="flex items-center gap-3 border-b border-r border-border p-4"
            >
              <UIcon name="tabler:terminal-2" class="size-5 text-accent" /><span
                class="font-mono text-xs"
                >Local stdio transport</span
              >
            </div>
            <div
              class="flex items-center gap-3 border-b border-r border-border p-4"
            >
              <UIcon name="tabler:key-off" class="size-5 text-accent" /><span
                class="font-mono text-xs"
                >Private values withheld</span
              >
            </div>
          </div>
        </div>

        <div class="mt-16 grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div class="flex flex-col justify-between">
            <div>
              <p
                class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
              >
                Eight focused tools
              </p>
              <h3 class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Ask about structure. Resolve a URL. Diagnose the project.
              </h3>
              <p class="mt-5 leading-relaxed text-muted-foreground">
                The agent receives structured facts it can act on, without
                scanning generated output or guessing how the application was
                assembled.
              </p>
            </div>
            <div class="mt-8 border border-border">
              <p
                class="border-b border-background/15 px-5 py-3 font-mono text-[10px] uppercase tracking-widest opacity-55"
              >
                Add to your project
              </p>
              <code class="block overflow-x-auto px-5 py-5 font-mono text-sm"
                ><span class="text-accent">$</span> npm install -D
                @runablejs/mcp</code
              >
            </div>
          </div>

          <div class="grid border-l border-t border-border sm:grid-cols-2">
            <article
              v-for="tool in mcpTools"
              :key="tool[0]"
              class="border-b border-r border-border bg-background p-5 transition-colors hover:bg-accent/5"
            >
              <div class="flex items-center justify-between gap-4">
                <UIcon :name="tool[2]" class="size-5 text-accent" />
                <UIcon
                  name="tabler:arrow-up-right"
                  class="size-4 text-muted-foreground"
                />
              </div>
              <code class="mt-7 block font-mono text-sm font-semibold">{{
                tool[0]
              }}</code>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                {{ tool[1] }}
              </p>
            </article>
          </div>
        </div>

        <div
          class="mt-16 grid border border-accent bg-background lg:grid-cols-2"
        >
          <div class="border-b border-accent/40 p-7 lg:border-b-0 lg:border-r">
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Agent Skills provide the method
            </p>
            <p class="mt-4 text-xl font-semibold">
              “How should this be built with Runable?”
            </p>
          </div>
          <div class="p-7">
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Runable MCP provides the facts
            </p>
            <p class="mt-4 text-xl font-semibold">
              “How is this project configured right now?”
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Context changes the result
            </p>
            <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Your agent is capable. It still needs to know the framework.
            </h2>
          </div>
          <p class="self-end text-lg leading-relaxed text-muted-foreground">
            AI coding tools know Vue, but Runable has its own APIs, boundaries,
            and generated conventions. Agent Skills turn that knowledge into
            project-level instructions your whole team can share.
          </p>
        </div>

        <div class="mt-16 grid border-l border-t border-border md:grid-cols-3">
          <article class="border-b border-r border-border p-8">
            <UIcon name="tabler:route-off" class="size-7 text-accent" />
            <h3 class="mt-8 text-xl font-semibold">No invented conventions</h3>
            <p class="mt-3 leading-relaxed text-muted-foreground">
              The agent stops confusing Runable with another Vue framework or
              suggesting APIs that do not exist.
            </p>
          </article>
          <article class="border-b border-r border-border p-8">
            <UIcon name="tabler:file-check" class="size-7 text-accent" />
            <h3 class="mt-8 text-xl font-semibold">Safer changes</h3>
            <p class="mt-3 leading-relaxed text-muted-foreground">
              It knows which files belong to you, which are generated, and which
              conventions keep the project predictable.
            </p>
          </article>
          <article class="border-b border-r border-border p-8">
            <UIcon name="tabler:server" class="size-7 text-accent" />
            <h3 class="mt-8 text-xl font-semibold">
              The right server boundary
            </h3>
            <p class="mt-3 leading-relaxed text-muted-foreground">
              It understands that Runable integrates with your HTTP server
              instead of replacing it.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section
      class="border-b border-border bg-muted/25 px-6 py-20 sm:px-10 lg:py-28"
    >
      <div class="mx-auto max-w-6xl">
        <div class="max-w-3xl">
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Knowledge, split by task
          </p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Load only what the work requires.
          </h2>
          <p class="mt-6 text-lg leading-relaxed text-muted-foreground">
            An agent working on SEO does not need backend adapter rules. Focused
            Skills keep its context useful and its changes precise.
          </p>
        </div>

        <div
          class="mt-14 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4"
        >
          <article
            v-for="skill in skills"
            :key="skill[0]"
            class="min-h-56 border-b border-r border-border bg-background p-6 transition-colors hover:bg-accent/5"
          >
            <div class="flex items-start justify-between gap-4">
              <UIcon :name="skill[3]" class="size-6 text-accent" /><span
                class="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >Skill</span
              >
            </div>
            <h3 class="mt-10 text-lg font-semibold">{{ skill[1] }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
              {{ skill[2] }}
            </p>
            <p
              class="mt-5 break-all font-mono text-[10px] text-muted-foreground"
            >
              {{ skill[0] }}
            </p>
          </article>
          <div
            class="flex min-h-56 flex-col justify-between border-b border-r border-accent bg-accent p-6 text-accent-foreground"
          >
            <UIcon name="tabler:plus" class="size-6" />
            <div>
              <p class="text-lg font-semibold">Built to evolve</p>
              <p class="mt-2 text-sm leading-relaxed opacity-75">
                The collection grows with Runable while staying matched to your
                installed CLI version.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <p
              class="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              From install to implementation
            </p>
            <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              A short setup. Better instructions on every task.
            </h2>
          </div>
          <ol class="border-t border-border">
            <li
              v-for="step in workflow"
              :key="step[0]"
              class="grid gap-4 border-b border-border py-7 sm:grid-cols-[4rem_1fr] sm:gap-6"
            >
              <span class="font-mono text-xs text-accent">{{ step[0] }}</span>
              <div>
                <h3 class="text-xl font-semibold">{{ step[1] }}</h3>
                <p class="mt-2 leading-relaxed text-muted-foreground">
                  {{ step[2] }}
                </p>
              </div>
            </li>
          </ol>
        </div>
        <div class="mt-16 grid border border-border lg:grid-cols-[1fr_auto]">
          <div class="min-w-0 p-6 sm:p-8">
            <p
              class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55"
            >
              Terminal
            </p>
            <code
              class="mt-4 block overflow-x-auto font-mono text-sm sm:text-base"
              ><span class="text-accent">$</span> runable skills install</code
            >
          </div>
          <p
            class="flex max-w-md items-center border-t border-background/20 p-6 text-sm leading-relaxed opacity-70 lg:border-l lg:border-t-0 lg:p-8"
          >
            Skills are regular project files. Commit them so every contributor
            works from the same Runable instructions.
          </p>
        </div>
      </div>
    </section>

    <section class="border-b border-border px-6 py-20 sm:px-10 lg:py-28">
      <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Use the tools you already have
          </p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            One open format. Multiple coding agents.
          </h2>
          <p
            class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Select one agent or several. The CLI installs each Skill in the
            correct shared or agent-specific directory.
          </p>
        </div>
        <div class="grid border-l border-t border-border sm:grid-cols-2">
          <div
            v-for="agent in agents"
            :key="agent[0]"
            class="flex items-center gap-4 border-b border-r border-border p-5"
          >
            <UIcon :name="agent[1]" class="size-5 text-accent" /><span
              class="text-sm font-medium"
              >{{ agent[0] }}</span
            >
          </div>
        </div>
      </div>
    </section>

    <section class="px-6 py-20 sm:px-10 lg:py-28">
      <div
        class="mx-auto grid max-w-6xl border border-border lg:grid-cols-[1fr_auto]"
      >
        <div class="p-8 sm:p-12 lg:p-16">
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Ready when your agent is
          </p>
          <h2
            class="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl"
          >
            Keep the speed of AI. Add the precision of Runable.
          </h2>
          <p
            class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            Install the Skills from your current CLI, commit them with the
            project, and start asking for real features.
          </p>
        </div>
        <div
          class="flex flex-col justify-center gap-3 border-t border-border bg-muted/30 p-8 lg:min-w-72 lg:border-l lg:border-t-0"
        >
          <UButton size="lg" as-child
            ><RunableLink to="/docs/guide/cli/skills"
              >Read the Skills guide
              <UIcon name="tabler:arrow-right" class="size-4" /></RunableLink
          ></UButton>
          <UButton variant="outline" size="lg" as-child
            ><RunableLink to="/docs">Explore the docs</RunableLink></UButton
          >
        </div>
      </div>
    </section>
  </div>
</template>
