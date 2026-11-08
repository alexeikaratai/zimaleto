import { crystal, dot, image, type Shape, star, text, type WeightedShape } from "@zimaleto/zima-react";

export type ShapeName = "dot" | "star" | "crystal" | "glyph" | "picture";

/** How common each shape is. A weight of 0 leaves the shape out. */
export type ShapeWeights = Record<ShapeName, number>;

// A soft glowing disc, to show that image() keeps the picture's own colors.
const PICTURE_SOURCE = `data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><radialGradient id='glow'><stop offset='0' stop-color='#ffffff'/><stop offset='0.5' stop-color='#cfe8ff'/><stop offset='1' stop-color='#9ccfff' stop-opacity='0'/></radialGradient></defs><circle cx='16' cy='16' r='16' fill='url(#glow)'/></svg>",
)}`;

export const SHAPES: Record<ShapeName, Shape> = {
    dot,
    star,
    crystal,
    glyph: text("❄"),
    picture: image(PICTURE_SOURCE),
};

export const SHAPE_LABELS: Record<ShapeName, string> = {
    dot: "Dot",
    star: "Star",
    crystal: "Crystal",
    glyph: "❄ as text",
    picture: "Picture",
};

export const SHAPE_NAMES = Object.keys(SHAPES) as ShapeName[];

export const INITIAL_SHAPE_WEIGHTS: ShapeWeights = {
    dot: 1,
    star: 0,
    crystal: 0,
    glyph: 0,
    picture: 0,
};

/** The `shapes` option for the weights: every shape with a weight above zero. */
export function toShapes(weights: ShapeWeights): WeightedShape[] {
    return SHAPE_NAMES.filter((name) => weights[name] > 0).map((name) => ({
        shape: SHAPES[name],
        weight: weights[name],
    }));
}
