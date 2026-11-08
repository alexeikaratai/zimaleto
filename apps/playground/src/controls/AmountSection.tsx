import type { ReactElement } from "react";
import { type SelectChoice, SelectField } from "../fields/SelectField";
import { SliderField } from "../fields/SliderField";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";

type AmountMode = "count" | "density";

const AMOUNT_CHOICES: readonly SelectChoice<AmountMode>[] = [
    { value: "count", label: "A fixed count" },
    { value: "density", label: "Density, per 100×100 px" },
];

const DEFAULT_DENSITY = 0.6;

/** How many flakes fall: a fixed count, or a density that follows the canvas area. */
export function AmountSection({ options, onOptionsChange }: SectionProps): ReactElement {
    const amountMode: AmountMode = options.density === undefined ? "count" : "density";

    function handleAmountModeChange(nextMode: AmountMode): void {
        onOptionsChange({ density: nextMode === "density" ? DEFAULT_DENSITY : undefined });
    }

    return (
        <PanelSection title="Amount">
            <SelectField
                label="Number of flakes"
                value={amountMode}
                choices={AMOUNT_CHOICES}
                onChange={handleAmountModeChange}
            />
            {options.density === undefined ? (
                <SliderField
                    label="Count"
                    value={options.count}
                    min={0}
                    max={1000}
                    step={10}
                    onChange={(count) => onOptionsChange({ count })}
                />
            ) : (
                <SliderField
                    label="Density"
                    value={options.density}
                    min={0}
                    max={5}
                    step={0.05}
                    onChange={(density) => onOptionsChange({ density })}
                />
            )}
        </PanelSection>
    );
}
