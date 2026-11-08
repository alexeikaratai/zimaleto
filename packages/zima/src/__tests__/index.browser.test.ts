import { afterEach, describe, expect, test } from "vitest";
import { createSnow, type Snow } from "../index";
import { createContainer, hasVisiblePixels } from "./support";

const cleanups: Array<() => void> = [];

afterEach(() => {
    for (const cleanup of cleanups.splice(0).reverse()) {
        cleanup();
    }
});

function track(snow: Snow): Snow {
    cleanups.push(() => snow.destroy());

    return snow;
}

function addContainer(): HTMLDivElement {
    const container = createContainer();
    cleanups.push(() => container.remove());

    return container;
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

        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });
});
