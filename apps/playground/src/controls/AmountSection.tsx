import type { ReactElement } from "react";
import { SelectField, SliderField } from "../fields";
import { AMOUNT_CHOICES, DEFAULT_DENSITY } from "./constants";
import { PanelSection } from "./PanelSection";
import type { AmountMode, SectionProps } from "./types";

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
                    max={5000}
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
