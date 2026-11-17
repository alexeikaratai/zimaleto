import { drawAround, styleStroke, traceHexagon } from "./drawing";

/** How a stellar crystal looks. Lengths are shares of the radius. */
export type StellarDesign = {
    armWidth: number;
    branchPairs: number;
    /** Where the first pair of side branches leaves the arm. The others follow at equal gaps towards the tip. */
    branchStart: number;
    /** How long the first side branches are. The others shorten towards the tip. */
    branchLength: number;
    /** How far the corners of the hexagon at the center reach, or 0 for none. */
    centerSize: number;
    /** How far the corners of the hexagonal plate at each arm's tip reach, or 0 for none. */
    tipSize: number;
};

const ARMS = 6;
const LAST_BRANCH = 0.85;
// The cosine and sine of 60°, the angle at which ice grows side branches. A literal, because bundlers keep a top-level
// Math.sqrt() call even when nothing uses the module.
const BRANCH_COS = 0.5;
const BRANCH_SIN = 0.866;

/** Draws a crystal with six arms, mirror-symmetric side branches, and hexagons at the center and the tips. */
export function drawStellar(context: CanvasRenderingContext2D, radius: number, design: StellarDesign): void {
    const { armWidth, branchPairs, branchStart, branchLength, centerSize, tipSize } = design;
    const gap = (LAST_BRANCH - branchStart) / branchPairs;

    styleStroke(context, radius, armWidth);
    context.beginPath();
    drawAround(context, ARMS, () => {
        context.moveTo(0, 0);
        context.lineTo(radius, 0);

        for (let pair = 0; pair < branchPairs; pair += 1) {
            const start = branchStart + pair * gap;
            const length = (branchLength * (1 - start)) / (1 - branchStart);

            for (const side of [-1, 1]) {
                context.moveTo(start * radius, 0);
                context.lineTo((start + length * BRANCH_COS) * radius, side * length * BRANCH_SIN * radius);
            }
        }
    });
    context.stroke();

    // A hexagon of size 0 has no area, so a design without a center or tips fills nothing.
    context.beginPath();
    traceHexagon(context, centerSize * radius);
    drawAround(context, ARMS, () => {
        const tipCenter = (1 - tipSize) * radius;
        context.translate(tipCenter, 0);
        traceHexagon(context, tipSize * radius);
        context.translate(-tipCenter, 0);
    });
    context.fill();
}
