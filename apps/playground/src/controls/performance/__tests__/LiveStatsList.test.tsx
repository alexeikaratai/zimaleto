import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { INITIAL_OPTIONS } from "../../../options";
import { NO_STATS, NO_VALUE } from "../constants";
import { LiveStatsList } from "../LiveStatsList";
import type { LiveStats } from "../types";

const LIVE: LiveStats = {
    frames: { frameRate: 59.6, medianIntervalMs: 16.7, p95IntervalMs: 18.25, workMs: 0.456 },
    canvas: { cssWidth: 800, cssHeight: 500, bitmapWidth: 1600, bitmapHeight: 1000 },
};

afterEach(cleanup);

function shownValues(): string[] {
    return screen.getAllByRole("definition").map((value) => value.textContent ?? "");
}

describe("<LiveStatsList>", () => {
    test("shows the frames, the flakes and the canvas", () => {
        render(
            <LiveStatsList
                live={LIVE}
                options={INITIAL_OPTIONS}
            />,
        );

        expect(shownValues()).toStrictEqual([
            "60 fps",
            "16.7 ms, p95 18.3 ms",
            "0.46 ms a frame",
            "150",
            "1600 × 1000 px, 1.6 MP",
        ]);
    });

    test("shows dashes for what it can't measure yet", () => {
        render(
            <LiveStatsList
                live={NO_STATS}
                options={INITIAL_OPTIONS}
            />,
        );

        expect(shownValues()).toStrictEqual([NO_VALUE, NO_VALUE, NO_VALUE, "150", NO_VALUE]);
    });
});
