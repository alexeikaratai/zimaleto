import type { Bench, MeasureTiming } from "./bench";

/** The most flakes a device draws without dropping frames. */
export type Capacity = {
    /** The flake count. */
    count: number;
    /** The display's frame rate, measured without flakes. */
    refreshRate: number;
    /** True when frames never dropped, so the device draws even more than `count`. */
    isAtLimit: boolean;
};

const START_COUNT = 250;
const MAX_COUNT = 64_000;
// Frames count as dropping below 95% of the display's rate, which a stray slow frame doesn't reach.
const SMOOTH_SHARE = 0.95;
// The search stops once the capacity is known to 10%, or to 25 flakes when it's tiny.
const PRECISION = 0.1;
const MIN_GAP = 25;
const STEP_TIMING: MeasureTiming = { settleMs: 500, windowMs: 1500 };

/**
 * Finds how many flakes keep the display's frame rate. It measures that rate without flakes first, then doubles the
 * count until frames drop and bisects between the last smooth count and the first dropping one.
 */
export async function findCapacity(bench: Bench): Promise<Capacity> {
    bench.setCount(0);
    const { medianIntervalMs } = await bench.measure(STEP_TIMING);
    const refreshRate = 1000 / medianIntervalMs;
    let smoothCount = 0;
    let droppingCount = Number.POSITIVE_INFINITY;
    let count = START_COUNT;

    while (droppingCount - smoothCount > Math.max(smoothCount * PRECISION, MIN_GAP) && smoothCount < MAX_COUNT) {
        bench.setCount(count);
        const { frameRate } = await bench.measure(STEP_TIMING);

        if (frameRate >= refreshRate * SMOOTH_SHARE) {
            smoothCount = count;
        } else {
            droppingCount = count;
        }

        const hasDropped = droppingCount !== Number.POSITIVE_INFINITY;
        count = hasDropped ? Math.round((smoothCount + droppingCount) / 2) : count * 2;
    }

    return { count: smoothCount, refreshRate, isAtLimit: droppingCount === Number.POSITIVE_INFINITY };
}
