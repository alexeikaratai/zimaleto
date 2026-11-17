import type { Shape } from "@zimaleto/zima-react";
import { type ReactElement, useEffect, useRef } from "react";

export type ShapeTileProps = {
    label: string;
    shape: Shape;
    color: string;
};

const TILE_SIZE = 60;
// Sprites leave a quarter of the radius for strokes that overshoot, and so does the tile.
const TILE_RADIUS = TILE_SIZE / 2 / 1.25;

function paintShape(canvas: HTMLCanvasElement, shape: Shape, color: string): void {
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

/** One shape drawn large in the snow's first color, once it's ready to draw. */
export function ShapeTile({ label, shape, color }: ShapeTileProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(
        function drawWhenReady() {
            const canvas = canvasRef.current as HTMLCanvasElement;
            let isCurrent = true;

            function paintIfCurrent(): void {
                if (isCurrent) {
                    paintShape(canvas, shape, color);
                }
            }

            // A picture that fails to load leaves its tile empty, as it leaves the snow without its flakes.
            Promise.resolve(shape.ready).then(paintIfCurrent, () => undefined);

            return () => {
                isCurrent = false;
            };
        },
        [shape, color],
    );

    return (
        <figure className="shape-tile">
            <canvas
                ref={canvasRef}
                role="img"
                aria-label={label}
                style={{ width: TILE_SIZE, height: TILE_SIZE }}
            />
            <figcaption aria-hidden>{label}</figcaption>
        </figure>
    );
}
