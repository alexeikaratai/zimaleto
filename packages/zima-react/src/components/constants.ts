import type { CSSProperties } from "react";

/** Stretches the canvas over its box and lets clicks through. A canvas is a replaced element, so inset alone wouldn't. */
export const FILL_LAYOUT: CSSProperties = {
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
};

/** Keeps a fullscreen snowfall above the page's own layers. */
export const FULLSCREEN_Z_INDEX = 9999;
