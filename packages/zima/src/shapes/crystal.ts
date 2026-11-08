import type { Shape } from "./shape";

const ARMS = 6;
const BRANCH_START = 0.55;
const BRANCH_LENGTH = 0.3;
const BRANCH_ANGLE = Math.PI / 4;
const LINE_WIDTH = 0.12;

/** A six-armed ice crystal with two branches on every arm, drawn with strokes. */
export const crystal: Shape = (context, radius) => {
    context.lineWidth = radius * LINE_WIDTH;
    context.lineCap = "round";
    context.beginPath();

    for (let arm = 0; arm < ARMS; arm += 1) {
        const angle = (arm * Math.PI * 2) / ARMS;
        const branchX = Math.cos(angle) * radius * BRANCH_START;
        const branchY = Math.sin(angle) * radius * BRANCH_START;

        context.moveTo(0, 0);
        context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);

        for (const side of [-1, 1]) {
            const branchAngle = angle + side * BRANCH_ANGLE;
            context.moveTo(branchX, branchY);
            context.lineTo(
                branchX + Math.cos(branchAngle) * radius * BRANCH_LENGTH,
                branchY + Math.sin(branchAngle) * radius * BRANCH_LENGTH,
            );
        }
    }

    context.stroke();
};
