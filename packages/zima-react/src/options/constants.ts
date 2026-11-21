import type { SnowfallOptions } from "./types";

/**
 * Props with these names configure the snowfall; every other prop goes to the canvas.
 * The type fails the build when the core gains an option that isn't listed here.
 */
export const OPTION_NAMES: Record<keyof SnowfallOptions, true> = {
    count: true,
    density: true,
    size: true,
    speed: true,
    wind: true,
    gust: true,
    sway: true,
    rotation: true,
    opacity: true,
    color: true,
    shapes: true,
    ground: true,
    parallax: true,
    fps: true,
    maxDpr: true,
    reducedMotion: true,
    pauseWhenHidden: true,
    seed: true,
    paused: true,
};
