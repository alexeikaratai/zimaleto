import { type ComponentProps, type ReactElement, useImperativeHandle, useRef } from "react";
import { useSnowfall } from "../hooks";
import { type SnowfallOptions, splitProps } from "../options";
import { FILL_LAYOUT, FULLSCREEN_Z_INDEX } from "./constants";

/** Props for `<Snowfall>`: every core option, `paused`, `fullscreen`, and the attributes of a `<canvas>`. */
export type SnowfallProps = SnowfallOptions & {
    /**
     * Covers the viewport with a fixed canvas instead of filling the parent. Render it outside ancestors with a
     * `transform` or `filter`, which would make it cover them instead.
     */
    fullscreen?: boolean | undefined;
} & Omit<
        ComponentProps<"canvas">,
        keyof SnowfallOptions | "fullscreen" | "width" | "height" | "children" | "dangerouslySetInnerHTML"
    >;

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
    const [options, canvasProps] = splitProps(props);
    const position = fullscreen ? "fixed" : "absolute";
    const zIndex = fullscreen ? FULLSCREEN_Z_INDEX : undefined;

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);
    useSnowfall(canvasRef, options);

    return (
        <canvas
            aria-hidden
            {...canvasProps}
            ref={canvasRef}
            style={{ position, zIndex, ...FILL_LAYOUT, ...style }}
        />
    );
}
