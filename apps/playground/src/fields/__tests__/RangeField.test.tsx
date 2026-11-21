import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { RangeField, type RangeFieldProps } from "../RangeField";

afterEach(cleanup);

function renderRange({ value = [2, 5], onChange = vi.fn() }: Partial<RangeFieldProps> = {}): void {
    render(
        <RangeField
            label="Size"
            value={value}
            min={0}
            max={15}
            step={0.5}
            unit=" px"
            onChange={onChange}
        />,
    );
}

describe("<RangeField>", () => {
    test("shows both ends of the range", () => {
        renderRange();

        expect(screen.getByText("2 – 5 px")).toBeTruthy();
    });

    test("shows a single value when both ends meet", () => {
        renderRange({ value: [4, 4] });

        expect(screen.getByText("4 px")).toBeTruthy();
    });

    test("moves the low end", () => {
        const handleChange = vi.fn();
        renderRange({ onChange: handleChange });

        fireEvent.change(screen.getByRole("slider", { name: "Size, minimum" }), { target: { value: "3" } });

        expect(handleChange).toHaveBeenCalledWith([3, 5]);
    });

    test("stops the low end at the high end", () => {
        const handleChange = vi.fn();
        renderRange({ onChange: handleChange });

        fireEvent.change(screen.getByRole("slider", { name: "Size, minimum" }), { target: { value: "9" } });

        expect(handleChange).toHaveBeenCalledWith([5, 5]);
    });

    test("moves the high end", () => {
        const handleChange = vi.fn();
        renderRange({ onChange: handleChange });

        fireEvent.change(screen.getByRole("slider", { name: "Size, maximum" }), { target: { value: "8" } });

        expect(handleChange).toHaveBeenCalledWith([2, 8]);
    });

    test("stops the high end at the low end", () => {
        const handleChange = vi.fn();
        renderRange({ onChange: handleChange });

        fireEvent.change(screen.getByRole("slider", { name: "Size, maximum" }), { target: { value: "1" } });

        expect(handleChange).toHaveBeenCalledWith([2, 2]);
    });
});
