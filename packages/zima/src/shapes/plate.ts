import { drawAround, styleStroke, traceHexagon } from "./drawing";
import type { Shape } from "./shape";

const FILL_OPACITY = 0.35;
const LINE_WIDTH = 0.07;

/** A hexagonal ice plate: a translucent body with an opaque outline and ridges from the center to the corners. */
export const plate: Shape = (context, radius) => {
    context.beginPath();
    traceHexagon(context, radius);
    context.globalAlpha = FILL_OPACITY;
    context.fill();
    context.globalAlpha = 1;

    drawAround(context, 6, () => {
        context.moveTo(0, 0);
        context.lineTo(radius, 0);
    });
    styleStroke(context, radius, LINE_WIDTH);
    context.stroke();
};
