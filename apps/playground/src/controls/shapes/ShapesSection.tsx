import type { ReactElement } from "react";
import { SliderField } from "../../fields";
import { DETAILED_OPTIONS, SHAPE_LABELS, SHAPE_NAMES, type ShapeName } from "../../options";
import { PanelSection } from "../PanelSection";
import type { SectionProps } from "../types";
import { FALLBACK_COLOR } from "./constants";
import { ShapeGallery } from "./ShapeGallery";

/** One weight slider per shape, the number of generated crystals, a preset for the detailed shapes, and a gallery. */
export function ShapesSection({ options, onOptionsChange }: SectionProps): ReactElement {
    const [firstColor = FALLBACK_COLOR] = options.color;

    function handleWeightChange(name: ShapeName, weight: number): void {
        onOptionsChange({ shapeWeights: { ...options.shapeWeights, [name]: weight } });
    }

    function handleCrystalCountChange(crystalCount: number): void {
        onOptionsChange({ crystalCount });
    }

    function handleDetailedClick(): void {
        onOptionsChange(DETAILED_OPTIONS);
    }

    return (
        <PanelSection title="Shapes">
            <p className="field-hint">
                Each flake picks a shape in proportion to its weight. 0 leaves a shape out; with every weight at 0, the
                snow falls back to dots. The generated crystals share their weight. Detailed shapes need a size of about
                6 px or more to read.
            </p>
            <div className="buttons">
                <button
                    type="button"
                    onClick={handleDetailedClick}
                >
                    Detailed shapes
                </button>
            </div>
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
            <SliderField
                label="Number of crystals"
                value={options.crystalCount}
                min={1}
                max={32}
                step={1}
                onChange={handleCrystalCountChange}
            />
            <ShapeGallery
                crystalCount={options.crystalCount}
                color={firstColor}
            />
        </PanelSection>
    );
}
