import { describe, expectTypeOf, test } from "vitest";
import type { SnowfallOptions, SnowfallProps } from "../index";

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
        expectTypeOf<SnowfallProps["color"]>().toEqualTypeOf<string | string[] | undefined>();
    });

    test("doesn't take width, height or children, because the engine sizes the canvas", () => {
        expectTypeOf<SnowfallProps>().not.toHaveProperty("width");
        expectTypeOf<SnowfallProps>().not.toHaveProperty("height");
        expectTypeOf<SnowfallProps>().not.toHaveProperty("children");
    });

    test("rejects unknown props", () => {
        const props: SnowfallProps = {
            // @ts-expect-error snowflakes isn't a Snowfall prop
            snowflakes: 10,
        };

        expectTypeOf(props).toEqualTypeOf<SnowfallProps>();
    });
});

describe("SnowfallOptions", () => {
    test("adds paused to the core options", () => {
        expectTypeOf<SnowfallOptions["paused"]>().toEqualTypeOf<boolean | undefined>();
    });
});
