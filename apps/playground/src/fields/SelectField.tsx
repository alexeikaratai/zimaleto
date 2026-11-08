import { type ChangeEvent, type ReactElement, useId } from "react";

export type SelectChoice<Value extends string> = {
    value: Value;
    label: string;
};

export type SelectFieldProps<Value extends string> = {
    label: string;
    value: Value;
    choices: readonly SelectChoice<Value>[];
    hint?: string;
    onChange: (value: Value) => void;
};

/** A dropdown with its label, and a hint that describes it. */
export function SelectField<Value extends string>({
    label,
    value,
    choices,
    hint,
    onChange,
}: SelectFieldProps<Value>): ReactElement {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;

    function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
        onChange(event.currentTarget.value as Value);
    }

    return (
        <div className="field">
            <label
                className="field-label"
                htmlFor={id}
            >
                {label}
            </label>
            <select
                id={id}
                value={value}
                aria-describedby={hintId}
                onChange={handleChange}
            >
                {choices.map((choice) => (
                    <option
                        key={choice.value}
                        value={choice.value}
                    >
                        {choice.label}
                    </option>
                ))}
            </select>
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
