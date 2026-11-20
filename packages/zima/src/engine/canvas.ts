import { CONTAINER_CANVAS_STYLE, PAGE_CANVAS_STYLE } from "./constants";

/**
 * Gets the canvas a snowfall draws on: a canvas target as it is, or a new canvas that fills the target element,
 * or the viewport when there is no target. Returns it with a function that takes the new canvas away again.
 */
export function mountCanvas(target: HTMLElement | undefined): [canvas: HTMLCanvasElement, unmount: () => void] {
    if (target?.tagName === "CANVAS") {
        return [target as HTMLCanvasElement, () => undefined];
    }

    const canvas = document.createElement("canvas");
    const parent = target ?? document.body;
    const { position } = parent.style;
    // The canvas fills its nearest positioned ancestor, so a static target becomes relative until unmount.
    const shouldPosition = !!target && getComputedStyle(target).position === "static";

    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = target ? CONTAINER_CANVAS_STYLE : PAGE_CANVAS_STYLE;
    if (shouldPosition) {
        parent.style.position = "relative";
    }
    parent.append(canvas);

    return [
        canvas,
        () => {
            canvas.remove();
            if (shouldPosition) {
                parent.style.position = position;
            }
        },
    ];
}
