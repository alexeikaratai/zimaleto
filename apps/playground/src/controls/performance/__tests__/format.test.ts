import { describe, expect, test } from "vitest";
import { INITIAL_OPTIONS } from "../../../options";
import { NO_CANVAS, NO_VALUE } from "../constants";
import { describeCanvas, describeFlakes, formatCount, formatMs } from "../format";
import type { CanvasSize } from "../types";

const CANVAS: CanvasSize = { cssWidth: 800, cssHeight: 500, bitmapWidth: 1600, bitmapHeight: 1000 };

describe("formatCount", () => {
    test("rounds and adds thousands separators", () => {
        const text = formatCount(12_345.6);

        expect(text).toBe("12,346");
    });
});

describe("formatMs", () => {
    test("shows one decimal by default", () => {
        const text = formatMs(8.333);

        expect(text).toBe("8.3 ms");
    });

    test("shows as many decimals as asked", () => {
        const text = formatMs(0.456, 2);

        expect(text).toBe("0.46 ms");
    });
});

describe("describeFlakes", () => {
    test("shows the count when there's no density", () => {
        const text = describeFlakes({ ...INITIAL_OPTIONS, count: 5000 }, NO_CANVAS);

        expect(text).toBe("5,000");
    });

    test("works out the flakes a density gives on the canvas", () => {
        const text = describeFlakes({ ...INITIAL_OPTIONS, density: 0.5 }, CANVAS);

        expect(text).toBe("20");
    });

    test("shows a dash for a density before the canvas has a size", () => {
        const text = describeFlakes({ ...INITIAL_OPTIONS, density: 0.5 }, NO_CANVAS);

        expect(text).toBe(NO_VALUE);
    });
});

describe("describeCanvas", () => {
    test("shows the bitmap's size and megapixels", () => {
        const text = describeCanvas(CANVAS);

        expect(text).toBe("1600 × 1000 px, 1.6 MP");
    });

    test("shows a dash before the canvas has a size", () => {
        const text = describeCanvas(NO_CANVAS);

        expect(text).toBe(NO_VALUE);
    });
});
