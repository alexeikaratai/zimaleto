import type { PlaygroundOptions } from "../../options";
import type { Baseline, FrameStats, ReadFrames } from "../../performance";

/** Why a run ended early: the Stop button, a hidden tab, or paused snow. */
export type StopReason = "stopped" | "hidden" | "paused";

/** What a running baseline is measuring. */
export type RunProgress = {
    count: number;
    maxDpr: number;
};

/** Where the baseline run is. */
export type BaselineRun =
    | { status: "idle" }
    | ({ status: "running" } & RunProgress)
    | { status: "done"; baseline: Baseline }
    | { status: "stopped"; reason: StopReason };

/** What `useBaselineRun()` needs: a way to read the frames, whether the snow is paused, and how to drive it. */
export type BaselineRunOptions = {
    read: ReadFrames;
    isPaused: boolean;
    /** Sets up the snow that the run measures. */
    onStart: () => void;
    onOptionsChange: (changes: Partial<PlaygroundOptions>) => void;
};

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
