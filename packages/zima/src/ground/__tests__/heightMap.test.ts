import { describe, expect, test } from "vitest";
import { COLUMN_WIDTH, createHeightMap, melt, resample, settle, shelterAt } from "../heightMap";

const DEPTH = 40;
// The steepest rise between neighbors that the angle of repose allows, in CSS px.
const MAX_RISE = 2;

type GrownBand = [column: number, from: number, to: number];

// Settles a flake and returns every band of snow it added.
function settleFlake(heights: number[], x: number, radius: number, depth = DEPTH): GrownBand[] {
    const bands: GrownBand[] = [];
    settle(heights, x, radius, depth, (column, from, to) => bands.push([column, from, to]));

    return bands;
}

function steepestRise(heights: number[]): number {
    return Math.max(...heights.slice(1).map((height, column) => Math.abs(height - (heights[column] as number))));
}

describe("createHeightMap", () => {
    test("has one empty column per column width, rounded up", () => {
        const heights = createHeightMap(COLUMN_WIDTH * 10 + 1);

        expect(heights).toStrictEqual(Array.from({ length: 11 }, () => 0));
    });
});

describe("settle", () => {
    test("adds the snow under the flake where it's drawn", () => {
        const heights = createHeightMap(400);

        const bands = settleFlake(heights, 202, 1);

        expect(new Set(bands.map(([column]) => column))).toStrictEqual(new Set([50]));
    });

    test("reports each band from the height before to the height after", () => {
        const heights = createHeightMap(400);

        const bands = settleFlake(heights, 202, 1);

        expect(bands.every(([column, from, to]) => to > from && to <= (heights[column] as number))).toBe(true);
    });

    test("slides down to a lower neighbor instead of piling up on a peak", () => {
        const heights = createHeightMap(12);
        heights[1] = 3;

        const bands = settleFlake(heights, 6, 1);

        expect(bands.map(([column]) => column)).not.toContain(1);
    });

    test("brings more snow with a bigger flake", () => {
        const small = createHeightMap(400);
        const big = createHeightMap(400);

        settleFlake(small, 200, 2);
        settleFlake(big, 200, 5);

        const total = (heights: number[]): number => heights.reduce((sum, height) => sum + height, 0);
        expect(total(big)).toBeGreaterThan(total(small) * 4);
    });

    test("keeps neighboring columns within the angle of repose", () => {
        const heights = createHeightMap(200);

        for (let flake = 0; flake < 400; flake += 1) {
            settleFlake(heights, 100 + (flake % 7), 4);
        }

        expect(steepestRise(heights)).toBeLessThanOrEqual(MAX_RISE + 1e-9);
    });

    test("never grows a column past the depth", () => {
        const heights = createHeightMap(200);

        for (let flake = 0; flake < 2000; flake += 1) {
            settleFlake(heights, (flake * 37) % 200, 5);
        }

        expect(Math.max(...heights)).toBeLessThanOrEqual(DEPTH);
    });

    test("ignores the part of a flake beside the canvas", () => {
        const heights = createHeightMap(40);

        const bands = settleFlake(heights, 1, 5);

        expect(bands.every(([column]) => column >= 0 && column < heights.length)).toBe(true);
    });
});

describe("shelterAt", () => {
    test("stays between 45% and 100% of the depth", () => {
        const shelters = Array.from({ length: 5000 }, (_value, column) => shelterAt(column));

        expect([Math.min(...shelters) >= 0.45, Math.max(...shelters) <= 1]).toStrictEqual([true, true]);
    });

    test("varies slowly, so the drift forms mounds rather than spikes", () => {
        const shelters = Array.from({ length: 1000 }, (_value, column) => shelterAt(column));

        const steepest = steepestRise(shelters);

        expect(steepest).toBeLessThan(0.05);
    });
});

describe("melt", () => {
    test("lowers every column", () => {
        const heights = [10, 5, 3];

        melt(heights, 2);

        expect(heights).toStrictEqual([8, 3, 1]);
    });

    test("stops at zero", () => {
        const heights = [10, 1, 0];

        melt(heights, 4);

        expect(heights).toStrictEqual([6, 0, 0]);
    });
});

describe("resample", () => {
    test("keeps the profile when the canvas gets wider", () => {
        const heights = [0, 10, 20, 30];

        const wider = resample(heights, COLUMN_WIDTH * 8, DEPTH);

        expect(wider).toStrictEqual([0, 0, 10, 10, 20, 20, 30, 30]);
    });

    test("keeps the profile when the canvas gets narrower", () => {
        const heights = [0, 0, 10, 10, 20, 20, 30, 30];

        const narrower = resample(heights, COLUMN_WIDTH * 4, DEPTH);

        expect(narrower).toStrictEqual([0, 10, 20, 30]);
    });

    test("cuts the snow down to a smaller depth", () => {
        const heights = [0, 10, 20, 30];

        const shallower = resample(heights, COLUMN_WIDTH * 4, 15);

        expect(shallower).toStrictEqual([0, 10, 15, 15]);
    });

    test("gives an empty profile for a map made while the canvas had no width", () => {
        const heights = createHeightMap(0);

        const grown = resample(heights, COLUMN_WIDTH * 3, DEPTH);

        expect(grown).toStrictEqual([0, 0, 0]);
    });
});
