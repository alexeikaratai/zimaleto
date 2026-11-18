import { describe, expect, test } from "vitest";
import { drift } from "../drift";

describe("drift", () => {
    test("is 40 px deep and doesn't melt by default", () => {
        const ground = drift();

        expect(ground).toMatchObject({ depth: 40, melt: 0 });
    });

    test.each([-5, 0, Number.NaN, Number.POSITIVE_INFINITY])("turns a depth of %s into the default", (depth) => {
        const ground = drift({ depth });

        expect(ground).toMatchObject({ depth: 40 });
    });

    test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("turns a melt of %s into no melting", (melt) => {
        const ground = drift({ melt });

        expect(ground).toMatchObject({ melt: 0 });
    });

    test("gives equal plain data for the same options, so React sees no change", () => {
        const first = drift({ depth: 30, melt: 2 });

        const second = drift({ depth: 30, melt: 2 });

        expect(second).toStrictEqual(first);
    });

    test("can be called without a DOM, as during server rendering", () => {
        const createGround = () => drift({ depth: 20 });

        expect(createGround).not.toThrow();
    });
});
