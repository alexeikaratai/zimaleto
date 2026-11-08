import type { Shape } from "../shapes/shape";

/** How far a sprite reaches from the flake's center, in radii, so strokes and glyphs that overshoot aren't cut off. */
export const SPRITE_EXTENT = 1.25;

/** The sprite for a shape and color, or `undefined` while the shape isn't ready. */
export type SpriteLookup = (shape: Shape, color: string, radius: number) => HTMLCanvasElement | undefined;

/**
 * Draws a shape once, in one color, onto a canvas that every frame then copies from.
 *
 * @param radius - The largest flake radius, in device px.
 */
export function renderSprite(shape: Shape, color: string, radius: number): HTMLCanvasElement {
    // At least one pixel: drawImage() throws on an empty canvas.
    const half = Math.max(1, Math.ceil(radius * SPRITE_EXTENT));
    const sprite = document.createElement("canvas");
    sprite.width = half * 2;
    sprite.height = half * 2;

    const context = sprite.getContext("2d") as CanvasRenderingContext2D;
    context.translate(half, half);
    context.fillStyle = color;
    context.strokeStyle = color;
    // Frames map the whole sprite onto 1.25 radii, so the shape grows with the size rounded up to whole pixels.
    shape(context, half / SPRITE_EXTENT);

    return sprite;
}

/**
 * A cache with one sprite per shape and color, rendered on first use. Shapes whose `ready` promise is pending have
 * no sprite yet, and `onShapeReady` runs when one resolves. Reset the cache when the radius sprites need changes.
 */
export function createSpriteCache(onShapeReady: () => void): [lookup: SpriteLookup, reset: () => void] {
    let sprites = new Map<Shape, Map<string, HTMLCanvasElement>>();
    // Shapes with a `ready` promise: false until it resolves, and for good if it rejects.
    const readyShapes = new WeakMap<Shape, boolean>();

    function isReady(shape: Shape): boolean {
        const { ready } = shape;

        if (!ready) {
            return true;
        }

        if (!readyShapes.has(shape)) {
            readyShapes.set(shape, false);
            ready.then(
                () => {
                    readyShapes.set(shape, true);
                    onShapeReady();
                },
                () => undefined,
            );
        }

        return readyShapes.get(shape) === true;
    }

    function lookup(shape: Shape, color: string, radius: number): HTMLCanvasElement | undefined {
        let byColor = sprites.get(shape);
        if (!byColor) {
            byColor = new Map();
            sprites.set(shape, byColor);
        }

        let sprite = byColor.get(color);
        if (!sprite && isReady(shape)) {
            sprite = renderSprite(shape, color, radius);
            byColor.set(color, sprite);
        }

        return sprite;
    }

    function reset(): void {
        sprites = new Map();
    }

    return [lookup, reset];
}
