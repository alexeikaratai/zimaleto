import { COLUMN_WIDTH, GROWTH, MAX_RISE } from "./constants";
import type { Growth } from "./types";

/**
 * How sheltered a column is, from 0.45 to 1: the share of the snow it gathers and of the depth it holds. Two slow waves,
 * about 360 and 1,090 px long, shape the drift into gentle mounds instead of a flat band, as the lee of the wind would.
 */
export function shelterAt(column: number): number {
    return 0.725 + 0.275 * (0.6 * Math.sin(column * 0.07 + 1) + 0.4 * Math.sin(column * 0.023 + 2));
}

/**
 * A height map for a canvas `width` CSS px wide: the depth of the settled snow along the bottom, in CSS px, one value
 * per column, all of them zero.
 */
export function createHeightMap(width: number): number[] {
    return Array.from({ length: Math.ceil(width / COLUMN_WIDTH) }, () => 0);
}

// Lets `amount` of snow, at most MAX_RISE, roll downhill from `column` while landing there would make the slope steeper
// than the angle of repose, then piles it up where it stops. With at most MAX_RISE, every roll goes strictly downhill,
// so it ends.
function pileUp(heights: number[], column: number, amount: number, depth: number, onGrow: Growth): void {
    let target = column;

    for (;;) {
        const height = heights[target] as number;
        const left = heights[target - 1] ?? Number.POSITIVE_INFINITY;
        const right = heights[target + 1] ?? Number.POSITIVE_INFINITY;

        if (Math.min(left, right) + MAX_RISE >= height + amount) {
            const grown = Math.min(depth * shelterAt(target), height + amount);
            heights[target] = grown;
            onGrow(target, height, grown);

            return;
        }

        target += left < right ? -1 : 1;
    }
}

/**
 * Settles a flake of `radius` drawn at `x`: its snow spreads over the columns under it, more of it where they're
 * sheltered, and each part rolls down to where the slope stays within the angle of repose. No column grows past its
 * sheltered share of `depth`.
 */
export function settle(heights: number[], x: number, radius: number, depth: number, onGrow: Growth): void {
    const first = Math.max(0, Math.floor((x - radius) / COLUMN_WIDTH));
    const last = Math.min(heights.length - 1, Math.floor((x + radius) / COLUMN_WIDTH));
    const share = (radius * radius * GROWTH) / (last - first + 1);

    for (let column = first; column <= last; column += 1) {
        for (let remaining = share * shelterAt(column); remaining > 0; remaining -= MAX_RISE) {
            pileUp(heights, column, Math.min(remaining, MAX_RISE), depth, onGrow);
        }
    }
}

/** Lowers every column by `amount` CSS px, down to zero. */
export function melt(heights: number[], amount: number): void {
    heights.forEach((height, column) => {
        heights[column] = Math.max(0, height - amount);
    });
}

/** The heights stretched or squeezed to a canvas `width` CSS px wide, keeping the profile, and cut down to `depth`. */
export function resample(heights: number[], width: number, depth: number): number[] {
    const next = createHeightMap(width);

    // Each new column takes the old one under it; a map made while the canvas had no width gives zeros.
    return next.map((_value, column) => {
        const source = heights[Math.floor((column * heights.length) / next.length)] ?? 0;

        return Math.min(depth, source);
    });
}
