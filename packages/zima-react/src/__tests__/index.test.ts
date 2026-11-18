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
            react.bokeh,
            react.crystals,
            react.text,
            react.image,
        ];

        expect(shapes).toStrictEqual([
            core.dot,
            core.star,
            core.crystal,
            core.dendrite,
            core.bokeh,
            core.crystals,
            core.text,
            core.image,
        ]);
    });
});
