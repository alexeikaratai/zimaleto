import { describe, expect, test } from "vitest";
import { clamp, finiteOr, finitePositiveOr, positiveOr } from "../numbers";

describe("finiteOr", () => {
    test.each([0, -3, 2.5])("keeps the finite number %s", (value) => {
        const result = finiteOr(value, 7);

        expect(result).toBe(value);
    });

    test.each([undefined, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        "falls back for %s",
        (value) => {
            const result = finiteOr(value, 7);

            expect(result).toBe(7);
        },
    );
});

describe("positiveOr", () => {
    test.each([0.5, 3, Number.POSITIVE_INFINITY])("keeps the positive number %s", (value) => {
        const result = positiveOr(value, 7);

        expect(result).toBe(value);
    });

    test.each([undefined, 0, -1, Number.NaN, Number.NEGATIVE_INFINITY])("falls back for %s", (value) => {
        const result = positiveOr(value, 7);

        expect(result).toBe(7);
    });
});

describe("finitePositiveOr", () => {
    test.each([0.5, 3])("keeps the finite positive number %s", (value) => {
        const result = finitePositiveOr(value, 7);

        expect(result).toBe(value);
    });

    test.each([undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])("falls back for %s", (value) => {
        const result = finitePositiveOr(value, 7);

        expect(result).toBe(7);
    });
});

describe("clamp", () => {
    test.each([
        [-5, 0],
        [0.4, 0.4],
        [5, 1],
    ])("keeps %s within [0, 1] as %s", (value, expected) => {
        const result = clamp(value, 0, 1);

        expect(result).toBe(expected);
    });
});
