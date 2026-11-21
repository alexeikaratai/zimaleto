import type { Settings } from "../options";
import type { Flake, Random } from "../physics";

/** The sprite a flake is drawn with, or `undefined` while its shape isn't ready. */
export type FlakeSprite = (flake: Flake) => HTMLCanvasElement | undefined;

/**
 * A ground at work in one snowfall. It's internal: only the core's own grounds implement it, so it can change in any
 * release.
 */
export type GroundLayer = {
    /** Matches the canvas size in CSS px, its pixel ratio and the snow's settings. Runs on every refresh. */
    fit(width: number, height: number, pixelRatio: number, settings: Settings): void;
    /** Settles the flakes that reached the ground during a step of `elapsedMs`, and sends them back to the top. */
    settle(flakes: Flake[], elapsedMs: number, random: Random, spriteOf: FlakeSprite): void;
    /** Draws the ground behind the falling flakes, on a context without a transform. */
    draw(context: CanvasRenderingContext2D): void;
};

/**
 * What happens to flakes at the bottom of the canvas, such as `drift()`. Its contents are internal and can change in
 * any release.
 */
export type Ground = {
    /** Starts the ground for a snowfall, keeping what `previous` gathered if it's the same kind of ground. */
    start(previous: GroundLayer | undefined): GroundLayer;
};

/** Options for `drift()`. */
export type DriftOptions = {
    /**
     * The deepest the snow gets, in CSS px.
     * @defaultValue 40
     */
    depth?: number | undefined;
    /**
     * How fast the snow sinks, in CSS px per second. Melting works against the snowfall: a light snow with a fast melt
     * barely builds up, and the drift disappears once the snow stops.
     * @defaultValue 0
     */
    melt?: number | undefined;
};

/** The value `drift()` returns: its options as plain data, and the function that starts a drift from them. */
export type DriftGround = Ground & {
    depth: number;
    melt: number;
};

/** The drift as a picture: a canvas as wide as the snow's, tall enough for the deepest drift with flakes on top. */
export type DriftLayer = {
    canvas: HTMLCanvasElement;
    pixelRatio: number;
    /**
     * Fills a column from one depth of snow to another, in CSS px from the bottom, in the color of the flake that
     * brought it. The edges snap to whole pixels, so bands that meet leave no seam.
     */
    fill(column: number, from: number, to: number, color: string): void;
    /** Stamps a settled flake as it was drawn, turned and faded, centered `lift` CSS px above the bottom. */
    stamp(sprite: HTMLCanvasElement, flake: Flake, x: number, lift: number): void;
    /** Moves the picture down by `amount` CSS px of melting, a whole device pixel at a time. */
    sink(amount: number): void;
};

/** Reports that a column of the height map grew from one height to another, in CSS px. */
export type Growth = (column: number, from: number, to: number) => void;
