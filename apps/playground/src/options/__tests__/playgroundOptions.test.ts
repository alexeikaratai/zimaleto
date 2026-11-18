import { dot, drift } from "@zimaleto/zima-react";
import { describe, expect, test } from "vitest";
import { INITIAL_OPTIONS, toSnowOptions } from "../playgroundOptions";

describe("toSnowOptions", () => {
    test("turns the weights into the shapes option", () => {
        const options = toSnowOptions(INITIAL_OPTIONS);

        expect(options.shapes).toStrictEqual([{ shape: dot, weight: 1 }]);
    });

    test("leaves out the playground's own fields, which the core doesn't know", () => {
        const options = toSnowOptions(INITIAL_OPTIONS);

        const ownFields = ["shapeWeights", "crystalCount", "isDrifting", "driftDepth", "driftMelt"];

        expect(ownFields.filter((field) => field in options)).toStrictEqual([]);
    });

    test("has no ground while the drift is off", () => {
        const options = toSnowOptions(INITIAL_OPTIONS);

        expect(options.ground).toBeUndefined();
    });

    test("turns the drift fields into a drift() ground", () => {
        const options = toSnowOptions({ ...INITIAL_OPTIONS, isDrifting: true, driftDepth: 60, driftMelt: 2 });

        expect(options.ground).toStrictEqual(drift({ depth: 60, melt: 2 }));
    });
});
