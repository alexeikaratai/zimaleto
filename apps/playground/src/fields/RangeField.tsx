import type { ChangeEvent, ReactElement } from "react";

export type RangeFieldProps = {
    label: string;
    value: [number, number];
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: [number, number]) => void;
};

/** Two sliders for a `[min, max]` range. Each one stops at the other, so the range never flips. */
export function RangeField({ label, value, min, max, step, unit = "", onChange }: RangeFieldProps): ReactElement {
    const [low, high] = value;
    const rangeText = low === high ? `${low}${unit}` : `${low} – ${high}${unit}`;

    function handleLowChange(event: ChangeEvent<HTMLInputElement>): void {
        onChange([Math.min(event.currentTarget.valueAsNumber, high), high]);
    }

    function handleHighChange(event: ChangeEvent<HTMLInputElement>): void {
        onChange([low, Math.max(event.currentTarget.valueAsNumber, low)]);
    }

    return (
        <fieldset className="field">
            <legend className="field-legend">
                <span className="field-label">
                    {label}
                    <span
                        className="field-value"
                        aria-hidden
                    >
                        {rangeText}
                    </span>
                </span>
            </legend>
            <input
                type="range"
                aria-label={`${label}, minimum`}
                aria-valuetext={`${low}${unit}`}
                min={min}
                max={max}
                step={step}
                value={low}
                onChange={handleLowChange}
            />
            <input
                type="range"
                aria-label={`${label}, maximum`}
                aria-valuetext={`${high}${unit}`}
                min={min}
                max={max}
                step={step}
                value={high}
                onChange={handleHighChange}
            />
        </fieldset>
    );
}
