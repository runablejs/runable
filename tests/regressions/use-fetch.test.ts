// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { createAsyncData } from "../../packages/runable/src/async-data/plugin.js";
import { useFetch } from "../../packages/runable/src/app/composables/useFetch.js";

describe("useFetch - Nuxt-compatible composable", () => {
  it("returns async-data state and applies fetch, transform and pick options", async () => {
    const fetcher = vi.fn(async (_request: unknown, options: Record<string, unknown>) => ({
      id: 7,
      label: String((options.query as { search: string }).search),
      private: true,
    }));
    let result!: ReturnType<typeof useFetch<{ id: number; label: string; private: boolean }, Error, { id: number; label: string }, ["id", "label"]>>;
    const search = ref("first");
    const wrapper = mount(defineComponent({
      setup() {
        result = useFetch<{ id: number; label: string; private: boolean }, Error, { id: number; label: string }, ["id", "label"]>("/api/items", {
          $fetch: fetcher as never,
          query: { search },
          transform: (value) => ({ id: value.id, label: value.label }),
          pick: ["id", "label"],
        });
        return () => null;
      },
    }), { global: { plugins: [createAsyncData()] } });

    await result;
    expect(result.status.value).toBe("success");
    expect(result.data.value).toEqual({ id: 7, label: "first" });
    expect(result.error.value).toBeUndefined();

    search.value = "second";
    await nextTick();
    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(result.data.value!.label).toBe("second");
    });
    wrapper.unmount();
  });

  it("supports immediate false, execute and clear", async () => {
    const fetcher = vi.fn(async () => ({ ok: true }));
    let result!: ReturnType<typeof useFetch<{ ok: boolean }>>;
    mount(defineComponent({
      setup() {
        result = useFetch("/manual", { $fetch: fetcher as never, immediate: false });
        return () => null;
      },
    }), { global: { plugins: [createAsyncData()] } });

    expect(result.status.value).toBe("idle");
    expect(fetcher).not.toHaveBeenCalled();
    await result.execute();
    expect(result.data.value).toEqual({ ok: true });
    result.clear();
    expect(result.status.value).toBe("idle");
    expect(result.data.value).toBeUndefined();
  });

  it("rejects protocol-relative URLs like Nuxt", () => {
    expect(() => mount(defineComponent({
      setup() {
        useFetch("//example.com/data");
        return () => null;
      },
    }), { global: { plugins: [createAsyncData()] } })).toThrow("Protocol-relative URLs");
  });
});
