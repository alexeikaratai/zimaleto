import type { ChangeEvent, ReactElement } from "react";
import { SelectField, ToggleField } from "../fields";
import { DPR_CHOICES, FPS_CHOICES, REDUCED_MOTION_CHOICES } from "./constants";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./types";

/** How the snow is drawn: frame rate, pixel ratio, reduced motion, pausing and the random seed. */
export function RenderingSection({ options, onOptionsChange }: SectionProps): ReactElement {
    const fpsChoice = options.fps === undefined ? "default" : String(options.fps);

    function handleFpsChange(value: string): void {
        onOptionsChange({ fps: value === "default" ? undefined : Number(value) });
    }

    function handleMaxDprChange(value: string): void {
        onOptionsChange({ maxDpr: Number(value) });
    }

    function handleSeedChange(event: ChangeEvent<HTMLInputElement>): void {
        const { value } = event.currentTarget;
        onOptionsChange({ seed: value === "" ? undefined : Number(value) });
    }

    return (
        <PanelSection title="Rendering">
            <SelectField
                label="Frame rate"
                value={fpsChoice}
                choices={FPS_CHOICES}
                hint="The default skips frames on displays faster than 100 Hz: 60 fps at 120 Hz."
                onChange={handleFpsChange}
            />
            <SelectField
                label="Max pixel ratio"
                value={String(options.maxDpr)}
                choices={DPR_CHOICES}
                onChange={handleMaxDprChange}
            />
            <SelectField
                label="Reduced motion"
                value={options.reducedMotion}
                choices={REDUCED_MOTION_CHOICES}
                hint="Applies only when the OS asks for reduced motion."
                onChange={(reducedMotion) => onOptionsChange({ reducedMotion })}
            />
            <ToggleField
                label="Pause when hidden"
                checked={options.pauseWhenHidden}
                hint="In a background tab or when scrolled out of view."
                onChange={(pauseWhenHidden) => onOptionsChange({ pauseWhenHidden })}
            />
            <label className="field">
                <span className="field-label">Seed</span>
                <input
                    type="number"
                    placeholder="Random"
                    value={options.seed ?? ""}
                    onChange={handleSeedChange}
                />
            </label>
        </PanelSection>
    );
}
