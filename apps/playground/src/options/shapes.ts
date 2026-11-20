import { crystals, type Shape, type WeightedShape } from "@zimaleto/zima-react";
import { SHAPE_LABELS, SHAPE_NAMES, SINGLE_SHAPES } from "./constants";
import type { LabeledShape, ShapeName, ShapeWeights } from "./types";

/** The shapes behind a name: one shape, or `crystalCount` generated crystals. */
function shapesNamed(name: ShapeName, crystalCount: number): readonly Shape[] {
    return name === "crystals" ? crystals(crystalCount) : [SINGLE_SHAPES[name]];
}

/**
 * The `shapes` option for the weights: every shape with a weight above zero. The generated crystals share their
 * weight, so more of them make the snow more varied rather than more crystalline.
 */
export function toShapes(weights: ShapeWeights, crystalCount: number): WeightedShape[] {
    return SHAPE_NAMES.filter((name) => weights[name] > 0).flatMap((name) => {
        const shapes = shapesNamed(name, crystalCount);

        return shapes.map((shape) => ({ shape, weight: weights[name] / shapes.length }));
    });
}

/** Every shape with its name, each generated crystal on its own, for the gallery. */
export function labelShapes(crystalCount: number): LabeledShape[] {
    return SHAPE_NAMES.flatMap((name) =>
        shapesNamed(name, crystalCount).map((shape, index) => ({
            label: name === "crystals" ? `Generated ${index + 1}` : SHAPE_LABELS[name],
            shape,
        })),
    );
}
