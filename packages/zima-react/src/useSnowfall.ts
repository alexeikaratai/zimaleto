import { createSnow, type Snow, type SnowOptions } from "@zimaleto/zima";
import { type RefObject, useEffect, useRef } from "react";
import { isEqual } from "./isEqual";

/** Options for `useSnowfall()`: every core option, plus `paused`. */
export type SnowfallOptions = SnowOptions & {
    /** Stops the snow while `true` and keeps its last frame on screen; it resumes when `false` again. Reduced motion still applies. */
    paused?: boolean | undefined;
};

type OptionValues = Record<string, unknown>;

/**
 * Runs a snowfall on an element you render, usually your own `<canvas>`, which needs a CSS size.
 * The ref has to hold the element when the component mounts and keep holding the same one; to move the snow,
 * remount the component that calls `useSnowfall()`. Changed options go to `snow.update()`, so the snowfall is never
 * re-created on re-render. Options compare by value, but custom shapes compare by identity, so create them once.
 *
 * @example
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * useSnowfall(canvasRef, { density: 0.5 });
 *
 * return <canvas ref={canvasRef} style={{ width: "100%", height: 300 }} />;
 */
export function useSnowfall(target: RefObject<HTMLElement | null>, { paused, ...options }: SnowfallOptions = {}): void {
    const snowRef = useRef<Snow>(null);
    const optionsRef = useRef<OptionValues>(options);

    useEffect(
        function createSnowForTarget() {
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
        let changes: OptionValues | undefined;

        for (const key in { ...previous, ...options }) {
            const value = (options as OptionValues)[key];
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

    // After every render, so a snowfall created for a new target is paused too; start() and stop() cost nothing
    // when the state doesn't change.
    useEffect(function syncPaused() {
        if (paused) {
            snowRef.current?.stop();
        } else {
            snowRef.current?.start();
        }
    });
}
