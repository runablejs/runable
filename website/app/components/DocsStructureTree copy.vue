<script setup lang="ts">
interface TreeNode {
  code: string;
  name: string;
  icon: string;
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
  <UTree
    v-model:expanded="expandedItems"
    :items="items"
    :getKey="(item) => item.code"
    v-slot="{ flattenItems }"
    :defaultExpanded="['Engineering', 'Frontend', 'Design System']"
    class="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
  >
    <UTreeItem
      v-for="item in flattenItems"
      v-bind="item"
      v-slot="{ isExpanded }"
    >
      <uTreeItemLabel
        :no-chevron="true"
        :hasChildren="item.hasChildren"
        class="not-in-data-[folder=true]:ps-2 rounded-none before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 hover:bg-accent/10 hover:text-foreground in-data-selected:bg-accent/10 in-data-selected:text-foreground"
      >
        <!-- in-focus-visible:ring-ring/50 bg-background in-data-selected:bg-accent in-data-selected:text-accent-foreground in-data-[drag-target=true]:bg-accent flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm transition-colors not-in-data-[folder=true]:ps-7 in-focus-visible:ring-[3px] in-data-[search-match=true]:bg-blue-50! [&_svg]:pointer-events-none [&_svg]:shrink-0 before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 hover:bg-muted hover:text-foreground -->
        <span class="flex items-center gap-2">
          <template v-if="item.hasChildren">
            <UIcon
              v-if="isExpanded"
              :name="item.value.iconOpen ?? item.value.icon"
              class="text-muted-foreground pointer-events-none size-4"
            />
            <UIcon
              v-else
              :name="item.value.icon"
              class="text-muted-foreground pointer-events-none size-4"
            />
          </template>
          <UIcon
            v-else
            :name="item.value.icon"
            class="text-muted-foreground pointer-events-none size-4"
          />
          {{ item.value.name }}
        </span>
      </uTreeItemLabel>
    </UTreeItem>
  </UTree>
</template>
