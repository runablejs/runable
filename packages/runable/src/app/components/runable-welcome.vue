<script setup lang="ts">
defineOptions({ name: "RunableWelcome" });

const links = [
  {
    label: "Read the docs",
    description: "Learn the conventions and core APIs",
    href: "https://runablejs.com/docs",
  },
  {
    label: "Explore modules",
    description: "Add official and community integrations",
    href: "https://runablejs.com/modules",
  },
  {
    label: "View on GitHub",
    description: "Follow development and contribute",
    href: "https://github.com/runablejs/runable",
  },
] as const;
</script>

<template>
  <main class="welcome-shell">
    <div class="welcome-grid" aria-hidden="true" />
    <div
      class="welcome-glow welcome-glow-primary"
      aria-hidden="true"
    />
    <div
      class="welcome-glow welcome-glow-secondary"
      aria-hidden="true"
    />

    <section class="welcome-card">
      <header class="welcome-topbar">
        <a
          class="welcome-brand"
          href="https://runablejs.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Runable website"
        >
          <svg
            class="welcome-brand-mark"
            viewBox="0 0 500 500"
            role="img"
            aria-label="Runable"
          >
            <g transform="translate(0 500) scale(.1 -.1)" fill="currentColor">
              <path
                d="M458 4820c-23-6-23-9-29-165-4-88-7-357-8-597-1-339 2-439 12-445 6-4 401-6 877-4 796 3 867 2 880-14 12-14-84-113-893-920l-907-903v-84c0-61 29-1571 30-1585 0-2 6-3 13-3 21 0 3657 3636 3657 3657 0 11-212 230-523 541-402 401-528 522-547 523-169 3-2545 3-2562-1z"
              />
              <path
                d="M2457 1802c-229-230-417-423-417-430 0-14 1109-1121 1125-1123 33-4 1661 4 1673 8 7 3 12 11 10 17-6 20-1943 1946-1958 1946-9 0-203-188-433-418z"
              />
            </g>
          </svg>
          <span>Runable</span>
        </a>

        <span class="welcome-status">
          <span class="welcome-status-dot" aria-hidden="true" />
          Ready
        </span>
      </header>

      <div class="welcome-content">
        <div class="welcome-hero">
          <div class="welcome-logo-stage" aria-hidden="true">
            <div class="welcome-logo-orbit welcome-orbit-one" />
            <div class="welcome-logo-orbit welcome-orbit-two" />
            <div class="welcome-logo-box">
              <svg class="welcome-hero-logo" viewBox="0 0 500 500">
                <g
                  transform="translate(0 500) scale(.1 -.1)"
                  fill="currentColor"
                >
                  <path
                    d="M458 4820c-23-6-23-9-29-165-4-88-7-357-8-597-1-339 2-439 12-445 6-4 401-6 877-4 796 3 867 2 880-14 12-14-84-113-893-920l-907-903v-84c0-61 29-1571 30-1585 0-2 6-3 13-3 21 0 3657 3636 3657 3657 0 11-212 230-523 541-402 401-528 522-547 523-169 3-2545 3-2562-1z"
                  />
                  <path
                    d="M2457 1802c-229-230-417-423-417-430 0-14 1109-1121 1125-1123 33-4 1661 4 1673 8 7 3 12 11 10 17-6 20-1943 1946-1958 1946-9 0-203-188-433-418z"
                  />
                </g>
              </svg>
            </div>
          </div>

          <p class="welcome-eyebrow">Your project is running</p>

          <h1 class="welcome-title">
            Welcome to
            <span>Runable.</span>
          </h1>

          <p class="welcome-intro">
            All the Vue conventions. Your server runtime. Start by editing
            <code class="welcome-code">app/pages/index.vue</code> and make this
            application yours.
          </p>

          <div class="welcome-actions">
            <a
              class="welcome-primary-action"
              href="https://runablejs.com/docs/getting-started/quickstart"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get started
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </a>

            <a
              class="welcome-secondary-action"
              href="https://github.com/runablejs/runable"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <nav class="welcome-resources" aria-label="Runable resources">
          <p class="welcome-resources-label">Continue exploring</p>

          <a
            v-for="(link, index) in links"
            :key="link.href"
            class="welcome-resource-link"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="welcome-resource-number">0{{ index + 1 }}</span>
            <span class="welcome-resource-copy">
              <strong>{{ link.label }}</strong>
              <small>{{ link.description }}</small>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </nav>
      </div>

      <footer class="welcome-footer">
        <span>Vue · Vite · Your backend</span>
        <span class="welcome-footer-command"><b>$</b> pnpm dev</span>
      </footer>
    </section>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.welcome-shell,
.welcome-shell * {
  box-sizing: border-box;
}

.welcome-shell {
  --accent: #26966d;
  --accent-bright: #42c791;
  --ink: #141714;
  --muted: #69716b;
  --line: rgb(20 23 20 / 12%);
  --surface: rgb(255 255 255 / 78%);
  position: relative;
  isolation: isolate;
  display: grid;
  min-width: 320px;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  padding: clamp(1rem, 1vw, 3.5rem);
  color: var(--ink);
  background: #f4f5f2;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.welcome-grid {
  position: absolute;
  z-index: -3;
  inset: 0;
  opacity: 0.5;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, black 10%, transparent 75%);
}

.welcome-glow {
  position: absolute;
  z-index: -2;
  width: 32rem;
  height: 32rem;
  border-radius: 999px;
  opacity: 0.17;
  filter: blur(100px);
  pointer-events: none;
}

.welcome-glow-primary {
  top: -13rem;
  right: -8rem;
  background: var(--accent-bright);
}

.welcome-glow-secondary {
  bottom: -17rem;
  left: -10rem;
  background: #d9af54;
}

.welcome-card {
  width: min(1120px, 100%);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 80%) inset,
    0 30px 80px rgb(32 52 42 / 10%);
  backdrop-filter: blur(22px);
}

.welcome-topbar,
.welcome-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 clamp(1.25rem, 3vw, 2rem);
}

.welcome-topbar {
  border-bottom: 1px solid var(--line);
}

.welcome-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--ink);
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.welcome-brand-mark {
  width: 25px;
  height: 25px;
  color: var(--accent);
}

.welcome-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.welcome-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-bright);
  box-shadow: 0 0 0 5px rgb(66 199 145 / 13%);
}

.welcome-content {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.75fr);
}

.welcome-hero {
  padding: clamp(2.5rem, 6vw, 5.5rem);
}

.welcome-logo-stage {
  position: relative;
  display: grid;
  width: 112px;
  height: 112px;
  margin-bottom: 3rem;
  place-items: center;
}

.welcome-logo-box {
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  border: 1px solid rgb(38 150 109 / 30%);
  border-radius: 18px;
  color: #fff;
  background: var(--accent);
  box-shadow: 0 18px 40px rgb(38 150 109 / 25%);
  transform: rotate(-4deg);
}

.welcome-hero-logo {
  width: 44px;
  height: 44px;
  transform: rotate(4deg);
}

.welcome-logo-orbit {
  position: absolute;
  border: 1px solid rgb(38 150 109 / 20%);
  border-radius: 50%;
}

.welcome-orbit-one {
  width: 98px;
  height: 98px;
}

.welcome-orbit-two {
  width: 122px;
  height: 122px;
  border-style: dashed;
  animation: welcome-orbit 24s linear infinite;
}

.welcome-eyebrow {
  margin: 0 0 1.2rem;
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.welcome-title {
  max-width: 700px;
  margin: 0;
  color: var(--ink);
  font-family: Fraunces, "Source Serif 4", "Tiempos Text", Georgia, serif;
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 0, "WONK" 0;
  font-weight: 500;
  line-height: 0.92;
}

.welcome-title span {
  color: var(--accent);
  font-style: italic;
}

.welcome-intro {
  max-width: 620px;
  margin: 2rem 0 0;
  color: var(--muted);
  font-size: clamp(1rem, 2vw, 1.18rem);
  line-height: 1.7;
}

.welcome-code {
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 0.18rem 0.38rem;
  color: var(--ink);
  background: rgb(20 23 20 / 5%);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.84em;
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.4rem;
}

.welcome-actions a {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0 1.15rem;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.welcome-actions a:hover {
  transform: translateY(-2px);
}

.welcome-primary-action {
  gap: 0.8rem;
  color: #fff;
  background: var(--accent);
  box-shadow: 0 10px 24px rgb(38 150 109 / 22%);
}

.welcome-primary-action:hover {
  background: #1e7d59;
}

.welcome-primary-action svg,
.welcome-resource-link svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.welcome-secondary-action {
  border: 1px solid var(--line);
  color: var(--ink);
  background: transparent;
}

.welcome-secondary-action:hover {
  border-color: rgb(38 150 109 / 40%);
  background: rgb(38 150 109 / 6%);
}

.welcome-resources {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--line);
  background: rgb(20 23 20 / 2%);
}

.welcome-resources-label {
  margin: 0;
  padding: 2rem;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.welcome-resource-link {
  display: grid;
  flex: 1;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  min-height: 128px;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  transition: background 180ms ease;
}

.welcome-resource-link:last-child {
  border-bottom: 0;
}

.welcome-resource-link:hover {
  background: rgb(38 150 109 / 7%);
}

.welcome-resource-link > svg {
  color: var(--muted);
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.welcome-resource-link:hover > svg {
  color: var(--accent);
  transform: translate(3px, -3px);
}

.welcome-resource-number {
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
}

.welcome-resource-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;
}

.welcome-resource-copy strong {
  font-size: 0.94rem;
}

.welcome-resource-copy small {
  color: var(--muted);
  font-size: 0.75rem;
  line-height: 1.4;
}

.welcome-footer {
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.welcome-footer-command {
  text-transform: none;
}

.welcome-footer-command b {
  color: var(--accent);
}

@keyframes welcome-orbit {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 780px) {
  .welcome-shell {
    padding: 0;
  }

  .welcome-card {
    min-height: 100svh;
    border: 0;
    border-radius: 0;
  }

  .welcome-content {
    grid-template-columns: 1fr;
  }

  .welcome-hero {
    padding: 3.5rem 1.5rem;
  }

  .welcome-logo-stage {
    margin-bottom: 2.4rem;
  }

  .welcome-resources {
    border-top: 1px solid var(--line);
    border-left: 0;
  }

  .welcome-resource-link {
    min-height: 108px;
    padding-inline: 1.5rem;
  }
}

@media (max-width: 480px) {
  .welcome-topbar,
  .welcome-footer {
    padding-inline: 1.25rem;
  }

  .welcome-footer > span:first-child {
    display: none;
  }

  .welcome-footer {
    justify-content: flex-end;
  }
}

@media (prefers-color-scheme: dark) {
  .welcome-shell {
    --ink: #f0f4f1;
    --muted: #929d96;
    --line: rgb(235 245 239 / 12%);
    --surface: rgb(16 21 18 / 82%);
    background: #0d110f;
  }

  .welcome-card {
    box-shadow:
      0 1px 0 rgb(255 255 255 / 5%) inset,
      0 30px 90px rgb(0 0 0 / 35%);
  }

  .welcome-code {
    background: rgb(255 255 255 / 6%);
  }

  .welcome-resources {
    background: rgb(255 255 255 / 1.5%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome-shell,
  .welcome-shell *,
  .welcome-shell *::before,
  .welcome-shell *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
