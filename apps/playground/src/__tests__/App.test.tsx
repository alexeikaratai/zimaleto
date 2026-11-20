import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { App } from "../App";
import { stubCanvasContext } from "./support/canvas";
import { clearRecorded, lastSnowfallProps } from "./support/snowfallFakes";

vi.mock("@zimaleto/zima-react", async (importOriginal) => {
    const { FakeSnowfall, fakeUseSnowfall } = await import("./support/snowfallFakes");

    return { ...(await importOriginal<object>()), Snowfall: FakeSnowfall, useSnowfall: fakeUseSnowfall };
});

beforeEach(() => {
    stubCanvasContext();
});

afterEach(() => {
    cleanup();
    clearRecorded();
});

describe("<App>", () => {
    test("starts with the snow inside an element", () => {
        render(<App />);

        expect(screen.getByText(/^<Snowfall \/> fills its parent/)).toBeTruthy();
    });

    test("hands the panel's changes to the snow", () => {
        render(<App />);

        fireEvent.change(screen.getByRole("slider", { name: "Count" }), { target: { value: "300" } });

        expect(lastSnowfallProps()?.count).toBe(300);
    });

    test("moves the snow to the target the panel picks", () => {
        render(<App />);

        fireEvent.change(screen.getByRole("combobox", { name: "Snow falls" }), { target: { value: "page" } });

        expect(lastSnowfallProps()?.fullscreen).toBe(true);
    });

    test("pauses the snow", () => {
        render(<App />);

        fireEvent.click(screen.getByRole("button", { name: "Stop" }));

        expect(lastSnowfallProps()?.paused).toBe(true);
    });

    test("starts a new snowfall on Restart", () => {
        render(<App />);
        const before = screen.getByLabelText("Snowfall");

        fireEvent.click(screen.getByRole("button", { name: "Restart" }));

        expect(screen.getByLabelText("Snowfall")).not.toBe(before);
    });
});
