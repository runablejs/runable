<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  href?: string;
  target?: string;
  rel?: string;
}>();

const isExternal = computed(() => {
  if (!props.href) return false;
  return /^https?:\/\//.test(props.href) || props.href.startsWith("//");
});

const target = computed(() => {
  if (props.target) return props.target;
  if (isExternal.value) return "_blank";

  return "";
});
</script>

<template>
  <component
    :is="isExternal ? 'a' : 'router-link'"
    :to="{ path: href }"
    :target
    :href
    class="text-accent underline-offset-4 hover:underline transition-colors"
  >
    <slot />
  </component>
</template>
