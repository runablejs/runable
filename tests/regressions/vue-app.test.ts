// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { defineComponent, h, Suspense, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "../helpers.js";

/**
 * regression #019 — the bug isn't specific to useAsyncData: ANY Vue
 * component whose `setup()` returns a Promise (which is exactly what an
 * `await` at the top level of a compiled `<script setup>` produces) needs a
 * `<Suspense>` ancestor to ever resolve on the client. Without one, Vue
 * stores the pending promise on `instance.asyncDep` and nothing ever
 * consumes it — no error, the content just never appears.
 *
 * This is tested here with plain Vue APIs (defineComponent/h/Suspense),
 * not through packages/runable's own component tree, because the real
 * `RunableApp`/`RunablePage` depend on build-time virtual modules
 * (":app-vue", etc.) that only exist inside Runable's own Vite pipeline.
 * The second describe block below statically confirms app.ts itself still
 * uses the same Suspense mechanism exercised here.
 */
function makeAsyncChild(delayMs = 10) {
  return defineComponent({
    name: "AsyncChild",
    async setup() {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return () => h("div", { "data-testid": "async-content" }, "resolved");
    },
  });
}

describe("regression #019 - a <Suspense> boundary is required for a component with async setup()", () => {
  it("without <Suspense>, the async child's content never renders on the client", async () => {
    const AsyncChild = makeAsyncChild();
    const NoBoundary = defineComponent({
      setup() {
        return () => h("div", [h(AsyncChild)]);
      },
    });

    const wrapper = mount(NoBoundary);
    // Well past the child's own async delay — if this were going to
    // resolve on its own, it would have by now.
    await new Promise((resolve) => setTimeout(resolve, 100));
    await nextTick();

    expect(wrapper.find('[data-testid="async-content"]').exists()).toBe(false);
  });

  it("wrapped in <Suspense> — the same pattern app.ts uses — the content appears once resolved", async () => {
    const AsyncChild = makeAsyncChild();
    const WithBoundary = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(AsyncChild),
            fallback: () => h("div", { "data-testid": "fallback" }, "loading"),
          });
      },
    });

    const wrapper = mount(WithBoundary);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await nextTick();

    expect(wrapper.find('[data-testid="async-content"]').exists()).toBe(true);
  });
});

describe("regression #019 - app.ts wraps page content in <Suspense>", () => {
  it("imports Suspense from vue and renders through it", () => {
    const source = readFileSync(
      path.join(REPO_ROOT, "packages/runable/src/app/components/app.ts"),
      "utf8",
    );

    expect(source).toMatch(/import\s*{[^}]*\bSuspense\b[^}]*}\s*from\s*"vue"/);
    expect(source).toMatch(/h\(Suspense/);
  });
});
