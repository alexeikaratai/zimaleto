import { beforeEach, describe, expect, test, vi } from "vitest";
import { startFrameMeter } from "../frameMeter";
import { NO_FRAMES } from "../frameStats";

type FrameCallback = (time: number) => void;

let pendingCallbacks: Map<number, FrameCallback>;
let lastHandle: number;
let nowMs: number;

function requestFrame(callback: FrameCallback): number {
    lastHandle += 1;
    pendingCallbacks.set(lastHandle, callback);

    return lastHandle;
}

function cancelFrame(handle: number): void {
    pendingCallbacks.delete(handle);
}

// Runs the callbacks that were pending when the frame started, as the browser does.
function runFrames(times: number[]): void {
    for (const time of times) {
        const callbacks = [...pendingCallbacks.values()];
        pendingCallbacks.clear();
        nowMs = time;

        for (const callback of callbacks) {
            callback(time);
        }
    }
}

function timesFrom(startMs: number, count: number, intervalMs: number): number[] {
    return Array.from({ length: count }, (_value, index) => startMs + index * intervalMs);
}

beforeEach(() => {
    pendingCallbacks = new Map();
    lastHandle = 0;
    nowMs = 0;
    vi.stubGlobal("window", { requestAnimationFrame: requestFrame, cancelAnimationFrame: cancelFrame });
    vi.spyOn(performance, "now").mockImplementation(() => nowMs);
});

describe("startFrameMeter", () => {
    test("has nothing to report before the first frame", () => {
        // Arrange
        const meter = startFrameMeter();

        // Act
        const stats = meter.read(1000);

        // Assert
        expect(stats).toStrictEqual(NO_FRAMES);
    });

    test("measures only the frames of the window", () => {
        // Arrange: the slow first interval falls outside the window.
        const meter = startFrameMeter();
        runFrames([0, 30, 40, 50, 60]);

        // Act
        const stats = meter.read(30);

        // Assert
        expect(stats).toMatchObject({ frameRate: 100, medianIntervalMs: 10, p95IntervalMs: 10 });
    });

    test("counts the time the page's frame callbacks take as the snow's work", () => {
        // Arrange
        const meter = startFrameMeter();
        function snowFrame(): void {
            window.requestAnimationFrame(snowFrame);
            nowMs += 3;
        }
        window.requestAnimationFrame(snowFrame);
        runFrames(timesFrom(0, 10, 10));

        // Act
        const { workMs } = meter.read(50);

        // Assert
        expect(workMs).toBe(3);
    });

    test("keeps only the latest frames", () => {
        // Arrange: slow frames, then more fast ones than the meter keeps.
        const meter = startFrameMeter();
        runFrames([...timesFrom(0, 100, 100), ...timesFrom(10_000, 1024, 10)]);

        // Act
        const { p95IntervalMs } = meter.read(Number.POSITIVE_INFINITY);

        // Assert
        expect(p95IntervalMs).toBe(10);
    });

    test("stops its frames and puts requestAnimationFrame back", () => {
        // Arrange
        const meter = startFrameMeter();

        // Act
        meter.stop();

        // Assert
        expect([window.requestAnimationFrame, pendingCallbacks.size]).toStrictEqual([requestFrame, 0]);
    });
});
