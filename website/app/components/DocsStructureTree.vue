<script setup lang="ts">
import { TreeItem, TreeRoot } from "reka-ui";

interface TreeNode {
  code: string;
  name: string;
  icon: string;
  href: string;
  iconOpen?: string;
  children?: TreeNode[];
}

const { nav } = useAppConfig();

const items: TreeNode[] =
  nav.find((n) => n.code === "structure")?.children ?? [];

const allItemCodes = (() => {
  const getAllItemCodes = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((item) => [
      item.code,
      ...getAllItemCodes(item.children ?? []),
    ]);

  return getAllItemCodes(items);
})();

const expandedItems = computed<string[]>({
  get: () => allItemCodes,
  set: () => {},
});

const expandAll = () => {
  const getAllItemNames = (items: TreeNode[]): string[] =>
    items.flatMap((item) => [
      item.name,
      ...getAllItemNames(item.children ?? []),
    ]);

  expandedItems.value = getAllItemNames(items);
};

onMounted(() => {
  expandAll();
});
</script>

<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    :items
    :get-key="(item) => item.code"
    :get-children="(item) => item.children"
    :default-expanded="allItemCodes"
    class="relative w-full before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
  >
    <TreeItem
      v-for="item in flattenItems"
      :key="item._id"
      v-slot="{ isExpanded }"
      v-bind="item.bind"
      :style="{ marginLeft: `${(item.level - 1) * 0.6}rem` }"
      as-child
      class="relative rounded-none flex cursor-pointer items-center gap-2 h-6 outline-none data-selected:border-accent hover:bg-border hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      :class="{ 'pl-3 border-l': item.parentItem }"
      @toggle="(e) => e.preventDefault()"
    >
      <SyoraLink :to="item.value.href" class="py-4">
        <UIcon
          :name="
            item.hasChildren && isExpanded && item.value.iconOpen
              ? item.value.iconOpen
              : item.value.icon
          "
          class="text-muted-foreground pointer-events-none size-4 shrink-0"
        />

        <span class="truncate">{{ item.value.name }}</span>
      </SyoraLink>
    </TreeItem>
  </TreeRoot>
</template>
