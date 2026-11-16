import { type FrameSample, type FrameStats, summarizeFrames } from "./frameStats";

/** A running measurement of the page's frames. */
export type FrameMeter = {
    /** Statistics for the frames of the last `windowMs`. */
    read(windowMs: number): FrameStats;
    /** Stops measuring and puts the browser's `requestAnimationFrame` back. */
    stop(): void;
};

// Four seconds at 240 Hz, longer than any measurement window.
const HISTORY_SIZE = 1024;

/**
 * Records when each frame starts, and how long the page's frame callbacks take, which in the playground is the snow's
 * work. The snow schedules its frames through `window.requestAnimationFrame`, so the meter wraps it until `stop()`.
 */
export function startFrameMeter(): FrameMeter {
    const requestFrame = window.requestAnimationFrame;
    const frames: FrameSample[] = [];
    let pendingWorkMs = 0;
    let handle = 0;

    function recordFrame(time: number): void {
        handle = requestFrame.call(window, recordFrame);
        frames.push({ time, workMs: pendingWorkMs });
        pendingWorkMs = 0;

        if (frames.length > HISTORY_SIZE) {
            frames.shift();
        }
    }

    handle = requestFrame.call(window, recordFrame);
    window.requestAnimationFrame = (callback) =>
        requestFrame.call(window, (time) => {
            const startMs = performance.now();
            callback(time);
            pendingWorkMs += performance.now() - startMs;
        });

    return {
        read(windowMs) {
            const latestTime = frames.at(-1)?.time ?? 0;

            return summarizeFrames(frames.filter(({ time }) => time >= latestTime - windowMs));
        },
        stop() {
            window.cancelAnimationFrame(handle);
            window.requestAnimationFrame = requestFrame;
        },
    };
}
