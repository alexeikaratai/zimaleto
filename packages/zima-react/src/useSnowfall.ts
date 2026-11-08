import { createSnow, type Snow, type SnowOptions } from "@zimaleto/zima";
import { type RefObject, useEffect, useRef } from "react";

/** Options for `useSnowfall()`: every core option, plus `paused`. */
export type SnowfallOptions = SnowOptions & {
    /** Stops the snow while `true`; it resumes when `false` again. Reduced motion still applies. */
    paused?: boolean;
};

type OptionRecord = Record<string, unknown>;

// Arrays and objects compare by content, so a new but equal `shapes={[crystal]}` counts as unchanged.
function isEqual(first: unknown, second: unknown): boolean {
    if (first && second && typeof first === "object" && typeof second === "object") {
        const keys = Object.keys(first);

        return (
            keys.length === Object.keys(second).length &&
            keys.every((key) => isEqual((first as OptionRecord)[key], (second as OptionRecord)[key]))
        );
    }

    return Object.is(first, second);
}

/**
 * Runs a snowfall on an element you render, usually your own `<canvas>`.
 * The ref has to hold the element when the component mounts. Changed options go to
 * `snow.update()`, so the snowfall is never re-created on re-render.
 *
 * @example
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * useSnowfall(canvasRef, { density: 0.5 });
 *
 * return <canvas ref={canvasRef} />;
 */
export function useSnowfall(target: RefObject<HTMLElement | null>, { paused, ...options }: SnowfallOptions = {}): void {
    const snowRef = useRef<Snow>(null);
    const optionsRef = useRef<OptionRecord>(options);

    useEffect(
        function createSnowOnMount() {
            const element = target.current;

            if (!element) {
                return;
            }

            const snow = createSnow(element, optionsRef.current);
            snowRef.current = snow;

            return () => {
                snow.destroy();
                snowRef.current = null;
            };
        },
        [target],
    );

    useEffect(function syncOptions() {
        const previous = optionsRef.current;
        let changes: OptionRecord | undefined;

        for (const key in { ...previous, ...options }) {
            const value = (options as OptionRecord)[key];
            // A removed option comes back as undefined, so the core restores its default.
            if (!isEqual(previous[key], value)) {
                changes = { ...changes, [key]: value };
            }
        }

        if (changes) {
            optionsRef.current = options;
            snowRef.current?.update(changes);
        }
    });

    useEffect(
        function syncPaused() {
            snowRef.current?.[paused ? "stop" : "start"]();
        },
        [paused],
    );
}
