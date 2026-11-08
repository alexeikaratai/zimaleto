import { describe, expect, test, vi } from "vitest";
import { hasVisiblePixels, recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubMediaQueries, stubPixelRatio } from "../../__tests__/support/media";

describe("resize", () => {
    test("sizes the backing store to the CSS size × min(devicePixelRatio, maxDpr)", () => {
        stubPixelRatio(3);

        const { snow } = startSnow({ maxDpr: 2 }, addContainer(200, 100));

        expect([snow.canvas.width, snow.canvas.height]).toEqual([400, 200]);
    });

    test("follows the container when it resizes", async () => {
        const container = addContainer(200, 100);
        const { snow } = startSnow({}, container);

        container.style.width = "300px";

        await vi.waitFor(() => expect(snow.canvas.width).toBe(300));
    });

    test("with density, keeps the flake count in step with the area", async () => {
        const container = addContainer(200, 100);
        const { snow, clock } = startSnow({ density: 1 }, container);

        container.style.width = "400px";
        container.style.height = "200px";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(400));
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(drawn).toHaveLength(8);
    });

    test("follows a devicePixelRatio change", () => {
        const media = stubMediaQueries();
        stubPixelRatio(1);
        const { snow } = startSnow({}, addContainer(200, 100));

        stubPixelRatio(2);
        media.changeResolution();

        expect(snow.canvas.width).toBe(400);
    });

    test("keeps the snow on screen while the container resizes", async () => {
        const container = addContainer(200, 100);
        const { snow, clock } = startSnow({ count: 50, seed: 1 }, container);
        clock.tick();

        container.style.width = "300px";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(300));

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });

    test("spreads the flakes over a container that was hidden at the start", async () => {
        stubPixelRatio(1);
        const container = addContainer(200, 100);
        container.style.display = "none";
        const { snow, clock } = startSnow({ count: 40, seed: 1 }, container);

        container.style.display = "";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(200));
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(Math.max(...drawn.map((flake) => flake.x))).toBeGreaterThan(100);
    });

    test("spreads the flakes over the new area when the container grows", async () => {
        stubPixelRatio(1);
        const container = addContainer(200, 100);
        const { snow, clock } = startSnow({ count: 40, seed: 1 }, container);

        container.style.width = "800px";
        await vi.waitFor(() => expect(snow.canvas.width).toBe(800));
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(Math.max(...drawn.map((flake) => flake.x))).toBeGreaterThan(400);
    });
});
