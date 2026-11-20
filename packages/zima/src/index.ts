import { BROWSER_CLOCK, createEngine, type Snow } from "./engine";
import type { SnowOptions } from "./options";

export type { Snow } from "./engine";
export { type DriftOptions, drift, type Ground, type GroundLayer } from "./ground";
export type { Range, ReducedMotion, SnowOptions } from "./options";
export {
    bokeh,
    crystal,
    crystals,
    dendrite,
    dot,
    image,
    type Shape,
    star,
    text,
    type WeightedShape,
} from "./shapes";

/**
 * Starts a snowfall over the whole page: a fixed canvas that covers the viewport
 * and lets clicks through. The animation starts right away.
 *
 * @example
 * const snow = createSnow({ count: 200, wind: 15 });
 */
export function createSnow(options?: SnowOptions): Snow;
/**
 * Starts a snowfall inside an element, by adding a canvas that fills it, or on a `<canvas>` of your own.
 * A statically positioned element becomes `position: relative` until `destroy()`.
 * A canvas of your own needs a CSS size; one without it keeps the size it had.
 *
 * @example
 * const snow = createSnow(heroElement, { density: 0.5 });
 */
export function createSnow(target: HTMLElement, options?: SnowOptions): Snow;
export function createSnow(targetOrOptions?: HTMLElement | SnowOptions, options?: SnowOptions): Snow {
    if (targetOrOptions && "nodeType" in targetOrOptions) {
        return createEngine(targetOrOptions, options ?? {}, BROWSER_CLOCK);
    }

    return createEngine(undefined, targetOrOptions ?? {}, BROWSER_CLOCK);
}
