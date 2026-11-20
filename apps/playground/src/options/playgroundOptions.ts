import { drift, type SnowOptions } from "@zimaleto/zima-react";
import { toShapes } from "./shapes";
import type { PlaygroundOptions } from "./types";

/**
 * The snow options for the playground state: the weights and the crystal count become the `shapes` list, and the drift
 * fields the `ground`.
 */
export function toSnowOptions(options: PlaygroundOptions): SnowOptions {
    const { shapeWeights, crystalCount, isDrifting, driftDepth, driftMelt, ...coreOptions } = options;
    // drift() returns plain data, so a new but equal value on every render doesn't reach the snowfall.
    const ground = isDrifting ? drift({ depth: driftDepth, melt: driftMelt }) : undefined;

    return { ...coreOptions, shapes: toShapes(shapeWeights, crystalCount), ground };
}
