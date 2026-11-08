import { afterEach, describe, expect, test, vi } from "vitest";
import { createEngine, type Snow } from "../engine";
import type { SnowOptions } from "../options";
import type { Shape } from "../shapes/shape";
import {
    createContainer,
    createDeferred,
    createManualClock,
    hasVisiblePixels,
    type ManualClock,
    stubMediaQueries,
    whenIntersectionReported,
} from "./support";

type Setup = {
    snow: Snow;
    clock: ManualClock;
};

const cleanups: Array<() => void> = [];

afterEach(() => {
    for (const cleanup of cleanups.splice(0).reverse()) {
        cleanup();
    }
});

function setup(options: SnowOptions = {}, target?: HTMLElement): Setup {
    const clock = createManualClock();
    const snow = createEngine(target, options, clock);
    cleanups.push(() => snow.destroy());

    return { snow, clock };
}

function addContainer(width?: number, height?: number): HTMLDivElement {
    const container = createContainer(width, height);
    cleanups.push(() => container.remove());

    return container;
}

function setHidden(isHidden: boolean): void {
    vi.spyOn(document, "hidden", "get").mockReturnValue(isHidden);
    document.dispatchEvent(new Event("visibilitychange"));
}

describe("targets", () => {
    test("draws on a canvas target and leaves its styles alone", () => {
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width: 120px; height: 60px; border: 1px solid red;";
        document.body.append(canvas);
        cleanups.push(() => canvas.remove());
        const styleBefore = canvas.style.cssText;

        const { snow } = setup({}, canvas);

        expect([snow.canvas, canvas.style.cssText]).toEqual([canvas, styleBefore]);
    });

    test("clears a canvas target on destroy", () => {
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width: 120px; height: 60px;";
        document.body.append(canvas);
        cleanups.push(() => canvas.remove());
        const { snow, clock } = setup({ count: 30, seed: 1 }, canvas);
        clock.tick();

        snow.destroy();

        expect(hasVisiblePixels(canvas)).toBe(false);
    });

    test("adds a canvas that fills a container", () => {
        const container = addContainer(200, 100);

        const { snow } = setup({}, container);

        expect([snow.canvas.parentElement, snow.canvas.clientWidth, snow.canvas.clientHeight]).toEqual([
            container,
            200,
            100,
        ]);
    });

    test("removes the canvas it added on destroy", () => {
        const container = addContainer();
        const { snow } = setup({}, container);

        snow.destroy();

        expect(container.contains(snow.canvas)).toBe(false);
    });

    test("makes a static container relative and restores it on destroy", () => {
        const container = addContainer();
        const { snow } = setup({}, container);
        const positionWhileSnowing = container.style.position;

        snow.destroy();

        expect([positionWhileSnowing, container.style.position]).toEqual(["relative", ""]);
    });

    test("leaves a positioned container alone", () => {
        const container = addContainer();
        container.style.position = "absolute";

        setup({}, container);

        expect(container.style.position).toBe("absolute");
    });

    test("covers the viewport with a fixed canvas when there is no target", () => {
        const { snow } = setup();

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
        const { snow } = setup();

        snow.destroy();

        expect(document.body.contains(snow.canvas)).toBe(false);
    });

    test("hides the canvases it adds from assistive technology", () => {
        const { snow } = setup({}, addContainer());

        expect(snow.canvas.getAttribute("aria-hidden")).toBe("true");
    });
});

describe("drawing", () => {
    test("draws visible flakes", () => {
        const { snow, clock } = setup({ count: 50, seed: 1 }, addContainer());

        clock.tick();

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });

    test("leaves the canvas empty with count 0", () => {
        const { snow, clock } = setup({ count: 0 }, addContainer());

        clock.tick();

        expect(hasVisiblePixels(snow.canvas)).toBe(false);
    });

    test("draws one sprite per flake in each frame", () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const { clock } = setup({ count: 7 }, addContainer());

        clock.tick();

        expect(drawImage).toHaveBeenCalledTimes(7);
    });
});

describe("resize", () => {
    test("sizes the backing store to the CSS size × min(devicePixelRatio, maxDpr)", () => {
        vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(3);

        const { snow } = setup({ maxDpr: 2 }, addContainer(200, 100));

        expect([snow.canvas.width, snow.canvas.height]).toEqual([400, 200]);
    });

    test("follows the container when it resizes", async () => {
        const container = addContainer(200, 100);
        const { snow } = setup({}, container);

        container.style.width = "300px";

        await vi.waitFor(() => expect(snow.canvas.width).toBe(300));
    });

    test("with density, keeps the flake count in step with the area", async () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const container = addContainer(200, 100);
        const { snow, clock } = setup({ density: 1 }, container);

        container.style.width = "400px";
        container.style.height = "200px";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(400));
        drawImage.mockClear();
        clock.tick();

        expect(drawImage).toHaveBeenCalledTimes(8);
    });

    test("follows a devicePixelRatio change", () => {
        const media = stubMediaQueries();
        const pixelRatio = vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(1);
        const { snow } = setup({}, addContainer(200, 100));

        pixelRatio.mockReturnValue(2);
        media.changeResolution();

        expect(snow.canvas.width).toBe(400);
    });
});

describe("lifecycle", () => {
    test("starts animating on creation", () => {
        const { clock } = setup({}, addContainer());

        expect(clock.pendingFrames).toBe(1);
    });

    test("draws no frames after stop()", () => {
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { snow, clock } = setup({}, addContainer());
        clock.tick();

        snow.stop();
        clearRect.mockClear();
        clock.tick();
        clock.tick();

        expect(clearRect).not.toHaveBeenCalled();
    });

    test("animates again after start()", () => {
        const { snow, clock } = setup({}, addContainer());
        snow.stop();

        snow.start();

        expect(clock.pendingFrames).toBe(1);
    });

    test("draws no frames after destroy()", () => {
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { snow, clock } = setup({}, addContainer());

        snow.destroy();
        clearRect.mockClear();
        clock.tick();

        expect(clearRect).not.toHaveBeenCalled();
    });

    test("stays stopped when the tab is hidden and shown again after stop()", () => {
        const { snow, clock } = setup({}, addContainer());
        snow.stop();

        setHidden(true);
        setHidden(false);

        expect(clock.pendingFrames).toBe(0);
    });

    test("disconnects its observers on destroy", () => {
        const resizeDisconnect = vi.spyOn(ResizeObserver.prototype, "disconnect");
        const intersectionDisconnect = vi.spyOn(IntersectionObserver.prototype, "disconnect");
        const { snow } = setup({}, addContainer());

        snow.destroy();

        expect([resizeDisconnect.mock.calls.length, intersectionDisconnect.mock.calls.length]).toEqual([1, 1]);
    });

    test("ignores a second destroy()", () => {
        const container = addContainer();
        container.style.position = "static";
        const { snow } = setup({}, container);
        snow.destroy();
        container.style.position = "sticky";

        snow.destroy();

        expect(container.style.position).toBe("sticky");
    });

    test("ignores start() and update() after destroy()", () => {
        const container = addContainer();
        const { snow, clock } = setup({}, container);
        snow.destroy();

        snow.start();
        snow.update({ count: 5 });

        expect([clock.pendingFrames, container.childElementCount]).toEqual([0, 0]);
    });
});

describe("fps", () => {
    test("draws every other frame at fps 30 when frames come every 16 ms", () => {
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { clock } = setup({ fps: 30 }, addContainer());
        clearRect.mockClear();

        for (let frame = 0; frame < 6; frame += 1) {
            clock.tick(16);
        }

        expect(clearRect).toHaveBeenCalledTimes(3);
    });

    test("draws every frame without a cap", () => {
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { clock } = setup({}, addContainer());
        clearRect.mockClear();

        for (let frame = 0; frame < 6; frame += 1) {
            clock.tick(16);
        }

        expect(clearRect).toHaveBeenCalledTimes(6);
    });
});

describe("pauseWhenHidden", () => {
    test("pauses while the tab is hidden", () => {
        const { clock } = setup({}, addContainer());

        setHidden(true);

        expect(clock.pendingFrames).toBe(0);
    });

    test("resumes when the tab is shown again", () => {
        const { clock } = setup({}, addContainer());
        setHidden(true);

        setHidden(false);

        expect(clock.pendingFrames).toBe(1);
    });

    test("pauses when the canvas is off-screen", async () => {
        const container = addContainer();
        container.style.marginTop = "10000px";

        const { clock } = setup({}, container);

        await vi.waitFor(() => expect(clock.pendingFrames).toBe(0));
    });

    test("keeps running off-screen with pauseWhenHidden: false", async () => {
        const container = addContainer();
        container.style.marginTop = "10000px";
        const { snow, clock } = setup({ pauseWhenHidden: false }, container);

        await whenIntersectionReported(snow.canvas);

        expect(clock.pendingFrames).toBe(1);
    });

    test("keeps running in a hidden tab with pauseWhenHidden: false", () => {
        const { clock } = setup({ pauseWhenHidden: false }, addContainer());

        setHidden(true);

        expect(clock.pendingFrames).toBe(1);
    });
});

describe("reducedMotion", () => {
    test('"static" draws exactly one frame', () => {
        stubMediaQueries({ isReducedMotion: true });
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { clock } = setup({}, addContainer());

        clock.tick();
        clock.tick();

        expect(clearRect).toHaveBeenCalledOnce();
    });

    test('"static" redraws its frame after a resize', async () => {
        stubMediaQueries({ isReducedMotion: true });
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const container = addContainer(200, 100);
        const { snow } = setup({}, container);

        container.style.width = "300px";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(300));

        expect(clearRect).toHaveBeenCalledTimes(2);
    });

    test('"static" redraws its frame after update()', () => {
        stubMediaQueries({ isReducedMotion: true });
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { snow } = setup({}, addContainer());

        snow.update({ color: "red" });

        expect(clearRect).toHaveBeenCalledTimes(2);
    });

    test('"static" doesn\'t animate after start()', () => {
        stubMediaQueries({ isReducedMotion: true });
        const { snow, clock } = setup({}, addContainer());

        snow.start();

        expect(clock.pendingFrames).toBe(0);
    });

    test('"reduce" animates half the flakes', () => {
        stubMediaQueries({ isReducedMotion: true });
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const { clock } = setup({ count: 10, reducedMotion: "reduce" }, addContainer());

        clock.tick();

        expect(drawImage).toHaveBeenCalledTimes(5);
    });

    test('"ignore" animates as usual', () => {
        stubMediaQueries({ isReducedMotion: true });

        const { clock } = setup({ reducedMotion: "ignore" }, addContainer());

        expect(clock.pendingFrames).toBe(1);
    });

    test("starts animating when the OS setting turns reduced motion off", () => {
        const media = stubMediaQueries({ isReducedMotion: true });
        const { clock } = setup({}, addContainer());

        media.setReducedMotion(false);

        expect(clock.pendingFrames).toBe(1);
    });

    test("stops animating when the OS setting turns reduced motion on", () => {
        const media = stubMediaQueries();
        const { clock } = setup({}, addContainer());

        media.setReducedMotion(true);

        expect(clock.pendingFrames).toBe(0);
    });
});

describe("update", () => {
    test("changes the flake count live", () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const { snow, clock } = setup({ count: 10 }, addContainer());

        snow.update({ count: 3 });
        drawImage.mockClear();
        clock.tick();

        expect(drawImage).toHaveBeenCalledTimes(3);
    });

    test("restores the default for an option set to undefined", () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const { snow, clock } = setup({ count: 3 }, addContainer());

        snow.update({ count: undefined });
        drawImage.mockClear();
        clock.tick();

        expect(drawImage).toHaveBeenCalledTimes(150);
    });

    test("gives every flake the new size when the size changes", () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const { snow, clock } = setup({ count: 5 }, addContainer());

        snow.update({ size: 4 });
        drawImage.mockClear();
        clock.tick();

        expect(drawImage.mock.calls.map((call) => call[3])).toEqual([10, 10, 10, 10, 10]);
    });

    test("keeps every flake's size when only the wind changes", () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const { snow, clock } = setup({ count: 5, seed: 4 }, addContainer());
        clock.tick();
        const sizesBefore = drawImage.mock.calls.map((call) => call[3]);

        snow.update({ wind: 40 });
        drawImage.mockClear();
        clock.tick();

        expect(drawImage.mock.calls.map((call) => call[3])).toEqual(sizesBefore);
    });
});

describe("shapes and sprites", () => {
    function createShapeSpy(): Shape {
        return vi.fn((context: CanvasRenderingContext2D, radius: number) => {
            context.fillRect(-radius, -radius, radius * 2, radius * 2);
        });
    }

    test("renders each shape and color once, however many flakes use it", () => {
        const shape = createShapeSpy();
        const { clock } = setup({ count: 40, shapes: shape, color: ["red", "blue"], seed: 2 }, addContainer());

        clock.tick();
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("renders sprites at the largest flake size times the pixel ratio", () => {
        vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(2);
        const shape = createShapeSpy();
        const { clock } = setup({ count: 3, shapes: shape, size: [1, 6] }, addContainer());

        clock.tick();

        expect(vi.mocked(shape).mock.calls[0]?.[1]).toBe(12);
    });

    test("rebuilds sprites when the colors change", () => {
        const shape = createShapeSpy();
        const { snow, clock } = setup({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        snow.update({ color: "green" });
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("rebuilds sprites when the largest size changes", () => {
        const shape = createShapeSpy();
        const { snow, clock } = setup({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        snow.update({ size: [2, 9] });
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("rebuilds sprites when the shapes change", () => {
        const first = createShapeSpy();
        const second = createShapeSpy();
        const { snow, clock } = setup({ count: 10, shapes: first }, addContainer());
        clock.tick();

        snow.update({ shapes: second });
        clock.tick();

        expect(second).toHaveBeenCalledOnce();
    });

    test("keeps its sprites when only the wind changes", () => {
        const shape = createShapeSpy();
        const { snow, clock } = setup({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        snow.update({ wind: 30 });
        clock.tick();

        expect(shape).toHaveBeenCalledOnce();
    });

    test("rebuilds sprites when the devicePixelRatio changes", () => {
        const media = stubMediaQueries();
        const pixelRatio = vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(1);
        const shape = createShapeSpy();
        const { clock } = setup({ count: 10, shapes: shape }, addContainer());
        clock.tick();

        pixelRatio.mockReturnValue(2);
        media.changeResolution();
        clock.tick();

        expect(shape).toHaveBeenCalledTimes(2);
    });

    test("mixes weighted shapes", () => {
        const common = createShapeSpy();
        const rare = createShapeSpy();
        const { clock } = setup(
            { count: 200, seed: 5, shapes: [common, { shape: rare, weight: 0.5 }] },
            addContainer(),
        );

        clock.tick();

        expect([common, rare].map((shape) => vi.mocked(shape).mock.calls.length)).toEqual([1, 1]);
    });

    test("skips flakes until their shape is ready, then draws them", async () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const loading = createDeferred();
        const shape: Shape = Object.assign(createShapeSpy(), { ready: loading.promise });
        const { clock } = setup({ count: 4, shapes: shape }, addContainer());
        clock.tick();
        const callsWhileLoading = drawImage.mock.calls.length;

        loading.resolve();
        await loading.promise;
        clock.tick();

        expect([callsWhileLoading, drawImage.mock.calls.length]).toEqual([0, 4]);
    });

    test("draws a shape that gets ready while the snow is stopped", async () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const loading = createDeferred();
        const shape: Shape = Object.assign(createShapeSpy(), { ready: loading.promise });
        const { snow, clock } = setup({ count: 4, shapes: shape }, addContainer());
        clock.tick();
        snow.stop();

        loading.resolve();
        await loading.promise;

        expect(drawImage).toHaveBeenCalledTimes(4);
    });

    test("doesn't draw on a destroyed canvas when a shape gets ready", async () => {
        const drawImage = vi.spyOn(CanvasRenderingContext2D.prototype, "drawImage");
        const loading = createDeferred();
        const shape: Shape = Object.assign(createShapeSpy(), { ready: loading.promise });
        const { snow, clock } = setup({ count: 4, shapes: shape }, addContainer());
        clock.tick();
        snow.destroy();

        loading.resolve();
        await loading.promise;

        expect(drawImage).not.toHaveBeenCalled();
    });
});
