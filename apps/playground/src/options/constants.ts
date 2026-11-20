import { bokeh, crystal, dendrite, dot, image, type Shape, star, text } from "@zimaleto/zima-react";
import type { ColorPreset, PlaygroundOptions, ShapeName, ShapeWeights } from "./types";

/** A soft glowing disc, to show that `image()` keeps the picture's own colors. */
const PICTURE_SOURCE = `data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><radialGradient id='glow'><stop offset='0' stop-color='#ffffff'/><stop offset='0.5' stop-color='#cfe8ff'/><stop offset='1' stop-color='#9ccfff' stop-opacity='0'/></radialGradient></defs><circle cx='16' cy='16' r='16' fill='url(#glow)'/></svg>",
)}`;

/** The shape behind every name but the generated crystals, which come as a set. */
export const SINGLE_SHAPES: Record<Exclude<ShapeName, "crystals">, Shape> = {
    dot,
    star,
    crystal,
    dendrite,
    bokeh,
    glyph: text("❄"),
    picture: image(PICTURE_SOURCE),
};

export const SHAPE_LABELS: Record<ShapeName, string> = {
    dot: "Dot",
    star: "Star",
    crystal: "Crystal",
    dendrite: "Dendrite",
    bokeh: "Bokeh",
    crystals: "Generated crystals",
    glyph: "❄ as text",
    picture: "Picture",
};

export const SHAPE_NAMES: ShapeName[] = Object.keys(SHAPE_LABELS) as ShapeName[];

export const INITIAL_SHAPE_WEIGHTS: ShapeWeights = {
    dot: 1,
    star: 0,
    crystal: 0,
    dendrite: 0,
    bokeh: 0,
    crystals: 0,
    glyph: 0,
    picture: 0,
};

/** The core's defaults, spelled out so every control starts at the value the engine uses. */
export const INITIAL_OPTIONS: PlaygroundOptions = {
    shapeWeights: INITIAL_SHAPE_WEIGHTS,
    crystalCount: 8,
    isDrifting: false,
    driftDepth: 40,
    driftMelt: 0,
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

/** Color lists to pick from, each one a mood for the snow. */
export const COLOR_PRESETS: Record<ColorPreset, readonly string[]> = {
    Snow: ["#ffffff"],
    Ice: ["#ffffff", "#cfe8ff", "#9ccfff"],
    Aurora: ["#e0fff4", "#9effd8", "#b7a6ff"],
    Ember: ["#fff4e0", "#ffd38a", "#ff9f7a"],
};

export const PRESET_NAMES: ColorPreset[] = Object.keys(COLOR_PRESETS) as ColorPreset[];

const EVERY_SHAPE = Object.fromEntries(SHAPE_NAMES.map((name) => [name, 1])) as ShapeWeights;

/** The stress test: the defaults with 5,000 flakes of every shape in two colors. */
export const STRESS_OPTIONS: PlaygroundOptions = {
    ...INITIAL_OPTIONS,
    shapeWeights: EVERY_SHAPE,
    count: 5000,
    color: ["#ffffff", "#cfe8ff"],
};

/** The detailed shapes at a size where they read, with bokeh for depth. At the default size they would be dots. */
export const DETAILED_OPTIONS: PlaygroundOptions = {
    ...INITIAL_OPTIONS,
    shapeWeights: {
        ...INITIAL_SHAPE_WEIGHTS,
        dot: 0,
        dendrite: 1,
        bokeh: 1,
        crystals: 3,
    },
    count: 80,
    size: [6, 14],
    speed: [25, 60],
    rotation: [-40, 40],
    color: ["#ffffff", "#cfe8ff"],
};
