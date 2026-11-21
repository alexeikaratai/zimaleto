import { describe, expect, test } from "vitest";
import { asymmetry, borderAlpha, circleShare, renderPixels } from "../../__tests__/support/sprite";
import { bokeh } from "../bokeh";
import { crystal } from "../crystal";
import { crystals } from "../crystals";
import { dendrite } from "../dendrite";
import { dot } from "../dot";
import { star } from "../star";
import type { Shape } from "../types";

type NamedShape = [name: string, shape: Shape];

const BUILT_IN: NamedShape[] = [
    ["dot", dot],
    ["star", star],
    ["crystal", crystal],
    ["dendrite", dendrite],
    ["bokeh", bokeh],
];
const GENERATED: NamedShape[] = crystals(32).map((shape, index) => [`crystals(32)[${index}]`, shape]);
// The five-pointed star is the only shape that doesn't look the same upside down.
const SYMMETRIC: NamedShape[] = [...BUILT_IN.filter(([name]) => name !== "star"), ...GENERATED];

// How much of the flake's circle each shape paints. Where the geometry is simple, the share is worked out from it.
const CIRCLE_SHARES: [name: string, shape: Shape, share: number][] = [
    ["dot", dot, 1],
    // Ten triangles between the tips and the corners: 10 × ½ × 0.45 × sin 36° ÷ π.
    ["star", star, 0.42],
    ["crystal", crystal, 0.35],
    ["dendrite", dendrite, 0.17],
    // Opaque to 0.2 radii, then a linear fade to the edge: 0.04 + 0.37.
    ["bokeh", bokeh, 0.41],
];

// Anti-aliasing along slanted and turned edges isn't perfectly symmetric, so turned sprites may differ this much.
const SYMMETRY_TOLERANCE = 0.02;

describe("sprite contract", () => {
    test.each([...BUILT_IN, ...GENERATED])("%s draws inside 1.25 radii", (_name, shape) => {
        const pixels = renderPixels(shape);

        expect(borderAlpha(pixels)).toBe(0);
    });

    test.each(CIRCLE_SHARES)("%s covers its share of the circle", (_name, shape, share) => {
        const pixels = renderPixels(shape);

        expect(circleShare(pixels)).toBeCloseTo(share, 1);
    });

    test.each(GENERATED)("%s is neither a wisp nor a blob", (_name, shape) => {
        const pixels = renderPixels(shape);

        expect(circleShare(pixels)).toBeGreaterThan(0.08);
        expect(circleShare(pixels)).toBeLessThan(0.3);
    });

    test.each(SYMMETRIC)("%s matches itself turned by 180°", (_name, shape) => {
        const pixels = renderPixels(shape);

        expect(asymmetry(pixels, "turn")).toBeLessThan(SYMMETRY_TOLERANCE);
    });

    test.each(SYMMETRIC)("%s matches itself mirrored across the horizontal axis", (_name, shape) => {
        const pixels = renderPixels(shape);

        expect(asymmetry(pixels, "mirror")).toBeLessThan(SYMMETRY_TOLERANCE);
    });

    test("tells an asymmetric shape apart", () => {
        const pixels = renderPixels(star);

        expect(asymmetry(pixels, "turn")).toBeGreaterThan(SYMMETRY_TOLERANCE);
    });
});
