import { describe, expect, test } from "vitest";

describe("browser setup", () => {
    test("provides a 2D canvas context", () => {
        const canvas = document.createElement("canvas");

        const context = canvas.getContext("2d");

        expect(context).toBeInstanceOf(CanvasRenderingContext2D);
    });
});
