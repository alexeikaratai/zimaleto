import type { Shape, SnowOptions } from "@zimaleto/zima";
import { type Mock, vi } from "vitest";

/** What the mocked `createSnow()` returns: spies, the arguments it got, and whether it would be animating. */
export type SnowMock = {
    canvas: HTMLCanvasElement;
    target: HTMLElement;
    options: SnowOptions;
    isRunning: boolean;
    isDestroyed: boolean;
    start: Mock<() => void>;
    stop: Mock<() => void>;
    update: Mock<(options: SnowOptions) => void>;
    destroy: Mock<() => void>;
};

/** The fake core: `createSnow()` and every snowfall it made since the last reset. */
export type CoreMock = {
    createSnow: Mock<(target: HTMLElement, options?: SnowOptions) => SnowMock>;
    instances: SnowMock[];
};

const instances: SnowMock[] = [];

/**
 * Shared by the `vi.mock()` factories and the tests, which import this module and get the same instance.
 * Tests clear `instances` after each run.
 */
export const core: CoreMock = {
    instances,
    createSnow: vi.fn((target: HTMLElement, options: SnowOptions = {}) => {
        const snow: SnowMock = {
            canvas: target as HTMLCanvasElement,
            target,
            options,
            // The real snowfall starts animating as soon as it's created.
            isRunning: true,
            isDestroyed: false,
            start: vi.fn(() => {
                snow.isRunning = true;
            }),
            stop: vi.fn(() => {
                snow.isRunning = false;
            }),
            update: vi.fn(),
            destroy: vi.fn(() => {
                snow.isRunning = false;
                snow.isDestroyed = true;
            }),
        };
        instances.push(snow);

        return snow;
    }),
};

/** A shape that draws nothing; with the core mocked, only its identity matters. */
export const sparkle: Shape = () => undefined;

/** The one snowfall that hasn't been destroyed, as StrictMode leaves it after mounting twice. */
export function liveSnow(): SnowMock | undefined {
    return instances.find((snow) => !snow.isDestroyed);
}
