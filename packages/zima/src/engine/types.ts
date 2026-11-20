import type { SnowOptions } from "../options";
import type { Shape } from "../shapes";

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

/** Where frames come from. The browser clock wraps `requestAnimationFrame`; tests drive frames by hand. */
export type Clock = {
    requestFrame(callback: (time: number) => void): number;
    cancelFrame(handle: number): void;
};

/** The sprite for a shape and color, or `undefined` while the shape isn't ready. */
export type SpriteLookup = (shape: Shape, color: string, radius: number) => HTMLCanvasElement | undefined;
