<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { tipVariants, type TipVariants } from ".";
import { cn } from "~/lib/utils";
import TipDescription from "./TipDescription.vue";
import TipTitle from "./TipTitle.vue";

const props = defineProps<{
  title?: string;
  description?: string;
  class?: HTMLAttributes["class"];
  variant?: TipVariants["variant"];
  surface?: TipVariants["surface"];
}>();
</script>

<template>
  <div
    :class="cn(tipVariants({ variant, surface }), props.class)"
    data-slot="tip"
    role="alert"
  >
    <slot name="title">
      <TipTitle v-if="title">
        {{ title }}
      </TipTitle>
    </slot>

    <TipDescription v-if="description || $slots.default">
      <template v-if="description">
        {{ description }}
      </template>
      <slot />
    </TipDescription>
  </div>
</template>
