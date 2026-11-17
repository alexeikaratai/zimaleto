/**
 * Calls `drawCopy` `copies` times, turning the context by an equal part of a full turn before each,
 * so the copies end up evenly spaced around (0, 0) and the context ends up as it was.
 */
export function drawAround(context: CanvasRenderingContext2D, copies: number, drawCopy: () => void): void {
    for (let copy = 0; copy < copies; copy += 1) {
        context.rotate((Math.PI * 2) / copies);
        drawCopy();
    }
}

/** Adds a regular hexagon around (0, 0) to the path, with its corners `size` away and one of them on the x-axis. */
export function traceHexagon(context: CanvasRenderingContext2D, size: number): void {
    context.moveTo(size, 0);
    drawAround(context, 6, () => context.lineTo(size, 0));
    context.closePath();
}

/** Adds a star around (0, 0) to the path: `points` tips `outer` away, the first at the top, and corners `inner` away. */
export function traceStar(context: CanvasRenderingContext2D, points: number, outer: number, inner: number): void {
    const halfTurn = Math.PI / points;

    drawAround(context, points, () => {
        context.lineTo(0, -outer);
        context.lineTo(Math.sin(halfTurn) * inner, -Math.cos(halfTurn) * inner);
    });
}

/**
 * Adds a tapering bar along the x-axis to the path, from (0, 0) to `length`: `halfWidth` either side of the axis at
 * its base, narrowing to `tipShare` of that at its end.
 */
export function traceTaper(
    context: CanvasRenderingContext2D,
    length: number,
    halfWidth: number,
    tipShare: number,
): void {
    const tipHalfWidth = halfWidth * tipShare;

    context.moveTo(0, -halfWidth);
    context.lineTo(length, -tipHalfWidth);
    context.lineTo(length, tipHalfWidth);
    context.lineTo(0, halfWidth);
    context.closePath();
}

/** Round strokes as wide as a share of the radius, and at least a pixel, so thin lines don't fade in small sprites. */
export function styleStroke(context: CanvasRenderingContext2D, radius: number, share: number): void {
    context.lineWidth = Math.max(1, radius * share);
    context.lineCap = "round";
}
