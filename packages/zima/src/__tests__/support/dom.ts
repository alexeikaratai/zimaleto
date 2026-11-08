import { onTestFinished, vi } from "vitest";

/** Adds an empty block of the given CSS size to the page, and removes it after the test. */
export function addContainer(width = 200, height = 100): HTMLDivElement {
    const container = document.createElement("div");
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    document.body.append(container);
    onTestFinished(() => container.remove());

    return container;
}

/** Adds a canvas with the given inline style to the page, and removes it after the test. */
export function addCanvas(style = ""): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = style;
    document.body.append(canvas);
    onTestFinished(() => canvas.remove());

    return canvas;
}

/** Hides or shows the tab, as far as `document.hidden` and `visibilitychange` tell. */
export function setTabHidden(isHidden: boolean): void {
    vi.spyOn(document, "hidden", "get").mockReturnValue(isHidden);
    document.dispatchEvent(new Event("visibilitychange"));
}
