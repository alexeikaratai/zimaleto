import type { Shape } from "./shape";

const POINTS = 5;
const INNER_RADIUS = 0.45;

/** A filled five-pointed star. */
export const star: Shape = (context, radius) => {
    context.beginPath();

    for (let corner = 0; corner < POINTS * 2; corner += 1) {
        const distance = corner % 2 === 0 ? radius : radius * INNER_RADIUS;
        // Starts at the top: -90° in canvas coordinates, where y grows downwards.
        const angle = (corner * Math.PI) / POINTS - Math.PI / 2;
        context.lineTo(Math.cos(angle) * distance, Math.sin(angle) * distance);
    }

    context.closePath();
    context.fill();
};
