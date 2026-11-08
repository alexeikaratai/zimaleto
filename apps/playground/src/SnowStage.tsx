import { createSnow, type Snow, type SnowOptions } from "@zimaleto/zima";
import { type ReactElement, useEffect, useRef } from "react";
import type { TargetMode } from "./options";

export type SnowStageProps = {
    mode: TargetMode;
    options: SnowOptions;
    paused: boolean;
};

const CAPTIONS: Record<TargetMode, string> = {
    container: "createSnow(element) adds a canvas that fills the element.",
    canvas: "createSnow(canvas) draws on a canvas you own and leaves its styles alone.",
    page: "createSnow() lays a fixed canvas over the whole page. Clicks pass through it.",
};

/** Runs one snowfall for the chosen target. The playground drives the core directly, without the React wrapper. */
export function SnowStage({ mode, options, paused }: SnowStageProps): ReactElement {
    const elementRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const snowRef = useRef<Snow | null>(null);
    // Later changes reach the snow through update(), so creation only needs the first options.
    const initialOptionsRef = useRef(options);

    useEffect(
        function createSnowForTarget() {
            const target = mode === "canvas" ? canvasRef.current : elementRef.current;
            const snow =
                mode === "page" || !target
                    ? createSnow(initialOptionsRef.current)
                    : createSnow(target, initialOptionsRef.current);
            snowRef.current = snow;

            return () => {
                snow.destroy();
                snowRef.current = null;
            };
        },
        [mode],
    );

    useEffect(
        function syncOptions() {
            snowRef.current?.update(options);
        },
        [options],
    );

    useEffect(
        function syncPaused() {
            if (paused) {
                snowRef.current?.stop();
            } else {
                snowRef.current?.start();
            }
        },
        [paused],
    );

    return (
        <main className="stage">
            <p className="stage-caption">
                <code>{CAPTIONS[mode]}</code>
            </p>
            {mode === "canvas" ? (
                <canvas
                    ref={canvasRef}
                    className="snow-surface"
                />
            ) : (
                <div
                    ref={elementRef}
                    className="snow-surface"
                >
                    <h2 className="snow-title">Let it snow</h2>
                </div>
            )}
        </main>
    );
}
