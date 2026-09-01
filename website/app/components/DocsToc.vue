<script setup lang="ts">
import type { ResolvedPageEntry } from "v-content";

const props = defineProps<{ page: ResolvedPageEntry }>();
const activeId = ref<string>("");
const activeIndex = computed({
  get: () => props.page.toc.findIndex((item) => item.href === activeId.value),
  set: (index: number | null) => {
    activeId.value = index === null ? "" : (props.page.toc[index]?.href ?? "");
  },
});

let observer: IntersectionObserver | null = null;
let observedElements: HTMLElement[] = [];

const HEADER_OFFSET = 112;

function getHeadingId(href: string): string {
  const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : href;

  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function getHeadingElement(href: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(getHeadingId(href));
}

function updateActiveHeading(): void {
  if (!observedElements.length) {
    activeId.value = "";
    return;
  }

  let current = observedElements[0];

  for (const element of observedElements) {
    if (element.getBoundingClientRect().top > HEADER_OFFSET) break;
    current = element;
  }

  const heading = props.page.toc.find(
    (item) => getHeadingId(item.href) === current?.id,
  );

  activeId.value = heading?.href ?? props.page.toc[0]?.href ?? "";
}

function stopObserving(): void {
  observer?.disconnect();
  observer = null;
  observedElements = [];
}

async function startObserving(): Promise<void> {
  stopObserving();
  await nextTick();

  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return;
  }

  observedElements = props.page.toc
    .map((heading) => getHeadingElement(heading.href))
    .filter((element): element is HTMLElement => element !== null);

  observer = new IntersectionObserver(updateActiveHeading, {
    rootMargin: `-${HEADER_OFFSET}px 0px -70% 0px`,
    threshold: [0, 1],
  });

  for (const element of observedElements) observer.observe(element);

  updateActiveHeading();
}

function scrollTo(href: string): void {
  const element = getHeadingElement(href);
  if (!element) return;

  activeId.value = href;
  element.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });

  const url = new URL(window.location.href);
  url.hash = getHeadingId(href);
  window.history.replaceState(window.history.state, "", url);
}

onMounted(() => {
  void startObserving();
  window.addEventListener("scroll", updateActiveHeading, { passive: true });
});

watch(
  () => props.page.toc,
  () => void startObserving(),
  { deep: true },
);

onBeforeUnmount(() => {
  stopObserving();
  window.removeEventListener("scroll", updateActiveHeading);
});
</script>

<template>
  <div v-if="page.toc.length">
    <p class="mb- text-sm font-medium text-foreground">On this page</p>
    <ULineSidebar
      v-model="activeIndex"
      :items="page.toc"
      accent-color="var(--accent)"
      text-color="var(--muted-foreground)"
      marker-color="var(--border)"
      @item-click="(_, item) => scrollTo(item.href)"
    />
  </div>
</template>
