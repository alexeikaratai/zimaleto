import type { ChangeEvent, ReactElement } from "react";

export type SliderFieldProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: number) => void;
};

export function SliderField({ label, value, min, max, step, unit = "", onChange }: SliderFieldProps): ReactElement {
    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        onChange(event.currentTarget.valueAsNumber);
    }

    return (
        <label className="field">
            <span className="field-label">
                {label}
                <output className="field-value">
                    {value}
                    {unit}
                </output>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
            />
        </label>
    );
}
