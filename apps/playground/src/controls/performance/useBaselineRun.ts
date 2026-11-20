import { useEffect, useRef, useState } from "react";
import { INITIAL_OPTIONS } from "../../options";
import { type Bench, measureFrames, runBaseline } from "../../performance";
import type { BaselineRun, BaselineRunOptions, RunProgress, StopReason } from "./types";

function toStopReason(reason: unknown): StopReason {
    return reason === "hidden" || reason === "paused" ? reason : "stopped";
}

/**
 * Runs the performance baseline on the live snow, driving its flake count and pixel ratio. A hidden tab or paused snow
 * stops it, because their frames would measure nothing.
 */
export function useBaselineRun({
    read,
    isPaused,
    onStart,
    onOptionsChange,
}: BaselineRunOptions): [run: BaselineRun, start: () => void, stop: () => void] {
    const [run, setRun] = useState<BaselineRun>({ status: "idle" });
    const controllerRef = useRef<AbortController | undefined>(undefined);

    useEffect(function stopWhenHidden() {
        function handleVisibilityChange(): void {
            if (document.hidden) {
                controllerRef.current?.abort("hidden");
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            controllerRef.current?.abort("stopped");
        };
    }, []);

    useEffect(
        function stopWhenPaused() {
            if (isPaused) {
                controllerRef.current?.abort("paused");
            }
        },
        [isPaused],
    );

    function start(): void {
        const controller = new AbortController();
        let progress: RunProgress = { count: 0, maxDpr: INITIAL_OPTIONS.maxDpr };

        function report(changes: Partial<RunProgress>): void {
            progress = { ...progress, ...changes };
            setRun({ status: "running", ...progress });
            onOptionsChange(changes);
        }

        const bench: Bench = {
            setCount: (count) => report({ count }),
            setMaxDpr: (maxDpr) => report({ maxDpr }),
            measure: (timing) => measureFrames(read, timing, controller.signal),
        };

        controllerRef.current = controller;
        onStart();
        runBaseline(bench)
            .then(
                (baseline) => setRun({ status: "done", baseline }),
                (reason: unknown) => setRun({ status: "stopped", reason: toStopReason(reason) }),
            )
            .finally(() => {
                controllerRef.current = undefined;
                onOptionsChange({ maxDpr: INITIAL_OPTIONS.maxDpr });
            });
    }

    function stop(): void {
        controllerRef.current?.abort("stopped");
    }

    return [run, start, stop];
}
