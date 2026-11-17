import { dot } from "@zimaleto/zima-react";
import { describe, expect, test } from "vitest";
import { INITIAL_OPTIONS, toSnowOptions } from "../playgroundOptions";

describe("toSnowOptions", () => {
    test("turns the weights into the shapes option", () => {
        const options = toSnowOptions(INITIAL_OPTIONS);

        expect(options.shapes).toStrictEqual([{ shape: dot, weight: 1 }]);
    });

    test("leaves out the playground's own fields, which the core doesn't know", () => {
        const options = toSnowOptions(INITIAL_OPTIONS);

        expect(options).not.toHaveProperty("shapeWeights");
        expect(options).not.toHaveProperty("crystalCount");
    });
});
