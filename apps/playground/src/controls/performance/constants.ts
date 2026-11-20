import { NO_FRAMES } from "../../performance";
import type { CanvasSize, LiveStats, StopReason } from "./types";

/** How far back the live statistics look, in ms. */
export const LIVE_WINDOW_MS = 2000;
/** How often the live statistics refresh, in ms. */
export const REFRESH_INTERVAL_MS = 500;
export const NO_CANVAS: CanvasSize = { cssWidth: 0, cssHeight: 0, bitmapWidth: 0, bitmapHeight: 0 };
export const NO_STATS: LiveStats = { frames: NO_FRAMES, canvas: NO_CANVAS };

/** What the panel shows for a value it can't measure yet. */
export const NO_VALUE = "—";
/** The area that `density` counts flakes per, in CSS px², as in the core. */
export const AREA_PER_DENSITY_UNIT: number = 100 * 100;

export const STOP_MESSAGES: Record<StopReason, string> = {
    stopped: "Stopped.",
    hidden: "Stopped: the tab went to the background. Keep it in front while the baseline runs.",
    paused: "Stopped: the snow was paused.",
};
