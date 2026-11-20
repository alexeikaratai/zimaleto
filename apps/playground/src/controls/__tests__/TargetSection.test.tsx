import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { TargetSection, type TargetSectionProps } from "../TargetSection";

afterEach(cleanup);

function renderTarget(props: Partial<TargetSectionProps>): void {
    render(
        <TargetSection
            mode="container"
            isPaused={false}
            onModeChange={vi.fn()}
            onPausedChange={vi.fn()}
            onRestart={vi.fn()}
            {...props}
        />,
    );
}

describe("<TargetSection>", () => {
    test("changes where the snow falls", () => {
        const handleModeChange = vi.fn();
        renderTarget({ onModeChange: handleModeChange });

        fireEvent.change(screen.getByRole("combobox", { name: "Snow falls" }), { target: { value: "page" } });

        expect(handleModeChange).toHaveBeenCalledWith("page");
    });

    test("stops falling snow", () => {
        const handlePausedChange = vi.fn();
        renderTarget({ onPausedChange: handlePausedChange });

        fireEvent.click(screen.getByRole("button", { name: "Stop" }));

        expect(handlePausedChange).toHaveBeenCalledWith(true);
    });

    test("starts stopped snow", () => {
        const handlePausedChange = vi.fn();
        renderTarget({ isPaused: true, onPausedChange: handlePausedChange });

        fireEvent.click(screen.getByRole("button", { name: "Start" }));

        expect(handlePausedChange).toHaveBeenCalledWith(false);
    });

    test("restarts the snow", () => {
        const handleRestart = vi.fn();
        renderTarget({ onRestart: handleRestart });

        fireEvent.click(screen.getByRole("button", { name: "Restart" }));

        expect(handleRestart).toHaveBeenCalledOnce();
    });
});
