import { Snowfall } from "@zimaleto/zima-react";
import type { ReactElement } from "react";
import type { SnowViewProps } from "./snowViewProps";

/** `<Snowfall fullscreen>` over the whole page, above an empty surface that keeps the stage's layout. */
export function PageSnow({ options, isPaused, canvasRef }: SnowViewProps): ReactElement {
    return (
        <>
            <div className="snow-surface">
                <h2 className="snow-title">Let it snow</h2>
            </div>
            <Snowfall
                {...options}
                ref={canvasRef}
                fullscreen
                paused={isPaused}
            />
        </>
    );
}
