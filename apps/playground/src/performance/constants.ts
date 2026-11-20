import type { FrameStats, MeasureTiming } from "./types";

/** The statistics of fewer than two frames, which have no interval to measure. */
export const NO_FRAMES: FrameStats = { frameRate: 0, medianIntervalMs: 0, p95IntervalMs: 0, workMs: 0 };

/** How many frames the meter keeps: four seconds at 240 Hz, longer than any measurement window. */
export const HISTORY_SIZE = 1024;

/** The pixel ratios the baseline finds the capacity at. */
export const BASELINE_MAX_DPRS: readonly number[] = [1, 2];
/** The flake counts the baseline measures the frames at, at pixel ratio 2. */
export const BASELINE_LOAD_COUNTS: readonly number[] = [150, 1000, 5000];
export const LOAD_TIMING: MeasureTiming = { settleMs: 1000, windowMs: 3000 };

export const CAPACITY_START_COUNT = 250;
export const CAPACITY_MAX_COUNT = 64_000;
/** Frames count as dropping below 95% of the display's rate, which a stray slow frame doesn't reach. */
export const SMOOTH_SHARE = 0.95;
/** The capacity search stops once the capacity is known to this share of it, or to `CAPACITY_MIN_GAP` when it's tiny. */
export const CAPACITY_PRECISION = 0.1;
/** The narrowest the capacity search gets, in flakes. */
export const CAPACITY_MIN_GAP = 25;
export const STEP_TIMING: MeasureTiming = { settleMs: 500, windowMs: 1500 };
