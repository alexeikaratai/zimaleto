import { drawAround } from "./drawing";
import type { Shape } from "./shape";

const HALF_WIDTH = 0.1;
// Where the faces start to narrow to the points.
const SHOULDER = 0.7;

/** A thin ice column with pointed ends, which twirls as it falls. */
export const needle: Shape = (context, radius) => {
    // At least a pixel across, so a small needle doesn't fade.
    const halfWidth = Math.max(0.5, radius * HALF_WIDTH);

    context.beginPath();
    drawAround(context, 2, () => {
        context.lineTo(radius, 0);
        context.lineTo(radius * SHOULDER, halfWidth);
        context.lineTo(-radius * SHOULDER, halfWidth);
    });
    context.fill();
};
