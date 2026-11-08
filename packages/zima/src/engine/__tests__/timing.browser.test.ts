import { describe, expect, test } from "vitest";
import { recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { stubPixelRatio } from "../../__tests__/support/media";
import type { SnowOptions } from "../../options/snowOptions";

// One flake that falls straight down at 100 px/s on a canvas tall enough that it never respawns during a test.
const FALLING_FLAKE: SnowOptions = { count: 1, speed: 100, sway: 0, seed: 2 };

function addTallContainer(): HTMLDivElement {
    stubPixelRatio(1);

    return addContainer(100, 4000);
}

describe("frame timing", () => {
    test("draws every other frame at fps 30 when frames come every 16 ms", () => {
        const { snow, clock } = startSnow({ count: 1, fps: 30 }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        for (let frame = 0; frame < 6; frame += 1) {
            clock.tick(16);
        }

        expect(drawn).toHaveLength(3);
    });

    test("draws every frame without a cap", () => {
        const { snow, clock } = startSnow({ count: 1 }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);

        for (let frame = 0; frame < 6; frame += 1) {
            clock.tick(16);
        }

        expect(drawn).toHaveLength(6);
    });

    test("keeps the full fall speed under a low fps cap", () => {
        const { snow, clock } = startSnow({ ...FALLING_FLAKE, fps: 10 }, addTallContainer());
        clock.tick(100);
        const drawn = recordDrawnFlakes(snow.canvas);

        clock.tick(100);
        clock.tick(100);

        expect((drawn[1]?.y ?? 0) - (drawn[0]?.y ?? 0)).toBeCloseTo(10);
    });

    test("moves the flakes by at most 50 ms after a stalled frame", () => {
        const { snow, clock } = startSnow(FALLING_FLAKE, addTallContainer());
        clock.tick();
        const drawn = recordDrawnFlakes(snow.canvas);

        clock.tick(16);
        clock.tick(1000);

        expect((drawn[1]?.y ?? 0) - (drawn[0]?.y ?? 0)).toBeCloseTo(5);
    });
});
