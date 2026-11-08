/** Where frames come from. The browser clock wraps `requestAnimationFrame`; tests drive frames by hand. */
export type Clock = {
    requestFrame(callback: (time: number) => void): number;
    cancelFrame(handle: number): void;
};

/** Frames from the browser, one per display refresh. */
export const BROWSER_CLOCK: Clock = {
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
};
