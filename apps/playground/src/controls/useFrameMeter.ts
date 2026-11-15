import { type RefObject, useEffect, useRef, useState } from "react";
import type { ReadFrames } from "../performance/bench";
import { type FrameMeter, startFrameMeter } from "../performance/frameMeter";
import { type FrameStats, NO_FRAMES } from "../performance/frameStats";

/** The size of the snow's canvas: in CSS px, and in device px for its bitmap. */
export type CanvasSize = {
    cssWidth: number;
    cssHeight: number;
    bitmapWidth: number;
    bitmapHeight: number;
};

/** The frames of the last two seconds and the canvas size, refreshed twice a second. */
export type LiveStats = {
    frames: FrameStats;
    canvas: CanvasSize;
};

const LIVE_WINDOW_MS = 2000;
const REFRESH_INTERVAL_MS = 500;
const NO_CANVAS: CanvasSize = { cssWidth: 0, cssHeight: 0, bitmapWidth: 0, bitmapHeight: 0 };
const NO_STATS: LiveStats = { frames: NO_FRAMES, canvas: NO_CANVAS };

function measureCanvas(canvas: HTMLCanvasElement | null): CanvasSize {
    return canvas
        ? {
              cssWidth: canvas.clientWidth,
              cssHeight: canvas.clientHeight,
              bitmapWidth: canvas.width,
              bitmapHeight: canvas.height,
          }
        : NO_CANVAS;
}

/**
 * Measures the page's frames while `isActive`, and returns live statistics along with `read`, which reads windows of
 * any length for the baseline.
 */
export function useFrameMeter(
    isActive: boolean,
    canvasRef: RefObject<HTMLCanvasElement | null>,
): [live: LiveStats, read: ReadFrames] {
    const meterRef = useRef<FrameMeter | undefined>(undefined);
    const [live, setLive] = useState(NO_STATS);

    useEffect(
        function measureWhileActive() {
            if (!isActive) {
                return;
            }

            const meter = startFrameMeter();
            const timer = setInterval(() => {
                setLive({ frames: meter.read(LIVE_WINDOW_MS), canvas: measureCanvas(canvasRef.current) });
            }, REFRESH_INTERVAL_MS);
            meterRef.current = meter;

            return () => {
                clearInterval(timer);
                meter.stop();
                meterRef.current = undefined;
                setLive(NO_STATS);
            };
        },
        [isActive, canvasRef],
    );

    function read(windowMs: number): FrameStats {
        return meterRef.current?.read(windowMs) ?? NO_FRAMES;
    }

    return [live, read];
}
