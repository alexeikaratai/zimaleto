import type { ChangeEvent, ReactElement } from "react";

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

export function SelectField<Value extends string>({
    label,
    value,
    choices,
    hint,
    onChange,
}: SelectFieldProps<Value>): ReactElement {
    function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
        onChange(event.currentTarget.value as Value);
    }

    return (
        <label className="field">
            <span className="field-label">{label}</span>
            <select
                value={value}
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
            {hint && <span className="field-hint">{hint}</span>}
        </label>
    );
}
