import {
    bokeh,
    crystal,
    crystals,
    dendrite,
    dot,
    image,
    type Shape,
    star,
    text,
    type WeightedShape,
} from "@zimaleto/zima-react";

export type ShapeName = "dot" | "star" | "crystal" | "dendrite" | "bokeh" | "crystals" | "glyph" | "picture";

/** How common each shape is. A weight of 0 leaves the shape out. */
export type ShapeWeights = Record<ShapeName, number>;

/** A shape with the name the gallery shows for it. */
export type LabeledShape = {
    label: string;
    shape: Shape;
};

// A soft glowing disc, to show that image() keeps the picture's own colors.
const PICTURE_SOURCE = `data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><radialGradient id='glow'><stop offset='0' stop-color='#ffffff'/><stop offset='0.5' stop-color='#cfe8ff'/><stop offset='1' stop-color='#9ccfff' stop-opacity='0'/></radialGradient></defs><circle cx='16' cy='16' r='16' fill='url(#glow)'/></svg>",
)}`;

const SINGLE_SHAPES: Record<Exclude<ShapeName, "crystals">, Shape> = {
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

export const SHAPE_NAMES = Object.keys(SHAPE_LABELS) as ShapeName[];

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
