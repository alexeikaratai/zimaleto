import { afterEach, describe, expect, test, vi } from "vitest";
import { createEngine } from "../engine";
import { crystal } from "../shapes/crystal";
import { dot } from "../shapes/dot";
import { image } from "../shapes/image";
import type { Shape } from "../shapes/shape";
import { star } from "../shapes/star";
import { text } from "../shapes/text";
import { createContainer, createManualClock, hasVisiblePixels, type ManualClock } from "./support";

const cleanups: Array<() => void> = [];

afterEach(() => {
    for (const cleanup of cleanups.splice(0).reverse()) {
        cleanup();
    }
});

type Started = {
    canvas: HTMLCanvasElement;
    clock: ManualClock;
};

function startSnow(shape: Shape): Started {
    const container = createContainer(200, 100);
    const clock = createManualClock();
    const snow = createEngine(container, { count: 30, size: [6, 10], seed: 1, shapes: shape }, clock);
    cleanups.push(
        () => container.remove(),
        () => snow.destroy(),
    );

    return { canvas: snow.canvas, clock };
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
        const { canvas, clock } = startSnow(shape);

        clock.tick();

        expect(hasVisiblePixels(canvas)).toBe(true);
    });
});

describe("image", () => {
    test("draws its picture once it has loaded", async () => {
        const shape = image(createPictureSource());
        const { canvas, clock } = startSnow(shape);
        clock.tick();

        // The engine learns about the load from the same promise, one microtask after it settles.
        await shape.ready;
        clock.tick();

        expect(hasVisiblePixels(canvas)).toBe(true);
    });

    test("never gets ready when its picture fails to load", async () => {
        const decode = vi.spyOn(HTMLImageElement.prototype, "decode");
        const shape = image("data:image/png;base64,broken");
        let isReady = false;

        shape.ready?.then(() => {
            isReady = true;
        });
        await decode.mock.results[0]?.value.catch(() => undefined);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(isReady).toBe(false);
    });
});
