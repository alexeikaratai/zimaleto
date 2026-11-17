import { describe, expect, test } from "vitest";
import { DETAILED_OPTIONS, STRESS_OPTIONS } from "../presets";
import { SHAPE_NAMES } from "../shapes";

describe("presets", () => {
    test("the stress test weighs every shape equally", () => {
        const weights = SHAPE_NAMES.map((name) => STRESS_OPTIONS.shapeWeights[name]);

        expect(new Set(weights)).toStrictEqual(new Set([1]));
    });

    test("the detailed shapes are large enough to read", () => {
        const [smallest] = DETAILED_OPTIONS.size;

        expect(smallest).toBeGreaterThanOrEqual(6);
    });
});
