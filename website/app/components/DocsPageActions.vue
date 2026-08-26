<script setup lang="ts">
import { computed, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import type { ResolvedPageEntry } from "v-content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const props = defineProps<{ page: ResolvedPageEntry }>();
const runtime = useRuntime();

type CopyAction = "page" | "link" | "mcp";

const copiedAction = ref<CopyAction>();
const { copy, copied } = useClipboard();
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

const markdownUrl = computed(() => {
  const siteUrl = runtime.public.siteUrl;
  const markdownUrl = `${siteUrl}/raw/docs${props.page.path}`;
  return markdownUrl;
});

const assistantPrompt = computed(() => {
  return `Read this Runable documentation page and help me with it: ${markdownUrl.value}`;
});

const chatGptUrl = computed(
  () => `https://chatgpt.com/?q=${encodeURIComponent(assistantPrompt.value)}`,
);
const claudeUrl = computed(
  () => `https://claude.ai/new?q=${encodeURIComponent(assistantPrompt.value)}`,
);

const addMcpServerUrl = computed(() => {
  const siteUrl = runtime.public.siteUrl;
  const mcpUrl = `${siteUrl}/mcp`;

  const configuration = JSON.stringify({
    name: "runable",
    type: "http",
    url: mcpUrl,
  });

  return `vscode:mcp/install?${encodeURIComponent(configuration)}`;
});

function markAsCopied(action: CopyAction) {
  copiedAction.value = action;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    copiedAction.value = undefined;
  }, 2_000);
}

async function copyText(value: string, action: CopyAction) {
  await copy(value);
  markAsCopied(action);
}

async function copyPage() {
  await copyText(props.page.html, "page");
}

function copyMarkdownLink() {
  return copyText(markdownUrl.value, "link");
}

function copyMcpUrl() {
  const siteUrl = runtime.public.siteUrl;
  const mcpUrl = `${siteUrl}/mcp`;
  return copyText(mcpUrl, "mcp");
}
</script>

<template>
  <UButtonGroup>
    <UButton variant="outline" @click="copyPage">
      <UIcon :name="copiedAction === 'page' ? 'tabler:check' : 'tabler:copy'" />
      {{ copiedAction === "page" ? "Page copied" : "Copy page" }}
    </UButton>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <UButton variant="outline" size="icon" aria-label="More Options">
          <UIcon
            name="tabler:chevron-down"
            class="size-3.5"
            aria-hidden="true"
          />
        </UButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @select="copyMarkdownLink">
          <UIcon
            :name="copiedAction === 'link' ? 'tabler:check' : 'tabler:link'"
          />
          {{
            copiedAction === "link"
              ? "Markdown link copied"
              : "Copy Markdown link"
          }}
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <a :href="markdownUrl" target="_blank" rel="noreferrer">
            <UIcon name="tabler:markdown" />
            View as Markdown
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem as-child>
          <a :href="chatGptUrl" target="_blank" rel="noreferrer">
            <UIcon name="simple-icons:openai" />
            Open in ChatGPT
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <a :href="claudeUrl" target="_blank" rel="noreferrer">
            <UIcon name="simple-icons:anthropic" />
            Open in Claude
          </a>
        </DropdownMenuItem>

        <!-- <DropdownMenuSeparator />

        <DropdownMenuItem @select="copyMcpUrl">
          <UIcon
            :name="copiedAction === 'mcp' ? 'tabler:check' : 'tabler:copy'"
          />
          {{ copiedAction === "mcp" ? "MCP URL copied" : "Copy MCP URL" }}
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <a :href="addMcpServerUrl">
            <UIcon name="tabler:server-plus" />
            Add MCP server
          </a>
        </DropdownMenuItem> -->
      </DropdownMenuContent>
    </DropdownMenu>
  </UButtonGroup>
</template>
