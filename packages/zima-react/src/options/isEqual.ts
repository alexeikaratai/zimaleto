import type { NamedValues } from "./types";

/**
 * Compares option values by content: arrays element by element and objects field by field, so a new but equal
 * `shapes={[crystal]}` counts as unchanged. Anything else, functions included, compares with `Object.is`.
 */
export function isEqual(first: unknown, second: unknown): boolean {
    if (first && second && typeof first === "object" && typeof second === "object") {
        const keys = Object.keys(first);

        return (
            keys.length === Object.keys(second).length &&
            keys.every((key) => isEqual((first as NamedValues)[key], (second as NamedValues)[key]))
        );
    }

    return Object.is(first, second);
}
