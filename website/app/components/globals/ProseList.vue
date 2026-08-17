<script lang="ts" setup>
import { computed } from "vue";
import MDC from "v-content/components/MDC.js";

const props = defineProps<{
  ordered?: boolean;
  raws: string;
}>();

const data = computed(() => {
  try {
    return JSON.parse(props.raws) as {
      items: Array<{
        label: string;
        ordered?: boolean;
        children?: unknown[];
      }>;
    };
  } catch {
    return { items: [] };
  }
});
</script>

<template>
  <component
    :is="ordered ? 'ol' : 'ul'"
    class="u-list space-y-1 pl-5"
    :class="ordered ? 'list-decimal' : 'list-disc'"
  >
    <li
      v-for="(item, i) in data.items"
      :key="i"
      class="leading-relaxed whitespace-nowrap"
    >
      <span class="whitespace-pre-wrap">
        <MDC :value="item.label" />
      </span>
      <UProseList
        v-if="item.children?.length"
        :raws="JSON.stringify({ items: item.children })"
        :ordered="item.ordered"
        class="mt-1"
      />
    </li>
  </component>
</template>
