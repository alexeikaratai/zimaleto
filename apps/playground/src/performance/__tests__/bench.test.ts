import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { measureFrames } from "../bench";
import type { FrameStats, MeasureTiming } from "../types";

const STATS: FrameStats = { frameRate: 60, medianIntervalMs: 16.7, p95IntervalMs: 17.1, workMs: 0.4 };
const TIMING: MeasureTiming = { settleMs: 500, windowMs: 1500 };

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("measureFrames", () => {
    test("reads the window once the snow has settled and the window has passed", async () => {
        // Arrange
        const read = vi.fn(() => STATS);
        const measurement = measureFrames(read, TIMING, new AbortController().signal);

        // Act
        await vi.advanceTimersByTimeAsync(2000);

        // Assert
        await expect(measurement).resolves.toBe(STATS);
        expect(read).toHaveBeenCalledExactlyOnceWith(1500);
    });

    test("waits for the end of the window before it reads", async () => {
        // Arrange
        const read = vi.fn(() => STATS);
        measureFrames(read, TIMING, new AbortController().signal);

        // Act
        await vi.advanceTimersByTimeAsync(1999);

        // Assert
        expect(read).not.toHaveBeenCalled();
    });

    test("rejects with the reason of an abort and never reads", async () => {
        // Arrange
        const controller = new AbortController();
        const read = vi.fn(() => STATS);
        const measurement = measureFrames(read, TIMING, controller.signal);

        // Act
        controller.abort("hidden");

        // Assert: the rejection comes first, so it's handled before the timers run.
        await expect(measurement).rejects.toBe("hidden");
        await vi.advanceTimersByTimeAsync(2000);
        expect(read).not.toHaveBeenCalled();
    });

    test("rejects at once when the signal is already aborted", async () => {
        // Arrange
        const read = vi.fn(() => STATS);

        // Act
        const measurement = measureFrames(read, TIMING, AbortSignal.abort("stopped"));

        // Assert
        await expect(measurement).rejects.toBe("stopped");
        expect(vi.getTimerCount()).toBe(0);
    });
});
