import type { Shape, SnowOptions } from "@zimaleto/zima";
import { type Mock, vi } from "vitest";

/** What the mocked `createSnow()` returns, with spies and the arguments it got. */
export type SnowMock = {
    canvas: HTMLCanvasElement;
    target: HTMLElement;
    options: SnowOptions;
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
            isDestroyed: false,
            start: vi.fn(),
            stop: vi.fn(),
            update: vi.fn(),
            destroy: vi.fn(() => {
                snow.isDestroyed = true;
            }),
        };
        instances.push(snow);

        return snow;
    }),
};

/** A shape that draws nothing; with the core mocked, only its identity matters. */
export const sparkle: Shape = () => undefined;
