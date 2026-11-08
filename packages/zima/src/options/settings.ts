import { dot } from "../shapes/dot";
import type { WeightedShape } from "../shapes/shape";
import type { Range, ReducedMotion, SnowOptions } from "./snowOptions";

/** Inclusive `[min, max]` bounds with `min <= max`. */
export type Bounds = [min: number, max: number];

/** Options with defaults applied and bad input fixed. */
export type Settings = {
    count: number;
    density: number | undefined;
    size: Bounds;
    speed: Bounds;
    wind: number;
    gust: number;
    sway: Bounds;
    rotation: Bounds;
    opacity: Bounds;
    colors: string[];
    shapes: WeightedShape[];
    parallax: boolean;
    /** Frame-rate cap, or 0 for none. */
    fps: number;
    maxDpr: number;
    reducedMotion: ReducedMotion;
    pauseWhenHidden: boolean;
    seed: number | undefined;
};

const AREA_PER_DENSITY_UNIT = 100 * 100;

function finiteOr(value: number | undefined, fallback: number): number {
    return Number.isFinite(value) ? (value as number) : fallback;
}

function positiveOr(value: number | undefined, fallback: number): number {
    return (value ?? 0) > 0 ? (value as number) : fallback;
}

function clamp(value: number, floor: number, ceiling: number): number {
    return Math.min(Math.max(value, floor), ceiling);
}

function toBounds(range: Range | undefined, fallback: Bounds, floor = -Infinity, ceiling = Infinity): Bounds {
    const [first, second] = typeof range === "number" ? [range, range] : (range ?? fallback);
    const low = clamp(finiteOr(first, fallback[0]), floor, ceiling);
    const high = clamp(finiteOr(second, fallback[1]), floor, ceiling);

    return low <= high ? [low, high] : [high, low];
}

function toColors(color: SnowOptions["color"]): string[] {
    const colors = [color].flat().filter(Boolean) as string[];

    return colors.length > 0 ? colors : ["#fff"];
}

// A plain shape weighs 1. Shapes without a finite positive weight are dropped, and the dot stands in if none is left.
function toWeightedShapes(shapes: SnowOptions["shapes"]): WeightedShape[] {
    const weighted = [shapes ?? dot]
        .flat()
        .map((entry) => (typeof entry === "function" ? { shape: entry, weight: 1 } : entry))
        .filter(({ weight }) => Number.isFinite(weight) && weight > 0);

    return weighted.length > 0 ? weighted : [{ shape: dot, weight: 1 }];
}

// An unknown mode, which only plain JavaScript can pass, falls back to the accessible default.
function toReducedMotion(mode: SnowOptions["reducedMotion"]): ReducedMotion {
    return mode === "reduce" || mode === "ignore" ? mode : "static";
}

/** Fills in defaults and repairs bad input such as negative counts or ranges with min above max. A key set to `undefined` gets its default. */
export function normalizeOptions(options: SnowOptions): Settings {
    const { density } = options;

    return {
        count: Math.max(0, Math.round(finiteOr(options.count, 150))),
        density: Number.isFinite(density) ? Math.max(0, density as number) : undefined,
        size: toBounds(options.size, [2, 5], 0),
        speed: toBounds(options.speed, [30, 80], 0),
        wind: finiteOr(options.wind, 0),
        gust: Math.max(0, finiteOr(options.gust, 0)),
        sway: toBounds(options.sway, [5, 20], 0),
        rotation: toBounds(options.rotation, [-90, 90]),
        opacity: toBounds(options.opacity, [0.6, 1], 0, 1),
        colors: toColors(options.color),
        shapes: toWeightedShapes(options.shapes),
        parallax: options.parallax ?? true,
        fps: positiveOr(options.fps, 0),
        maxDpr: positiveOr(options.maxDpr, 2),
        reducedMotion: toReducedMotion(options.reducedMotion),
        pauseWhenHidden: options.pauseWhenHidden ?? true,
        seed: options.seed,
    };
}

/** The `reducedMotion: "reduce"` variant: half the flakes at half the speed, without spin or gusts. */
export function reduceMotion(settings: Settings): Settings {
    const { count, density, speed } = settings;

    return {
        ...settings,
        count: Math.round(count / 2),
        density: density === undefined ? undefined : density / 2,
        speed: [speed[0] / 2, speed[1] / 2],
        rotation: [0, 0],
        gust: 0,
    };
}

/** How many flakes a canvas of the given CSS size holds. */
export function countFlakes(settings: Settings, width: number, height: number): number {
    const { count, density } = settings;

    return density === undefined ? count : Math.round((density * width * height) / AREA_PER_DENSITY_UNIT);
}
