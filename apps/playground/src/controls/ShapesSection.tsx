import type { ReactElement } from "react";
import { SliderField } from "../fields/SliderField";
import { SHAPE_LABELS, SHAPE_NAMES, type ShapeName } from "../options/shapes";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";

/** One weight slider per shape, which sets how common that shape is. */
export function ShapesSection({ options, onOptionsChange }: SectionProps): ReactElement {
    function handleWeightChange(name: ShapeName, weight: number): void {
        onOptionsChange({ shapeWeights: { ...options.shapeWeights, [name]: weight } });
    }

    return (
        <PanelSection title="Shapes">
            <p className="field-hint">
                Each flake picks a shape in proportion to its weight. 0 leaves a shape out; with every weight at 0, the
                snow falls back to dots.
            </p>
            {SHAPE_NAMES.map((name) => (
                <SliderField
                    key={name}
                    label={SHAPE_LABELS[name]}
                    value={options.shapeWeights[name]}
                    min={0}
                    max={5}
                    step={0.5}
                    onChange={(weight) => handleWeightChange(name, weight)}
                />
            ))}
        </PanelSection>
    );
}
