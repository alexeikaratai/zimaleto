import { describe, expect, test } from "vitest";
import { type FrameSample, NO_FRAMES, percentile, summarizeFrames } from "../frameStats";

function framesAt(times: number[], workMs = 0): FrameSample[] {
    return times.map((time) => ({ time, workMs }));
}

describe("percentile", () => {
    test("picks the value that the share of values stays within", () => {
        // Arrange
        const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

        // Act
        const median = percentile(values, 0.5);
        const p95 = percentile(values, 0.95);

        // Assert
        expect([median, p95]).toStrictEqual([50, 100]);
    });

    test("picks the smallest value for a share of 0", () => {
        expect(percentile([3, 5, 8], 0)).toBe(3);
    });

    test("is 0 without values", () => {
        expect(percentile([], 0.95)).toBe(0);
    });
});

describe("summarizeFrames", () => {
    test.each([
        ["no frames", []],
        ["a single frame", [100]],
        ["frames at the same time", [100, 100]],
    ])("has nothing to measure with %s", (_name, times) => {
        expect(summarizeFrames(framesAt(times))).toStrictEqual(NO_FRAMES);
    });

    test("measures steady frames at the display's rate", () => {
        // Arrange
        const frames = framesAt([0, 10, 20, 30, 40]);

        // Act
        const stats = summarizeFrames(frames);

        // Assert
        expect(stats).toMatchObject({ frameRate: 100, medianIntervalMs: 10, p95IntervalMs: 10 });
    });

    test("counts a dropped frame in the frame rate and the slow intervals, but not the median", () => {
        // Arrange: the frame at 40 ms was dropped, so one interval takes two refreshes.
        const frames = framesAt([0, 10, 20, 30, 50]);

        // Act
        const stats = summarizeFrames(frames);

        // Assert
        expect(stats).toMatchObject({ frameRate: 80, medianIntervalMs: 10, p95IntervalMs: 20 });
    });

    test("averages the snow's work over the frames", () => {
        // Arrange
        const frames = [
            { time: 0, workMs: 1 },
            { time: 10, workMs: 2 },
            { time: 20, workMs: 6 },
        ];

        // Act
        const { workMs } = summarizeFrames(frames);

        // Assert
        expect(workMs).toBe(3);
    });
});
