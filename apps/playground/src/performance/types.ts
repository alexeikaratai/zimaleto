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

/** A running measurement of the page's frames. */
export type FrameMeter = {
    /** Statistics for the frames of the last `windowMs`. */
    read(windowMs: number): FrameStats;
    /** Stops measuring and puts the browser's `requestAnimationFrame` back. */
    stop(): void;
};

/** How long a measurement lets the snow settle after a change, and how long it then records frames, in ms. */
export type MeasureTiming = {
    settleMs: number;
    windowMs: number;
};

/** What a measurement drives: the snow's flake count and pixel ratio, and a reading of the frames that follow. */
export type Bench = {
    setCount(count: number): void;
    setMaxDpr(maxDpr: number): void;
    measure(timing: MeasureTiming): Promise<FrameStats>;
};

/** Reads the frames of the last `windowMs`. */
export type ReadFrames = (windowMs: number) => FrameStats;

/** The most flakes a device draws without dropping frames. */
export type Capacity = {
    /** The flake count. */
    count: number;
    /** The display's frame rate, measured without flakes. */
    refreshRate: number;
    /** True when frames never dropped, so the device draws even more than `count`. */
    isAtLimit: boolean;
};

/** The capacity under one `maxDpr`. */
export type CapacityAt = Capacity & {
    maxDpr: number;
};

/** The frames at one flake count. */
export type LoadAt = FrameStats & {
    count: number;
};

/** The measurements of the performance baseline in PLAN.md §11. */
export type Baseline = {
    capacities: CapacityAt[];
    loads: LoadAt[];
};
