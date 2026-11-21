import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { clearRecorded, lastSnowfallProps, recorded } from "../../__tests__/support/snowfallFakes";
import { INITIAL_OPTIONS, type TargetMode, toSnowOptions } from "../../options";
import { CAPTIONS } from "../constants";
import { SnowStage } from "../SnowStage";

vi.mock("@zimaleto/zima-react", async (importOriginal) => {
    const { FakeSnowfall, fakeUseSnowfall } = await import("../../__tests__/support/snowfallFakes");

    return { ...(await importOriginal<object>()), Snowfall: FakeSnowfall, useSnowfall: fakeUseSnowfall };
});

afterEach(() => {
    cleanup();
    clearRecorded();
});

function renderStage(mode: TargetMode, isPaused = false): HTMLCanvasElement | null {
    const canvasRef = createRef<HTMLCanvasElement>();
    render(
        <SnowStage
            mode={mode}
            options={{ ...INITIAL_OPTIONS, count: 40 }}
            isPaused={isPaused}
            canvasRef={canvasRef}
        />,
    );

    return canvasRef.current;
}

describe("<SnowStage>", () => {
    test.each<TargetMode>(["container", "canvas", "page"])("shows the call the %s target makes", (mode) => {
        renderStage(mode);

        expect(screen.getByText(CAPTIONS[mode])).toBeTruthy();
    });

    test("fills an element with <Snowfall> in the playground's options", () => {
        renderStage("container", true);

        expect(lastSnowfallProps()).toStrictEqual({
            ...toSnowOptions({ ...INITIAL_OPTIONS, count: 40 }),
            paused: true,
        });
    });

    test("covers the page with a fullscreen <Snowfall>", () => {
        renderStage("page");

        expect(lastSnowfallProps()?.fullscreen).toBe(true);
    });

    test.each<TargetMode>(["container", "page"])("hands the %s target's canvas to the ref", (mode) => {
        const canvas = renderStage(mode);

        expect(canvas).toBe(screen.getByLabelText("Snowfall"));
    });

    test("snows with useSnowfall() on a canvas of its own", () => {
        const canvas = renderStage("canvas", true);
        const [call] = recorded.hookCalls;

        expect([call?.target.current === canvas, call?.options]).toStrictEqual([
            true,
            { ...toSnowOptions({ ...INITIAL_OPTIONS, count: 40 }), paused: true },
        ]);
    });
});
