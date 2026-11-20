import { vi } from "vitest";

/**
 * Gives every canvas the same 2D context, which accepts every call the core's shapes make and remembers the properties
 * set on it. happy-dom has no canvas, so `getContext()` would return `null`.
 */
export function stubCanvasContext(): CanvasRenderingContext2D {
    const values = new Map<PropertyKey, unknown>();
    const context = new Proxy(
        {},
        {
            get(_target, name) {
                // Not a promise, and nothing for the symbols that matchers and React look up.
                if (values.has(name) || typeof name === "symbol" || name === "then") {
                    return values.get(name);
                }

                // Gradients and patterns come back from create*() and take color stops of their own.
                return () => (String(name).startsWith("create") ? { addColorStop: () => undefined } : undefined);
            },
            set(_target, name, value) {
                values.set(name, value);

                return true;
            },
        },
    ) as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);

    return context;
}
