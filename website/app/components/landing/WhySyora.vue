<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const titleRef = ref<HTMLElement | null>(null);
const leadRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const optionsRef = ref<HTMLElement | null>(null);
const solutionRef = ref<HTMLElement | null>(null);

const { reveal, revealChildren } = useScrollReveal({
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
  y: 16,
});

onMounted(() => {
  reveal(titleRef.value);
  reveal(leadRef.value);
  revealChildren(bodyRef.value, "p", 0);
  reveal(optionsRef.value);
  reveal(solutionRef.value);
});
</script>

<template>
  <section
    class="relative w-full transition-colors duration-base ease-smooth bg-muted/75 dark:bg-muted/10 border-t border-border"
    aria-labelledby="why-heading"
  >
    <div class="mx-auto max-w-7xl py-15 md:py-30 px-10">
      <div class="mx- max-w-5xl">
        <!-- Numérotation -->

        <p class="font-mono text-mono-sm uppercase tracking-[0.08em] mb-8">
          {{ t("landing.why.eyebrow") }}
        </p>

        <!-- Titre -->
        <h2
          id="why-heading"
          ref="titleRef"
          class="font-display text-h2 mb-6 sr-hidden"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          {{ t("landing.why.title") }}
        </h2>

        <!-- Lead -->
        <p
          ref="leadRef"
          class="font-body text-body text- leading-relaxed max-w-prose mb-16 sr-hidden"
          style="
            transition:
              opacity 300ms ease-out,
              transform 300ms ease-out;
          "
        >
          {{ t("landing.why.lead") }}
        </p>

        <!-- ═══════════════════════════════════════════════════
           CORPS DE TEXTE — Argumentation
           ═══════════════════════════════════════════════════ -->
        <div ref="bodyRef" class="max-w-prose space-y-6">
          <p
            class="font-body text-body text- leading-relaxed sr-hidden"
            style="
              transition:
                opacity 300ms ease-out,
                transform 300ms ease-out;
            "
          >
            {{ t("landing.why.body") }}
          </p>
        </div>

        <!-- ═══════════════════════════════════════════════════
           LES DEUX OPTIONS — Mise en forme visuelle
           ═══════════════════════════════════════════════════ -->
        <div
          ref="optionsRef"
          class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-16 mb-5 sr-hidden"
          style="
            transition:
              opacity 400ms ease-out,
              transform 400ms ease-out;
          "
        >
          <!-- Option 1 : Vue pur -->
          <div
            class="bg-destructive/5 border border-border rounded-md p-8 relative"
          >
            <!-- <div
            class="absolute left-0 top-3 bottom-3 w-0.75 bg-destructive rounded-r-sm"
            aria-hidden="true"
          /> -->
            <p
              class="font-mono text-mono-sm text-destructive uppercase tracking-widest mb-4"
            >
              {{ t("landing.why.optionA.label") }}
            </p>
            <h3 class="font-display text-h3 mb-3">
              {{ t("landing.why.optionA.title") }}
            </h3>
            <p class="font-body text-small text- leading-relaxed">
              {{ t("landing.why.optionA.description") }}
            </p>
          </div>

          <!-- Option 2 : Projets séparés -->
          <div
            class="bg-destructive/5 border border-border rounded-md p-8 relative"
          >
            <!-- <div
            class="absolute left-0 top-3 bottom-3 w-0.75 bg-destructive rounded-r-sm"
            aria-hidden="true"
          /> -->
            <p
              class="font-mono text-mono-sm text-destructive uppercase tracking-widest mb-4"
            >
              {{ t("landing.why.optionB.label") }}
            </p>
            <h3 class="font-display text-h3 mb-3">
              {{ t("landing.why.optionB.title") }}
            </h3>
            <p class="font-body text-small text- leading-relaxed">
              {{ t("landing.why.optionB.description") }}
            </p>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════
           LA SOLUTION — Syora
           ═══════════════════════════════════════════════════ -->
        <div
          ref="solutionRef"
          class="relative bg-muted dark:bg-muted/7 border border-muted p-8 md:p-10 rounded-md sr-"
          style="
            transition:
              opacity 400ms ease-out,
              transform 400ms ease-out;
          "
        >
          <div
            aria-hidden="true"
            class="absolute inset-0 opacity-30 dark:opacity-30 dark:filter dark:invert"
            style="
              background-image: url(https://template-nextjs-clean.sanity.build/images/tile-1-black.png);
              background-size: 5px;
            "
          ></div>

          <div
            class="absolute left-0 top-6 h-20 w-0.75 bg-green-500 rounded-r-sm"
            aria-hidden="true"
          />

          <p
            class="font-mono text-mono-sm text-green-600 uppercase tracking-widest mb-4"
          >
            {{ t("landing.why.solution.label") }}
          </p>
          <h3 class="font-display text-h3 mb-4">
            {{ t("landing.why.solution.title") }}
          </h3>
          <div class="space-y-4 max-w-165.5">
            <p class="font-body text-body text- leading-relaxed">
              {{ t("landing.why.solution.first.before") }}
              <strong class="font-medium">
                {{ t("landing.why.solution.first.emphasis") }}
              </strong>
              {{ t("landing.why.solution.first.after") }}
            </p>
            <p class="font-body text-body text- leading-relaxed">
              {{ t("landing.why.solution.second") }}
            </p>
            <p class="font-body text-body leading-relaxed font-medium">
              {{ t("landing.why.solution.third") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
