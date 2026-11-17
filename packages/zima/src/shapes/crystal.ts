import { drawAround, styleStroke } from "./drawing";
import type { Shape } from "./shape";

const ARMS = 6;
const LINE_WIDTH = 0.12;
const BRANCH_START = 0.55;
// The far end of a branch that leaves the arm at 45° and is 0.3 radii long.
const BRANCH_END_X = BRANCH_START + 0.3 * Math.SQRT1_2;
const BRANCH_END_Y = 0.3 * Math.SQRT1_2;

/** A six-armed ice crystal with two branches on every arm, drawn with strokes. */
export const crystal: Shape = (context, radius) => {
    styleStroke(context, radius, LINE_WIDTH);
    context.beginPath();
    drawAround(context, ARMS, () => {
        context.moveTo(0, 0);
        context.lineTo(radius, 0);

        for (const side of [-1, 1]) {
            context.moveTo(radius * BRANCH_START, 0);
            context.lineTo(radius * BRANCH_END_X, side * radius * BRANCH_END_Y);
        }
    });
    context.stroke();
};
