import { describe, expectTypeOf, test } from "vitest";
import type { Range } from "../index";

describe("Range", () => {
    test("accepts a number", () => {
        expectTypeOf<5>().toExtend<Range>();
    });

    test("accepts a [min, max] tuple", () => {
        expectTypeOf<[2, 5]>().toExtend<Range>();
    });

    test("rejects a one-element tuple", () => {
        expectTypeOf<[2]>().not.toExtend<Range>();
    });
});
