<script lang="ts" setup>
import { computed } from "vue";
import { tv } from "tailwind-variants";

import config from "#app/ui/config.js";

import type { ComponentConfig } from "../types/tv";
import theme from "./button.variant";

type Button = ComponentConfig<typeof theme, {}, "accordion">;

interface ButtonProps {
  label?: string;
  leading?: boolean;
  trailing?: string;

  color?: Button["variants"]["color"];
  size?: Button["variants"]["size"];
  square?: boolean;
  variant?: Button["variants"]["variant"];

  ui?: Button["slots"];

  class?: any;
}

const props = withDefaults(defineProps<ButtonProps>(), {});

const ui = computed(() =>
  tv({ ...theme, extend: tv(config.ui?.button ?? {}) })({
    color: props.color,
    size: props.size,
    square: props.square,
    variant: props.variant,
  }),
);
</script>

<template>
  <button
    :class="ui.base({ class: [props.ui?.base, props.class] })"
    data-slot="base"
  >
    <slot name="leading"> </slot>

    <slot />

    <slot name="trailing"> </slot>
  </button>
</template>
