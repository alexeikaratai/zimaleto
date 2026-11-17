import { describe, expect, test } from "vitest";
import { alphaAt, renderPixels } from "../../__tests__/support/sprite";
import { bokeh } from "../bokeh";
import { plate } from "../plate";

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
});

describe("plate", () => {
    test("has a translucent body", () => {
        const pixels = renderPixels(plate);

        // Halfway out, between the ridges at 0° and 60°.
        const body = alphaAt(pixels, 0.5 * Math.cos(Math.PI / 6), 0.5 * Math.sin(Math.PI / 6));

        expect(body).toBeCloseTo(0.35, 1);
    });

    test("has opaque ridges", () => {
        const pixels = renderPixels(plate);

        expect(alphaAt(pixels, 0.5, 0)).toBe(1);
    });
});
