import type { ReducedMotion, Shape } from "@zimaleto/zima-react";

export type ShapeName = "dot" | "star" | "crystal" | "dendrite" | "bokeh" | "crystals" | "glyph" | "picture";

/** How common each shape is. A weight of 0 leaves the shape out. */
export type ShapeWeights = Record<ShapeName, number>;

/** A shape with the name the gallery shows for it. */
export type LabeledShape = {
    label: string;
    shape: Shape;
};

export type ColorPreset = "Snow" | "Ice" | "Aurora" | "Ember";

/** Every option the playground controls, with ranges kept as `[min, max]` for the sliders. */
export type PlaygroundOptions = {
    shapeWeights: ShapeWeights;
    crystalCount: number;
    isDrifting: boolean;
    driftDepth: number;
    driftMelt: number;
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
