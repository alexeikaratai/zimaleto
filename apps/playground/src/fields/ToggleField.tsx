import { type ChangeEvent, type ReactElement, useId } from "react";

export type ToggleFieldProps = {
    label: string;
    checked: boolean;
    hint?: string;
    onChange: (checked: boolean) => void;
};

/** A checkbox with its label, and a hint that describes it. */
export function ToggleField({ label, checked, hint, onChange }: ToggleFieldProps): ReactElement {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        onChange(event.currentTarget.checked);
    }

    return (
        <div className="field field-toggle">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                aria-describedby={hintId}
                onChange={handleChange}
            />
            <label
                className="field-label"
                htmlFor={id}
            >
                {label}
            </label>
            {hint && (
                <p
                    id={hintId}
                    className="field-hint"
                >
                    {hint}
                </p>
            )}
        </div>
    );
}
