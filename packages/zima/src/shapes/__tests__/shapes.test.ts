import { describe, expect, test } from "vitest";
import { image } from "../image";
import { text } from "../text";

describe("text", () => {
    test("returns the same shape for the same glyph and font", () => {
        const first = text("❄", "serif");
        const second = text("❄", "serif");

        expect(first).toBe(second);
    });

    test("returns a different shape for another font", () => {
        const serif = text("❄", "serif");
        const sansSerif = text("❄", "sans-serif");

        expect(serif).not.toBe(sansSerif);
    });
});

describe("image", () => {
    test("can be called without a DOM, as during server rendering", () => {
        const createShape = () => image("/flake.png");

        expect(createShape).not.toThrow();
    });

    test("returns the same shape for the same source", () => {
        const first = image("/flake.png");
        const second = image("/flake.png");

        expect(first).toBe(second);
    });
});
