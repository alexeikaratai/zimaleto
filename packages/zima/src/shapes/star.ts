import { traceStar } from "./drawing";
import type { Shape } from "./shape";

const INNER_RADIUS = 0.45;

/** A filled five-pointed star. */
export const star: Shape = (context, radius) => {
    context.beginPath();
    traceStar(context, 5, radius, radius * INNER_RADIUS);
    context.fill();
};
