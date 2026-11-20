import type { ReactElement } from "react";
import { COLOR_PRESETS, type ColorPreset, PRESET_NAMES } from "../options";
import { ColorPresetButton } from "./ColorPresetButton";

export type ColorPresetsProps = {
    value: string[];
    onChange: (colors: string[]) => void;
};

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
                    <ColorPresetButton
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
