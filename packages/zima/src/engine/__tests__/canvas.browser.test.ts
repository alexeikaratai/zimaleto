import { describe, expect, test } from "vitest";
import { hasVisiblePixels } from "../../__tests__/support/canvas";
import { addCanvas, addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubPixelRatio } from "../../__tests__/support/media";
import { nextFrame } from "../../__tests__/support/timing";

describe("targets", () => {
    test("uses a canvas target as its canvas", () => {
        const canvas = addCanvas("width: 120px; height: 60px;");

        const { snow } = startSnow({}, canvas);

        expect(snow.canvas).toBe(canvas);
    });

    test("leaves the styles of a canvas target alone", () => {
        const canvas = addCanvas("width: 120px; height: 60px; border: 1px solid red;");
        const styleBefore = canvas.style.cssText;

        startSnow({}, canvas);

        expect(canvas.style.cssText).toBe(styleBefore);
    });

    test("keeps a canvas target without a CSS size from growing on a dense screen", async () => {
        stubPixelRatio(2);
        const canvas = addCanvas();

        startSnow({}, canvas);
        await nextFrame();
        await nextFrame();

        expect([canvas.clientWidth, canvas.clientHeight]).toEqual([300, 150]);
    });

    test("clears a canvas target on destroy", () => {
        const canvas = addCanvas("width: 120px; height: 60px;");
        const { snow } = startSnow({ count: 30, seed: 1 }, canvas);

        snow.destroy();

        expect(hasVisiblePixels(canvas)).toBe(false);
    });

    test("leaves a canvas target's context at full opacity on destroy", () => {
        const canvas = addCanvas("width: 120px; height: 60px;");
        const { snow, clock } = startSnow({ count: 30, seed: 1 }, canvas);
        clock.tick();

        snow.destroy();

        expect(canvas.getContext("2d")?.globalAlpha).toBe(1);
    });

    test("adds a canvas that fills a container", () => {
        const container = addContainer(200, 100);

        const { snow } = startSnow({}, container);

        expect([snow.canvas.parentElement, snow.canvas.clientWidth, snow.canvas.clientHeight]).toEqual([
            container,
            200,
            100,
        ]);
    });

    test("removes the canvas it added on destroy", () => {
        const container = addContainer();
        const { snow } = startSnow({}, container);

        snow.destroy();

        expect(container.contains(snow.canvas)).toBe(false);
    });

    test("makes a static container relative", () => {
        const container = addContainer();

        startSnow({}, container);

        expect(container.style.position).toBe("relative");
    });

    test("restores a static container's position on destroy", () => {
        const container = addContainer();
        const { snow } = startSnow({}, container);

        snow.destroy();

        expect(container.style.position).toBe("");
    });

    test("leaves a positioned container alone", () => {
        const container = addContainer();
        container.style.position = "absolute";

        startSnow({}, container);

        expect(container.style.position).toBe("absolute");
    });

    test("covers the viewport with a fixed canvas when there is no target", () => {
        const { snow } = startSnow();

        const { position, pointerEvents, zIndex } = getComputedStyle(snow.canvas);

        expect([snow.canvas.parentElement, position, pointerEvents, zIndex, snow.canvas.clientWidth]).toEqual([
            document.body,
            "fixed",
            "none",
            "9999",
            document.documentElement.clientWidth,
        ]);
    });

    test("removes the page overlay on destroy", () => {
        const { snow } = startSnow();

        snow.destroy();

        expect(document.body.contains(snow.canvas)).toBe(false);
    });

    test("hides the canvases it adds from assistive technology", () => {
        const { snow } = startSnow({}, addContainer());

        expect(snow.canvas.getAttribute("aria-hidden")).toBe("true");
    });
});
