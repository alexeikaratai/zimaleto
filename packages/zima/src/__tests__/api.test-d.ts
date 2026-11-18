import { describe, expectTypeOf, test } from "vitest";
import {
    createSnow,
    crystal,
    crystals,
    type DriftOptions,
    dendrite,
    dot,
    drift,
    type Ground,
    type Range,
    type Shape,
    type Snow,
    type SnowOptions,
    star,
    type WeightedShape,
} from "../index";

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

describe("SnowOptions", () => {
    test("accepts one color", () => {
        expectTypeOf<{ color: "#fff" }>().toExtend<SnowOptions>();
    });

    test("accepts a list of colors", () => {
        expectTypeOf<{ color: ["#fff", "#cfe8ff"] }>().toExtend<SnowOptions>();
    });

    test("rejects a color that isn't a string", () => {
        expectTypeOf<{ color: 255 }>().not.toExtend<SnowOptions>();
    });

    test("accepts only the known reducedMotion modes", () => {
        expectTypeOf<SnowOptions["reducedMotion"]>().toEqualTypeOf<"static" | "reduce" | "ignore" | undefined>();
    });

    test("accepts a config declared as const", () => {
        const config = {
            size: [2, 5],
            color: ["#fff", "#cfe8ff"],
            shapes: [star, { shape: crystal, weight: 2 }],
        } as const;

        expectTypeOf(config).toExtend<SnowOptions>();
    });

    test("accepts undefined for an option, which restores its default", () => {
        expectTypeOf<{ count: undefined; color: undefined }>().toExtend<SnowOptions>();
    });
});

describe("createSnow", () => {
    test("accepts options alone", () => {
        expectTypeOf(createSnow).toBeCallableWith({ count: 10 });
    });

    test("accepts a target element with options", () => {
        expectTypeOf(createSnow).toBeCallableWith(document.createElement("div"), { wind: 5 });
    });

    test("returns a Snow", () => {
        expectTypeOf(createSnow).returns.toEqualTypeOf<Snow>();
    });
});

describe("Snow", () => {
    test("has a read-only canvas", () => {
        expectTypeOf<Pick<Snow, "canvas">>().toEqualTypeOf<{ readonly canvas: HTMLCanvasElement }>();
    });
});

describe("Shape", () => {
    test("accepts any function that draws with the context and a radius", () => {
        expectTypeOf<(context: CanvasRenderingContext2D, radius: number) => void>().toExtend<Shape>();
    });

    test("rejects a function that needs more arguments", () => {
        expectTypeOf<
            (context: CanvasRenderingContext2D, radius: number, angle: number) => void
        >().not.toExtend<Shape>();
    });
});

describe("shapes option", () => {
    test("accepts a single shape", () => {
        expectTypeOf({ shapes: star }).toExtend<SnowOptions>();
    });

    test("accepts a list that mixes plain and weighted shapes", () => {
        expectTypeOf({ shapes: [star, { shape: crystal, weight: 2 }] }).toExtend<SnowOptions>();
    });

    test("rejects a weight that isn't a number", () => {
        expectTypeOf<{ shape: Shape; weight: "2" }>().not.toExtend<WeightedShape>();
    });

    test("accepts the crystals() array as it is", () => {
        expectTypeOf({ shapes: crystals(8) }).toExtend<SnowOptions>();
    });

    test("accepts crystals() spread among other shapes", () => {
        expectTypeOf({ shapes: [...crystals(8), { shape: dendrite, weight: 2 }, dot] }).toExtend<SnowOptions>();
    });
});

describe("crystals", () => {
    test("takes a count and an optional seed", () => {
        expectTypeOf(crystals).toBeCallableWith(8);
        expectTypeOf(crystals).toBeCallableWith(8, 3);
    });

    test("returns a read-only array, since every call with the same arguments shares it", () => {
        expectTypeOf(crystals).returns.toEqualTypeOf<readonly Shape[]>();
    });
});

describe("ground option", () => {
    test("accepts a drift", () => {
        expectTypeOf({ ground: drift({ depth: 40 }) }).toExtend<SnowOptions>();
    });

    test("rejects plain options that didn't come from drift()", () => {
        expectTypeOf<{ ground: { depth: 40 } }>().not.toExtend<SnowOptions>();
    });
});

describe("drift", () => {
    test("takes optional depth and melt", () => {
        expectTypeOf<DriftOptions>().toEqualTypeOf<{ depth?: number | undefined; melt?: number | undefined }>();
    });

    test("can be called without options", () => {
        expectTypeOf(drift).toBeCallableWith();
    });

    test("returns a Ground", () => {
        expectTypeOf(drift).returns.toEqualTypeOf<Ground>();
    });
});
