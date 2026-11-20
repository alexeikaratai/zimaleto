import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { stubCanvasContext } from "../../__tests__/support/canvas";
import { INITIAL_OPTIONS } from "../../options";
import { Controls } from "../Controls";

afterEach(cleanup);

describe("<Controls>", () => {
    test("shows every section, the target first", () => {
        stubCanvasContext();
        render(
            <Controls
                options={INITIAL_OPTIONS}
                mode="container"
                isPaused
                canvasRef={createRef()}
                onOptionsChange={vi.fn()}
                onModeChange={vi.fn()}
                onPausedChange={vi.fn()}
                onRestart={vi.fn()}
            />,
        );

        const titles = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);

        expect(titles).toStrictEqual([
            "Target",
            "Performance",
            "Amount",
            "Motion",
            "Shapes",
            "Drift",
            "Look",
            "Rendering",
        ]);
    });
});
