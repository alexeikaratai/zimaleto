import { ARMS, BRANCH_ANGLE, BRANCH_WIDTH, LAST_BRANCH, MIN_HALF_WIDTH, TIP_WIDTH } from "./constants";
import { drawAround, traceHexagon, traceTaper } from "./drawing";
import type { StellarDesign } from "./types";

/**
 * Draws a crystal with six arms and mirror-symmetric side branches that narrow towards their ends, and an optional
 * hexagonal ring around the center.
 */
export function drawStellar(context: CanvasRenderingContext2D, radius: number, design: StellarDesign): void {
    const { armWidth, branchPairs, branchStart, branchLength, ringSize } = design;
    const armHalfWidth = Math.max(MIN_HALF_WIDTH, (armWidth * radius) / 2);
    const gap = (LAST_BRANCH - branchStart) / branchPairs;

    // Each part gets its own fill: Chrome anti-aliases overlapping parts of one path unevenly, which left the crystal
    // up to 9% different from itself turned upside down.
    drawAround(context, ARMS, () => {
        context.beginPath();
        traceTaper(context, radius, armHalfWidth, TIP_WIDTH);
        context.fill();

        for (let pair = 0; pair < branchPairs; pair += 1) {
            const start = branchStart + pair * gap;
            const length = ((branchLength * (1 - start)) / (1 - branchStart)) * radius;
            const halfWidth = Math.max(MIN_HALF_WIDTH, armHalfWidth * (1 - start) * BRANCH_WIDTH);

            for (const side of [-1, 1]) {
                context.save();
                context.translate(start * radius, 0);
                context.rotate(side * BRANCH_ANGLE);
                context.beginPath();
                traceTaper(context, length, halfWidth, TIP_WIDTH);
                context.fill();
                context.restore();
            }
        }
    });

    if (ringSize > 0) {
        // Half as wide as an arm, and at least a pixel, so the ring doesn't fade in small sprites.
        context.lineWidth = Math.max(1, armHalfWidth);
        context.beginPath();
        traceHexagon(context, ringSize * radius);
        context.stroke();
    }
}
