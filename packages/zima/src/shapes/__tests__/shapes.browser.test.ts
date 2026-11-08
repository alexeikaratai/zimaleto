import { describe, expect, test } from "vitest";
import { hasVisiblePixels } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { type StartedSnow, startSnow } from "../../__tests__/support/engine";
import { crystal } from "../crystal";
import { dot } from "../dot";
import { image } from "../image";
import type { Shape } from "../shape";
import { star } from "../star";
import { text } from "../text";

function startSnowWith(shape: Shape): StartedSnow {
    return startSnow({ count: 30, size: [6, 10], seed: 1, shapes: shape }, addContainer(200, 100));
}

function createPictureSource(): string {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.fillStyle = "red";
    context.fillRect(0, 0, 8, 8);

    return canvas.toDataURL();
}

describe("built-in shapes", () => {
    test.each([
        ["dot", dot],
        ["star", star],
        ["crystal", crystal],
        ["text", text("❄")],
    ])("%s draws visible flakes", (_name, shape) => {
        const { snow, clock } = startSnowWith(shape);

        clock.tick();

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });
});

describe("image", () => {
    test("draws its picture once it has loaded", async () => {
        const shape = image(createPictureSource());
        const { snow } = startSnowWith(shape);

        await shape.ready;

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });

    test("rejects ready when its picture fails to load", async () => {
        const shape = image("data:image/png;base64,broken");

        await expect(shape.ready).rejects.toThrow();
    });
});
