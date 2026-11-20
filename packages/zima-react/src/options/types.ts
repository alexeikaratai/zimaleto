import type { SnowOptions } from "@zimaleto/zima";

/** Options for `useSnowfall()`: every core option, plus `paused`. */
export type SnowfallOptions = SnowOptions & {
    /** Stops the snow while `true` and keeps its last frame on screen; it resumes when `false` again. Reduced motion still applies. */
    paused?: boolean | undefined;
};

/** Props or options by name, with values of any type. */
export type NamedValues = Record<string, unknown>;
