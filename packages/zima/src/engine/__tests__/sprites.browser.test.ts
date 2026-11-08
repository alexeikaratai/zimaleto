import { describe, expect, onTestFinished, test, vi } from "vitest";
import { recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubMediaQueries, stubPixelRatio } from "../../__tests__/support/media";
import { createDeferred, nextFrame } from "../../__tests__/support/timing";
import type { Shape } from "../../shapes/shape";

describe("shapes and sprites", () => {
    function createShapeSpy(): Shape {
        return vi.fn((context: CanvasRenderingContext2D, radius: number) => {
            context.fillRect(-radius, -radius, radius * 2, radius * 2);
        });
    }

    function createLoadingShape(ready: Promise<void>): Shape {
        return Object.assign(createShapeSpy(), { ready });
    }

    test("renders each shape and color once, however many flakes use it", () => {
        const shape = createShapeSpy();
        const { clock } = startSnow({ count: 40, shapes: shape, color: ["red", "blue"], seed: 2 }, addContainer());

        clock.tick();
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("renders sprites at the largest flake size times the pixel ratio", () => {
        stubPixelRatio(2);
        const shape = createShapeSpy();
        const { clock } = startSnow({ count: 3, shapes: shape, size: [1, 6] }, addContainer());

        clock.tick();

        expect(vi.mocked(shape).mock.calls[0]?.[1]).toBe(12);
    });

    test("rebuilds sprites when the colors change", () => {
        const shape = createShapeSpy();
        const { snow, clock } = startSnow({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        snow.update({ color: "green" });
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("rebuilds sprites when the largest size changes", () => {
        const shape = createShapeSpy();
        const { snow, clock } = startSnow({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        snow.update({ size: [2, 9] });
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("rebuilds sprites when the shapes change", () => {
        const first = createShapeSpy();
        const second = createShapeSpy();
        const { snow, clock } = startSnow({ count: 10, shapes: first }, addContainer());
        clock.tick();

        snow.update({ shapes: second });
        clock.tick();

        expect(second).toHaveBeenCalledOnce();
    });

    test("keeps its sprites when only the wind changes", () => {
        const shape = createShapeSpy();
        const { snow, clock } = startSnow({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        snow.update({ wind: 30 });
        clock.tick();

        expect(shape).toHaveBeenCalledOnce();
    });

    test("rebuilds sprites when the devicePixelRatio changes", () => {
        const media = stubMediaQueries();
        stubPixelRatio(1);
        const shape = createShapeSpy();
        const { clock } = startSnow({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        stubPixelRatio(2);
        media.changeResolution();
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("mixes weighted shapes", () => {
        const common = createShapeSpy();
        const rare = createShapeSpy();
        const { clock } = startSnow(
            { count: 200, seed: 5, shapes: [common, { shape: rare, weight: 0.5 }] },
            addContainer(),
        );

        clock.tick();

        expect([common, rare].map((shape) => vi.mocked(shape).mock.calls.length)).toEqual([1, 1]);
    });

    test("skips the flakes of a shape that isn't ready", () => {
        const loading = createDeferred();
        const { snow, clock } = startSnow({ count: 4, shapes: createLoadingShape(loading.promise) }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        clock.tick();

        expect(drawn).toHaveLength(0);
    });

    test("draws the flakes of a shape once it's ready", async () => {
        const loading = createDeferred();
        const { snow, clock } = startSnow({ count: 4, shapes: createLoadingShape(loading.promise) }, addContainer());
        clock.tick();

        loading.resolve();
        await loading.promise;
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(drawn).toHaveLength(4);
    });

    test("never draws the flakes of a shape whose ready promise rejects", async () => {
        const shape = createLoadingShape(Promise.reject(new Error("broken")));
        const { snow, clock } = startSnow({ count: 4, shapes: shape }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        clock.tick();
        await nextFrame();
        clock.tick();

        expect(drawn).toHaveLength(0);
    });

    test("handles a ready promise that rejects", async () => {
        const unhandledRejections = vi.fn();
        window.addEventListener("unhandledrejection", unhandledRejections);
        onTestFinished(() => window.removeEventListener("unhandledrejection", unhandledRejections));
        const shape = createLoadingShape(Promise.reject(new Error("broken")));
        const { clock } = startSnow({ count: 4, shapes: shape }, addContainer());

        clock.tick();
        await nextFrame();
        await nextFrame();

        expect(unhandledRejections).not.toHaveBeenCalled();
    });

    test("draws a shape that gets ready while the snow is stopped", async () => {
        const loading = createDeferred();
        const { snow, clock } = startSnow({ count: 4, shapes: createLoadingShape(loading.promise) }, addContainer());
        clock.tick();
        snow.stop();
        const drawn = recordDrawnFlakes(snow.canvas);

        loading.resolve();
        await loading.promise;

        expect(drawn).toHaveLength(4);
    });

    test("doesn't draw on a destroyed canvas when a shape gets ready", async () => {
        const loading = createDeferred();
        const { snow, clock } = startSnow({ count: 4, shapes: createLoadingShape(loading.promise) }, addContainer());
        clock.tick();
        const drawn = recordDrawnFlakes(snow.canvas);
        snow.destroy();

        loading.resolve();
        await loading.promise;

        expect(drawn).toHaveLength(0);
    });
});
