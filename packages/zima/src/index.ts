import { type Clock, createEngine, type Snow } from "./engine";
import type { SnowOptions } from "./options";

export type { Snow } from "./engine";
export type { Range, ReducedMotion, SnowOptions } from "./options";
export { crystal } from "./shapes/crystal";
export { dot } from "./shapes/dot";
export { image } from "./shapes/image";
export type { Shape, WeightedShape } from "./shapes/shape";
export { star } from "./shapes/star";
export { text } from "./shapes/text";

const BROWSER_CLOCK: Clock = {
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
};

/**
 * Starts a snowfall over the whole page: a fixed canvas that covers the viewport
 * and lets clicks through. The animation starts right away.
 *
 * @example
 * const snow = createSnow({ count: 200, wind: 15 });
 */
export function createSnow(options?: SnowOptions): Snow;
/**
 * Starts a snowfall on a `<canvas>`, or inside any other element by adding a canvas that fills it.
 * A statically positioned element becomes `position: relative` until `destroy()`.
 *
 * @example
 * const snow = createSnow(document.querySelector(".hero"), { density: 0.5 });
 */
export function createSnow(target: HTMLElement, options?: SnowOptions): Snow;
export function createSnow(targetOrOptions?: HTMLElement | SnowOptions, options?: SnowOptions): Snow {
    return targetOrOptions && "nodeType" in targetOrOptions
        ? createEngine(targetOrOptions, options ?? {}, BROWSER_CLOCK)
        : createEngine(undefined, targetOrOptions ?? {}, BROWSER_CLOCK);
}
