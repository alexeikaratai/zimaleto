import { useSnowfall } from "@zimaleto/zima-react";
import type { ReactElement } from "react";
import type { SnowViewProps } from "./snowViewProps";

/** `useSnowfall()` on a canvas the playground renders itself. */
export function CanvasSnow({ options, isPaused, canvasRef }: SnowViewProps): ReactElement {
    useSnowfall(canvasRef, { ...options, paused: isPaused });

    return (
        <canvas
            ref={canvasRef}
            className="snow-surface"
        />
    );
}
