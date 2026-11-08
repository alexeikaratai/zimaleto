import { onTestFinished } from "vitest";
import { createEngine, type Snow } from "../../engine/engine";
import type { SnowOptions } from "../../options/snowOptions";
import { createManualClock, type ManualClock } from "./clock";

/** A snowfall on a manual clock. */
export type StartedSnow = {
    snow: Snow;
    clock: ManualClock;
};

/** Starts a snowfall on a manual clock and destroys it after the test. */
export function startSnow(options: SnowOptions = {}, target?: HTMLElement): StartedSnow {
    const clock = createManualClock();
    const snow = createEngine(target, options, clock);
    onTestFinished(() => snow.destroy());

    return { snow, clock };
}
