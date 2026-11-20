import type { Shape } from "@zimaleto/zima-react";
import { TILE_RADIUS, TILE_SIZE } from "./constants";

/** Draws a shape in the middle of a tile's canvas, in one color, at the screen's pixel ratio. */
export function paintShape(canvas: HTMLCanvasElement, shape: Shape, color: string): void {
    const pixelRatio = window.devicePixelRatio;
    const center = (TILE_SIZE / 2) * pixelRatio;
    // Setting the size also clears the canvas and resets its state.
    canvas.width = TILE_SIZE * pixelRatio;
    canvas.height = TILE_SIZE * pixelRatio;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, center, center);
    context.fillStyle = color;
    context.strokeStyle = color;
    shape(context, TILE_RADIUS);
}
