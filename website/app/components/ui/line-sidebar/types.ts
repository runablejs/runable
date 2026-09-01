import type { ResolvedPageEntry } from "v-content";

/** Falloff curve applied to cursor proximity. */
export type LineSidebarFalloff = 'linear' | 'smooth' | 'sharp';

export type LineSidebarItem = ResolvedPageEntry["toc"][number];

/**
 * Props for the LineSidebar registry component.
 */
export interface LineSidebarProps {
  /** Page table-of-contents entries, top to bottom. */
  items: ResolvedPageEntry["toc"];
  /** Color items and markers blend toward near the cursor / when active. */
  accentColor?: string;
  /** Resting label color. */
  textColor?: string;
  /** Resting marker/tick color. */
  markerColor?: string;
  /** Show the 01/02/… index before each label. */
  showIndex?: boolean;
  /** Show the horizontal marker line beside each item. */
  showMarker?: boolean;
  /** Distance (px) within which items react to the cursor. */
  proximityRadius?: number;
  /** Max horizontal shift (px) at full proximity. */
  maxShift?: number;
  /** Proximity falloff curve. */
  falloff?: LineSidebarFalloff;
  /** Marker line length (px). */
  markerLength?: number;
  /** Gap between marker and label (px). */
  markerGap?: number;
  /** Length ratio of the in-between ticks relative to markers. */
  tickScale?: number;
  /** Grow the in-between ticks with cursor proximity too. */
  scaleTick?: boolean;
  /** Vertical gap between items (px). */
  itemGap?: number;
  /** Label font size (rem). */
  fontSize?: number;
  /** Exponential smoothing time constant (ms). */
  smoothing?: number;
  /** Additional classes on the root element. */
  class?: string;
}
