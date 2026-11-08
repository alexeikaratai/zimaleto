import type { ReactElement } from "react";
import { type SelectChoice, SelectField } from "../fields/SelectField";
import type { TargetMode } from "../options/playgroundOptions";
import { PanelSection } from "./PanelSection";

export type TargetSectionProps = {
    mode: TargetMode;
    isPaused: boolean;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (isPaused: boolean) => void;
    onRestart: () => void;
};

const MODE_CHOICES: readonly SelectChoice<TargetMode>[] = [
    { value: "container", label: "Inside an element" },
    { value: "canvas", label: "On my own <canvas>" },
    { value: "page", label: "Over the whole page" },
];

/** Where the snow falls, and the buttons that pause it or start a new snowfall. */
export function TargetSection({
    mode,
    isPaused,
    onModeChange,
    onPausedChange,
    onRestart,
}: TargetSectionProps): ReactElement {
    function handlePlaybackClick(): void {
        onPausedChange(!isPaused);
    }

    return (
        <PanelSection title="Target">
            <SelectField
                label="Snow falls"
                value={mode}
                choices={MODE_CHOICES}
                onChange={onModeChange}
            />
            <div className="buttons">
                <button
                    type="button"
                    onClick={handlePlaybackClick}
                >
                    {isPaused ? "Start" : "Stop"}
                </button>
                <button
                    type="button"
                    onClick={onRestart}
                >
                    Restart
                </button>
            </div>
        </PanelSection>
    );
}
