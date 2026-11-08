import { type ChangeEvent, type ReactElement, useId } from "react";

export type SliderFieldProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: number) => void;
};

/** A slider with its label and its current value. Screen readers get the value with its unit from the slider itself. */
export function SliderField({ label, value, min, max, step, unit = "", onChange }: SliderFieldProps): ReactElement {
    const id = useId();
    const valueText = `${value}${unit}`;

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        onChange(event.currentTarget.valueAsNumber);
    }

    return (
        <div className="field">
            <div className="field-label">
                <label htmlFor={id}>{label}</label>
                <span
                    className="field-value"
                    aria-hidden
                >
                    {valueText}
                </span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-valuetext={valueText}
                onChange={handleChange}
            />
        </div>
    );
}
