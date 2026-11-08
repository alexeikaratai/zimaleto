import * as core from "@zimaleto/zima";
import { describe, expect, test } from "vitest";
import * as react from "../index";

describe("package entry", () => {
    test("re-exports the core shapes, so users need only this package", () => {
        const shapes = [react.dot, react.star, react.crystal, react.text, react.image];

        expect(shapes).toEqual([core.dot, core.star, core.crystal, core.text, core.image]);
    });
});
