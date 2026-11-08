import { describe, expect, test } from "vitest";
import { hasVisiblePixels, opaqueArea, recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubPixelRatio } from "../../__tests__/support/media";
import type { Shape } from "../../shapes/shape";

describe("drawing", () => {
    test("draws visible flakes", () => {
        const { snow, clock } = startSnow({ count: 50, seed: 1 }, addContainer());

        clock.tick();

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });

    test("leaves the canvas empty with count 0", () => {
        const { snow, clock } = startSnow({ count: 0 }, addContainer());

        clock.tick();

        expect(hasVisiblePixels(snow.canvas)).toBe(false);
    });

    test("draws one sprite per flake in each frame", () => {
        const { snow, clock } = startSnow({ count: 7 }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        clock.tick();

        expect(drawn).toHaveLength(7);
    });

    test("shows the snow when stopped before its first frame", () => {
        const { snow } = startSnow({ count: 50, seed: 1 }, addContainer());

        snow.stop();

        expect(hasVisiblePixels(snow.canvas)).toBe(true);
    });

    test("draws a flake at its full size", () => {
        stubPixelRatio(1);
        const square: Shape = (context, radius) => context.fillRect(-radius, -radius, radius * 2, radius * 2);

        const { snow, clock } = startSnow(
            { count: 1, size: 5, opacity: 1, shapes: square, seed: 2 },
            addContainer(100, 100),
        );

        clock.tick();

        expect(opaqueArea(snow.canvas)).toBeCloseTo(100, -1);
    });
});
