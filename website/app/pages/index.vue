<script setup lang="ts">
import { ref, onMounted } from "vue";

// ─── Sections ───
import HeroSection from "~/components/landing/Hero.vue";
// import ArchitectureSection from "~/components/landing/TheCompromise.vue";
import WhyRunableSection from "~/components/landing/WhyRunable.vue";
import CapabilitiesSection from "~/components/landing/Capabilities.vue";
import RuntimesSection from "~/components/landing/Runtimes.vue";
import SponsorsSection from "~/components/landing/Sponsors.vue";
// import QuickStartSection from "~/components/landing/QuickStart.vue";
import QuickstartSection from "~/components/landing/Quickstart.vue";

// ─── Navigator ───
import SectionNavigator from "~/components/landing/SectionNavigator.vue";

// ─── Scroll progress ───
const scrollProgress = ref(0);

function onScroll() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  scrollProgress.value = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
});
</script>

<template>
  <!-- Header -->
  <!-- <header
      class="fixed top-0 left-0 right-0 h-10 bg-default/80 backdrop-blur-sm border-default z-200 transition-colors duration-base ease-smooth"
    >
      <div
        class="mx-auto h-full flex items-center justify-between px-page-sm md:px-page-md lg:px-page"
      >
        <a
          href="/"
          class="font-display text-h4 text-neutral hover:text-accent transition-colors duration-instant ease-default"
          >Runable</a
        >

        <nav class="hidden md:flex items-center gap-8">
          <a
            href="#docs"
            class="font-body text-small text-secondary hover:text-neutral relative transition-colors duration-instant ease-default group"
          >
            Documentation
            <span
              class="absolute bottom-[-2px] left-0 w-full h-px bg-neutral scale-x-0 group-hover:scale-x-100 transition-transform duration-instant ease-default origin-left"
            />
          </a>
          <a
            href="#modules"
            class="font-body text-small text-secondary hover:text-neutral relative transition-colors duration-instant ease-default group"
          >
            Modules
            <span
              class="absolute bottom-[-2px] left-0 w-full h-px bg-neutral scale-x-0 group-hover:scale-x-100 transition-transform duration-instant ease-default origin-left"
            />
          </a>
          <a
            href="https://github.com/runablejs/runable"
            target="_blank"
            rel="noopener noreferrer"
            class="font-body text-small text-secondary hover:text-neutral relative transition-colors duration-instant ease-default group"
          >
            GitHub
            <span
              class="absolute bottom-[-2px] left-0 w-full h-px bg-neutral scale-x-0 group-hover:scale-x-100 transition-transform duration-instant ease-default origin-left"
            />
          </a>
        </nav>

        <button
          type="button"
          class="p-2 text-secondary hover:text-neutral transition-colors duration-instant ease-default"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <svg
            v-if="!isDark"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5" />
            <path
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
        </button>
      </div>
    </header> -->

  <!-- Navigator latéral -->
  <SectionNavigator />

  <!-- Contenu principal — wrappers avec ID pour le navigator -->
  <main>
    <div id="section-hero" data-nav-section>
      <HeroSection />
    </div>

    <div id="section-why" data-nav-section>
      <WhyRunableSection />
    </div>

    <div id="section-capabilities" data-nav-section>
      <CapabilitiesSection />
    </div>

    <div id="section-runtimes" data-nav-section>
      <RuntimesSection />
    </div>

    <div id="section-sponsors" data-nav-section>
      <SponsorsSection />
    </div>

    <div id="section-quickstart" data-nav-section>
      <QuickstartSection />
    </div>

    <!-- 

      <div id="section-compromise" data-nav-section>
        <ArchitectureSection />
      </div>

      <div id="section-capabilities" data-nav-section>
        <CapabilitiesSection />
      </div>

      <div id="section-quickstart" data-nav-section>
        <QuickStartSection />
      </div>

      <div id="section-manifesto" data-nav-section>
        <ManifestoSection />
      </div> -->
  </main>

  <!-- Footer -->
  <!-- <footer
    class="w-full bg-default border-t border-default transition-colors duration-base ease-smooth"
  >
    <div class="mx-auto max-w-content px-page-sm md:px-page-md lg:px-page py-8">
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div class="flex items-center justify-between md:justify-start gap-6">
          <span class="font-display text-h4 text-neutral">Runable</span>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com/runablejs/runable"
              target="_blank"
              rel="noopener noreferrer"
              class="text-secondary hover:text-neutral transition-colors duration-instant ease-default"
              aria-label="GitHub"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/runablejs"
              target="_blank"
              rel="noopener noreferrer"
              class="text-secondary hover:text-neutral transition-colors duration-instant ease-default"
              aria-label="Twitter"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path
                  d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                />
              </svg>
            </a>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span class="font-mono text-mono-sm text-tertiary"
            >© 2026 Runable. MIT License.</span
          >
          <div class="flex items-center gap-4">
            <a
              href="#docs"
              class="font-body text-caption text-tertiary hover:text-secondary transition-colors duration-instant ease-default"
              >Documentation</a
            >
            <a
              href="#modules"
              class="font-body text-caption text-tertiary hover:text-secondary transition-colors duration-instant ease-default"
              >Modules</a
            >
            <a
              href="#"
              class="font-body text-caption text-tertiary hover:text-secondary transition-colors duration-instant ease-default"
              >License</a
            >
          </div>
        </div>
      </div>
    </div>
  </footer> -->
</template>
