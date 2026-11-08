/**
 * Draws one flake centered at (0, 0) with the given radius.
 * The engine sets `fillStyle` and `strokeStyle` to the flake's color beforehand and handles position,
 * rotation and opacity, so a shape only draws its outline. Any function with this signature works.
 */
export type Shape = ((context: CanvasRenderingContext2D, radius: number) => void) & {
    /** Resolves when the shape can draw, as `image()` does once its picture has loaded. Until then its flakes are skipped. */
    readonly ready?: Promise<unknown>;
};

/** A shape with a relative weight: weight 2 makes it twice as common as a shape with weight 1. */
export type WeightedShape = {
    shape: Shape;
    weight: number;
};
