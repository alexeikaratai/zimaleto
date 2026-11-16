/** When a frame started, and how long the snow worked in it, both in ms. */
export type FrameSample = {
    time: number;
    workMs: number;
};

/** What a stretch of frames looked like. */
export type FrameStats = {
    /** Frames per second. */
    frameRate: number;
    /** The typical time between frames, in ms: the display's refresh interval while no frame drops. */
    medianIntervalMs: number;
    /** The time between frames that 95% of them stay within, in ms. */
    p95IntervalMs: number;
    /** The snow's main-thread time per frame, in ms. */
    workMs: number;
};

/** The statistics of fewer than two frames, which have no interval to measure. */
export const NO_FRAMES: FrameStats = { frameRate: 0, medianIntervalMs: 0, p95IntervalMs: 0, workMs: 0 };

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
