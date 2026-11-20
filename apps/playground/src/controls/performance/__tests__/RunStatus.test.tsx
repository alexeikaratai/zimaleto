import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import type { Baseline } from "../../../performance";
import { STOP_MESSAGES } from "../constants";
import { RunStatus } from "../RunStatus";
import type { StopReason } from "../types";

const BASELINE: Baseline = {
    capacities: [
        { maxDpr: 1, count: 12_000, refreshRate: 120, isAtLimit: false },
        { maxDpr: 2, count: 64_000, refreshRate: 120, isAtLimit: true },
    ],
    loads: [{ count: 1000, frameRate: 119.6, medianIntervalMs: 8.3, p95IntervalMs: 9.04, workMs: 1.234 }],
};

afterEach(cleanup);

function captions(): string[] {
    return screen.getAllByRole("table").map((table) => table.querySelector("caption")?.textContent ?? "");
}

function rowTexts(): string[] {
    return screen.getAllByRole("row").map((row) => row.textContent ?? "");
}

describe("<RunStatus>", () => {
    test("explains the baseline before the first run", () => {
        render(<RunStatus run={{ status: "idle" }} />);

        expect(screen.getByText(/finds how many flakes keep the full frame rate/)).toBeTruthy();
    });

    test("shows what it's measuring", () => {
        render(<RunStatus run={{ status: "running", count: 4000, maxDpr: 2 }} />);

        expect(screen.getByRole("status").textContent).toBe("Measuring 4,000 flakes at pixel ratio 2…");
    });

    test.each<StopReason>(["stopped", "hidden", "paused"])("says why it %s", (reason) => {
        render(<RunStatus run={{ status: "stopped", reason }} />);

        expect(screen.getByRole("status").textContent).toBe(STOP_MESSAGES[reason]);
    });

    test("names the display the capacity was measured on", () => {
        render(<RunStatus run={{ status: "done", baseline: BASELINE }} />);

        expect(captions()).toStrictEqual(["Capacity on a 120 Hz display", "Frames at pixel ratio 2"]);
    });

    test("shows the capacity at each pixel ratio, marking one at the limit", () => {
        render(<RunStatus run={{ status: "done", baseline: BASELINE }} />);

        expect(rowTexts().slice(0, 2)).toStrictEqual(["Pixel ratio 112,000 flakes", "Pixel ratio 2≥ 64,000 flakes"]);
    });

    test("shows the frames at each flake count", () => {
        render(<RunStatus run={{ status: "done", baseline: BASELINE }} />);

        expect(rowTexts().slice(2)).toStrictEqual(["Flakesfpsp95Work", "1,0001209.0 ms1.23 ms"]);
    });

    test("names a 0 Hz display for a baseline without capacities", () => {
        render(<RunStatus run={{ status: "done", baseline: { capacities: [], loads: [] } }} />);

        expect(captions()[0]).toBe("Capacity on a 0 Hz display");
    });
});
