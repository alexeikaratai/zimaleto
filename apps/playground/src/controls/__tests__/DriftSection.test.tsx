import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { INITIAL_OPTIONS } from "../../options";
import { DriftSection } from "../DriftSection";

afterEach(cleanup);

describe("<DriftSection>", () => {
    test.each([
        ["Depth", "60", { driftDepth: 60 }],
        ["Melt", "2.5", { driftMelt: 2.5 }],
    ])("changes the %s", (name, value, changes) => {
        const handleOptionsChange = vi.fn();
        render(
            <DriftSection
                options={INITIAL_OPTIONS}
                onOptionsChange={handleOptionsChange}
                onRestart={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByRole("slider", { name }), { target: { value } });

        expect(handleOptionsChange).toHaveBeenCalledWith(changes);
    });

    test("lets the snow pile up", () => {
        const handleOptionsChange = vi.fn();
        render(
            <DriftSection
                options={INITIAL_OPTIONS}
                onOptionsChange={handleOptionsChange}
                onRestart={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("checkbox", { name: "Let the snow pile up" }));

        expect(handleOptionsChange).toHaveBeenCalledWith({ isDrifting: true });
    });

    test("starts over", () => {
        const handleRestart = vi.fn();
        render(
            <DriftSection
                options={INITIAL_OPTIONS}
                onOptionsChange={vi.fn()}
                onRestart={handleRestart}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Start over" }));

        expect(handleRestart).toHaveBeenCalledOnce();
    });
});
