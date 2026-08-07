import merge from "lodash/merge.js";

import generateColors, { type ColorConfig } from "../generaors/colors.js";
import generateTypography, {
  type TypographyConfig,
} from "../generaors/typography.js";
import generateSpacing, { type SpacingConfig } from "../generaors/spacing.js";
import generateRadius, { type RadiusConfig } from "../generaors/radius.js";
import generateShadows, { type ShadowsConfig } from "../generaors/shadows.js";
import generateMotion, { type MotionConfig } from "../generaors/motion.js";
import generateLayout, { type LayoutConfig } from "../generaors/layout.js";
import generateGrid, { type GridConfig } from "../generaors/grid.js";
import generateBorder, { type BorderConfig } from "../generaors/border.js";

export interface TokensGeneratorPluginOptions {
  output: string;

  colors?: ColorConfig;
  typography?: TypographyConfig;
  spacing?: SpacingConfig;
  radius?: RadiusConfig;
  shadows?: ShadowsConfig;
  motions?: MotionConfig;
  layout?: LayoutConfig;
  grid?: GridConfig;
  border?: Partial<BorderConfig>;
}

const defaultTokens = {
  output: ".output/ui/tokens",

  // ────────────────────────────────────────────────────────────
  // Colors
  // ────────────────────────────────────────────────────────────

  colors: {
    primary: "var(--color-sky-700)",
    surface: "var(--color-stone-200)",
    success: "var(--color-emerald-500)",
    info: "var(--color-sky-500)",
    warning: "var(--color-amber-400)",
    error: "var(--color-red-500)",
    neutral: "var(--color-stone-800)",

    "dark:primary": "var(--color-sky-700)",
    "dark:surface": "var(--color-slate-400)",
    "dark:success": "var(--color-emerald-400)",
    "dark:info": "var(--color-sky-400)",
    "dark:warning": "var(--color-amber-400)",
    "dark:error": "var(--color-red-400)",
    "dark:neutral": "var(--color-stone-400)",
  },

  // ────────────────────────────────────────────────────────────
  // Typography
  // ────────────────────────────────────────────────────────────

  typography: {
    // Headings
    h1: "2.25rem",
    h2: "1.875rem",
    h3: "1.5rem",
    h4: "1.25rem",
    h5: "1.125rem",
    h6: "1rem",

    // Body
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",

    // Semantic typography
    body: "1rem",
    caption: "0.75rem",
    label: "0.875rem",
    button: "0.875rem",

    // Responsive typography
    display: "2.5rem",
    "md:display": "3rem",
    "lg:display": "4rem",

    hero: "2.5rem",
    "md:hero": "3.5rem",
    "lg:hero": "4.5rem",
  },

  // ────────────────────────────────────────────────────────────
  // Spacing
  // ────────────────────────────────────────────────────────────

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
    "5xl": "8rem",
  },

  // ────────────────────────────────────────────────────────────
  // Radius
  // ────────────────────────────────────────────────────────────

  radius: {
    none: "0",
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    "2xl": "16px",
    "3xl": "24px",
    full: "9999px",

    default: "6px",
  },

  // ────────────────────────────────────────────────────────────
  // Shadows
  // ────────────────────────────────────────────────────────────

  shadows: {
    none: "none",

    xs: "0 1px 2px rgb(0 0 0 / 5%)",
    sm: "0 1px 3px rgb(0 0 0 / 10%)",
    md: "0 4px 6px rgb(0 0 0 / 10%)",
    lg: "0 10px 15px rgb(0 0 0 / 10%)",
    xl: "0 20px 25px rgb(0 0 0 / 10%)",
    "2xl": "0 25px 50px rgb(0 0 0 / 15%)",

    card: "0 1px 3px rgb(0 0 0 / 8%)",
    dropdown: "0 8px 24px rgb(0 0 0 / 12%)",
    modal: "0 20px 50px rgb(0 0 0 / 20%)",
  },

  // ────────────────────────────────────────────────────────────
  // Motion
  // ────────────────────────────────────────────────────────────

  motions: {
    duration: {
      instant: "0ms",
      fast: "100ms",
      base: "200ms",
      slow: "300ms",
      slower: "500ms",
    },

    ease: {
      linear: "linear",
      base: "ease-out",
      in: "ease-in",
      inOut: "ease-in-out",
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      emphasized: "cubic-bezier(0.2, 0, 0, 1)",
    },
  },

  // ────────────────────────────────────────────────────────────
  // Layout
  // ────────────────────────────────────────────────────────────

  layout: {
    breakpoint: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },

  // ────────────────────────────────────────────────────────────
  // Grid
  // ────────────────────────────────────────────────────────────

  grid: {
    columns: {
      1: "repeat(1, minmax(0, 1fr))",
      2: "repeat(2, minmax(0, 1fr))",
      3: "repeat(3, minmax(0, 1fr))",
      4: "repeat(4, minmax(0, 1fr))",
      5: "repeat(5, minmax(0, 1fr))",
      6: "repeat(6, minmax(0, 1fr))",
      12: "repeat(12, minmax(0, 1fr))",
    },

    rows: {
      1: "repeat(1, minmax(0, 1fr))",
      2: "repeat(2, minmax(0, 1fr))",
      3: "repeat(3, minmax(0, 1fr))",
      4: "repeat(4, minmax(0, 1fr))",
      6: "repeat(6, minmax(0, 1fr))",
    },
  },

  // ────────────────────────────────────────────────────────────
  // Border
  // ────────────────────────────────────────────────────────────

  border: {
    size: {
      none: "0",
      thin: "0.5px",
      base: "1px",
      thick: "2px",
      "2xl": "4px",
    },

    color: {
      primary: "var(--ui-color-primary)",
      secondary: "var(--ui-color-secondary)",
      success: "var(--ui-color-success)",
      info: "var(--ui-color-info)",
      warning: "var(--ui-color-warning)",
      error: "var(--ui-color-error)",
      neutral: "var(--ui-color-neutral)",

      muted: "var(--color-slate-300)",

      "dark:primary": "var(--ui-color-primary)",
      "dark:secondary": "var(--ui-color-secondary)",
      "dark:success": "var(--ui-color-success)",
      "dark:info": "var(--ui-color-info)",
      "dark:warning": "var(--ui-color-warning)",
      "dark:error": "var(--ui-color-error)",
      "dark:neutral": "var(--ui-color-neutral)",
      "dark:muted": "var(--color-slate-700)",
    },
  },
};

export default function generateTokens(options: TokensGeneratorPluginOptions) {
  merge(options, defaultTokens);

  generateColors(options.colors, options.output);
  generateTypography(options.typography, options.output);
  generateSpacing(options.spacing, options.output);
  generateRadius(options.radius, options.output);
  generateShadows(options.shadows, options.output);
  generateMotion(options.motions, options.output);
  generateLayout(options.layout, options.output);
  generateGrid(options.grid, options.output);
  generateBorder(options.border, options.output);
}
