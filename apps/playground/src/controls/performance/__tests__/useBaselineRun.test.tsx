import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { INITIAL_OPTIONS, type PlaygroundOptions } from "../../../options";
import type { FrameStats } from "../../../performance";
import type { BaselineRunOptions } from "../types";
import { useBaselineRun } from "../useBaselineRun";

// A display at 100 Hz that never drops a frame, so the capacity search runs up to its limit.
const SMOOTH_FRAMES: FrameStats = { frameRate: 100, medianIntervalMs: 10, p95IntervalMs: 10, workMs: 1 };

type HandleOptionsChange = (changes: Partial<PlaygroundOptions>) => void;

beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

function renderRun(options: Partial<BaselineRunOptions> = {}) {
    const props: BaselineRunOptions = {
        read: () => SMOOTH_FRAMES,
        isPaused: false,
        onStart: vi.fn(),
        onOptionsChange: vi.fn<HandleOptionsChange>(),
        ...options,
    };

    return { props, ...renderHook((current: BaselineRunOptions) => useBaselineRun(current), { initialProps: props }) };
}

async function finishTimers(): Promise<void> {
    await act(() => vi.runAllTimersAsync());
}

describe("useBaselineRun", () => {
    test("is idle until started", () => {
        const { result } = renderRun();

        expect(result.current[0]).toStrictEqual({ status: "idle" });
    });

    test("sets up the snow it measures when started", () => {
        const onStart = vi.fn();
        const { result } = renderRun({ onStart });

        act(() => result.current[1]());

        expect(onStart).toHaveBeenCalledOnce();
    });

    test("reports what it's measuring and drives the snow to it", () => {
        const onOptionsChange = vi.fn<HandleOptionsChange>();
        const { result } = renderRun({ onOptionsChange });

        act(() => result.current[1]());

        expect([result.current[0], onOptionsChange.mock.calls]).toStrictEqual([
            { status: "running", count: 0, maxDpr: 1 },
            [[{ maxDpr: 1 }], [{ count: 0 }]],
        ]);
    });

    test("ends with the capacity at both pixel ratios and the frames at three counts", async () => {
        const { result } = renderRun();
        act(() => result.current[1]());

        await finishTimers();
        const [run] = result.current;
        const baseline = run.status === "done" ? run.baseline : undefined;

        expect([baseline?.capacities.length, baseline?.loads.length]).toStrictEqual([2, 3]);
    });

    test("puts the pixel-ratio limit back when it ends", async () => {
        const onOptionsChange = vi.fn<HandleOptionsChange>();
        const { result } = renderRun({ onOptionsChange });
        act(() => result.current[1]());

        await finishTimers();

        expect(onOptionsChange).toHaveBeenLastCalledWith({ maxDpr: INITIAL_OPTIONS.maxDpr });
    });

    test("stops when asked", async () => {
        const { result } = renderRun();
        act(() => result.current[1]());

        act(() => result.current[2]());
        await finishTimers();

        expect(result.current[0]).toStrictEqual({ status: "stopped", reason: "stopped" });
    });

    test("stops when the tab goes to the background", async () => {
        const { result } = renderRun();
        act(() => result.current[1]());
        vi.spyOn(document, "hidden", "get").mockReturnValue(true);

        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });
        await finishTimers();

        expect(result.current[0]).toStrictEqual({ status: "stopped", reason: "hidden" });
    });

    test("keeps measuring when the tab comes back to the front", () => {
        const { result } = renderRun();
        act(() => result.current[1]());
        vi.spyOn(document, "hidden", "get").mockReturnValue(false);

        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });

        expect(result.current[0].status).toBe("running");
    });

    test("stops when the snow is paused", async () => {
        const { props, result, rerender } = renderRun();
        act(() => result.current[1]());

        rerender({ ...props, isPaused: true });
        await finishTimers();

        expect(result.current[0]).toStrictEqual({ status: "stopped", reason: "paused" });
    });

    test("stops and puts the pixel-ratio limit back when it unmounts", async () => {
        const onOptionsChange = vi.fn<HandleOptionsChange>();
        const { result, unmount } = renderRun({ onOptionsChange });
        act(() => result.current[1]());

        unmount();
        await vi.runAllTimersAsync();

        expect(onOptionsChange).toHaveBeenLastCalledWith({ maxDpr: INITIAL_OPTIONS.maxDpr });
    });
});
