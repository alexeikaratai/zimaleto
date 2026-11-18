import type { Settings } from "../options/settings";
import type { Flake } from "../physics/flake";
import type { Random } from "../physics/random";

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
