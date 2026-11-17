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

    test("returns other shapes for another seed", () => {
        const first = crystals(6, 3);

        const second = crystals(6, 4);

        expect(second[0]).not.toBe(first[0]);
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

    // A center or tips of size 0 mean none, so only the sizes above 0 count.
    test.each<[field: keyof StellarDesign, min: number, max: number]>([
        ["armWidth", 0.05, 0.1],
        ["branchPairs", 1, 4],
        ["branchStart", 0.2, 0.5],
        ["branchLength", 0.15, 0.4],
        ["centerSize", 0.12, 0.25],
        ["tipSize", 0.08, 0.16],
    ])("keeps %s within %s to %s", (field, min, max) => {
        const values = designMany(200)
            .map((design) => design[field])
            .filter((value) => value > 0);

        expect(Math.min(...values)).toBeGreaterThanOrEqual(min);
        expect(Math.max(...values)).toBeLessThanOrEqual(max);
    });

    test("varies the branch pairs, the center and the tips", () => {
        const designs = designMany(200);

        const branchPairs = new Set(designs.map((design) => design.branchPairs));
        const centers = new Set(designs.map((design) => design.centerSize > 0));
        const tips = new Set(designs.map((design) => design.tipSize > 0));

        expect([...branchPairs].sort()).toStrictEqual([1, 2, 3, 4]);
        expect(centers.size).toBe(2);
        expect(tips.size).toBe(2);
    });
});
