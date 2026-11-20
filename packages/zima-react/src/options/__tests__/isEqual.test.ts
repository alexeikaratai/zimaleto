import { drift } from "@zimaleto/zima";
import { describe, expect, test } from "vitest";
import { blankShape } from "../../__tests__/support/snowMock";
import { isEqual } from "../isEqual";

describe("isEqual", () => {
    test("treats new arrays with the same items as equal", () => {
        expect(isEqual(["#fff", "#cfe8ff"], ["#fff", "#cfe8ff"])).toBe(true);
    });

    test("tells arrays of different lengths apart", () => {
        expect(isEqual([1, 2], [1, 2, 2])).toBe(false);
    });

    test("compares weighted shapes field by field", () => {
        expect(isEqual([{ shape: blankShape, weight: 2 }], [{ shape: blankShape, weight: 2 }])).toBe(true);
    });

    test("tells objects with different fields apart", () => {
        expect(isEqual({ shape: blankShape, weight: 2 }, { shape: blankShape })).toBe(false);
    });

    test("treats two drift() calls with the same options as equal", () => {
        expect(isEqual(drift({ depth: 30 }), drift({ depth: 30 }))).toBe(true);
    });

    test("tells drifts of different depths apart", () => {
        expect(isEqual(drift({ depth: 30 }), drift({ depth: 40 }))).toBe(false);
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
