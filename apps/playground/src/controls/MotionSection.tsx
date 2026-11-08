import type { ReactElement } from "react";
import { RangeField } from "../fields/RangeField";
import { SliderField } from "../fields/SliderField";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";

/** How the flakes move: fall speed, wind and gusts, sway and spin. */
export function MotionSection({ options, onOptionsChange }: SectionProps): ReactElement {
    return (
        <PanelSection title="Motion">
            <RangeField
                label="Speed"
                value={options.speed}
                min={0}
                max={400}
                step={5}
                unit=" px/s"
                onChange={(speed) => onOptionsChange({ speed })}
            />
            <SliderField
                label="Wind"
                value={options.wind}
                min={-300}
                max={300}
                step={5}
                unit=" px/s"
                onChange={(wind) => onOptionsChange({ wind })}
            />
            <SliderField
                label="Gusts"
                value={options.gust}
                min={0}
                max={300}
                step={5}
                unit=" px/s"
                onChange={(gust) => onOptionsChange({ gust })}
            />
            <RangeField
                label="Sway"
                value={options.sway}
                min={0}
                max={60}
                step={1}
                unit=" px"
                onChange={(sway) => onOptionsChange({ sway })}
            />
            <RangeField
                label="Rotation"
                value={options.rotation}
                min={-360}
                max={360}
                step={10}
                unit="°/s"
                onChange={(rotation) => onOptionsChange({ rotation })}
            />
            <p className="field-hint">Dots look the same at any angle; spin shows on the other shapes.</p>
        </PanelSection>
    );
}
