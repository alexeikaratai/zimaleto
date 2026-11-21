import {
    ARMS,
    CRYSTAL_BRANCH_END_X,
    CRYSTAL_BRANCH_END_Y,
    CRYSTAL_BRANCH_START,
    CRYSTAL_LINE_WIDTH,
} from "./constants";
import { drawAround, styleStroke } from "./drawing";
import type { Shape } from "./types";

/** A six-armed ice crystal with two branches on every arm, drawn with strokes. */
export const crystal: Shape = (context, radius) => {
    styleStroke(context, radius, CRYSTAL_LINE_WIDTH);
    context.beginPath();
    drawAround(context, ARMS, () => {
        context.moveTo(0, 0);
        context.lineTo(radius, 0);

        for (const side of [-1, 1]) {
            context.moveTo(radius * CRYSTAL_BRANCH_START, 0);
            context.lineTo(radius * CRYSTAL_BRANCH_END_X, side * radius * CRYSTAL_BRANCH_END_Y);
        }
    });
    context.stroke();
};
