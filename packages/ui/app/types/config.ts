import type { tv } from "tailwind-variants";

import type { BorderConfig } from "../generaors/border.js";
import type { ColorConfig } from "../generaors/colors.js";
import type { GridConfig } from "../generaors/grid.js";
import type { LayoutConfig } from "../generaors/layout.js";
import type { MotionConfig } from "../generaors/motion.js";
import type { RadiusConfig } from "../generaors/radius.js";
import type { ShadowsConfig } from "../generaors/shadows.js";
import type { SpacingConfig } from "../generaors/spacing.js";
import type { TypographyConfig } from "../generaors/typography.js";

export interface SyoraUITokensConfig {
  colors?: ColorConfig;
  typography?: TypographyConfig;
  spacing?: SpacingConfig;
  radius?: RadiusConfig;
  shadows?: ShadowsConfig;
  motions?: MotionConfig;
  layout?: LayoutConfig;
  grid?: GridConfig;
  border?: BorderConfig;
}

export interface SyoraUIConfig {
  tokens?: SyoraUITokensConfig;

  ui?: Record<string, Parameters<typeof tv>["0"]>;
}
