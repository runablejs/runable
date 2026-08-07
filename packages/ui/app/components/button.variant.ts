const color = [
  "primary",
  "surface",
  "success",
  "info",
  "warning",
  "error",
  "neutral",
] as const;

const variant = [
  "solid",
  "outline",
  "soft",
  "subtle",
  "ghost",
  "link",
] as const;

const size = ["xs", "sm", "md", "lg", "xl"] as const;

export const button = {
  slots: {
    base: "inline-flex shrink-0 items-center justify-center gap-xs whitespace-nowrap rounded-default font-medium transition-colors duration-fast ease-smooth select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",

    icon: "shrink-0",

    label: "truncate",

    leadingIcon: "shrink-0",

    trailingIcon: "shrink-0",
  },

  variants: {
    // ────────────────────────────────────────────────────────────
    // Appearance
    // ────────────────────────────────────────────────────────────

    variant: {
      solid: {
        base: "bg-primary text-primary-inverse border border-transparent hover:bg-primary/90 active:bg-primary/80",
      },

      outline: {
        base: "border border-primary bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10",
      },

      soft: {
        base: "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
      },

      subtle: {
        base: "border border-primary/20 bg-primary/5 text-primary hover:border-primary/30 hover:bg-primary/10 active:bg-primary/15",
      },

      ghost: {
        base: "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/15",
      },

      link: {
        base: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Size
    // ────────────────────────────────────────────────────────────

    size: {
      xs: {
        base: "py-1 px-2 text-xs",
        leadingIcon: "size-3.5",
        trailingIcon: "size-3.5",
      },

      sm: {
        base: "py-1.5 px-3 text-sm",
        leadingIcon: "size-4",
        trailingIcon: "size-4",
      },

      md: {
        base: "py-2 px-4 text-sm sm",
        leadingIcon: "size-4",
        trailingIcon: "size-4",
      },

      lg: {
        base: "py-2.5 px-5 text-base",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },

      xl: {
        base: "py-3 px-6 text-lg",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Block
    // ────────────────────────────────────────────────────────────

    block: {
      true: {
        base: "w-full",

        trailingIcon: "ml-auto",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Square
    // ────────────────────────────────────────────────────────────

    square: {
      true: {
        base: "aspect-square px-0",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Color
    // ────────────────────────────────────────────────────────────

    color: {
      primary: {
        base: "text-primary",
      },

      surface: {
        base: "text-surface",
      },

      success: {
        base: "text-success",
      },

      info: {
        base: "text-info",
      },

      warning: {
        base: "text-warning",
      },

      error: {
        base: "text-error",
      },

      neutral: {
        base: "text-neutral",
      },
    },
  },

  compoundVariants: [
    // ────────────────────────────────────────────────────────────
    // Solid
    // ────────────────────────────────────────────────────────────

    {
      variant: "solid" as (typeof variant)[number],
      color: "primary" as (typeof color)[number],
      class: {
        base: "bg-primary text-primary-inverse hover:bg-primary/90 active:bg-primary/80",
      },
    },

    {
      variant: "solid" as (typeof variant)[number],
      color: "surface" as (typeof color)[number],
      class: {
        base: "bg-surface text-surface-inverse hover:bg-surface/90 active:bg-surface/80",
      },
    },

    {
      variant: "solid" as (typeof variant)[number],
      color: "success" as (typeof color)[number],
      class: {
        base: "bg-success text-success-inverse hover:bg-success/90 active:bg-success/80",
      },
    },

    {
      variant: "solid" as (typeof variant)[number],
      color: "info" as (typeof color)[number],
      class: {
        base: "bg-info text-info-inverse hover:bg-info/90 active:bg-info/80",
      },
    },

    {
      variant: "solid" as (typeof variant)[number],
      color: "warning" as (typeof color)[number],
      class: {
        base: "bg-warning text-warning-inverse hover:bg-warning/90 active:bg-warning/80",
      },
    },

    {
      variant: "solid" as (typeof variant)[number],
      color: "error" as (typeof color)[number],
      class: {
        base: "bg-error text-error-inverse hover:bg-error/90 active:bg-error/80",
      },
    },

    {
      variant: "solid" as (typeof variant)[number],
      color: "neutral" as (typeof color)[number],
      class: {
        base: "bg-neutral text-neutral-inverse hover:bg-neutral/90 active:bg-neutral/80",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Outline
    // ────────────────────────────────────────────────────────────

    {
      variant: "outline" as (typeof variant)[number],
      color: "surface" as (typeof color)[number],
      class: {
        base: "border-surface text-surface hover:bg-surface/5 active:bg-surface/10",
      },
    },

    {
      variant: "outline" as (typeof variant)[number],
      color: "success" as (typeof color)[number],
      class: {
        base: "border-success text-success hover:bg-success/5 active:bg-success/10",
      },
    },

    {
      variant: "outline" as (typeof variant)[number],
      color: "info" as (typeof color)[number],
      class: {
        base: "border-info text-info hover:bg-info/5 active:bg-info/10",
      },
    },

    {
      variant: "outline" as (typeof variant)[number],
      color: "warning" as (typeof color)[number],
      class: {
        base: "border-warning text-warning hover:bg-warning/5 active:bg-warning/10",
      },
    },

    {
      variant: "outline" as (typeof variant)[number],
      color: "error" as (typeof color)[number],
      class: {
        base: "border-error text-error hover:bg-error/5 active:bg-error/10",
      },
    },

    {
      variant: "outline" as (typeof variant)[number],
      color: "neutral" as (typeof color)[number],
      class: {
        base: "border-neutral text-neutral hover:bg-neutral/5 active:bg-neutral/10",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Soft
    // ────────────────────────────────────────────────────────────

    {
      variant: "soft" as (typeof variant)[number],
      color: "surface" as (typeof color)[number],
      class: {
        base: "bg-surface/10 text-surface hover:bg-surface/15 active:bg-surface/20",
      },
    },

    {
      variant: "soft" as (typeof variant)[number],
      color: "success" as (typeof color)[number],
      class: {
        base: "bg-success/10 text-success hover:bg-success/15 active:bg-success/20",
      },
    },

    {
      variant: "soft" as (typeof variant)[number],
      color: "info" as (typeof color)[number],
      class: {
        base: "bg-info/10 text-info hover:bg-info/15 active:bg-info/20",
      },
    },

    {
      variant: "soft" as (typeof variant)[number],
      color: "warning" as (typeof color)[number],
      class: {
        base: "bg-warning/10 text-warning hover:bg-warning/15 active:bg-warning/20",
      },
    },

    {
      variant: "soft" as (typeof variant)[number],
      color: "error" as (typeof color)[number],
      class: {
        base: "bg-error/10 text-error hover:bg-error/15 active:bg-error/20",
      },
    },

    {
      variant: "soft" as (typeof variant)[number],
      color: "neutral" as (typeof color)[number],
      class: {
        base: "bg-neutral/10 text-neutral hover:bg-neutral/15 active:bg-neutral/20",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Subtle
    // ────────────────────────────────────────────────────────────

    {
      variant: "subtle" as (typeof variant)[number],
      color: "surface" as (typeof color)[number],
      class: {
        base: "border-surface/20 bg-surface/5 text-surface hover:border-surface/30 hover:bg-surface/10",
      },
    },

    {
      variant: "subtle" as (typeof variant)[number],
      color: "success" as (typeof color)[number],
      class: {
        base: "border-success/20 bg-success/5 text-success hover:border-success/30 hover:bg-success/10",
      },
    },

    {
      variant: "subtle" as (typeof variant)[number],
      color: "info" as (typeof color)[number],
      class: {
        base: "border-info/20 bg-info/5 text-info hover:border-info/30 hover:bg-info/10",
      },
    },

    {
      variant: "subtle" as (typeof variant)[number],
      color: "warning" as (typeof color)[number],
      class: {
        base: "border-warning/20 bg-warning/5 text-warning hover:border-warning/30 hover:bg-warning/10",
      },
    },

    {
      variant: "subtle" as (typeof variant)[number],
      color: "error" as (typeof color)[number],
      class: {
        base: "border-error/20 bg-error/5 text-error hover:border-error/30 hover:bg-error/10",
      },
    },

    {
      variant: "subtle" as (typeof variant)[number],
      color: "neutral" as (typeof color)[number],
      class: {
        base: "border-neutral/20 bg-neutral/5 text-neutral hover:border-neutral/30 hover:bg-neutral/10",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Ghost
    // ────────────────────────────────────────────────────────────

    {
      variant: "ghost" as (typeof variant)[number],
      color: "surface" as (typeof color)[number],
      class: {
        base: "text-surface hover:bg-surface/10 active:bg-surface/15",
      },
    },

    {
      variant: "ghost" as (typeof variant)[number],
      color: "success" as (typeof color)[number],
      class: {
        base: "text-success hover:bg-success/10 active:bg-success/15",
      },
    },

    {
      variant: "ghost" as (typeof variant)[number],
      color: "info" as (typeof color)[number],
      class: {
        base: "text-info hover:bg-info/10 active:bg-info/15",
      },
    },

    {
      variant: "ghost" as (typeof variant)[number],
      color: "warning" as (typeof color)[number],
      class: {
        base: "text-warning hover:bg-warning/10 active:bg-warning/15",
      },
    },

    {
      variant: "ghost" as (typeof variant)[number],
      color: "error" as (typeof color)[number],
      class: {
        base: "text-error hover:bg-error/10 active:bg-error/15",
      },
    },

    {
      variant: "ghost" as (typeof variant)[number],
      color: "neutral" as (typeof color)[number],
      class: {
        base: "text-neutral hover:bg-neutral/10 active:bg-neutral/15",
      },
    },

    // ────────────────────────────────────────────────────────────
    // Link
    // ────────────────────────────────────────────────────────────

    {
      variant: "link" as (typeof variant)[number],
      color: "surface" as (typeof color)[number],
      class: {
        base: "text-surface",
      },
    },

    {
      variant: "link" as (typeof variant)[number],
      color: "success" as (typeof color)[number],
      class: {
        base: "text-success",
      },
    },

    {
      variant: "link" as (typeof variant)[number],
      color: "info" as (typeof color)[number],
      class: {
        base: "text-info",
      },
    },

    {
      variant: "link" as (typeof variant)[number],
      color: "warning" as (typeof color)[number],
      class: {
        base: "text-warning",
      },
    },

    {
      variant: "link" as (typeof variant)[number],
      color: "error" as (typeof color)[number],
      class: {
        base: "text-error",
      },
    },

    {
      variant: "link" as (typeof variant)[number],
      color: "neutral" as (typeof color)[number],
      class: {
        base: "text-neutral",
      },
    },
  ],

  defaultVariants: {
    color: "primary" as (typeof color)[number],
    variant: "solid" as (typeof variant)[number],
    size: "md" as (typeof size)[number],
    block: false,
    square: false,
  },
};

export default button;
