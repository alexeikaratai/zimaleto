/**
 * Draws one flake centered at (0, 0) with the given radius. Any function with this signature works.
 *
 * The engine sets `fillStyle` and `strokeStyle` to the flake's color beforehand and handles position, rotation and
 * opacity. It draws each shape once per color into a cached sprite, so drawing that changes over time won't animate,
 * and anything beyond 1.25 × the radius is cut off.
 */
export type Shape = ((context: CanvasRenderingContext2D, radius: number) => void) & {
    /**
     * Resolves when the shape can draw, as `image()` does once its picture has loaded.
     * Until then its flakes are skipped, and if it rejects they're never drawn.
     */
    readonly ready?: Promise<unknown>;
};

/** A shape with a relative weight: weight 2 makes it twice as common as a shape with weight 1. */
export type WeightedShape = {
    shape: Shape;
    weight: number;
};
