import { describe, expect, test } from "vitest";
import { splitProps } from "../splitProps";

describe("splitProps", () => {
    test("sends snowfall options, paused included, to the snowfall", () => {
        const [options] = splitProps({ count: 10, ground: undefined, paused: true, id: "snow" });

        expect(options).toStrictEqual({ count: 10, ground: undefined, paused: true });
    });

    test("sends every other prop to the canvas", () => {
        const [, canvasProps] = splitProps({ count: 10, id: "snow", "aria-label": "Snow" });

        expect(canvasProps).toStrictEqual({ id: "snow", "aria-label": "Snow" });
    });

    test("doesn't take inherited names such as toString for options", () => {
        const [options, canvasProps] = splitProps({ toString: "canvas prop" });

        expect({ options, canvasProps }).toStrictEqual({ options: {}, canvasProps: { toString: "canvas prop" } });
    });
});
