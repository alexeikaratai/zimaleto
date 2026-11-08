import { describe, expect, test, vi } from "vitest";
import { recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubMediaQueries } from "../../__tests__/support/media";
import { whenResizeReported } from "../../__tests__/support/timing";

describe("reducedMotion", () => {
    test('"static" draws exactly one frame', () => {
        stubMediaQueries({ isReducedMotion: true });
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { clock } = startSnow({}, addContainer());

        clock.tick();
        clock.tick();

        expect(clearRect).toHaveBeenCalledOnce();
    });

    test('"static" redraws its frame after a resize', async () => {
        stubMediaQueries({ isReducedMotion: true });
        const container = addContainer(200, 100);
        const { snow } = startSnow({ count: 10 }, container);
        await whenResizeReported(snow.canvas);
        const drawn = recordDrawnFlakes(snow.canvas);

        container.style.width = "300px";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(300));

        expect(drawn).toHaveLength(10);
    });

    test('"static" redraws its frame after update()', () => {
        stubMediaQueries({ isReducedMotion: true });
        const clearRect = vi.spyOn(CanvasRenderingContext2D.prototype, "clearRect");
        const { snow } = startSnow({}, addContainer());

        snow.update({ color: "red" });

        expect(clearRect).toHaveBeenCalledTimes(2);
    });

    test('"static" doesn\'t animate after start()', () => {
        stubMediaQueries({ isReducedMotion: true });
        const { snow, clock } = startSnow({}, addContainer());

        snow.start();

        expect(clock.pendingFrames).toBe(0);
    });

    test('"reduce" animates half the flakes', () => {
        stubMediaQueries({ isReducedMotion: true });
        const { snow, clock } = startSnow({ count: 10, reducedMotion: "reduce" }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        clock.tick();

        expect(drawn).toHaveLength(5);
    });

    test('"ignore" animates as usual', () => {
        stubMediaQueries({ isReducedMotion: true });

        const { clock } = startSnow({ reducedMotion: "ignore" }, addContainer());

        expect(clock.pendingFrames).toBe(1);
    });

    test("starts animating when the OS setting turns reduced motion off", () => {
        const media = stubMediaQueries({ isReducedMotion: true });
        const { clock } = startSnow({}, addContainer());

        media.setReducedMotion(false);

        expect(clock.pendingFrames).toBe(1);
    });

    test("stops animating when the OS setting turns reduced motion on", () => {
        const media = stubMediaQueries();
        const { clock } = startSnow({}, addContainer());

        media.setReducedMotion(true);

        expect(clock.pendingFrames).toBe(0);
    });
});
