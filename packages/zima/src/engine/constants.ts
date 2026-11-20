/** How far a sprite reaches from the flake's center, in radii, so strokes and glyphs that overshoot aren't cut off. */
export const SPRITE_EXTENT = 1.25;

/**
 * One second minus 10% slack, so a 30 fps cap on a 60 Hz display draws every other frame instead of every third. The
 * default cap of 100 draws every frame on displays up to 110 Hz and skips frames on faster ones.
 */
export const SLACKED_SECOND_MS = 900;

// A canvas is a replaced element, so inset alone wouldn't stretch it.
const FILL_STYLE = "inset:0;width:100%;height:100%;pointer-events:none;";
export const CONTAINER_CANVAS_STYLE: string = `${FILL_STYLE}position:absolute`;
export const PAGE_CANVAS_STYLE: string = `${FILL_STYLE}position:fixed;z-index:9999`;
