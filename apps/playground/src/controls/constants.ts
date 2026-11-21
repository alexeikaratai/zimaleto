import type { ReducedMotion } from "@zimaleto/zima-react";
import type { SelectChoice } from "../fields";
import type { TargetMode } from "../options";
import type { AmountMode } from "./types";

export const MODE_CHOICES: readonly SelectChoice<TargetMode>[] = [
    { value: "container", label: "Inside an element" },
    { value: "canvas", label: "On my own <canvas>" },
    { value: "page", label: "Over the whole page" },
];

export const AMOUNT_CHOICES: readonly SelectChoice<AmountMode>[] = [
    { value: "count", label: "A fixed count" },
    { value: "density", label: "Density, per 100×100 px" },
];

/** The density the Amount section switches to: about the default count on a laptop screen. */
export const DEFAULT_DENSITY = 0.6;

/** The frame-rate choices. "default" leaves `fps` unset, so the core's own cap applies. */
export const FPS_CHOICES: readonly SelectChoice<string>[] = [
    { value: "default", label: "Default: up to 100 fps" },
    { value: "Infinity", label: "Every display frame" },
    { value: "60", label: "60 fps" },
    { value: "30", label: "30 fps" },
    { value: "15", label: "15 fps" },
];

export const DPR_CHOICES: readonly SelectChoice<string>[] = [
    { value: "1", label: "1×" },
    { value: "1.5", label: "1.5×" },
    { value: "2", label: "2×" },
    { value: "3", label: "3×" },
];

export const REDUCED_MOTION_CHOICES: readonly SelectChoice<ReducedMotion>[] = [
    { value: "static", label: "Static: one still frame" },
    { value: "reduce", label: "Reduce: half the flakes, slower" },
    { value: "ignore", label: "Ignore: animate as usual" },
];
