import { describe, expect, test } from "vitest";
import { recordDrawnFlakes } from "../../__tests__/support/canvas";
import { addContainer } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";

describe("update", () => {
    test("changes the flake count live", () => {
        const { snow, clock } = startSnow({ count: 10 }, addContainer());

        snow.update({ count: 3 });
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(drawn).toHaveLength(3);
    });

    test("restores the default for an option set to undefined", () => {
        const { snow, clock } = startSnow({ count: 3 }, addContainer());

        snow.update({ count: undefined });
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(drawn).toHaveLength(150);
    });

    test("gives every flake the new size when the size changes", () => {
        const { snow, clock } = startSnow({ count: 5 }, addContainer());

        snow.update({ size: 4 });
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();

        expect(drawn.map((flake) => flake.size)).toEqual([10, 10, 10, 10, 10]);
    });

    test("keeps every flake's size when only the wind changes", () => {
        const { snow, clock } = startSnow({ count: 5, seed: 4 }, addContainer());
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();
        const sizesBefore = drawn.splice(0).map((flake) => flake.size);

        snow.update({ wind: 40 });
        clock.tick();

        expect(drawn.slice(-5).map((flake) => flake.size)).toEqual(sizesBefore);
    });

    test("gives flakes that update() adds a place of their own when a seed is set", () => {
        const { snow, clock } = startSnow({ count: 5, seed: 1 }, addContainer());

        snow.update({ count: 10 });
        const drawn = recordDrawnFlakes(snow.canvas);
        clock.tick();
        const places = new Set(drawn.map((flake) => `${flake.x},${flake.y}`));

        expect(places.size).toBe(10);
    });
});
