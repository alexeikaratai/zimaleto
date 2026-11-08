import { describe, expect, test } from "vitest";
import { normalizeOptions } from "../options";
import { type Environment, type Flake, gustAt, rollFlake, spawnFlake, step, swayOffset } from "../physics";
import { createRandom } from "../random";

function createFlake(overrides: Partial<Flake> = {}): Flake {
    return {
        x: 50,
        y: 50,
        radius: 2,
        speed: 40,
        opacity: 1,
        color: "#fff",
        swayAmplitude: 0,
        swayFrequency: 1,
        swayPhase: 0,
        angle: 0,
        spin: 0,
        ...overrides,
    };
}

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

    test("clamps dt to 50 ms", () => {
        const stalled = createFlake();
        const clamped = createFlake();

        step([stalled], 1000, createEnvironment());
        step([clamped], 50, createEnvironment());

        expect(stalled.y).toBe(clamped.y);
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

describe("spawnFlake", () => {
    test("spreads the first flakes over the whole canvas height", () => {
        const settings = normalizeOptions({});
        const random = createRandom(3);

        const heights = Array.from({ length: 500 }, () => spawnFlake(settings, random, 300, 200).y);

        expect([Math.min(...heights) < 20, Math.max(...heights) > 180]).toEqual([true, true]);
    });
});

describe("rollFlake", () => {
    test("with parallax, gives bigger flakes more speed and opacity", () => {
        const settings = normalizeOptions({ size: [1, 10], speed: [10, 100], opacity: [0.2, 1] });
        const random = createRandom(5);

        const flakes = Array.from({ length: 50 }, () => spawnFlake(settings, random, 100, 100)).sort(
            (first, second) => first.radius - second.radius,
        );
        const speeds = flakes.map((flake) => flake.speed);
        const opacities = flakes.map((flake) => flake.opacity);

        expect([speeds, opacities]).toEqual([
            [...speeds].sort((first, second) => first - second),
            [...opacities].sort((first, second) => first - second),
        ]);
    });

    test("without parallax, picks speed independently of size", () => {
        const settings = normalizeOptions({ size: [1, 10], speed: [10, 100], parallax: false });
        const random = createRandom(5);

        const flakes = Array.from({ length: 50 }, () => spawnFlake(settings, random, 100, 100)).sort(
            (first, second) => first.radius - second.radius,
        );
        const speeds = flakes.map((flake) => flake.speed);

        expect(speeds).not.toEqual([...speeds].sort((first, second) => first - second));
    });

    test("picks every color from the list", () => {
        const settings = normalizeOptions({ color: ["red", "blue"] });
        const random = createRandom(9);

        const colors = Array.from({ length: 100 }, () => spawnFlake(settings, random, 100, 100).color);

        expect(new Set(colors)).toEqual(new Set(["red", "blue"]));
    });

    test("keeps the flake's position", () => {
        const settings = normalizeOptions({ size: 9 });
        const flake = createFlake({ x: 12, y: 34 });

        rollFlake(flake, settings, createRandom(1));

        expect([flake.x, flake.y, flake.radius]).toEqual([12, 34, 9]);
    });

    test("turns rotation from degrees into radians per second", () => {
        const settings = normalizeOptions({ rotation: 180 });

        const flake = rollFlake(createFlake(), settings, createRandom(1));

        expect(flake.spin).toBeCloseTo(Math.PI);
    });
});
