import { cleanup, render } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Snowfall } from "../Snowfall";
import { core, liveSnow, sparkle } from "./snowMock";

vi.mock("@zimaleto/zima", async () => {
    const { core: mockedCore } = await import("./snowMock");

    return { createSnow: mockedCore.createSnow };
});

afterEach(() => {
    cleanup();
    core.instances.length = 0;
});

function renderedCanvas(container: HTMLElement): HTMLCanvasElement {
    return container.querySelector("canvas") as HTMLCanvasElement;
}

describe("<Snowfall> lifecycle", () => {
    test("creates one snowfall on mount", () => {
        render(<Snowfall />);

        expect(core.instances).toHaveLength(1);
    });

    test("destroys its snowfall on unmount", () => {
        const { unmount } = render(<Snowfall />);

        unmount();

        expect(core.instances[0]?.isDestroyed).toBe(true);
    });

    test("snows on its own canvas", () => {
        const { container } = render(<Snowfall />);

        expect(core.instances[0]?.target).toBe(renderedCanvas(container));
    });

    test("passes only the snow options from its props to the core", () => {
        render(
            <Snowfall
                count={5}
                wind={3}
                paused={false}
                className="snow"
            />,
        );

        expect(core.instances[0]?.options).toStrictEqual({ count: 5, wind: 3 });
    });
});

describe("<Snowfall> under StrictMode", () => {
    test("keeps exactly one live snowfall", () => {
        render(
            <StrictMode>
                <Snowfall />
            </StrictMode>,
        );

        expect(core.instances.filter((snow) => !snow.isDestroyed)).toHaveLength(1);
    });

    test("sends prop changes to the live snowfall", () => {
        const { rerender } = render(
            <StrictMode>
                <Snowfall wind={3} />
            </StrictMode>,
        );

        rerender(
            <StrictMode>
                <Snowfall wind={10} />
            </StrictMode>,
        );

        expect(liveSnow()?.update.mock.calls).toStrictEqual([[{ wind: 10 }]]);
    });

    test("keeps the live snowfall paused", () => {
        render(
            <StrictMode>
                <Snowfall paused />
            </StrictMode>,
        );

        expect(liveSnow()?.isRunning).toBe(false);
    });
});

describe("<Snowfall> prop changes", () => {
    test("sends changed props to update() instead of re-creating the snowfall", () => {
        const { rerender } = render(<Snowfall wind={3} />);

        rerender(<Snowfall wind={10} />);

        expect([core.instances.length, core.instances[0]?.update.mock.calls]).toStrictEqual([1, [[{ wind: 10 }]]]);
    });

    test("doesn't call update() for new but equal arrays and weighted shapes", () => {
        const { rerender } = render(
            <Snowfall
                color={["#fff", "#cfe8ff"]}
                shapes={[sparkle, { shape: sparkle, weight: 2 }]}
            />,
        );

        rerender(
            <Snowfall
                color={["#fff", "#cfe8ff"]}
                shapes={[sparkle, { shape: sparkle, weight: 2 }]}
            />,
        );

        expect(core.instances[0]?.update).not.toHaveBeenCalled();
    });

    test("calls update() when a weight inside shapes changes", () => {
        const { rerender } = render(<Snowfall shapes={[{ shape: sparkle, weight: 1 }]} />);

        rerender(<Snowfall shapes={[{ shape: sparkle, weight: 2 }]} />);

        expect(core.instances[0]?.update.mock.calls).toStrictEqual([[{ shapes: [{ shape: sparkle, weight: 2 }] }]]);
    });

    test("sends a removed prop as undefined, so the core restores its default", () => {
        const { rerender } = render(
            <Snowfall
                count={5}
                wind={3}
            />,
        );

        rerender(<Snowfall wind={3} />);

        expect(core.instances[0]?.update.mock.calls).toStrictEqual([[{ count: undefined }]]);
    });

    test("pauses its snowfall when paused is set", () => {
        const { rerender } = render(<Snowfall />);

        rerender(<Snowfall paused />);

        expect([core.instances.length, core.instances[0]?.isRunning]).toStrictEqual([1, false]);
    });

    test("resumes the same snowfall when paused is cleared", () => {
        const { rerender } = render(<Snowfall paused />);

        rerender(<Snowfall paused={false} />);

        expect([core.instances.length, core.instances[0]?.isRunning]).toStrictEqual([1, true]);
    });
});

describe("<Snowfall> canvas", () => {
    test("fills its parent by default", () => {
        const { container } = render(<Snowfall />);

        const { position, inset, width, height, pointerEvents, zIndex } = renderedCanvas(container).style;

        expect({ position, inset, width, height, pointerEvents, zIndex }).toStrictEqual({
            position: "absolute",
            inset: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: "",
        });
    });

    test("covers the viewport when fullscreen", () => {
        const { container } = render(<Snowfall fullscreen />);

        const { position, zIndex } = renderedCanvas(container).style;

        expect([position, zIndex]).toStrictEqual(["fixed", "9999"]);
    });

    test("lets style override the layout", () => {
        const { container } = render(
            <Snowfall
                fullscreen
                style={{ zIndex: 1 }}
            />,
        );

        expect(renderedCanvas(container).style.zIndex).toBe("1");
    });

    test("hides the canvas from assistive technology", () => {
        const { container } = render(<Snowfall />);

        expect(renderedCanvas(container).getAttribute("aria-hidden")).toBe("true");
    });

    test("lets aria-hidden be turned off", () => {
        const { container } = render(<Snowfall aria-hidden={false} />);

        expect(renderedCanvas(container).getAttribute("aria-hidden")).toBe("false");
    });

    test("passes className and other canvas attributes through", () => {
        const { container } = render(
            <Snowfall
                className="snow"
                id="hero-snow"
                data-testid="snow"
            />,
        );
        const canvas = renderedCanvas(container);

        expect([canvas.className, canvas.id, canvas.dataset.testid]).toStrictEqual(["snow", "hero-snow", "snow"]);
    });

    test("keeps snow options off the canvas element", () => {
        const { container } = render(
            <Snowfall
                count={5}
                maxDpr={1}
            />,
        );
        const canvas = renderedCanvas(container);

        expect([canvas.hasAttribute("count"), canvas.hasAttribute("maxdpr")]).toStrictEqual([false, false]);
    });

    test("points ref at the canvas", () => {
        const ref = createRef<HTMLCanvasElement>();

        const { container } = render(<Snowfall ref={ref} />);

        expect(ref.current).toBe(renderedCanvas(container));
    });
});
