import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, type Mock, test, vi } from "vitest";
import { INITIAL_OPTIONS, type PlaygroundOptions } from "../../options";
import { AmountSection } from "../AmountSection";
import { DEFAULT_DENSITY } from "../constants";

afterEach(cleanup);

type HandleOptionsChange = (changes: Partial<PlaygroundOptions>) => void;

function renderAmount(changes: Partial<PlaygroundOptions> = {}): Mock<HandleOptionsChange> {
    const handleOptionsChange = vi.fn<HandleOptionsChange>();
    render(
        <AmountSection
            options={{ ...INITIAL_OPTIONS, ...changes }}
            onOptionsChange={handleOptionsChange}
        />,
    );

    return handleOptionsChange;
}

describe("<AmountSection>", () => {
    test("switches to a density", () => {
        const handleOptionsChange = renderAmount();

        fireEvent.change(screen.getByRole("combobox", { name: "Number of flakes" }), { target: { value: "density" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ density: DEFAULT_DENSITY });
    });

    test("switches back to a fixed count", () => {
        const handleOptionsChange = renderAmount({ density: 1 });

        fireEvent.change(screen.getByRole("combobox", { name: "Number of flakes" }), { target: { value: "count" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ density: undefined });
    });

    test("changes the count", () => {
        const handleOptionsChange = renderAmount();

        fireEvent.change(screen.getByRole("slider", { name: "Count" }), { target: { value: "300" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ count: 300 });
    });

    test("changes the density instead of the count once it's set", () => {
        const handleOptionsChange = renderAmount({ density: 1 });

        fireEvent.change(screen.getByRole("slider", { name: "Density" }), { target: { value: "2" } });

        expect([handleOptionsChange.mock.calls, screen.queryByRole("slider", { name: "Count" })]).toStrictEqual([
            [[{ density: 2 }]],
            null,
        ]);
    });
});
