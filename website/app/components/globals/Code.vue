<script setup lang="ts">
import { computed, ref } from "vue";

import Button from "~/components/ui/button/Button.vue";
import { IconCheck, IconCopy } from "@tabler/icons-vue";
import { useClipboard } from "@vueuse/core";

const root = ref<HTMLElement | null>(null);

const language = computed(() => {
  const pre = root.value?.querySelector("pre");

  return pre?.getAttribute("language") ?? "";
});

const { copy, copied } = useClipboard({});

async function copyCode() {
  const code = root.value?.querySelector("pre code");
  if (!code) return;

  const text = code.textContent ?? "";

  copy(text);
}
</script>

<template>
  <div
    ref="root"
    class="group w-full relative my-6 overflow-hidden rounded-md border border-border bg-code"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between gap-1 border-b border-border px- h-8"
    >
      <span
        v-if="language"
        class="font-mono text-xs text-muted-foreground px-2"
      >
        {{ language }}
      </span>

      <span v-else />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="group-not-[&:hover]:hidden rounded-none sticky right-0"
        :aria-label="copied ? 'Code copied' : 'Copy code'"
        @click="copyCode"
      >
        <IconCheck v-if="copied" class="size-3.5" />
        <IconCopy v-else class="size-3.5" />
      </Button>
    </div>

    <!-- Shiki -->
    <div
      class="[&>pre]:m-0 [&>pre]:p-5 [&>pre]:rounded-none [&>pre]:border-0 [&>pre]:overflow-x-auto [&>pre]:w-0 [&>pre]:min-w-full"
    >
      <slot />
    </div>
  </div>
</template>
