/** A whole number with thousands separators, such as 12,000. */
export function formatCount(count: number): string {
    return Math.round(count).toLocaleString("en-US");
}

/** A duration in ms, such as 8.3 ms. */
export function formatMs(milliseconds: number, digits = 1): string {
    return `${milliseconds.toFixed(digits)} ms`;
}
