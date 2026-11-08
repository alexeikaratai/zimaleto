import { describe, expect, test } from "vitest";
import { isEqual } from "../isEqual";
import { sparkle } from "./snowMock";

describe("isEqual", () => {
    test("treats new arrays with the same items as equal", () => {
        expect(isEqual(["#fff", "#cfe8ff"], ["#fff", "#cfe8ff"])).toBe(true);
    });

    test("tells arrays of different lengths apart", () => {
        expect(isEqual([1, 2], [1, 2, 2])).toBe(false);
    });

    test("compares weighted shapes field by field", () => {
        expect(isEqual([{ shape: sparkle, weight: 2 }], [{ shape: sparkle, weight: 2 }])).toBe(true);
    });

    test("tells objects with different fields apart", () => {
        expect(isEqual({ shape: sparkle, weight: 2 }, { shape: sparkle })).toBe(false);
    });

    test("compares functions by identity", () => {
        expect(
            isEqual(
                () => undefined,
                () => undefined,
            ),
        ).toBe(false);
    });

    test("tells an object from null", () => {
        expect(isEqual({}, null)).toBe(false);
    });

    test("treats NaN as equal to itself", () => {
        expect(isEqual(Number.NaN, Number.NaN)).toBe(true);
    });
});
