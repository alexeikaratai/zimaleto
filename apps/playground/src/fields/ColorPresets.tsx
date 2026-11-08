import type { ReactElement } from "react";
import { COLOR_PRESETS, type ColorPreset, PRESET_NAMES } from "../options/colorPresets";

export type ColorPresetsProps = {
    value: string[];
    onChange: (colors: string[]) => void;
};

type PresetButtonProps = {
    name: ColorPreset;
    isSelected: boolean;
    onSelect: (name: ColorPreset) => void;
};

function PresetButton({ name, isSelected, onSelect }: PresetButtonProps): ReactElement {
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

/** Buttons for the color presets; the one matching the current colors is pressed. */
export function ColorPresets({ value, onChange }: ColorPresetsProps): ReactElement {
    const selectedName = PRESET_NAMES.find((name) => COLOR_PRESETS[name].join() === value.join());

    function handleSelect(name: ColorPreset): void {
        onChange([...COLOR_PRESETS[name]]);
    }

    return (
        <fieldset className="field">
            <legend className="field-label">Colors</legend>
            <div className="swatches">
                {PRESET_NAMES.map((name) => (
                    <PresetButton
                        key={name}
                        name={name}
                        isSelected={name === selectedName}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        </fieldset>
    );
}
