import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { COLOR_PRESETS } from "../../options";
import { ColorPresets } from "../ColorPresets";

afterEach(cleanup);

function pressedPresets(): string[] {
    return screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("aria-pressed") === "true")
        .map((button) => button.textContent ?? "");
}

describe("<ColorPresets>", () => {
    test("presses the preset with the current colors", () => {
        render(
            <ColorPresets
                value={[...COLOR_PRESETS.Ice]}
                onChange={vi.fn()}
            />,
        );

        expect(pressedPresets()).toStrictEqual(["Ice"]);
    });

    test("presses none for colors of no preset", () => {
        render(
            <ColorPresets
                value={["#123456"]}
                onChange={vi.fn()}
            />,
        );

        expect(pressedPresets()).toStrictEqual([]);
    });

    test("reports a copy of the chosen preset's colors", () => {
        const handleChange = vi.fn();
        render(
            <ColorPresets
                value={[...COLOR_PRESETS.Snow]}
                onChange={handleChange}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Aurora" }));
        const [colors] = handleChange.mock.calls[0] as [string[]];

        expect([colors, colors === COLOR_PRESETS.Aurora]).toStrictEqual([[...COLOR_PRESETS.Aurora], false]);
    });
});
