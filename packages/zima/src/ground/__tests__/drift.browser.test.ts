import { describe, expect, test, vi } from "vitest";
import { hasVisiblePixels, rowOpacity } from "../../__tests__/support/canvas";
import { addCanvas, addContainer } from "../../__tests__/support/dom";
import { type StartedSnow, startSnow } from "../../__tests__/support/engine";
import { stubMediaQueries, stubPixelRatio } from "../../__tests__/support/media";
import type { SnowOptions } from "../../options/snowOptions";
import { image } from "../../shapes/image";
import { drift } from "../drift";

const WIDTH = 200;
const HEIGHT = 100;
// Few, fast, same-sized flakes without sway: a drift builds up within a second, and the air above it stays mostly clear.
const FAST_SNOW: SnowOptions = {
    count: 40,
    size: 3,
    speed: 400,
    sway: 0,
    opacity: 1,
    seed: 1,
    fps: Number.POSITIVE_INFINITY,
    ground: drift({ depth: 20 }),
};

function startDriftingSnow(options: SnowOptions = {}, target: HTMLElement = addContainer(WIDTH, HEIGHT)): StartedSnow {
    stubPixelRatio(1);

    return startSnow({ ...FAST_SNOW, ...options }, target);
}

function letItSnow({ clock }: StartedSnow, seconds = 2): void {
    for (let frame = 0; frame < seconds * 60; frame += 1) {
        clock.tick();
    }
}

// The lowest rows, which every drift covers whatever its shelter.
function bottomOpacity(canvas: HTMLCanvasElement): number {
    return rowOpacity(canvas, canvas.height - 2);
}

describe("drift", () => {
    test("builds up an opaque layer at the bottom of the canvas", () => {
        const started = startDriftingSnow();

        letItSnow(started);

        expect(bottomOpacity(started.snow.canvas)).toBeGreaterThan(0.95);
    });

    test("stays below its depth, so the canvas above it is mostly clear", () => {
        const started = startDriftingSnow();

        letItSnow(started);

        // 20 px of drift and up to 6 px of flakes on top leave the middle of a 100 px canvas to the falling snow.
        expect(rowOpacity(started.snow.canvas, HEIGHT / 2)).toBeLessThan(0.3);
    });

    test("doesn't grow while the snow is stopped", () => {
        const started = startDriftingSnow();
        letItSnow(started, 0.2);
        started.snow.stop();
        const before = rowOpacity(started.snow.canvas, HEIGHT - 10);

        letItSnow(started);

        expect(rowOpacity(started.snow.canvas, HEIGHT - 10)).toBe(before);
    });

    test("disappears with update({ ground: undefined })", () => {
        const started = startDriftingSnow();
        letItSnow(started);

        started.snow.update({ ground: undefined, count: 0 });

        expect(bottomOpacity(started.snow.canvas)).toBe(0);
    });

    test("keeps the settled snow when a new drift() gets a new depth", () => {
        const started = startDriftingSnow();
        letItSnow(started);

        started.snow.update({ ground: drift({ depth: 30 }), count: 0 });

        expect(bottomOpacity(started.snow.canvas)).toBeGreaterThan(0.95);
    });

    test("cuts the settled snow down to a smaller depth", () => {
        const started = startDriftingSnow({ ground: drift({ depth: 40 }) });
        letItSnow(started, 4);

        started.snow.update({ ground: drift({ depth: 10 }), count: 0 });

        // 10 px of drift and up to 6 px of flakes on top leave the rows above clear.
        expect(rowOpacity(started.snow.canvas, HEIGHT - 20)).toBe(0);
    });

    test("melts away once the snow stops", () => {
        const started = startDriftingSnow({ ground: drift({ depth: 20, melt: 40 }) });
        letItSnow(started, 0.5);

        started.snow.update({ count: 0 });
        letItSnow(started, 2);

        expect(hasVisiblePixels(started.snow.canvas)).toBe(false);
    });

    test("stays at the bottom when the canvas grows taller", async () => {
        const container = addContainer(WIDTH, HEIGHT);
        const started = startDriftingSnow({}, container);
        letItSnow(started);
        started.snow.update({ count: 0 });

        container.style.height = `${HEIGHT * 2}px`;
        await vi.waitFor(() => expect(started.snow.canvas.height).toBe(HEIGHT * 2));

        expect([bottomOpacity(started.snow.canvas), rowOpacity(started.snow.canvas, HEIGHT - 2)]).toStrictEqual([
            expect.closeTo(1, 1),
            0,
        ]);
    });

    test("stretches with the canvas when it gets wider", async () => {
        const container = addContainer(WIDTH, HEIGHT);
        const started = startDriftingSnow({}, container);
        letItSnow(started);
        started.snow.update({ count: 0 });

        container.style.width = `${WIDTH * 2}px`;
        await vi.waitFor(() => expect(started.snow.canvas.width).toBe(WIDTH * 2));

        expect(bottomOpacity(started.snow.canvas)).toBeGreaterThan(0.95);
    });

    test("is redrawn at a new pixel ratio", () => {
        const media = stubMediaQueries();
        const started = startDriftingSnow();
        letItSnow(started);
        started.snow.update({ count: 0 });

        stubPixelRatio(2);
        media.changeResolution();

        expect([started.snow.canvas.height, bottomOpacity(started.snow.canvas)]).toStrictEqual([
            HEIGHT * 2,
            expect.closeTo(1, 1),
        ]);
    });

    test("keeps its drift still under static reduced motion", () => {
        const media = stubMediaQueries();
        const started = startDriftingSnow();
        letItSnow(started);

        media.setReducedMotion(true);
        const before = rowOpacity(started.snow.canvas, HEIGHT - 10);
        letItSnow(started);

        expect([bottomOpacity(started.snow.canvas) > 0.95, rowOpacity(started.snow.canvas, HEIGHT - 10)]).toStrictEqual(
            [true, before],
        );
    });

    test("gives each snowfall its own drift when they share a drift() value", () => {
        const ground = drift({ depth: 20 });
        const busy = startDriftingSnow({ ground });
        const quiet = startDriftingSnow({ ground, count: 0 });

        letItSnow(busy);
        letItSnow(quiet);

        expect(bottomOpacity(quiet.snow.canvas)).toBe(0);
    });

    test("gathers snow from flakes whose shape isn't ready, without stamping them", () => {
        const started = startDriftingSnow({ shapes: image("data:image/png;base64,broken") });

        letItSnow(started);

        expect(bottomOpacity(started.snow.canvas)).toBeGreaterThan(0.95);
    });

    test("melts on a canvas with no width without drawing", () => {
        const container = addContainer(0, HEIGHT);
        const started = startDriftingSnow({ ground: drift({ melt: 40 }), pauseWhenHidden: false }, container);

        const letItMelt = () => letItSnow(started, 0.5);

        expect(letItMelt).not.toThrow();
    });

    test("leaves a canvas target clear after destroy()", () => {
        const canvas = addCanvas(`width: ${WIDTH}px; height: ${HEIGHT}px`);
        const started = startDriftingSnow({}, canvas);
        letItSnow(started);

        started.snow.destroy();

        expect(hasVisiblePixels(canvas)).toBe(false);
    });
});
