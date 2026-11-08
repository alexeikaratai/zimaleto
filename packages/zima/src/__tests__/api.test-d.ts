import { describe, expectTypeOf, test } from "vitest";
import { createSnow, type Range, type Shape, type Snow, type SnowOptions } from "../index";

describe("Range", () => {
    test("accepts a number", () => {
        expectTypeOf<5>().toExtend<Range>();
    });

    test("accepts a [min, max] tuple", () => {
        expectTypeOf<[2, 5]>().toExtend<Range>();
    });

    test("rejects a one-element tuple", () => {
        expectTypeOf<[2]>().not.toExtend<Range>();
    });
});

describe("SnowOptions", () => {
    test("accepts one color", () => {
        expectTypeOf<{ color: "#fff" }>().toExtend<SnowOptions>();
    });

    test("accepts a list of colors", () => {
        expectTypeOf<{ color: ["#fff", "#cfe8ff"] }>().toExtend<SnowOptions>();
    });

    test("rejects a color that isn't a string", () => {
        expectTypeOf<{ color: 255 }>().not.toExtend<SnowOptions>();
    });

    test("accepts only the known reducedMotion modes", () => {
        expectTypeOf<SnowOptions["reducedMotion"]>().toEqualTypeOf<"static" | "reduce" | "ignore" | undefined>();
    });
});

describe("createSnow", () => {
    test("accepts options alone", () => {
        expectTypeOf(createSnow).toBeCallableWith({ count: 10 });
    });

    test("accepts a target element with options", () => {
        expectTypeOf(createSnow).toBeCallableWith(document.createElement("div"), { wind: 5 });
    });

    test("returns a Snow with a read-only canvas", () => {
        expectTypeOf(createSnow).returns.toEqualTypeOf<Snow>();
        expectTypeOf<Snow["canvas"]>().toEqualTypeOf<HTMLCanvasElement>();
    });
});

describe("Shape", () => {
    test("is a drawing function that takes the context and a radius", () => {
        expectTypeOf<(context: CanvasRenderingContext2D, radius: number) => void>().toEqualTypeOf<Shape>();
    });
});
