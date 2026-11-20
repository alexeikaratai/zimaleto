import type { PlaygroundOptions } from "../../options";
import { AREA_PER_DENSITY_UNIT, NO_VALUE } from "./constants";
import type { CanvasSize } from "./types";

/** A whole number with thousands separators, such as 12,000. */
export function formatCount(count: number): string {
    return Math.round(count).toLocaleString("en-US");
}

/** A duration in ms, such as 8.3 ms. */
export function formatMs(milliseconds: number, digits = 1): string {
    return `${milliseconds.toFixed(digits)} ms`;
}

/** How many flakes fall: the count, or what the density gives on the canvas, once the canvas has a size. */
export function describeFlakes({ count, density }: PlaygroundOptions, { cssWidth, cssHeight }: CanvasSize): string {
    if (density === undefined) {
        return formatCount(count);
    }

    return cssWidth ? formatCount((density * cssWidth * cssHeight) / AREA_PER_DENSITY_UNIT) : NO_VALUE;
}

/** The canvas bitmap's size in device px and megapixels, once it has one. */
export function describeCanvas({ bitmapWidth, bitmapHeight }: CanvasSize): string {
    const megapixels = (bitmapWidth * bitmapHeight) / 1_000_000;

    return bitmapWidth ? `${bitmapWidth} × ${bitmapHeight} px, ${megapixels.toFixed(1)} MP` : NO_VALUE;
}
