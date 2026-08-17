import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const tipVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        warning: "",
        info: "",
        success: "",
        accent: "",
      },
      surface: {
        outline: "",
        soft: "border-border",
        solid: "border-transparent",
      },
    },
    compoundVariants: [
      // default
      {
        variant: "default",
        surface: "outline",
        class: "border-border text-card-foreground",
      },
      {
        variant: "default",
        surface: "soft",
        class:
          "bg-muted text-foreground *:data-[slot=tip-description]:text-muted-foreground",
      },
      {
        variant: "default",
        surface: "solid",
        class:
          "bg-foreground text-background [&>svg]:text-background *:data-[slot=tip-description]:text-background/80",
      },

      // destructive
      {
        variant: "destructive",
        surface: "outline",
        class:
          "border-destructive/50 text-destructive *:data-[slot=tip-description]:text-destructive/90",
      },
      {
        variant: "destructive",
        surface: "soft",
        class:
          "bg-destructive/10 text-destructive *:data-[slot=tip-description]:text-destructive/90",
      },
      {
        variant: "destructive",
        surface: "solid",
        class:
          "bg-destructive text-destructive-foreground [&>svg]:text-current *:data-[slot=tip-description]:text-destructive-foreground/90",
      },

      // warning
      {
        variant: "warning",
        surface: "outline",
        class:
          "border-warning/50 text-warning *:data-[slot=tip-description]:text-warning/90",
      },
      {
        variant: "warning",
        surface: "soft",
        class:
          "bg-warning/10 text-warning *:data-[slot=tip-description]:text-warning/90",
      },
      {
        variant: "warning",
        surface: "solid",
        class:
          "bg-warning text-warning-foreground [&>svg]:text-current *:data-[slot=tip-description]:text-warning-foreground/90",
      },

      // info
      {
        variant: "info",
        surface: "outline",
        class:
          "border-info/50 text-info *:data-[slot=tip-description]:text-info/90",
      },
      {
        variant: "info",
        surface: "soft",
        class:
          "bg-info/10 text-info *:data-[slot=tip-description]:text-info/90",
      },
      {
        variant: "info",
        surface: "solid",
        class:
          "bg-info text-info-foreground [&>svg]:text-current *:data-[slot=tip-description]:text-info-foreground/90",
      },

      // success
      {
        variant: "success",
        surface: "outline",
        class:
          "border-success/50 text-success *:data-[slot=tip-description]:text-success/90",
      },
      {
        variant: "success",
        surface: "soft",
        class:
          "bg-success/10 text-success *:data-[slot=tip-description]:text-success/90",
      },
      {
        variant: "success",
        surface: "solid",
        class:
          "bg-success text-success-foreground [&>svg]:text-current *:data-[slot=tip-description]:text-success-foreground/90",
      },

      // accent
      {
        variant: "accent",
        surface: "outline",
        class:
          "border-accent-foreground/30 text-accent-foreground *:data-[slot=tip-description]:text-accent-foreground/90",
      },
      {
        variant: "accent",
        surface: "soft",
        class:
          "bg-accent text-accent-foreground *:data-[slot=tip-description]:text-accent-foreground/90",
      },
      {
        variant: "accent",
        surface: "solid",
        class:
          "bg-accent-foreground text-accent [&>svg]:text-current *:data-[slot=tip-description]:text-accent/90",
      },
    ],
    defaultVariants: {
      variant: "default",
      surface: "soft",
    },
  },
);

export type TipVariants = VariantProps<typeof tipVariants>;
