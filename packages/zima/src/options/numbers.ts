/** The value if it's a finite number, otherwise the fallback. */
export function finiteOr(value: number | undefined, fallback: number): number {
    return Number.isFinite(value) ? (value as number) : fallback;
}

/** The value if it's above zero, `Infinity` included, otherwise the fallback. */
export function positiveOr(value: number | undefined, fallback: number): number {
    return (value ?? 0) > 0 ? (value as number) : fallback;
}

/** The value if it's a finite number above zero, otherwise the fallback. */
export function finitePositiveOr(value: number | undefined, fallback: number): number {
    return Number.isFinite(value) && (value as number) > 0 ? (value as number) : fallback;
}

/** The value kept within `[floor, ceiling]`. */
export function clamp(value: number, floor: number, ceiling: number): number {
    return Math.min(Math.max(value, floor), ceiling);
}
