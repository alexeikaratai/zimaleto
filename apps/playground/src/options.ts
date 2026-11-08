import type { ReducedMotion } from "@zimaleto/zima";

/** Every option the playground controls, with ranges kept as `[min, max]` for the sliders. */
export type PlaygroundOptions = {
    count: number;
    density: number | undefined;
    size: [number, number];
    speed: [number, number];
    wind: number;
    gust: number;
    sway: [number, number];
    rotation: [number, number];
    opacity: [number, number];
    color: string[];
    parallax: boolean;
    fps: number | undefined;
    maxDpr: number;
    reducedMotion: ReducedMotion;
    pauseWhenHidden: boolean;
    seed: number | undefined;
};

/** Where the snow goes: over the whole page, inside an element, or onto a canvas. */
export type TargetMode = "page" | "container" | "canvas";

/** The core's defaults, spelled out so every control starts at the value the engine uses. */
export const INITIAL_OPTIONS: PlaygroundOptions = {
    count: 150,
    density: undefined,
    size: [2, 5],
    speed: [30, 80],
    wind: 0,
    gust: 0,
    sway: [5, 20],
    rotation: [-90, 90],
    opacity: [0.6, 1],
    color: ["#ffffff"],
    parallax: true,
    fps: undefined,
    maxDpr: 2,
    reducedMotion: "static",
    pauseWhenHidden: true,
    seed: undefined,
};

export type ColorPreset = "Snow" | "Ice" | "Aurora" | "Ember";

export const COLOR_PRESETS: Record<ColorPreset, readonly string[]> = {
    Snow: ["#ffffff"],
    Ice: ["#ffffff", "#cfe8ff", "#9ccfff"],
    Aurora: ["#e0fff4", "#9effd8", "#b7a6ff"],
    Ember: ["#fff4e0", "#ffd38a", "#ff9f7a"],
};
