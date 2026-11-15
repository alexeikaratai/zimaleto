import type { ReactElement, RefObject } from "react";
import type { PlaygroundOptions, TargetMode } from "../options/playgroundOptions";
import { STRESS_OPTIONS } from "../options/presets";
import { BaselineTable } from "./BaselineTable";
import { formatCount, formatMs } from "./format";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";
import { type BaselineRun, type StopReason, useBaselineRun } from "./useBaselineRun";
import { type CanvasSize, useFrameMeter } from "./useFrameMeter";

export type PerformanceSectionProps = SectionProps & {
    isPaused: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (isPaused: boolean) => void;
};

type RunStatusProps = {
    run: BaselineRun;
};

const AREA_PER_DENSITY_UNIT = 100 * 100;

const STOP_MESSAGES: Record<StopReason, string> = {
    stopped: "Stopped.",
    hidden: "Stopped: the tab went to the background. Keep it in front while the baseline runs.",
    paused: "Stopped: the snow was paused.",
};

function countFlakes(options: PlaygroundOptions, canvas: CanvasSize): string {
    const { count, density } = options;

    if (density === undefined) {
        return formatCount(count);
    }

    return canvas.cssWidth ? formatCount((density * canvas.cssWidth * canvas.cssHeight) / AREA_PER_DENSITY_UNIT) : "—";
}

function describeCanvas({ bitmapWidth, bitmapHeight }: CanvasSize): string {
    const megapixels = (bitmapWidth * bitmapHeight) / 1_000_000;

    return bitmapWidth ? `${bitmapWidth} × ${bitmapHeight} px, ${megapixels.toFixed(1)} MP` : "—";
}

function RunStatus({ run }: RunStatusProps): ReactElement {
    switch (run.status) {
        case "idle":
            return (
                <p className="field-hint">
                    The baseline finds how many flakes keep the full frame rate at pixel ratios 1 and 2, then measures
                    150, 1,000 and 5,000 flakes. It takes about a minute; keep the tab in front.
                </p>
            );
        case "running":
            return (
                <p
                    className="field-hint"
                    role="status"
                >
                    Measuring {formatCount(run.count)} flakes at pixel ratio {run.maxDpr}…
                </p>
            );
        case "stopped":
            return (
                <p
                    className="field-hint"
                    role="status"
                >
                    {STOP_MESSAGES[run.reason]}
                </p>
            );
        case "done":
            return <BaselineTable baseline={run.baseline} />;
    }
}

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
    const { frames, canvas } = live;
    const hasFrames = frames.frameRate > 0;
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

    return (
        <PanelSection title="Performance">
            <dl className="stats">
                <dt>Frame rate</dt>
                <dd>{hasFrames ? `${Math.round(frames.frameRate)} fps` : "—"}</dd>
                <dt>Frame interval</dt>
                <dd>
                    {hasFrames ? `${formatMs(frames.medianIntervalMs)}, p95 ${formatMs(frames.p95IntervalMs)}` : "—"}
                </dd>
                <dt>Snow work</dt>
                <dd>{hasFrames ? `${formatMs(frames.workMs, 2)} a frame` : "—"}</dd>
                <dt>Flakes</dt>
                <dd>{countFlakes(options, canvas)}</dd>
                <dt>Canvas</dt>
                <dd>{describeCanvas(canvas)}</dd>
            </dl>
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
                    onClick={isRunning ? stopRun : startRun}
                >
                    {isRunning ? "Stop" : "Run baseline"}
                </button>
            </div>
            <RunStatus run={run} />
        </PanelSection>
    );
}
