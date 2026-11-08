import { vi } from "vitest";
import type { Clock } from "../engine";

/** A clock whose frames run only when a test calls `tick()`. */
export type ManualClock = Clock & {
    /** Moves time forward and runs the frames requested so far. */
    tick(milliseconds?: number): void;
    /** How many frames are waiting to run. */
    readonly pendingFrames: number;
};

export function createManualClock(): ManualClock {
    const callbacks = new Map<number, (time: number) => void>();
    let now = 0;
    let nextHandle = 1;

    return {
        requestFrame(callback) {
            const handle = nextHandle;
            nextHandle += 1;
            callbacks.set(handle, callback);

            return handle;
        },
        cancelFrame(handle) {
            callbacks.delete(handle);
        },
        tick(milliseconds = 16) {
            now += milliseconds;
            const due = [...callbacks.values()];
            callbacks.clear();
            for (const callback of due) {
                callback(now);
            }
        },
        get pendingFrames() {
            return callbacks.size;
        },
    };
}

/** Controls for the media queries that `stubMediaQueries()` fakes. */
export type MediaQueryStub = {
    /** Sets whether the OS asks for reduced motion and notifies listeners. */
    setReducedMotion(isReduced: boolean): void;
    /** Notifies resolution listeners, as when the window moves to a screen with another pixel ratio. */
    changeResolution(): void;
};

type Listener = () => void;

export type MediaQueryStubOptions = {
    /** Whether the OS starts out asking for reduced motion. */
    isReducedMotion?: boolean;
};

/** Replaces `matchMedia` with fakes for the reduced-motion and resolution queries. */
export function stubMediaQueries({ isReducedMotion = false }: MediaQueryStubOptions = {}): MediaQueryStub {
    // Per query: each listener and the wrapper that honors `once`.
    const listeners = new Map<string, Map<Listener, Listener>>();
    let prefersReducedMotion = isReducedMotion;

    vi.spyOn(window, "matchMedia").mockImplementation((query) => {
        const queryListeners = listeners.get(query) ?? new Map<Listener, Listener>();
        listeners.set(query, queryListeners);

        const list = {
            media: query,
            get matches() {
                return query.includes("prefers-reduced-motion") ? prefersReducedMotion : true;
            },
            addEventListener(_type: string, listener: Listener, options?: AddEventListenerOptions) {
                queryListeners.set(listener, () => {
                    if (options?.once) {
                        queryListeners.delete(listener);
                    }
                    listener();
                });
            },
            removeEventListener(_type: string, listener: Listener) {
                queryListeners.delete(listener);
            },
        };

        return list as unknown as MediaQueryList;
    });

    function notify(matchesQuery: (query: string) => boolean): void {
        for (const [query, queryListeners] of listeners) {
            if (matchesQuery(query)) {
                for (const wrapped of [...queryListeners.values()]) {
                    wrapped();
                }
            }
        }
    }

    return {
        setReducedMotion(isReduced) {
            prefersReducedMotion = isReduced;
            notify((query) => query.includes("prefers-reduced-motion"));
        },
        changeResolution() {
            notify((query) => query.includes("resolution"));
        },
    };
}

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

/** Adds an empty block of the given CSS size to the page. */
export function createContainer(width = 200, height = 100): HTMLDivElement {
    const container = document.createElement("div");
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    document.body.append(container);

    return container;
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

/** Whether any pixel on the canvas is at least partly opaque. */
export function hasVisiblePixels(canvas: HTMLCanvasElement): boolean {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

    return data.some((value, index) => index % 4 === 3 && value > 0);
}
