import { STAR_INNER_RADIUS, STAR_POINTS } from "./constants";
import { traceStar } from "./drawing";
import type { Shape } from "./types";

/** A filled five-pointed star. */
export const star: Shape = (context, radius) => {
    context.beginPath();
    traceStar(context, STAR_POINTS, radius, radius * STAR_INNER_RADIUS);
    context.fill();
};
