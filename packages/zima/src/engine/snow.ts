import type { SnowOptions } from "../options/snowOptions";

/** A running snowfall. */
export type Snow = {
    /** The canvas the snow is drawn on: the one you passed in, or the one `createSnow()` added. */
    readonly canvas: HTMLCanvasElement;
    /** Resumes the animation after `stop()`. Reduced motion still applies. */
    start(): void;
    /** Pauses the animation and keeps the last frame on screen. Only `start()` resumes it; showing the tab again doesn't. */
    stop(): void;
    /** Changes options live, without re-creating anything. A key set to `undefined` goes back to its default. */
    update(options: SnowOptions): void;
    /** Stops the loop, disconnects observers and removes the canvas it added. Calling it again does nothing. */
    destroy(): void;
};
