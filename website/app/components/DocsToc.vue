<script setup lang="ts">
import type { ResolvedPageEntry } from "v-content";
import { useI18n } from "vue-i18n";

const props = defineProps<{ page: ResolvedPageEntry }>();
const { t } = useI18n();
const activeId = ref<string>("");

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
  <nav v-if="page.toc.length" aria-label="Sommaire de la page">
    <p class="mb-4 text-sm font-medium text-foreground">
      {{ t("common.onThisPage") }}
    </p>

    <ul class="mt-4 space-y-2">
      <li v-for="heading in page.toc" :key="heading.href">
        <a
          :style="{ marginLeft: `${Math.max(0, heading.depth - 2) * 20}px` }"
          :href="heading.href"
          class="group flex cursor-pointer items-center justify-start gap-3 truncate transition-colors duration-instant ease-default"
          :class="
            activeId === heading.href
              ? 'text-accent'
              : 'text-foreground/50 hover:text-foreground'
          "
          :aria-current="activeId === heading.href ? 'location' : undefined"
          @click.prevent="scrollTo(heading.href)"
        >
          <span
            class="block transition-all duration-fast ease-default"
            :class="[
              activeId === heading.href
                ? 'w-0.5 h-4 bg-accent rounded-r-sm'
                : 'w-0.5 h-0.5 bg-tertiary rounded-full group-hover:bg-secondary',
            ]"
            aria-hidden="true"
          />

          <span class="font-mono text-mono-sm tracking-wide text-right">
            {{ heading.numbering.slice(1).join(".") }}.
          </span>

          <span
            class="font-mono text-mono-sm tracking-wide transition-opacity duration-fast ease-default truncate text-ellipsis"
            :style="{ paddingRight: `${(heading.depth - 1) * 15}px` }"
            :class="
              activeId === heading.href
                ? 'opacity-100'
                : 'opacity-75 group-hover:opacity-100'
            "
          >
            {{ heading.value }}
          </span>
        </a>
      </li>
    </ul>
  </nav>
</template>
