import { type ComponentProps, type CSSProperties, type ReactElement, useImperativeHandle, useRef } from "react";
import { type SnowfallOptions, useSnowfall } from "./useSnowfall";

/** Props for `<Snowfall>`: every core option, `paused`, `fullscreen`, and the attributes of a `<canvas>`. */
export type SnowfallProps = SnowfallOptions & {
    /** Covers the viewport with a fixed canvas instead of filling the parent. */
    fullscreen?: boolean;
} & Omit<ComponentProps<"canvas">, keyof SnowfallOptions | "fullscreen" | "width" | "height" | "children">;

// Props with these names configure the snowfall; every other prop goes to the canvas.
const OPTION_NAMES =
    "count density size speed wind gust sway rotation opacity color shapes parallax fps maxDpr reducedMotion pauseWhenHidden seed paused";
const OPTION_LIST = OPTION_NAMES.split(" ");

type Words<Text extends string> = Text extends `${infer Word} ${infer Rest}` ? Word | Words<Rest> : Text;
// Fails to compile when the core gains an option that the list above doesn't name.
type AssertNever<Value extends never> = Value;
type _EveryOptionIsListed = AssertNever<Exclude<keyof SnowfallOptions, Words<typeof OPTION_NAMES>>>;

/**
 * A canvas with snow falling in it. By default it fills its parent, which needs a `position`
 * other than `static`; `fullscreen` covers the viewport instead. Clicks pass through either way.
 *
 * @example
 * <Snowfall fullscreen count={200} wind={15} shapes={[crystal]} paused={!isWinter} />
 */
export function Snowfall({ fullscreen, style, ref, ...props }: SnowfallProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const options: Record<string, unknown> = {};
    const canvasProps: Record<string, unknown> = {};

    for (const [name, value] of Object.entries(props)) {
        (OPTION_LIST.includes(name) ? options : canvasProps)[name] = value;
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
