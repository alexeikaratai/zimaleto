import type { ReactElement, RefObject } from "react";
import type { TargetMode } from "../../options/playgroundOptions";
import { STRESS_OPTIONS } from "../../options/presets";
import { PanelSection } from "../PanelSection";
import type { SectionProps } from "../sectionProps";
import { LiveStatsList } from "./LiveStatsList";
import { RunStatus } from "./RunStatus";
import { useBaselineRun } from "./useBaselineRun";
import { useFrameMeter } from "./useFrameMeter";

export type PerformanceSectionProps = SectionProps & {
    isPaused: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (isPaused: boolean) => void;
};

/** Live frame statistics, the stress test, and the baseline run that measures what the device can draw. */
export function PerformanceSection({
    options,
    isPaused,
    canvasRef,
    onOptionsChange,
    onModeChange,
    onPausedChange,
}: PerformanceSectionProps): ReactElement {
    const [live, read] = useFrameMeter(!isPaused, canvasRef);
    const [run, startRun, stopRun] = useBaselineRun({
        read,
        isPaused,
        onStart: handleBaselineStart,
        onOptionsChange,
    });
    const isRunning = run.status === "running";

    function handleStressClick(): void {
        onOptionsChange(STRESS_OPTIONS);
        onModeChange("page");
        onPausedChange(false);
    }

    // The baseline measures the stress test at every display frame, animated even when the OS asks for reduced motion.
    function handleBaselineStart(): void {
        handleStressClick();
        onOptionsChange({ fps: Number.POSITIVE_INFINITY, reducedMotion: "ignore" });
    }

    function handleRunClick(): void {
        if (isRunning) {
            stopRun();
        } else {
            startRun();
        }
    }

    return (
        <PanelSection title="Performance">
            <LiveStatsList
                live={live}
                options={options}
            />
            <div className="buttons">
                <button
                    type="button"
                    disabled={isRunning}
                    onClick={handleStressClick}
                >
                    Stress test
                </button>
                <button
                    type="button"
                    onClick={handleRunClick}
                >
                    {isRunning ? "Stop" : "Run baseline"}
                </button>
            </div>
            <RunStatus run={run} />
        </PanelSection>
    );
}
