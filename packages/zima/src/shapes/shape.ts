/**
 * Draws one flake centered at (0, 0) with the given radius in CSS px.
 * The engine sets `fillStyle` and `strokeStyle` to the flake's color and handles position,
 * rotation and opacity, so a shape only draws its outline.
 */
export type Shape = (context: CanvasRenderingContext2D, radius: number) => void;
