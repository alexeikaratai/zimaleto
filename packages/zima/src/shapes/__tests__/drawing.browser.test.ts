import { describe, expect, test } from "vitest";
import { drawAround, styleStroke, traceHexagon, traceStar } from "../drawing";

const SIZE = 100;
const RADIUS = 40;

// A context with (0, 0) at the center of a 100 px canvas.
function createContext(): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.translate(SIZE / 2, SIZE / 2);

    return context;
}

// Whether a point, in px from the center, is inside the path.
function isInside(context: CanvasRenderingContext2D, x: number, y: number): boolean {
    return context.isPointInPath(SIZE / 2 + x, SIZE / 2 + y);
}

// How far a transform turns, in whole degrees from 0 to 359.
function angleOf({ a, b }: DOMMatrix): number {
    return (Math.round((Math.atan2(b, a) * 180) / Math.PI) + 360) % 360;
}

describe("drawAround", () => {
    test("turns the context by an equal part of a full turn before each copy", () => {
        const context = createContext();
        const angles: number[] = [];

        drawAround(context, 6, () => angles.push(angleOf(context.getTransform())));

        expect(angles).toStrictEqual([60, 120, 180, 240, 300, 0]);
    });

    test("leaves the context turned as it was", () => {
        const context = createContext();

        drawAround(context, 4, () => undefined);

        expect(angleOf(context.getTransform())).toBe(0);
    });
});

describe("traceHexagon", () => {
    test("puts a corner on the x-axis", () => {
        const context = createContext();

        traceHexagon(context, RADIUS);

        expect(isInside(context, RADIUS * 0.95, 0)).toBe(true);
    });

    test("puts a flat side across the y-axis", () => {
        const context = createContext();

        traceHexagon(context, RADIUS);

        // The flat side is cos 30° ≈ 0.87 radii from the center.
        expect([isInside(context, 0, RADIUS * 0.8), isInside(context, 0, RADIUS * 0.95)]).toStrictEqual([true, false]);
    });
});

describe("traceStar", () => {
    test("puts the first tip at the top", () => {
        const context = createContext();

        traceStar(context, 5, RADIUS, RADIUS * 0.45);

        const isTopInside = isInside(context, 0, -RADIUS * 0.95);
        const isBottomInside = isInside(context, 0, RADIUS * 0.95);

        expect([isTopInside, isBottomInside]).toStrictEqual([true, false]);
    });

    test("puts the corners between the tips at the inner radius", () => {
        const context = createContext();

        traceStar(context, 4, RADIUS, RADIUS * 0.2);

        // The corner between the top and right tips is at 45°.
        const corner = (distance: number): boolean =>
            isInside(context, distance * Math.SQRT1_2 * RADIUS, -distance * Math.SQRT1_2 * RADIUS);

        expect([corner(0.15), corner(0.25)]).toStrictEqual([true, false]);
    });
});

describe("styleStroke", () => {
    test("makes lines as wide as the share of the radius", () => {
        const context = createContext();

        styleStroke(context, RADIUS, 0.1);

        expect(context.lineWidth).toBe(4);
    });

    test("keeps lines at least a pixel wide", () => {
        const context = createContext();

        styleStroke(context, 5, 0.1);

        expect(context.lineWidth).toBe(1);
    });

    test("rounds the line ends", () => {
        const context = createContext();

        styleStroke(context, RADIUS, 0.1);

        expect(context.lineCap).toBe("round");
    });
});
