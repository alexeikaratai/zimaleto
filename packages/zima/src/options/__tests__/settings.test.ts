import { describe, expect, test } from "vitest";
import { crystal } from "../../shapes/crystal";
import { dot } from "../../shapes/dot";
import { star } from "../../shapes/star";
import { countFlakes, normalizeOptions, reduceMotion } from "../settings";
import type { SnowOptions } from "../snowOptions";

describe("normalizeOptions", () => {
    test("applies the defaults", () => {
        const settings = normalizeOptions({});

        expect(settings).toEqual({
            count: 150,
            density: undefined,
            size: [2, 5],
            speed: [30, 80],
            wind: 0,
            gust: 0,
            sway: [5, 20],
            rotation: [-90, 90],
            opacity: [0.6, 1],
            colors: ["#fff"],
            shapes: [{ shape: dot, weight: 1 }],
            parallax: true,
            fps: 0,
            maxDpr: 2,
            reducedMotion: "static",
            pauseWhenHidden: true,
            seed: undefined,
        });
    });

    test("turns a number into a fixed range", () => {
        const settings = normalizeOptions({ size: 3 });

        expect(settings.size).toEqual([3, 3]);
    });

    test("keeps a [min, max] range", () => {
        const settings = normalizeOptions({ speed: [10, 20] });

        expect(settings.speed).toEqual([10, 20]);
    });

    test("swaps a range whose min is above its max", () => {
        const settings = normalizeOptions({ sway: [30, 10] });

        expect(settings.sway).toEqual([10, 30]);
    });

    test("clamps a negative count to zero", () => {
        const settings = normalizeOptions({ count: -5 });

        expect(settings.count).toBe(0);
    });

    test("rounds a fractional count", () => {
        const settings = normalizeOptions({ count: 10.6 });

        expect(settings.count).toBe(11);
    });

    test("falls back to the default for numbers that aren't finite", () => {
        const settings = normalizeOptions({ count: Number.NaN, wind: Number.POSITIVE_INFINITY, size: [Number.NaN, 4] });

        expect([settings.count, settings.wind, settings.size]).toEqual([150, 0, [2, 4]]);
    });

    test("keeps opacity between 0 and 1", () => {
        const settings = normalizeOptions({ opacity: [-1, 2] });

        expect(settings.opacity).toEqual([0, 1]);
    });

    test("clamps negative sizes, speeds and sway to zero", () => {
        const settings = normalizeOptions({ size: -1, speed: [-10, 5], sway: -3 });

        expect([settings.size, settings.speed, settings.sway]).toEqual([
            [0, 0],
            [0, 5],
            [0, 0],
        ]);
    });

    test("ignores a density that isn't a finite number", () => {
        const settings = normalizeOptions({ density: Number.NaN });

        expect(settings.density).toBeUndefined();
    });

    test("clamps a negative density to zero", () => {
        const settings = normalizeOptions({ density: -1 });

        expect(settings.density).toBe(0);
    });

    test("turns an fps cap that isn't positive into no cap", () => {
        const settings = normalizeOptions({ fps: -30 });

        expect(settings.fps).toBe(0);
    });

    test("falls back to the default maxDpr when it isn't positive", () => {
        const settings = normalizeOptions({ maxDpr: -1 });

        expect(settings.maxDpr).toBe(2);
    });

    test("wraps a single color in a list", () => {
        const settings = normalizeOptions({ color: "red" });

        expect(settings.colors).toEqual(["red"]);
    });

    test("keeps a list of colors", () => {
        const settings = normalizeOptions({ color: ["red", "blue"] });

        expect(settings.colors).toEqual(["red", "blue"]);
    });

    test("falls back to white for an empty color list", () => {
        const settings = normalizeOptions({ color: [] });

        expect(settings.colors).toEqual(["#fff"]);
    });

    test("gives a single shape a weight of 1", () => {
        const settings = normalizeOptions({ shapes: star });

        expect(settings.shapes).toEqual([{ shape: star, weight: 1 }]);
    });

    test("mixes plain and weighted shapes in a list", () => {
        const settings = normalizeOptions({ shapes: [star, { shape: crystal, weight: 3 }] });

        expect(settings.shapes).toEqual([
            { shape: star, weight: 1 },
            { shape: crystal, weight: 3 },
        ]);
    });

    test("drops shapes whose weight isn't a finite positive number", () => {
        const settings = normalizeOptions({
            shapes: [
                { shape: star, weight: 0 },
                { shape: crystal, weight: -1 },
                { shape: dot, weight: Number.NaN },
                { shape: crystal, weight: Number.POSITIVE_INFINITY },
                { shape: star, weight: 2 },
            ],
        });

        expect(settings.shapes).toEqual([{ shape: star, weight: 2 }]);
    });

    test("falls back to the dot when no shape is left", () => {
        const settings = normalizeOptions({ shapes: [] });

        expect(settings.shapes).toEqual([{ shape: dot, weight: 1 }]);
    });

    test('falls back to "static" for an unknown reducedMotion mode', () => {
        const options = { reducedMotion: "none" } as unknown as SnowOptions;

        const settings = normalizeOptions(options);

        expect(settings.reducedMotion).toBe("static");
    });

    test("restores the default for a key set to undefined, as update() merges it", () => {
        const merged = { ...{ count: 10 }, ...{ count: undefined } };

        const settings = normalizeOptions(merged);

        expect(settings.count).toBe(150);
    });
});

describe("countFlakes", () => {
    test("uses count when density is unset", () => {
        const settings = normalizeOptions({ count: 42 });

        expect(countFlakes(settings, 400, 300)).toBe(42);
    });

    test("converts density to a count based on the area", () => {
        const settings = normalizeOptions({ count: 42, density: 0.5 });

        expect(countFlakes(settings, 400, 300)).toBe(6);
    });
});

describe("reduceMotion", () => {
    test("halves the count, the density and the speed", () => {
        const settings = normalizeOptions({ count: 100, density: 2, speed: [20, 60] });

        const reduced = reduceMotion(settings);

        expect([reduced.count, reduced.density, reduced.speed]).toEqual([50, 1, [10, 30]]);
    });

    test("turns off rotation and gusts", () => {
        const settings = normalizeOptions({ rotation: [-45, 45], gust: 30 });

        const reduced = reduceMotion(settings);

        expect([reduced.rotation, reduced.gust]).toEqual([[0, 0], 0]);
    });

    test("keeps density unset when it was unset", () => {
        const settings = normalizeOptions({ count: 10 });

        const reduced = reduceMotion(settings);

        expect(reduced.density).toBeUndefined();
    });
});
