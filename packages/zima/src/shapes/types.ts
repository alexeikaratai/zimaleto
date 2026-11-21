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

/** How a stellar crystal looks. Lengths are shares of the radius. */
export type StellarDesign = {
    /** How wide each arm is at the center. Arms and branches narrow towards their ends. */
    armWidth: number;
    branchPairs: number;
    /** Where the first pair of side branches leaves the arm. The others follow at equal gaps towards the tip. */
    branchStart: number;
    /** How long the first side branches are. The others shorten towards the tip. */
    branchLength: number;
    /** How far the corners of a hexagonal ring around the center reach, or 0 for none. */
    ringSize: number;
};
