import { describe, expect, test } from "vitest";
import { createFlake } from "../../__tests__/support/flake";
import { type Environment, gustAt, limitStep, step, swayOffset } from "../motion";
import { createRandom } from "../random";

function createEnvironment(overrides: Partial<Environment> = {}): Environment {
    return { width: 100, height: 100, wind: 0, random: createRandom(1), ...overrides };
}

describe("step", () => {
    test("moves a flake down by speed × dt", () => {
        const flake = createFlake({ y: 10, speed: 40 });

        step([flake], 25, createEnvironment());

        expect(flake.y).toBeCloseTo(11);
    });

    test("shifts a flake sideways by the wind", () => {
        const flake = createFlake({ x: 50 });

        step([flake], 50, createEnvironment({ wind: -20 }));

        expect(flake.x).toBeCloseTo(49);
    });

    test("advances the angle by spin × dt", () => {
        const flake = createFlake({ angle: 1, spin: 2 });

        step([flake], 50, createEnvironment());

        expect(flake.angle).toBeCloseTo(1.1);
    });

    test("advances the sway phase by its frequency × dt", () => {
        const flake = createFlake({ swayPhase: 0, swayFrequency: 3 });

        step([flake], 40, createEnvironment());

        expect(flake.swayPhase).toBeCloseTo(0.12);
    });

    test("ends one 32 ms step where two 16 ms steps end", () => {
        const single = createFlake({ speed: 60, spin: 2, swayFrequency: 1.2 });
        const double = createFlake({ speed: 60, spin: 2, swayFrequency: 1.2 });
        const environment = createEnvironment({ wind: 30 });

        step([single], 32, environment);
        step([double], 16, environment);
        step([double], 16, environment);

        expect([double.x, double.y, double.angle, double.swayPhase].map((value) => value.toFixed(9))).toEqual(
            [single.x, single.y, single.angle, single.swayPhase].map((value) => value.toFixed(9)),
        );
    });

    test("respawns a flake that leaves the bottom just above the top", () => {
        const flake = createFlake({ y: 101, radius: 2, speed: 100 });

        step([flake], 50, createEnvironment());

        expect(flake.y).toBe(-2);
    });

    test("wraps a flake blown past the right edge around to the left", () => {
        const flake = createFlake({ x: 101, radius: 2 });

        step([flake], 50, createEnvironment({ wind: 100 }));

        expect(flake.x).toBeCloseTo(2);
    });

    test("wraps a flake blown past the left edge around to the right", () => {
        const flake = createFlake({ x: -1, radius: 2 });

        step([flake], 50, createEnvironment({ wind: -100 }));

        expect(flake.x).toBeCloseTo(98);
    });

    test("keeps the number of flakes while they respawn", () => {
        const flakes = Array.from({ length: 20 }, (_, index) => createFlake({ y: index * 5, speed: 500 }));
        const environment = createEnvironment();

        for (let frame = 0; frame < 100; frame += 1) {
            step(flakes, 16, environment);
        }

        expect(flakes).toHaveLength(20);
    });
});

describe("limitStep", () => {
    test("keeps the length of a regular frame", () => {
        expect(limitStep(16, 0)).toBe(16);
    });

    test("limits a stalled frame to 50 ms", () => {
        expect(limitStep(1000, 0)).toBe(50);
    });

    test("keeps a whole frame of a low fps cap", () => {
        expect(limitStep(100, 10)).toBe(100);
    });

    test("limits a stalled frame to two frames of a low fps cap", () => {
        expect(limitStep(1000, 10)).toBe(200);
    });
});

describe("swayOffset", () => {
    test("stays within the sway amplitude", () => {
        const flake = createFlake({ swayAmplitude: 8, swayFrequency: 1.3, speed: 0 });
        const environment = createEnvironment();
        const offsets: number[] = [];

        for (let frame = 0; frame < 500; frame += 1) {
            step([flake], 16, environment);
            offsets.push(Math.abs(swayOffset(flake)));
        }

        expect(Math.max(...offsets)).toBeLessThanOrEqual(8);
    });
});

describe("gustAt", () => {
    test("stays within the gust amplitude", () => {
        const values = Array.from({ length: 2000 }, (_, index) => Math.abs(gustAt(index * 0.5, 30)));

        expect(Math.max(...values)).toBeLessThanOrEqual(30);
    });

    test("changes over time", () => {
        const values = [1, 5, 9].map((seconds) => gustAt(seconds, 30));

        expect(new Set(values).size).toBe(3);
    });

    test("is zero without gusts", () => {
        expect(gustAt(12.3, 0)).toBe(0);
    });
});
