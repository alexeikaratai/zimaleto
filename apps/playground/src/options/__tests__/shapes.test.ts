import { bokeh, crystals, dot } from "@zimaleto/zima-react";
import { describe, expect, test } from "vitest";
import { INITIAL_SHAPE_WEIGHTS, labelShapes, SHAPE_NAMES, toShapes } from "../shapes";

describe("toShapes", () => {
    test("leaves out shapes with a weight of 0", () => {
        const shapes = toShapes({ ...INITIAL_SHAPE_WEIGHTS, dot: 0, bokeh: 2 }, 8);

        expect(shapes).toStrictEqual([{ shape: bokeh, weight: 2 }]);
    });

    test("gives nothing when every weight is 0, so the core falls back to dots", () => {
        const shapes = toShapes({ ...INITIAL_SHAPE_WEIGHTS, dot: 0 }, 8);

        expect(shapes).toStrictEqual([]);
    });

    test("shares the crystals' weight among the generated crystals", () => {
        const shapes = toShapes({ ...INITIAL_SHAPE_WEIGHTS, dot: 0, crystals: 2 }, 4);

        expect(shapes).toStrictEqual(crystals(4).map((shape) => ({ shape, weight: 0.5 })));
    });

    test("keeps the other shapes' weights next to the crystals", () => {
        const shapes = toShapes({ ...INITIAL_SHAPE_WEIGHTS, crystals: 3 }, 3);

        expect(shapes[0]).toStrictEqual({ shape: dot, weight: 1 });
    });
});

describe("labelShapes", () => {
    test("lists every shape with one entry per generated crystal", () => {
        const shapes = labelShapes(5);

        expect(shapes).toHaveLength(SHAPE_NAMES.length - 1 + 5);
    });

    test("numbers the generated crystals, even a single one", () => {
        const labels = labelShapes(1).map(({ label }) => label);

        expect(labels.filter((label) => label.startsWith("Generated"))).toStrictEqual(["Generated 1"]);
    });

    test("gives every entry its own label", () => {
        const labels = labelShapes(32).map(({ label }) => label);

        expect(new Set(labels).size).toBe(labels.length);
    });
});
