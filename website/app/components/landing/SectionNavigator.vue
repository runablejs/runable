<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface NavSection {
  id: string;
  num: string;
  label: string;
}

const sections: NavSection[] = [
  { id: "section-hero", num: "01", label: "Hero" },
  { id: "section-why", num: "02", label: "Why Runable" },
  { id: "section-capabilities", num: "03", label: "Capabilities" },
  { id: "section-runtimes", num: "04", label: "Runtimes" },
  { id: "section-sponsors", num: "05", label: "Sponsors" },
  { id: "section-quickstart", num: "06", label: "Quick Start" },
  // { id: "section-themanifesto", num: "06", label: "Manifesto" },
];

const activeId = ref<string>(sections[0].id);
let observer: IntersectionObserver | null = null;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

onMounted(() => {
  const elements = sections
    .map((s) => document.getElementById(s.id))
    .filter(Boolean) as HTMLElement[];

  if (elements.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      // Trouve l'entrée la plus visible (plus grand intersectionRatio)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        activeId.value = visible.target.id;
      }
    },
    {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: "-20% 0px -20% 0px",
    },
  );

  elements.forEach((el) => observer?.observe(el));
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <!-- Desktop uniquement — légende verticale discrète -->
  <nav
    class="hidden xl:flex fixed left-[3vw] top-1/2 -translate-y-1/2 flex-col gap-3 z-300"
    aria-label="Page sections"
  >
    <button
      v-for="section in sections"
      :key="section.id"
      type="button"
      class="group flex items-center gap-1 text-left transition-colors duration-instant ease-default cursor-pointer"
      :class="
        activeId === section.id ? 'text-accent' : 'text-tertiary hover:text-'
      "
      @click="scrollToSection(section.id)"
    >
      <!-- Indicateur : trait vertical pour actif, point pour inactif -->
      <!-- <span
        class="block transition-all duration-fast ease-default"
        :class="[
          activeId === section.id
            ? 'w-0.75 h-4 bg-accent rounded-r-sm'
            : 'w-0.75 h-0.75 bg-tertiary rounded-full group-hover:bg-',
        ]"
        aria-hidden="true"
      /> -->

      <!-- Label -->
      <span
        class="font-mono text-mono-sm tracking-wide px-1.5 py-0.5 text-center"
        :class="{
          'bg-accent text-accent-foreground': activeId === section.id,
          'bg- text-muted-foreground': activeId !== section.id,
        }"
      >
        {{ section.num }}
      </span>

      <!-- Nom de section (visible au hover ou si actif) -->
      <span
        class="font-mono text-mono-sm tracking-wide transition-opacity duration-fast ease-default"
        :class="
          activeId === section.id
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100'
        "
      >
        — {{ section.label }}
      </span>
    </button>
  </nav>
</template>
