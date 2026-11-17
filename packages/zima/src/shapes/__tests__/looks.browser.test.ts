import { describe, expect, test } from "vitest";
import { alphaAt, circleShare, renderPixels, type SpritePixels, TEST_RADIUS } from "../../__tests__/support/sprite";
import { bokeh } from "../bokeh";
import { dot } from "../dot";
import type { Shape } from "../shape";
import { drawStellar, type StellarDesign } from "../stellar";

// Bare arms, so nothing but the arm crosses the x-axis.
const ARMS_ONLY: StellarDesign = {
    armWidth: 0.2,
    branchPairs: 0,
    branchStart: 0.3,
    branchLength: 0.3,
    ringSize: 0,
};

function stellar(design: StellarDesign): Shape {
    return (context, radius) => drawStellar(context, radius, design);
}

// How many px² a sprite paints, with each pixel counted by its opacity.
function paintedArea(pixels: SpritePixels): number {
    return circleShare(pixels) * Math.PI * TEST_RADIUS ** 2;
}

// How many pixels across the arm along the x-axis is at a distance from the center, in radii.
function armThickness(pixels: SpritePixels, distance: number): number {
    const rows = Array.from({ length: TEST_RADIUS }, (_value, row) => (row - TEST_RADIUS / 2) / TEST_RADIUS);

    return rows.filter((y) => alphaAt(pixels, distance, y) > 0.5).length;
}

describe("bokeh", () => {
    test("is opaque at the center", () => {
        const pixels = renderPixels(bokeh);

        expect(alphaAt(pixels, 0, 0)).toBe(1);
    });

    test("fades towards the edge", () => {
        const pixels = renderPixels(bokeh);

        const alphas = [0.3, 0.5, 0.7, 0.9].map((distance) => alphaAt(pixels, distance, 0));

        expect(alphas).toStrictEqual([...alphas].sort((first, second) => second - first));
        expect(alphas[3]).toBeLessThan(0.2);
    });

    test("keeps its halo when a custom shape draws over it", () => {
        const glow: Shape = (context, radius) => {
            bokeh(context, radius);
            dot(context, radius * 0.3);
        };

        const pixels = renderPixels(glow);

        expect(alphaAt(pixels, 0.5, 0)).toBe(alphaAt(renderPixels(bokeh), 0.5, 0));
    });
});

describe("stellar crystals", () => {
    test("narrow their arms towards the tip", () => {
        const pixels = renderPixels(stellar(ARMS_ONLY));

        // The arm keeps 30% of its width at the tip: 86% of it at 0.2 radii and 37% at 0.9.
        expect(armThickness(pixels, 0.9)).toBeLessThan(armThickness(pixels, 0.2) / 2);
    });

    test("draw a hexagonal ring when the design has one", () => {
        const pixels = renderPixels(stellar({ ...ARMS_ONLY, ringSize: 0.3 }));

        // Halfway along the ring's side between the corners at 0° and 60°, where no arm passes.
        expect(alphaAt(pixels, 0.225, 0.13)).toBeGreaterThan(0.5);
    });

    test("leave the center open without a ring", () => {
        const pixels = renderPixels(stellar(ARMS_ONLY));

        expect(alphaAt(pixels, 0.225, 0.13)).toBe(0);
    });

    test("keep the ring of a thin crystal at least a pixel wide", () => {
        const thin: StellarDesign = { ...ARMS_ONLY, armWidth: 0.01 };
        const ringSize = 0.3;

        const ringArea =
            paintedArea(renderPixels(stellar({ ...thin, ringSize }))) - paintedArea(renderPixels(stellar(thin)));

        // A hexagon's sides add up to six times its corner distance; where the arms cross the ring takes a little off.
        const perimeter = 6 * ringSize * TEST_RADIUS;
        expect(ringArea).toBeGreaterThan(perimeter * 0.8);
    });
});
