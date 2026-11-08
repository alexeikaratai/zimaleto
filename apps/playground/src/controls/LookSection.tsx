import type { ReactElement } from "react";
import { ColorPresets } from "../fields/ColorPresets";
import { RangeField } from "../fields/RangeField";
import { ToggleField } from "../fields/ToggleField";
import { PanelSection } from "./PanelSection";
import type { SectionProps } from "./sectionProps";

/** How the flakes look: size, opacity, colors and depth. */
export function LookSection({ options, onOptionsChange }: SectionProps): ReactElement {
    return (
        <PanelSection title="Look">
            <RangeField
                label="Size"
                value={options.size}
                min={0.5}
                max={15}
                step={0.5}
                unit=" px"
                onChange={(size) => onOptionsChange({ size })}
            />
            <RangeField
                label="Opacity"
                value={options.opacity}
                min={0}
                max={1}
                step={0.05}
                onChange={(opacity) => onOptionsChange({ opacity })}
            />
            <ColorPresets
                value={options.color}
                onChange={(color) => onOptionsChange({ color })}
            />
            <ToggleField
                label="Parallax"
                checked={options.parallax}
                hint="Bigger flakes fall faster and look closer."
                onChange={(parallax) => onOptionsChange({ parallax })}
            />
        </PanelSection>
    );
}
