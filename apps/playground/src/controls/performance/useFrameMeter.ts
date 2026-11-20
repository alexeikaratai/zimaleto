import { type RefObject, useEffect, useRef, useState } from "react";
import { type FrameMeter, type FrameStats, NO_FRAMES, type ReadFrames, startFrameMeter } from "../../performance";
import { LIVE_WINDOW_MS, NO_CANVAS, NO_STATS, REFRESH_INTERVAL_MS } from "./constants";
import type { CanvasSize, LiveStats } from "./types";

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
