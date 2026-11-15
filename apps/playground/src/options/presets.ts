import { INITIAL_OPTIONS, type PlaygroundOptions } from "./playgroundOptions";

/** The stress test: the defaults with 5,000 flakes of every shape in two colors. */
export const STRESS_OPTIONS: PlaygroundOptions = {
    ...INITIAL_OPTIONS,
    shapeWeights: { dot: 1, star: 1, crystal: 1, glyph: 1, picture: 1 },
    count: 5000,
    color: ["#ffffff", "#cfe8ff"],
};
