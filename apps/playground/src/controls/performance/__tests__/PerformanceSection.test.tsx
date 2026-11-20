import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { INITIAL_OPTIONS, type PlaygroundOptions, STRESS_OPTIONS, type TargetMode } from "../../../options";
import { PerformanceSection } from "../PerformanceSection";

type Handlers = {
    onOptionsChange: (changes: Partial<PlaygroundOptions>) => void;
    onModeChange: (mode: TargetMode) => void;
    onPausedChange: (isPaused: boolean) => void;
};

beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

function renderPerformance(): Handlers {
    const handlers: Handlers = { onOptionsChange: vi.fn(), onModeChange: vi.fn(), onPausedChange: vi.fn() };
    render(
        <PerformanceSection
            options={INITIAL_OPTIONS}
            isPaused={false}
            canvasRef={createRef()}
            {...handlers}
        />,
    );

    return handlers;
}

describe("<PerformanceSection>", () => {
    test("runs the stress test over the whole page", () => {
        const { onOptionsChange, onModeChange, onPausedChange } = renderPerformance();

        fireEvent.click(screen.getByRole("button", { name: "Stress test" }));

        expect([
            vi.mocked(onOptionsChange).mock.calls,
            vi.mocked(onModeChange).mock.calls,
            vi.mocked(onPausedChange).mock.calls,
        ]).toStrictEqual([[[STRESS_OPTIONS]], [["page"]], [[false]]]);
    });

    test("measures the stress test at every display frame, animated whatever the OS asks", () => {
        const { onOptionsChange } = renderPerformance();

        fireEvent.click(screen.getByRole("button", { name: "Run baseline" }));

        expect(onOptionsChange).toHaveBeenCalledWith({ fps: Number.POSITIVE_INFINITY, reducedMotion: "ignore" });
    });

    test("turns its button into Stop and holds the stress test while running", () => {
        renderPerformance();

        fireEvent.click(screen.getByRole("button", { name: "Run baseline" }));
        const stressButton = screen.getByRole("button", { name: "Stress test" }) as HTMLButtonElement;

        expect([screen.queryByRole("button", { name: "Stop" }) !== null, stressButton.disabled]).toStrictEqual([
            true,
            true,
        ]);
    });

    test("stops the run", async () => {
        renderPerformance();
        fireEvent.click(screen.getByRole("button", { name: "Run baseline" }));

        fireEvent.click(screen.getByRole("button", { name: "Stop" }));
        await act(() => vi.advanceTimersByTimeAsync(1));

        expect(screen.getByRole("status").textContent).toBe("Stopped.");
    });
});
