import { describe, expect, test, vi } from "vitest";
import { hasVisiblePixels, recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addCanvas, addContainer, setTabHidden } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubMediaQueries } from "../../__tests__/support/media";

describe("lifecycle", () => {
    test("starts animating on creation", () => {
        const { clock } = startSnow({}, addContainer());

        expect(clock.pendingFrames).toBe(1);
    });

    test("draws no frames after stop()", () => {
        const { snow, clock } = startSnow({}, addContainer());
        clock.tick();

        snow.stop();
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();
        clock.tick();

        expect(drawn).toHaveLength(0);
    });

    test("animates again after start()", () => {
        const { snow, clock } = startSnow({}, addContainer());
        snow.stop();

        snow.start();

        expect(clock.pendingFrames).toBe(1);
    });

    test("draws no frames after destroy()", () => {
        const { snow, clock } = startSnow({}, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        snow.destroy();
        clock.tick();

        expect(drawn).toHaveLength(0);
    });

    test("stays stopped when the tab is hidden and shown again after stop()", () => {
        const { snow, clock } = startSnow({}, addContainer());
        snow.stop();

        setTabHidden(true);
        setTabHidden(false);

        expect(clock.pendingFrames).toBe(0);
    });

    test("disconnects its observers on destroy", () => {
        const resizeDisconnect = vi.spyOn(ResizeObserver.prototype, "disconnect");
        const intersectionDisconnect = vi.spyOn(IntersectionObserver.prototype, "disconnect");
        const { snow } = startSnow({}, addContainer());

        snow.destroy();

        expect([resizeDisconnect.mock.calls.length, intersectionDisconnect.mock.calls.length]).toEqual([1, 1]);
    });

    test("stops following the reduced-motion setting on destroy", () => {
        const media = stubMediaQueries();
        const canvas = addCanvas("width: 120px; height: 60px;");
        const { snow } = startSnow({ count: 30, seed: 1 }, canvas);
        snow.destroy();

        media.setReducedMotion(true);

        expect(hasVisiblePixels(canvas)).toBe(false);
    });

    test("stops following the pixel ratio on destroy", () => {
        const media = stubMediaQueries();
        const canvas = addCanvas("width: 120px; height: 60px;");
        const { snow } = startSnow({ count: 30, seed: 1 }, canvas);
        snow.destroy();

        media.changeResolution();

        expect(hasVisiblePixels(canvas)).toBe(false);
    });

    test("ignores a second destroy()", () => {
        const container = addContainer();
        container.style.position = "static";
        const { snow } = startSnow({}, container);
        snow.destroy();
        container.style.position = "sticky";

        snow.destroy();

        expect(container.style.position).toBe("sticky");
    });

    test("ignores start() after destroy()", () => {
        const { snow, clock } = startSnow({}, addContainer());
        snow.destroy();

        snow.start();

        expect(clock.pendingFrames).toBe(0);
    });

    test("ignores update() after destroy()", () => {
        const canvas = addCanvas("width: 120px; height: 60px;");
        const { snow } = startSnow({ count: 30, seed: 1 }, canvas);
        snow.destroy();

        snow.update({ count: 50 });

        expect(hasVisiblePixels(canvas)).toBe(false);
    });
});
