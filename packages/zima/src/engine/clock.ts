import type { Clock } from "./types";

/** Frames from the browser, one per display refresh. */
export const BROWSER_CLOCK: Clock = {
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
};
