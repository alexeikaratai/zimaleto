import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { SelectField } from "../SelectField";
import type { SelectChoice } from "../types";

type Mode = "count" | "density";

const CHOICES: readonly SelectChoice<Mode>[] = [
    { value: "count", label: "A fixed count" },
    { value: "density", label: "Density" },
];

afterEach(cleanup);

describe("<SelectField>", () => {
    test("offers every choice and selects the value", () => {
        render(
            <SelectField
                label="Number of flakes"
                value="density"
                choices={CHOICES}
                onChange={vi.fn()}
            />,
        );

        const select = screen.getByRole("combobox", { name: "Number of flakes" }) as HTMLSelectElement;

        expect([select.options.length, select.value]).toStrictEqual([2, "density"]);
    });

    test("reports the chosen value", () => {
        const handleChange = vi.fn();
        render(
            <SelectField
                label="Number of flakes"
                value="count"
                choices={CHOICES}
                onChange={handleChange}
            />,
        );

        fireEvent.change(screen.getByRole("combobox", { name: "Number of flakes" }), { target: { value: "density" } });

        expect(handleChange).toHaveBeenCalledWith("density");
    });

    test("describes itself with its hint", () => {
        render(
            <SelectField
                label="Frame rate"
                value="count"
                choices={CHOICES}
                hint="Skips frames on fast displays."
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("combobox", { name: "Frame rate" }).getAttribute("aria-describedby")).toBe(
            screen.getByText("Skips frames on fast displays.").id,
        );
    });

    test("has no description without a hint", () => {
        render(
            <SelectField
                label="Frame rate"
                value="count"
                choices={CHOICES}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("combobox", { name: "Frame rate" }).hasAttribute("aria-describedby")).toBe(false);
    });
});
