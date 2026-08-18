<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { I18nConfig, I18nLocale } from "../../modules/i18n/types/index.js";
import DropdownMenuGroup from "./ui/dropdown-menu/DropdownMenuGroup.vue";
import DropdownMenuItem from "./ui/dropdown-menu/DropdownMenuItem.vue";

const { locale, setLocale, t } = useI18n();
const switching = ref(false);
const config = (useRuntime().public.i18n as I18nConfig) ?? {};

const locales = computed(() => {
  if (config.locales?.length) return config.locales;

  return Object.keys(config.messages ?? {}).map((code) => ({
    code,
    name: code.toUpperCase(),
    file: "",
  }));
});

async function changeLocale(value: string): Promise<void> {
  if (value === locale.value || switching.value) return;

  switching.value = true;

  try {
    await setLocale(value as I18nLocale);
  } finally {
    switching.value = false;
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <UButton
        variant="ghost"
        size="sm"
        class="h-8 gap-1.5 rounded-none px-2 uppercase"
        :disabled="switching"
        :title="t('common.changeLanguage')"
        :aria-label="t('common.changeLanguage')"
      >
        <UIcon name="tabler:language" class="size-4" aria-hidden="true" />
        <span class="text-xs font-medium">{{ locale }}</span>
      </UButton>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="min-w-40 p-0">
      <DropdownMenuGroup :model-value="locale">
        <DropdownMenuItem
          v-for="item in locales"
          :key="item.code"
          :value="item.code"
          class="rounded-none"
          @click="changeLocale(item.code)"
        >
          <span>{{ item.name }}</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
