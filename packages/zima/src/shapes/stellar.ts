import { drawAround, traceHexagon, traceTaper } from "./drawing";

/** How a stellar crystal looks. Lengths are shares of the radius. */
export type StellarDesign = {
    /** How wide each arm is at the center. Arms and branches narrow towards their ends. */
    armWidth: number;
    branchPairs: number;
    /** Where the first pair of side branches leaves the arm. The others follow at equal gaps towards the tip. */
    branchStart: number;
    /** How long the first side branches are. The others shorten towards the tip. */
    branchLength: number;
    /** How far the corners of a hexagonal ring around the center reach, or 0 for none. */
    ringSize: number;
};

const ARMS = 6;
const LAST_BRANCH = 0.85;
// Ice grows its side branches at 60° to the arm.
const BRANCH_ANGLE = Math.PI / 3;
// A side branch starts thinner than the arm where it grows.
const BRANCH_WIDTH = 0.7;
// The share of its base width that an arm or a branch keeps at its end.
const TIP_WIDTH = 0.3;
// Half a pixel either side, so the thinnest parts don't fade in small sprites.
const MIN_HALF_WIDTH = 0.5;

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
        context.lineWidth = armHalfWidth;
        context.beginPath();
        traceHexagon(context, ringSize * radius);
        context.stroke();
    }
}
