import { defineComponent, h, type CSSProperties, type PropType } from "vue";

import type { AppError } from "../../error/types.js";

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "2rem",
    color: "#18181b",
    background: "#fafafa",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
  },
  card: {
    width: "min(100%, 56rem)",
    padding: "2rem",
    border: "1px solid #e4e4e7",
    borderRadius: "0.75rem",
    background: "#fff",
    boxShadow: "0 12px 32px rgb(0 0 0 / 8%)",
  },
  code: {
    color: "#dc2626",
    fontFamily: "ui-monospace, monospace",
    fontSize: "0.875rem",
    fontWeight: "700",
  },
  title: { margin: "0.75rem 0", fontSize: "1.75rem" },
  meta: { color: "#71717a", fontSize: "0.875rem" },
  stack: {
    maxHeight: "22rem",
    overflow: "auto",
    padding: "1rem",
    borderRadius: "0.5rem",
    background: "#18181b",
    color: "#f4f4f5",
    fontSize: "0.75rem",
    whiteSpace: "pre-wrap",
  },
  actions: { display: "flex", gap: "0.75rem", marginTop: "1.5rem" },
  button: {
    padding: "0.625rem 1rem",
    border: "1px solid #d4d4d8",
    borderRadius: "0.5rem",
    background: "#fff",
    cursor: "pointer",
  },
};

export default defineComponent({
  name: "SyoraErrorDisplay",

  props: {
    error: {
      type: Object as PropType<AppError>,
      required: true,
    },
  },

  emits: ["clear"],

  setup(props, { emit }) {
    const reload = () => {
      if (typeof window !== "undefined") window.location.reload();
    };

    return () =>
      h("main", { style: styles.page }, [
        h("section", { style: styles.card }, [
          h("div", { style: styles.code }, props.error.code),
          h("h1", { style: styles.title }, props.error.message),
          props.error.info
            ? h("p", { style: styles.meta }, props.error.info)
            : null,
          h(
            "p",
            { style: styles.meta },
            `${props.error.source} · ${new Date(props.error.timestamp).toLocaleString()}`,
          ),
          props.error.stack
            ? h("details", { open: true }, [
                h("summary", "Stack trace"),
                h("pre", { style: styles.stack }, props.error.stack),
              ])
            : null,
          h("div", { style: styles.actions }, [
            h(
              "button",
              { type: "button", style: styles.button, onClick: reload },
              "Reload",
            ),
            h(
              "button",
              {
                type: "button",
                style: styles.button,
                onClick: () => emit("clear"),
              },
              "Dismiss",
            ),
          ]),
        ]),
      ]);
  },
});
