import { vi } from "vitest";

/** A flake as the engine drew it: the center of its sprite on the canvas in device px, and the sprite's size. */
export type DrawnFlake = {
    x: number;
    y: number;
    size: number;
};

/** Whether any pixel on the canvas is at least partly opaque. */
export function hasVisiblePixels(canvas: HTMLCanvasElement): boolean {
    return opaqueArea(canvas) > 0;
}

/** How much of the canvas is painted, in device px², with each pixel counted by its opacity. */
export function opaqueArea(canvas: HTMLCanvasElement): number {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let area = 0;

    for (let index = 3; index < data.length; index += 4) {
        area += (data[index] as number) / 255;
    }

    return area;
}

/** Records every flake drawn on the canvas from now on. Call it once per test and canvas. */
export function recordDrawnFlakes(canvas: HTMLCanvasElement): DrawnFlake[] {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const { drawImage } = context;
    const flakes: DrawnFlake[] = [];

    vi.spyOn(context, "drawImage").mockImplementation((...args: unknown[]) => {
        const { e, f } = context.getTransform();
        flakes.push({ x: e, y: f, size: args[3] as number });
        Reflect.apply(drawImage, context, args);
    });

    return flakes;
}
