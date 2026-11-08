import { describe, expect, test } from "vitest";
import { createFlake } from "../../__tests__/support/flake";
import { normalizeOptions } from "../../options/settings";
import { crystal } from "../../shapes/crystal";
import { dot } from "../../shapes/dot";
import { star } from "../../shapes/star";
import { pickShape, rollFlake, spawnFlake } from "../flake";
import { createRandom } from "../random";

describe("pickShape", () => {
    test("picks shapes in proportion to their weights", () => {
        const shapes = [
            { shape: star, weight: 3 },
            { shape: crystal, weight: 1 },
        ];
        const random = createRandom(11);

        const picks = Array.from({ length: 4000 }, () => pickShape(shapes, random));
        const starShare = picks.filter((shape) => shape === star).length / picks.length;

        expect(starShare).toBeCloseTo(0.75, 1);
    });

    test("picks the last shape when rounding leaves a sliver past the total", () => {
        const shapes = [
            { shape: star, weight: 0.1 },
            { shape: crystal, weight: 0.2 },
            { shape: dot, weight: 0.3 },
        ];

        const picked = pickShape(shapes, () => 0.9999999999999999);

        expect(picked).toBe(dot);
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
