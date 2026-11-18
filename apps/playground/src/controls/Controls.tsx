import type { ReactElement, RefObject } from "react";
import type { TargetMode } from "../options/playgroundOptions";
import { AmountSection } from "./AmountSection";
import { LookSection } from "./LookSection";
import { MotionSection } from "./MotionSection";
import { PerformanceSection } from "./performance/PerformanceSection";
import { RenderingSection } from "./RenderingSection";
import type { SectionProps } from "./sectionProps";
import { ShapesSection } from "./shapes/ShapesSection";
import { TargetSection } from "./TargetSection";

export type ControlsProps = SectionProps & {
    mode: TargetMode;
    isPaused: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (isPaused: boolean) => void;
    onRestart: () => void;
};

/** The side panel with every control, grouped into sections. */
export function Controls({
    options,
    mode,
    isPaused,
    canvasRef,
    onOptionsChange,
    onModeChange,
    onPausedChange,
    onRestart,
}: ControlsProps): ReactElement {
    return (
        <aside className="panel">
            <header className="panel-header">
                <h1>zima</h1>
                <p>
                    Options reach the running snow as props of <code>&lt;Snowfall&gt;</code>, which hands them to{" "}
                    <code>snow.update()</code>. Changing the target or pressing Restart starts a new snowfall.
                </p>
            </header>
            <TargetSection
                mode={mode}
                isPaused={isPaused}
                onModeChange={onModeChange}
                onPausedChange={onPausedChange}
                onRestart={onRestart}
            />
            <PerformanceSection
                options={options}
                isPaused={isPaused}
                canvasRef={canvasRef}
                onOptionsChange={onOptionsChange}
                onModeChange={onModeChange}
                onPausedChange={onPausedChange}
            />
            <AmountSection
                options={options}
                onOptionsChange={onOptionsChange}
            />
            <MotionSection
                options={options}
                onOptionsChange={onOptionsChange}
            />
            <ShapesSection
                options={options}
                onOptionsChange={onOptionsChange}
            />
            <LookSection
                options={options}
                onOptionsChange={onOptionsChange}
            />
            <RenderingSection
                options={options}
                onOptionsChange={onOptionsChange}
            />
        </aside>
    );
}
