import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ToggleField } from "../ToggleField";

afterEach(cleanup);

describe("<ToggleField>", () => {
    test("reports the new state when clicked", () => {
        const handleChange = vi.fn();
        render(
            <ToggleField
                label="Parallax"
                checked
                onChange={handleChange}
            />,
        );

        fireEvent.click(screen.getByRole("checkbox", { name: "Parallax" }));

        expect(handleChange).toHaveBeenCalledWith(false);
    });

    test("describes itself with its hint", () => {
        render(
            <ToggleField
                label="Parallax"
                checked={false}
                hint="Bigger flakes look closer."
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("checkbox", { name: "Parallax" }).getAttribute("aria-describedby")).toBe(
            screen.getByText("Bigger flakes look closer.").id,
        );
    });

    test("has no description without a hint", () => {
        render(
            <ToggleField
                label="Parallax"
                checked={false}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("checkbox", { name: "Parallax" }).hasAttribute("aria-describedby")).toBe(false);
    });
});
