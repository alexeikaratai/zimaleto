import { cleanup, render } from "@testing-library/react";
import { type ReactElement, useRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { type SnowfallOptions, useSnowfall } from "../useSnowfall";
import { core } from "./snowMock";

vi.mock("@zimaleto/zima", async () => {
    const { core: mockedCore } = await import("./snowMock");

    return { createSnow: mockedCore.createSnow };
});

afterEach(() => {
    cleanup();
    core.instances.length = 0;
});

type OwnCanvasProps = {
    options?: SnowfallOptions;
};

function OwnCanvas({ options }: OwnCanvasProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useSnowfall(canvasRef, options);

    return <canvas ref={canvasRef} />;
}

function EmptyRef(): null {
    const ref = useRef<HTMLCanvasElement>(null);
    useSnowfall(ref);

    return null;
}

type TwoCanvasesProps = {
    isOnSecond: boolean;
};

// Paused snow on one of two canvases, picked by a prop, as when a layout swaps the element the snow belongs to.
function TwoCanvases({ isOnSecond }: TwoCanvasesProps): ReactElement {
    const firstRef = useRef<HTMLCanvasElement>(null);
    const secondRef = useRef<HTMLCanvasElement>(null);
    useSnowfall(isOnSecond ? secondRef : firstRef, { paused: true });

    return (
        <>
            <canvas ref={firstRef} />
            <canvas ref={secondRef} />
        </>
    );
}

describe("useSnowfall", () => {
    test("snows on the canvas the ref points to", () => {
        const { container } = render(<OwnCanvas options={{ count: 3 }} />);

        expect(core.instances[0]?.target).toBe(container.querySelector("canvas"));
    });

    test("passes its options to the core", () => {
        render(<OwnCanvas options={{ count: 3 }} />);

        expect(core.instances[0]?.options).toStrictEqual({ count: 3 });
    });

    test("does nothing while the ref is empty", () => {
        render(<EmptyRef />);

        expect(core.createSnow).not.toHaveBeenCalled();
    });

    test("starts the snow paused when paused is set", () => {
        render(<OwnCanvas options={{ paused: true }} />);

        expect(core.instances[0]?.isRunning).toBe(false);
    });

    test("updates changed options without re-creating the snowfall", () => {
        const { rerender } = render(<OwnCanvas options={{ count: 3 }} />);

        rerender(<OwnCanvas options={{ count: 7 }} />);

        expect([core.instances.length, core.instances[0]?.update.mock.calls]).toStrictEqual([1, [[{ count: 7 }]]]);
    });

    test("keeps the snow paused when it moves to another element", () => {
        const { rerender } = render(<TwoCanvases isOnSecond={false} />);

        rerender(<TwoCanvases isOnSecond />);

        expect(core.instances[1]?.isRunning).toBe(false);
    });

    test("destroys the snowfall on unmount", () => {
        const { unmount } = render(<OwnCanvas />);

        unmount();

        expect(core.instances[0]?.isDestroyed).toBe(true);
    });
});
