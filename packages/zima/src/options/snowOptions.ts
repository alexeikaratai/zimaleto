import type { Shape, WeightedShape } from "../shapes/shape";

/** A fixed value, or a `[min, max]` range from which each flake picks its own random value. */
export type Range = number | readonly [min: number, max: number];

/**
 * What the snow does when the OS asks for reduced motion:
 * `"static"` draws one still frame, `"reduce"` keeps half the flakes at half the speed
 * without spin or gusts, and `"ignore"` animates as usual.
 */
export type ReducedMotion = "static" | "reduce" | "ignore";

/** Options for `createSnow()` and `snow.update()`. Every field is optional, and `undefined` means the default. */
export type SnowOptions = {
    /**
     * Number of flakes. Ignored when `density` is set.
     * @defaultValue 150
     */
    count?: number | undefined;
    /** Flakes per 100×100 CSS px, recomputed when the canvas resizes. Takes precedence over `count`. */
    density?: number | undefined;
    /**
     * Flake radius in CSS px.
     * @defaultValue [2, 5]
     */
    size?: Range | undefined;
    /**
     * Fall speed in px/s.
     * @defaultValue [30, 80]
     */
    speed?: Range | undefined;
    /**
     * Constant horizontal drift in px/s. Negative values blow to the left.
     * @defaultValue 0
     */
    wind?: number | undefined;
    /**
     * Amplitude of smooth wind variation over time, in px/s.
     * @defaultValue 0
     */
    gust?: number | undefined;
    /**
     * Amplitude of each flake's horizontal wobble, in px.
     * @defaultValue [5, 20]
     */
    sway?: Range | undefined;
    /**
     * Spin in degrees per second. `0` turns rotation off.
     * @defaultValue [-90, 90]
     */
    rotation?: Range | undefined;
    /**
     * Flake opacity, from 0 to 1.
     * @defaultValue [0.6, 1]
     */
    opacity?: Range | undefined;
    /**
     * One CSS color, or a list from which each flake picks one at random.
     * @defaultValue "#fff"
     */
    color?: string | readonly string[] | undefined;
    /**
     * Shape variants. Each flake picks one, in proportion to its weight (1 when not given).
     * Shapes compare by identity, so create custom ones once rather than on every call.
     * @defaultValue [dot]
     */
    shapes?: Shape | ReadonlyArray<Shape | WeightedShape> | undefined;
    /**
     * Bigger flakes fall faster and are more opaque, which gives a sense of depth.
     * @defaultValue true
     */
    parallax?: boolean | undefined;
    /** Frame-rate cap. Unset means the display refresh rate. */
    fps?: number | undefined;
    /**
     * Upper limit on `devicePixelRatio`, to protect performance on dense screens.
     * @defaultValue 2
     */
    maxDpr?: number | undefined;
    /**
     * What to do when the OS asks for reduced motion. Changes to the OS setting apply live.
     * @defaultValue "static"
     */
    reducedMotion?: ReducedMotion | undefined;
    /**
     * Pause while the tab is hidden or the canvas is off-screen.
     * @defaultValue true
     */
    pauseWhenHidden?: boolean | undefined;
    /** Seeds the random generator, so runs are reproducible in tests and screenshots. */
    seed?: number | undefined;
};
