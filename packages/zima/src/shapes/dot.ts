import type { Shape } from "./shape";

/** A filled circle: the default flake. */
export const dot: Shape = (context, radius) => {
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
};
