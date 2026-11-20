/** How wide a column of the height map is, in CSS px. */
export const COLUMN_WIDTH = 4;
/** The most a column may rise above its neighbor, in CSS px: about 27°, the gentle slope of settled powder. */
export const MAX_RISE = 2;
/**
 * How much snow a flake brings, in column-px per px² of its radius. The default snowfall over a 1440 × 900 page lands
 * about 14 flakes a second, which fills the default 40 px drift in about a minute.
 */
export const GROWTH = 2;

/** The deepest a drift gets by default, in CSS px. */
export const DEFAULT_DEPTH = 40;
/** Room above the deepest drift for the flakes stamped on top, in radii of the largest flake. */
export const STAMP_ROOM = 2;
/** How far a stamped flake sits above the surface, in radii: mostly on top, a little sunk in. */
export const STAMP_LIFT = 0.3;
