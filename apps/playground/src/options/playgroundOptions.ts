import type { ReducedMotion, SnowOptions } from "@zimaleto/zima-react";
import { INITIAL_SHAPE_WEIGHTS, type ShapeWeights } from "./shapes";

/** Every option the playground controls, with ranges kept as `[min, max]` for the sliders. */
export type PlaygroundOptions = {
    shapeWeights: ShapeWeights;
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
    shapeWeights: INITIAL_SHAPE_WEIGHTS,
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

/** The snow options for the playground state: the weights become the `shapes` list. */
export function toSnowOptions(options: PlaygroundOptions, shapes: SnowOptions["shapes"]): SnowOptions {
    const { shapeWeights: _shapeWeights, ...coreOptions } = options;

    return { ...coreOptions, shapes };
}
