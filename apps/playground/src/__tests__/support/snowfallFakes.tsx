import type { SnowfallOptions, SnowfallProps } from "@zimaleto/zima-react";
import type { ReactElement, RefObject } from "react";

/** One call of the fake `useSnowfall()`: the element it snows on and the options it got. */
export type SnowfallHookCall = {
    target: RefObject<HTMLElement | null>;
    options: SnowfallOptions;
};

/** What the fakes recorded: the props of every `<Snowfall>` render and every `useSnowfall()` call. */
export type SnowfallRecord = {
    renders: SnowfallProps[];
    hookCalls: SnowfallHookCall[];
};

/**
 * Shared by the `vi.mock()` factories and the tests, which import this module and get the same instance.
 * Tests clear it after each run.
 */
export const recorded: SnowfallRecord = { renders: [], hookCalls: [] };

/** A `<Snowfall>` that records its props and renders an empty canvas, since happy-dom can't draw. */
export function FakeSnowfall({ ref, ...props }: SnowfallProps): ReactElement {
    recorded.renders.push(props);

    return (
        <canvas
            ref={ref}
            className={props.className}
            data-fullscreen={props.fullscreen}
            aria-label="Snowfall"
        />
    );
}

/** A `useSnowfall()` that records its arguments. */
export function fakeUseSnowfall(target: RefObject<HTMLElement | null>, options: SnowfallOptions = {}): void {
    recorded.hookCalls.push({ target, options });
}

/** Forgets every render and call. */
export function clearRecorded(): void {
    recorded.renders.length = 0;
    recorded.hookCalls.length = 0;
}

/** The props of the latest `<Snowfall>` render. */
export function lastSnowfallProps(): SnowfallProps | undefined {
    return recorded.renders.at(-1);
}
