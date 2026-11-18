import { SPRITE_EXTENT } from "../engine/sprites";
import type { Flake } from "../physics/flake";
import { COLUMN_WIDTH } from "./heightMap";

/** The drift as a picture: a canvas as wide as the snow's, tall enough for the deepest drift with flakes on top. */
export type DriftLayer = {
    canvas: HTMLCanvasElement;
    pixelRatio: number;
    /**
     * Fills a column from one depth of snow to another, in CSS px from the bottom, in the color of the flake that
     * brought it. The edges snap to whole pixels, so bands that meet leave no seam.
     */
    fill(column: number, from: number, to: number, color: string): void;
    /** Stamps a settled flake as it was drawn, turned and faded, centered `lift` CSS px above the bottom. */
    stamp(sprite: HTMLCanvasElement, flake: Flake, x: number, lift: number): void;
    /** Moves the picture down by `amount` CSS px of melting, a whole device pixel at a time. */
    sink(amount: number): void;
};

/**
 * A layer for a canvas `width` CSS px wide and `height` CSS px of drift. It keeps the picture of `previous`, stretched
 * to the new width and pixel ratio and kept on the bottom, just as flakes keep their place when the canvas resizes.
 */
export function createDriftLayer(width: number, height: number, pixelRatio: number, previous?: DriftLayer): DriftLayer {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.ceil(height * pixelRatio);
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    // Melting not yet shown, in device px.
    let unsunk = 0;

    // drawImage() throws on an empty canvas, which a hidden one has.
    if (previous?.canvas.width) {
        const scaledHeight = (previous.canvas.height * pixelRatio) / previous.pixelRatio;
        context.drawImage(previous.canvas, 0, canvas.height - scaledHeight, canvas.width, scaledHeight);
    }

    function toPixels(cssPx: number): number {
        return Math.round(cssPx * pixelRatio);
    }

    return {
        canvas,
        pixelRatio,
        fill(column, from, to, color) {
            const left = toPixels(column * COLUMN_WIDTH);
            const top = toPixels(height - to);
            context.fillStyle = color;
            context.fillRect(left, top, toPixels((column + 1) * COLUMN_WIDTH) - left, toPixels(height - from) - top);
        },
        stamp(sprite, flake, x, lift) {
            const cos = Math.cos(flake.angle) * pixelRatio;
            const sin = Math.sin(flake.angle) * pixelRatio;
            const extent = flake.radius * SPRITE_EXTENT;

            // Restored afterwards, because the bands are filled without a transform and fully opaque.
            context.save();
            context.setTransform(cos, sin, -sin, cos, x * pixelRatio, (height - lift) * pixelRatio);
            context.globalAlpha = flake.opacity;
            context.drawImage(sprite, -extent, -extent, extent * 2, extent * 2);
            context.restore();
        },
        sink(amount) {
            unsunk += amount * pixelRatio;
            const pixels = Math.floor(unsunk);

            if (pixels > 0 && canvas.width) {
                unsunk -= pixels;
                // "copy" replaces the whole picture, so the rows the shift uncovers at the top come out clear.
                context.globalCompositeOperation = "copy";
                context.drawImage(canvas, 0, pixels);
                context.globalCompositeOperation = "source-over";
            }
        },
    };
}
