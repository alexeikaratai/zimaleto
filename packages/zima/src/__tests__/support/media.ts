import { vi } from "vitest";

/** Controls for the media queries that `stubMediaQueries()` fakes. */
export type MediaQueryStub = {
    /** Sets whether the OS asks for reduced motion and notifies listeners. */
    setReducedMotion(isReduced: boolean): void;
    /** Notifies resolution listeners, as when the window moves to a screen with another pixel ratio. */
    changeResolution(): void;
};

export type MediaQueryStubOptions = {
    /** Whether the OS starts out asking for reduced motion. */
    isReducedMotion?: boolean;
};

type Listener = () => void;

/** Replaces `matchMedia` with fakes for the reduced-motion and resolution queries. */
export function stubMediaQueries({ isReducedMotion = false }: MediaQueryStubOptions = {}): MediaQueryStub {
    // Per query: each listener and the wrapper that honors `once`.
    const listeners = new Map<string, Map<Listener, Listener>>();
    let isReducedMotionOn = isReducedMotion;

    vi.spyOn(window, "matchMedia").mockImplementation((query) => {
        const queryListeners = listeners.get(query) ?? new Map<Listener, Listener>();
        listeners.set(query, queryListeners);

        const list = {
            media: query,
            get matches() {
                return query.includes("prefers-reduced-motion") ? isReducedMotionOn : true;
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
            isReducedMotionOn = isReduced;
            notify((query) => query.includes("prefers-reduced-motion"));
        },
        changeResolution() {
            notify((query) => query.includes("resolution"));
        },
    };
}

/** Pretends the screen has the given number of device pixels per CSS pixel. */
export function stubPixelRatio(ratio: number): void {
    vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(ratio);
}
