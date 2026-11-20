import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { SliderField } from "../SliderField";

afterEach(cleanup);

describe("<SliderField>", () => {
    test("shows its value with the unit", () => {
        render(
            <SliderField
                label="Wind"
                value={15}
                min={-300}
                max={300}
                step={5}
                unit=" px/s"
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("slider", { name: "Wind" }).getAttribute("aria-valuetext")).toBe("15 px/s");
    });

    test("shows a bare value without a unit", () => {
        render(
            <SliderField
                label="Density"
                value={0.6}
                min={0}
                max={5}
                step={0.05}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("slider", { name: "Density" }).getAttribute("aria-valuetext")).toBe("0.6");
    });

    test("reports a new value as a number", () => {
        const handleChange = vi.fn();
        render(
            <SliderField
                label="Count"
                value={150}
                min={0}
                max={5000}
                step={10}
                onChange={handleChange}
            />,
        );

        fireEvent.change(screen.getByRole("slider", { name: "Count" }), { target: { value: "400" } });

        expect(handleChange).toHaveBeenCalledWith(400);
    });
});
