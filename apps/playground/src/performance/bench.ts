import type { FrameStats, MeasureTiming, ReadFrames } from "./types";

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
