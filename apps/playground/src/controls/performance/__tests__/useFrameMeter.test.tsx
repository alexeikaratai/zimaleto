import { act, cleanup, renderHook } from "@testing-library/react";
import { createRef, type RefObject } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NO_FRAMES } from "../../../performance";
import { NO_CANVAS, NO_STATS, REFRESH_INTERVAL_MS } from "../constants";
import { useFrameMeter } from "../useFrameMeter";

// A frame every 16 ms: what fake requestAnimationFrame delivers.
const FAKE_FRAME_RATE = 1000 / 16;

beforeEach(() => {
    vi.useFakeTimers({
        toFake: ["setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

function canvasRefSized(): RefObject<HTMLCanvasElement | null> {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    Object.defineProperties(canvas, { clientWidth: { value: 320 }, clientHeight: { value: 240 } });

    return { current: canvas };
}

function advance(milliseconds: number): void {
    act(() => {
        vi.advanceTimersByTime(milliseconds);
    });
}

describe("useFrameMeter", () => {
    test("reports nothing while inactive", () => {
        const { result } = renderHook(() => useFrameMeter(false, canvasRefSized()));

        advance(REFRESH_INTERVAL_MS);

        expect(result.current[0]).toStrictEqual(NO_STATS);
    });

    test("reads no frames while inactive", () => {
        const { result } = renderHook(() => useFrameMeter(false, canvasRefSized()));
        const [, read] = result.current;

        const frames = read(2000);

        expect(frames).toStrictEqual(NO_FRAMES);
    });

    test("measures the canvas twice a second while active", () => {
        const canvasRef = canvasRefSized();
        const { result } = renderHook(() => useFrameMeter(true, canvasRef));

        advance(REFRESH_INTERVAL_MS);

        expect(result.current[0].canvas).toStrictEqual({
            cssWidth: 320,
            cssHeight: 240,
            bitmapWidth: 640,
            bitmapHeight: 480,
        });
    });

    test("measures no canvas while the ref is empty", () => {
        const { result } = renderHook(() => useFrameMeter(true, createRef<HTMLCanvasElement>()));

        advance(REFRESH_INTERVAL_MS);

        expect(result.current[0].canvas).toStrictEqual(NO_CANVAS);
    });

    test("measures the page's frames while active", () => {
        const canvasRef = canvasRefSized();
        const { result } = renderHook(() => useFrameMeter(true, canvasRef));

        advance(1000);

        expect(result.current[0].frames.frameRate).toBeCloseTo(FAKE_FRAME_RATE);
    });

    test("reads windows of any length for the baseline", () => {
        const canvasRef = canvasRefSized();
        const { result } = renderHook(() => useFrameMeter(true, canvasRef));
        advance(1000);
        const [, read] = result.current;

        const frames = read(500);

        expect(frames.frameRate).toBeCloseTo(FAKE_FRAME_RATE);
    });

    test("clears its statistics when it stops", () => {
        const canvasRef = canvasRefSized();
        const { result, rerender } = renderHook(({ isActive }) => useFrameMeter(isActive, canvasRef), {
            initialProps: { isActive: true },
        });
        advance(1000);

        rerender({ isActive: false });

        expect(result.current[0]).toStrictEqual(NO_STATS);
    });
});
