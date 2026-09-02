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
    <section class="welcome-frame">
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
            aria-hidden="true"
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
          <span aria-hidden="true" />
          Development server ready
        </span>
      </header>

      <div class="welcome-main">
        <div class="welcome-hero">
          <p class="welcome-eyebrow">Vue framework · Runtime agnostic</p>

          <h1 class="welcome-title">
            Your Runable app
            <em>is ready.</em>
          </h1>

          <p class="welcome-intro">
            Start building by editing
            <code>app/pages/index.vue</code>. You already have the Vue
            conventions; the server runtime remains yours.
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
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <nav class="welcome-resources" aria-label="Runable resources">
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

      <footer class="welcome-footer">
        <span>Runable application layer</span>
        <span>Vue · Vite · Your backend</span>
      </footer>
    </section>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@400;500;600;700&display=swap");

.welcome-shell,
.welcome-shell * {
  box-sizing: border-box;
}

.welcome-shell {
  --welcome-background: oklch(1 0 0);
  --welcome-foreground: oklch(0.145 0 0);
  --welcome-muted: oklch(0.556 0 0);
  --welcome-surface: oklch(0.985 0 0);
  --welcome-code: oklch(0.97 0 0);
  --welcome-border: oklch(0.922 0 0);
  --welcome-accent: oklch(59.6% 0.145 163.225);
  --welcome-accent-foreground: oklch(0.985 0 0);
  position: relative;
  isolation: isolate;
  display: grid;
  min-width: 320px;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  padding: clamp(1rem, 3vw, 3rem);
  color: var(--welcome-foreground);
  background: var(--welcome-background);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.welcome-shell ::selection {
  color: var(--welcome-accent-foreground);
  background: var(--welcome-accent);
}

.welcome-frame {
  width: min(1200px, 100%);
  overflow: hidden;
  border: 1px solid var(--welcome-border);
  background: color-mix(in oklch, var(--welcome-background) 96%, transparent);
  box-shadow: 0 28px 80px
    color-mix(in oklch, var(--welcome-foreground) 7%, transparent);
}

.welcome-topbar,
.welcome-footer {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 clamp(1rem, 2.5vw, 1.5rem);
}

.welcome-topbar {
  border-bottom: 1px solid var(--welcome-border);
}

.welcome-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: inherit;
  font-weight: 700;
  text-decoration: none;
}

.welcome-brand-mark {
  width: 24px;
  height: 24px;
  color: var(--welcome-accent);
}

.welcome-status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--welcome-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.welcome-status > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--welcome-accent);
}

.welcome-main {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
}

.welcome-hero {
  display: flex;
  min-height: 560px;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2.25rem, 6vw, 5rem);
}

.welcome-eyebrow {
  width: max-content;
  margin: 0 0 1.5rem;
  border-left: 3px solid var(--welcome-accent);
  padding: 0.42rem 0.7rem;
  color: var(--welcome-background);
  background: var(--welcome-foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.welcome-title {
  margin: 0;
  font-family: Fraunces, Georgia, serif;
  font-size: clamp(3.2rem, 7vw, 4.5rem);
  font-weight: 650;
  letter-spacing: -0.055em;
  line-height: 0.94;
}

.welcome-title em {
  color: var(--welcome-accent);
}

.welcome-intro {
  max-width: 610px;
  margin: 2rem 0 0;
  color: var(--welcome-muted);
  font-size: clamp(1rem, 1.5vw, 1.12rem);
  line-height: 1.7;
}

.welcome-intro code {
  border: 1px solid var(--welcome-border);
  padding: 0.14rem 0.34rem;
  color: var(--welcome-foreground);
  background: var(--welcome-code);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.84em;
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.welcome-actions a {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 1.15rem;
  color: inherit;
  font-size: 0.86rem;
  font-weight: 650;
  text-decoration: none;
}

.welcome-actions svg,
.welcome-resource-link svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.welcome-primary-action {
  color: var(--welcome-accent-foreground) !important;
  background: var(--welcome-accent);
}

.welcome-secondary-action {
  border: 1px solid var(--welcome-border);
  background: var(--welcome-background);
}

.welcome-project {
  align-self: center;
  margin: 2rem 2rem 2rem 0;
  border: 1px solid var(--welcome-border);
  background: var(--welcome-background);
}

.welcome-project-topbar,
.welcome-terminal {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0.85rem;
  border-bottom: 1px solid var(--welcome-border);
  color: var(--welcome-muted);
  background: var(--welcome-code);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.welcome-project-topbar > div {
  display: flex;
  gap: 5px;
}

.welcome-project-topbar > div span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--welcome-border);
}

.welcome-project-topbar > div span:first-child {
  background: var(--welcome-accent);
}

.welcome-project-topbar > span {
  color: var(--welcome-accent);
}

.welcome-project-body {
  display: flex;
  min-height: 290px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.welcome-logo-box {
  display: grid;
  width: 88px;
  height: 88px;
  place-items: center;
  color: var(--welcome-accent-foreground);
  background: var(--welcome-accent);
}

.welcome-logo-box svg {
  width: 48px;
  height: 48px;
}

.welcome-project-label {
  margin: 1.5rem 0 0.55rem;
  color: var(--welcome-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.welcome-project-body strong {
  font-family: Fraunces, Georgia, serif;
  font-size: 1.35rem;
}

.welcome-project-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  border-top: 1px solid var(--welcome-border);
}

.welcome-project-meta div {
  min-width: 0;
  padding: 0.85rem;
  border-right: 1px solid var(--welcome-border);
}

.welcome-project-meta div:last-child {
  border-right: 0;
}

.welcome-project-meta dt {
  color: var(--welcome-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.welcome-project-meta dd {
  overflow: hidden;
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.welcome-terminal {
  border-top: 1px solid var(--welcome-border);
  border-bottom: 0;
  text-transform: none;
}

.welcome-terminal > span,
.welcome-terminal i {
  color: var(--welcome-accent);
}

.welcome-terminal p {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.welcome-terminal i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--welcome-accent);
}

.welcome-resources {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--welcome-border);
}

.welcome-resource-link {
  display: grid;
  min-width: 0;
  min-height: 118px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-right: 1px solid var(--welcome-border);
  color: inherit;
  text-decoration: none;
}

.welcome-resource-link:last-child {
  border-right: 0;
}

.welcome-resource-number {
  color: var(--welcome-accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.62rem;
}

.welcome-resource-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;
}

.welcome-resource-copy strong {
  font-size: 0.9rem;
}

.welcome-resource-copy small {
  overflow: hidden;
  color: var(--welcome-muted);
  font-size: 0.72rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.welcome-resource-link > svg {
  color: var(--welcome-muted);
}

.welcome-footer {
  border-top: 1px solid var(--welcome-border);
  color: var(--welcome-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 820px) {
  .welcome-shell {
    padding: 0;
  }

  .welcome-frame {
    min-height: 100svh;
    border-top: 0;
    border-bottom: 0;
  }

  .welcome-main {
    grid-template-columns: 1fr;
  }

  .welcome-hero {
    min-height: auto;
    padding: 4rem 1.5rem;
  }

  .welcome-project {
    margin: 0 1.5rem 3rem;
  }

  .welcome-resources {
    grid-template-columns: 1fr;
  }

  .welcome-resource-link {
    min-height: 96px;
    border-right: 0;
    border-bottom: 1px solid var(--welcome-border);
  }

  .welcome-resource-link:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 480px) {
  .welcome-status {
    font-size: 0;
  }

  .welcome-status > span {
    display: block;
  }

  .welcome-title {
    font-size: clamp(3rem, 17vw, 2.5rem);
  }

  .welcome-footer span:first-child {
    display: none;
  }

  .welcome-footer {
    justify-content: flex-end;
  }
}

@media (prefers-color-scheme: dark) {
  .welcome-shell {
    --welcome-background: oklch(0.145 0 0);
    --welcome-foreground: oklch(0.985 0 0);
    --welcome-muted: oklch(0.708 0 0);
    --welcome-surface: oklch(0.205 0 0);
    --welcome-code: oklch(0.18 0 0);
    --welcome-border: oklch(1 0 0 / 10%);
    --welcome-accent: oklch(69.6% 0.17 162.48);
    --welcome-accent-foreground: oklch(0.145 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome-shell,
  .welcome-shell *,
  .welcome-shell *::before,
  .welcome-shell *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
