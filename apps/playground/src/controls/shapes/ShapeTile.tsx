import type { Shape } from "@zimaleto/zima-react";
import { type ReactElement, useEffect, useRef } from "react";
import { TILE_SIZE } from "./constants";
import { paintShape } from "./paintShape";

export type ShapeTileProps = {
    label: string;
    shape: Shape;
    color: string;
};

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
