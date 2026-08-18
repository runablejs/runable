<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const ctaHeadingRef = ref<HTMLElement | null>(null);
const ctaContentRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
  y: 16,
});
const localePath = useLocalePath();

onMounted(() => {
  reveal(ctaHeadingRef.value);
  revealChildren(ctaContentRef.value, "div", 80);
});
</script>

<template>
  <section
    class="relative w-full transition-colors duration-base ease-smooth overflow-hidden"
    aria-labelledby="cta-heading"
  >
    <!-- <div class="w-full h-px bg-border-default" aria-hidden="true" /> -->

    <div class="mx-auto max-w-7xl px-10 pb-30">
      <div class="max-w-3xl mx-auto text-center">
        <p
          class="font-mono text-mono-sm text-tertiary tracking-[0.08em] mb-8"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          {{ t("landing.quickstart.eyebrow") }}
        </p>

        <!-- <h2
          id="cta-heading"
          ref="ctaHeadingRef"
          class="font-display text-hero text- leading-tight tracking-tight sr-hiddend"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          Ready to build
          <br class="hidden md:block" />
          your next application?
        </h2> -->

        <div
          ref="ctaContentRef"
          class="flex flex-col items-center gap-8 sr-hiddend mt-5"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          <p class="font-body text-body leading-relaxed max-w-xl">
            {{ t("landing.quickstart.description") }}
          </p>

          <div class="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <SyoraLink
              :to="localePath('/docs/getting-started/installation')"
              class="group inline-flex items-center gap-3 font-mono text-mono bg-neutral text-inverse px-8 py-4 rounded-md transition-all duration-fast ease-default hover:bg-neutral/90 hover:-translate-y-px"
            >
              <span>npm create syora@latest</span>

              <UIcon
                name="tabler:arrow-right"
                class="transition-transform duration-fast ease-default group-hover:translate-x-0.5 size-3.5"
              />
            </SyoraLink>

            <a
              href="https://github.com/syorajs/syora"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 font-mono text-mono px-6 py-4 rounded-md border border-border transition-all duration-fast ease-default hover:border-strong hover:thover:-translate-y-px"
            >
              <UIcon name="simple-icons:github" class="size-5" />

              <span>{{ t("landing.quickstart.viewOnGitHub") }}</span>
            </a>
          </div>

          <p class="font-body text-caption text-tertiary mt-2">
            {{ t("landing.quickstart.meta") }}
          </p>
        </div>
      </div>
    </div>

    <div class="w-full h-px border-t border-default" aria-hidden="true" />
  </section>
</template>
