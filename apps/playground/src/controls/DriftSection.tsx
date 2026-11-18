import type { ReactElement } from "react";
import { SliderField } from "../fields/SliderField";
import { ToggleField } from "../fields/ToggleField";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";

export type DriftSectionProps = SectionProps & {
    onRestart: () => void;
};

/** Snow that settles at the bottom of the canvas: on or off, how deep it gets, how fast it melts, and a fresh start. */
export function DriftSection({ options, onOptionsChange, onRestart }: DriftSectionProps): ReactElement {
    function handleDriftingChange(isDrifting: boolean): void {
        onOptionsChange({ isDrifting });
    }

    function handleDepthChange(driftDepth: number): void {
        onOptionsChange({ driftDepth });
    }

    function handleMeltChange(driftMelt: number): void {
        onOptionsChange({ driftMelt });
    }

    return (
        <PanelSection title="Drift">
            <ToggleField
                label="Let the snow pile up"
                checked={options.isDrifting}
                hint="ground: drift() settles flakes at the bottom of the canvas."
                onChange={handleDriftingChange}
            />
            <SliderField
                label="Depth"
                value={options.driftDepth}
                min={10}
                max={120}
                step={5}
                unit=" px"
                onChange={handleDepthChange}
            />
            <SliderField
                label="Melt"
                value={options.driftMelt}
                min={0}
                max={10}
                step={0.5}
                unit=" px/s"
                onChange={handleMeltChange}
            />
            <div className="buttons">
                <button
                    type="button"
                    onClick={onRestart}
                >
                    Start over
                </button>
            </div>
            <p className="field-hint">Starting over begins a new snowfall with an empty drift.</p>
        </PanelSection>
    );
}
