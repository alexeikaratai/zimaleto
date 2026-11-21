import type { Bench, FrameStats } from "../../performance";

/** The frame rate a simulated device reaches with a flake count and a pixel ratio. */
export type FrameRateModel = (count: number, maxDpr: number) => number;

/** A bench that remembers the flake counts it was given. */
export type SimulatedBench = Bench & {
    counts: number[];
};

/** The simulated display's refresh rate, which keeps its frame interval a whole 10 ms. */
export const REFRESH_RATE = 100;

/**
 * A bench on a simulated device. Measurements resolve at once with the model's frame rate, or the display's without
 * flakes. Their snow work is the pixel ratio, so tests can tell which ratio a measurement ran at.
 */
export function simulateBench(frameRateAt: FrameRateModel): SimulatedBench {
    const counts: number[] = [];
    let count = 0;
    let maxDpr = 2;

    return {
        counts,
        setCount(nextCount) {
            count = nextCount;
            counts.push(nextCount);
        },
        setMaxDpr(nextMaxDpr) {
            maxDpr = nextMaxDpr;
        },
        measure() {
            const frameRate = count === 0 ? REFRESH_RATE : frameRateAt(count, maxDpr);
            const stats: FrameStats = {
                frameRate,
                medianIntervalMs: 1000 / REFRESH_RATE,
                p95IntervalMs: 1000 / frameRate,
                workMs: maxDpr,
            };

            return Promise.resolve(stats);
        },
    };
}

/** A device that keeps the display's rate up to `capacity` flakes and drops to 80% of it beyond. */
export function capacityOf(capacity: number): FrameRateModel {
    return (count) => (count <= capacity ? REFRESH_RATE : REFRESH_RATE * 0.8);
}
