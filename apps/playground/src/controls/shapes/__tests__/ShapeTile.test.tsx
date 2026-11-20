import { act, cleanup, render, screen } from "@testing-library/react";
import type { Shape } from "@zimaleto/zima-react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { stubCanvasContext } from "../../../__tests__/support/canvas";
import { TILE_RADIUS, TILE_SIZE } from "../constants";
import { ShapeTile } from "../ShapeTile";

type Deferred = {
    promise: Promise<unknown>;
    resolve: () => void;
    reject: () => void;
};

afterEach(cleanup);

function createDeferred(): Deferred {
    const deferred: Deferred = { promise: Promise.resolve(), resolve: () => undefined, reject: () => undefined };
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = () => resolve(undefined);
        deferred.reject = () => reject(new Error("failed to load"));
    });
    // The tile handles a rejection itself; this keeps the test's own copy from being reported as unhandled.
    deferred.promise.catch(() => undefined);

    return deferred;
}

function shapeReadyWith(ready?: Promise<unknown>): Shape {
    const shape = vi.fn<(context: CanvasRenderingContext2D, radius: number) => void>();

    return ready ? Object.assign(shape, { ready }) : shape;
}

async function settle(): Promise<void> {
    await act(() => Promise.resolve());
}

describe("<ShapeTile>", () => {
    test("draws the shape at the tile's radius", async () => {
        const context = stubCanvasContext();
        const shape = shapeReadyWith();

        render(
            <ShapeTile
                label="Dot"
                shape={shape}
                color="#fff"
            />,
        );
        await settle();

        const [drawnContext, radius] = vi.mocked(shape).mock.calls[0] ?? [];

        expect([drawnContext === context, radius]).toStrictEqual([true, TILE_RADIUS]);
    });

    test("paints in its color", async () => {
        const context = stubCanvasContext();

        render(
            <ShapeTile
                label="Dot"
                shape={shapeReadyWith()}
                color="#cfe8ff"
            />,
        );
        await settle();

        expect([context.fillStyle, context.strokeStyle]).toStrictEqual(["#cfe8ff", "#cfe8ff"]);
    });

    test("sizes its bitmap to the tile at the screen's pixel ratio", async () => {
        stubCanvasContext();

        render(
            <ShapeTile
                label="Dot"
                shape={shapeReadyWith()}
                color="#fff"
            />,
        );
        await settle();

        const canvas = screen.getByRole("img", { name: "Dot" }) as HTMLCanvasElement;

        expect(canvas.width).toBe(TILE_SIZE * window.devicePixelRatio);
    });

    test("waits for a shape that isn't ready", async () => {
        stubCanvasContext();
        const loading = createDeferred();
        const shape = shapeReadyWith(loading.promise);
        render(
            <ShapeTile
                label="Picture"
                shape={shape}
                color="#fff"
            />,
        );
        await settle();
        const callsBeforeReady = vi.mocked(shape).mock.calls.length;

        loading.resolve();
        await settle();

        expect([callsBeforeReady, vi.mocked(shape).mock.calls.length]).toStrictEqual([0, 1]);
    });

    test("stays empty when the shape fails to load", async () => {
        stubCanvasContext();
        const loading = createDeferred();
        const shape = shapeReadyWith(loading.promise);
        render(
            <ShapeTile
                label="Picture"
                shape={shape}
                color="#fff"
            />,
        );

        loading.reject();
        await settle();

        expect(shape).not.toHaveBeenCalled();
    });

    test("doesn't draw once it's gone", async () => {
        stubCanvasContext();
        const loading = createDeferred();
        const shape = shapeReadyWith(loading.promise);
        const { unmount } = render(
            <ShapeTile
                label="Picture"
                shape={shape}
                color="#fff"
            />,
        );

        unmount();
        loading.resolve();
        await settle();

        expect(shape).not.toHaveBeenCalled();
    });
});
