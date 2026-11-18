import { describe, expect, test } from "vitest";
import { isSamePixels, renderPixels } from "../../__tests__/support/sprite";
import { crystals } from "../crystals";

describe("crystals", () => {
    test("draws every crystal of a set differently", () => {
        const sprites = crystals(8).map(renderPixels);

        const repeats = sprites.filter((sprite, index) =>
            sprites.slice(index + 1).some((other) => isSamePixels(sprite, other)),
        );

        expect(repeats).toHaveLength(0);
    });

    test("starts a larger set with the crystals of a smaller one", () => {
        const smaller = crystals(4, 7).map(renderPixels);

        const larger = crystals(8, 7).slice(0, 4).map(renderPixels);

        expect(larger).toStrictEqual(smaller);
    });

    test("draws other crystals for another seed", () => {
        const first = crystals(1, 1).map(renderPixels);

        const second = crystals(1, 2).map(renderPixels);

        expect(second).not.toStrictEqual(first);
    });
});
