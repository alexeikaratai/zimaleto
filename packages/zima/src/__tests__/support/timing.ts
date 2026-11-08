/** A promise and the function that resolves it. */
export type Deferred = {
    promise: Promise<void>;
    resolve(): void;
};

export function createDeferred(): Deferred {
    let settle: () => void = () => undefined;
    const promise = new Promise<void>((resolve) => {
        settle = resolve;
    });

    return { promise, resolve: () => settle() };
}

/** Resolves after the browser's next frame, by which time resize observers have reported. */
export function nextFrame(): Promise<number> {
    return new Promise(requestAnimationFrame);
}

/** Resolves once the browser has reported the element's visibility to intersection observers. */
export function whenIntersectionReported(element: Element): Promise<void> {
    return new Promise((resolve) => {
        const observer = new IntersectionObserver(() => {
            observer.disconnect();
            resolve();
        });
        observer.observe(element);
    });
}

/** Resolves once resize observers have reported the element's size, as they first do right after observe(). */
export function whenResizeReported(element: Element): Promise<void> {
    return new Promise((resolve) => {
        const observer = new ResizeObserver(() => {
            observer.disconnect();
            resolve();
        });
        observer.observe(element);
    });
}
