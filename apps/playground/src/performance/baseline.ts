import { findCapacity } from "./capacity";
import { BASELINE_LOAD_COUNTS, BASELINE_MAX_DPRS, LOAD_TIMING } from "./constants";
import type { Baseline, Bench, CapacityAt, LoadAt } from "./types";

/** Finds the capacity at pixel ratios 1 and 2, then measures the frames at 150, 1,000 and 5,000 flakes at ratio 2. */
export async function runBaseline(bench: Bench): Promise<Baseline> {
    const capacities: CapacityAt[] = [];
    const loads: LoadAt[] = [];

    for (const maxDpr of BASELINE_MAX_DPRS) {
        bench.setMaxDpr(maxDpr);
        capacities.push({ maxDpr, ...(await findCapacity(bench)) });
    }

    for (const count of BASELINE_LOAD_COUNTS) {
        bench.setCount(count);
        loads.push({ count, ...(await bench.measure(LOAD_TIMING)) });
    }

    return { capacities, loads };
}
