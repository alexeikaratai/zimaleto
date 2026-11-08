import { describe, expect, test } from "vitest";
import { between, createRandom } from "../random";

describe("createRandom", () => {
    test("repeats the same sequence for the same seed", () => {
        const first = createRandom(42);
        const second = createRandom(42);

        const firstValues = Array.from({ length: 5 }, first);
        const secondValues = Array.from({ length: 5 }, second);

        expect(firstValues).toEqual(secondValues);
    });

    test("gives different sequences for different seeds", () => {
        const first = createRandom(1);
        const second = createRandom(2);

        const firstValues = Array.from({ length: 5 }, first);
        const secondValues = Array.from({ length: 5 }, second);

        expect(firstValues).not.toEqual(secondValues);
    });

    test("returns values in [0, 1)", () => {
        const random = createRandom(7);

        const values = Array.from({ length: 10_000 }, random);

        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...values)).toBeLessThan(1);
    });
});

describe("between", () => {
    test("maps 0 to the min, 1 to the max and 0.5 to the middle", () => {
        const bounds: [number, number] = [10, 20];

        const points = [0, 0.5, 1].map((amount) => between(bounds, amount));

        expect(points).toEqual([10, 15, 20]);
    });
});
