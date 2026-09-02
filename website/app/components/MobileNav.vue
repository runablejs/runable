<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import GithubLink from "./GithubLink.vue";
import Logo from "./navbar-components/Logo.vue";
import ModeSwitcher from "./ModeSwitcher.vue";

interface NavigationItem {
  label: string;
  to: string;
  icon: string;
}

const props = withDefaults(
  defineProps<{
    nav: NavigationItem[];
    position?: "left" | "right";
    colors?: string[];
    displayItemNumbering?: boolean;
  }>(),
  {
    position: "right",
    colors: () => ["var(--muted)", "var(--accent)"],
    displayItemNumbering: true,
  },
);

const emit = defineEmits<{ menuOpen: []; menuClose: [] }>();
const router = useRouter();
const open = ref(false);
const panelRef = ref<HTMLElement | null>(null);
let previousOverflow = "";

const activePath = computed(() => {
  const path = router.currentRoute.value.path.replace(/\/+$/, "");
  return props.nav.find(
    (item) => path === item.to || path.startsWith(`${item.to}/`),
  )?.to;
});

const offscreen = computed(() =>
  props.position === "left" ? "-100%" : "100%",
);

function closeMenu(): void {
  open.value = false;
}

function toggleMenu(): void {
  open.value = !open.value;
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") closeMenu();
}

watch(open, async (isOpen) => {
  if (typeof document === "undefined") return;

  if (isOpen) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeydown);
    emit("menuOpen");
    await nextTick();
    panelRef.value?.focus();
  } else {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", handleKeydown);
    emit("menuClose");
  }
});

watch(() => router.currentRoute.value.fullPath, closeMenu);

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = previousOverflow;
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="flex h-full items-center xl:hidden">
    <UButton
      variant="ghost"
      size="icon"
      class="h-full rounded-none"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      :aria-expanded="open"
      aria-controls="mobile-navigation"
      @click="toggleMenu"
    >
      <UIcon :name="open ? 'tabler:x' : 'tabler:menu'" class="size-5" />
    </UButton>

    <div
      class="mobile-nav max-lg:hidden"
      :class="open && 'mobile-nav--open'"
      :data-position="position"
      :aria-hidden="!open"
    >
      <button
        class="mobile-nav__backdrop"
        type="button"
        aria-label="Close menu"
        :tabindex="open ? 0 : -1"
        @click="closeMenu"
      />

      <div class="mobile-nav__layers" aria-hidden="true">
        <div
          v-for="(color, index) in colors"
          :key="`${color}-${index}`"
          class="mobile-nav__layer"
          :style="{
            background: color,
            transform: open ? 'translateX(0)' : `translateX(${offscreen})`,
            transitionDelay: open ? `${index * 65}ms` : '0ms',
          }"
        />
      </div>

      <aside
        id="mobile-navigation"
        ref="panelRef"
        class="mobile-nav__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        :tabindex="open ? 0 : -1"
        :style="{
          transform: open ? 'translateX(0)' : `translateX(${offscreen})`,
          transitionDelay: open ? `${colors.length * 65 + 60}ms` : '0ms',
        }"
      >
        <nav
          class="min-h-0 flex-1 overflow-y-auto py-8"
          aria-label="Mobile navigation"
        >
          <ul class="space-y-1">
            <li
              v-for="(item, index) in nav"
              :key="item.to"
              class="overflow-hidden"
            >
              <RunableLink
                :to="item.to"
                class="mobile-nav__link"
                :class="activePath === item.to && 'mobile-nav__link--active'"
                :style="{
                  transform: open ? 'translateY(0)' : 'translateY(120%)',
                  transitionDelay: open ? `${180 + index * 55}ms` : '0ms',
                }"
                :aria-current="activePath === item.to ? 'page' : undefined"
                @click="closeMenu"
              >
                <span
                  v-if="displayItemNumbering"
                  class="w-7 shrink-0 font-mono text-xs text-muted-foreground"
                  >{{ String(index + 1).padStart(2, "0") }}</span
                >
                <UIcon :name="item.icon" class="size-5 shrink-0" />
                <span class="truncate">{{ item.label }}</span>
              </RunableLink>
            </li>
          </ul>
        </nav>

        <footer
          class="flex h-(--header-height) shrink-0 items-center justify-between border-t px-4"
        >
          <span class="text-xs text-muted-foreground"
            >Vue without a fixed server runtime.</span
          >
          <div class="flex h-full items-center">
            <ClientOnly
              ><ModeSwitcher class="h-full rounded-none"
            /></ClientOnly>
            <GithubLink class="h-full rounded-none" />
          </div>
        </footer>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  inset: 0;
  z-index: 100;
  visibility: hidden;
  pointer-events: none;
  transition: visibility 0s linear 500ms;
}

.mobile-nav--open {
  visibility: visible;
  pointer-events: auto;
  transition-delay: 0s;
}

.mobile-nav__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: color-mix(in oklch, var(--background) 55%, transparent);
  opacity: 0;
  backdrop-filter: blur(4px);
  transition: opacity 300ms ease;
}

.mobile-nav--open .mobile-nav__backdrop {
  opacity: 1;
}

.mobile-nav__layers,
.mobile-nav__panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(100%, 30rem);
  height: 100dvh;
}

[data-position="left"] .mobile-nav__layers,
[data-position="left"] .mobile-nav__panel {
  right: auto;
  left: 0;
}

.mobile-nav__layer {
  position: absolute;
  inset: 0;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.mobile-nav__panel {
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--border);
  color: var(--foreground);
  background: var(--background);
  outline: none;
  transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

[data-position="left"] .mobile-nav__panel {
  border-right: 1px solid var(--border);
  border-left: 0;
}

.mobile-nav__link {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 0.75rem;
  border-left: 2px solid transparent;
  color: var(--muted-foreground);
  font-size: clamp(1.2rem, 5vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  transition:
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
}

.mobile-nav__link:hover,
.mobile-nav__link--active {
  border-color: var(--accent);
  color: var(--foreground);
  background: var(--muted);
}

/* @media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
} */

@media (prefers-reduced-motion: reduce) {
  .mobile-nav *,
  .mobile-nav *::before,
  .mobile-nav *::after {
    transition-duration: 0.01ms !important;
  }
}
</style>
