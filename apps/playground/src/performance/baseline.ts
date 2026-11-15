import type { Bench, MeasureTiming } from "./bench";
import { type Capacity, findCapacity } from "./capacity";
import type { FrameStats } from "./frameStats";

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

const MAX_DPRS = [1, 2];
const LOAD_COUNTS = [150, 1000, 5000];
const LOAD_TIMING: MeasureTiming = { settleMs: 1000, windowMs: 3000 };

/** Finds the capacity at pixel ratios 1 and 2, then measures the frames at 150, 1,000 and 5,000 flakes at ratio 2. */
export async function runBaseline(bench: Bench): Promise<Baseline> {
    const capacities: CapacityAt[] = [];
    const loads: LoadAt[] = [];

    for (const maxDpr of MAX_DPRS) {
        bench.setMaxDpr(maxDpr);
        capacities.push({ maxDpr, ...(await findCapacity(bench)) });
    }

    for (const count of LOAD_COUNTS) {
        bench.setCount(count);
        loads.push({ count, ...(await bench.measure(LOAD_TIMING)) });
    }

    return { capacities, loads };
}
