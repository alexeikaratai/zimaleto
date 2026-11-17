import * as core from "@zimaleto/zima";
import { describe, expect, test } from "vitest";
import * as react from "../index";

describe("package entry", () => {
    test("re-exports the core shapes, so users need only this package", () => {
        const shapes = [
            react.dot,
            react.star,
            react.crystal,
            react.dendrite,
            react.plate,
            react.needle,
            react.bokeh,
            react.sparkle,
            react.crystals,
            react.text,
            react.image,
        ];

        expect(shapes).toStrictEqual([
            core.dot,
            core.star,
            core.crystal,
            core.dendrite,
            core.plate,
            core.needle,
            core.bokeh,
            core.sparkle,
            core.crystals,
            core.text,
            core.image,
        ]);
    });
});
