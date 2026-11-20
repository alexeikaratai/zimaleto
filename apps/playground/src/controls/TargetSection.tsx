import type { ReactElement } from "react";
import { SelectField } from "../fields";
import type { TargetMode } from "../options";
import { MODE_CHOICES } from "./constants";
import { PanelSection } from "./PanelSection";

export type TargetSectionProps = {
    mode: TargetMode;
    isPaused: boolean;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (isPaused: boolean) => void;
    onRestart: () => void;
};

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
