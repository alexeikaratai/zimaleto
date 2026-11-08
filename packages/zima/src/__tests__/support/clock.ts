import type { Clock } from "../../engine/clock";

/** A clock whose frames run only when a test calls `tick()`. */
export type ManualClock = Clock & {
    /** Moves time forward and runs the frames requested so far. */
    tick(milliseconds?: number): void;
    /** How many frames are waiting to run. */
    readonly pendingFrames: number;
};

export function createManualClock(): ManualClock {
    const callbacks = new Map<number, (time: number) => void>();
    let now = 0;
    let nextHandle = 1;

    return {
        requestFrame(callback) {
            const handle = nextHandle;
            nextHandle += 1;
            callbacks.set(handle, callback);

            return handle;
        },
        cancelFrame(handle) {
            callbacks.delete(handle);
        },
        tick(milliseconds = 16) {
            now += milliseconds;
            const due = [...callbacks.values()];
            callbacks.clear();
            for (const callback of due) {
                callback(now);
            }
        },
        get pendingFrames() {
            return callbacks.size;
        },
    };
}
