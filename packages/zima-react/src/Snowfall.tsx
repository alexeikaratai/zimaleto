import { type ComponentProps, type CSSProperties, type ReactElement, useImperativeHandle, useRef } from "react";
import { type SnowfallOptions, useSnowfall } from "./useSnowfall";

/** Props for `<Snowfall>`: every core option, `paused`, `fullscreen`, and the attributes of a `<canvas>`. */
export type SnowfallProps = SnowfallOptions & {
    /**
     * Covers the viewport with a fixed canvas instead of filling the parent. Render it outside ancestors with a
     * `transform` or `filter`, which would make it cover them instead.
     */
    fullscreen?: boolean | undefined;
} & Omit<ComponentProps<"canvas">, keyof SnowfallOptions | "fullscreen" | "width" | "height" | "children">;

type PropValues = Record<string, unknown>;

// Props with these names configure the snowfall; every other prop goes to the canvas.
// The type fails the build when the core gains an option that isn't listed here.
const OPTION_NAMES: Record<keyof SnowfallOptions, true> = {
    count: true,
    density: true,
    size: true,
    speed: true,
    wind: true,
    gust: true,
    sway: true,
    rotation: true,
    opacity: true,
    color: true,
    shapes: true,
    parallax: true,
    fps: true,
    maxDpr: true,
    reducedMotion: true,
    pauseWhenHidden: true,
    seed: true,
    paused: true,
};

/**
 * A canvas with snow falling in it. By default it fills its parent, which needs a `position`
 * other than `static`; `fullscreen` covers the viewport instead. Clicks pass through either way.
 * Options compare by value, but custom shapes compare by identity, so create them once.
 *
 * @example
 * <Snowfall fullscreen count={200} wind={15} shapes={[crystal]} paused={isPaused} />
 */
export function Snowfall({ fullscreen, style, ref, ...props }: SnowfallProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const options: PropValues = {};
    const canvasProps: PropValues = {};

    for (const [name, value] of Object.entries(props)) {
        if (Object.hasOwn(OPTION_NAMES, name)) {
            options[name] = value;
        } else {
            canvasProps[name] = value;
        }
    }

    // A canvas is a replaced element, so inset alone wouldn't stretch it.
    const layout: CSSProperties = {
        position: fullscreen ? "fixed" : "absolute",
        zIndex: fullscreen ? 9999 : undefined,
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
    };

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);
    useSnowfall(canvasRef, options);

    return (
        <canvas
            aria-hidden
            {...canvasProps}
            ref={canvasRef}
            style={{ ...layout, ...style }}
        />
    );
}
