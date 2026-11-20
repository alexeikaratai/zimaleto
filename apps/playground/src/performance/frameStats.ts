import { NO_FRAMES } from "./constants";
import type { FrameSample, FrameStats } from "./types";

/** The value that `share` of the values stay within, by nearest rank. The values must be sorted in ascending order. */
export function percentile(sortedValues: readonly number[], share: number): number {
    const rank = Math.max(1, Math.ceil(share * sortedValues.length));

    return sortedValues[rank - 1] ?? 0;
}

/** Statistics for consecutive frames, oldest first. */
export function summarizeFrames(frames: readonly FrameSample[]): FrameStats {
    const firstTime = frames[0]?.time ?? 0;
    const spanMs = (frames.at(-1)?.time ?? 0) - firstTime;

    if (spanMs <= 0) {
        return NO_FRAMES;
    }

    const intervals = frames.slice(1).map((frame, index) => frame.time - (frames[index] as FrameSample).time);
    intervals.sort((left, right) => left - right);
    const totalWorkMs = frames.reduce((total, frame) => total + frame.workMs, 0);

    return {
        frameRate: (intervals.length * 1000) / spanMs,
        medianIntervalMs: percentile(intervals, 0.5),
        p95IntervalMs: percentile(intervals, 0.95),
        workMs: totalWorkMs / frames.length,
    };
}
