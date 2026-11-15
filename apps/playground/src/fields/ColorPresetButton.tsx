import type { ReactElement } from "react";
import { COLOR_PRESETS, type ColorPreset } from "../options/colorPresets";

export type ColorPresetButtonProps = {
    name: ColorPreset;
    isSelected: boolean;
    onSelect: (name: ColorPreset) => void;
};

/** A toggle button with a color preset's swatches and name. */
export function ColorPresetButton({ name, isSelected, onSelect }: ColorPresetButtonProps): ReactElement {
    function handleClick(): void {
        onSelect(name);
    }

    return (
        <button
            type="button"
            className="swatch"
            aria-pressed={isSelected}
            onClick={handleClick}
        >
            <span className="swatch-colors">
                {COLOR_PRESETS[name].map((color) => (
                    <span
                        key={color}
                        className="swatch-color"
                        style={{ background: color }}
                    />
                ))}
            </span>
            {name}
        </button>
    );
}
