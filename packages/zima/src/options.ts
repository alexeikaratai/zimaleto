import type { Bounds } from "./random";

/** A fixed value, or a `[min, max]` range from which each flake picks its own random value. */
export type Range = number | [min: number, max: number];

/**
 * What the snow does when the OS asks for reduced motion:
 * `"static"` draws one still frame, `"reduce"` keeps half the flakes at half the speed
 * without spin or gusts, and `"ignore"` animates as usual.
 */
export type ReducedMotion = "static" | "reduce" | "ignore";

/** Options for `createSnow()` and `snow.update()`. Every field is optional. */
export type SnowOptions = {
    /**
     * Number of flakes. Ignored when `density` is set.
     * @defaultValue 150
     */
    count?: number;
    /** Flakes per 100×100 CSS px, recomputed when the canvas resizes. Takes precedence over `count`. */
    density?: number;
    /**
     * Flake radius in CSS px.
     * @defaultValue [2, 5]
     */
    size?: Range;
    /**
     * Fall speed in px/s.
     * @defaultValue [30, 80]
     */
    speed?: Range;
    /**
     * Constant horizontal drift in px/s. Negative values blow to the left.
     * @defaultValue 0
     */
    wind?: number;
    /**
     * Amplitude of smooth wind variation over time, in px/s.
     * @defaultValue 0
     */
    gust?: number;
    /**
     * Amplitude of each flake's horizontal wobble, in px.
     * @defaultValue [5, 20]
     */
    sway?: Range;
    /**
     * Spin in degrees per second. `0` turns rotation off.
     * @defaultValue [-90, 90]
     */
    rotation?: Range;
    /**
     * Flake opacity, from 0 to 1.
     * @defaultValue [0.6, 1]
     */
    opacity?: Range;
    /**
     * One CSS color, or a list from which each flake picks one at random.
     * @defaultValue "#fff"
     */
    color?: string | string[];
    /**
     * Bigger flakes fall faster and are more opaque, which gives a sense of depth.
     * @defaultValue true
     */
    parallax?: boolean;
    /** Frame-rate cap. Unset means the display refresh rate. */
    fps?: number;
    /**
     * Upper limit on `devicePixelRatio`, to protect performance on dense screens.
     * @defaultValue 2
     */
    maxDpr?: number;
    /**
     * What to do when the OS asks for reduced motion. Changes to the OS setting apply live.
     * @defaultValue "static"
     */
    reducedMotion?: ReducedMotion;
    /**
     * Pause while the tab is hidden or the canvas is off-screen.
     * @defaultValue true
     */
    pauseWhenHidden?: boolean;
    /** Seeds the random generator, so runs are reproducible in tests and screenshots. */
    seed?: number;
};

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
    parallax: boolean;
    fps: number | undefined;
    maxDpr: number;
    reducedMotion: ReducedMotion;
    pauseWhenHidden: boolean;
    seed: number | undefined;
};

const AREA_PER_DENSITY_UNIT = 100 * 100;

function finite(value: number | undefined, fallback: number): number {
    return Number.isFinite(value) ? (value as number) : fallback;
}

function positive<Fallback>(value: number | undefined, fallback: Fallback): number | Fallback {
    return (value ?? 0) > 0 ? (value as number) : fallback;
}

function toBounds(range: Range | undefined, fallback: Bounds, floor = -Infinity, ceiling = Infinity): Bounds {
    const [first, second] = typeof range === "number" ? [range, range] : (range ?? fallback);
    const low = Math.min(Math.max(finite(first, fallback[0]), floor), ceiling);
    const high = Math.min(Math.max(finite(second, fallback[1]), floor), ceiling);

    return low <= high ? [low, high] : [high, low];
}

/** Fills in defaults and repairs bad input such as negative counts or ranges with min above max. A key set to `undefined` gets its default. */
export function normalizeOptions(options: SnowOptions): Settings {
    const { density } = options;
    const colors = [options.color].flat().filter(Boolean) as string[];

    return {
        count: Math.max(0, Math.round(finite(options.count, 150))),
        density: Number.isFinite(density) ? Math.max(0, density as number) : undefined,
        size: toBounds(options.size, [2, 5], 0),
        speed: toBounds(options.speed, [30, 80], 0),
        wind: finite(options.wind, 0),
        gust: Math.max(0, finite(options.gust, 0)),
        sway: toBounds(options.sway, [5, 20], 0),
        rotation: toBounds(options.rotation, [-90, 90]),
        opacity: toBounds(options.opacity, [0.6, 1], 0, 1),
        colors: colors.length > 0 ? colors : ["#fff"],
        parallax: options.parallax ?? true,
        fps: positive(options.fps, undefined),
        maxDpr: positive(options.maxDpr, 2),
        reducedMotion: options.reducedMotion ?? "static",
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
