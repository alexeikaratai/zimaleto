import type { FrameStats } from "./frameStats";

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

/** Waits for the snow to settle and for the window to pass, then reads its frames. An abort rejects with its reason. */
export function measureFrames(read: ReadFrames, timing: MeasureTiming, signal: AbortSignal): Promise<FrameStats> {
    const { settleMs, windowMs } = timing;

    return new Promise((resolve, reject) => {
        function handleAbort(): void {
            clearTimeout(timer);
            reject(signal.reason);
        }

        const timer = setTimeout(() => {
            signal.removeEventListener("abort", handleAbort);
            resolve(read(windowMs));
        }, settleMs + windowMs);

        if (signal.aborted) {
            handleAbort();
        } else {
            signal.addEventListener("abort", handleAbort, { once: true });
        }
    });
}
