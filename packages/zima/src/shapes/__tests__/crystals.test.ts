import { describe, expect, test } from "vitest";
import { createRandom } from "../../physics/random";
import { crystals, designStellar } from "../crystals";
import type { StellarDesign } from "../stellar";

function designMany(count: number): StellarDesign[] {
    const random = createRandom(1);

    return Array.from({ length: count }, () => designStellar(random));
}

describe("crystals", () => {
    test("returns as many shapes as asked for", () => {
        const shapes = crystals(8);

        expect(shapes).toHaveLength(8);
    });

    test("returns the same array for the same arguments", () => {
        const first = crystals(6, 3);

        const second = crystals(6, 3);

        expect(second).toBe(first);
    });

    test("returns the same array for seeds with the same whole part, which give the same designs", () => {
        const first = crystals(6, 3);

        const second = crystals(6, 3.5);

        expect(second).toBe(first);
    });

    test.each([
        [2.4, 2],
        [2.6, 3],
        [0, 1],
        [-5, 1],
        [40, 32],
        [Number.POSITIVE_INFINITY, 32],
        [Number.NaN, 1],
    ])("turns a count of %s into %s shapes", (count, length) => {
        const shapes = crystals(count);

        expect(shapes).toHaveLength(length);
    });
});

describe("designStellar", () => {
    test("gives the same designs for the same seed", () => {
        const first = designMany(4);

        const second = designMany(4);

        expect(second).toStrictEqual(first);
    });

    test("rolls other designs for another seed", () => {
        const first = designStellar(createRandom(3));

        const second = designStellar(createRandom(4));

        expect(second).not.toStrictEqual(first);
    });

    // A ring of size 0 means none, so only the sizes above 0 count.
    test.each<[field: keyof StellarDesign, min: number, max: number]>([
        ["armWidth", 0.06, 0.1],
        ["branchPairs", 2, 4],
        ["branchStart", 0.25, 0.45],
        ["branchLength", 0.25, 0.45],
        ["ringSize", 0.15, 0.3],
    ])("keeps %s within %s to %s", (field, min, max) => {
        const values = designMany(200)
            .map((design) => design[field])
            .filter((value) => value > 0);

        expect(Math.min(...values)).toBeGreaterThanOrEqual(min);
        expect(Math.max(...values)).toBeLessThanOrEqual(max);
    });

    test("varies the branch pairs and the ring", () => {
        const designs = designMany(200);

        const branchPairs = new Set(designs.map((design) => design.branchPairs));
        const rings = new Set(designs.map((design) => design.ringSize > 0));

        expect([...branchPairs].sort()).toStrictEqual([2, 3, 4]);
        expect(rings.size).toBe(2);
    });
});
