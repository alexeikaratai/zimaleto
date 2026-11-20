/** The color tiles fall back to when the snow has none, as the core does. */
export const FALLBACK_COLOR = "#ffffff";

/** How big a gallery tile is, in CSS px. */
export const TILE_SIZE = 60;
/** The radius a tile draws its shape at: sprites leave a quarter of the radius for strokes that overshoot, and so does the tile. */
export const TILE_RADIUS: number = TILE_SIZE / 2 / 1.25;
