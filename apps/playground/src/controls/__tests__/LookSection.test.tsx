import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, type Mock, test, vi } from "vitest";
import { COLOR_PRESETS, INITIAL_OPTIONS, type PlaygroundOptions } from "../../options";
import { LookSection } from "../LookSection";

afterEach(cleanup);

type HandleOptionsChange = (changes: Partial<PlaygroundOptions>) => void;

function renderLook(): Mock<HandleOptionsChange> {
    const handleOptionsChange = vi.fn<HandleOptionsChange>();
    render(
        <LookSection
            options={INITIAL_OPTIONS}
            onOptionsChange={handleOptionsChange}
        />,
    );

    return handleOptionsChange;
}

describe("<LookSection>", () => {
    test.each([
        ["Size, maximum", "8", { size: [2, 8] }],
        ["Opacity, minimum", "0.3", { opacity: [0.3, 1] }],
    ])("changes the range of %s", (name, value, changes) => {
        const handleOptionsChange = renderLook();

        fireEvent.change(screen.getByRole("slider", { name }), { target: { value } });

        expect(handleOptionsChange).toHaveBeenCalledWith(changes);
    });

    test("changes the colors", () => {
        const handleOptionsChange = renderLook();

        fireEvent.click(screen.getByRole("button", { name: "Ember" }));

        expect(handleOptionsChange).toHaveBeenCalledWith({ color: [...COLOR_PRESETS.Ember] });
    });

    test("turns parallax off", () => {
        const handleOptionsChange = renderLook();

        fireEvent.click(screen.getByRole("checkbox", { name: "Parallax" }));

        expect(handleOptionsChange).toHaveBeenCalledWith({ parallax: false });
    });
});
