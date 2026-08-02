<!-- components/SyoraWelcome.vue -->
<script setup lang="ts">
const page = ref(1);

const { data, refresh } = useAsyncData(
  "fsf",
  () => $fetch(`https://jsonplaceholder.typicode.com/todos/${page.value}`),
  { watch: [page] },
);

const version = ref("1.1.0");
</script>

<template>
  {{ data }}+
  <div><button @click="page++">refresh</button> {{ page }}</div>
  <div class="syora-welcome">
    <!-- Background Grid with Vignette Fade -->
    <div class="bg-grid"></div>

    <!-- Main Content -->
    <main class="main">
      <div class="hero">
        <h1 class="title">Welcome to <span class="font-bold">Syora</span></h1>
      </div>

      <!-- Features & Resources Grid -->
      <div class="features-grid">
        <!-- Card 2: Documentation -->
        <div class="feature-card">
          <div class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon-svg"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M5 5a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -14"
              />
              <path
                d="M9 5a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -14"
              />
              <path d="M5 8h4" />
              <path d="M9 16h4" />
              <path
                d="M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041"
              />
              <path d="M14 9l4 -1" />
              <path d="M16 16l3.923 -.98" />
            </svg>
          </div>
          <h3>Documentation</h3>
          <p>
            Learn the core architecture or inspect auto-generated OpenAPI
            endpoints at
            <a href="https://github.com/syorajs/syora" target="_blank">docs</a>.
          </p>
        </div>

        <!-- Card 1: Examples -->
        <div class="feature-card">
          <div class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-stack-2"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 4l-8 4l8 4l8 -4l-8 -4" />
              <path d="M4 12l8 4l8 -4" />
              <path d="M4 16l8 4l8 -4" />
            </svg>
          </div>
          <h3>Examples</h3>
          <p>
            Explore starter kits, boilerplate recipes, and real-world project
            samples.
          </p>
        </div>
      </div>

      <div class="features-grid">
        <!-- Card 3: Star on GitHub -->
        <div class="feature-card">
          <div class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon-svg"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
          </div>
          <h3>Star on GitHub</h3>
          <p>
            Syora is open-source. Support framework development and star the
            repository on
            <a href="https://github.com/syorajs" target="_blank">GitHub</a>.
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <!-- <footer class="footer">
      <span>v{{ version }} </span>
    </footer> -->
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

body {
  margin: 0;
  font-family: "Geist Mono", monospace;
  font-optical-sizing: auto;
  /* font-weight: <weight>; */
  font-style: normal;
}
</style>

<style scoped>
/* ==========================================================================
   Design Tokens & CSS Variables (Dark theme by default)
   ========================================================================== */
.syora-welcome {
  color-scheme: dark light;
  --bg-color: #000000;
  --card-bg: #0a0a0a;
  --card-border: rgba(255, 255, 255, 0.08);
  --card-hover-border: rgba(56, 189, 248, 0.35);
  --title-color: #ffffff;
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --cyan-bright: #38bdf8;
  --grid-line: rgba(255, 255, 255, 0.04);
  --vignette-color: #000000;
  --gradient-start: #38bdf8;
  --gradient-mid: #7dd3fc;
  --gradient-end: #818cf8;
  --font-sans: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

/* ==========================================================================
   Light Mode Theme Adaptation
   ========================================================================== */
@media (prefers-color-scheme: light) {
  .syora-welcome {
    --bg-color: #ffffff;
    --card-bg: #f8fafc;
    --card-border: rgba(0, 0, 0, 0.08);
    --card-hover-border: rgba(2, 132, 199, 0.4);
    --title-color: #0f172a;
    --text-main: #0f172a;
    --text-muted: #475569;
    --text-dim: #64748b;
    --cyan-bright: #0284c7;
    --grid-line: rgba(0, 0, 0, 0.05);
    --vignette-color: #f8fafc;
    --gradient-start: #0284c7;
    --gradient-mid: #2563eb;
    --gradient-end: #4f46e5;
  }
}

/* ==========================================================================
   Main Layout
   ========================================================================== */
.syora-welcome {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: var(--font-sans);
  position: relative;
  overflow: hidden;
  padding-top: 80px;
  /* display: flex; */
  /* flex-direction: column; */
  /* justify-content: space-between; */
  box-sizing: border-box;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.syora-welcome *,
.syora-welcome *::before,
.syora-welcome *::after {
  box-sizing: border-box;
}

/* Background Grid with Center Fade */
.bg-grid {
  display: none;
  position: absolute;
  inset: 0;
  background-size: 32px 32px;
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  pointer-events: none;
  -webkit-mask-image: radial-gradient(
    ellipse at center,
    var(--vignette-color) 30%,
    transparent 80%
  );
  mask-image: radial-gradient(
    ellipse at center,
    var(--vignette-color) 30%,
    transparent 80%
  );
}

.main {
  position: relative;
  z-index: 10;
  max-width: 1300px;
  width: 100%;
  margin: auto;
  padding: 3rem 1.5rem;
}

/* ==========================================================================
   Hero Section
   ========================================================================== */
.text-center {
  text-align: center;
}

.hero {
  margin-bottom: 50px;
}

.font-bold {
  font-weight: 800;
}

.title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: normal;
  letter-spacing: -0.03em;
  color: var(--title-color);
  margin: 0 0 0.75rem 0;
  line-height: 1.15;
}

.gradient-text {
  background: linear-gradient(
    135deg,
    var(--gradient-start) 0%,
    var(--gradient-mid) 40%,
    var(--gradient-end) 100%
  );
  /* -webkit-background-clip: text; */
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ==========================================================================
   Features Grid & Cards
   ========================================================================== */
.features-grid {
  display: flex;
  flex-wrap: wrap;
  /* grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); */
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.feature-card {
  padding: 1rem;
  border-radius: 0.1rem;
  background: var(--card-bg);
  /* background: var(--card-bg);
  border: 1px solid var(--card-border); */
  transition: all 0.25s ease;
  max-width: 310px;
}

.feature-card:hover {
  border-color: var(--card-hover-border);
  transform: translateY(-2px);
  background: var(--card-bg);
}

.icon {
  display: flex;
  align-items: center;
  /* color: var(--cyan-bright); */
  margin-bottom: 0.85rem;
}

.icon-svg {
  width: 22px;
  height: 22px;
}

.feature-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--title-color);
  margin: 0 0 0.4rem 0;
}

.feature-card p {
  font-size: 0.825rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
}

.feature-card a {
  color: var(--cyan-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ==========================================================================
   Footer
   ========================================================================== */
.footer {
  position: relative;
  z-index: 10;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-dim);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--text-dim);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--text-muted);
}
</style>
