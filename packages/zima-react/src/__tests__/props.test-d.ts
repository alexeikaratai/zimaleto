import type { RefObject } from "react";
import { describe, expectTypeOf, test } from "vitest";
import { Snowfall, type SnowfallOptions, type SnowfallProps, type useSnowfall } from "../index";

describe("SnowfallProps", () => {
    test("accepts core options, fullscreen, paused and canvas attributes", () => {
        expectTypeOf({
            count: 10,
            wind: 5,
            fullscreen: true,
            paused: false,
            className: "snow",
            "aria-hidden": false,
        }).toExtend<SnowfallProps>();
    });

    test("accepts a list of colors, not just React's string color attribute", () => {
        expectTypeOf<SnowfallProps["color"]>().toEqualTypeOf<string | readonly string[] | undefined>();
    });

    test("doesn't take width, height or children, because the engine sizes the canvas", () => {
        expectTypeOf<SnowfallProps>().not.toHaveProperty("width");
        expectTypeOf<SnowfallProps>().not.toHaveProperty("height");
        expectTypeOf<SnowfallProps>().not.toHaveProperty("children");
    });

    test("rejects unknown props", () => {
        // @ts-expect-error snowflakes isn't a Snowfall prop
        expectTypeOf(Snowfall).toBeCallableWith({ snowflakes: 10 });
    });

    test("takes a ref to a canvas, not to another element", () => {
        expectTypeOf<RefObject<HTMLDivElement | null>>().not.toExtend<NonNullable<SnowfallProps["ref"]>>();
    });
});

describe("useSnowfall", () => {
    test("accepts a ref to any element", () => {
        expectTypeOf<RefObject<HTMLDivElement | null>>().toExtend<Parameters<typeof useSnowfall>[0]>();
    });

    test("adds paused to the core options", () => {
        expectTypeOf<SnowfallOptions["paused"]>().toEqualTypeOf<boolean | undefined>();
    });
});
