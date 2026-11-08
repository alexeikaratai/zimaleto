import type { ReducedMotion } from "@zimaleto/zima-react";
import type { ChangeEvent, ReactElement } from "react";
import { type SelectChoice, SelectField } from "../fields/SelectField";
import { ToggleField } from "../fields/ToggleField";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";

const FPS_CHOICES: readonly SelectChoice<string>[] = [
    { value: "display", label: "Display refresh rate" },
    { value: "60", label: "60 fps" },
    { value: "30", label: "30 fps" },
    { value: "15", label: "15 fps" },
];

const DPR_CHOICES: readonly SelectChoice<string>[] = [
    { value: "1", label: "1×" },
    { value: "1.5", label: "1.5×" },
    { value: "2", label: "2×" },
    { value: "3", label: "3×" },
];

const REDUCED_MOTION_CHOICES: readonly SelectChoice<ReducedMotion>[] = [
    { value: "static", label: "Static: one still frame" },
    { value: "reduce", label: "Reduce: half the flakes, slower" },
    { value: "ignore", label: "Ignore: animate as usual" },
];

/** How the snow is drawn: frame rate, pixel ratio, reduced motion, pausing and the random seed. */
export function RenderingSection({ options, onOptionsChange }: SectionProps): ReactElement {
    const fpsChoice = options.fps === undefined ? "display" : String(options.fps);

    function handleFpsChange(value: string): void {
        onOptionsChange({ fps: value === "display" ? undefined : Number(value) });
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
