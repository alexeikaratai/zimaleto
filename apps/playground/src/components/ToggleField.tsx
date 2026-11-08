import type { ChangeEvent, ReactElement } from "react";

export type ToggleFieldProps = {
    label: string;
    checked: boolean;
    hint?: string;
    onChange: (checked: boolean) => void;
};

export function ToggleField({ label, checked, hint, onChange }: ToggleFieldProps): ReactElement {
    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        onChange(event.currentTarget.checked);
    }

    return (
        <label className="field field-toggle">
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
            />
            <span className="field-label">{label}</span>
            {hint && <span className="field-hint">{hint}</span>}
        </label>
    );
}
