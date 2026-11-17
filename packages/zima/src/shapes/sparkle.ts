import { traceStar } from "./drawing";
import type { Shape } from "./shape";

const INNER_RADIUS = 0.12;

/** A four-pointed glint with thin rays that taper to points. */
export const sparkle: Shape = (context, radius) => {
    context.beginPath();
    traceStar(context, 4, radius, radius * INNER_RADIUS);
    context.fill();
};
