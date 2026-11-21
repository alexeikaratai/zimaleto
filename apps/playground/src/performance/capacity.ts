import {
    CAPACITY_MAX_COUNT,
    CAPACITY_MIN_GAP,
    CAPACITY_PRECISION,
    CAPACITY_START_COUNT,
    SMOOTH_SHARE,
    STEP_TIMING,
} from "./constants";
import type { Bench, Capacity } from "./types";

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
    let count = CAPACITY_START_COUNT;

    while (
        droppingCount - smoothCount > Math.max(smoothCount * CAPACITY_PRECISION, CAPACITY_MIN_GAP) &&
        smoothCount < CAPACITY_MAX_COUNT
    ) {
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
