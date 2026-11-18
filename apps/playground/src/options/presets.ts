import { INITIAL_OPTIONS, type PlaygroundOptions } from "./playgroundOptions";
import { INITIAL_SHAPE_WEIGHTS, SHAPE_NAMES, type ShapeWeights } from "./shapes";

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
