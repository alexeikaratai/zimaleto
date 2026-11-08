import type { Bounds } from "../options/settings";

/** Returns a number in [0, 1). */
export type Random = () => number;

/** mulberry32: a tiny seedable generator with a full 2^32 period. */
export function createRandom(seed: number): Random {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let value = Math.imul(state ^ (state >>> 15), state | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

        return ((value ^ (value >>> 14)) >>> 0) / 2 ** 32;
    };
}

/** The point at `amount` (0 to 1) between the bounds. */
export function between([min, max]: Bounds, amount: number): number {
    return min + (max - min) * amount;
}
