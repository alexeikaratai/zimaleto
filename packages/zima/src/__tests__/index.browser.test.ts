import { describe, expect, onTestFinished, test, vi } from "vitest";
import { createSnow, type Snow } from "../index";
import { addContainer } from "./support/dom";
import { nextFrame } from "./support/timing";

function track(snow: Snow): Snow {
    onTestFinished(() => snow.destroy());

    return snow;
}

describe("createSnow", () => {
    test("covers the page when called with options only", () => {
        const snow = track(createSnow({ count: 10 }));

        expect(snow.canvas.parentElement).toBe(document.body);
    });

    test("covers the page with the defaults when called without arguments", () => {
        const snow = track(createSnow());

        expect(snow.canvas.parentElement).toBe(document.body);
    });

    test("fills the target element it gets", () => {
        const container = addContainer();

        const snow = track(createSnow(container));

        expect(snow.canvas.parentElement).toBe(container);
    });

    test("animates on the browser's own frames", async () => {
        const snow = track(createSnow(addContainer(), { count: 20, seed: 1 }));
        const drawImage = vi.spyOn(snow.canvas.getContext("2d") as CanvasRenderingContext2D, "drawImage");

        await nextFrame();
        await nextFrame();

        expect(drawImage).toHaveBeenCalled();
    });
});
