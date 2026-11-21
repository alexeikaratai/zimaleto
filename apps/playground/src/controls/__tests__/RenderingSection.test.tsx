import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, type Mock, test, vi } from "vitest";
import { INITIAL_OPTIONS, type PlaygroundOptions } from "../../options";
import { RenderingSection } from "../RenderingSection";

type HandleOptionsChange = (changes: Partial<PlaygroundOptions>) => void;

afterEach(cleanup);

function renderRendering(changes: Partial<PlaygroundOptions> = {}): Mock<HandleOptionsChange> {
    const handleOptionsChange = vi.fn<HandleOptionsChange>();
    render(
        <RenderingSection
            options={{ ...INITIAL_OPTIONS, ...changes }}
            onOptionsChange={handleOptionsChange}
        />,
    );

    return handleOptionsChange;
}

function frameRateSelect(): HTMLSelectElement {
    return screen.getByRole("combobox", { name: "Frame rate" }) as HTMLSelectElement;
}

describe("<RenderingSection>", () => {
    test("shows the default frame rate while fps is unset", () => {
        renderRendering();

        expect(frameRateSelect().value).toBe("default");
    });

    test("shows the frame-rate cap that's set", () => {
        renderRendering({ fps: 30 });

        expect(frameRateSelect().value).toBe("30");
    });

    test.each([
        ["default", undefined],
        ["Infinity", Number.POSITIVE_INFINITY],
        ["15", 15],
    ])("turns the %s frame-rate choice into fps %s", (value, fps) => {
        const handleOptionsChange = renderRendering({ fps: 60 });

        fireEvent.change(frameRateSelect(), { target: { value } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ fps });
    });

    test("changes the pixel-ratio limit", () => {
        const handleOptionsChange = renderRendering();

        fireEvent.change(screen.getByRole("combobox", { name: "Max pixel ratio" }), { target: { value: "1.5" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ maxDpr: 1.5 });
    });

    test("changes what reduced motion does", () => {
        const handleOptionsChange = renderRendering();

        fireEvent.change(screen.getByRole("combobox", { name: "Reduced motion" }), { target: { value: "reduce" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ reducedMotion: "reduce" });
    });

    test("keeps animating when hidden", () => {
        const handleOptionsChange = renderRendering();

        fireEvent.click(screen.getByRole("checkbox", { name: "Pause when hidden" }));

        expect(handleOptionsChange).toHaveBeenCalledWith({ pauseWhenHidden: false });
    });

    test("shows the seed that's set", () => {
        renderRendering({ seed: 7 });

        expect((screen.getByRole("spinbutton", { name: "Seed" }) as HTMLInputElement).value).toBe("7");
    });

    test.each([
        ["42", 42],
        ["", undefined],
    ])("turns the seed %j into %s", (value, seed) => {
        const handleOptionsChange = renderRendering({ seed: 1 });

        fireEvent.change(screen.getByRole("spinbutton", { name: "Seed" }), { target: { value } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ seed });
    });
});
